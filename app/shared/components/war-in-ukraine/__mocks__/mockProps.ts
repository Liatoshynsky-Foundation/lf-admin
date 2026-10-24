import type { ReactNode } from 'react';

import type { ClickableButtonData } from '../ConfigurableButtonList/ConfigurableButtonList';

export interface MockCollapsibleBlockProps {
  title: string;
  children: ReactNode;
  hidden?: boolean;
  onToggleVisibility?: () => void;
}

export interface MockCustomTextFieldProps<TValue = string> {
  title: string;
  label?: string;
  value?: TValue;
  onChange: (value: string | { target: { value: string } }) => void;
}

export interface MockConfigurableListProps<TItem extends { id: string | number }> {
  items: TItem[];
  addBtnLabel: string;
  onCreate: () => void;
  onChange: (item: TItem) => void;
  onDelete: (id: TItem['id']) => void;
  renderItem: (params: { item: TItem; index: number }) => ReactNode;
}

export interface MockConfigurableButtonListProps {
  buttons: Partial<ClickableButtonData>[];
  onChange: (buttons: ClickableButtonData[]) => void;
}
