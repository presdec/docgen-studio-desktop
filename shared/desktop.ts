export type FileDialogMode = 'file' | 'directory';

export type FileDialogRequest = {
  defaultPath?: string;
  filters?: Electron.FileFilter[];
  mode: FileDialogMode;
  title: string;
};

export type StarterTemplateKind = 'email' | 'excel' | 'word';

export type SaveStarterTemplateRequest = {
  kind: StarterTemplateKind;
};

export type ProjectConfig = {
  workbookPath: string;
  contractTemplatePath: string;
  emailTemplatePath: string;
  outputFilenamePattern: string;
  useOptionalEmailSource: boolean;
  outputFolderPath: string;
  worksheetName: string;
  headerRow: number;
  dataStartRow: number;
};

export type ProjectOpenResult = {
  filePath: string;
  projectDocument: SavedProjectDocument;
};

export type GenerationOptionsInput = {
  generateDocx: boolean;
  generateEmailDrafts: boolean;
  generatePdf: boolean;
};

export type EmailTemplateInput = {
  body: string;
  cc: string;
  subject: string;
  to: string;
};

export type SavedProjectDocument = {
  activeStep?: number;
  emailTemplate: EmailTemplateInput;
  generationOptions: GenerationOptionsInput;
  project: ProjectConfig;
  tokenMappings: Record<string, string>;
  variableColumns: Record<string, string>;
  version: number;
};

export type GenerateProjectRequest = {
  emailTemplate: EmailTemplateInput;
  generationOptions: GenerationOptionsInput;
  project: ProjectConfig;
  tokenMappings: Record<string, string>;
  variableColumns: Record<string, string>;
};

export type GenerateProjectProgress = {
  docxCount?: number;
  emailDraftCount?: number;
  expectedDocxCount?: number;
  expectedEmailDraftCount?: number;
  expectedPdfCount?: number;
  generatedCount?: number;
  current: number;
  message: string;
  pdfCount?: number;
  percent?: number;
  rowsFound?: number;
  stage: string;
  skippedCount?: number;
  total: number;
};

export type ProjectPreflightCheck = {
  detail: string;
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warn';
};

export type ProjectPreflightResult = {
  canGenerate: boolean;
  checks: ProjectPreflightCheck[];
  errors: string[];
  pdfBackend: 'libreoffice' | 'none' | 'word';
  warnings: string[];
};

export type OutputTreeEntry = {
  absolutePath: string;
  kind: 'directory' | 'file';
  relativePath: string;
};

export type GenerateProjectResult = {
  combinedEmailPath: string | null;
  contractsDir: string;
  createdEntries: OutputTreeEntry[];
  docxCount: number;
  emailDraftCount: number;
  generatedCount: number;
  outputDir: string;
  pdfCount: number;
  pdfDir: string;
  reportPath: string;
  rowsFound: number;
  skippedCount: number;
  stderr: string;
  stdout: string;
  warnings: string[];
};

export type OpenPathRequest = {
  targetPath: string;
};

export type InspectProjectRequest = {
  contractTemplatePath?: string;
  dataStartRow: number;
  headerRow: number;
  workbookPath: string;
  worksheetName: string;
};

export type TemplateStatusRequest = {
  templatePath?: string;
};

export type TemplateStatusResult = {
  exists: boolean;
  isLocked: boolean;
  lastModifiedMs: number | null;
  templatePath: string;
};

export type WorkbookPreviewColumn = {
  columnLetter: string;
  header: string;
  sampleValue: string;
  suggestedVariable: string | null;
};

export type WorkbookPreviewSampleRow = {
  rowNumber: number;
  values: Record<string, string>;
};

export type InspectProjectResult = {
  columns: WorkbookPreviewColumn[];
  contractTokenContexts: Record<string, string>;
  contractTokens: string[];
  dataStartRow: number;
  headerRow: number;
  sampleRows: WorkbookPreviewSampleRow[];
  totalRows: number;
  worksheetName: string;
};
