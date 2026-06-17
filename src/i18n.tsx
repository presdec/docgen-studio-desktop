import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'en' | 'el';

type Translation = {
  language: {
    english: string;
    greek: string;
    label: string;
  };
  sidebar: {
    desktopMvp: string;
    title: string;
    description: string;
    workflowProgress: string;
    stepOf: (current: number, total: number) => string;
  };
  steps: Record<1 | 2 | 3 | 4, { description: string; nextHint: string; title: string }>;
  app: {
    back: string;
    continueTo: string;
    couldNotLoadWorkbookPreview: string;
    couldNotSaveExampleTemplate: string;
    desktopBridgeUnavailableBody: string;
    desktopBridgeUnavailableTitle: string;
    emailTemplateRequiredBody: string;
    generationCompleteSummary: (generated: number, skipped: number) => string;
    generationCompleteTitle: string;
    generationFailedTitle: string;
    generationStatusTitle: string;
    generating: string;
    generatingNow: string;
    keyboardShortcuts: string;
    loadProject: string;
    mapAllFieldsTitle: string;
    missingEmailMappings: (fields: string) => string;
    missingWordMappings: (fields: string) => string;
    openRecentProject: string;
    outputFilenamePatternRequiredBody: string;
    outputFolderRequiredBody: string;
    outputFolderRequiredTitle: string;
    outputsRequiredBody: string;
    projectFileLabel: string;
    saveDraftSetup: string;
    shortcutsTitle: string;
    wordTemplateRequiredBody: string;
    wordTemplateRequiredTitle: string;
    workbookRequiredBody: string;
  };
  shortcuts: {
    generateNow: string;
    openLastProject: string;
    openProject: string;
    openWordTemplate: string;
    reloadFields: string;
    saveProject: string;
    saveProjectAs: string;
  };
  generationProgress: {
    cancel: string;
    docxFiles: string;
    emailDrafts: string;
    elapsed: (seconds: number) => string;
    generatedRecords: string;
    inProgress: string;
    outputTargets: string;
    pdfFiles: string;
    running: string;
    rowsFound: string;
    selectedOutput: string;
    skippedRows: string;
    stage: string;
    workingOn: (current: number, total: number) => string;
    wordMappings: (mapped: number, total: number) => string;
  };
  outputLabels: {
    email: string;
    none: string;
    pdf: string;
    word: string;
  };
  stepList: {
    current: string;
    ready: string;
  };
  projectSetup: {
    badge: string;
    dataStartRow: string;
    dataStartRowDesc: string;
    emailDrafts: string;
    emailOutputModeCombinedDocx: string;
    emailOutputModeDesc: string;
    emailOutputModeDescNoMsg: string;
    emailOutputModeLabel: string;
    emailOutputModeSeparateDocx: string;
    emailOutputModeSeparateEml: string;
    emailOutputModeSeparateMsg: string;
    emailOutputModeSeparateMsgWithDocx: string;
    emailOutputModeSeparateMsgWithPdf: string;
    emailFileDesc: string;
    emailFileLabel: string;
    emailFilePlaceholder: string;
    emailSummary: (fields: number) => string;
    excelDesc: string;
    excelLabel: string;
    excelPlaceholder: string;
    headerRow: string;
    headerRowDesc: string;
    headerRowWarningBody: (
      selectedRow: number,
      selectedCount: number,
      suggestedRow: number,
      suggestedCount: number,
    ) => string;
    headerRowWarningTitle: string;
    optionalEmailSource: string;
    optionalEmailSourceDesc: string;
    outputFolderDesc: string;
    outputFolderLabel: string;
    outputFolderPlaceholder: string;
    outputSummary: string;
    outputFilenamePatternDesc: string;
    outputFilenamePatternLabel: string;
    outputFilenamePatternPlaceholder: string;
    pdfFiles: string;
    previewFields: string;
    rejectionColumn: string;
    rejectionColumnDesc: string;
    rejectionColumnPlaceholder: string;
    rejectionValue: string;
    rejectionValueDesc: string;
    rejectionValuePlaceholder: string;
    title: string;
    subtitle: string;
    setupWorkbook: string;
    whatGenerate: string;
    whatGenerateDesc: string;
    wordDesc: string;
    wordFiles: string;
    wordLabel: string;
    wordPlaceholder: string;
    wordSummary: (fields: number) => string;
    workbookSummary: (
      headerRow: number,
      dataStartRow: number,
      rowsFound: number,
      columnsFound: number,
    ) => string;
    worksheet: string;
    worksheetDesc: string;
    worksheetPlaceholder: string;
    useSuggestedHeaderRow: (row: number) => string;
    downloadExcelExample: string;
    downloadWordExample: string;
    downloadEmailExample: string;
  };
  contractMapping: {
    badgeMapped: (mapped: number, total: number) => string;
    context: string;
    noContextBody: string;
    noContextTitle: string;
    noPlaceholdersBody: string;
    noPlaceholdersTitle: string;
    openTemplate: string;
    originalParagraph: string;
    paragraphPreviewTitle: string;
    reloadFields: string;
    renderedParagraph: string;
    showParagraph: string;
    sourceColumn: string;
    sampleValue: string;
    tokenWithSample: (sample: string) => string;
    tokenWithoutSample: string;
    workbookVariable: string;
    wordField: string;
    chooseVariable: string;
    mappingPreviewDesc: string;
    mappingPreviewTitle: string;
    outputFilenamePatternDesc: string;
    outputFilenamePatternLabel: string;
    outputFilenamePatternPlaceholder: string;
    outputFilenamePatternMissingBody: string;
    outputFilenamePatternPreviewLabel: string;
    outputFilenamePatternRequiredBody: string;
  };
  emailBuilder: {
    activeTarget: (target: string) => string;
    body: string;
    bodyDesc: string;
    cc: string;
    ccDesc: string;
    invalidEmailAddress: string;
    modifierHint: string;
    modifierLabels: {
      none: string;
      upper: string;
      lower: string;
      title: string;
      trim: string;
      ordinal: string;
    };
    subtitle: string;
    subject: string;
    subjectDesc: string;
    title: string;
    to: string;
    toDesc: string;
  };
  externalEmailTemplate: {
    badge: string;
    file: string;
    loadErrorTitle: string;
    loading: string;
    noVariables: string;
    preview: string;
    subtitle: string;
    title: string;
    variables: string;
  };
  templatePreview: {
    badge: string;
    cc: string;
    subject: string;
    subtitle: string;
    title: string;
    to: string;
  };
  workbookPreview: {
    badgeColumns: (count: number) => string;
    chooseVariable: string;
    column: string;
    filterAll: string;
    filterMissing: string;
    filterRequired: string;
    firstRowValue: string;
    guidanceLines: string[];
    guidanceTitle: string;
    hideGuidance: string;
    headerMatched: (count: number) => string;
    header: string;
    modeCompact: string;
    modeFull: string;
    modeHalf: string;
    previewUnavailable: string;
    refreshing: string;
    requiredSummary: (mapped: number, total: number) => string;
    selectedVariable: string;
    subtitle: string;
    suggestedVariable: string;
    showGuidance: string;
    title: string;
    usedBy: string;
    usedByBoth: string;
    usedByContract: string;
    usedByEmail: string;
    usedByFilename: string;
    usedByNone: string;
    usedByWord: string;
    useSuggestedVariable: (variable: string) => string;
  };
  review: {
    badge: string;
    checksPassSummary: (passed: number, total: number) => string;
    emailBodyLength: string;
    emailCoverage: (mapped: number, total: number) => string;
    emailSource: string;
    filenameCoverage: (mapped: number, total: number) => string;
    fixIssue: string;
    goodToGenerateBody: string;
    goodToGenerateTitle: string;
    hideDetails: string;
    issuesFound: (count: number) => string;
    mappingCoverage: string;
    mappedColumns: string;
    mappedWordFields: string;
    missingRequiredVariables: string;
    needsAttentionBody: string;
    needsAttentionTitle: string;
    noMissingRequiredVariables: string;
    outputPlan: string;
    pdfBackend: string;
    preflightLoadingBody: string;
    preflightLoadingTitle: string;
    requiredMappedSummary: (mapped: number, total: number) => string;
    rowsFound: string;
    selectedOutput: string;
    setupCheck: string;
    showDetails: string;
    skippedRows: string;
    subtitle: string;
    statusFail: string;
    statusPass: string;
    statusWarn: string;
    title: string;
    workbookSource: string;
    wordCoverage: (mapped: number, total: number) => string;
  };
  setupPreview: {
    badge: string;
    fieldsFoundInWord: string;
    loadCheck: string;
    noTemplateFields: string;
    mergedTitleHint: string;
    populatedCells: string;
    previewUnavailable: string;
    quickCheck: string;
    quickCheckDesc: (rows: number) => string;
    refreshing: string;
    roleData: string;
    roleSelectedHeader: string;
    roleSuggestedHeader: string;
    row: string;
    rowType: string;
    subtitle: string;
    wordTemplateNotSelected: string;
  };
  workbookSetupModal: {
    dataLegend: string;
    description: string;
    heading: string;
    mergedTitleHint: string;
    noRejectedPreviewMatch: string;
    rejectedLegend: string;
    selectedHeaderLegend: string;
    saveSettings: string;
    suggestedHeaderLegend: string;
    title: string;
  };
  templateInspection: {
    context: string;
    emailDescription: string;
    emailTitle: string;
    field: string;
    noContext: string;
    noFieldsBody: string;
    noFieldsTitle: string;
    wordDescription: string;
    saveSettings: string;
    wordTitle: string;
  };
  success: {
    createdFiles: string;
    docxFiles: string;
    emailDrafts: string;
    finishingBody: string;
    finishingTitle: string;
    generatedRecords: string;
    generationComplete: string;
    hideSkippedDetails: string;
    noFilesYet: string;
    open: string;
    openDrafts: string;
    openOutputFolder: string;
    openReport: string;
    outputMetrics: string;
    pdfFiles: string;
    resultTree: string;
    rowsFound: string;
    showSkippedDetails: string;
    skippedRowEntry: (row: number, reason: string) => string;
    skippedRowsDetail: string;
    startAgain: string;
    subtitle: string;
    skippedRows: string;
    summary: (generated: number, skipped: number) => string;
    warningsTitle: string;
  };
  fileField: {
    browse: string;
    clear: string;
    downloadExample: string;
  };
};

