import { EditOpusView } from './EditOpusView';

type EditOpusPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function EditOpusPage({ params }: EditOpusPageProps) {
  const {id} = await params;
  return <EditOpusView id={id} />;
}
