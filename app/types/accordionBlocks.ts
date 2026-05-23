import { JSONContent } from '@tiptap/react';

interface ChangeHandlers {
  onTitleChange?: (newValue: JSONContent) => void;
  onDescriptionChange?: (newValue: JSONContent) => void;
  onMainTextChange?: (newValue: JSONContent) => void;
  onParagraphsChange?: (index: number, newValue: JSONContent) => void;
}

export interface DescriptiveTextBlock extends ChangeHandlers {
  title: JSONContent;
  description: JSONContent;
}

export interface TextBlock extends ChangeHandlers {
  text: string;
}

export interface Paragraph {
  id: number;
  text: string;
}

export interface ParagraphsBlock extends ChangeHandlers {
  mainText: string;
  paragraphs: Paragraph[];
}

export interface ConfigurableListItem {
  id: number | string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ContributorData extends ConfigurableListItem {
  name: string;
  description: string;
}
