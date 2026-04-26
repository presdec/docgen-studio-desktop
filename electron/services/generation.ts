import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { execFile, spawn } from 'node:child_process';
import { isAbsolute, join } from 'node:path';
import { promisify } from 'node:util';
import type {
  GenerateProjectProgress,
  GenerateProjectRequest,
  GenerateProjectResult,
  InspectProjectRequest,
  InspectProjectResult,
  ProjectPreflightCheck,
  ProjectPreflightResult,
} from '../../shared/desktop';
import { collectOutputTree } from '../lib/outputTree';
import {
  buildRuntimeCommand,
  describePythonRuntime,
  getRuntimeTempRoot,
  resolveProjectPath,
  resolveRuntime,
  type RuntimeEnvironment,
  type ResolvedRuntime,
} from '../lib/runtimePaths';

const execFileAsync = promisify(execFile);
const PROGRESS_PREFIX = '__GREEKLIT_PROGRESS__';
const DEFAULT_FILENAME_PATTERN = '{{APPLICATION_CODE}} - {{TITLE}} - {{LANGUAGE}}';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const HTMLToDOCX = require('html-to-docx') as (
  html: string,
  header?: string | null,
  documentOptions?: Record<string, unknown>,
  footer?: string | null,
) => Promise<Buffer>;

type GenerationContext = {
  command: {
    args: string[];
    command: string;
    cwd: string;
  };
  config: Record<string, unknown>;
  contractTemplatePath?: string;
  mappedEntries: Array<{ column: string; token: string }>;
  missingPlaceholders: string[];
  outputDir?: string;
  runtime: ResolvedRuntime;
  temporaryDir: string;
  wantsDocumentOutput: boolean;
  workbookPath?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function plainTextToHtml(value: string) {
  const normalized = value.replace(/\r\n/g, '\n').trim();

  if (!normalized) {
    return '<p></p>';
  }

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br />')}</p>`)
    .join('');
}

function normalizeEmailBodyHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '<p></p>';
  }

  return /<[^>]+>/.test(trimmed) ? value : plainTextToHtml(value);
}

function buildInlineFieldHtml(label: string, value: string) {
  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

function buildEmailTemplateHtml(request: GenerateProjectRequest) {
  const bodyHtml = normalizeEmailBodyHtml(request.emailTemplate.body);

  return [
    buildInlineFieldHtml('Subject', request.emailTemplate.subject),
    buildInlineFieldHtml('To', request.emailTemplate.to),
    buildInlineFieldHtml('Cc', request.emailTemplate.cc),
    bodyHtml,
  ].join('');
}

function normalizeOptionalEmailTemplateHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '<p></p>';
  }

  return /<[^>]+>/.test(trimmed) ? value : plainTextToHtml(value);
}

async function convertCombinedEmailHtmlToDocx(htmlPath: string) {
  const html = await readFile(htmlPath, 'utf8');
  const docxPath = htmlPath.replace(/\.html$/i, '.docx');
  const docxBuffer = await HTMLToDOCX(
    html,
    null,
    {
      creator: 'Greeklit Contracts',
      font: 'Calibri',
      fontSize: 22,
      margins: {
        bottom: 1440,
        left: 1440,
        right: 1440,
        top: 1440,
      },
      title: 'Greeklit Email Drafts',
    },
    null,
  );

  await writeFile(docxPath, docxBuffer);
  await rm(htmlPath, { force: true });
  return docxPath;
}

function parseCount(stdout: string, label: string) {
  const match = stdout.match(new RegExp(`${label}\\s+(\\d+)`));
  return match ? Number(match[1]) : 0;
}

function parsePathLine(stdout: string, prefix: string) {
  const line = stdout
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  if (!line) {
    return '';
  }

  return line.slice(prefix.length).trim();
}

function normalizeRelativePath(value: string) {
  return value.replaceAll('\\', '/');
}

function countFilesInSubdir(
  entries: Array<{ kind: 'directory' | 'file'; relativePath: string }>,
  subdir: string,
  extension: string,
) {
  const normalizedSubdir = subdir.replaceAll('\\', '/').replace(/\/$/, '');
  const normalizedExtension = extension.toLowerCase();

  return entries.filter((entry) => {
    if (entry.kind !== 'file') {
      return false;
    }

    const relativePath = normalizeRelativePath(entry.relativePath);
    return relativePath.startsWith(`${normalizedSubdir}/`)
      && relativePath.toLowerCase().endsWith(normalizedExtension);
  }).length;
}

