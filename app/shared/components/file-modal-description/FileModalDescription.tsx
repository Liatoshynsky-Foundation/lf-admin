import { Box, Typography } from '@mui/material';
import type { PropsWithChildren } from 'react';

import { styles } from './FileModalDescription.styles';

type FileModalDescriptionProps = Readonly<{
  mode: 'delete' | 'rename';
  filename: string;
}>;

export function SpanText({ children }: Readonly<PropsWithChildren>) {
  return (
    <Box component="span" sx={styles.filename}>
      {children}
    </Box>
  );
}

export function FileModalDescription({ mode, filename }: FileModalDescriptionProps) {
  const action = mode === 'delete' ? 'видалити' : 'перейменувати';
  const warning = mode === 'delete' ? 'видалення' : 'перейменування';

  return (
    <Box sx={styles.descriptionContainer}>
      <Typography variant="textMd">
        Ви збираєтесь {action} файл <SpanText>{filename}</SpanText>. Якщо файл використовується на сайті, його{' '}
        <SpanText>{warning} може призвести до порушення відображення контенту</SpanText>.
      </Typography>
      <Typography variant="textMd">Ви впевнені, що хочете продовжити?</Typography>
    </Box>
  );
}
