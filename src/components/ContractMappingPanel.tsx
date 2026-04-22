import { useMemo, useState } from 'react';
import { Alert, Badge, Button, Group, Modal, Paper, Select, Stack, Table, Text, Title } from '@mantine/core';
import type { TemplateStatusResult } from '../../shared/desktop';
import type { WorkbookPreviewRow } from '../types/template';

type Props = {
  availableVariables: string[];
  contractTemplatePath: string;
  isOpeningTemplate?: boolean;
  isReloadingTemplate?: boolean;
  mappedContractFields: number;
  onOpenTemplate: () => void;
  onReloadTemplate: () => void;
  setTokenMapping: (token: string, variable: string | null) => void;
  templateStatus: TemplateStatusResult | null;
  tokenContexts: Record<string, string>;
  tokenMappings: Record<string, string>;
  tokens: string[];
  variableSources: Record<string, WorkbookPreviewRow>;
};

export function ContractMappingPanel({
  availableVariables,
  contractTemplatePath,
  isOpeningTemplate = false,
  isReloadingTemplate = false,
  mappedContractFields,
  onOpenTemplate,
  onReloadTemplate,
  setTokenMapping,
  templateStatus,
  tokenContexts,
  tokenMappings,
  tokens,
  variableSources,
}: Props) {
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  const previewContent = useMemo(() => {
    if (!previewToken) {
      return null;
    }

    const mappedVariable = tokenMappings[previewToken] ?? '';
    const sampleValue = mappedVariable ? variableSources[mappedVariable]?.sampleValue ?? '' : '';
    const paragraph = tokenContexts[previewToken] ?? '';

    if (!paragraph) {
      return null;
    }

    return {
      paragraph,
      renderedParagraph: sampleValue
        ? paragraph.replaceAll(`{{${previewToken}}}`, sampleValue)
        : paragraph,
      sampleValue,
      token: previewToken,
    };
  }, [previewToken, tokenContexts, tokenMappings, variableSources]);

  const templateStatusText = useMemo(() => {
    if (!contractTemplatePath) {
      return 'Choose a Word template in Project Setup before mapping fields.';
    }

    if (!templateStatus?.exists) {
      return 'The selected Word template could not be found on disk.';
    }

    if (templateStatus.isLocked) {
      return 'The template still looks open in Word. Save your changes, close Word, then reload fields.';
    }

    if (templateStatus.lastModifiedMs) {
      return `Last saved change detected at ${new Date(templateStatus.lastModifiedMs).toLocaleTimeString()}. Reload fields after saving if you added or renamed placeholders.`;
    }

    return 'Open the Word template, save your edits, then reload fields to pull in new placeholders.';
  }, [contractTemplatePath, templateStatus]);

  return (
    <Stack gap="xl">
      <Modal
        centered
        onClose={() => setPreviewToken(null)}
        opened={Boolean(previewToken)}
        size="lg"
        title="Template paragraph preview"
      >
        <Stack gap="md">
          {previewContent ? (
            <>
              <Text c="dimmed" size="sm">
                Token <code>{`{{${previewContent.token}}}`}</code>
                {previewContent.sampleValue
                  ? ` with sample value "${previewContent.sampleValue}"`
                  : ' (no mapped sample value yet)'}
              </Text>
              <Paper p="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Text fw={600} size="sm">Original paragraph</Text>
                  <Text size="sm">{previewContent.paragraph}</Text>
                </Stack>
              </Paper>
              <Paper p="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Text fw={600} size="sm">Rendered with sample value</Text>
                  <Text size="sm">{previewContent.renderedParagraph}</Text>
                </Stack>
              </Paper>
            </>
          ) : (
            <Alert color="yellow" title="No paragraph context found" variant="light">
              This token was found in the Word file, but the app could not extract a paragraph around it.
            </Alert>
          )}
        </Stack>
      </Modal>

      <Paper className="panel-card" p="lg" radius="lg">
        <Stack gap="lg">
          <Group justify="space-between">
            <div>
              <Title order={3}>Word Field Mapping</Title>
              <Text c="dimmed" size="sm">
                Connect each Word placeholder to an Excel column so document generation stays accurate.
              </Text>
            </div>
            <Group gap="sm">
              <Badge color="grape" variant="light">
                {mappedContractFields} / {tokens.length} mapped
              </Badge>
              <Button
                disabled={!contractTemplatePath}
                loading={isOpeningTemplate}
                onClick={onOpenTemplate}
                size="xs"
                variant="default"
              >
                Open template
              </Button>
              <Button
                disabled={!contractTemplatePath}
                loading={isReloadingTemplate}
                onClick={onReloadTemplate}
                size="xs"
                variant="light"
              >
                Reload fields
              </Button>
            </Group>
          </Group>

          <Alert color={templateStatus?.isLocked ? 'yellow' : 'blue'} radius="lg" title="Template editing flow" variant="light">
            {templateStatusText}
          </Alert>

          {!tokens.length ? (
            <Alert color="yellow" radius="lg" title="No Word placeholders found" variant="light">
              The app can only map fields that already exist in the template. Open the Word file,
              decide where values should be inserted, and add placeholders in double braces such as
              <code>{'{{AUTHOR}}'}</code>, <code>{'{{TITLE}}'}</code>, or <code>{'{{APPLICATION_CODE}}'}</code>.
              After saving the template, reload fields here. If you picked the wrong file, you can replace it in Project Setup.
            </Alert>
          ) : null}

          <Alert color="teal" radius="lg" title="Need more placeholders?" variant="light">
            Add markers like <code>{'{{AUTHOR}}'}</code>, <code>{'{{TITLE}}'}</code>, or <code>{'{{APPLICATION_CODE}}'}</code>
            directly in the Word file wherever values should be injected. Save the template, close Word if needed,
            then use Reload fields.
          </Alert>

          <Table highlightOnHover striped withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Word field</Table.Th>
                <Table.Th>Workbook variable</Table.Th>
                <Table.Th>Source column</Table.Th>
                <Table.Th>Sample value</Table.Th>
                <Table.Th>Context</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tokens.map((token) => {
                const variable = tokenMappings[token] ?? '';
                const source = variableSources[variable];

                return (
                  <Table.Tr key={token}>
                    <Table.Td>{token}</Table.Td>
                    <Table.Td>
                      <Select
                        data={availableVariables}
                        onChange={(value) => setTokenMapping(token, value)}
                        placeholder="Choose variable"
                        searchable
                        value={variable || null}
                      />
                    </Table.Td>
                    <Table.Td>{source?.columnLetter ?? '-'}</Table.Td>
                    <Table.Td>{source?.sampleValue || '-'}</Table.Td>
                    <Table.Td>
                      <Button
                        disabled={!tokenContexts[token]}
                        onClick={() => setPreviewToken(token)}
                        size="xs"
                        variant="light"
                      >
                        Show paragraph
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
}
