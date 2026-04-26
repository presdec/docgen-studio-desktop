import { useState } from 'react';
import { Alert, Badge, Button, Collapse, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import type { ProjectPreflightCheck } from '../../shared/desktop';
import type { ProjectPreflightResult } from '../../shared/desktop';
import type { EmailTemplateState, GenerationOptions, WorkbookPreviewRow } from '../types/template';
import type { WizardStepId } from '../types/template';
import { useI18n } from '../i18n';

type Props = {
  generationOptions: GenerationOptions;
  mappedContractFields: number;
  totalContractFields: number;
  emailTemplate: EmailTemplateState;
  preflight: ProjectPreflightResult | null;
  preflightLoading: boolean;
  rows: WorkbookPreviewRow[];
  totalRows: number;
  onGoToStep: (step: WizardStepId) => void;
};

function stepForCheck(checkId: string, generationOptions: GenerationOptions): WizardStepId | null {
  if ([
    'outputs',
    'workbook',
    'output-directory',
    'worksheet',
    'pdf-backend',
    'python-runtime',
    'runtime-services',
  ].includes(checkId)) {
    return 1;
  }

  if (checkId === 'contract-template') {
    return 1;
  }

  if (['mappings', 'required-placeholders'].includes(checkId)) {
    return generationOptions.generateDocx || generationOptions.generatePdf ? 2 : 3;
  }

  if (checkId === 'email-template-file') {
    return 3;
  }

  return null;
}

function formatPdfBackend(value: ProjectPreflightResult['pdfBackend'] | undefined) {
  if (value === 'libreoffice') {
    return 'LibreOffice';
  }
  if (value === 'word') {
    return 'Microsoft Word';
  }
  return 'None';
}

function localizePreflightCheck(check: ProjectPreflightCheck, language: 'en' | 'el') {
  if (language !== 'el') {
    return check;
  }

  const greekById: Record<string, { detail: string; label: string }> = {
    'outputs': {
      label: 'Επιλογή εξόδου',
      detail: 'Επιλέξτε τουλάχιστον έναν τύπο εξόδου πριν τη δημιουργία.',
    },
    'payload': {
      label: 'Δεδομένα δημιουργίας',
      detail: 'Αδυναμία προετοιμασίας δεδομένων δημιουργίας.',
    },
    'python-runtime': {
      label: 'Runtime Python',
      detail: 'Έλεγχος διαθεσιμότητας runtime Python.',
    },
    'runtime-services': {
      label: 'Υπηρεσίες runtime',
      detail: 'Έλεγχος ύπαρξης των απαραίτητων υπηρεσιών generator.',
    },
    'workbook': {
      label: 'Αρχείο workbook',
      detail: 'Το workbook πρέπει να υπάρχει στον δίσκο.',
    },
    'contract-template': {
      label: 'Πρότυπο Word',
      detail: 'Το πρότυπο Word είναι απαραίτητο για DOCX ή PDF.',
    },
    'email-template-file': {
      label: 'Αρχείο προτύπου email',
      detail: 'Επιλέξτε έγκυρο αρχείο προτύπου email ή απενεργοποιήστε την επιλογή εξωτερικού αρχείου.',
    },
    'output-directory': {
      label: 'Φάκελος εξόδου',
      detail: 'Ο φάκελος εξόδου πρέπει να είναι προσβάσιμος για εγγραφή.',
    },
    'worksheet': {
      label: 'Φύλλο και ρυθμίσεις γραμμών',
      detail: 'Επαλήθευση ονόματος φύλλου, γραμμής επικεφαλίδων και γραμμής έναρξης δεδομένων.',
    },
    'mappings': {
      label: 'Αντιστοιχίσεις placeholders',
      detail: 'Απαιτείται τουλάχιστον μία αντιστοίχιση Word, ονόματος εξόδου ή email placeholder.',
    },
    'required-placeholders': {
      label: 'Κάλυψη απαιτούμενων placeholders',
      detail: 'Όλα τα απαιτούμενα placeholders Word, ονόματος εξόδου και email πρέπει να είναι αντιστοιχισμένα.',
    },
    'pdf-backend': {
      label: 'Δυνατότητα PDF',
      detail: 'Απαιτείται διαθέσιμο backend PDF για παραγωγή PDF.',
    },
    'preflight-runtime': {
      label: 'Προέλεγχος',
      detail: 'Αδυναμία εκτέλεσης προελέγχου.',
    },
  };

  const localized = greekById[check.id];
  if (!localized) {
    return check;
  }

  return {
    ...check,
    detail: check.status === 'fail' ? `${localized.detail} ${check.detail}` : localized.detail,
    label: localized.label,
  };
}

export function ReviewSummaryPanel({
  generationOptions,
  mappedContractFields,
  totalContractFields,
  emailTemplate,
  preflight,
  preflightLoading,
  rows,
  totalRows,
  onGoToStep,
}: Props) {
  const { copy, language } = useI18n();
  const [showSetupCheckDetails, setShowSetupCheckDetails] = useState(false);
  const mappedRows = rows.filter((row) => row.selectedVariable);
  const outputLabel = [
    generationOptions.generateDocx ? copy.outputLabels.word : null,
    generationOptions.generatePdf ? copy.outputLabels.pdf : null,
    generationOptions.generateEmailDrafts ? copy.outputLabels.email : null,
  ].filter(Boolean).join(' + ');
  const failedChecks = preflight?.checks.filter((check) => check.status === 'fail') ?? [];
  const warningChecks = preflight?.checks.filter((check) => check.status === 'warn') ?? [];
  const passedChecks = preflight?.checks.filter((check) => check.status === 'pass') ?? [];
  const totalChecks = preflight?.checks.length ?? 0;
  const issueCount = failedChecks.length + warningChecks.length;
  const readyToGenerate = Boolean(preflight?.canGenerate);

  return (
    <Paper className="panel-card" p="lg" radius="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={3}>{copy.review.title}</Title>
            <Text c="dimmed" size="sm">
              {copy.review.subtitle}
            </Text>
          </div>
          <Badge color="teal" variant="light">
            {copy.review.badge}
          </Badge>
        </Group>

        <Alert
          color={readyToGenerate ? 'teal' : preflightLoading ? 'blue' : 'red'}
          title={
            readyToGenerate
              ? copy.review.goodToGenerateTitle
              : preflightLoading
                ? copy.review.preflightLoadingTitle
                : copy.review.needsAttentionTitle
          }
          variant="light"
        >
          {readyToGenerate
            ? copy.review.goodToGenerateBody
            : preflightLoading
              ? copy.review.preflightLoadingBody
              : `${copy.review.needsAttentionBody} ${copy.review.issuesFound(issueCount)}.`}
        </Alert>

        <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="md">
          <Paper className="mini-stat" p="md" radius="lg">
            <Text c="dimmed" size="sm">{copy.review.rowsFound}</Text>
            <Title order={2}>{totalRows}</Title>
          </Paper>
          <Paper className="mini-stat" p="md" radius="lg">
            <Text c="dimmed" size="sm">{copy.review.mappedColumns}</Text>
            <Title order={2}>{mappedRows.length}</Title>
          </Paper>
          {generationOptions.generateDocx || generationOptions.generatePdf ? (
            <Paper className="mini-stat" p="md" radius="lg">
              <Text c="dimmed" size="sm">{copy.review.mappedWordFields}</Text>
              <Title order={2}>
                {mappedContractFields}/{totalContractFields}
              </Title>
            </Paper>
          ) : null}
          <Paper className="mini-stat" p="md" radius="lg">
            <Text c="dimmed" size="sm">{copy.review.pdfBackend}</Text>
            <Title order={2}>{formatPdfBackend(preflight?.pdfBackend)}</Title>
          </Paper>
        </SimpleGrid>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" wrap="nowrap">
            <div>
              <Text fw={700} size="sm">{copy.review.outputPlan}</Text>
              <Text c="dimmed" size="sm">
                {copy.review.selectedOutput}: {outputLabel || copy.outputLabels.none}
              </Text>
            </div>
            <Badge color={readyToGenerate ? 'teal' : 'gray'} variant="light">
              {copy.review.emailBodyLength}: {emailTemplate.body.length}
            </Badge>
          </Group>
        </Paper>

        {preflight ? (
          <Stack gap="sm">
            <Group justify="space-between" wrap="nowrap">
              <Title order={4}>{copy.review.setupCheck}</Title>
              <Group gap="xs" wrap="nowrap">
                <Badge color={readyToGenerate ? 'teal' : issueCount > 0 ? 'red' : 'gray'} variant="light">
                  {copy.review.checksPassSummary(passedChecks.length, totalChecks)}
                </Badge>
                <Button
                  onClick={() => setShowSetupCheckDetails((current) => !current)}
                  size="compact-sm"
                  variant="subtle"
                >
                  {showSetupCheckDetails ? copy.review.hideDetails : copy.review.showDetails}
                </Button>
              </Group>
            </Group>

            <Collapse in={showSetupCheckDetails}>
              <Stack gap="sm">
                {preflight.checks.map((check) => {
                  const localizedCheck = localizePreflightCheck(check, language);
                  const targetStep = stepForCheck(check.id, generationOptions);

                  return (
                    <Paper key={check.id} p="sm" radius="md" withBorder>
                      <Group justify="space-between" wrap="nowrap">
                        <Group align="flex-start" wrap="nowrap">
                          <ThemeIcon
                            color={
                              localizedCheck.status === 'pass'
                                ? 'teal'
                                : localizedCheck.status === 'warn'
                                  ? 'yellow'
                                  : 'red'
                            }
                            radius="xl"
                            size="sm"
                            variant="light"
                          >
                            {localizedCheck.status === 'pass' ? 'OK' : '!'}
                          </ThemeIcon>
                          <div>
                            <Text fw={600} size="sm">{localizedCheck.label}</Text>
                            <Text c="dimmed" size="sm">{localizedCheck.detail}</Text>
                          </div>
                        </Group>
                        <Group gap="xs" wrap="nowrap">
                          <Badge
                            color={
                              localizedCheck.status === 'pass'
                                ? 'teal'
                                : localizedCheck.status === 'warn'
                                  ? 'yellow'
                                  : 'red'
                            }
                            variant="light"
                          >
                            {localizedCheck.status === 'pass'
                              ? copy.review.statusPass
                              : localizedCheck.status === 'warn'
                                ? copy.review.statusWarn
                                : copy.review.statusFail}
                          </Badge>
                          {localizedCheck.status !== 'pass' && targetStep ? (
                            <Button
                              onClick={() => onGoToStep(targetStep)}
                              size="compact-xs"
                              variant="subtle"
                            >
                              {copy.review.fixIssue}
                            </Button>
                          ) : null}
                        </Group>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </Collapse>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
