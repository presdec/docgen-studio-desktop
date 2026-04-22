import { existsSync } from 'node:fs';
import { copyFile, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { promisify } from 'node:util';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

import type * as ElectronModule from 'electron';
import type {
  FileDialogRequest,
  GenerateProjectRequest,
  GenerateProjectResult,
  InspectProjectRequest,
  InspectProjectResult,
  OpenPathRequest,
  OutputTreeEntry,
  SavedProjectDocument,
  SaveStarterTemplateRequest,
  TemplateStatusRequest,
  TemplateStatusResult,
} from '../shared/desktop';

const require = createRequire(import.meta.url);
const electron = require('electron') as typeof ElectronModule;
const { app, BrowserWindow, dialog, ipcMain, shell } = electron;
const execFileAsync = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));

let mainWindow: InstanceType<typeof BrowserWindow> | null = null;

const defaultProjectConfig = {
  contractTemplatePath: '',
  dataStartRow: 1,
  emailTemplatePath: '',
  headerRow: 1,
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

function normalizeProjectDocument(value: unknown): SavedProjectDocument {
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

function getWorkspaceRoot() {
  return resolve(__dirname, '../../..');
}

function getPythonPath() {
  return join(app.getPath('home'), 'anaconda3', 'python.exe');
}

function getGeneratorScriptPath() {
  return resolve(getWorkspaceRoot(), 'generate_contracts.py');
}

function getEmailOnlyGeneratorScriptPath() {
  return join(__dirname, '../../scripts/generate_email_drafts.py');
}

function getStarterTemplatePath(kind: SaveStarterTemplateRequest['kind']) {
  const starterTemplateNames = {
    email: 'starter-email-template.txt',
    excel: 'starter-workbook.xlsx',
    word: 'starter-contract-template.docx',
  } as const;

  return resolve(getWorkspaceRoot(), 'app', 'templates', starterTemplateNames[kind]);
}

function getWordLockFilePath(templatePath: string) {
  const directory = dirname(templatePath);
  const basename = templatePath.split(/[/\\]/).pop() ?? '';
  return join(directory, `~$${basename}`);
}

async function getTemplateStatus(request: TemplateStatusRequest): Promise<TemplateStatusResult> {
  const templatePath = resolveWorkspacePath(request.templatePath) ?? '';

  if (!templatePath || !existsSync(templatePath)) {
    return {
      exists: false,
      isLocked: false,
      lastModifiedMs: null,
      templatePath,
    };
  }

  const info = await stat(templatePath);

  return {
    exists: true,
    isLocked: existsSync(getWordLockFilePath(templatePath)),
    lastModifiedMs: info.mtimeMs,
    templatePath,
  };
}

function renderEmailTemplateText(request: GenerateProjectRequest) {
  return [
    `Subject: ${request.emailTemplate.subject}`,
    `To: ${request.emailTemplate.to}`,
    `Cc: ${request.emailTemplate.cc}`,
    '',
    request.emailTemplate.body,
  ].join('\n');
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

function extractTemplateTokens(value: string) {
  const matches = value.match(/\{\{([A-Z0-9_]+)\}\}/g) ?? [];
  return matches.map((match) => match.replace(/[{}]/g, ''));
}

function resolveWorkspacePath(pathValue?: string) {
  if (!pathValue) {
    return undefined;
  }

  return isAbsolute(pathValue) ? pathValue : resolve(getWorkspaceRoot(), pathValue);
}

async function collectOutputTree(rootPath: string) {
  const entries: OutputTreeEntry[] = [];

  async function walk(currentPath: string) {
    const info = await stat(currentPath);
    const relativePath = relative(rootPath, currentPath) || '.';

    entries.push({
      absolutePath: currentPath,
      kind: info.isDirectory() ? 'directory' : 'file',
      relativePath,
    });

    if (!info.isDirectory()) {
      return;
    }

    const children = await readdir(currentPath, { withFileTypes: true });
    for (const child of children.sort((a, b) => a.name.localeCompare(b.name))) {
      await walk(join(currentPath, child.name));
    }
  }

  await walk(rootPath);

  return entries;
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1120,
    minHeight: 760,
    backgroundColor: '#f5efe4',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.cjs'),
    },
  });

  mainWindow.webContents.on(
    'console-message',
    (
      _event: Electron.Event,
      level: number,
      message: string,
      line: number,
      sourceId: string,
    ) => {
      console.log(`[renderer:${level}] ${message} (${sourceId}:${line})`);
    },
  );

  mainWindow.webContents.on(
    'did-fail-load',
    (
      _event: Electron.Event,
      errorCode: number,
      errorDescription: string,
      validatedURL: string,
    ) => {
      console.error(
        `Renderer failed to load: ${errorCode} ${errorDescription} (${validatedURL})`,
      );
    },
  );

  mainWindow.webContents.on(
    'render-process-gone',
    (_event: Electron.Event, details: Electron.RenderProcessGoneDetails) => {
      console.error(`Renderer process gone: ${details.reason}`);
    },
  );

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Renderer finished load');
  });

  mainWindow.webContents.openDevTools({ mode: 'detach' });

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