function normalizeProgressPayload(value: unknown): GenerateProjectProgress | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const payload = value as Partial<GenerateProjectProgress>;
  if (typeof payload.stage !== 'string' || typeof payload.message !== 'string') {
    return null;
  }

  const current = typeof payload.current === 'number' && Number.isFinite(payload.current)
    ? payload.current
    : 0;
  const total = typeof payload.total === 'number' && Number.isFinite(payload.total)
    ? payload.total
    : 0;
  const percent = typeof payload.percent === 'number' && Number.isFinite(payload.percent)
    ? Math.max(0, Math.min(100, payload.percent))
    : undefined;
  const numberMetric = (key: keyof GenerateProjectProgress) => {
    const metric = payload[key];
    return typeof metric === 'number' && Number.isFinite(metric)
      ? Math.max(0, metric)
      : undefined;
  };

  return {
    current,
    docxCount: numberMetric('docxCount'),
    emailDraftCount: numberMetric('emailDraftCount'),
    expectedDocxCount: numberMetric('expectedDocxCount'),
    expectedEmailDraftCount: numberMetric('expectedEmailDraftCount'),
    expectedPdfCount: numberMetric('expectedPdfCount'),
    generatedCount: numberMetric('generatedCount'),
    message: payload.message,
    pdfCount: numberMetric('pdfCount'),
    percent,
    rowsFound: numberMetric('rowsFound'),
    stage: payload.stage,
    skippedCount: numberMetric('skippedCount'),
    total,
  };
}

function parseProgressLine(line: string) {
  if (!line.startsWith(PROGRESS_PREFIX)) {
    return null;
  }

  try {
    return normalizeProgressPayload(JSON.parse(line.slice(PROGRESS_PREFIX.length)));
  } catch {
    return null;
  }
}

function runGenerationCommand(
  command: GenerationContext['command'],
  onProgress?: (progress: GenerateProjectProgress) => void,
) {
  return new Promise<{ stderr: string; stdout: string }>((resolvePromise, reject) => {
    const child = spawn(command.command, command.args, {
      cwd: command.cwd,
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    let pendingStdout = '';
    let settled = false;

    const settleReject = (error: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      reject(error);
    };

    const handleStdoutLine = (line: string) => {
      const progress = parseProgressLine(line.trim());
      if (progress) {
        onProgress?.(progress);
        return;
      }
      stdout += `${line}\n`;
    };

    child.stdout?.on('data', (chunk: Buffer) => {
      pendingStdout += chunk.toString('utf8');
      const lines = pendingStdout.split(/\r?\n/);
      pendingStdout = lines.pop() ?? '';
      for (const line of lines) {
        handleStdoutLine(line);
      }
    });

    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });

    child.on('error', (error) => {
      settleReject(error);
    });

    child.on('close', (code) => {
      if (settled) {
        return;
      }
      settled = true;
      if (pendingStdout) {
        handleStdoutLine(pendingStdout);
      }
      if (code && code !== 0) {
        reject(new Error(stderr.trim() || stdout.trim() || `Generation process exited with code ${code}.`));
        return;
      }
      resolvePromise({ stderr, stdout });
    });
  });
}

function extractTemplateTokens(value: string) {
  const matches = value.match(/\{\{([A-Z0-9_]+)\}\}/g) ?? [];
  return matches.map((match) => match.replace(/[{}]/g, ''));
}

async function checkWordPdfCapability() {
  if (process.platform !== 'win32') {
    return false;
  }

  const command = [
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    '$word=$null; try { $word = New-Object -ComObject Word.Application; Write-Output "available" } catch { Write-Error $_; exit 1 } finally { if ($word -ne $null) { $word.Quit() } }',
  ];

  try {
    const { stdout } = await execFileAsync('powershell', command, { windowsHide: true });
    return stdout.includes('available');
  } catch {
    return false;
  }
}

async function ensureOutputDirectory(outputDir?: string) {
  if (!outputDir) {
    return false;
  }

  await mkdir(outputDir, { recursive: true });
  const markerPath = join(outputDir, `.greeklit-preflight-${Date.now()}.tmp`);
  await writeFile(markerPath, '', 'utf8');
  await rm(markerPath, { force: true });
  return true;
}

