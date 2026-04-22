import { useAtom } from 'jotai/react';
import { useCallback, useEffect, useMemo } from 'react';
import type { GenerationOptions, WorkbookPreviewRow } from '../types/template';
import { generationOptionsAtom, tokenMappingsAtom } from '../state/workspace';

export function useContractTemplateSettings(
  contractVariables: string[],
  availableVariables: string[],
  rows: WorkbookPreviewRow[],
) {
  const [generationOptions, setGenerationOptions] = useAtom(generationOptionsAtom);
  const [tokenMappings, setTokenMappings] = useAtom(tokenMappingsAtom);

  useEffect(() => {
    setTokenMappings((current) => {
      const next = { ...current };
      let hasChanges = false;

      for (const token of contractVariables) {
        if (next[token]) {
          continue;
        }

        next[token] = availableVariables.includes(token) ? token : '';
        hasChanges = true;
      }

      return hasChanges ? next : current;
    });
  }, [availableVariables, contractVariables]);

  const variableSources = useMemo(
    () =>
      rows.reduce<Record<string, WorkbookPreviewRow>>((accumulator, row) => {
        if (row.selectedVariable) {
          accumulator[row.selectedVariable] = row;
        }
        return accumulator;
      }, {}),
    [rows],
  );

  const mappedContractFields = useMemo(
    () => contractVariables.filter((token) => tokenMappings[token]).length,
    [contractVariables, tokenMappings],
  );

  const setGenerationOption = useCallback((key: keyof GenerationOptions, value: boolean) =>
    setGenerationOptions((current) => {
      if (current[key] === value) {
        return current;
      }

      const next = { ...current, [key]: value };
      if (!next.generateDocx && !next.generatePdf && !next.generateEmailDrafts) {
        next.generateEmailDrafts = true;
      }
      return next;
    }), []);

  const setTokenMapping = useCallback((token: string, variable: string | null) =>
    setTokenMappings((current) => {
      const nextValue = variable ?? '';

      if (current[token] === nextValue) {
        return current;
      }

      return {
        ...current,
        [token]: nextValue,
      };
    }), []);

  return {
    generationOptions,
    mappedContractFields,
    setGenerationOption,
    setTokenMapping,
    tokenMappings,
    variableSources,
  };
}
