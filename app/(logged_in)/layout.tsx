import '../globals.css';
import { Box } from '@mui/material';

import { styles } from './layout.styles';
import BodyProvider from '~/providers/body-provider/BodyProvider';
import { SideBarNavigation } from '~/shared/components/side-navigation/SideNavigation';
import DiscardModalProvider from '~/shared/providers/discard-modal-provider/DiscardModalProvider';
import { Wrapper } from '~/types/common';

export { metadata } from '~/providers/body-provider/BodyProvider';

export default async function RootLayout({ children }: Wrapper) {
  return (
    <BodyProvider>
      <DiscardModalProvider>
        <Box sx={styles.body}>
          <SideBarNavigation />
          <Box sx={styles.container}>{children}</Box>
        </Box>
      </DiscardModalProvider>
    </BodyProvider>
  );
}
