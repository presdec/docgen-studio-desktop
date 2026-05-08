import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { expect, test, _electron as electron } from '@playwright/test';
import electronBinary from 'electron';

type ElectronApp = Awaited<ReturnType<typeof electron.launch>>;
const repoRoot = fileURLToPath(new URL('..', import.meta.url));

const projectDocument = {
  activeStep: 1,
  emailTemplate: {
    body: '',
    cc: '',
    subject: 'Original subject',
    to: '',
  },
  generationOptions: {
    emailOutputMode: 'combined_docx',
    generateDocx: true,
    generateEmailDrafts: true,
    generatePdf: true,
  },
  project: {
    contractTemplatePath: '',
    dataStartRow: 2,
    emailTemplatePath: '',
    headerRow: 1,
    outputFilenamePattern: '',
    outputFolderPath: '',
    rejectionColumn: '',
    rejectionValue: '',
    useOptionalEmailSource: false,
    workbookPath: '',
    worksheetName: '',
  },
  tokenMappings: {},
  variableColumns: {},
  version: 1,
};

const starterProjectDocument = {
  ...projectDocument,
  emailTemplate: {
    body: 'Hello {{AUTHOR}},\n\nAbout {{TITLE}} and {{APPLICATION_CODE}}.',
    cc: '',
    subject: 'Contract {{APPLICATION_CODE}}',
    to: '{{EMAIL_TO}}',
  },
  generationOptions: {
    ...projectDocument.generationOptions,
    generateDocx: true,
    generateEmailDrafts: true,
    generatePdf: false,
  },
  project: {
    ...projectDocument.project,
    contractTemplatePath: join(repoRoot, 'templates', 'starter-contract-template.docx'),
    dataStartRow: 3,
    headerRow: 2,
    outputFilenamePattern: '{{APPLICATION_CODE}} - {{TITLE}}',
    workbookPath: join(repoRoot, 'templates', 'starter-workbook.xlsx'),
  },
  tokenMappings: {
    AMOUNT: 'AMOUNT',
    APPLICATION_CODE: 'APPLICATION_CODE',
    AUTHOR: 'AUTHOR',
    FIRST_INSTALLMENT: 'FIRST_INSTALLMENT',
    LANGUAGE: 'LANGUAGE',
    PUBLISHER: 'PUBLISHER',
    TITLE: 'TITLE',
  },
  variableColumns: {
    B: 'APPLICATION_CODE',
    C: 'TITLE',
    D: 'AUTHOR',
    E: 'LANGUAGE',
    F: 'PUBLISHER',
    G: 'EMAIL_TO',
    I: 'AMOUNT',
    J: 'FIRST_INSTALLMENT',
  },
};

async function launchApp() {
  const launchEnv = { ...process.env };
  delete launchEnv.ELECTRON_RUN_AS_NODE;
  const userDataDir = await mkdtemp(join(tmpdir(), 'docgen-user-data-'));

  const app = await electron.launch({
    args: ['.', `--user-data-dir=${userDataDir}`],
    env: launchEnv,
    executablePath: electronBinary,
  });

  let window = null;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    window = app.windows().find((candidate) => !candidate.url().startsWith('devtools://')) ?? null;
    if (window) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  expect(window).not.toBeNull();
  if (!window) {
    await app.close();
    throw new Error('App window did not appear.');
  }

  await window.waitForLoadState('networkidle');
  await window.waitForFunction(() => typeof window.desktopApp?.saveProject === 'function');
  return { app, window };
}

async function closeApp(app: ElectronApp) {
  try {
    await app.close();
  } catch {
    return;
  }
}

async function clickFileMenuItem(app: ElectronApp, label: string) {
  await app.evaluate(({ BrowserWindow, Menu }, itemLabel) => {
    const item = Menu.getApplicationMenu()
      ?.items.find((menuItem) => menuItem.label === 'File')
      ?.submenu?.items.find((menuItem) => menuItem.label === itemLabel);

    if (!item) {
      throw new Error(`File menu item not found: ${itemLabel}`);
    }

    item.click(undefined, BrowserWindow.getFocusedWindow() ?? undefined, undefined);
  }, label);
}

async function getFileMenuSnapshot(app: ElectronApp) {
  return app.evaluate(({ Menu }) => {
    const fileMenu = Menu.getApplicationMenu()?.items.find((item) => item.label === 'File');
    return fileMenu?.submenu?.items.map((item) => ({
      accelerator: item.accelerator ?? null,
      label: item.label,
      submenu: item.submenu?.items.map((child) => ({
        enabled: child.enabled,
        label: child.label,
      })) ?? null,
    })) ?? [];
  });
}

async function clickRecentProjectMenuItem(app: ElectronApp, label: string) {
  await app.evaluate(({ BrowserWindow, Menu }, itemLabel) => {
    const item = Menu.getApplicationMenu()
      ?.items.find((menuItem) => menuItem.label === 'File')
      ?.submenu?.items.find((menuItem) => menuItem.label === 'Open Recent')
      ?.submenu?.items.find((menuItem) => menuItem.label === itemLabel);

    if (!item) {
      throw new Error(`Recent project menu item not found: ${itemLabel}`);
    }

    item.click(undefined, BrowserWindow.getFocusedWindow() ?? undefined, undefined);
  }, label);
}

