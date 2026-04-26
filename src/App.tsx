import { Alert, Badge, Box, Button, Card, Divider, Group, Progress, SegmentedControl, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { ContractMappingPanel } from './components/ContractMappingPanel';
import { EmailTemplateEditor } from './components/EmailTemplateEditor';
import { GenerationProgressPanel } from './components/GenerationProgressPanel';
import { GenerationSuccessPanel } from './components/GenerationSuccessPanel';
import { ProjectSetupPanel } from './components/ProjectSetupPanel';
import { ReviewSummaryPanel } from './components/ReviewSummaryPanel';
import { SetupSourcePreviewPanel } from './components/SetupSourcePreviewPanel';
import { StepList } from './components/StepList';
import { TemplatePreviewPanel } from './components/TemplatePreviewPanel';
import { WorkbookPreviewPanel } from './components/WorkbookPreviewPanel';
import { useWorkspaceController } from './features/workspace/useWorkspaceController';
import { useI18n } from './i18n';

export function App() {
  const desktopApp = globalThis.window.desktopApp;
  const { copy, language, setLanguage } = useI18n();

  if (!desktopApp) {
    return (
      <main className="app-shell">
        <Alert color="red" radius="lg" title={copy.app.desktopBridgeUnavailableTitle} variant="light">
          {copy.app.desktopBridgeUnavailableBody}
        </Alert>
      </main>
    );
  }

  const controller = useWorkspaceController(desktopApp);
  const currentStep = copy.steps[controller.activeStep];
  const selectedOutputs = [
    controller.contractSettings.generationOptions.generateDocx ? copy.outputLabels.word : null,
    controller.contractSettings.generationOptions.generatePdf ? copy.outputLabels.pdf : null,
    controller.contractSettings.generationOptions.generateEmailDrafts ? copy.outputLabels.email : null,
  ].filter(Boolean) as string[];
  const selectedOutputLabel = selectedOutputs.length > 0 ? selectedOutputs.join(' + ') : copy.outputLabels.none;

  return (
    <main className="app-shell">
      <div className="workspace">
        <Card className="sidebar-card" padding="xl" radius="xl">
          <Stack gap="xl">
            <Stack gap="xs">
              <Group justify="space-between">
                <Badge color="teal" variant="light">{copy.sidebar.desktopMvp}</Badge>
                <SegmentedControl
                  data={[
                    { label: 'EN', value: 'en' },
                    { label: 'EL', value: 'el' },
                  ]}
                  onChange={(value) => setLanguage(value as 'en' | 'el')}
                  size="xs"
                  value={language}
                />
              </Group>
              <Title order={2}>{copy.sidebar.title}</Title>
              <Text c="dimmed">
                {copy.sidebar.description}
              </Text>
            </Stack>

            <Box>
              <Group justify="space-between">
                <Text fw={600}>{copy.sidebar.workflowProgress}</Text>
                <Text c="dimmed" size="sm">
                  {copy.sidebar.stepOf(controller.currentStepIndex + 1, controller.visibleSteps.length)}
                </Text>
              </Group>
              <Progress
                color="teal"
                mt="sm"
                radius="xl"
                size="lg"
                value={((controller.currentStepIndex + 1) / controller.visibleSteps.length) * 100}
              />
            </Box>

            <StepList activeStep={controller.activeStep} visibleSteps={controller.visibleSteps} />
          </Stack>
        </Card>

        <Card className="content-card" padding="xl" radius="xl">
          <Stack gap="xl">
            <Group justify="space-between">
              <Stack gap={4}>
                <Text c="teal.8" fw={700} size="sm" tt="uppercase">
                  {language === 'el' ? `Βήμα ${controller.activeStep}` : `Step ${controller.activeStep}`}
                </Text>
                <Title order={1}>{currentStep.title}</Title>
                <Text c="dimmed">{currentStep.description}</Text>
              </Stack>
              <Button
                loading={controller.projectPersistence.isOpeningProject}
                onClick={() => void controller.handleOpenProject()}
                size="md"
                variant="default"
              >
                {copy.app.openRecentProject}
              </Button>
            </Group>

            {controller.workbookPreview.loadError ? (
              <Alert color="red" radius="lg" title={copy.app.couldNotLoadWorkbookPreview} variant="light">
                {controller.workbookPreview.loadError}
              </Alert>
            ) : null}

            {controller.generationError ? (
              <Alert color="red" radius="lg" title={copy.app.generationFailedTitle} variant="light">
                {controller.generationError}
              </Alert>
            ) : null}

            {controller.templateActionError ? (
              <Alert color="red" radius="lg" title={copy.app.couldNotSaveExampleTemplate} variant="light">
                {controller.templateActionError}
              </Alert>
            ) : null}

            {controller.generationResult ? (
              <Alert color="teal" radius="lg" title={copy.app.generationCompleteTitle} variant="light">
                {copy.app.generationCompleteSummary(
                  controller.generationResult.generatedCount,
                  controller.generationResult.skippedCount,
                )}
              </Alert>
            ) : null}

            {controller.generationInfo ? (
              <Alert color="blue" radius="lg" title={copy.app.generationStatusTitle} variant="light">
                {controller.generationInfo}
              </Alert>
            ) : null}

            {controller.activeStep === 3 && !controller.canContinueFromStep3 ? (
              <Alert color="red" radius="lg" title={copy.app.mapAllFieldsTitle} variant="light">
                {controller.unmappedContractTokens.length > 0
                  ? copy.app.missingWordMappings(controller.unmappedContractTokens.join(', '))
                  : ''}
                {controller.contractSettings.generationOptions.generateEmailDrafts
                  && controller.unmappedEmailVariables.length > 0
                  ? copy.app.missingEmailMappings(controller.unmappedEmailVariables.join(', '))
                  : ''}
              </Alert>
            ) : null}

            {controller.isGenerating ? (
              <GenerationProgressPanel
                elapsedSeconds={controller.generationElapsedSeconds}
                fallbackRowsFound={controller.workbookPreview.totalRows}
                generationOptions={controller.contractSettings.generationOptions}
                progress={controller.generationProgress}
                progressValue={controller.generationProgressValue}
                selectedOutputLabel={selectedOutputLabel}
                stage={controller.generationStage}
              />
            ) : null}

            {controller.activeStep === 1 ? (
              <Stack gap="xl">
                <ProjectSetupPanel
                  activePicker={controller.projectSetup.activePicker}
                  generationOptions={controller.contractSettings.generationOptions}
                  onPickPath={controller.handlePickPath}
                  onSaveStarterTemplate={(kind) => void controller.handleSaveStarterTemplate(kind)}
                  project={controller.projectSetup.project}
                  setGenerationOption={controller.contractSettings.setGenerationOption}
                  setProject={controller.projectSetup.setProject}
                />
                <SetupSourcePreviewPanel
                  contractVariables={controller.workbookPreview.contractVariables}
                  hasWordTemplate={Boolean(controller.projectSetup.project.contractTemplatePath)}
                  isLoading={controller.workbookPreview.isLoading}
                  loadError={controller.workbookPreview.loadError}
                  sampleRows={controller.workbookPreview.sampleRows}
                  showWordPreview={controller.contractSettings.generationOptions.generateDocx || controller.contractSettings.generationOptions.generatePdf}
                />
              </Stack>
            ) : null}

            {controller.activeStep === 2 ? (
              <ContractMappingPanel
                availableVariables={controller.workbookPreview.availableVariables}
                contractTemplatePath={controller.projectSetup.project.contractTemplatePath}
                isOpeningTemplate={controller.isOpeningTemplate}
                isReloadingTemplate={
                  controller.isReloadingTemplate || controller.workbookPreview.isLoading
                }
                mappedContractFields={controller.contractSettings.mappedContractFields}
                onOpenTemplate={() => void controller.handleOpenContractTemplate()}
                onReloadTemplate={() => void controller.handleReloadTemplateFields()}
                outputFilenamePattern={controller.projectSetup.project.outputFilenamePattern}
                setTokenMapping={controller.contractSettings.setTokenMapping}
                setOutputFilenamePattern={(value) =>
                  controller.projectSetup.setProject((current) => ({
                    ...current,
                    outputFilenamePattern: value,
                  }))}
                templateStatus={controller.workbookPreview.templateStatus}
                tokenContexts={controller.workbookPreview.contractTokenContexts}
                tokenMappings={controller.contractSettings.tokenMappings}
                tokens={controller.workbookPreview.contractVariables}
                variableSources={controller.contractSettings.variableSources}
              />
            ) : null}

            {controller.activeStep === 3 ? (
              <Stack gap="xl">
                <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xl" verticalSpacing="xl">
                  <EmailTemplateEditor
                    activeEditor={controller.templateBuilder.activeEditor}
                    availableVariables={controller.workbookPreview.availableVariables}
                    editorRefs={controller.templateBuilder.editorRefs}
                    emailTemplate={controller.templateBuilder.emailTemplate}
                    insertFieldToken={controller.templateBuilder.insertFieldToken}
                    setActiveEditor={controller.templateBuilder.setActiveEditor}
                    updateEmailField={controller.templateBuilder.updateEmailField}
                  />
                  <TemplatePreviewPanel
                    emailTemplate={controller.templateBuilder.emailTemplate}
                    sampleValues={controller.workbookPreview.sampleValues}
                  />
                </SimpleGrid>
                <WorkbookPreviewPanel
                  availableVariables={controller.workbookPreview.availableVariables}
                  isLoading={controller.workbookPreview.isLoading}
                  loadError={controller.workbookPreview.loadError}
                  onAssignmentChange={controller.workbookPreview.setFieldAssignment}
                  rows={controller.workbookPreview.rows}
                />
              </Stack>
            ) : null}

            {controller.activeStep === 4 ? (
              controller.generationResult ? (
                <GenerationSuccessPanel
                  isOpeningPath={controller.isOpeningPath}
                  onOpenPath={(targetPath) => void controller.handleOpenPath(targetPath)}
                  onStartAgain={controller.handleStartAgain}
                  result={controller.generationResult}
                />
              ) : (
                <ReviewSummaryPanel
                  generationOptions={controller.contractSettings.generationOptions}
                  mappedContractFields={controller.contractSettings.mappedContractFields}
                  emailTemplate={controller.templateBuilder.emailTemplate}
                  onGoToStep={controller.setActiveStep}
                  preflight={controller.preflight.result}
                  preflightLoading={controller.preflight.isLoading}
                  rows={controller.workbookPreview.rows}
                  totalContractFields={controller.workbookPreview.contractVariables.length}
                  totalRows={controller.workbookPreview.totalRows}
                />
              )
            ) : null}

            <Divider />

            <Group justify="space-between">
              <Stack gap={2}>
                <Text c="dimmed">{copy.steps[controller.activeStep].nextHint}</Text>
                {controller.projectPersistence.lastProjectPath ? (
                  <Text c="dimmed" size="sm">
                    {copy.app.projectFileLabel}: {controller.projectPersistence.lastProjectPath}
                  </Text>
                ) : null}
              </Stack>
              <Group>
                {controller.activeStep > 1 ? (
                  <Button
                    onClick={() => {
                      if (controller.previousStep) {
                        controller.setActiveStep(controller.previousStep);
                      }
                    }}
                    size="md"
                    variant="default"
                  >
                    {copy.app.back}
                  </Button>
                ) : null}
                <Button
                  loading={controller.projectPersistence.isSavingProject}
                  onClick={() => void controller.handleSaveProject()}
                  size="md"
                  variant="default"
                >
                  {copy.app.saveDraftSetup}
                </Button>
                {controller.nextStep ? (
                  <Button
                    disabled={controller.activeStep === 3 && !controller.canContinueFromStep3}
                    onClick={() => {
                      if (controller.nextStep) {
                        controller.setActiveStep(controller.nextStep);
                      }
                    }}
                    size="md"
                  >
                    {copy.app.continueTo} {copy.steps[controller.nextStep].title}
                  </Button>
                ) : (
                  <Button
                    disabled={!controller.canGenerateNow}
                    loading={controller.isGenerating || controller.preflight.isLoading}
                    onClick={() => void controller.handleGenerateProject()}
                    size="md"
                  >
                    {controller.isGenerating ? copy.app.generating : copy.app.generatingNow}
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
