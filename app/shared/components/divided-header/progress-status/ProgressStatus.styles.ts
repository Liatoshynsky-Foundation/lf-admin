import { keyframes } from '@mui/material';

export const styles = {
  blinkStay: keyframes`
  0% { opacity: 0.3; }
  100% { opacity: 1; }
`,

  blinkThenFade: keyframes`
  0% { opacity: 0.3; }
  20% { opacity: 1; }
  80% {opacity: 1;}
  100% { opacity: 0; user-select: none; pointer-events: none; }
`
};
