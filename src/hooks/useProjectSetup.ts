import { useAtom } from 'jotai/react';
import { useCallback, useState } from 'react';
import type { FileDialogRequest, ProjectConfig } from '../../shared/desktop';
import { projectAtom } from '../state/workspace';

export function useProjectSetup(desktopApp: Window['desktopApp']) {
  const [activePicker, setActivePicker] = useState<keyof ProjectConfig | null>(null);
  const [project, setProject] = useAtom(projectAtom);

  const pickProjectPath = useCallback(async (
    field: keyof Pick<
      ProjectConfig,
      'workbookPath' | 'contractTemplatePath' | 'emailTemplatePath' | 'outputFolderPath'
    >,
    request: FileDialogRequest,
  ) => {
    setActivePicker(field);
    try {
      const selectedPath = await desktopApp.pickPath(request);
      if (!selectedPath) {
        return null;
      }
      setProject((current) => {
        if (current[field] === selectedPath) {
          return current;
        }

        return { ...current, [field]: selectedPath };
      });
      return selectedPath;
    } finally {
      setActivePicker(null);
    }
  }, [desktopApp]);

  return {
    activePicker,
    pickProjectPath,
    project,
    setProject,
  };
}
