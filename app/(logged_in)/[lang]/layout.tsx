import '../../globals.css';
import { Box } from '@mui/material';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { styles } from './layout.styles';
import { routing } from '~/../i18n/routing';
import { SideBarNavigation } from '~/components/side-navigation/SideNavigation';
import BodyProvider from '~/providers/body-provider/BodyProvider';
import DiscardModalProvider from '~/providers/discard-modal-provider/DiscardModalProvider';
import { Wrapper } from '~/types/common';

export { metadata } from '~/providers/body-provider/BodyProvider';

interface LocaleLayoutProps extends Wrapper {
    params: Promise<{ lang: string }>;
}

export default async function RootLayout({ children, params }: Readonly<LocaleLayoutProps>) {
  const { lang } = await params;

  if (!routing.locales.includes(lang as 'en' | 'uk')) {
    notFound();
  }

  setRequestLocale(lang);

  let messages;
  try {
    messages = await getMessages();
  } catch {
    notFound();
  }

  return (
    <html lang={lang}>
      <body>
        <NextIntlClientProvider messages={messages} locale={lang}>
          <BodyProvider>
            <DiscardModalProvider>
              <Box sx={styles.body}>
                <SideBarNavigation />
                <Box sx={styles.container}>{children}</Box>
              </Box>
            </DiscardModalProvider>
          </BodyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}