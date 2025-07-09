export const styles = {
  cropper: {
    justifySelf: 'anchor-center',
    '.ReactCrop__crop-selection': {
      border: '2px white solid'
    },
    '.ReactCrop__crop-selection:not(.ReactCrop--no-animate .ReactCrop__crop-selection)': {
      backgroundImage: 'none'
    },
    '.ReactCrop__rule-of-thirds-hz::before, .ReactCrop__rule-of-thirds-hz::after, .ReactCrop__rule-of-thirds-vt::before, .ReactCrop__rule-of-thirds-vt::after ':
      {
        backgroundColor: 'white'
      }
  }
};
