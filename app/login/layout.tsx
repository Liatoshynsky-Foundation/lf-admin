import '../globals.css';

import BodyProvider, { metadata as LayoutMetadata } from '~/shared/components/body-provider/BodyProvider';

export const metadata = LayoutMetadata;

export default async function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <BodyProvider>{children}</BodyProvider>;
}
