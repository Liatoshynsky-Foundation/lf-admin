interface ChangeHandlers {
  onTitleChange?: (newValue: string) => void;
  onDescriptionChange?: (newValue: string) => void;
  onMainTextChange?: (newValue: string) => void;
  onParagraphsChange?: (index: number, newValue: string) => void;
}

export interface DescriptiveTextBlock extends ChangeHandlers {
  title: string;
  description: string;
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
