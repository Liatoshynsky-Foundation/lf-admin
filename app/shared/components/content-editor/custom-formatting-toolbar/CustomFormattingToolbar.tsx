import { FormattingToolbar, getFormattingToolbarItems, TextAlignButton } from '@blocknote/react';

import { MediaModalResult } from '../../media-modal/MediaModal.types';
import { CustomReplaceButton } from '../custom-replace-button/CustomReplaceButton';
interface Props {
  openMediaModal: () => Promise<MediaModalResult | null>;
}

export const CustomFormattingToolbar = ({ openMediaModal }: Props) => {
  const items = getFormattingToolbarItems();
  const replaceIndex = items.findIndex((item) => item.key === 'replaceFileButton');

  if (replaceIndex !== -1) {
    items.splice(replaceIndex, 1, <CustomReplaceButton key="customReplaceButton" openMediaModal={openMediaModal} />);
  }

  const rightAlignIndex = items.findIndex((item) => item.key === 'textAlignRightButton');
  if (rightAlignIndex !== -1) {
    items.splice(rightAlignIndex + 1, 0, <TextAlignButton textAlignment="justify" key="textAlignJustifyButton" />);
  }

  return <FormattingToolbar>{items}</FormattingToolbar>;
};
