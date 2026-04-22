import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai/react';
import { Alert, Badge, Box, Button, Card, Divider, Group, Paper, Progress, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { ContractMappingPanel } from './components/ContractMappingPanel';
import { EmailTemplateEditor } from './components/EmailTemplateEditor';
import { GenerationSuccessPanel } from './components/GenerationSuccessPanel';
import { ProjectSetupPanel } from './components/ProjectSetupPanel';
import { ReviewSummaryPanel } from './components/ReviewSummaryPanel';
import { SetupSourcePreviewPanel } from './components/SetupSourcePreviewPanel';
import { StepList } from './components/StepList';
import { TemplatePreviewPanel } from './components/TemplatePreviewPanel';
import { WorkbookPreviewPanel } from './components/WorkbookPreviewPanel';
import { useProjectPersistence } from './hooks/useProjectPersistence';
import { useEmailTemplateBuilder } from './hooks/useEmailTemplateBuilder';
import { useContractTemplateSettings } from './hooks/useContractTemplateSettings';
import { useProjectSetup } from './hooks/useProjectSetup';
import { useWorkbookPreview } from './hooks/useWorkbookPreview';
import { activeStepAtom } from './state/workspace';
import type { WizardStepId } from './types/template';
import type { GenerateProjectResult } from '../shared/desktop';
import type { StarterTemplateKind } from '../shared/desktop';

const stepCopy = {
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

const nextStepCopy = {
  1: 'Next step depends on your selected output types.',
  2: 'Next: finalize your email template with workbook field tokens.',
  3: 'Next: run a final check before generating at scale.',
  4: 'Tip: save this setup and reuse it for future batches.',
} as const;

export function App() {
  const desktopApp = globalThis.window.desktopApp;

  if (!desktopApp) {
    return (
      <main className="app-shell">
        <Alert color="red" radius="lg" title="Desktop bridge unavailable" variant="light">
          The Electron preload bridge did not load, so the desktop UI cannot access file dialogs yet.
        </Alert>
      </main>
    );
  }

  const projectSetup = useProjectSetup(desktopApp);
  const projectPersistence = useProjectPersistence(desktopApp);
  const templateBuilder = useEmailTemplateBuilder();
  const [activeStep, setActiveStep] = useAtom(activeStepAtom);
  const [generationElapsedSeconds, setGenerationElapsedSeconds] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationInfo, setGenerationInfo] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerateProjectResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpeningTemplate, setIsOpeningTemplate] = useState(false);
  const [isOpeningPath, setIsOpeningPath] = useState(false);
  const [isReloadingTemplate, setIsReloadingTemplate] = useState(false);
  const [templateActionError, setTemplateActionError] = useState<string | null>(null);
  const workbookPreview = useWorkbookPreview(
    desktopApp,
    projectSetup.project,
    templateBuilder.emailVariables,
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

  const handleSaveProject = useCallback(async () => {
    const savedPath = await projectPersistence.saveProject();
    return savedPath ? `Saved project to ${savedPath}.` : null;
  }, [projectPersistence]);

  const handleOpenProject = useCallback(async () => {
    const filePath = await projectPersistence.openProject();
    if (filePath) {
      setGenerationElapsedSeconds(0);
      setGenerationError(null);
      setGenerationInfo(`Loaded project from ${filePath}.`);
      setGenerationResult(null);
      setGenerationStage(null);
      setTemplateActionError(null);
    }
    return filePath ? `Loaded project from ${filePath}.` : null;
  }, [projectPersistence]);

  const handleSaveStarterTemplate = useCallback(async (kind: StarterTemplateKind) => {
    setTemplateActionError(null);

    try {
      await desktopApp.saveStarterTemplate({ kind });
    } catch (error) {
      setTemplateActionError(
        error instanceof Error ? error.message : 'Could not save example template.',
      );
    }
  }, [desktopApp]);

  const handleGenerateProject = useCallback(async () => {
    setIsGenerating(true);
    setGenerationElapsedSeconds(0);
    setGenerationError(null);
    setGenerationInfo(null);
    setGenerationResult(null);
    setGenerationStage('Preparing generation payload...');

    try {
      const variableColumns = workbookPreview.rows.reduce<Record<string, string>>((accumulator, row) => {
        if (row.selectedVariable) {
          accumulator[row.selectedVariable] = row.columnLetter;
        }
        return accumulator;
      }, {});

      setGenerationStage('Running Python generator...');

      const result = await desktopApp.generateProject({
        emailTemplate: templateBuilder.emailTemplate,
        generationOptions: contractSettings.generationOptions,
        project: projectSetup.project,
        tokenMappings: contractSettings.tokenMappings,
        variableColumns,
      });

      setGenerationStage('Finalizing output summary...');
      setGenerationResult(result);
      setGenerationInfo('Generation finished. Review files below and open anything directly.');
    } catch (error) {
      setGenerationResult(null);
      setGenerationError(error instanceof Error ? error.message : 'Generation failed.');
    } finally {
      setGenerationStage(null);
      setIsGenerating(false);
    }
  }, [
    contractSettings.generationOptions,
    contractSettings.tokenMappings,
    desktopApp,
    projectSetup.project,
    templateBuilder.emailTemplate,
    workbookPreview.rows,
  ]);

  const pickerRequests = useMemo(() => ({
    workbookPath: {
      defaultPath: projectSetup.project.workbookPath || undefined,
      filters: [{ extensions: ['xlsx', 'xlsm', 'xls'], name: 'Excel Workbooks' }],
      mode: 'file' as const,
      title: 'Select Workbook',
    },
    contractTemplatePath: {
      defaultPath: projectSetup.project.contractTemplatePath || undefined,
      filters: [{ extensions: ['docx'], name: 'Word Templates' }],
      mode: 'file' as const,
      title: 'Select Word Template',
    },
    emailTemplatePath: {
      defaultPath: projectSetup.project.emailTemplatePath || undefined,
      filters: [{ extensions: ['txt'], name: 'Text Templates' }],
      mode: 'file' as const,
      title: 'Select Email Template',
    },
    outputFolderPath: {
      defaultPath: projectSetup.project.outputFolderPath || undefined,
      mode: 'directory' as const,
      title: 'Select Output Folder',
    },
  }), [projectSetup.project]);

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
        error instanceof Error ? error.message : 'Could not reload template fields.',
      );
    } finally {
      setIsReloadingTemplate(false);
    }
  }, [workbookPreview]);

  const handleStartAgain = useCallback(() => {
    setActiveStep(1);
    setGenerationElapsedSeconds(0);
    setGenerationError(null);
    setGenerationInfo(null);
    setGenerationResult(null);
    setGenerationStage(null);
    setIsGenerating(false);
  }, [setActiveStep]);

  const currentStep = stepCopy[activeStep];
  const wantsDocumentOutput =
    contractSettings.generationOptions.generateDocx || contractSettings.generationOptions.generatePdf;
  const wantsEmailOutput = contractSettings.generationOptions.generateEmailDrafts;
  const visibleSteps = [
    1,
    ...(wantsDocumentOutput ? [2] : []),
    ...(wantsEmailOutput ? [3] : []),
    4,
  ] as WizardStepId[];
  const currentStepIndex = Math.max(0, visibleSteps.indexOf(activeStep));
  const nextStep = visibleSteps[currentStepIndex + 1] ?? null;
  const previousStep = visibleSteps[currentStepIndex - 1] ?? null;
  const nextStepHint = nextStepCopy[activeStep];

  useEffect(() => {
    if (!visibleSteps.includes(activeStep)) {
      const fallbackStep = visibleSteps[0];
      if (fallbackStep) {
        setActiveStep(fallbackStep);
      }
    }
  }, [activeStep, visibleSteps]);
  const generationProgressValue = Math.min(92, 18 + generationElapsedSeconds * 6);
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
    contractSettings.generationOptions.generateDocx ? 'Word (.docx)' : null,
    contractSettings.generationOptions.generatePdf ? 'PDF' : null,
    contractSettings.generationOptions.generateEmailDrafts ? 'Email drafts (.txt)' : null,
  ].filter(Boolean) as string[];
  const selectedOutputLabel = selectedOutputs.length > 0 ? selectedOutputs.join(' + ') : 'Nothing selected';

  return (
    <main className="app-shell">
      <div className="workspace">
        <Card className="sidebar-card" padding="xl" radius="xl">
          <Stack gap="xl">
            <Stack gap="xs">
              <Group justify="space-between">
                <Badge color="teal" variant="light">Desktop MVP</Badge>
                <Text c="dimmed" size="sm">{desktopApp.platform}</Text>
              </Group>
              <Title order={2}>Document Generation Workspace</Title>
              <Text c="dimmed">
                Use the tools you already know - Excel and Word - to generate hundreds or thousands of personalized documents and email drafts with less manual work.
              </Text>
            </Stack>

            <Box>
              <Group justify="space-between">
                <Text fw={600}>Workflow progress</Text>
                <Text c="dimmed" size="sm">Step {currentStepIndex + 1} of {visibleSteps.length}</Text>
              </Group>
              <Progress color="teal" mt="sm" radius="xl" size="lg" value={((currentStepIndex + 1) / visibleSteps.length) * 100} />
            </Box>

            <StepList activeStep={activeStep} visibleSteps={visibleSteps} />
          </Stack>
        </Card>

        <Card className="content-card" padding="xl" radius="xl">
          <Stack gap="xl">
            <Group justify="space-between">
              <Stack gap={4}>
                <Text c="teal.8" fw={700} size="sm" tt="uppercase">Step {activeStep}</Text>
                <Title order={1}>{currentStep.title}</Title>
                <Text c="dimmed">{currentStep.description}</Text>
              </Stack>
              <Button
                loading={projectPersistence.isOpeningProject}
                onClick={() => void handleOpenProject()}
                size="md"
                variant="default"
              >
                Open Recent Project
              </Button>
            </Group>

            {workbookPreview.loadError ? (
              <Alert color="red" radius="lg" title="Could not load workbook preview" variant="light">
                {workbookPreview.loadError}
              </Alert>
            ) : null}

            {generationError ? (
              <Alert color="red" radius="lg" title="Generation failed" variant="light">
                {generationError}
              </Alert>
            ) : null}

            {templateActionError ? (
              <Alert color="red" radius="lg" title="Could not save example template" variant="light">
                {templateActionError}
              </Alert>
            ) : null}

            {generationResult ? (
              <Alert color="teal" radius="lg" title="Generation complete" variant="light">
                Generated {generationResult.generatedCount} records and skipped {generationResult.skippedCount}. Open the report and output tree below to review results.
              </Alert>
            ) : null}

            {generationInfo ? (
              <Alert color="blue" radius="lg" title="Generation status" variant="light">
                {generationInfo}
              </Alert>
            ) : null}

            {activeStep === 3 && !canContinueFromStep3 ? (
              <Alert color="red" radius="lg" title="Map all fields before review" variant="light">
                {unmappedContractTokens.length > 0
                  ? `Word fields missing mapping: ${unmappedContractTokens.join(', ')}. `
                  : ''}
                {contractSettings.generationOptions.generateEmailDrafts && unmappedEmailVariables.length > 0
                  ? `Email fields missing workbook assignment: ${unmappedEmailVariables.join(', ')}.`
                  : ''}
              </Alert>
            ) : null}

            {isGenerating ? (
              <Paper className="panel-card" p="lg" radius="lg">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Title order={4}>Generation in progress</Title>
                    <Badge color="orange" variant="light">
                      {generationElapsedSeconds}s elapsed
                    </Badge>
                  </Group>
                  <Text c="dimmed" size="sm">
                    {generationStage ?? 'Running...'}
                  </Text>
                  <Progress animated color="orange" radius="xl" size="lg" value={generationProgressValue} />
                  <Group gap="xl">
                    <Text c="dimmed" size="sm">
                      Word mappings: {contractSettings.mappedContractFields}/{workbookPreview.contractVariables.length}
                    </Text>
                    <Text c="dimmed" size="sm">
                      Selected output: {selectedOutputLabel}
                    </Text>
                  </Group>
                </Stack>
              </Paper>
            ) : null}

            {activeStep === 1 ? (
              <Stack gap="xl">
                <ProjectSetupPanel
                  activePicker={projectSetup.activePicker}
                  generationOptions={contractSettings.generationOptions}
                  onPickPath={handlePickPath}
                  onSaveStarterTemplate={(kind) => void handleSaveStarterTemplate(kind)}
                  project={projectSetup.project}
                  setGenerationOption={contractSettings.setGenerationOption}
                  setProject={projectSetup.setProject}
                />
                <SetupSourcePreviewPanel
                  contractVariables={workbookPreview.contractVariables}
                  isLoading={workbookPreview.isLoading}
                  loadError={workbookPreview.loadError}
                  sampleRows={workbookPreview.sampleRows}
                />
              </Stack>
            ) : null}

            {activeStep === 2 ? (
              <ContractMappingPanel
                availableVariables={workbookPreview.availableVariables}
                contractTemplatePath={projectSetup.project.contractTemplatePath}
                isOpeningTemplate={isOpeningTemplate}
                isReloadingTemplate={isReloadingTemplate || workbookPreview.isLoading}
                mappedContractFields={contractSettings.mappedContractFields}
                onOpenTemplate={() => void handleOpenContractTemplate()}
                onReloadTemplate={() => void handleReloadTemplateFields()}
                setTokenMapping={contractSettings.setTokenMapping}
                templateStatus={workbookPreview.templateStatus}
                tokenContexts={workbookPreview.contractTokenContexts}
                tokenMappings={contractSettings.tokenMappings}
                tokens={workbookPreview.contractVariables}
                variableSources={contractSettings.variableSources}
              />
            ) : null}

            {activeStep === 3 ? (
              <Stack gap="xl">
                <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xl" verticalSpacing="xl">
                  <EmailTemplateEditor
                    activeEditor={templateBuilder.activeEditor}
                    availableVariables={workbookPreview.availableVariables}
                    editorRefs={templateBuilder.editorRefs}
                    emailTemplate={templateBuilder.emailTemplate}
                    insertFieldToken={(variable) => {
                      const token = templateBuilder.insertFieldToken(variable);
                      void token;
                    }}
                    setActiveEditor={templateBuilder.setActiveEditor}
                    updateEmailField={templateBuilder.updateEmailField}
                  />
                  <TemplatePreviewPanel
                    emailTemplate={templateBuilder.emailTemplate}
                    sampleValues={workbookPreview.sampleValues}
                  />
                </SimpleGrid>
                <WorkbookPreviewPanel
                  availableVariables={workbookPreview.availableVariables}
                  isLoading={workbookPreview.isLoading}
                  loadError={workbookPreview.loadError}
                  onAssignmentChange={workbookPreview.setFieldAssignment}
                  rows={workbookPreview.rows}
                />
              </Stack>
            ) : null}

            {activeStep === 4 ? (
              generationResult ? (
                <GenerationSuccessPanel
                  isOpeningPath={isOpeningPath}
                  onOpenPath={(targetPath) => void handleOpenPath(targetPath)}
                  onStartAgain={handleStartAgain}
                  result={generationResult}
                />
              ) : (
                <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xl" verticalSpacing="xl">
                  <TemplatePreviewPanel
                    emailTemplate={templateBuilder.emailTemplate}
                    sampleValues={workbookPreview.sampleValues}
                  />
                  <ReviewSummaryPanel
                    generationOptions={contractSettings.generationOptions}
                    mappedContractFields={contractSettings.mappedContractFields}
                    emailTemplate={templateBuilder.emailTemplate}
                    rows={workbookPreview.rows}
                    totalContractFields={workbookPreview.contractVariables.length}
                  />
                </SimpleGrid>
              )
            ) : null}

            <Divider />

            <Group justify="space-between">
              <Stack gap={2}>
                <Text c="dimmed">
                  {nextStepHint}
                </Text>
                {projectPersistence.lastProjectPath ? (
                  <Text c="dimmed" size="sm">
                    Project file: {projectPersistence.lastProjectPath}
                  </Text>
                ) : null}
              </Stack>
              <Group>
                {activeStep > 1 ? (
                  <Button
                    onClick={() => {
                      if (previousStep) {
                        setActiveStep(previousStep);
                      }
                    }}
                    size="md"
                    variant="default"
                  >
                    Back
                  </Button>
                ) : null}
                <Button
                  loading={projectPersistence.isSavingProject}
                  onClick={() => void handleSaveProject()}
                  size="md"
                  variant="default"
                >
                  Save Draft Setup
                </Button>
                {nextStep ? (
                  <Button
                    disabled={activeStep === 3 && !canContinueFromStep3}
                    onClick={() => setActiveStep(nextStep)}
                    size="md"
                  >
                    Continue To {stepCopy[nextStep].title}
                  </Button>
                ) : (
                  <Button loading={isGenerating} onClick={() => void handleGenerateProject()} size="md">
                    {isGenerating ? 'Generating...' : 'Generate Now'}
                  </Button>
                )}
              </Group>
            </Group>
          </Stack>
        </Card>
      </div>
    </main>
  );
}
