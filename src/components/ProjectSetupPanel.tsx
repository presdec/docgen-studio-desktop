import { Badge, Checkbox, Group, NumberInput, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import type { StarterTemplateKind } from '../../shared/desktop';
import type { ProjectConfig } from '../../shared/desktop';
import type { GenerationOptions } from '../types/template';
import { FileField } from './FileField';

type Props = {
  activePicker: keyof ProjectConfig | null;
  generationOptions: GenerationOptions;
  onPickPath: (
    field: keyof Pick<
      ProjectConfig,
      'workbookPath' | 'contractTemplatePath' | 'emailTemplatePath' | 'outputFolderPath'
    >,
  ) => void;
  onSaveStarterTemplate: (kind: StarterTemplateKind) => void;
  project: ProjectConfig;
  setGenerationOption: (key: keyof GenerationOptions, value: boolean) => void;
  setProject: React.Dispatch<React.SetStateAction<ProjectConfig>>;
};

export function ProjectSetupPanel({
  activePicker,
  generationOptions,
  onPickPath,
  onSaveStarterTemplate,
  project,
  setGenerationOption,
  setProject,
}: Props) {
  const wantsDocumentOutput = generationOptions.generateDocx || generationOptions.generatePdf;
  const wantsEmailOutput = generationOptions.generateEmailDrafts;

  return (
    <Paper className="panel-card" p="lg" radius="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={3}>Project Setup</Title>
            <Text c="dimmed" size="sm">
              Connect the files you already use in daily work - Excel, Word, and output folder - in one guided setup.
            </Text>
          </div>
          <Badge color="teal" variant="light">Foundation</Badge>
        </Group>
        <Paper p="md" radius="md" withBorder>
          <Stack gap="sm">
            <Text fw={600}>What do you want to generate?</Text>
            <Text c="dimmed" size="sm">
              Pick one or more output types. The workflow will adapt automatically.
            </Text>
            <Group gap="xl">
              <Checkbox
                checked={generationOptions.generateDocx}
                label="Word files (.docx)"
                onChange={(event) =>
                  setGenerationOption('generateDocx', event.currentTarget.checked)
                }
              />
              <Checkbox
                checked={generationOptions.generatePdf}
                label="PDF files"
                onChange={(event) =>
                  setGenerationOption('generatePdf', event.currentTarget.checked)
                }
              />
              <Checkbox
                checked={generationOptions.generateEmailDrafts}
                label="Email drafts (.txt)"
                onChange={(event) =>
                  setGenerationOption('generateEmailDrafts', event.currentTarget.checked)
                }
              />
            </Group>
          </Stack>
        </Paper>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" verticalSpacing="lg">
          <FileField description="Choose the Excel file with the values you want to use." isBusy={activePicker === 'workbookPath'} label="Excel File" onBrowse={() => onPickPath('workbookPath')} onDownloadExample={() => onSaveStarterTemplate('excel')} placeholder="Select Excel file (.xlsx)" exampleTooltip="Download example Excel file" value={project.workbookPath} />
          {wantsDocumentOutput ? (
            <FileField description="Choose the Word template with placeholders like {{TITLE}} and {{AUTHOR}}." isBusy={activePicker === 'contractTemplatePath'} label="Word Template" onBrowse={() => onPickPath('contractTemplatePath')} onDownloadExample={() => onSaveStarterTemplate('word')} placeholder="Select Word template (.docx)" exampleTooltip="Download example Word template" value={project.contractTemplatePath} />
          ) : null}
          <FileField description="Choose where generated DOCX, PDF, drafts, and reports should be written." isBusy={activePicker === 'outputFolderPath'} label="Output Folder" onBrowse={() => onPickPath('outputFolderPath')} placeholder="Select output folder" value={project.outputFolderPath} />
          {wantsEmailOutput ? (
            <Stack gap="sm">
              <Checkbox
                checked={project.useOptionalEmailSource}
                label="Use an existing email template file"
                onChange={(event) =>
                  setProject((current) => ({
                    ...current,
                    useOptionalEmailSource: event.currentTarget.checked,
                  }))
                }
              />
              <Text c="dimmed" size="sm">
                Turn this on only if you want to load email text from a .txt file. Leave it off to build emails directly in the app.
              </Text>
              {project.useOptionalEmailSource ? (
                <FileField
                  description="Choose a text file used as the email template source."
                  isBusy={activePicker === 'emailTemplatePath'}
                  label="Email Template File"
                  onBrowse={() => onPickPath('emailTemplatePath')}
                  onDownloadExample={() => onSaveStarterTemplate('email')}
                  placeholder="Select template file (.txt)"
                  exampleTooltip="Download example email template"
                  value={project.emailTemplatePath}
                />
              ) : null}
            </Stack>
          ) : null}
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          <TextInput description="Sheet name to read from your workbook." label="Worksheet Name" onChange={(event) => setProject((current) => ({ ...current, worksheetName: event.currentTarget.value }))} value={project.worksheetName} />
          <NumberInput description="Row containing the column headers." label="Header Row" min={1} onChange={(value) => setProject((current) => ({ ...current, headerRow: Number(value) || 1 }))} value={project.headerRow} />
          <NumberInput description="First row containing actual data records." label="Data Start Row" min={1} onChange={(value) => setProject((current) => ({ ...current, dataStartRow: Number(value) || 1 }))} value={project.dataStartRow} />
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
