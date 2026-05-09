import assert from 'node:assert/strict';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const sourcePath = resolve('src/features/workspace/workflowValidation.ts');
const outputDir = resolve('.tmp-tests');
const outputPath = resolve(outputDir, 'workflowValidation.mjs');

const source = ts.sys.readFile(sourcePath);
if (!source) {
  throw new Error(`Could not read ${sourcePath}`);
}

const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2024,
  },
  fileName: sourcePath,
});

await rm(outputDir, { force: true, recursive: true });
await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, transpiled.outputText, 'utf8');

const { buildWorkflowValidation, stepForPreflightCheck } = await import(pathToFileURL(outputPath).href);

const copy = {
  emailTemplateLoadError: (error) => `email load: ${error}`,
  emailTemplateRequired: 'email template required',
  mapRequiredFields: (wordFields, emailFields) =>
    `missing word=${wordFields.join(',')} email=${emailFields.join(',')}`,
  outputRequired: 'output folder required',
  outputFilenamePatternRequired: 'filename pattern required',
  outputsRequired: 'outputs required',
  wordTemplateRequired: 'word template required',
  workbookRequired: 'workbook required',
};

const project = {
  contractTemplatePath: 'contract.docx',
  dataStartRow: 2,
  emailTemplatePath: '',
  headerRow: 1,
  outputFilenamePattern: '{{APPLICATION_CODE}} - {{TITLE}}',
  outputFolderPath: 'out',
  rejectionColumn: '',
  rejectionValue: '',
  useOptionalEmailSource: false,
  workbookPath: 'workbook.xlsx',
  worksheetName: '',
};

const generationOptions = {
  emailOutputMode: 'combined_docx',
  generateDocx: true,
  generateEmailDrafts: true,
  generatePdf: false,
};

function validate(overrides = {}) {
  return buildWorkflowValidation({
    copy,
    externalEmailTemplateLoadError: null,
    generationOptions,
    project,
    unmappedContractTokens: [],
    unmappedEmailVariables: [],
    ...overrides,
  });
}

{
  const result = validate();
  assert.equal(result.canReview, true);
  assert.deepEqual(result.issues, []);
}

{
  const result = validate({
    generationOptions: {
      ...generationOptions,
      generateDocx: false,
      generateEmailDrafts: false,
      generatePdf: false,
    },
  });
  assert.equal(result.canReview, false);
  assert.equal(result.firstIssueForStep(1)?.id, 'outputs');
}

{
  const result = validate({
    project: {
      ...project,
      contractTemplatePath: '',
      outputFolderPath: '',
      workbookPath: '',
    },
  });
  assert.deepEqual(result.issues.map((issue) => issue.id), [
    'workbook',
    'output-directory',
    'contract-template',
  ]);
  assert.equal(result.firstIssueForStepBefore(2)?.id, 'workbook');
}

{
  const result = validate({
    project: {
      ...project,
      emailTemplatePath: '',
      useOptionalEmailSource: true,
    },
  });
  assert.equal(result.issues.at(-1)?.id, 'email-template-file');
}

{
  const result = validate({
    externalEmailTemplateLoadError: 'bad docx',
    project: {
      ...project,
      emailTemplatePath: 'email.docx',
      useOptionalEmailSource: true,
    },
  });
  assert.equal(result.issues.at(-1)?.detail, 'email load: bad docx');
}

{
  const result = validate({
    unmappedContractTokens: ['AUTHOR'],
    unmappedEmailVariables: ['EMAIL_TO'],
  });
  assert.equal(result.issues.at(-1)?.id, 'required-placeholders');
  assert.equal(result.issues.at(-1)?.targetStep, 2);
  assert.equal(result.step3Issues.length, 1);
}

{
  const result = validate({
    generationOptions: {
      ...generationOptions,
      generateDocx: false,
      generateEmailDrafts: true,
      generatePdf: false,
    },
    unmappedContractTokens: [],
    unmappedEmailVariables: ['EMAIL_TO'],
  });
  assert.equal(result.issues.at(-1)?.targetStep, 3);
}

assert.equal(stepForPreflightCheck('workbook', generationOptions), 1);
assert.equal(stepForPreflightCheck('required-placeholders', generationOptions), 2);
assert.equal(
  stepForPreflightCheck('required-placeholders', {
    ...generationOptions,
    generateDocx: false,
    generatePdf: false,
  }),
  3,
);
assert.equal(stepForPreflightCheck('unknown', generationOptions), null);

await rm(outputDir, { force: true, recursive: true });