export async function inspectProjectInternal(
  environment: RuntimeEnvironment,
  request: InspectProjectRequest,
  runtimeOverride?: ResolvedRuntime,
) {
  const runtime = runtimeOverride ?? await resolveRuntime(environment);
  const workbookPath = resolveProjectPath(request.workbookPath, environment);
  const contractTemplatePath = resolveProjectPath(request.contractTemplatePath, environment);

  if (!workbookPath) {
    throw new Error('Choose an Excel workbook before loading the preview.');
  }

  if (!existsSync(workbookPath)) {
    throw new Error(`Workbook not found: ${workbookPath}`);
  }

  const payload = JSON.stringify({
    ...request,
    contractTemplatePath,
    workbookPath,
  });
  const command = buildRuntimeCommand(runtime, 'inspectProject', [payload], environment);
  await mkdir(command.cwd, { recursive: true });
  const { stdout } = await execFileAsync(command.command, command.args, {
    cwd: command.cwd,
    windowsHide: true,
  });

  return JSON.parse(stdout) as InspectProjectResult;
}

async function buildGenerationContext(
  environment: RuntimeEnvironment,
  request: GenerateProjectRequest,
): Promise<GenerationContext> {
  const runtime = await resolveRuntime(environment);
  const wantsDocumentOutput =
    request.generationOptions.generateDocx || request.generationOptions.generatePdf;
  const requiredContractTokens = wantsDocumentOutput ? Object.keys(request.tokenMappings) : [];
  const optionalEmailTemplatePath = request.project.useOptionalEmailSource
    ? resolveProjectPath(request.project.emailTemplatePath, environment)
    : undefined;
  const emailTemplateText = request.project.useOptionalEmailSource
    ? optionalEmailTemplatePath
      ? normalizeOptionalEmailTemplateHtml(await readFile(optionalEmailTemplatePath, 'utf8'))
      : ''
    : buildEmailTemplateHtml(request);
  const filenamePattern = wantsDocumentOutput
    ? (request.project.outputFilenamePattern || '').trim() || DEFAULT_FILENAME_PATTERN
    : DEFAULT_FILENAME_PATTERN;
  const filenameTokens = wantsDocumentOutput ? extractTemplateTokens(filenamePattern) : [];
  const emailTokens = request.generationOptions.generateEmailDrafts
    ? extractTemplateTokens(emailTemplateText)
    : [];
  const requiredPlaceholders = Array.from(new Set([
    ...requiredContractTokens,
    ...filenameTokens,
    ...emailTokens,
  ]));

  const mappingByPlaceholder = new Map<string, string>();

  if (wantsDocumentOutput) {
    for (const [token, variable] of Object.entries(request.tokenMappings)) {
      const column = variable ? request.variableColumns[variable] : '';
      if (column) {
        mappingByPlaceholder.set(token, column);
      }
    }

    for (const token of filenameTokens) {
      const column = request.variableColumns[token] ?? '';
      if (column && !mappingByPlaceholder.has(token)) {
        mappingByPlaceholder.set(token, column);
      }
    }
  }

  for (const token of emailTokens) {
    const column = request.variableColumns[token] ?? '';
    if (column && !mappingByPlaceholder.has(token)) {
      mappingByPlaceholder.set(token, column);
    }
  }

  const mappedEntries = Array.from(mappingByPlaceholder.entries()).map(([token, column]) => ({
    column,
    token,
  }));
  const missingPlaceholders = requiredPlaceholders.filter((token) => !mappingByPlaceholder.has(token));
  const outputDir = resolveProjectPath(request.project.outputFolderPath, environment);
  const workbookPath = resolveProjectPath(request.project.workbookPath, environment);
  const contractTemplatePath = resolveProjectPath(
    request.project.contractTemplatePath,
    environment,
  );
  const temporaryRoot = getRuntimeTempRoot(environment);
  await mkdir(temporaryRoot, { recursive: true });
  const temporaryDir = await mkdtemp(join(temporaryRoot, 'run-'));
  const mappingPath = join(temporaryDir, 'field_mapping.txt');
  const emailTemplatePath = join(temporaryDir, 'email_template.html');
  const configPath = join(temporaryDir, 'generator_config.json');
  const mappedPlaceholderNames = new Set(mappedEntries.map((entry) => entry.token));
  const rowIdentityPlaceholders = ['ID', 'APPLICATION_CODE', 'TITLE']
    .filter((placeholder) => mappedPlaceholderNames.has(placeholder))
    .slice(0, 1);
  const config: Record<string, unknown> = {
    attach_contract_to_eml: true,
    combined_email_filename: request.generationOptions.generateEmailDrafts
      ? 'email_drafts.html'
      : '__skip_email_drafts.html',
    contract_output_subdir: 'contracts',
    contract_template_path: contractTemplatePath,
    convert_to_pdf: request.generationOptions.generatePdf,
    data_start_row: request.project.dataStartRow,
    date_format: '%Y-%m-%d',
    email_output_subdir: 'emails',
    email_template_path: emailTemplatePath,
    filename_pattern: filenamePattern,
    header_row: request.project.headerRow,
    keep_docx_output: request.generationOptions.generateDocx,
    mapping_path: mappingPath,
    output_dir: outputDir,
    pdf_conversion_workers: 4,
    pdf_output_subdir: 'contracts_pdf',
    report_filename: 'generation_report.txt',
    row_identity_placeholders: rowIdentityPlaceholders,
    skip_if_column_contains: {},
    skip_if_row_fill_colors: [],
    workbook_path: workbookPath,
    worksheet_name: request.project.worksheetName,
  };
  if (runtime.libreOfficeCommand && isAbsolute(runtime.libreOfficeCommand)) {
    config.libreoffice_path = runtime.libreOfficeCommand;
  }

  const command = !wantsDocumentOutput && request.generationOptions.generateEmailDrafts
      ? buildRuntimeCommand(runtime, 'emailGenerator', [
        JSON.stringify({
          data_start_row: request.project.dataStartRow,
          email_template_text: emailTemplateText,
          mapping: Object.fromEntries(mappedEntries.map((entry) => [entry.token, entry.column])),
          output_dir: outputDir,
          workbook_path: workbookPath,
          worksheet_name: request.project.worksheetName,
        }),
      ], environment)
    : buildRuntimeCommand(runtime, 'generator', ['--config', configPath], environment);

  await writeFile(
    mappingPath,
    `${mappedEntries.map((entry) => `${entry.token}=${entry.column}`).join('\n')}\n`,
    'utf8',
  );
  await writeFile(emailTemplatePath, emailTemplateText, 'utf8');
  await writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');

  return {
    command,
    config,
    contractTemplatePath,
    mappedEntries,
    missingPlaceholders,
    outputDir,
    runtime,
    temporaryDir,
    wantsDocumentOutput,
    workbookPath,
  };
}

