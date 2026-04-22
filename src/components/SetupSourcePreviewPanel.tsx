import { Alert, Badge, Group, Paper, ScrollArea, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import type { WorkbookPreviewSampleRow } from '../../shared/desktop';

type Props = {
  contractVariables: string[];
  isLoading: boolean;
  loadError: string | null;
  sampleRows: WorkbookPreviewSampleRow[];
};

export function SetupSourcePreviewPanel({
  contractVariables,
  isLoading,
  loadError,
  sampleRows,
}: Props) {
  const headers = Object.keys(sampleRows[0]?.values ?? {});

  return (
    <Paper className="panel-card" p="lg" radius="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={3}>Load Check</Title>
            <Text c="dimmed" size="sm">
              Confirm detected Word fields and sample Excel values before moving to mapping.
            </Text>
          </div>
          <Badge color="cyan" variant="light">
            Setup preview
          </Badge>
        </Group>

        {loadError ? (
          <Alert color="red" radius="lg" title="Preview unavailable" variant="light">
            {loadError}
          </Alert>
        ) : null}

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <Paper className="mini-stat" p="md" radius="lg">
            <Stack gap="sm">
              <Text c="dimmed" size="sm">
                Fields found in Word template
              </Text>
              <Group gap="xs">
                {contractVariables.slice(0, 10).map((token) => (
                  <Badge key={token} color="grape" variant="light">
                    {token}
                  </Badge>
                ))}
                {!contractVariables.length ? (
                  <Text size="sm">
                    No template placeholders were found. Add markers like{' '}
                    <code>{'{{AUTHOR}}'}</code> or <code>{'{{TITLE}}'}</code> inside the
                    DOCX anywhere you want Excel values to be injected. Then save the file and
                    either browse for the contract template again in Project Setup or re-open the
                    same file to refresh this list.
                  </Text>
                ) : null}
              </Group>
            </Stack>
          </Paper>

          <Paper className="mini-stat" p="md" radius="lg">
            <Stack gap="xs">
              <Text c="dimmed" size="sm">
                Workbook quick check
              </Text>
              <Text size="sm">
                Showing the first {sampleRows.length} data rows so you can verify sheet and row settings before generating at scale.
              </Text>
            </Stack>
          </Paper>
        </SimpleGrid>

        <ScrollArea>
          <Table highlightOnHover striped withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Row</Table.Th>
                {headers.map((header) => (
                  <Table.Th key={header}>{header}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sampleRows.map((row) => (
                <Table.Tr key={row.rowNumber}>
                  <Table.Td>{row.rowNumber}</Table.Td>
                  {headers.map((header) => (
                    <Table.Td key={`${row.rowNumber}-${header}`}>{row.values[header] || '—'}</Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {isLoading ? (
          <Text c="dimmed" size="sm">
            Refreshing source preview...
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
}
