import { memo, useMemo, useState } from 'react';
import { Alert, Badge, Button, Group, Modal, Paper, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import type { TemplateStatusResult } from '../../shared/desktop';
import type { WorkbookPreviewRow } from '../types/template';
import { useI18n } from '../i18n';

type Props = {
  availableVariables: string[];
  contractTemplatePath: string;
  isOpeningTemplate?: boolean;
  isReloadingTemplate?: boolean;
  mappedContractFields: number;
  onOpenTemplate: () => void;
  onReloadTemplate: () => void;
  outputFilenamePattern: string;
  setTokenMapping: (token: string, variable: string | null) => void;
  setOutputFilenamePattern: (value: string) => void;
  templateStatus: TemplateStatusResult | null;
  tokenContexts: Record<string, string>;
  tokenMappings: Record<string, string>;
  tokens: string[];
  variableSources: Record<string, WorkbookPreviewRow>;
};

function ContractMappingPanelComponent({
  availableVariables,
  contractTemplatePath,
  isOpeningTemplate = false,
  isReloadingTemplate = false,
  mappedContractFields,
  onOpenTemplate,
  onReloadTemplate,
  outputFilenamePattern,
  setTokenMapping,
  setOutputFilenamePattern,
  templateStatus,
  tokenContexts,
  tokenMappings,
  tokens,
  variableSources,
}: Props) {
  const { copy } = useI18n();
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
      return copy.contractMapping.statusNoTemplate;
    }

    if (!templateStatus?.exists) {
      return copy.contractMapping.statusTemplateMissing;
    }

    if (templateStatus.isLocked) {
      return copy.contractMapping.statusTemplateLocked;
    }

    if (templateStatus.lastModifiedMs) {
      return copy.contractMapping.statusTemplateEditedAt(
        new Date(templateStatus.lastModifiedMs).toLocaleTimeString(),
      );
    }

    return copy.contractMapping.statusTemplateHint;
  }, [contractTemplatePath, copy.contractMapping, templateStatus]);

  return (
    <Stack gap="xl">
      <Modal
        centered
        onClose={() => setPreviewToken(null)}
        opened={Boolean(previewToken)}
        size="lg"
        title={copy.contractMapping.paragraphPreviewTitle}
      >
        <Stack gap="md">
          {previewContent ? (
            <>
              <Text c="dimmed" size="sm">
                Token <code>{`{{${previewContent.token}}}`}</code>
                {previewContent.sampleValue
                  ? copy.contractMapping.tokenWithSample(previewContent.sampleValue)
                  : copy.contractMapping.tokenWithoutSample}
              </Text>
              <Paper p="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Text fw={600} size="sm">{copy.contractMapping.originalParagraph}</Text>
                  <Text size="sm">{previewContent.paragraph}</Text>
                </Stack>
              </Paper>
              <Paper p="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Text fw={600} size="sm">{copy.contractMapping.renderedParagraph}</Text>
                  <Text size="sm">{previewContent.renderedParagraph}</Text>
                </Stack>
              </Paper>
            </>
          ) : (
            <Alert color="yellow" title={copy.contractMapping.noContextTitle} variant="light">
              {copy.contractMapping.noContextBody}
            </Alert>
          )}
        </Stack>
      </Modal>

      <Paper className="panel-card" p="lg" radius="lg">
        <Stack gap="lg">
          <Group justify="space-between">
            <div>
              <Title order={3}>{copy.contractMapping.title}</Title>
              <Text c="dimmed" size="sm">
                {copy.contractMapping.subtitle}
              </Text>
            </div>
            <Group gap="sm">
              <Badge color="grape" variant="light">
                {copy.contractMapping.badgeMapped(mappedContractFields, tokens.length)}
              </Badge>
              <Button
                disabled={!contractTemplatePath}
                loading={isOpeningTemplate}
                onClick={onOpenTemplate}
                size="xs"
                variant="default"
              >
                {copy.contractMapping.openTemplate}
              </Button>
              <Button
                disabled={!contractTemplatePath}
                loading={isReloadingTemplate}
                onClick={onReloadTemplate}
                size="xs"
                variant="light"
              >
                {copy.contractMapping.reloadFields}
              </Button>
            </Group>
          </Group>

          <Alert color={templateStatus?.isLocked ? 'yellow' : 'blue'} radius="lg" title={copy.contractMapping.templateFlowTitle} variant="light">
            {templateStatusText}
          </Alert>

          <TextInput
            description={copy.projectSetup.outputFilenamePatternDesc}
            label={copy.projectSetup.outputFilenamePatternLabel}
            onChange={(event) => setOutputFilenamePattern(event.currentTarget.value)}
            placeholder={copy.projectSetup.outputFilenamePatternPlaceholder}
            value={outputFilenamePattern}
          />

          {!tokens.length ? (
            <Alert color="yellow" radius="lg" title={copy.contractMapping.noPlaceholdersTitle} variant="light">
              {copy.contractMapping.noPlaceholdersBody}
            </Alert>
          ) : null}

          <Alert color="teal" radius="lg" title={copy.contractMapping.needMorePlaceholdersTitle} variant="light">
            {copy.contractMapping.needMorePlaceholdersBody}
          </Alert>

          <Table highlightOnHover striped withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{copy.contractMapping.wordField}</Table.Th>
                <Table.Th>{copy.contractMapping.workbookVariable}</Table.Th>
                <Table.Th>{copy.contractMapping.sourceColumn}</Table.Th>
                <Table.Th>{copy.contractMapping.sampleValue}</Table.Th>
                <Table.Th>{copy.contractMapping.context}</Table.Th>
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
                        placeholder={copy.contractMapping.chooseVariable}
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
                        {copy.contractMapping.showParagraph}
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

export const ContractMappingPanel = memo(ContractMappingPanelComponent);
