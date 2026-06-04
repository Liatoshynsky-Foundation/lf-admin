import '../globals.css';

import BodyProvider from '~/providers/body-provider/BodyProvider';
export { metadata } from '~/providers/body-provider/BodyProvider';
import { Toaster } from '~/shared/components/toaster/Toaster';

export default async function ForgotPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <BodyProvider>
      {children}
      <Toaster />
    </BodyProvider>
  );
}