const translations: Record<Language, Translation> = {
  en: {
    language: {
      english: 'English',
      greek: 'Greek',
      label: 'Language',
    },
    sidebar: {
      desktopMvp: 'DocGen Studio',
      title: 'DocGen Studio',
      description:
        'Turn your Excel spreadsheet and Word template into hundreds of personalised documents, PDFs, and email drafts — runs entirely on your computer, no cloud, no subscription, no data leaving your desk.',
      workflowProgress: 'Workflow progress',
      stepOf: (current, total) => `Step ${current} of ${total}`,
    },
    steps: {
      1: {
        title: 'Setup',
        description: 'Pick your Excel source, Word template, and output folder.',
        nextHint: 'Next step adapts to the output types you selected.',
      },
      2: {
        title: 'Template & Mapping',
        description: 'Map Word placeholders to Excel columns and set the filename pattern.',
        nextHint: 'Next: build or review the email template.',
      },
      3: {
        title: 'Email Builder',
        description: 'Write the email template and preview it per recipient.',
        nextHint: 'Next: run a preflight check before generating.',
      },
      4: {
        title: 'Review & Generate',
        description: 'Run preflight checks then generate all files in one run.',
        nextHint: 'Tip: save the project file to reuse this setup.',
      },
    },
    app: {
      desktopBridgeUnavailableTitle: 'Desktop bridge unavailable',
      desktopBridgeUnavailableBody:
        'The Electron preload bridge did not load, so the desktop UI cannot access file dialogs yet.',
      generationCompleteSummary: (generated, skipped) =>
        `Generated ${generated} records and skipped ${skipped}. Open the report and output tree below to review results.`,
      generationCompleteTitle: 'Generation complete',
      generationFailedTitle: 'Generation failed',
      generationStatusTitle: 'Generation status',
      generating: 'Generating...',
      generatingNow: 'Generate Now',
      keyboardShortcuts: 'Keyboard Shortcuts',
      mapAllFieldsTitle: 'Map all fields before review',
      missingEmailMappings: (fields) => `Email fields missing workbook assignment: ${fields}.`,
      missingWordMappings: (fields) => `Word fields missing mapping: ${fields}. `,
      loadProject: 'Load Project',
      openRecentProject: 'Open Project Setup',
      outputsRequiredBody: 'Choose at least one output type before continuing.',
      saveDraftSetup: 'Save Draft Project',
      couldNotSaveExampleTemplate: 'Could not save example template',
      couldNotLoadWorkbookPreview: 'Could not load workbook preview',
      projectFileLabel: 'Project file',
      back: 'Back',
      continueTo: 'Continue To',
      wordTemplateRequiredTitle: 'Word template required',
      wordTemplateRequiredBody: 'Word template required for DOCX/PDF output.',
      emailTemplateRequiredBody: 'Email template file required.',
      outputFolderRequiredTitle: 'Output folder required',
      outputFolderRequiredBody: 'Output folder required.',
      outputFilenamePatternRequiredBody: 'Please fill in the DOCX/PDF filename pattern.',
      shortcutsTitle: 'Keyboard Shortcuts',
      workbookRequiredBody: 'Excel workbook required.',
    },
    shortcuts: {
      generateNow: 'Generate Now',
      openLastProject: 'Open Last Project',
      openProject: 'Open Project',
      openWordTemplate: 'Open Word Template',
      reloadFields: 'Reload Fields',
      saveProject: 'Save Project',
      saveProjectAs: 'Save Project As',
    },
    generationProgress: {
      cancel: 'Cancel',
      docxFiles: 'DOCX files',
      emailDrafts: 'Email drafts',
      elapsed: (seconds) => `${seconds}s elapsed`,
      generatedRecords: 'Generated records',
      inProgress: 'Generation in progress',
      outputTargets: 'Output targets',
      pdfFiles: 'PDF files',
      running: 'Running...',
      rowsFound: 'Rows found',
      selectedOutput: 'Selected output',
      skippedRows: 'Skipped rows',
      stage: 'Stage',
      workingOn: (current, total) => `Working on ${current}/${total}`,
      wordMappings: (mapped, total) => `Word mappings: ${mapped}/${total}`,
    },
    outputLabels: {
      word: 'Word (.docx)',
      pdf: 'PDF',
      email: 'Email drafts',
      none: 'Nothing selected',
    },
    stepList: {
      current: 'Current',
      ready: 'Ready',
    },
    projectSetup: {
      badge: 'Foundation',
      dataStartRow: 'Data Start Row',
      dataStartRowDesc: 'The row where your first real data entry begins — typically one row below the header.',
      emailDrafts: 'Email drafts',
      emailOutputModeCombinedDocx: 'One combined DOCX file',
      emailOutputModeDesc: 'Choose whether email drafts are exported as DOCX, EML, or Outlook MSG files.',
      emailOutputModeDescNoMsg: 'Choose whether email drafts are exported as DOCX or EML files. Outlook MSG output is not available on this system.',
      emailOutputModeLabel: 'Email draft output mode',
      emailOutputModeSeparateDocx: 'Separate DOCX files',
      emailOutputModeSeparateEml: 'Separate EML files',
      emailOutputModeSeparateMsg: 'Separate Outlook MSG files',
      emailOutputModeSeparateMsgWithDocx: 'Separate Outlook MSG files (with DOCX attachment)',
      emailOutputModeSeparateMsgWithPdf: 'Separate Outlook MSG files (with PDF attachment)',
      emailFileDesc: 'Choose a text or Word file used as the email template source.',
      emailFileLabel: 'Email Template File',
      emailFilePlaceholder: 'Select template file (.txt, .docx)',
      emailSummary: (fields) => `${fields} email field${fields === 1 ? '' : 's'} found`,
      excelDesc: 'Your workbook provides the data — one row becomes one document. Each column header becomes a variable you can use.',
      excelLabel: 'Excel File',
      excelPlaceholder: 'Select Excel file (.xlsx)',
      headerRow: 'Header Row',
      headerRowDesc: 'The row number where your column titles live (e.g. Name, Email, Date). Usually row 1.',
      headerRowWarningBody: (selectedRow, selectedCount, suggestedRow, suggestedCount) =>
        `Row ${selectedRow} has ${selectedCount} header cells, but row ${suggestedRow} has ${suggestedCount}. Check the load preview below; row ${suggestedRow} is probably the real header row.`,
      headerRowWarningTitle: 'Header row may be wrong',
      optionalEmailSource: 'Use an existing email template file',
      optionalEmailSourceDesc:
        "Leave this off to compose emails directly inside the app — it's simpler. Turn it on only if you have an existing .txt or .docx email template you want to reuse.",
      outputFolderDesc:
        'Choose where generated DOCX, PDF, drafts, and reports should be written.',
      outputFolderLabel: 'Output Folder',
      outputFolderPlaceholder: 'Select output folder',
      outputSummary: 'Output folder selected',
      outputFilenamePatternDesc:
        'Controls DOCX/PDF file names. Use placeholders like {{APPLICATION_ID}} or plain text to avoid extra required mappings.',
      outputFilenamePatternLabel: 'Output Filename Pattern',
      outputFilenamePatternPlaceholder: '{{APPLICATION_CODE}} - {{TITLE}}',
      pdfFiles: 'PDF files',
      previewFields: 'Preview fields',
      rejectionColumn: 'Reject Rows By',
      rejectionColumnDesc: 'Optional column used to skip rows before generation.',
      rejectionColumnPlaceholder: 'No rejection rule',
      rejectionValue: 'Reject Value',
      rejectionValueDesc: 'Rows where the selected column exactly equals this value will be skipped.',
      rejectionValuePlaceholder: 'Choose value to reject',
      title: 'Project Setup',
      subtitle:
        'Point the app at your Excel workbook, Word template, and output folder. Choose what to generate and it adapts automatically.',
      setupWorkbook: 'Setup workbook',
      whatGenerate: 'What do you want to generate?',
      whatGenerateDesc: "Pick everything you want. Steps will show only what's relevant to your choices.",
      wordDesc: 'Your Word template drives the layout. Add {{PLACEHOLDERS}} in double braces wherever workbook values should appear.',
      wordFiles: 'Word files (.docx)',
      wordLabel: 'Word Template',
      wordPlaceholder: 'Select Word template (.docx)',
      wordSummary: (fields) => `${fields} Word field${fields === 1 ? '' : 's'} found`,
      workbookSummary: (headerRow, dataStartRow, rowsFound, columnsFound) =>
        `Header row ${headerRow}; data starts row ${dataStartRow}; ${rowsFound} rows found; ${columnsFound} columns`,
      worksheet: 'Worksheet Name',
      worksheetDesc: 'Sheet name to read from your workbook.',
      worksheetPlaceholder: 'Select worksheet',
      useSuggestedHeaderRow: (row) => `Use row ${row}`,
      downloadExcelExample: 'Download example Excel file',
      downloadWordExample: 'Download example Word template',
      downloadEmailExample: 'Download example email template',
    },
    contractMapping: {
      badgeMapped: (mapped, total) => `${mapped} / ${total} mapped`,
      context: 'Context',
      noContextBody:
        'This token was found in the Word file, but the app could not extract a paragraph around it.',
      noContextTitle: 'No paragraph context found',
      noPlaceholdersBody:
        'No {{PLACEHOLDERS}} were found in the Word template. Open it, add placeholders in double braces like {{NAME}} or {{DATE}}, save it, then click Reload fields. If you selected the wrong file, replace it in Project Setup.',
      noPlaceholdersTitle: 'No Word placeholders found',
      openTemplate: 'Open template',
      originalParagraph: 'Original paragraph',
      paragraphPreviewTitle: 'Template paragraph preview',
      reloadFields: 'Reload fields',
      renderedParagraph: 'Rendered with sample value',
      showParagraph: 'Show paragraph',
      sourceColumn: 'Source column',
      sampleValue: 'Sample value',
      tokenWithSample: (sample) => ` with sample value "${sample}"`,
      tokenWithoutSample: ' (no mapped sample value yet)',
      workbookVariable: 'Workbook variable',
      wordField: 'Word field',
      chooseVariable: 'Choose variable',
      mappingPreviewDesc:
        'Each {{PLACEHOLDER}} in your Word template needs a matching Excel column. Assign them below. Fields shown in yellow still need a column.',
      mappingPreviewTitle: 'Template Mapping Preview',
      outputFilenamePatternDesc:
        'Name the output files. Use plain text and/or {{COLUMN_NAME}} placeholders — e.g. {{LAST_NAME}} - Application. A preview shows the pattern with real sample values.',
      outputFilenamePatternLabel: 'DOCX/PDF Filename Pattern',
      outputFilenamePatternPlaceholder: '{{APPLICATION_CODE}} - {{TITLE}} - {{LANGUAGE}}',
      outputFilenamePatternMissingBody: 'Assign workbook variables for:',
      outputFilenamePatternPreviewLabel: 'Preview:',
      outputFilenamePatternRequiredBody: 'Enter a filename pattern to continue.',
    },
    emailBuilder: {
      activeTarget: (target) => `Active target: ${target}`,
      body: 'Body',
      bodyDesc: 'Write the email body. Click anywhere in this editor, then insert fields from above. Each row in your workbook generates one email.',
      cc: 'Cc',
      ccDesc: 'Optional CC addresses — leave blank if not needed.',
      invalidEmailAddress: 'This doesn\'t look like a valid email address.',
      modifierHint: 'Tip: use the ▾ arrow on each field chip to apply a modifier — e.g. {{NAME|upper}} → JOHN, {{PERIOD|ordinal}} → 1st.',
      modifierLabels: {
        none: 'No modifier',
        upper: 'UPPERCASE',
        lower: 'lowercase',
        title: 'Title Case',
        trim: 'Trim spaces',
        ordinal: 'Ordinal (1st, 2nd…) — English only',
      },
      subtitle: 'Compose your email template. Click a workbook field chip above to insert it at your cursor — works in To, Subject, Cc, and Body.',
      subject: 'Subject',
      subjectDesc: 'Your email subject. Click here first, then insert fields from above.',
      title: 'Email Template Builder',
      to: 'To',
      toDesc: 'The recipient\'s address. Insert {{EMAIL}} or another column to personalise per row.',
    },
    externalEmailTemplate: {
      badge: 'External File',
      file: 'Template file',
      loadErrorTitle: 'Could not load external email template',
      loading: 'Loading',
      noVariables: 'No placeholders found in this file.',
      preview: 'Preview with sample row',
      subtitle:
        'This file will be used during generation. Review detected placeholders and map them to workbook columns below.',
      title: 'External Email Template',
      variables: 'Detected placeholders',
    },
    templatePreview: {
      badge: 'Live Render',
      cc: 'Cc',
      subject: 'Subject',
      subtitle: 'Rendered using your sample row so you can validate templates before bulk generation.',
      title: 'Sample Render Preview',
      to: 'To',
    },
    workbookPreview: {
      badgeColumns: (count) => `${count} columns`,
      chooseVariable: 'Choose variable',
      column: 'Column',
      filterAll: 'All',
      filterMissing: 'Missing',
      filterRequired: 'Required',
      firstRowValue: 'First row value',
      guidanceLines: [
        'Each row represents one workbook column. Compare the header and first-row value to confirm what data is in that column.',
        'Use Suggested when the detected variable is correct, or choose a different variable from Selected variable.',
        'Focus on Required and Missing first. Used by shows whether the variable feeds Word fields, email fields, or generated file names.',
        'For a filename-only field, type {{ANY_CAPS_WORD}} in the filename pattern, then type that variable here and click Create to add it.',
      ],
      guidanceTitle: 'How to use this preview',
      hideGuidance: 'Hide help',
      headerMatched: (count) => `${count} header matches assigned`,
      header: 'Header',
      modeCompact: 'Compact',
      modeFull: 'Full',
      modeHalf: 'Half',
      previewUnavailable: 'Preview unavailable',
      refreshing: 'Refreshing workbook mapping preview...',
      requiredSummary: (mapped, total) => `${mapped}/${total} required mapped`,
      selectedVariable: 'Selected variable',
      subtitle:
        'Each row in your workbook becomes one document. Assign a variable name to each column you want to use in your templates.',
      suggestedVariable: 'Suggested',
      showGuidance: 'Show help',
      title: 'Workbook Mapping Preview',
      usedBy: 'Used by',
      usedByBoth: '[WORD Field] + Email',
      usedByContract: '[WORD Field]',
      usedByEmail: 'Email',
      usedByFilename: 'Filename',
      usedByNone: 'None',
      usedByWord: 'Word',
      useSuggestedVariable: (variable) => `Use suggested variable ${variable}`,
    },
    review: {
      badge: 'Review',
      checksPassSummary: (passed, total) => `${passed}/${total} Checks Pass`,
      emailBodyLength: 'Email body length',
      emailCoverage: (mapped, total) => `Email ${mapped}/${total}`,
      emailSource: 'Email source',
      filenameCoverage: (mapped, total) => `Filename ${mapped}/${total}`,
      fixIssue: 'Fix',
      goodToGenerateBody:
        'Files, mappings, output folder, and selected generation options passed preflight.',
      goodToGenerateTitle: 'Good to generate',
      hideDetails: 'Hide details',
      issuesFound: (count) => `${count} issue${count === 1 ? '' : 's'} need attention`,
      mappingCoverage: 'Mapping coverage',
      mappedColumns: 'Mapped email fields',
      mappedWordFields: 'Mapped Word fields',
      missingRequiredVariables: 'Missing required variables',
      needsAttentionBody: 'Fix the issues flagged below before generating. Use the Fix button to jump straight to the right step.',
      needsAttentionTitle: 'Needs attention',
      noMissingRequiredVariables: 'All required workbook variables are mapped.',
      outputPlan: 'Output plan',
      pdfBackend: 'PDF backend',
      preflightLoadingBody:
        'Checking files, mappings, workbook access, output folder access, and PDF capability.',
      preflightLoadingTitle: 'Running preflight checks',
      requiredMappedSummary: (mapped, total) => `${mapped}/${total} required mapped`,
      rowsFound: 'Rows found',
      selectedOutput: 'Selected output',
      setupCheck: 'Setup Check',
      showDetails: 'Show details',
      skippedRows: 'Rejected rows',
      subtitle: 'Preflight checks confirm every file, mapping, and folder is in order. Resolve any failures before generating.',
      statusFail: 'FAIL',
      statusPass: 'PASS',
      statusWarn: 'WARN',
      title: 'Review & Generate',
      workbookSource: 'Workbook source',
      wordCoverage: (mapped, total) => `Word ${mapped}/${total}`,
    },
    setupPreview: {
      badge: 'Setup preview',
      fieldsFoundInWord: 'Fields found in Word template',
      loadCheck: 'Load Check',
      noTemplateFields:
        'No template placeholders were found. Add markers like {{AUTHOR}} or {{TITLE}} inside the DOCX anywhere you want Excel values to be injected. Then save the file and either browse for the contract template again in Project Setup or re-open the same file to refresh this list.',
      mergedTitleHint:
        'Merged Excel titles appear as one populated cell. A real header row usually has many populated cells.',
      populatedCells: 'Populated cells',
      previewUnavailable: 'Preview unavailable',
      quickCheck: 'Workbook quick check',
      quickCheckDesc: (rows) =>
        `Showing the first ${rows} data rows so you can verify sheet and row settings before generating at scale.`,
      refreshing: 'Refreshing source preview...',
      roleData: 'Data cell row',
      roleSelectedHeader: 'Selected header',
      roleSuggestedHeader: 'Likely header',
      row: 'Row',
      rowType: 'Row type',
      subtitle: 'Confirm detected Word fields and sample Excel values before moving to mapping.',
      wordTemplateNotSelected: 'Select a Word template to preview placeholders. Excel load checks are already active.',
    },
    workbookSetupModal: {
      dataLegend: 'Data rows',
      description:
        'Choose the worksheet, then select the row that contains the actual column names. The first data row should be the first record below those headers.',
      heading: 'Worksheet and row setup',
      mergedTitleHint:
        'Merged title rows usually show one populated cell. Header rows should show several populated cells across the columns you expect to map.',
      noRejectedPreviewMatch:
        'No row matching the rejection rule was found in the workbook preview sample.',
      rejectedLegend: 'Rejected row',
      selectedHeaderLegend: 'Selected header row',
      saveSettings: 'Save settings',
      suggestedHeaderLegend: 'Likely header row',
      title: 'Workbook Setup',
    },
    templateInspection: {
      context: 'Found in',
      emailDescription: 'Review placeholders found in the email template file and the nearby text where each one appears.',
      emailTitle: 'Email Template Fields',
      field: 'Field',
      noContext: 'No surrounding text was found for this field.',
      noFieldsBody: 'No placeholders were found in this template yet.',
      noFieldsTitle: 'No fields found',
      wordDescription: 'Review placeholders found in the Word template and the paragraph where each one appears.',
      saveSettings: 'Save settings',
      wordTitle: 'Word Template Fields',
    },
    success: {
      createdFiles: 'Created files',
      docxFiles: 'DOCX files',
      emailDrafts: 'Email drafts',
      finishingBody:
        'The generator writes email_drafts.docx and generation_report.txt near the end. If they are not listed yet, wait a few seconds and refresh by opening the output folder.',
      finishingTitle: 'Finishing up output files',
      generatedRecords: 'Generated records',
      generationComplete: 'Generation Complete',
      hideSkippedDetails: 'Hide details',
      noFilesYet: 'No output files were found yet.',
      open: 'Open',
      openDrafts: 'Open Email Drafts',
      openOutputFolder: 'Open Output Folder',
      openReport: 'Open Report',
      outputMetrics: 'Output metrics',
      pdfFiles: 'PDF files',
      resultTree: 'Result tree',
      rowsFound: 'Rows found',
      showSkippedDetails: 'Show details',
      skippedRowEntry: (row, reason) => `Row ${row}: ${reason}`,
      skippedRowsDetail: 'Skipped rows detail',
      startAgain: 'Start Again',
      subtitle: 'Review created outputs and open files directly from this list.',
      skippedRows: 'Skipped rows',
      summary: (generated, skipped) => `${generated} generated / ${skipped} skipped`,
      warningsTitle: 'Warnings',
    },
  fileField: {
    browse: 'Browse',
    clear: 'Clear',
    downloadExample: 'Download example template',
  },
  },
  el: {
    language: {
      english: 'English',
      greek: 'Ελληνικά',
      label: 'Γλώσσα',
    },
    sidebar: {
      desktopMvp: 'DocGen Studio',
      title: 'DocGen Studio',
      description:
        'Μετατρέψτε το Excel και το Word που ήδη χρησιμοποιείτε σε εκατοντάδες εξατομικευμένα έγγραφα, PDF και προσχέδια email — εκτελείται αποκλειστικά στον υπολογιστή σας, χωρίς cloud, χωρίς συνδρομή, χωρίς αποστολή δεδομένων.',
      workflowProgress: 'Πρόοδος ροής εργασίας',
      stepOf: (current, total) => `Βήμα ${current} από ${total}`,
    },
    steps: {
      1: {
        title: 'Ρύθμιση',
        description: 'Επιλέξτε Excel, πρότυπο Word και φάκελο εξόδου.',
        nextHint: 'Το επόμενο βήμα προσαρμόζεται στους τύπους εξόδου.',
      },
      2: {
        title: 'Πρότυπο & Αντιστοίχιση',
        description: 'Αντιστοιχίστε placeholders σε στήλες Excel και ορίστε το μοτίβο ονόματος.',
        nextHint: 'Επόμενο: δημιουργήστε το πρότυπο email.',
      },
      3: {
        title: 'Συντάκτης Email',
        description: 'Γράψτε το πρότυπο email και προεπισκοπήστε ανά παραλήπτη.',
        nextHint: 'Επόμενο: έλεγχος πριν τη δημιουργία.',
      },
      4: {
        title: 'Έλεγχος & Δημιουργία',
        description: 'Εκτελέστε προελέγχους και δημιουργήστε όλα τα αρχεία.',
        nextHint: 'Αποθηκεύστε το αρχείο έργου για επαναχρησιμοποίηση.',
      },
    },
    app: {
      desktopBridgeUnavailableTitle: 'Η γέφυρα desktop δεν είναι διαθέσιμη',
      desktopBridgeUnavailableBody:
        'Η γέφυρα preload του Electron δεν φορτώθηκε, οπότε το UI δεν μπορεί ακόμα να ανοίξει επιλογείς αρχείων.',
      generationCompleteSummary: (generated, skipped) =>
        `Δημιουργήθηκαν ${generated} εγγραφές και παραλείφθηκαν ${skipped}. Ανοίξτε την αναφορά και το δέντρο εξόδου για έλεγχο.`,
      generationCompleteTitle: 'Η δημιουργία ολοκληρώθηκε',
      generationFailedTitle: 'Η δημιουργία απέτυχε',
      generationStatusTitle: 'Κατάσταση δημιουργίας',
      generating: 'Δημιουργία...',
      generatingNow: 'Δημιουργία τώρα',
      keyboardShortcuts: 'Πλήκτρα συντόμευσης',
      mapAllFieldsTitle: 'Αντιστοιχίστε όλα τα πεδία πριν τον έλεγχο',
      missingEmailMappings: (fields) => `Πεδία email χωρίς αντιστοίχιση workbook: ${fields}.`,
      missingWordMappings: (fields) => `Πεδία Word χωρίς αντιστοίχιση: ${fields}. `,
      loadProject: 'Φόρτωση έργου',
      openRecentProject: 'Άνοιγμα ρύθμισης έργου',
      outputsRequiredBody: 'Επιλέξτε τουλάχιστον έναν τύπο εξόδου πριν συνεχίσετε.',
      saveDraftSetup: 'Αποθήκευση πρόχειρου έργου',
      couldNotSaveExampleTemplate: 'Αδυναμία αποθήκευσης πρότυπου παραδείγματος',
      couldNotLoadWorkbookPreview: 'Αδυναμία φόρτωσης προεπισκόπησης workbook',
      projectFileLabel: 'Αρχείο έργου',
      back: 'Πίσω',
      continueTo: 'Συνέχεια σε',
      wordTemplateRequiredTitle: 'Απαιτείται πρότυπο Word',
      wordTemplateRequiredBody: 'Απαιτείται πρότυπο Word για έξοδο DOCX/PDF.',
      emailTemplateRequiredBody: 'Απαιτείται αρχείο προτύπου email.',
      outputFolderRequiredTitle: 'Απαιτείται φάκελος εξόδου',
      outputFolderRequiredBody: 'Απαιτείται φάκελος εξόδου.',
      outputFilenamePatternRequiredBody: 'Συμπληρώστε το μοτίβο ονόματος αρχείου DOCX/PDF.',
      shortcutsTitle: 'Πλήκτρα συντόμευσης',
      workbookRequiredBody: 'Απαιτείται workbook Excel.',
    },
    shortcuts: {
      generateNow: 'Δημιουργία τώρα',
      openLastProject: 'Άνοιγμα τελευταίου έργου',
      openProject: 'Άνοιγμα έργου',
      openWordTemplate: 'Άνοιγμα προτύπου Word',
      reloadFields: 'Ανανέωση πεδίων',
      saveProject: 'Αποθήκευση έργου',
      saveProjectAs: 'Αποθήκευση έργου ως',
    },
    generationProgress: {
      cancel: 'Ακύρωση',
      docxFiles: 'Αρχεία DOCX',
      emailDrafts: 'Προσχέδια email',
      elapsed: (seconds) => `${seconds}δ πέρασαν`,
      generatedRecords: 'Εγγραφές που δημιουργήθηκαν',
      inProgress: 'Η δημιουργία είναι σε εξέλιξη',
      outputTargets: 'Στόχοι εξόδου',
      pdfFiles: 'Αρχεία PDF',
      running: 'Εκτέλεση...',
      rowsFound: 'Γραμμές που βρέθηκαν',
      selectedOutput: 'Επιλεγμένη έξοδος',
      skippedRows: 'Γραμμές που παραλείφθηκαν',
      stage: 'Στάδιο',
      workingOn: (current, total) => `Επεξεργασία ${current}/${total}`,
      wordMappings: (mapped, total) => `Αντιστοιχίσεις Word: ${mapped}/${total}`,
    },
    outputLabels: {
      word: 'Word (.docx)',
      pdf: 'PDF',
      email: 'Προσχέδια email',
      none: 'Δεν έχει επιλεγεί τίποτα',
    },
    stepList: {
      current: 'Τρέχον',
      ready: 'Έτοιμο',
    },
    projectSetup: {
      badge: 'Βάση',
      dataStartRow: 'Γραμμή Έναρξης Δεδομένων',
      dataStartRowDesc: 'Πρώτη γραμμή με πραγματικές εγγραφές δεδομένων.',
      emailDrafts: 'Προσχέδια email',
      emailOutputModeCombinedDocx: 'Ένα ενιαίο αρχείο DOCX',
      emailOutputModeDesc: 'Επιλέξτε αν τα προσχέδια email θα εξαχθούν ως DOCX, EML ή Outlook MSG.',
      emailOutputModeDescNoMsg: 'Επιλέξτε αν τα προσχέδια email θα εξαχθούν ως DOCX ή EML. Η έξοδος Outlook MSG δεν είναι διαθέσιμη σε αυτό το σύστημα.',
      emailOutputModeLabel: 'Τρόπος εξαγωγής προσχεδίων email',
      emailOutputModeSeparateDocx: 'Ξεχωριστά αρχεία DOCX',
      emailOutputModeSeparateEml: 'Ξεχωριστά αρχεία EML',
      emailOutputModeSeparateMsg: 'Ξεχωριστά αρχεία Outlook MSG',
      emailOutputModeSeparateMsgWithDocx: 'Ξεχωριστά αρχεία Outlook MSG (με συνημμένο DOCX)',
      emailOutputModeSeparateMsgWithPdf: 'Ξεχωριστά αρχεία Outlook MSG (με συνημμένο PDF)',
      emailFileDesc: 'Επιλέξτε αρχείο κειμένου ή Word ως πηγή προτύπου email.',
      emailFileLabel: 'Αρχείο Προτύπου Email',
      emailFilePlaceholder: 'Επιλέξτε αρχείο προτύπου (.txt, .docx)',
      emailSummary: (fields) => `Βρέθηκαν ${fields} πεδία email`,
      excelDesc: 'Επιλέξτε το αρχείο Excel με τις τιμές που θέλετε να χρησιμοποιήσετε.',
      excelLabel: 'Αρχείο Excel',
      excelPlaceholder: 'Επιλέξτε αρχείο Excel (.xlsx)',
      headerRow: 'Γραμμή Επικεφαλίδων',
      headerRowDesc: 'Γραμμή που περιέχει τις επικεφαλίδες στηλών.',
      headerRowWarningBody: (selectedRow, selectedCount, suggestedRow, suggestedCount) =>
        `Η γραμμή ${selectedRow} έχει ${selectedCount} κελιά επικεφαλίδων, αλλά η γραμμή ${suggestedRow} έχει ${suggestedCount}. Ελέγξτε την προεπισκόπηση φόρτωσης παρακάτω. Πιθανότατα η γραμμή ${suggestedRow} είναι η σωστή γραμμή επικεφαλίδων.`,
      headerRowWarningTitle: 'Η γραμμή επικεφαλίδων ίσως είναι λάθος',
      optionalEmailSource: 'Χρήση υπάρχοντος αρχείου προτύπου email',
      optionalEmailSourceDesc:
        'Ενεργοποιήστε το μόνο αν θέλετε φόρτωση κειμένου email από .txt. Αφήστε το κλειστό για σύνταξη email μέσα στην εφαρμογή.',
      outputFolderDesc:
        'Επιλέξτε πού θα γράφονται τα παραγόμενα DOCX, PDF, προσχέδια και αναφορές.',
      outputFolderLabel: 'Φάκελος Εξόδου',
      outputFolderPlaceholder: 'Επιλέξτε φάκελο εξόδου',
      outputSummary: 'Έχει επιλεγεί φάκελος εξόδου',
      outputFilenamePatternDesc:
        'Ορίζει το όνομα αρχείου για DOCX/PDF. Χρησιμοποιήστε placeholders όπως {{APPLICATION_ID}} ή απλό κείμενο για λιγότερες υποχρεωτικές αντιστοιχίσεις.',
      outputFilenamePatternLabel: 'Μοτίβο Ονόματος Αρχείου Εξόδου',
      outputFilenamePatternPlaceholder: '{{APPLICATION_CODE}} - {{TITLE}}',
      pdfFiles: 'Αρχεία PDF',
      previewFields: 'Προεπισκόπηση πεδίων',
      rejectionColumn: 'Απόρριψη γραμμών με βάση',
      rejectionColumnDesc: 'Προαιρετική στήλη για παράλειψη γραμμών πριν τη δημιουργία.',
      rejectionColumnPlaceholder: 'Χωρίς κανόνα απόρριψης',
      rejectionValue: 'Τιμή απόρριψης',
      rejectionValueDesc: 'Οι γραμμές όπου η επιλεγμένη στήλη ισούται ακριβώς με αυτή την τιμή θα παραλείπονται.',
      rejectionValuePlaceholder: 'Επιλέξτε τιμή απόρριψης',
      title: 'Ρύθμιση Έργου',
      subtitle:
        'Συνδέστε τα αρχεία που χρησιμοποιείτε καθημερινά - Excel, Word και φάκελο εξόδου - σε μία καθοδηγούμενη ρύθμιση.',
      setupWorkbook: 'Ρύθμιση workbook',
      whatGenerate: 'Τι θέλετε να δημιουργήσετε;',
      whatGenerateDesc: 'Επιλέξτε έναν ή περισσότερους τύπους εξόδου. Η ροή προσαρμόζεται αυτόματα.',
      wordDesc: 'Επιλέξτε το πρότυπο Word με placeholders όπως {{TITLE}} και {{AUTHOR}}.',
      wordFiles: 'Αρχεία Word (.docx)',
      wordLabel: 'Πρότυπο Word',
      wordPlaceholder: 'Επιλέξτε πρότυπο Word (.docx)',
      wordSummary: (fields) => `Βρέθηκαν ${fields} πεδία Word`,
      workbookSummary: (headerRow, dataStartRow, rowsFound, columnsFound) =>
        `Επικεφαλίδες στη γραμμή ${headerRow}; δεδομένα από γραμμή ${dataStartRow}; ${rowsFound} γραμμές; ${columnsFound} στήλες`,
      worksheet: 'Όνομα Φύλλου',
      worksheetDesc: 'Όνομα φύλλου για ανάγνωση από το workbook.',
      worksheetPlaceholder: 'Επιλέξτε φύλλο',
      useSuggestedHeaderRow: (row) => `Χρήση γραμμής ${row}`,
      downloadExcelExample: 'Λήψη παραδείγματος Excel',
      downloadWordExample: 'Λήψη παραδείγματος Word',
      downloadEmailExample: 'Λήψη παραδείγματος email',
    },
    contractMapping: {
      badgeMapped: (mapped, total) => `${mapped} / ${total} αντιστοιχισμένα`,
      context: 'Πλαίσιο',
      noContextBody:
        'Αυτό το token βρέθηκε στο Word, αλλά η εφαρμογή δεν μπόρεσε να εξαγάγει γύρω παράγραφο.',
      noContextTitle: 'Δεν βρέθηκε πλαίσιο παραγράφου',
      noPlaceholdersBody:
        'Η εφαρμογή μπορεί να αντιστοιχίσει μόνο πεδία που υπάρχουν ήδη στο πρότυπο. Ανοίξτε το Word, ορίστε πού θα μπουν οι τιμές και προσθέστε placeholders με διπλές αγκύλες όπως {{AUTHOR}}, {{TITLE}} ή {{APPLICATION_CODE}}. Αφού αποθηκεύσετε το πρότυπο, κάντε επαναφόρτωση πεδίων εδώ. Αν επιλέξατε λάθος αρχείο, αλλάξτε το στη Ρύθμιση Έργου.',
      noPlaceholdersTitle: 'Δεν βρέθηκαν placeholders Word',
      openTemplate: 'Άνοιγμα προτύπου',
      originalParagraph: 'Αρχική παράγραφος',
      paragraphPreviewTitle: 'Προεπισκόπηση παραγράφου προτύπου',
      reloadFields: 'Επαναφόρτωση πεδίων',
      renderedParagraph: 'Απόδοση με τιμή δείγματος',
      showParagraph: 'Προβολή παραγράφου',
      sourceColumn: 'Στήλη προέλευσης',
      sampleValue: 'Τιμή δείγματος',
      tokenWithSample: (sample) => ` με τιμή δείγματος "${sample}"`,
      tokenWithoutSample: ' (δεν υπάρχει ακόμη τιμή δείγματος)',
      workbookVariable: 'Μεταβλητή workbook',
      wordField: 'Πεδίο Word',
      chooseVariable: 'Επιλέξτε μεταβλητή',
      mappingPreviewDesc:
        'Αντιστοιχίστε placeholders που βρέθηκαν στο Word. Για περισσότερα, επεξεργαστείτε το πρότυπο, αποθηκεύστε και επαναφορτώστε πεδία.',
      mappingPreviewTitle: 'Προεπισκόπηση Αντιστοίχισης Προτύπου',
      outputFilenamePatternDesc:
        'Χρησιμοποιήστε απλό κείμενο, υπάρχουσες μεταβλητές ή γράψτε {{ANY_CAPS_WORD}} για πεδίο μόνο στο όνομα και αντιστοιχίστε το παρακάτω.',
      outputFilenamePatternLabel: 'Μοτίβο Ονόματος Αρχείου DOCX/PDF',
      outputFilenamePatternPlaceholder: '{{APPLICATION_CODE}} - {{TITLE}} - {{LANGUAGE}}',
      outputFilenamePatternMissingBody: 'Ορίστε μεταβλητές workbook για:',
      outputFilenamePatternPreviewLabel: 'Προεπισκόπηση:',
      outputFilenamePatternRequiredBody: 'Συμπληρώστε το όνομα αρχείου.',
    },
    emailBuilder: {
      activeTarget: (target) => `Ενεργό πεδίο: ${target}`,
      body: 'Κείμενο',
      bodyDesc: 'Συντάξτε εδώ το σώμα του email και εισάγετε μεταβλητές workbook όπου χρειάζονται.',
      cc: 'Κοινοποίηση',
      ccDesc: 'Προαιρετικοί παραλήπτες κοινοποίησης.',
      invalidEmailAddress: 'Αυτό δεν φαίνεται να είναι έγκυρη διεύθυνση email.',
      subtitle: 'Κάντε κλικ σε token πεδίου για εισαγωγή στο ενεργό σημείο του κέρσορα.',
      subject: 'Θέμα',
      subjectDesc: 'Κάντε κλικ εδώ και εισάγετε πεδία workbook από πάνω.',
      title: 'Δημιουργός Προτύπου Email',
      to: 'Προς',
      toDesc: 'Κύριος παραλήπτης.',
      modifierHint: 'Συμβουλή: χρησιμοποιήστε το ▾ βέλος σε κάθε chip πεδίου για να εφαρμόσετε τροποποιητή — π.χ. {{NAME|upper}} → ΓΙΑΝΝΗΣ.',
      modifierLabels: {
        none: 'Χωρίς τροποποιητή',
        upper: 'ΚΕΦΑΛΑΙΑ',
        lower: 'πεζά',
        title: 'Αρχικά Κεφαλαία',
        trim: 'Αφαίρεση κενών',
        ordinal: 'Ordinal (1st, 2nd…) — English only',
      },
    },
    externalEmailTemplate: {
      badge: 'Εξωτερικό αρχείο',
      file: 'Αρχείο προτύπου',
      loadErrorTitle: 'Αδυναμία φόρτωσης εξωτερικού προτύπου email',
      loading: 'Φόρτωση',
      noVariables: 'Δεν βρέθηκαν placeholders σε αυτό το αρχείο.',
      preview: 'Προεπισκόπηση με γραμμή δείγματος',
      subtitle:
        'Αυτό το αρχείο θα χρησιμοποιηθεί στη δημιουργία. Ελέγξτε τα placeholders και αντιστοιχίστε τα με στήλες workbook παρακάτω.',
      title: 'Εξωτερικό Πρότυπο Email',
      variables: 'Placeholders που βρέθηκαν',
    },
    templatePreview: {
      badge: 'Ζωντανή Απόδοση',
      cc: 'Κοινοποίηση',
      subject: 'Θέμα',
      subtitle: 'Απόδοση με τη γραμμή δείγματος για έλεγχο του προτύπου πριν τη μαζική δημιουργία.',
      title: 'Προεπισκόπηση Απόδοσης Δείγματος',
      to: 'Προς',
    },
    workbookPreview: {
      badgeColumns: (count) => `${count} στήλες`,
      chooseVariable: 'Επιλέξτε μεταβλητή',
      column: 'Στήλη',
      filterAll: 'Όλα',
      filterMissing: 'Λείπουν',
      filterRequired: 'Απαιτούμενα',
      firstRowValue: 'Τιμή πρώτης γραμμής',
      guidanceLines: [
        'Κάθε γραμμή αντιστοιχεί σε μία στήλη του workbook. Συγκρίνετε την επικεφαλίδα και την τιμή πρώτης γραμμής για να επιβεβαιώσετε τι δεδομένα περιέχει.',
        'Πατήστε Πρόταση όταν η ανιχνευμένη μεταβλητή είναι σωστή ή επιλέξτε άλλη μεταβλητή από την Επιλεγμένη μεταβλητή.',
        'Ελέγξτε πρώτα τα Απαιτούμενα και όσα Λείπουν. Το Χρησιμοποιείται από δείχνει αν η μεταβλητή τροφοδοτεί πεδία Word, email ή ονόματα αρχείων.',
        'Για πεδίο μόνο στο όνομα αρχείου, γράψτε {{ANY_CAPS_WORD}} στο μοτίβο ονόματος, μετά πληκτρολογήστε αυτή τη μεταβλητή εδώ και πατήστε Create για να την προσθέσετε.',
      ],
      guidanceTitle: 'Πώς να χρησιμοποιήσετε την προεπισκόπηση',
      hideGuidance: 'Απόκρυψη βοήθειας',
      headerMatched: (count) => `${count} αντιστοιχίσεις από επικεφαλίδες`,
      header: 'Επικεφαλίδα',
      modeCompact: 'Συμπαγές',
      modeFull: 'Πλήρες',
      modeHalf: 'Μισό',
      previewUnavailable: 'Η προεπισκόπηση δεν είναι διαθέσιμη',
      refreshing: 'Ανανέωση προεπισκόπησης αντιστοίχισης workbook...',
      requiredSummary: (mapped, total) => `${mapped}/${total} απαιτούμενα αντιστοιχισμένα`,
      selectedVariable: 'Επιλεγμένη μεταβλητή',
      subtitle:
        'Ελέγξτε στήλες workbook, τιμές δείγματος και αντιστοιχίσεις πεδίων για Word και email.',
      suggestedVariable: 'Πρόταση',
      showGuidance: 'Εμφάνιση βοήθειας',
      title: 'Προεπισκόπηση Αντιστοίχισης Workbook',
      usedBy: 'Χρησιμοποιείται από',
      usedByBoth: '[WORD Field] + Email',
      usedByContract: '[WORD Field]',
      usedByEmail: 'Email',
      usedByFilename: 'Όνομα αρχείου',
      usedByNone: 'Κανένα',
      usedByWord: 'Word',
      useSuggestedVariable: (variable) => `Χρήση προτεινόμενης μεταβλητής ${variable}`,
    },
    review: {
      badge: 'Έλεγχος',
      checksPassSummary: (passed, total) => `${passed}/${total} Έλεγχοι OK`,
      emailBodyLength: 'Μήκος κειμένου email',
      emailCoverage: (mapped, total) => `Email ${mapped}/${total}`,
      emailSource: 'Πηγή email',
      filenameCoverage: (mapped, total) => `Όνομα αρχείου ${mapped}/${total}`,
      fixIssue: 'Διόρθωση',
      goodToGenerateBody:
        'Τα αρχεία, οι αντιστοιχίσεις, ο φάκελος εξόδου και οι επιλογές δημιουργίας πέρασαν τον προέλεγχο.',
      goodToGenerateTitle: 'Έτοιμο για δημιουργία',
      hideDetails: 'Απόκρυψη λεπτομερειών',
      issuesFound: (count) => `${count} θέματα χρειάζονται έλεγχο`,
      mappingCoverage: 'Κάλυψη αντιστοιχίσεων',
      mappedColumns: 'Αντιστοιχισμένα πεδία email',
      mappedWordFields: 'Αντιστοιχισμένα πεδία Word',
      missingRequiredVariables: 'Απαιτούμενες μεταβλητές που λείπουν',
      needsAttentionBody: 'Διορθώστε τους αποτυχημένους ελέγχους πριν εκτελέσετε τη δημιουργία.',
      needsAttentionTitle: 'Χρειάζεται έλεγχο',
      noMissingRequiredVariables: 'Όλες οι απαιτούμενες μεταβλητές workbook είναι αντιστοιχισμένες.',
      outputPlan: 'Πλάνο εξόδου',
      pdfBackend: 'Backend PDF',
      preflightLoadingBody:
        'Έλεγχος αρχείων, αντιστοιχίσεων, πρόσβασης workbook, φακέλου εξόδου και δυνατότητας PDF.',
      preflightLoadingTitle: 'Εκτέλεση προελέγχων',
      requiredMappedSummary: (mapped, total) => `${mapped}/${total} απαιτούμενα αντιστοιχισμένα`,
      rowsFound: 'Γραμμές που βρέθηκαν',
      selectedOutput: 'Επιλεγμένη έξοδος',
      setupCheck: 'Έλεγχος Ρύθμισης',
      showDetails: 'Προβολή λεπτομερειών',
      skippedRows: 'Απορριφθείσες γραμμές',
      subtitle: 'Τελικός έλεγχος κάλυψης προτύπων, αντιστοιχίσεων και ρυθμίσεων εξόδου πριν τη δημιουργία.',
      statusFail: 'ΑΠΟΤΥΧΙΑ',
      statusPass: 'OK',
      statusWarn: 'ΠΡΟΣΟΧΗ',
      title: 'Έτοιμο για Δημιουργία',
      workbookSource: 'Πηγή workbook',
      wordCoverage: (mapped, total) => `Word ${mapped}/${total}`,
    },
    setupPreview: {
      badge: 'Προεπισκόπηση ρύθμισης',
      fieldsFoundInWord: 'Πεδία που βρέθηκαν στο πρότυπο Word',
      loadCheck: 'Έλεγχος Φόρτωσης',
      noTemplateFields:
        'Δεν βρέθηκαν placeholders προτύπου. Προσθέστε δείκτες όπως {{AUTHOR}} ή {{TITLE}} μέσα στο DOCX όπου θέλετε να μπαίνουν τιμές Excel. Έπειτα αποθηκεύστε και είτε επιλέξτε ξανά το πρότυπο στη Ρύθμιση Έργου είτε ανοίξτε ξανά το ίδιο αρχείο για ανανέωση της λίστας.',
      mergedTitleHint:
        'Οι συγχωνευμένοι τίτλοι Excel εμφανίζονται ως ένα συμπληρωμένο κελί. Μια πραγματική γραμμή επικεφαλίδων συνήθως έχει πολλά συμπληρωμένα κελιά.',
      populatedCells: 'Συμπληρωμένα κελιά',
      previewUnavailable: 'Η προεπισκόπηση δεν είναι διαθέσιμη',
      quickCheck: 'Γρήγορος έλεγχος workbook',
      quickCheckDesc: (rows) =>
        `Εμφανίζονται οι πρώτες ${rows} γραμμές δεδομένων ώστε να επαληθεύσετε ρυθμίσεις φύλλου και γραμμών πριν τη μαζική δημιουργία.`,
      refreshing: 'Ανανέωση προεπισκόπησης πηγών...',
      roleData: 'Γραμμή δεδομένων',
      roleSelectedHeader: 'Επιλεγμένη επικεφαλίδα',
      roleSuggestedHeader: 'Πιθανή επικεφαλίδα',
      row: 'Γραμμή',
      rowType: 'Τύπος γραμμής',
      subtitle: 'Επιβεβαιώστε τα πεδία Word και δείγματα τιμών Excel πριν την αντιστοίχιση.',
      wordTemplateNotSelected: 'Επιλέξτε πρότυπο Word για προεπισκόπηση placeholders. Ο έλεγχος φόρτωσης Excel εκτελείται ήδη.',
    },
    workbookSetupModal: {
      dataLegend: 'Γραμμές δεδομένων',
      description:
        'Επιλέξτε φύλλο και μετά τη γραμμή που περιέχει τα πραγματικά ονόματα στηλών. Η πρώτη γραμμή δεδομένων πρέπει να είναι η πρώτη εγγραφή κάτω από τις επικεφαλίδες.',
      heading: 'Ρύθμιση φύλλου και γραμμών',
      mergedTitleHint:
        'Οι συγχωνευμένες γραμμές τίτλου συνήθως εμφανίζουν ένα συμπληρωμένο κελί. Οι γραμμές επικεφαλίδων πρέπει να έχουν πολλά συμπληρωμένα κελιά στις στήλες που θέλετε να αντιστοιχίσετε.',
      noRejectedPreviewMatch:
        'Δεν βρέθηκε γραμμή που να ταιριάζει με τον κανόνα απόρριψης στο δείγμα προεπισκόπησης workbook.',
      rejectedLegend: 'Απορριπτέα γραμμή',
      selectedHeaderLegend: 'Επιλεγμένη γραμμή επικεφαλίδων',
      saveSettings: 'Αποθήκευση ρυθμίσεων',
      suggestedHeaderLegend: 'Πιθανή γραμμή επικεφαλίδων',
      title: 'Ρύθμιση Workbook',
    },
    templateInspection: {
      context: 'Βρέθηκε σε',
      emailDescription: 'Ελέγξτε τα placeholders που βρέθηκαν στο αρχείο email και το κοντινό κείμενο όπου εμφανίζεται το καθένα.',
      emailTitle: 'Πεδία Προτύπου Email',
      field: 'Πεδίο',
      noContext: 'Δεν βρέθηκε κοντινό κείμενο για αυτό το πεδίο.',
      noFieldsBody: 'Δεν βρέθηκαν placeholders σε αυτό το πρότυπο ακόμη.',
      noFieldsTitle: 'Δεν βρέθηκαν πεδία',
      wordDescription: 'Ελέγξτε τα placeholders που βρέθηκαν στο πρότυπο Word και την παράγραφο όπου εμφανίζεται το καθένα.',
      saveSettings: 'Αποθήκευση ρυθμίσεων',
      wordTitle: 'Πεδία Προτύπου Word',
    },
    success: {
      createdFiles: 'Δημιουργημένα αρχεία',
      docxFiles: 'Αρχεία DOCX',
      emailDrafts: 'Προσχέδια email',
      finishingBody:
        'Ο generator γράφει τα email_drafts.docx και generation_report.txt προς το τέλος. Αν δεν εμφανίζονται ακόμη, περιμένετε λίγα δευτερόλεπτα και ανανεώστε ανοίγοντας τον φάκελο εξόδου.',
      finishingTitle: 'Ολοκλήρωση αρχείων εξόδου',
      generatedRecords: 'Εγγραφές που δημιουργήθηκαν',
      generationComplete: 'Η δημιουργία ολοκληρώθηκε',
      hideSkippedDetails: 'Απόκρυψη λεπτομερειών',
      noFilesYet: 'Δεν βρέθηκαν ακόμη αρχεία εξόδου.',
      open: 'Άνοιγμα',
      openDrafts: 'Άνοιγμα Προσχεδίων Email',
      openOutputFolder: 'Άνοιγμα Φακέλου Εξόδου',
      openReport: 'Άνοιγμα Αναφοράς',
      outputMetrics: 'Μετρήσεις εξόδου',
      pdfFiles: 'Αρχεία PDF',
      resultTree: 'Δέντρο αποτελεσμάτων',
      rowsFound: 'Γραμμές που βρέθηκαν',
      showSkippedDetails: 'Εμφάνιση λεπτομερειών',
      skippedRowEntry: (row, reason) => `Γραμμή ${row}: ${reason}`,
      skippedRowsDetail: 'Λεπτομέρειες παραλειφθεισών γραμμών',
      startAgain: 'Νέα Εκκίνηση',
      subtitle: 'Ελέγξτε τα παραγόμενα αρχεία και ανοίξτε τα απευθείας από αυτή τη λίστα.',
      skippedRows: 'Γραμμές που παραλείφθηκαν',
      summary: (generated, skipped) => `${generated} δημιουργήθηκαν / ${skipped} παραλείφθηκαν`,
      warningsTitle: 'Προειδοποιήσεις',
    },
  fileField: {
    browse: 'Περιήγηση',
    clear: 'Καθαρισμός',
    downloadExample: 'Λήψη πρότυπου παραδείγματος',
  },
  },
};

type I18nContextValue = {
  copy: Translation;
  language: Language;
  setLanguage: (language: Language) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const storageKey = 'greeklit.language';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'en';
    }

    const stored = window.localStorage.getItem(storageKey);
    return stored === 'el' ? 'el' : 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, language);
    }
  }, [language]);

  const value = useMemo(
    () => ({
      copy: translations[language],
      language,
      setLanguage,
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider.');
  }

  return context;
}
