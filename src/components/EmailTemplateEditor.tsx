import { useEffect } from 'react';
import { Badge, Button, Divider, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { EditorField, EmailTemplateState } from '../types/template';
import type { WorkflowValidationIssue } from '../features/workspace/workflowValidation';
import { useI18n } from '../i18n';
import { normalizeEmailBody } from '../lib/template';

const editorExtensions = [StarterKit];

function emailAddressError(value: string): boolean {
  if (!value.trim() || /\{\{[^}]+\}\}/.test(value)) {
    return false;
  }
  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

type Props = {
  activeEditor: EditorField;
  availableVariables: string[];
  editorRefs: {
    cc: React.RefObject<HTMLInputElement | null>;
    subject: React.RefObject<HTMLInputElement | null>;
    to: React.RefObject<HTMLInputElement | null>;
  };
  emailTemplate: EmailTemplateState;
  insertFieldToken: (variable: string, modifier?: string) => string;
  setActiveEditor: (field: EditorField) => void;
  updateEmailField: (field: EditorField, value: string) => void;
  validationIssues: WorkflowValidationIssue[];
};

export function EmailTemplateEditor({
  activeEditor,
  availableVariables,
  editorRefs,
  emailTemplate,
  insertFieldToken,
  setActiveEditor,
  updateEmailField,
  validationIssues,
}: Props) {
  const { copy } = useI18n();
  const requiredPlaceholderIssue = validationIssues.find((i) => i.id === 'required-placeholders')?.detail;
  const editor = useEditor({
    content: normalizeEmailBody(emailTemplate.body),
    extensions: editorExtensions,
    immediatelyRender: false,
    onFocus: () => setActiveEditor('body'),
    onUpdate: ({ editor: currentEditor }) => {
      updateEmailField('body', currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const normalizedBody = normalizeEmailBody(emailTemplate.body);
    if (editor.getHTML() !== normalizedBody) {
      editor.commands.setContent(normalizedBody, { emitUpdate: false });
    }
  }, [editor, emailTemplate.body]);

  return (
    <Paper className="panel-card" p="lg" radius="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={3}>{copy.emailBuilder.title}</Title>
            <Text c="dimmed" size="sm">
              {copy.emailBuilder.subtitle}
            </Text>
          </div>
          <Badge color="orange" variant="light">
            {copy.emailBuilder.activeTarget(activeEditor)}
          </Badge>
        </Group>

        <Group gap="sm">
          {availableVariables.map((variable) => (
            <Button
              key={variable}
              className="field-chip"
              onClick={() => {
                const token = insertFieldToken(variable);
                if (activeEditor === 'body' && editor) {
                  editor.chain().focus().insertContent(token).run();
                }
              }}
              radius="xl"
              size="xs"
              variant="light"
            >
              {variable}
            </Button>
          ))}
        </Group>

        {copy.emailBuilder.modifierHint ? (
          <Text c="dimmed" size="xs">{copy.emailBuilder.modifierHint}</Text>
        ) : null}

        <Divider />

        <Stack gap="md">
          <TextInput description={copy.emailBuilder.subjectDesc} label={copy.emailBuilder.subject} onChange={(event) => updateEmailField('subject', event.currentTarget.value)} onFocus={() => setActiveEditor('subject')} ref={editorRefs.subject} value={emailTemplate.subject} />
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <TextInput description={copy.emailBuilder.toDesc} error={emailAddressError(emailTemplate.to) ? copy.emailBuilder.invalidEmailAddress : undefined} label={copy.emailBuilder.to} onChange={(event) => updateEmailField('to', event.currentTarget.value)} onFocus={() => setActiveEditor('to')} ref={editorRefs.to} value={emailTemplate.to} />
            <TextInput description={copy.emailBuilder.ccDesc} error={emailAddressError(emailTemplate.cc) ? copy.emailBuilder.invalidEmailAddress : undefined} label={copy.emailBuilder.cc} onChange={(event) => updateEmailField('cc', event.currentTarget.value)} onFocus={() => setActiveEditor('cc')} ref={editorRefs.cc} value={emailTemplate.cc} />
          </SimpleGrid>
          <Stack gap="xs">
            <Text fw={500} size="sm">{copy.emailBuilder.body}</Text>
            <Text c="dimmed" size="sm">{copy.emailBuilder.bodyDesc}</Text>
            <RichTextEditor className="email-rich-editor" editor={editor}>
              <RichTextEditor.Toolbar sticky stickyOffset={0}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.ClearFormatting />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Undo />
                  <RichTextEditor.Redo />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content />
            </RichTextEditor>
            {requiredPlaceholderIssue ? (
              <Text c="yellow.7" fw={600} size="sm">
                {requiredPlaceholderIssue}
              </Text>
            ) : null}
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
