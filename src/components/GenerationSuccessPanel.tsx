import { useMemo } from 'react';
import { Alert, Badge, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import type { GenerateProjectResult, OutputTreeEntry } from '../../shared/desktop';

type Props = {
  isOpeningPath: boolean;
  onOpenPath: (path: string) => void;
  onStartAgain: () => void;
  result: GenerateProjectResult;
};

export function GenerationSuccessPanel({
  isOpeningPath,
  onOpenPath,
  onStartAgain,
  result,
}: Props) {
  const combinedEmailPath = result.combinedEmailPath;
  const treeEntries = useMemo(() => {
    const filtered = result.createdEntries.filter((entry) => entry.relativePath !== '.');

    return filtered.map((entry) => ({
      ...entry,
      depth: Math.max(0, entry.relativePath.split(/[\\/]/).length - 1),
    }));
  }, [result.createdEntries]);

  const hasDelayedArtifacts = !treeEntries.some(
    (entry) =>
      entry.kind === 'file' &&
      (
        entry.relativePath.endsWith('email_drafts.txt') ||
        entry.relativePath.endsWith('generation_report.txt')
      ),
  );

  return (
    <Paper className="panel-card" p="lg" radius="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={3}>Generation Complete</Title>
            <Text c="dimmed" size="sm">
              Review created outputs and open files directly from this list.
            </Text>
          </div>
          <Badge color="teal" variant="light">
            {result.generatedCount} generated / {result.skippedCount} skipped
          </Badge>
        </Group>

        {hasDelayedArtifacts ? (
          <Alert color="yellow" title="Finishing up output files" variant="light">
            The generator writes `email_drafts.txt` and `generation_report.txt` near the end. If
            they are not listed yet, wait a few seconds and refresh by opening the output folder.
          </Alert>
        ) : null}

        <Group gap="sm">
          <Button onClick={() => onOpenPath(result.outputDir)} size="xs" variant="light">
            Open Output Folder
          </Button>
          <Button onClick={() => onOpenPath(result.reportPath)} size="xs" variant="light">
            Open Report
          </Button>
          {combinedEmailPath ? (
            <Button onClick={() => onOpenPath(combinedEmailPath)} size="xs" variant="light">
              Open Email Drafts
            </Button>
          ) : null}
          <Button loading={isOpeningPath} onClick={onStartAgain} size="xs" variant="default">
            Start Again
          </Button>
        </Group>

        <Paper p="md" radius="md" withBorder>
          <Stack gap={6}>
            <Text fw={600} size="sm">
              Created files
            </Text>
            {treeEntries.length === 0 ? (
              <Text c="dimmed" size="sm">
                No output files were found yet.
              </Text>
            ) : (
              treeEntries.map((entry: OutputTreeEntry & { depth: number }) => (
                <Group key={`${entry.kind}-${entry.relativePath}`} justify="space-between" wrap="nowrap">
                  <Text
                    size="sm"
                    style={{
                      marginLeft: `${entry.depth * 14}px`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    [{entry.kind === 'directory' ? 'DIR' : 'FILE'}] {entry.relativePath}
                  </Text>
                  <Button
                    onClick={() => onOpenPath(entry.absolutePath)}
                    size="compact-xs"
                    variant="subtle"
                  >
                    Open
                  </Button>
                </Group>
              ))
            )}
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );
}