ipcMain.handle(
  'desktop-app:pick-path',
  async (_event, request: FileDialogRequest) => {
    const properties: Electron.OpenDialogOptions['properties'] =
      request.mode === 'directory' ? ['openDirectory'] : ['openFile'];
    const browserWindow = mainWindow ?? BrowserWindow.getFocusedWindow() ?? undefined;

    const result = browserWindow
      ? await dialog.showOpenDialog(browserWindow, {
          defaultPath: request.defaultPath,
          filters: request.filters,
          properties,
          title: request.title,
        })
      : await dialog.showOpenDialog({
          defaultPath: request.defaultPath,
          filters: request.filters,
          properties,
          title: request.title,
        });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  },
);

ipcMain.handle('desktop-app:save-project', async (_event, project: SavedProjectDocument) => {
  const browserWindow = mainWindow ?? BrowserWindow.getFocusedWindow() ?? undefined;

  const result = browserWindow
    ? await dialog.showSaveDialog(browserWindow, {
        defaultPath: 'greeklit-project.json',
        filters: [
          {
            extensions: ['json'],
            name: 'Greeklit Project',
          },
        ],
        title: 'Save Project Setup',
      })
    : await dialog.showSaveDialog({
        defaultPath: 'greeklit-project.json',
        filters: [
          {
            extensions: ['json'],
            name: 'Greeklit Project',
          },
        ],
        title: 'Save Project Setup',
      });

  if (result.canceled || !result.filePath) {
    return null;
  }

  await writeFile(result.filePath, JSON.stringify(project, null, 2), 'utf8');
  return result.filePath;
});

ipcMain.handle(
  'desktop-app:save-starter-template',
  async (_event, request: SaveStarterTemplateRequest) => {
    const browserWindow = mainWindow ?? BrowserWindow.getFocusedWindow() ?? undefined;
    const sourcePath = getStarterTemplatePath(request.kind);

    if (!existsSync(sourcePath)) {
      throw new Error(`Starter template not found: ${sourcePath}`);
    }

    const saveOptions = {
      defaultPath: {
        email: 'starter-email-template.txt',
        excel: 'starter-workbook.xlsx',
        word: 'starter-contract-template.docx',
      }[request.kind],
      filters: {
        email: [{ extensions: ['txt'], name: 'Text Template' }],
        excel: [{ extensions: ['xlsx'], name: 'Excel Workbook' }],
        word: [{ extensions: ['docx'], name: 'Word Template' }],
      }[request.kind],
      title: 'Save Starter Template',
    };

    const result = browserWindow
      ? await dialog.showSaveDialog(browserWindow, saveOptions)
      : await dialog.showSaveDialog(saveOptions);

    if (result.canceled || !result.filePath) {
      return null;
    }

    await copyFile(sourcePath, result.filePath);
    return result.filePath;
  },
);