export async function runProjectPreflight(
  environment: RuntimeEnvironment,
  request: GenerateProjectRequest,
): Promise<ProjectPreflightResult> {
  const checks: ProjectPreflightCheck[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const addCheck = (
    id: string,
    label: string,
    status: ProjectPreflightCheck['status'],
    detail: string,
  ) => {
    checks.push({ detail, id, label, status });
    if (status === 'fail') {
      errors.push(detail);
    }
    if (status === 'warn') {
      warnings.push(detail);
    }
  };

  if (
    !request.generationOptions.generateDocx
    && !request.generationOptions.generatePdf
    && !request.generationOptions.generateEmailDrafts
  ) {
    addCheck('outputs', 'Output selection', 'fail', 'Choose at least one output type before generation.');
  } else {
    addCheck('outputs', 'Output selection', 'pass', 'At least one output type is enabled.');
  }

  let context: GenerationContext | null = null;
  try {
    context = await buildGenerationContext(environment, request);
  } catch (error) {
    addCheck(
      'payload',
      'Generation payload',
      'fail',
      error instanceof Error ? error.message : 'Could not build the generation payload.',
    );
  }

  if (!context) {
    return { canGenerate: false, checks, errors, pdfBackend: 'none', warnings };
  }

  try {
    const needsPythonRuntime = [
      context.runtime.emailGenerator,
      context.runtime.generator,
      context.runtime.inspectProject,
    ].some((entrypoint) => entrypoint.mode === 'python-script');
    const runtimeEntrypoints = [
      context.runtime.generator,
      context.runtime.emailGenerator,
      context.runtime.inspectProject,
    ];
    const missingRuntimeEntrypoints = runtimeEntrypoints.filter((entrypoint) => !entrypoint.exists);
    const runtimeSummary = runtimeEntrypoints
      .map((entrypoint) =>
        `${entrypoint.name}: ${entrypoint.exists ? entrypoint.source : 'missing'} (${entrypoint.absolutePath})`)
      .join('; ');

    addCheck(
      'python-runtime',
      'Python runtime',
      !needsPythonRuntime || Boolean(context.runtime.pythonRuntime) ? 'pass' : 'fail',
      !needsPythonRuntime
        ? 'Packaged runtime services are configured; no Python interpreter is required.'
        : context.runtime.pythonRuntime
          ? `Python runtime detected via ${describePythonRuntime(context.runtime.pythonRuntime)}.`
          : 'No compatible Python runtime was found for the current generator scripts.',
    );

    addCheck(
      'runtime-services',
      'Runtime services',
      missingRuntimeEntrypoints.length === 0 ? 'pass' : 'fail',
      missingRuntimeEntrypoints.length === 0
        ? `Generator, inspection, and email runtime services are available. ${runtimeSummary}`
        : environment.isPackaged
          ? `Packaged runtime entrypoints are missing: ${missingRuntimeEntrypoints.map((entrypoint) => entrypoint.name).join(', ')}. Build the runtime and include app/runtime as packaged resources.`
          : `One or more runtime entrypoints are missing: ${runtimeSummary}`,
    );

    addCheck(
      'workbook',
      'Workbook file',
      context.workbookPath && existsSync(context.workbookPath) ? 'pass' : 'fail',
      context.workbookPath && existsSync(context.workbookPath)
        ? `Workbook found at ${context.workbookPath}.`
        : 'Choose an Excel workbook that exists on disk.',
    );

    if (context.wantsDocumentOutput) {
      addCheck(
        'contract-template',
        'Word template',
        context.contractTemplatePath && existsSync(context.contractTemplatePath) ? 'pass' : 'fail',
        context.contractTemplatePath && existsSync(context.contractTemplatePath)
          ? `Word template found at ${context.contractTemplatePath}.`
          : 'Choose a Word template before generating DOCX or PDF files.',
      );
    }

    if (request.generationOptions.generateEmailDrafts && request.project.useOptionalEmailSource) {
      const emailTemplatePath = resolveProjectPath(
        request.project.emailTemplatePath,
        environment,
      );
      addCheck(
        'email-template-file',
        'Email template file',
        emailTemplatePath && existsSync(emailTemplatePath) ? 'pass' : 'fail',
        emailTemplatePath && existsSync(emailTemplatePath)
          ? `Email template file found at ${emailTemplatePath}.`
          : 'Turn off "Use an existing email template file" or choose a valid template file.',
      );
    }

    try {
      const outputReady = await ensureOutputDirectory(context.outputDir);
      if (!outputReady) {
        throw new Error('Choose an output folder before generation.');
      }

      addCheck(
        'output-directory',
        'Output directory',
        'pass',
        `Output directory is writable at ${context.outputDir}.`,
      );
    } catch (error) {
      addCheck(
        'output-directory',
        'Output directory',
        'fail',
        error instanceof Error ? error.message : 'Output directory could not be created or written.',
      );
    }

    try {
      const inspection = await inspectProjectInternal(environment, {
        contractTemplatePath: request.project.contractTemplatePath,
        dataStartRow: request.project.dataStartRow,
        headerRow: request.project.headerRow,
        workbookPath: request.project.workbookPath,
        worksheetName: request.project.worksheetName,
      }, context.runtime);
      addCheck(
        'worksheet',
        'Worksheet and row settings',
        'pass',
        `Worksheet "${inspection.worksheetName}" loaded with header row ${inspection.headerRow} and data row ${inspection.dataStartRow}.`,
      );
    } catch (error) {
      addCheck(
        'worksheet',
        'Worksheet and row settings',
        'fail',
        error instanceof Error ? error.message : 'Workbook preview inspection failed.',
      );
    }

    if (context.mappedEntries.length === 0) {
      addCheck(
        'mappings',
        'Placeholder mappings',
        'fail',
        'Map at least one Word, output filename, or email placeholder before generation.',
      );
    } else {
      addCheck(
        'mappings',
        'Placeholder mappings',
        'pass',
        `${context.mappedEntries.length} placeholder mappings are ready for generation.`,
      );
    }

    if (context.missingPlaceholders.length > 0) {
      addCheck(
        'required-placeholders',
        'Required placeholder coverage',
        'fail',
        `Missing mappings for placeholders: ${context.missingPlaceholders.join(', ')}.`,
      );
    } else {
      addCheck(
        'required-placeholders',
        'Required placeholder coverage',
        'pass',
        'All required Word, output filename, and email placeholders are mapped.',
      );
    }

    let pdfBackend: ProjectPreflightResult['pdfBackend'] = 'none';
    if (request.generationOptions.generatePdf) {
      const libreOfficePath = context.runtime.libreOfficeCommand;
      if (libreOfficePath) {
        pdfBackend = 'libreoffice';
        addCheck(
          'pdf-backend',
          'PDF capability',
          'pass',
          `PDF conversion is available through LibreOffice at ${libreOfficePath}.`,
        );
      } else if (await checkWordPdfCapability()) {
        pdfBackend = 'word';
        addCheck(
          'pdf-backend',
          'PDF capability',
          'pass',
          'PDF conversion is available through Microsoft Word automation.',
        );
      } else {
        addCheck(
          'pdf-backend',
          'PDF capability',
          'fail',
          'PDF output is enabled, but no LibreOffice or Microsoft Word PDF backend is currently available.',
        );
      }
    }

    return {
      canGenerate: errors.length === 0,
      checks,
      errors,
      pdfBackend,
      warnings,
    };
  } finally {
    await rm(context.temporaryDir, { force: true, recursive: true });
  }
}

export async function generateProject(
  environment: RuntimeEnvironment,
  request: GenerateProjectRequest,
  onProgress?: (progress: GenerateProjectProgress) => void,
): Promise<GenerateProjectResult> {
  const preflight = await runProjectPreflight(environment, request);
  if (!preflight.canGenerate) {
    throw new Error(preflight.errors[0] ?? 'Preflight validation failed.');
  }

  const context = await buildGenerationContext(environment, request);
  let latestProgress: GenerateProjectProgress | null = null;
  let latestRowsFound = 0;
  const trackProgress = (progress: GenerateProjectProgress) => {
    const nextProgress = {
      ...(latestProgress ?? {}),
      ...progress,
    };
    latestProgress = nextProgress;
    latestRowsFound = nextProgress.rowsFound ?? latestRowsFound;
    onProgress?.(nextProgress);
  };

  try {
    const { stderr, stdout } = await runGenerationCommand(context.command, trackProgress);

    trackProgress({
      current: 0,
      message: 'Finalizing output summary.',
      percent: 100,
      stage: 'finalize',
      total: 0,
    });

    const combinedEmailPath = request.generationOptions.generateEmailDrafts
      ? await convertCombinedEmailHtmlToDocx(
        parsePathLine(stdout, 'Combined email drafts file:')
          || join(context.outputDir ?? '', 'email_drafts.html'),
      )
      : null;

    if (!request.generationOptions.generateEmailDrafts) {
      const hiddenEmailPath = join(context.outputDir ?? '', '__skip_email_drafts.html');
      if (existsSync(hiddenEmailPath)) {
        await rm(hiddenEmailPath, { force: true });
      }
    }

    const createdEntries = await collectOutputTree(context.outputDir ?? '');
    const generatedCount = parseCount(stdout, 'Generated');
    const docxCount = countFilesInSubdir(createdEntries, 'contracts', '.docx');
    const pdfCount = countFilesInSubdir(createdEntries, 'contracts_pdf', '.pdf');

    return {
      combinedEmailPath,
      contractsDir:
        parsePathLine(stdout, 'Contract DOCX directory:') || join(context.outputDir ?? '', 'contracts'),
      createdEntries,
      docxCount,
      emailDraftCount: request.generationOptions.generateEmailDrafts ? generatedCount : 0,
      generatedCount,
      outputDir: context.outputDir ?? '',
      pdfCount,
      pdfDir:
        parsePathLine(stdout, 'Contract PDF directory:') || join(context.outputDir ?? '', 'contracts_pdf'),
      reportPath: parsePathLine(stdout, 'Report:') || join(context.outputDir ?? '', 'generation_report.txt'),
      rowsFound: latestRowsFound,
      skippedCount: parseCount(stdout, 'Skipped'),
      stderr,
      stdout,
      warnings: stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith('Warning:')),
    };
  } finally {
    await rm(context.temporaryDir, { force: true, recursive: true });
  }
}
