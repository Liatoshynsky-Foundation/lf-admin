export const styles = {
  errorImgContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    p: 4,
    color: 'text.secondary'
  },
  imageContainer: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cropComponent: {
    display: 'flex',
    maxWidth: '100%',
    maxHeight: '100%'
  },
  cropComponentImage: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block'
  }
};

export const cropViewContainer = (imgDimensions: { width: number; height: number } | null, forCropAngle: number) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  overflow: 'hidden',

  '& .ReactCrop__child-wrapper': {
    width: imgDimensions ? `${imgDimensions.width}px !important` : 'auto',
    height: imgDimensions ? `${imgDimensions.height}px !important` : 'auto'
  },

  '& .ReactCrop__crop-selection': {
    animation: 'none !important',
    backgroundImage: 'none !important',

    border: '1px solid #fff',

    background: `
            linear-gradient(#fff, #fff), linear-gradient(#fff, #fff),
            linear-gradient(#fff, #fff), linear-gradient(#fff, #fff),
            linear-gradient(#fff, #fff), linear-gradient(#fff, #fff),
            linear-gradient(#fff, #fff), linear-gradient(#fff, #fff)
           !important`,

    backgroundPosition: `
            top left, top left,        
            top right, top right,      
            bottom left, bottom left,   
            bottom right, bottom right 
          !important`,

    backgroundRepeat: 'no-repeat !important',

    backgroundSize: `
            ${forCropAngle}px 4px, 4px ${forCropAngle}px,  
            ${forCropAngle}px 4px, 4px ${forCropAngle}px,  
            ${forCropAngle}px 4px, 4px ${forCropAngle}px,  
            ${forCropAngle}px 4px, 4px ${forCropAngle}px    
          !important`,
    '&::after': { display: 'none !important', content: 'none' },
    '&::before': { display: 'none !important', content: 'none' }
  },

  '& .ReactCrop__rule-of-thirds-vt': {
    width: '1px !important',
    height: '100% !important'
  },
  '& .ReactCrop__rule-of-thirds-hz': {
    height: '1px !important',
    width: '100% !important'
  }
});
