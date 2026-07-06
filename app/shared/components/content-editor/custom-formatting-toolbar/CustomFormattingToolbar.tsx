import { blockTypeSelectItems, FormattingToolbar, getFormattingToolbarItems, TextAlignButton,useBlockNoteEditor  } from '@blocknote/react';

import { MediaModalResult } from '../../media-modal/MediaModal.types';
import { CustomReplaceButton } from '../custom-replace-button/CustomReplaceButton';
interface Props {
  openMediaModal: () => Promise<MediaModalResult | null>;
}

export const CustomFormattingToolbar = ({ openMediaModal }: Props) => {
  const editor = useBlockNoteEditor();
  const defaultDropdownItems = blockTypeSelectItems(editor.dictionary);

  const customizedDropdownItems = defaultDropdownItems.filter((it) =>
    !(it.type === 'heading' && it.name.includes('Toggle Heading')) && it.type !== 'quote' && it.type !== 'toggleListItem'
  );

  const mainToolbarItems = getFormattingToolbarItems(customizedDropdownItems);
  const filteredMainToolbarItems = mainToolbarItems.filter((it) => it.key !== 'strikeStyleButton' && it.key !== 'colorStyleButton' && it.key !== 'nestBlockButton' && it.key !== 'unnestBlockButton');

  const replaceIndex = filteredMainToolbarItems.findIndex((item) => item.key === 'replaceFileButton');

  if (replaceIndex !== -1) {
    filteredMainToolbarItems.splice(replaceIndex, 1, <CustomReplaceButton key="customReplaceButton" openMediaModal={openMediaModal} />);
  }
  
  const rightAlignIndex = filteredMainToolbarItems.findIndex((item) => item.key === 'textAlignRightButton');
  
  if (rightAlignIndex !== -1) {
    filteredMainToolbarItems.splice(rightAlignIndex + 1, 0, <TextAlignButton textAlignment="justify" key="textAlignJustifyButton" />);
  }

  return <FormattingToolbar>{filteredMainToolbarItems}</FormattingToolbar>;
};
