import { Badge, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { renderTemplate } from '../lib/template';
import type { EmailTemplateState } from '../types/template';

type Props = {
  emailTemplate: EmailTemplateState;
  sampleValues: Record<string, string>;
};

export function TemplatePreviewPanel({ emailTemplate, sampleValues }: Props) {
  return (
    <Paper className="panel-card preview-card" p="lg" radius="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={3}>Sample Render Preview</Title>
            <Text c="dimmed" size="sm">
              Rendered using your sample row so you can validate templates before bulk generation.
            </Text>
          </div>
          <Badge color="teal" variant="light">Live Render</Badge>
        </Group>
        <Stack gap="sm">
          <div><Text c="dimmed" size="sm">Subject</Text><Text fw={600}>{renderTemplate(emailTemplate.subject, sampleValues)}</Text></div>
          <div><Text c="dimmed" size="sm">To</Text><Text>{renderTemplate(emailTemplate.to, sampleValues)}</Text></div>
          <div><Text c="dimmed" size="sm">Cc</Text><Text>{renderTemplate(emailTemplate.cc, sampleValues)}</Text></div>
          <Divider />
          <div className="preview-body">
            {renderTemplate(emailTemplate.body, sampleValues).split('\n').map((line, index) => (
              <Text key={`${line}-${index}`} mb={line ? 'sm' : 0}>
                {line || '\u00A0'}
              </Text>
            ))}
          </div>
        </Stack>
      </Stack>
    </Paper>
  );
}
