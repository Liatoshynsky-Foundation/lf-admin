export interface SuggestItemModeConfig {
  label: string;
  placeholder: string;
  showDatePicker: boolean;
}

export const suggestItemConfigs = {
  audio: {
    label: 'Назва аудіо *',
    placeholder: 'Введіть назву аудіо',
    showDatePicker: false
  },
  notes: {
    label: 'Назва нот *',
    placeholder: 'Введіть назву нот',
    showDatePicker: true
  },
  pdf: {
    label: 'Назва PDF *',
    placeholder: 'Введіть назву PDF',
    showDatePicker: false
  }
} as const;

export type SuggestItemMode = keyof typeof suggestItemConfigs;
