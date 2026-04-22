import { useAtomValue, useSetAtom } from 'jotai/react';
import { useCallback, useState } from 'react';
import { hydrateWorkspaceAtom, workspaceDocumentAtom } from '../state/workspace';

export function useProjectPersistence(desktopApp: Window['desktopApp']) {
  const workspaceDocument = useAtomValue(workspaceDocumentAtom);
  const hydrateWorkspace = useSetAtom(hydrateWorkspaceAtom);
  const [isOpeningProject, setIsOpeningProject] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [lastProjectPath, setLastProjectPath] = useState<string | null>(null);

  const openProject = useCallback(async () => {
    setIsOpeningProject(true);
    try {
      const result = await desktopApp.openProject();
      if (!result) {
        return null;
      }

      hydrateWorkspace(result.projectDocument);
      setLastProjectPath(result.filePath);
      return result.filePath;
    } finally {
      setIsOpeningProject(false);
    }
  }, [desktopApp, hydrateWorkspace]);

  const saveProject = useCallback(async () => {
    setIsSavingProject(true);
    try {
      const savedPath = await desktopApp.saveProject(workspaceDocument);
      if (!savedPath) {
        return null;
      }

      setLastProjectPath(savedPath);
      return savedPath;
    } finally {
      setIsSavingProject(false);
    }
  }, [desktopApp, workspaceDocument]);

  return {
    isOpeningProject,
    isSavingProject,
    lastProjectPath,
    openProject,
    saveProject,
  };
}
