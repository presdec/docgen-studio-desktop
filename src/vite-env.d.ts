/// <reference types="vite/client" />

import type {
  FileDialogRequest,
  GenerateProjectRequest,
  GenerateProjectResult,
  InspectProjectRequest,
  InspectProjectResult,
  OpenPathRequest,
  ProjectOpenResult,
  SavedProjectDocument,
  SaveStarterTemplateRequest,
  TemplateStatusRequest,
  TemplateStatusResult,
} from '../shared/desktop';

declare global {
  interface Window {
    desktopApp: {
      generateProject: (request: GenerateProjectRequest) => Promise<GenerateProjectResult>;
      getTemplateStatus: (request: TemplateStatusRequest) => Promise<TemplateStatusResult>;
      inspectProject: (request: InspectProjectRequest) => Promise<InspectProjectResult>;
      openPath: (request: OpenPathRequest) => Promise<null | string>;
      openProject: () => Promise<ProjectOpenResult | null>;
      pickPath: (request: FileDialogRequest) => Promise<string | null>;
      platform: string;
      saveStarterTemplate: (request: SaveStarterTemplateRequest) => Promise<string | null>;
      saveProject: (project: SavedProjectDocument) => Promise<string | null>;
    };
  }
}

export {};
