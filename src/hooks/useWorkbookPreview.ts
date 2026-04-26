import { useAtom } from 'jotai/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { WorkbookPreviewSampleRow } from '../../shared/desktop';
import type { TemplateStatusResult } from '../../shared/desktop';
import { canonicalVariables } from '../data/defaults';
import { usageForVariable } from '../lib/template';
import { variableColumnsAtom } from '../state/workspace';
import type { WorkbookPreviewRow } from '../types/template';
import type { ProjectConfig } from '../../shared/desktop';

export function useWorkbookPreview(
  desktopApp: Window['desktopApp'],
  project: ProjectConfig,
  emailVariables: string[],
  filenameVariables: string[],
) {
  const [contractTokenContexts, setContractTokenContexts] = useState<Record<string, string>>({});
  const [contractVariables, setContractVariables] = useState<string[]>([]);
  const [fieldAssignments, setFieldAssignments] = useAtom(variableColumnsAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rawColumns, setRawColumns] = useState<
    Array<{ columnLetter: string; header: string; sampleValue: string; suggestedVariable: string | null }>
  >([]);
  const [sampleRows, setSampleRows] = useState<WorkbookPreviewSampleRow[]>([]);
  const [templateStatus, setTemplateStatus] = useState<TemplateStatusResult | null>(null);
  const [totalRows, setTotalRows] = useState(0);
  const [refreshTick, setRefreshTick] = useState(0);
  const previewRequestId = useRef(0);

  const refreshPreview = useCallback(() => {
    setRefreshTick((current) => current + 1);
  }, []);

  const clearPreview = useCallback(() => {
    setContractTokenContexts({});
    setContractVariables([]);
    setLoadError(null);
    setRawColumns([]);
    setSampleRows([]);
    setTemplateStatus(null);
    setTotalRows(0);
  }, []);

  const loadTemplateStatus = useCallback(async () => {
    if (!project.contractTemplatePath) {
      setTemplateStatus(null);
      return;
    }

    const result = await desktopApp.getTemplateStatus({
      templatePath: project.contractTemplatePath,
    });
    setTemplateStatus(result);
  }, [desktopApp, project.contractTemplatePath]);

  const loadPreview = useCallback(async () => {
    const requestId = previewRequestId.current + 1;
    previewRequestId.current = requestId;

    if (!project.workbookPath || !project.worksheetName) {
      clearPreview();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const result = await desktopApp.inspectProject({
        contractTemplatePath: project.contractTemplatePath,
        dataStartRow: project.dataStartRow,
        headerRow: project.headerRow,
        workbookPath: project.workbookPath,
        worksheetName: project.worksheetName,
      });

      if (previewRequestId.current !== requestId) {
        return;
      }

      setRawColumns(result.columns);
      setContractTokenContexts(result.contractTokenContexts ?? {});
      setContractVariables(result.contractTokens);
      setSampleRows(result.sampleRows);
      setTotalRows(result.totalRows);
      await loadTemplateStatus();
    } catch (error) {
      if (previewRequestId.current === requestId) {
        setLoadError(error instanceof Error ? error.message : 'Could not inspect workbook.');
      }
    } finally {
      if (previewRequestId.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [
    desktopApp,
    clearPreview,
    loadTemplateStatus,
    project.contractTemplatePath,
    project.dataStartRow,
    project.headerRow,
    project.workbookPath,
    project.worksheetName,
  ]);

  useEffect(() => {
    async function run() {
      await loadPreview();
    }

    void run();
  }, [loadPreview, refreshTick]);

  useEffect(() => {
    if (!project.contractTemplatePath) {
      return undefined;
    }

    void loadTemplateStatus();

    const interval = window.setInterval(() => {
      void loadTemplateStatus();
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadTemplateStatus, project.contractTemplatePath]);

  const availableVariables = useMemo(
    () =>
      Array.from(
        new Set([
          ...canonicalVariables,
          ...contractVariables,
          ...emailVariables,
          ...filenameVariables,
          ...rawColumns.map((column) => column.suggestedVariable).filter(Boolean),
        ]),
      ) as string[],
    [contractVariables, emailVariables, filenameVariables, rawColumns],
  );

  const contractAndFilenameVariables = useMemo(
    () => Array.from(new Set([...contractVariables, ...filenameVariables])),
    [contractVariables, filenameVariables],
  );

  useEffect(() => {
    setFieldAssignments((current) => {
      const nextAssignments = { ...current };
      let hasChanges = false;
      const usedVariables = new Set(
        Object.values(current).filter((value) => value),
      );

      for (const column of rawColumns) {
        if (nextAssignments[column.columnLetter]) {
          continue;
        }

        const suggestedVariable = column.suggestedVariable ?? '';

        if (!suggestedVariable || usedVariables.has(suggestedVariable)) {
          continue;
        }

        nextAssignments[column.columnLetter] = suggestedVariable;
        usedVariables.add(suggestedVariable);
        hasChanges = true;
      }

      return hasChanges ? nextAssignments : current;
    });
  }, [rawColumns, setFieldAssignments]);

  const rows: WorkbookPreviewRow[] = useMemo(
    () =>
      rawColumns.map((column) => {
        const selectedVariable = fieldAssignments[column.columnLetter] ?? '';
        return {
          ...column,
          selectedVariable,
          usedBy: usageForVariable(selectedVariable, emailVariables, contractAndFilenameVariables),
        };
      }),
    [contractAndFilenameVariables, emailVariables, fieldAssignments, rawColumns],
  );

  const sampleValues = useMemo(
    () =>
      rows.reduce<Record<string, string>>((accumulator, row) => {
        if (row.selectedVariable) {
          accumulator[row.selectedVariable] = row.sampleValue;
        }
        return accumulator;
      }, {}),
    [rows],
  );

  const setFieldAssignment = useCallback((columnLetter: string, variable: string | null) =>
    setFieldAssignments((current) => {
      const nextValue = variable ?? '';

      if (current[columnLetter] === nextValue) {
        return current;
      }

      const nextAssignments = {
        ...current,
        [columnLetter]: nextValue,
      };

      if (nextValue) {
        for (const [existingColumn, existingValue] of Object.entries(nextAssignments)) {
          if (existingColumn !== columnLetter && existingValue === nextValue) {
            nextAssignments[existingColumn] = '';
          }
        }
      }

      return nextAssignments;
    }), []);

  return {
    availableVariables,
    contractTokenContexts,
    contractVariables,
    isLoading,
    loadError,
    refreshPreview,
    rows,
    sampleRows,
    sampleValues,
    setFieldAssignment,
    templateStatus,
    totalRows,
  };
}
