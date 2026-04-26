import type { SavedProjectDocument } from '../../shared/desktop';

const defaultProjectConfig = {
  contractTemplatePath: '',
  dataStartRow: 1,
  emailTemplatePath: '',
  headerRow: 1,
  outputFilenamePattern: '{{APPLICATION_CODE}} - {{TITLE}} - {{LANGUAGE}}',
  outputFolderPath: '',
  useOptionalEmailSource: false,
  workbookPath: '',
  worksheetName: '',
};

const defaultEmailTemplate = {
  body: '',
  cc: '',
  subject: '',
  to: '',
};

const defaultGenerationOptions = {
  generateDocx: true,
  generateEmailDrafts: true,
  generatePdf: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => typeof item === 'string'),
  ) as Record<string, string>;
}

export function normalizeProjectDocument(value: unknown): SavedProjectDocument {
  const documentRecord = isRecord(value) ? value : {};
  const projectRecord = isRecord(documentRecord.project) ? documentRecord.project : documentRecord;
  const emailTemplateRecord = isRecord(documentRecord.emailTemplate)
    ? documentRecord.emailTemplate
    : {};
  const generationOptionsRecord = isRecord(documentRecord.generationOptions)
    ? documentRecord.generationOptions
    : {};

  return {
    activeStep:
      typeof documentRecord.activeStep === 'number' ? documentRecord.activeStep : 1,
    emailTemplate: {
      ...defaultEmailTemplate,
      ...toStringRecord(emailTemplateRecord),
    },
    generationOptions: {
      ...defaultGenerationOptions,
      ...Object.fromEntries(
        Object.entries(generationOptionsRecord).filter(([, item]) => typeof item === 'boolean'),
      ),
    },
    project: {
      ...defaultProjectConfig,
      ...projectRecord,
      useOptionalEmailSource:
        typeof projectRecord.useOptionalEmailSource === 'boolean'
          ? projectRecord.useOptionalEmailSource
          : false,
    },
    tokenMappings: toStringRecord(documentRecord.tokenMappings),
    variableColumns: toStringRecord(documentRecord.variableColumns),
    version: typeof documentRecord.version === 'number' ? documentRecord.version : 1,
  };
}
