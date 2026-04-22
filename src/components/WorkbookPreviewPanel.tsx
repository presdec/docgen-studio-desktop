import { Alert, Badge, Group, Paper, ScrollArea, Select, Stack, Table, Text, Title } from '@mantine/core';
import type { WorkbookPreviewRow } from '../types/template';

type Props = {
  availableVariables: string[];
  isLoading: boolean;
  loadError: string | null;
  onAssignmentChange: (columnLetter: string, value: string | null) => void;
  rows: WorkbookPreviewRow[];
};

export function WorkbookPreviewPanel({
  availableVariables,
  isLoading,
  loadError,
  onAssignmentChange,
  rows,
}: Props) {
  return (
    <Paper className="panel-card" p="lg" radius="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={3}>Workbook Mapping Preview</Title>
            <Text c="dimmed" size="sm">
              Review workbook columns, sample values, and field assignments used by Word and email templates.
            </Text>
          </div>
          <Badge color="cyan" variant="light">{rows.length} columns</Badge>
        </Group>

        {loadError ? (
          <Alert color="red" radius="lg" title="Preview unavailable" variant="light">
            {loadError}
          </Alert>
        ) : null}

        <ScrollArea>
          <Table highlightOnHover striped withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Column</Table.Th>
                <Table.Th>Header</Table.Th>
                <Table.Th>First row value</Table.Th>
                <Table.Th>Selected variable</Table.Th>
                <Table.Th>Used by</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr key={row.columnLetter}>
                  <Table.Td>{row.columnLetter}</Table.Td>
                  <Table.Td>{row.header}</Table.Td>
                  <Table.Td>{row.sampleValue || '—'}</Table.Td>
                  <Table.Td>
                    <Select
                      data={availableVariables}
                      onChange={(value) => onAssignmentChange(row.columnLetter, value)}
                      placeholder="Choose variable"
                      searchable
                      value={row.selectedVariable || null}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Badge color={row.usedBy === 'both' ? 'teal' : row.usedBy === 'email' ? 'blue' : row.usedBy === 'contract' ? 'grape' : 'gray'} variant="light">
                      {row.usedBy}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {isLoading ? (
          <Text c="dimmed" size="sm">
            Refreshing workbook mapping preview...
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
}
