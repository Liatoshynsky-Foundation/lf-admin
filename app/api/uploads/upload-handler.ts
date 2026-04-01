import { config as appConfig } from '~/back-config';
import { initializeUploadModule } from '~/uploads/initialize';
import { UploadOptions } from '~/uploads/types';

export interface RouteParams {
    params: Promise<{ filename: string }>;
}

let uploadModule: ReturnType<typeof initializeUploadModule> | null = null;

export const getUploadModule = () => {
  uploadModule ??= initializeUploadModule(appConfig);
  return uploadModule;
};

export const parseFormDataOptions = (formData: FormData): UploadOptions => {
  const options: UploadOptions = {};

  const fileType = formData.get('fileType');
  const directory = formData.get('directory');
  const validationRules = formData.get('validationRules');
  const metadata = formData.get('metadata');

  if (typeof fileType === 'string') options.fileType = fileType as UploadOptions['fileType'];
  if (typeof directory === 'string') options.directory = directory;

  const tryParse = (value: unknown): Record<string, unknown> | undefined => {
    if (typeof value !== 'string') return undefined;
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  };

  options.validationRules = tryParse(validationRules);
  options.metadata = tryParse(metadata);

  return options;
};