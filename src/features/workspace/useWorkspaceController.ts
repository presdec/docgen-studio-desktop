import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai/react';
import { activeStepAtom } from '../../state/workspace';
import { useProjectPersistence } from '../../hooks/useProjectPersistence';
import { useProjectPreflight } from '../../hooks/useProjectPreflight';
import { useEmailTemplateBuilder } from '../../hooks/useEmailTemplateBuilder';
import { useContractTemplateSettings } from '../../hooks/useContractTemplateSettings';
import { useProjectSetup } from '../../hooks/useProjectSetup';
import { useWorkbookPreview } from '../../hooks/useWorkbookPreview';
import { useI18n } from '../../i18n';
import { extractTokens, tokenName } from '../../lib/template';
import type { WizardStepId } from '../../types/template';
import type {
  GenerateProjectProgress,
  GenerateProjectResult,
  StarterTemplateKind,
} from '../../../shared/desktop';

export const stepCopy = {
  1: {
    description:
      'Choose your workbook, Word template, and output folder, then confirm everything loads correctly before generating.',
    title: 'Project Setup',
  },
  2: {
    description:
      'Map template fields to Excel columns and choose output type so every file is generated consistently.',
    title: 'Field Mapping',
  },
  3: {
    description:
      'Build or edit your email template with click-to-insert fields from your workbook.',
    title: 'Email Builder',
  },
  4: {
    description:
      'Review mappings and previews, then generate Word files, PDFs, and/or email drafts in one run.',
    title: 'Review And Generate',
  },
} as const;

export const nextStepCopy = {
  1: 'Next step depends on your selected output types.',
  2: 'Next: finalize your email template with workbook field tokens.',
  3: 'Next: run a final check before generating at scale.',
  4: 'Tip: save this setup and reuse it for future batches.',
} as const;