ipcMain.handle('desktop-app:open-project', async () => {
  const browserWindow = mainWindow ?? BrowserWindow.getFocusedWindow() ?? undefined;

  const result = browserWindow
    ? await dialog.showOpenDialog(browserWindow, {
        filters: [
          {
            extensions: ['json'],
            name: 'Greeklit Project',
          },
        ],
        properties: ['openFile'],
        title: 'Open Project Setup',
      })
    : await dialog.showOpenDialog({
        filters: [
          {
            extensions: ['json'],
            name: 'Greeklit Project',
          },
        ],
        properties: ['openFile'],
        title: 'Open Project Setup',
      });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];

  if (!filePath) {
    return null;
  }

  const contents = await readFile(filePath, 'utf8');

  return {
    filePath,
    projectDocument: normalizeProjectDocument(JSON.parse(contents)),
  };
});

ipcMain.handle(
  'desktop-app:get-template-status',
  async (_event, request: TemplateStatusRequest) => getTemplateStatus(request),
);

ipcMain.handle(
  'desktop-app:inspect-project',
  async (_event, request: InspectProjectRequest) => {
    const scriptPath = join(__dirname, '../../scripts/inspect_project.py');
    const pythonPath = getPythonPath();
    const payload = JSON.stringify({
      ...request,
      contractTemplatePath: resolveWorkspacePath(request.contractTemplatePath),
      workbookPath: resolveWorkspacePath(request.workbookPath),
    });
    const { stdout } = await execFileAsync(pythonPath, [scriptPath, payload], {
      cwd: getWorkspaceRoot(),
      windowsHide: true,
    });

    return JSON.parse(stdout) as InspectProjectResult;
  },
);

