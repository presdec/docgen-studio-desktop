import { Badge, Group, Paper, Stack, Text, Title } from '@mantine/core';
import type { EmailTemplateState, GenerationOptions, WorkbookPreviewRow } from '../types/template';

type Props = {
  generationOptions: GenerationOptions;
  mappedContractFields: number;
  totalContractFields: number;
  emailTemplate: EmailTemplateState;
  rows: WorkbookPreviewRow[];
};

export function ReviewSummaryPanel({
  generationOptions,
  mappedContractFields,
  totalContractFields,
  emailTemplate,
  rows,
}: Props) {
  const mappedRows = rows.filter((row) => row.selectedVariable);
  const outputLabel = [
    generationOptions.generateDocx ? 'Word (.docx)' : null,
    generationOptions.generatePdf ? 'PDF' : null,
    generationOptions.generateEmailDrafts ? 'Email drafts (.txt)' : null,
  ].filter(Boolean).join(' + ');

  return (
    <Paper className="panel-card" p="lg" radius="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={3}>Ready To Generate</Title>
            <Text c="dimmed" size="sm">
              Final review of template coverage, mapped fields, and output settings before generation.
            </Text>
          </div>
          <Badge color="teal" variant="light">
            Review
          </Badge>
        </Group>

        <Group gap="md">
          <Paper className="mini-stat" p="md" radius="lg">
            <Text c="dimmed" size="sm">Mapped workbook columns</Text>
            <Title order={2}>{mappedRows.length}</Title>
          </Paper>
          {generationOptions.generateDocx || generationOptions.generatePdf ? (
            <Paper className="mini-stat" p="md" radius="lg">
              <Text c="dimmed" size="sm">Mapped Word fields</Text>
              <Title order={2}>
                {mappedContractFields}/{totalContractFields}
              </Title>
            </Paper>
          ) : null}
          <Paper className="mini-stat" p="md" radius="lg">
            <Text c="dimmed" size="sm">Email body length</Text>
            <Title order={2}>{emailTemplate.body.length}</Title>
          </Paper>
        </Group>

        <Text size="sm">Selected output: {outputLabel || 'Nothing selected'}</Text>
      </Stack>
    </Paper>
  );
}
