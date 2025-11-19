import '../globals.css';
import { Box } from '@mui/material';

import { styles } from './layout.styles';
import BodyProvider from '~/providers/body-provider/BodyProvider';
import { SideBarNavigation } from '~/shared/components/side-navigation/SideNavigation';
import DiscardModalProvider from '~/shared/providers/discard-modal-provider/DiscardModalProvider';

export { metadata } from '~/providers/body-provider/BodyProvider';

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BodyProvider>
      <DiscardModalProvider>
        <Box sx={styles.container}>
          <SideBarNavigation />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{children}</Box>
        </Box>
      </DiscardModalProvider>
    </BodyProvider>
  );
}
