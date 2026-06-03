import '../globals.css';

import BodyProvider, { metadata as LayoutMetadata } from '~/providers/body-provider/BodyProvider';
import { Toaster } from '~/shared/components/toaster/Toaster';

export const metadata = LayoutMetadata;

export default async function ResetPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <BodyProvider>
      {children}
      <Toaster />
    </BodyProvider>
  );
}
