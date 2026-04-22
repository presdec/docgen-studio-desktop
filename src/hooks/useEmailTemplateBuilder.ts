import { useAtom } from 'jotai/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { extractTokens } from '../lib/template';
import { emailTemplateAtom } from '../state/workspace';
import type { EditorField } from '../types/template';

export function useEmailTemplateBuilder() {
  const subjectRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const ccRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fieldRefs = useMemo(
    () => ({
      body: bodyRef,
      cc: ccRef,
      subject: subjectRef,
      to: toRef,
    }),
    [],
  );

  const [activeEditor, setActiveEditor] = useState<EditorField>('body');
  const [emailTemplate, setEmailTemplate] = useAtom(emailTemplateAtom);

  const updateEmailField = useCallback((field: EditorField, value: string) => {
    setEmailTemplate((current) => {
      if (current[field] === value) {
        return current;
      }

      return { ...current, [field]: value };
    });
  }, []);

  const insertFieldToken = useCallback((variable: string) => {
    const token = `{{${variable}}}`;
    const targetRef = fieldRefs[activeEditor].current;

    setEmailTemplate((current) => {
      const currentValue = current[activeEditor];
      if (!targetRef) {
        return {
          ...current,
          [activeEditor]: `${currentValue}${currentValue.endsWith(' ') ? '' : ' '}${token}`,
        };
      }

      const selectionStart = targetRef.selectionStart ?? currentValue.length;
      const selectionEnd = targetRef.selectionEnd ?? selectionStart;
      const nextValue =
        currentValue.slice(0, selectionStart) + token + currentValue.slice(selectionEnd);

      setTimeout(() => {
        const refreshedTarget = fieldRefs[activeEditor].current;
        refreshedTarget?.focus();
        refreshedTarget?.setSelectionRange(
          selectionStart + token.length,
          selectionStart + token.length,
        );
      }, 0);

      return { ...current, [activeEditor]: nextValue };
    });

    return token;
  }, [activeEditor, fieldRefs]);

  const emailVariables = useMemo(
    () =>
      extractTokens(
        `${emailTemplate.subject}\n${emailTemplate.to}\n${emailTemplate.cc}\n${emailTemplate.body}`,
      ).map((token) => token.replace(/[{}]/g, '')),
    [emailTemplate],
  );

  return {
    activeEditor,
    editorRefs: fieldRefs,
    emailTemplate,
    emailVariables,
    insertFieldToken,
    setActiveEditor,
    updateEmailField,
  };
}
