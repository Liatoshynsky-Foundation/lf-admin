import { GroupContentView } from './GroupContentView';

type ContentGroupPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function ContentGroupPage({ params }: ContentGroupPageProps) {
  const { id } = await params;
  return <GroupContentView id={id} />;
}
