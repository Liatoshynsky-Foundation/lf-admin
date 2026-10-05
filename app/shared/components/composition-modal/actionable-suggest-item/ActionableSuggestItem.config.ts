export interface SuggestItemModeConfig {
  label: string;
  placeholder: string;
}

export const suggestItemConfigs = {
  audio: {
    label: 'Назва аудіо *',
    placeholder: 'Введіть назву аудіо',
  },
  notes: {
    label: 'Назва нот *',
    placeholder: 'Введіть назву нот',
  },
  pdf: {
    label: 'Назва PDF',
    placeholder: 'Введіть назву PDF',
  }
} as const;

export type SuggestItemMode = keyof typeof suggestItemConfigs;
