import { Modal } from '@mui/material';

import { CropperLF } from './Cropper';

export const ModalLF = () => {
  return (
    <Modal open={true}>
      <CropperLF width={500} height={500} imageUrl="./Image.png" />
    </Modal>
  );
};