ipcMain.handle(
  'desktop-app:generate-project',
  async (_event, request: GenerateProjectRequest) => {
    if (
      !request.generationOptions.generateDocx
      && !request.generationOptions.generatePdf
      && !request.generationOptions.generateEmailDrafts
    ) {
      throw new Error('Choose at least one output type before generation.');
    }

    const wantsDocumentOutput =
      request.generationOptions.generateDocx || request.generationOptions.generatePdf;
    const requiredContractTokens = wantsDocumentOutput ? Object.keys(request.tokenMappings) : [];

    const optionalEmailTemplatePath = request.project.useOptionalEmailSource
      ? resolveWorkspacePath(request.project.emailTemplatePath)
      : undefined;
    const emailTemplateText = request.project.useOptionalEmailSource
      ? optionalEmailTemplatePath
        ? await readFile(optionalEmailTemplatePath, 'utf8')
        : ''
      : renderEmailTemplateText(request);
    const emailTokens = request.generationOptions.generateEmailDrafts
      ? extractTemplateTokens(emailTemplateText)
      : [];
    const requiredPlaceholders = Array.from(new Set([...requiredContractTokens, ...emailTokens]));

    const mappingByPlaceholder = new Map<string, string>();

    if (wantsDocumentOutput) {
      for (const [token, variable] of Object.entries(request.tokenMappings)) {
        const column = variable ? request.variableColumns[variable] : '';
        if (column) {
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

    if (mappedEntries.length === 0) {
      throw new Error('No placeholder mappings were provided. Map at least one DOCX or email placeholder before generation.');
    }

    const missingPlaceholders = requiredPlaceholders.filter((token) => !mappingByPlaceholder.has(token));
    if (missingPlaceholders.length > 0) {
      throw new Error(
        `Missing mappings for placeholders: ${missingPlaceholders.join(', ')}. Map these fields before generation.`,
      );
    }

    const workspaceRoot = getWorkspaceRoot();
    const generatorScriptPath = getGeneratorScriptPath();
    const emailOnlyGeneratorScriptPath = getEmailOnlyGeneratorScriptPath();
    const pythonPath = getPythonPath();
    const temporaryDir = await mkdtemp(join(tmpdir(), 'greeklit-run-'));
    const mappingPath = join(temporaryDir, 'field_mapping.txt');
    const emailTemplatePath = join(temporaryDir, 'email_template.txt');
    const configPath = join(temporaryDir, 'generator_config.json');
    const outputDir = resolveWorkspacePath(request.project.outputFolderPath);
    const workbookPath = resolveWorkspacePath(request.project.workbookPath);
    const contractTemplatePath = resolveWorkspacePath(request.project.contractTemplatePath);

    if (!existsSync(generatorScriptPath)) {
      throw new Error(`Generator script was not found at ${generatorScriptPath}.`);
    }

    if (!existsSync(emailOnlyGeneratorScriptPath)) {
      throw new Error(`Email generator script was not found at ${emailOnlyGeneratorScriptPath}.`);
    }

    if (!outputDir || !workbookPath) {
      throw new Error('Excel file and output folder are required before generation.');
    }

    if (wantsDocumentOutput && !contractTemplatePath) {
      throw new Error('Word template is required when generating Word or PDF files.');
    }

    const convertToPdf = request.generationOptions.generatePdf;
    const keepDocxOutput = request.generationOptions.generateDocx;
    const mappedPlaceholderNames = new Set(mappedEntries.map((entry) => entry.token));
    const rowIdentityPlaceholders = ['ID', 'APPLICATION_CODE', 'TITLE']
      .filter((placeholder) => mappedPlaceholderNames.has(placeholder))
      .slice(0, 1);
    const mappingContents = mappedEntries
      .map((entry) => `${entry.token}=${entry.column}`)
      .join('\n');

    const combinedEmailFilename = request.generationOptions.generateEmailDrafts
      ? 'email_drafts.txt'
      : '__skip_email_drafts.txt';

    const config = {
      attach_contract_to_eml: true,
      combined_email_filename: combinedEmailFilename,
      contract_output_subdir: 'contracts',
      contract_template_path: contractTemplatePath,
      convert_to_pdf: convertToPdf,
      data_start_row: request.project.dataStartRow,
      date_format: '%Y-%m-%d',
      email_output_subdir: 'emails',
      email_template_path: emailTemplatePath,
      filename_pattern: '{{APPLICATION_CODE}} - {{TITLE}} - {{LANGUAGE}}',
      header_row: request.project.headerRow,
      keep_docx_output: keepDocxOutput,
      libreoffice_path: 'C:/Program Files/LibreOffice/program/soffice.exe',
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

    try {
      await writeFile(mappingPath, `${mappingContents}\n`, 'utf8');
      await writeFile(emailTemplatePath, emailTemplateText, 'utf8');
      await writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');

      const command =
        !wantsDocumentOutput && request.generationOptions.generateEmailDrafts
          ? [
              emailOnlyGeneratorScriptPath,
              JSON.stringify({
                data_start_row: request.project.dataStartRow,
                email_template_text: emailTemplateText,
                mapping: Object.fromEntries(mappedEntries.map((entry) => [entry.token, entry.column])),
                output_dir: outputDir,
                workbook_path: workbookPath,
                worksheet_name: request.project.worksheetName,
              }),
            ]
          : [generatorScriptPath, '--config', configPath];

      const { stderr, stdout } = await execFileAsync(pythonPath, command, {
        cwd: workspaceRoot,
        windowsHide: true,
      });

      const combinedEmailPath = request.generationOptions.generateEmailDrafts
        ? parsePathLine(stdout, 'Combined email drafts file:') || join(outputDir, 'email_drafts.txt')
        : null;

      if (!request.generationOptions.generateEmailDrafts) {
        const hiddenEmailPath = join(outputDir, combinedEmailFilename);
        if (existsSync(hiddenEmailPath)) {
          await rm(hiddenEmailPath, { force: true });
        }
      }

      const result: GenerateProjectResult = {
        combinedEmailPath,
        contractsDir:
          parsePathLine(stdout, 'Contract DOCX directory:') || join(outputDir, 'contracts'),
        createdEntries: await collectOutputTree(outputDir),
        generatedCount: parseCount(stdout, 'Generated'),
        outputDir,
        pdfDir:
          parsePathLine(stdout, 'Contract PDF directory:') || join(outputDir, 'contracts_pdf'),
        reportPath: parsePathLine(stdout, 'Report:') || join(outputDir, 'generation_report.txt'),
        skippedCount: parseCount(stdout, 'Skipped'),
        stderr,
        stdout,
        warnings: stdout
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.startsWith('Warning:')),
      };

      return result;
    } finally {
      await rm(temporaryDir, { force: true, recursive: true });
    }
  },
);

ipcMain.handle('desktop-app:open-path', async (_event, request: OpenPathRequest) => {
  if (!request.targetPath) {
    return 'Path is required.';
  }

  const openError = await shell.openPath(resolveWorkspacePath(request.targetPath) ?? request.targetPath);
  return openError || null;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
