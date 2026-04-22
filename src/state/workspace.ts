import { atom } from 'jotai/vanilla';
import type { SavedProjectDocument } from '../../shared/desktop';
import { defaultGenerationOptions, initialEmailTemplate, initialProject } from '../data/defaults';
import type { EmailTemplateState, GenerationOptions, WizardStepId } from '../types/template';

function sanitizeRecord(record: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value.trim().length > 0),
  );
}

function normalizeStep(value: number | undefined): WizardStepId {
  return value === 2 || value === 3 || value === 4 ? value : 1;
}

export const projectAtom = atom(initialProject);
export const emailTemplateAtom = atom<EmailTemplateState>(initialEmailTemplate);
export const generationOptionsAtom = atom<GenerationOptions>(defaultGenerationOptions);
export const tokenMappingsAtom = atom<Record<string, string>>({});
export const variableColumnsAtom = atom<Record<string, string>>({});
export const activeStepAtom = atom<WizardStepId>(1);

export const workspaceDocumentAtom = atom<SavedProjectDocument>((get) => ({
  activeStep: get(activeStepAtom),
  emailTemplate: get(emailTemplateAtom),
  generationOptions: get(generationOptionsAtom),
  project: get(projectAtom),
  tokenMappings: sanitizeRecord(get(tokenMappingsAtom)),
  variableColumns: sanitizeRecord(get(variableColumnsAtom)),
  version: 1,
}));

export const hydrateWorkspaceAtom = atom(
  null,
  (_get, set, projectDocument: SavedProjectDocument) => {
    set(projectAtom, {
      ...initialProject,
      ...projectDocument.project,
      useOptionalEmailSource: projectDocument.project.useOptionalEmailSource ?? false,
    });
    set(emailTemplateAtom, {
      ...initialEmailTemplate,
      ...projectDocument.emailTemplate,
    });
    set(generationOptionsAtom, {
      ...defaultGenerationOptions,
      ...projectDocument.generationOptions,
    });
    set(tokenMappingsAtom, { ...projectDocument.tokenMappings });
    set(variableColumnsAtom, { ...projectDocument.variableColumns });
    set(activeStepAtom, normalizeStep(projectDocument.activeStep));
  },
);
