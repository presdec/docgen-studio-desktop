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
    desktopBridgeUnavailableBody: string;
    desktopBridgeUnavailableTitle: string;
    generationCompleteSummary: (generated: number, skipped: number) => string;
    generationCompleteTitle: string;
    generationFailedTitle: string;
    generationStatusTitle: string;
    generating: string;
    generatingNow: string;
    mapAllFieldsTitle: string;
    missingEmailMappings: (fields: string) => string;
    missingWordMappings: (fields: string) => string;
    openRecentProject: string;
    saveDraftSetup: string;
    couldNotSaveExampleTemplate: string;
    couldNotLoadWorkbookPreview: string;
    projectFileLabel: string;
    back: string;
    continueTo: string;
  };
  generationProgress: {
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
    emailFileDesc: string;
    emailFileLabel: string;
    emailFilePlaceholder: string;
    excelDesc: string;
    excelLabel: string;
    excelPlaceholder: string;
    headerRow: string;
    headerRowDesc: string;
    optionalEmailSource: string;
    optionalEmailSourceDesc: string;
    outputFolderDesc: string;
    outputFolderLabel: string;
    outputFolderPlaceholder: string;
    outputFilenamePatternDesc: string;
    outputFilenamePatternLabel: string;
    outputFilenamePatternPlaceholder: string;
    pdfFiles: string;
    title: string;
    subtitle: string;
    whatGenerate: string;
    whatGenerateDesc: string;
    wordDesc: string;
    wordFiles: string;
    wordLabel: string;
    wordPlaceholder: string;
    worksheet: string;
    worksheetDesc: string;
    downloadExcelExample: string;
    downloadWordExample: string;
    downloadEmailExample: string;
  };
  contractMapping: {
    badgeMapped: (mapped: number, total: number) => string;
    context: string;
    mappedSample: string;
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
    subtitle: string;
    templateFlowTitle: string;
    title: string;
    tokenWithSample: (sample: string) => string;
    tokenWithoutSample: string;
    workbookVariable: string;
    wordField: string;
    chooseVariable: string;
    needMorePlaceholdersTitle: string;
    needMorePlaceholdersBody: string;
    statusNoTemplate: string;
    statusTemplateMissing: string;
    statusTemplateLocked: string;
    statusTemplateEditedAt: (time: string) => string;
    statusTemplateHint: string;
  };
  emailBuilder: {
    activeTarget: (target: string) => string;
    body: string;
    bodyDesc: string;
    cc: string;
    ccDesc: string;
    subtitle: string;
    subject: string;
    subjectDesc: string;
    title: string;
    to: string;
    toDesc: string;
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
    column: string;
    firstRowValue: string;
    header: string;
    previewUnavailable: string;
    refreshing: string;
    selectedVariable: string;
    subtitle: string;
    title: string;
    usedBy: string;
    usedByBoth: string;
    usedByContract: string;
    usedByEmail: string;
    usedByNone: string;
    chooseVariable: string;
  };
  review: {
    badge: string;
    checksPassSummary: (passed: number, total: number) => string;
    emailBodyLength: string;
    fixIssue: string;
    goodToGenerateBody: string;
    goodToGenerateTitle: string;
    hideDetails: string;
    issuesFound: (count: number) => string;
    mappedColumns: string;
    mappedWordFields: string;
    needsAttentionBody: string;
    needsAttentionTitle: string;
    outputPlan: string;
    pdfBackend: string;
    preflightLoadingBody: string;
    preflightLoadingTitle: string;
    rowsFound: string;
    selectedOutput: string;
    setupCheck: string;
    showDetails: string;
    subtitle: string;
    statusFail: string;
    statusPass: string;
    statusWarn: string;
    title: string;
  };
  setupPreview: {
    badge: string;
    fieldsFoundInWord: string;
    loadCheck: string;
    noTemplateFields: string;
    previewUnavailable: string;
    quickCheck: string;
    quickCheckDesc: (rows: number) => string;
    refreshing: string;
    row: string;
    subtitle: string;
    wordTemplateNotSelected: string;
  };
  success: {
    createdFiles: string;
    docxFiles: string;
    emailDrafts: string;
    finishingBody: string;
    finishingTitle: string;
    generatedRecords: string;
    generationComplete: string;
    noFilesYet: string;
    open: string;
    openDrafts: string;
    openOutputFolder: string;
    openReport: string;
    outputMetrics: string;
    pdfFiles: string;
    resultTree: string;
    rowsFound: string;
    startAgain: string;
    subtitle: string;
    skippedRows: string;
    summary: (generated: number, skipped: number) => string;
    warningsTitle: string;
  };
  fileField: {
    browse: string;
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
        title: 'Project Setup',
        description:
          'Tell DocGen Studio which Excel file holds your data, which Word template to fill, and where to write the output. Verify everything loads before you commit to a full run.',
        nextHint: 'Next step adapts to the output types you selected.',
      },
      2: {
        title: 'Field Mapping',
        description:
          'Connect each placeholder in your Word template to the matching Excel column. This is what makes every generated file unique and accurate.',
        nextHint: 'Next: build or review the email template with live field tokens.',
      },
      3: {
        title: 'Email Builder',
        description: 'Compose your email subject, body, and recipients using click-to-insert fields from your workbook. A live preview shows exactly what each recipient will receive.',
        nextHint: 'Next: run a final preflight check before bulk generation.',
      },
      4: {
        title: 'Review And Generate',
        description:
          'Run preflight checks on your files, mappings, and output folder, then generate all Word documents, PDFs, and email drafts in a single run. Save the project to reuse the same setup next time.',
        nextHint: 'Tip: save this project file to reuse the same setup for future batches.',
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
      mapAllFieldsTitle: 'Map all fields before review',
      missingEmailMappings: (fields) => `Email fields missing workbook assignment: ${fields}.`,
      missingWordMappings: (fields) => `Word fields missing mapping: ${fields}. `,
      openRecentProject: 'Open Recent Project',
      saveDraftSetup: 'Save Draft Setup',
      couldNotSaveExampleTemplate: 'Could not save example template',
      couldNotLoadWorkbookPreview: 'Could not load workbook preview',
      projectFileLabel: 'Project file',
      back: 'Back',
      continueTo: 'Continue To',
    },
    generationProgress: {
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
      email: 'Email drafts (.docx)',
      none: 'Nothing selected',
    },
    stepList: {
      current: 'Current',
      ready: 'Ready',
    },
    projectSetup: {
      badge: 'Foundation',
      dataStartRow: 'Data Start Row',
      dataStartRowDesc: 'First row containing actual data records.',
      emailDrafts: 'Email drafts (.docx)',
      emailFileDesc: 'Choose a text file used as the email template source.',
      emailFileLabel: 'Email Template File',
      emailFilePlaceholder: 'Select template file (.txt)',
      excelDesc: 'Choose the Excel file with the values you want to use.',
      excelLabel: 'Excel File',
      excelPlaceholder: 'Select Excel file (.xlsx)',
      headerRow: 'Header Row',
      headerRowDesc: 'Row containing the column headers.',
      optionalEmailSource: 'Use an existing email template file',
      optionalEmailSourceDesc:
        'Turn this on only if you want to load email text from a .txt file. Leave it off to build emails directly in the app.',
      outputFolderDesc:
        'Choose where generated DOCX, PDF, drafts, and reports should be written.',
      outputFolderLabel: 'Output Folder',
      outputFolderPlaceholder: 'Select output folder',
      outputFilenamePatternDesc:
        'Controls DOCX/PDF file names. Use placeholders like {{APPLICATION_ID}} or plain text to avoid extra required mappings.',
      outputFilenamePatternLabel: 'Output Filename Pattern',
      outputFilenamePatternPlaceholder: '{{APPLICATION_CODE}} - {{TITLE}}',
      pdfFiles: 'PDF files',
      title: 'Project Setup',
      subtitle:
        'Connect the files you already use in daily work - Excel, Word, and output folder - in one guided setup.',
      whatGenerate: 'What do you want to generate?',
      whatGenerateDesc: 'Pick one or more output types. The workflow will adapt automatically.',
      wordDesc: 'Choose the Word template with placeholders like {{TITLE}} and {{AUTHOR}}.',
      wordFiles: 'Word files (.docx)',
      wordLabel: 'Word Template',
      wordPlaceholder: 'Select Word template (.docx)',
      worksheet: 'Worksheet Name',
      worksheetDesc: 'Sheet name to read from your workbook.',
      downloadExcelExample: 'Download example Excel file',
      downloadWordExample: 'Download example Word template',
      downloadEmailExample: 'Download example email template',
    },
    contractMapping: {
      badgeMapped: (mapped, total) => `${mapped} / ${total} mapped`,
      context: 'Context',
      mappedSample: 'Rendered with sample value',
      noContextBody:
        'This token was found in the Word file, but the app could not extract a paragraph around it.',
      noContextTitle: 'No paragraph context found',
      noPlaceholdersBody:
        'The app can only map fields that already exist in the template. Open the Word file, decide where values should be inserted, and add placeholders in double braces such as {{AUTHOR}}, {{TITLE}}, or {{APPLICATION_CODE}}. After saving the template, reload fields here. If you picked the wrong file, you can replace it in Project Setup.',
      noPlaceholdersTitle: 'No Word placeholders found',
      openTemplate: 'Open template',
      originalParagraph: 'Original paragraph',
      paragraphPreviewTitle: 'Template paragraph preview',
      reloadFields: 'Reload fields',
      renderedParagraph: 'Rendered with sample value',
      showParagraph: 'Show paragraph',
      sourceColumn: 'Source column',
      sampleValue: 'Sample value',
      subtitle: 'Connect each Word placeholder to an Excel column so document generation stays accurate.',
      templateFlowTitle: 'Template editing flow',
      title: 'Word Field Mapping',
      tokenWithSample: (sample) => ` with sample value "${sample}"`,
      tokenWithoutSample: ' (no mapped sample value yet)',
      workbookVariable: 'Workbook variable',
      wordField: 'Word field',
      chooseVariable: 'Choose variable',
      needMorePlaceholdersTitle: 'Need more placeholders?',
      needMorePlaceholdersBody:
        'Add markers like {{AUTHOR}}, {{TITLE}}, or {{APPLICATION_CODE}} directly in the Word file wherever values should be injected. Save the template, close Word if needed, then use Reload fields.',
      statusNoTemplate: 'Choose a Word template in Project Setup before mapping fields.',
      statusTemplateMissing: 'The selected Word template could not be found on disk.',
      statusTemplateLocked:
        'The template still looks open in Word. Save your changes, close Word, then reload fields.',
      statusTemplateEditedAt: (time) => `Last saved change detected at ${time}. Reload fields after saving if you added or renamed placeholders.`,
      statusTemplateHint: 'Open the Word template, save your edits, then reload fields to pull in new placeholders.',
    },
    emailBuilder: {
      activeTarget: (target) => `Active target: ${target}`,
      body: 'Body',
      bodyDesc: 'Draft the email body here and insert workbook variables wherever they belong.',
      cc: 'Cc',
      ccDesc: 'Optional copied recipients.',
      subtitle: 'Click any field token to insert it where your cursor is active.',
      subject: 'Subject',
      subjectDesc: 'Click here, then insert workbook fields from above.',
      title: 'Email Template Builder',
      to: 'To',
      toDesc: 'Primary recipient field.',
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
      column: 'Column',
      firstRowValue: 'First row value',
      header: 'Header',
      previewUnavailable: 'Preview unavailable',
      refreshing: 'Refreshing workbook mapping preview...',
      selectedVariable: 'Selected variable',
      subtitle:
        'Review workbook columns, sample values, and field assignments used by Word and email templates.',
      title: 'Workbook Mapping Preview',
      usedBy: 'Used by',
      usedByBoth: '[WORD Field] + Email',
      usedByContract: '[WORD Field]',
      usedByEmail: 'Email',
      usedByNone: 'None',
      chooseVariable: 'Choose variable',
    },
    review: {
      badge: 'Review',
      checksPassSummary: (passed, total) => `${passed}/${total} Checks Pass`,
      emailBodyLength: 'Email body length',
      fixIssue: 'Fix',
      goodToGenerateBody:
        'Files, mappings, output folder, and selected generation options passed preflight.',
      goodToGenerateTitle: 'Good to generate',
      hideDetails: 'Hide details',
      issuesFound: (count) => `${count} issue${count === 1 ? '' : 's'} need attention`,
      mappedColumns: 'Mapped workbook columns',
      mappedWordFields: 'Mapped Word fields',
      needsAttentionBody: 'Resolve failed checks before running this batch.',
      needsAttentionTitle: 'Needs attention',
      outputPlan: 'Output plan',
      pdfBackend: 'PDF backend',
      preflightLoadingBody:
        'Checking files, mappings, workbook access, output folder access, and PDF capability.',
      preflightLoadingTitle: 'Running preflight checks',
      rowsFound: 'Rows found',
      selectedOutput: 'Selected output',
      setupCheck: 'Setup Check',
      showDetails: 'Show details',
      subtitle: 'Final review of template coverage, mapped fields, and output settings before generation.',
      statusFail: 'FAIL',
      statusPass: 'PASS',
      statusWarn: 'WARN',
      title: 'Ready To Generate',
    },
    setupPreview: {
      badge: 'Setup preview',
      fieldsFoundInWord: 'Fields found in Word template',
      loadCheck: 'Load Check',
      noTemplateFields:
        'No template placeholders were found. Add markers like {{AUTHOR}} or {{TITLE}} inside the DOCX anywhere you want Excel values to be injected. Then save the file and either browse for the contract template again in Project Setup or re-open the same file to refresh this list.',
      previewUnavailable: 'Preview unavailable',
      quickCheck: 'Workbook quick check',
      quickCheckDesc: (rows) =>
        `Showing the first ${rows} data rows so you can verify sheet and row settings before generating at scale.`,
      refreshing: 'Refreshing source preview...',
      row: 'Row',
      subtitle: 'Confirm detected Word fields and sample Excel values before moving to mapping.',
      wordTemplateNotSelected: 'Select a Word template to preview placeholders. Excel load checks are already active.',
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
      noFilesYet: 'No output files were found yet.',
      open: 'Open',
      openDrafts: 'Open Email Drafts',
      openOutputFolder: 'Open Output Folder',
      openReport: 'Open Report',
      outputMetrics: 'Output metrics',
      pdfFiles: 'PDF files',
      resultTree: 'Result tree',
      rowsFound: 'Rows found',
      startAgain: 'Start Again',
      subtitle: 'Review created outputs and open files directly from this list.',
      skippedRows: 'Skipped rows',
      summary: (generated, skipped) => `${generated} generated / ${skipped} skipped`,
      warningsTitle: 'Warnings',
    },
    fileField: {
      browse: 'Browse',
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
        title: 'Ρύθμιση Έργου',
        description:
          'Πείτε στο DocGen Studio ποιο αρχείο Excel περιέχει τα δεδομένα σας, ποιο πρότυπο Word να συμπληρώσει και πού να γράψει τα αποτελέσματα. Επιβεβαιώστε ότι όλα φορτώνουν πριν ξεκινήσετε.',
        nextHint: 'Το επόμενο βήμα προσαρμόζεται στους τύπους εξόδου που επιλέξατε.',
      },
      2: {
        title: 'Αντιστοίχιση Πεδίων',
        description:
          'Συνδέστε κάθε placeholder του προτύπου Word με την αντίστοιχη στήλη Excel. Αυτό κάνει κάθε παραγόμενο αρχείο μοναδικό και ακριβές.',
        nextHint: 'Επόμενο: δημιουργήστε ή ελέγξτε το πρότυπο email με ζωντανά πεδία.',
      },
      3: {
        title: 'Συντάκτης Email',
        description: 'Συντάξτε θέμα, σώμα και παραλήπτες χρησιμοποιώντας πεδία από το workbook με ένα κλικ. Η ζωντανή προεπισκόπηση δείχνει τι θα λάβει κάθε παραλήπτης.',
        nextHint: 'Επόμενο: εκτελέστε τελικό έλεγχο πριν τη μαζική δημιουργία.',
      },
      4: {
        title: 'Έλεγχος και Δημιουργία',
        description:
          'Εκτελέστε προκαταρκτικούς ελέγχους σε αρχεία, αντιστοιχίσεις και φάκελο εξόδου, μετά δημιουργήστε όλα τα Word, PDF και προσχέδια email σε ένα μόνο βήμα. Αποθηκεύστε το έργο για επαναχρησιμοποίηση.',
        nextHint: 'Συμβουλή: αποθηκεύστε το αρχείο έργου για να επαναχρησιμοποιήσετε την ίδια ρύθμιση στο μέλλον.',
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
      mapAllFieldsTitle: 'Αντιστοιχίστε όλα τα πεδία πριν τον έλεγχο',
      missingEmailMappings: (fields) => `Πεδία email χωρίς αντιστοίχιση workbook: ${fields}.`,
      missingWordMappings: (fields) => `Πεδία Word χωρίς αντιστοίχιση: ${fields}. `,
      openRecentProject: 'Άνοιγμα πρόσφατου έργου',
      saveDraftSetup: 'Αποθήκευση πρόχειρης ρύθμισης',
      couldNotSaveExampleTemplate: 'Αδυναμία αποθήκευσης πρότυπου παραδείγματος',
      couldNotLoadWorkbookPreview: 'Αδυναμία φόρτωσης προεπισκόπησης workbook',
      projectFileLabel: 'Αρχείο έργου',
      back: 'Πίσω',
      continueTo: 'Συνέχεια σε',
    },
    generationProgress: {
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
      email: 'Προσχέδια email (.docx)',
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
      emailDrafts: 'Προσχέδια email (.docx)',
      emailFileDesc: 'Επιλέξτε αρχείο κειμένου ως πηγή προτύπου email.',
      emailFileLabel: 'Αρχείο Προτύπου Email',
      emailFilePlaceholder: 'Επιλέξτε αρχείο προτύπου (.txt)',
      excelDesc: 'Επιλέξτε το αρχείο Excel με τις τιμές που θέλετε να χρησιμοποιήσετε.',
      excelLabel: 'Αρχείο Excel',
      excelPlaceholder: 'Επιλέξτε αρχείο Excel (.xlsx)',
      headerRow: 'Γραμμή Επικεφαλίδων',
      headerRowDesc: 'Γραμμή που περιέχει τις επικεφαλίδες στηλών.',
      optionalEmailSource: 'Χρήση υπάρχοντος αρχείου προτύπου email',
      optionalEmailSourceDesc:
        'Ενεργοποιήστε το μόνο αν θέλετε φόρτωση κειμένου email από .txt. Αφήστε το κλειστό για σύνταξη email μέσα στην εφαρμογή.',
      outputFolderDesc:
        'Επιλέξτε πού θα γράφονται τα παραγόμενα DOCX, PDF, προσχέδια και αναφορές.',
      outputFolderLabel: 'Φάκελος Εξόδου',
      outputFolderPlaceholder: 'Επιλέξτε φάκελο εξόδου',
      outputFilenamePatternDesc:
        'Ορίζει το όνομα αρχείου για DOCX/PDF. Χρησιμοποιήστε placeholders όπως {{APPLICATION_ID}} ή απλό κείμενο για λιγότερες υποχρεωτικές αντιστοιχίσεις.',
      outputFilenamePatternLabel: 'Μοτίβο Ονόματος Αρχείου Εξόδου',
      outputFilenamePatternPlaceholder: '{{APPLICATION_CODE}} - {{TITLE}}',
      pdfFiles: 'Αρχεία PDF',
      title: 'Ρύθμιση Έργου',
      subtitle:
        'Συνδέστε τα αρχεία που χρησιμοποιείτε καθημερινά - Excel, Word και φάκελο εξόδου - σε μία καθοδηγούμενη ρύθμιση.',
      whatGenerate: 'Τι θέλετε να δημιουργήσετε;',
      whatGenerateDesc: 'Επιλέξτε έναν ή περισσότερους τύπους εξόδου. Η ροή προσαρμόζεται αυτόματα.',
      wordDesc: 'Επιλέξτε το πρότυπο Word με placeholders όπως {{TITLE}} και {{AUTHOR}}.',
      wordFiles: 'Αρχεία Word (.docx)',
      wordLabel: 'Πρότυπο Word',
      wordPlaceholder: 'Επιλέξτε πρότυπο Word (.docx)',
      worksheet: 'Όνομα Φύλλου',
      worksheetDesc: 'Όνομα φύλλου για ανάγνωση από το workbook.',
      downloadExcelExample: 'Λήψη παραδείγματος Excel',
      downloadWordExample: 'Λήψη παραδείγματος Word',
      downloadEmailExample: 'Λήψη παραδείγματος email',
    },
    contractMapping: {
      badgeMapped: (mapped, total) => `${mapped} / ${total} αντιστοιχισμένα`,
      context: 'Πλαίσιο',
      mappedSample: 'Απόδοση με τιμή δείγματος',
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
      subtitle: 'Συνδέστε κάθε placeholder Word με στήλη Excel για ακριβή δημιουργία εγγράφων.',
      templateFlowTitle: 'Ροή επεξεργασίας προτύπου',
      title: 'Αντιστοίχιση Πεδίων Word',
      tokenWithSample: (sample) => ` με τιμή δείγματος "${sample}"`,
      tokenWithoutSample: ' (δεν υπάρχει ακόμη τιμή δείγματος)',
      workbookVariable: 'Μεταβλητή workbook',
      wordField: 'Πεδίο Word',
      chooseVariable: 'Επιλέξτε μεταβλητή',
      needMorePlaceholdersTitle: 'Χρειάζεστε περισσότερα placeholders;',
      needMorePlaceholdersBody:
        'Προσθέστε δείκτες όπως {{AUTHOR}}, {{TITLE}} ή {{APPLICATION_CODE}} απευθείας στο Word όπου πρέπει να εισαχθούν τιμές. Αποθηκεύστε, κλείστε το Word αν χρειάζεται και πατήστε Επαναφόρτωση πεδίων.',
      statusNoTemplate: 'Επιλέξτε πρότυπο Word στη Ρύθμιση Έργου πριν την αντιστοίχιση.',
      statusTemplateMissing: 'Το επιλεγμένο πρότυπο Word δεν βρέθηκε στον δίσκο.',
      statusTemplateLocked:
        'Το πρότυπο φαίνεται ακόμη ανοιχτό στο Word. Αποθηκεύστε, κλείστε το Word και επαναφορτώστε πεδία.',
      statusTemplateEditedAt: (time) => `Εντοπίστηκε τελευταία αποθήκευση στις ${time}. Κάντε επαναφόρτωση πεδίων αν προσθέσατε ή μετονομάσατε placeholders.`,
      statusTemplateHint: 'Ανοίξτε το πρότυπο Word, αποθηκεύστε τις αλλαγές και κάντε επαναφόρτωση πεδίων.',
    },
    emailBuilder: {
      activeTarget: (target) => `Ενεργό πεδίο: ${target}`,
      body: 'Κείμενο',
      bodyDesc: 'Συντάξτε εδώ το σώμα του email και εισάγετε μεταβλητές workbook όπου χρειάζονται.',
      cc: 'Κοινοποίηση',
      ccDesc: 'Προαιρετικοί παραλήπτες κοινοποίησης.',
      subtitle: 'Κάντε κλικ σε token πεδίου για εισαγωγή στο ενεργό σημείο του κέρσορα.',
      subject: 'Θέμα',
      subjectDesc: 'Κάντε κλικ εδώ και εισάγετε πεδία workbook από πάνω.',
      title: 'Δημιουργός Προτύπου Email',
      to: 'Προς',
      toDesc: 'Κύριος παραλήπτης.',
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
      column: 'Στήλη',
      firstRowValue: 'Τιμή πρώτης γραμμής',
      header: 'Επικεφαλίδα',
      previewUnavailable: 'Η προεπισκόπηση δεν είναι διαθέσιμη',
      refreshing: 'Ανανέωση προεπισκόπησης αντιστοίχισης workbook...',
      selectedVariable: 'Επιλεγμένη μεταβλητή',
      subtitle:
        'Ελέγξτε στήλες workbook, τιμές δείγματος και αντιστοιχίσεις πεδίων για Word και email.',
      title: 'Προεπισκόπηση Αντιστοίχισης Workbook',
      usedBy: 'Χρησιμοποιείται από',
      usedByBoth: '[WORD Field] + Email',
      usedByContract: '[WORD Field]',
      usedByEmail: 'Email',
      usedByNone: 'Κανένα',
      chooseVariable: 'Επιλέξτε μεταβλητή',
    },
    review: {
      badge: 'Έλεγχος',
      checksPassSummary: (passed, total) => `${passed}/${total} Έλεγχοι OK`,
      emailBodyLength: 'Μήκος κειμένου email',
      fixIssue: 'Διόρθωση',
      goodToGenerateBody:
        'Τα αρχεία, οι αντιστοιχίσεις, ο φάκελος εξόδου και οι επιλογές δημιουργίας πέρασαν τον προέλεγχο.',
      goodToGenerateTitle: 'Έτοιμο για δημιουργία',
      hideDetails: 'Απόκρυψη λεπτομερειών',
      issuesFound: (count) => `${count} θέματα χρειάζονται έλεγχο`,
      mappedColumns: 'Αντιστοιχισμένες στήλες workbook',
      mappedWordFields: 'Αντιστοιχισμένα πεδία Word',
      needsAttentionBody: 'Διορθώστε τους αποτυχημένους ελέγχους πριν εκτελέσετε τη δημιουργία.',
      needsAttentionTitle: 'Χρειάζεται έλεγχο',
      outputPlan: 'Πλάνο εξόδου',
      pdfBackend: 'Backend PDF',
      preflightLoadingBody:
        'Έλεγχος αρχείων, αντιστοιχίσεων, πρόσβασης workbook, φακέλου εξόδου και δυνατότητας PDF.',
      preflightLoadingTitle: 'Εκτέλεση προελέγχων',
      rowsFound: 'Γραμμές που βρέθηκαν',
      selectedOutput: 'Επιλεγμένη έξοδος',
      setupCheck: 'Έλεγχος Ρύθμισης',
      showDetails: 'Προβολή λεπτομερειών',
      subtitle: 'Τελικός έλεγχος κάλυψης προτύπων, αντιστοιχίσεων και ρυθμίσεων εξόδου πριν τη δημιουργία.',
      statusFail: 'ΑΠΟΤΥΧΙΑ',
      statusPass: 'OK',
      statusWarn: 'ΠΡΟΣΟΧΗ',
      title: 'Έτοιμο για Δημιουργία',
    },
    setupPreview: {
      badge: 'Προεπισκόπηση ρύθμισης',
      fieldsFoundInWord: 'Πεδία που βρέθηκαν στο πρότυπο Word',
      loadCheck: 'Έλεγχος Φόρτωσης',
      noTemplateFields:
        'Δεν βρέθηκαν placeholders προτύπου. Προσθέστε δείκτες όπως {{AUTHOR}} ή {{TITLE}} μέσα στο DOCX όπου θέλετε να μπαίνουν τιμές Excel. Έπειτα αποθηκεύστε και είτε επιλέξτε ξανά το πρότυπο στη Ρύθμιση Έργου είτε ανοίξτε ξανά το ίδιο αρχείο για ανανέωση της λίστας.',
      previewUnavailable: 'Η προεπισκόπηση δεν είναι διαθέσιμη',
      quickCheck: 'Γρήγορος έλεγχος workbook',
      quickCheckDesc: (rows) =>
        `Εμφανίζονται οι πρώτες ${rows} γραμμές δεδομένων ώστε να επαληθεύσετε ρυθμίσεις φύλλου και γραμμών πριν τη μαζική δημιουργία.`,
      refreshing: 'Ανανέωση προεπισκόπησης πηγών...',
      row: 'Γραμμή',
      subtitle: 'Επιβεβαιώστε τα πεδία Word και δείγματα τιμών Excel πριν την αντιστοίχιση.',
      wordTemplateNotSelected: 'Επιλέξτε πρότυπο Word για προεπισκόπηση placeholders. Ο έλεγχος φόρτωσης Excel εκτελείται ήδη.',
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
      noFilesYet: 'Δεν βρέθηκαν ακόμη αρχεία εξόδου.',
      open: 'Άνοιγμα',
      openDrafts: 'Άνοιγμα Προσχεδίων Email',
      openOutputFolder: 'Άνοιγμα Φακέλου Εξόδου',
      openReport: 'Άνοιγμα Αναφοράς',
      outputMetrics: 'Μετρήσεις εξόδου',
      pdfFiles: 'Αρχεία PDF',
      resultTree: 'Δέντρο αποτελεσμάτων',
      rowsFound: 'Γραμμές που βρέθηκαν',
      startAgain: 'Νέα Εκκίνηση',
      subtitle: 'Ελέγξτε τα παραγόμενα αρχεία και ανοίξτε τα απευθείας από αυτή τη λίστα.',
      skippedRows: 'Γραμμές που παραλείφθηκαν',
      summary: (generated, skipped) => `${generated} δημιουργήθηκαν / ${skipped} παραλείφθηκαν`,
      warningsTitle: 'Προειδοποιήσεις',
    },
    fileField: {
      browse: 'Περιήγηση',
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
