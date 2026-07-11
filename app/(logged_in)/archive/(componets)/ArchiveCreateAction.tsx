import Link from 'next/link';

import PlusIcon from '~/public/icons/plus.svg';
import Button from '~/shared/components/design-system/button/Button';

export const ArchiveCreateAction = () => {
  return (
    <Button variant="filled" component={Link} color="primary" href='/archive/create' startIcon={<PlusIcon />}>
      Додати фонд
    </Button>
  );
};