async function openProjectThroughRecentMenu(
  app: ElectronApp,
  window: Awaited<ReturnType<ElectronApp['firstWindow']>>,
  projectPath: string,
  document: typeof projectDocument,
) {
  await writeFile(projectPath, JSON.stringify(document, null, 2), 'utf8');
  await window.evaluate(
    async ({ filePath, project }) => window.desktopApp.saveProject(project, filePath),
    { filePath: projectPath, project: document },
  );
  await clickRecentProjectMenuItem(app, projectPath.split(/[\\/]/).at(-1) ?? projectPath);
}

test('File menu exposes quick save, save as, and open last shortcuts', async () => {
  const { app } = await launchApp();

  try {
    const fileMenuItems = await getFileMenuSnapshot(app);

    expect(fileMenuItems).toEqual(expect.arrayContaining([
      { accelerator: 'CmdOrCtrl+O', label: 'Open Project', submenu: null },
      { accelerator: 'F9', label: 'Open Last Project', submenu: null },
      { accelerator: null, label: 'Open Recent', submenu: [{ enabled: false, label: 'No Recent Projects' }] },
      { accelerator: 'F5', label: 'Save Project', submenu: null },
      { accelerator: 'CmdOrCtrl+Shift+S', label: 'Save Project As', submenu: null },
    ]));
  } finally {
    await closeApp(app);
  }
});

test('desktop project bridge can quick-save and reopen an explicit project path', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'docgen-project-'));
  const projectPath = join(tempDir, 'project.json');
  const { app, window } = await launchApp();

  try {
    const savedPath = await window.evaluate(
      async ({ document, filePath }) => window.desktopApp.saveProject(document, filePath),
      { document: projectDocument, filePath: projectPath },
    );

    expect(savedPath).toBe(projectPath);
    await expect(async () => {
      const saved = JSON.parse(await readFile(projectPath, 'utf8'));
      expect(saved.emailTemplate.subject).toBe('Original subject');
    }).toPass();

    const updatedDocument = {
      ...projectDocument,
      emailTemplate: {
        ...projectDocument.emailTemplate,
        subject: 'Quick-saved subject',
      },
    };

    const quickSavedPath = await window.evaluate(
      async ({ document, filePath }) => window.desktopApp.saveProject(document, filePath),
      { document: updatedDocument, filePath: projectPath },
    );

    expect(quickSavedPath).toBe(projectPath);

    const opened = await window.evaluate(
      async (filePath) => window.desktopApp.openProject(filePath),
      projectPath,
    );

    expect(opened?.filePath).toBe(projectPath);
    expect(opened?.projectDocument.emailTemplate.subject).toBe('Quick-saved subject');
  } finally {
    await closeApp(app);
  }
});

test('desktop bridge extracts placeholders from txt and docx email templates', async () => {
  const { app, window } = await launchApp();

  try {
    const textTemplate = await window.evaluate(
      async (templatePath) => window.desktopApp.inspectEmailTemplate({ templatePath }),
      join(repoRoot, 'templates', 'starter-email-template.txt'),
    );
    const docxTemplate = await window.evaluate(
      async (templatePath) => window.desktopApp.inspectEmailTemplate({ templatePath }),
      join(repoRoot, 'templates', 'starter-contract-template.docx'),
    );

    expect(textTemplate.variables).toEqual(expect.arrayContaining([
      'APPLICATION_CODE',
      'AUTHOR',
      'TITLE',
    ]));
    expect(docxTemplate.variables).toEqual(expect.arrayContaining([
      'AMOUNT',
      'APPLICATION_CODE',
      'AUTHOR',
      'TITLE',
    ]));
  } finally {
    await closeApp(app);
  }
});

test('File menu opens the remembered project and quick-saves the current setup', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'docgen-last-project-'));
  const projectPath = join(tempDir, 'last-project.json');
  await writeFile(projectPath, JSON.stringify(projectDocument, null, 2), 'utf8');

  const { app, window } = await launchApp();

  try {
    await window.evaluate((filePath) => {
      window.localStorage.setItem('greeklit.lastProjectPath', filePath);
      window.location.reload();
    }, projectPath);
    await window.waitForLoadState('networkidle');

    await clickFileMenuItem(app, 'Open Last Project');
    await expect(window.getByText(`Project file: ${projectPath}`)).toBeVisible();

    await window.getByRole('checkbox', { name: 'PDF files' }).click();
    await expect(window.getByRole('checkbox', { name: 'PDF files' })).not.toBeChecked();
    await clickFileMenuItem(app, 'Save Project');

    await expect(async () => {
      const saved = JSON.parse(await readFile(projectPath, 'utf8'));
      expect(saved.generationOptions.generatePdf).toBe(false);
    }).toPass();
  } finally {
    await closeApp(app);
  }
});

