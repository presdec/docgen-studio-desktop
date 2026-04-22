export type EditorField = 'subject' | 'to' | 'cc' | 'body';

export type EmailTemplateState = {
  body: string;
  cc: string;
  subject: string;
  to: string;
};

export type GenerationOptions = {
  generateDocx: boolean;
  generateEmailDrafts: boolean;
  generatePdf: boolean;
};

export type VariableUsage = 'both' | 'contract' | 'email' | 'unused';

export type WorkbookPreviewRow = {
  columnLetter: string;
  header: string;
  sampleValue: string;
  selectedVariable: string;
  suggestedVariable: string | null;
  usedBy: VariableUsage;
};

export type WizardStep = {
  description: string;
  id: number;
  title: string;
};

export type WizardStepId = 1 | 2 | 3 | 4;
