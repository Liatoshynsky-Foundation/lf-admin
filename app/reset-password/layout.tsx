import '../globals.css';

import { Toaster } from '~/shared/components/toaster/Toaster';

export { metadata } from '~/providers/body-provider/BodyProvider';
import BodyProvider from '~/providers/body-provider/BodyProvider';

export default async function ResetPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <BodyProvider>
      {children}
      <Toaster />
    </BodyProvider>
  );
}