export function useWorkspaceController(desktopApp: Window['desktopApp']) {
  const { copy, language } = useI18n();
  const projectSetup = useProjectSetup(desktopApp);
  const projectPersistence = useProjectPersistence(desktopApp);
  const templateBuilder = useEmailTemplateBuilder();
  const [activeStep, setActiveStep] = useAtom(activeStepAtom);
  const [generationElapsedSeconds, setGenerationElapsedSeconds] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationInfo, setGenerationInfo] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<GenerateProjectProgress | null>(null);
  const [generationStage, setGenerationStage] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerateProjectResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpeningTemplate, setIsOpeningTemplate] = useState(false);
  const [isOpeningPath, setIsOpeningPath] = useState(false);
  const [isReloadingTemplate, setIsReloadingTemplate] = useState(false);
  const [templateActionError, setTemplateActionError] = useState<string | null>(null);
  const filenameVariables = useMemo(
    () =>
      Array.from(
        new Set(
          extractTokens(projectSetup.project.outputFilenamePattern)
            .map(tokenName)
            .filter((value) => value.trim().length > 0),
        ),
      ),
    [projectSetup.project.outputFilenamePattern],
  );
  const workbookPreview = useWorkbookPreview(
    desktopApp,
    projectSetup.project,
    templateBuilder.emailVariables,
    filenameVariables,
  );
  const contractSettings = useContractTemplateSettings(
    workbookPreview.contractVariables,
    workbookPreview.availableVariables,
    workbookPreview.rows,
  );

  useEffect(() => {
    if (!isGenerating) {
      return undefined;
    }

    const interval = setInterval(() => {
      setGenerationElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isGenerating]);

  useEffect(() => {
    return desktopApp.onGenerationProgress((progress) => {
      setGenerationProgress(progress);
      setGenerationStage(progress.message);
    });
  }, [desktopApp]);

  const pickerRequests = useMemo(
    () => ({
      workbookPath: {
        defaultPath: projectSetup.project.workbookPath || undefined,
        filters: [{ extensions: ['xlsx', 'xlsm', 'xls'], name: 'Excel Workbooks' }],
        mode: 'file' as const,
        title: language === 'el' ? 'Επιλέξτε Workbook' : 'Select Workbook',
      },
      contractTemplatePath: {
        defaultPath: projectSetup.project.contractTemplatePath || undefined,
        filters: [{ extensions: ['docx'], name: 'Word Templates' }],
        mode: 'file' as const,
        title: language === 'el' ? 'Επιλέξτε Πρότυπο Word' : 'Select Word Template',
      },
      emailTemplatePath: {
        defaultPath: projectSetup.project.emailTemplatePath || undefined,
        filters: [{ extensions: ['txt'], name: 'Text Templates' }],
        mode: 'file' as const,
        title: language === 'el' ? 'Επιλέξτε Πρότυπο Email' : 'Select Email Template',
      },
      outputFolderPath: {
        defaultPath: projectSetup.project.outputFolderPath || undefined,
        mode: 'directory' as const,
        title: language === 'el' ? 'Επιλέξτε Φάκελο Εξόδου' : 'Select Output Folder',
      },
    }),
    [language, projectSetup.project],
  );

  const variableColumns = useMemo(
    () =>
      workbookPreview.rows.reduce<Record<string, string>>((accumulator, row) => {
        if (row.selectedVariable) {
          accumulator[row.selectedVariable] = row.columnLetter;
        }
        return accumulator;
      }, {}),
    [workbookPreview.rows],
  );

  const generateRequest = useMemo(
    () => ({
      emailTemplate: templateBuilder.emailTemplate,
      generationOptions: contractSettings.generationOptions,
      project: projectSetup.project,
      tokenMappings: contractSettings.tokenMappings,
      variableColumns,
    }),
    [
      contractSettings.generationOptions,
      contractSettings.tokenMappings,
      projectSetup.project,
      templateBuilder.emailTemplate,
      variableColumns,
    ],
  );

  const preflight = useProjectPreflight(
    desktopApp,
    generateRequest,
    activeStep === 4 && !generationResult,
  );

  const handleSaveProject = useCallback(async () => {
    const savedPath = await projectPersistence.saveProject();
    return savedPath
      ? (language === 'el' ? `Το έργο αποθηκεύτηκε στο ${savedPath}.` : `Saved project to ${savedPath}.`)
      : null;
  }, [language, projectPersistence]);

  const handleOpenProject = useCallback(async () => {
    const filePath = await projectPersistence.openProject();
    if (filePath) {
      setGenerationElapsedSeconds(0);
      setGenerationError(null);
      setGenerationInfo(
        language === 'el' ? `Το έργο φορτώθηκε από ${filePath}.` : `Loaded project from ${filePath}.`,
      );
      setGenerationProgress(null);
      setGenerationResult(null);
      setGenerationStage(null);
      setTemplateActionError(null);
    }
    return filePath
      ? (language === 'el' ? `Το έργο φορτώθηκε από ${filePath}.` : `Loaded project from ${filePath}.`)
      : null;
  }, [language, projectPersistence]);

  const handleSaveStarterTemplate = useCallback(async (kind: StarterTemplateKind) => {
    setTemplateActionError(null);

    try {
      await desktopApp.saveStarterTemplate({ kind });
    } catch (error) {
      setTemplateActionError(
        error instanceof Error
          ? error.message
          : (language === 'el' ? 'Αδυναμία αποθήκευσης πρότυπου παραδείγματος.' : 'Could not save example template.'),
      );
    }
  }, [desktopApp, language]);

  const handleGenerateProject = useCallback(async () => {
    setIsGenerating(true);
    setGenerationElapsedSeconds(0);
    setGenerationError(null);
    setGenerationInfo(null);
    setGenerationProgress(null);
    setGenerationResult(null);
    setGenerationStage(language === 'el' ? 'Προετοιμασία δεδομένων δημιουργίας...' : 'Preparing generation payload...');

    try {
      setGenerationStage(language === 'el' ? 'Εκτέλεση generator Python...' : 'Running Python generator...');
      const result = await desktopApp.generateProject(generateRequest);
      setGenerationStage(language === 'el' ? 'Ολοκλήρωση σύνοψης εξόδου...' : 'Finalizing output summary...');
      setGenerationResult(result);
      setGenerationInfo(
        language === 'el'
          ? 'Η δημιουργία ολοκληρώθηκε. Ελέγξτε τα αρχεία παρακάτω και ανοίξτε ό,τι χρειάζεστε.'
          : 'Generation finished. Review files below and open anything directly.',
      );
    } catch (error) {
      setGenerationResult(null);
      setGenerationError(
        error instanceof Error
          ? error.message
          : (language === 'el' ? 'Η δημιουργία απέτυχε.' : 'Generation failed.'),
      );
    } finally {
      setGenerationStage(null);
      setIsGenerating(false);
    }
  }, [desktopApp, generateRequest, language]);

  const handlePickPath = useCallback((
    field: 'workbookPath' | 'contractTemplatePath' | 'emailTemplatePath' | 'outputFolderPath',
  ) => {
    void projectSetup.pickProjectPath(field, pickerRequests[field]);
  }, [pickerRequests, projectSetup]);

  const handleOpenPath = useCallback(async (targetPath: string) => {
    setIsOpeningPath(true);
    try {
      const openError = await desktopApp.openPath({ targetPath });
      if (openError) {
        setGenerationError(openError);
      }
    } finally {
      setIsOpeningPath(false);
    }
  }, [desktopApp]);

  const handleOpenContractTemplate = useCallback(async () => {
    if (!projectSetup.project.contractTemplatePath) {
      return;
    }

    setTemplateActionError(null);
    setIsOpeningTemplate(true);

    try {
      const openError = await desktopApp.openPath({
        targetPath: projectSetup.project.contractTemplatePath,
      });
      if (openError) {
        setTemplateActionError(openError);
      }
    } finally {
      setIsOpeningTemplate(false);
    }
  }, [desktopApp, projectSetup.project.contractTemplatePath]);

  const handleReloadTemplateFields = useCallback(async () => {
    setTemplateActionError(null);
    setIsReloadingTemplate(true);

    try {
      workbookPreview.refreshPreview();
    } catch (error) {
      setTemplateActionError(
        error instanceof Error
          ? error.message
          : (language === 'el' ? 'Αδυναμία επαναφόρτωσης πεδίων προτύπου.' : 'Could not reload template fields.'),
      );
    } finally {
      setIsReloadingTemplate(false);
    }
  }, [language, workbookPreview]);

  const handleStartAgain = useCallback(() => {
    setActiveStep(1);
    setGenerationElapsedSeconds(0);
    setGenerationError(null);
    setGenerationInfo(null);
    setGenerationProgress(null);
    setGenerationResult(null);
    setGenerationStage(null);
    setIsGenerating(false);
  }, [setActiveStep]);

  const wantsDocumentOutput =
    contractSettings.generationOptions.generateDocx || contractSettings.generationOptions.generatePdf;
  const wantsEmailOutput = contractSettings.generationOptions.generateEmailDrafts;
  const visibleSteps = [
    1,
    ...(wantsDocumentOutput ? [2] : []),
    ...(wantsEmailOutput ? [3] : []),
    4,
  ] as WizardStepId[];

  useEffect(() => {
    if (!visibleSteps.includes(activeStep)) {
      const fallbackStep = visibleSteps[0];
      if (fallbackStep) {
        setActiveStep(fallbackStep);
      }
    }
  }, [activeStep, setActiveStep, visibleSteps]);

  const currentStepIndex = Math.max(0, visibleSteps.indexOf(activeStep));
  const nextStep = visibleSteps[currentStepIndex + 1] ?? null;
  const previousStep = visibleSteps[currentStepIndex - 1] ?? null;
  const selectedWorkbookVariables = useMemo(
    () => new Set(workbookPreview.rows.filter((row) => row.selectedVariable).map((row) => row.selectedVariable)),
    [workbookPreview.rows],
  );
  const unmappedContractTokens = useMemo(
    () =>
      workbookPreview.contractVariables.filter((token) => {
        const mappedVariable = contractSettings.tokenMappings[token];
        return !mappedVariable || !selectedWorkbookVariables.has(mappedVariable);
      }),
    [contractSettings.tokenMappings, selectedWorkbookVariables, workbookPreview.contractVariables],
  );
  const unmappedEmailVariables = useMemo(
    () =>
      Array.from(new Set(templateBuilder.emailVariables)).filter(
        (variable) => !selectedWorkbookVariables.has(variable),
      ),
    [selectedWorkbookVariables, templateBuilder.emailVariables],
  );
  const canContinueFromStep3 =
    unmappedContractTokens.length === 0
    && (!contractSettings.generationOptions.generateEmailDrafts || unmappedEmailVariables.length === 0);
  const selectedOutputs = [
    contractSettings.generationOptions.generateDocx ? copy.outputLabels.word : null,
    contractSettings.generationOptions.generatePdf ? copy.outputLabels.pdf : null,
    contractSettings.generationOptions.generateEmailDrafts ? copy.outputLabels.email : null,
  ].filter(Boolean) as string[];
  const canGenerateNow =
    canContinueFromStep3
    && !preflight.isLoading
    && !isGenerating
    && (preflight.result?.canGenerate ?? false);

  return {
    activeStep,
    canContinueFromStep3,
    canGenerateNow,
    contractSettings,
    currentStep: copy.steps[activeStep],
    currentStepIndex,
    generationElapsedSeconds,
    generationError,
    generationInfo,
    generationProgress,
    generationProgressDetail: generationProgress && generationProgress.total > 0
      ? `${generationProgress.current}/${generationProgress.total}`
      : null,
    generationProgressValue: generationProgress?.percent ?? Math.min(92, 18 + generationElapsedSeconds * 6),
    generationResult,
    generationStage,
    handleGenerateProject,
    handleOpenContractTemplate,
    handleOpenPath,
    handleOpenProject,
    handlePickPath,
    handleReloadTemplateFields,
    handleSaveProject,
    handleSaveStarterTemplate,
    handleStartAgain,
    isGenerating,
    isOpeningPath,
    isOpeningTemplate,
    isReloadingTemplate,
    nextStep,
    nextStepHint: copy.steps[activeStep].nextHint,
    preflight,
    previousStep,
    projectPersistence,
    projectSetup,
    selectedOutputLabel: selectedOutputs.length > 0 ? selectedOutputs.join(' + ') : copy.outputLabels.none,
    setActiveStep,
    templateActionError,
    templateBuilder,
    unmappedContractTokens,
    unmappedEmailVariables,
    visibleSteps,
    workbookPreview,
  };
}
