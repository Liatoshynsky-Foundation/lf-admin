import {  FormattingToolbar, getFormattingToolbarItems } from '@blocknote/react';

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

  return <FormattingToolbar>{items}</FormattingToolbar>;
};
