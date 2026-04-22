import { Badge, Button, Divider, Group, Paper, SimpleGrid, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import type { EditorField, EmailTemplateState } from '../types/template';

type Props = {
  activeEditor: EditorField;
  availableVariables: string[];
  editorRefs: {
    body: React.RefObject<HTMLTextAreaElement | null>;
    cc: React.RefObject<HTMLInputElement | null>;
    subject: React.RefObject<HTMLInputElement | null>;
    to: React.RefObject<HTMLInputElement | null>;
  };
  emailTemplate: EmailTemplateState;
  insertFieldToken: (variable: string) => void;
  setActiveEditor: (field: EditorField) => void;
  updateEmailField: (field: EditorField, value: string) => void;
};

export function EmailTemplateEditor({
  activeEditor,
  availableVariables,
  editorRefs,
  emailTemplate,
  insertFieldToken,
  setActiveEditor,
  updateEmailField,
}: Props) {
  return (
    <Paper className="panel-card" p="lg" radius="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={3}>Email Template Builder</Title>
            <Text c="dimmed" size="sm">
              Click any field token to insert it where your cursor is active.
            </Text>
          </div>
          <Badge color="orange" variant="light">
            Active target: {activeEditor}
          </Badge>
        </Group>

        <Group gap="sm">
          {availableVariables.map((variable) => (
            <Button key={variable} className="field-chip" onClick={() => insertFieldToken(variable)} radius="xl" size="xs" variant="light">
              {variable}
            </Button>
          ))}
        </Group>

        <Divider />

        <Stack gap="md">
          <TextInput description="Click here, then insert workbook fields from above." label="Subject" onChange={(event) => updateEmailField('subject', event.currentTarget.value)} onFocus={() => setActiveEditor('subject')} ref={editorRefs.subject} value={emailTemplate.subject} />
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <TextInput description="Primary recipient field." label="To" onChange={(event) => updateEmailField('to', event.currentTarget.value)} onFocus={() => setActiveEditor('to')} ref={editorRefs.to} value={emailTemplate.to} />
            <TextInput description="Optional copied recipients." label="Cc" onChange={(event) => updateEmailField('cc', event.currentTarget.value)} onFocus={() => setActiveEditor('cc')} ref={editorRefs.cc} value={emailTemplate.cc} />
          </SimpleGrid>
          <Textarea autosize description="Draft the email body here and insert workbook variables wherever they belong." label="Body" minRows={12} onChange={(event) => updateEmailField('body', event.currentTarget.value)} onFocus={() => setActiveEditor('body')} ref={editorRefs.body} value={emailTemplate.body} />
        </Stack>
      </Stack>
    </Paper>
  );
}
