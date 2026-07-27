import '../globals.css';
import { Box } from '@mui/material';

import { styles } from './layout.styles';
import BodyProvider from '~/providers/body-provider/BodyProvider';
import { SideBarNavigation } from '~/shared/components/side-navigation/SideNavigation';
import { Toaster } from '~/shared/components/toaster/Toaster';
import DiscardModalProvider from '~/shared/providers/discard-modal-provider/DiscardModalProvider';
import { SessionTimeoutProvider } from '~/shared/providers/session-timeout-provider/SessionTimeoutProvider';
import { Wrapper } from '~/types/common';

export { metadata } from '~/providers/body-provider/BodyProvider';

export default async function RootLayout({ children }: Wrapper) {
  return (
    <BodyProvider>
      <SessionTimeoutProvider>
        <DiscardModalProvider>
          <Box sx={styles.body}>
            <SideBarNavigation />
            <Box sx={styles.container}>{children}</Box>
          </Box>
        </DiscardModalProvider>
      </SessionTimeoutProvider>
      <Toaster />
    </BodyProvider>
  );
}