test('File menu keeps a true recent projects list', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'docgen-recent-projects-'));
  const firstPath = join(tempDir, 'first-project.json');
  const secondPath = join(tempDir, 'second-project.json');
  const { app, window } = await launchApp();

  try {
    await window.evaluate(
      async ({ document, filePath }) => window.desktopApp.saveProject(document, filePath),
      {
        document: {
          ...projectDocument,
          emailTemplate: { ...projectDocument.emailTemplate, subject: 'First recent project' },
        },
        filePath: firstPath,
      },
    );
    await window.evaluate(
      async ({ document, filePath }) => window.desktopApp.saveProject(document, filePath),
      {
        document: {
          ...projectDocument,
          emailTemplate: { ...projectDocument.emailTemplate, subject: 'Second recent project' },
        },
        filePath: secondPath,
      },
    );

    const fileMenuItems = await getFileMenuSnapshot(app);
    const recentMenu = fileMenuItems.find((item) => item.label === 'Open Recent')?.submenu ?? [];
    expect(recentMenu.slice(0, 2)).toEqual([
      { enabled: true, label: 'second-project.json' },
      { enabled: true, label: 'first-project.json' },
    ]);

    await clickRecentProjectMenuItem(app, 'first-project.json');
    await expect(window.getByText(`Project file: ${firstPath}`)).toBeVisible();

    const recentProjects = await window.evaluate(() => window.desktopApp.getRecentProjects());
    expect(recentProjects.map((project) => project.filePath).slice(0, 2)).toEqual([
      firstPath,
      secondPath,
    ]);
  } finally {
    await closeApp(app);
  }
});

test('Workbook mapping dock exposes sizing, filters, usage, and required coverage', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'docgen-mapping-ux-'));
  const projectPath = join(tempDir, 'mapping-workflow.json');
  const { app, window } = await launchApp();

  try {
    await openProjectThroughRecentMenu(app, window, projectPath, {
      ...starterProjectDocument,
      activeStep: 2,
      project: {
        ...starterProjectDocument.project,
        outputFolderPath: tempDir,
      },
    });

    await expect(window.getByRole('heading', { name: 'Workbook Mapping Preview' })).toBeVisible();
    // Wait for the workbook backend to return actual column data before checking
    // header-match and suggestion state (zero-count text renders before the
    // Python inspect call completes, so these badges alone are not a reliable guard).
    // CI cold-start can take 20+ seconds, so use a 30s timeout here.
    await expect(window.getByTestId('workbook-column-letter').first()).toBeVisible({ timeout: 30000 });
    await expect(window.getByText(/required mapped/)).toBeVisible();
    await expect(window.getByText(/header matches assigned/)).toBeVisible();
    await expect(window.getByRole('button', { name: 'Use suggested variable APPLICATION_CODE' }).first()).toBeVisible();

    await expect(window.getByText('Compact')).toBeVisible();
    await expect(window.getByRole('radio', { name: 'Half' })).toBeChecked();
    await window.getByText('Full').click();
    await expect(window.getByRole('radio', { name: 'Full' })).toBeChecked();

    await expect(window.getByText('Required', { exact: true })).toBeVisible();
    await window.getByText('Filename', { exact: true }).first().click();
    await expect(window.getByRole('radio', { name: 'Filename' })).toBeChecked();
    await expect(window.getByText('APPLICATION_CODE').first()).toBeVisible();
    await expect(window.getByText('Filename').first()).toBeVisible();
    await expect(window.getByText('Word').first()).toBeVisible();
    await expect(window.getByText('Email').first()).toBeVisible();

    await window.getByText('All', { exact: true }).click();
    await expect(window.getByTestId('workbook-column-letter').first()).toHaveText('A');
    const visibleColumns = await window.getByTestId('workbook-column-letter').evaluateAll((cells) =>
      cells.slice(0, 5).map((cell) => cell.textContent?.trim()),
    );
    expect(visibleColumns).toEqual(['A', 'B', 'C', 'D', 'E']);
  } finally {
    await closeApp(app);
  }
});

test('Review step groups output, mapping, workbook, and email summaries', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'docgen-review-ux-'));
  const projectPath = join(tempDir, 'review-workflow.json');
  const { app, window } = await launchApp();

  try {
    await openProjectThroughRecentMenu(app, window, projectPath, {
      ...starterProjectDocument,
      activeStep: 4,
      project: {
        ...starterProjectDocument.project,
        outputFolderPath: tempDir,
      },
    });

    await expect(window.getByRole('heading', { name: 'Ready To Generate' })).toBeVisible();
    await expect(window.getByText('Output plan')).toBeVisible();
    await expect(window.getByText('Mapping coverage')).toBeVisible();
    await expect(window.getByText('Workbook source')).toBeVisible();
    await expect(window.getByText('Email source')).toBeVisible();
    await expect(window.getByText(/Word \d+\/\d+/)).toBeVisible();
    await expect(window.getByText(/Email \d+\/\d+/)).toBeVisible();
    await expect(window.getByText(/Filename \d+\/\d+/)).toBeVisible();
    await expect(window.getByText(/required mapped/)).toBeVisible();
  } finally {
    await closeApp(app);
  }
});
