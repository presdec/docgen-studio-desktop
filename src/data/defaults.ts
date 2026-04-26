import type { ProjectConfig, SavedProjectDocument } from '../../shared/desktop';
import type { EmailTemplateState, GenerationOptions, WizardStep } from '../types/template';

export const wizardSteps: WizardStep[] = [
  {
    id: 1,
    title: 'Project Setup',
    description: 'Choose your workbook, Word template, and output folder.',
  },
  {
    id: 2,
    title: 'Field Mapping',
    description: 'Map Word placeholders to workbook variables and choose output format.',
  },
  {
    id: 3,
    title: 'Email Builder',
    description: 'Compose an email template with click-to-insert workbook fields.',
  },
  {
    id: 4,
    title: 'Review And Generate',
    description: 'Check preview and mapping coverage, then generate outputs.',
  },
];

export const initialProject: ProjectConfig = {
  workbookPath: '',
  contractTemplatePath: '',
  emailTemplatePath: '',
  outputFilenamePattern: '{{APPLICATION_CODE}} - {{TITLE}} - {{LANGUAGE}}',
  useOptionalEmailSource: false,
  outputFolderPath: '',
  worksheetName: '',
  headerRow: 1,
  dataStartRow: 2,
};

export const initialEmailTemplate: EmailTemplateState = {
  subject:
    'Document Batch | {{APPLICATION_CODE}} | {{TITLE}} | {{AUTHOR}}',
  to: '{{EMAIL_TO}}',
  cc: '{{EMAIL_CC}}',
  body: `<p>Dear {{PUBLISHER}},</p><p>Please find your generated document attached.</p><p>Please review the details and reply if you need any corrections.</p><p>For faster support, keep this subject line in your reply.</p><p>Reference amount: {{FIRST_INSTALLMENT}} EUR.</p><p>Best regards,</p><p>Operations Team</p>`,
};

export const canonicalVariables = [
  'APPLICATION_CODE',
  'ID',
  'TITLE',
  'AUTHOR',
  'LANGUAGE',
  'EMAIL_TO',
  'EMAIL_CC',
  'PUBLISHER',
  'AMOUNT',
  'FIRST_INSTALLMENT',
];

export const defaultGenerationOptions: GenerationOptions = {
  generateDocx: true,
  generateEmailDrafts: true,
  generatePdf: true,
};

export const initialSavedProjectDocument: SavedProjectDocument = {
  activeStep: 1,
  emailTemplate: initialEmailTemplate,
  generationOptions: defaultGenerationOptions,
  project: initialProject,
  tokenMappings: {},
  variableColumns: {},
  version: 1,
};
