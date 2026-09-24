import { styles } from './ResearchCreateAction.styles';
import PlusIcon from '~/public/icons/plus.svg';
import Button from '~/shared/components/design-system/button/Button';

export function ResearchCreateAction({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <Button variant="filled" color="primary" onClick={onClick} sx={styles} startIcon={<PlusIcon />}>
      Додати роботу
    </Button>
  );
}
