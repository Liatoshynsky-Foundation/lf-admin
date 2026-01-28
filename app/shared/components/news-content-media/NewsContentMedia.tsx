'use client';

import { Box, Typography } from '@mui/material';

import { styles } from './NewsContentMedia.styles';

type NewsContent = {
  title: string;
  description: string;
  content: any; // JSON content with blocks structure
};

type NewsContentMediaProps = {
  englishContent: NewsContent;
  ukrainianContent: NewsContent;
  coverImage?: {
    src: string;
    alt: string;
  };
};

const ContentLanguageSection = ({
  language,
  content,
  coverImage
}: {
  language: string;
  content: NewsContent;
  coverImage?: { src: string; alt: string };
}) => {
  return (
    <Box sx={styles.section}>
      <Box sx={styles.languageHeader}>
        <Typography variant="h6" fontWeight="bold">
          Данні новини | {language}
        </Typography>
      </Box>

      <Box sx={styles.contentBlock}>
        <Typography sx={styles.fieldLabel}>Заголовок</Typography>
        <Typography sx={styles.contentText}>{content.title || 'Не вказано'}</Typography>
      </Box>

      <Box sx={styles.contentBlock}>
        <Typography sx={styles.fieldLabel}>Опис</Typography>
        <Typography sx={styles.contentText}>{content.description || 'Не вказано'}</Typography>
      </Box>

      <Box sx={styles.coverImageContainer}>
        {coverImage?.src ? (
          <img src={coverImage.src} alt={coverImage.alt} style={styles.coverImage as React.CSSProperties} />
        ) : (
          <Typography sx={styles.placeholderText}>Зображення обкладинки не завантажено</Typography>
        )}
      </Box>
    </Box>
  );
};

export const NewsContentMedia = ({ englishContent, ukrainianContent, coverImage }: NewsContentMediaProps) => {
  return (
    <Box sx={styles.container}>
      <ContentLanguageSection language="UK" content={ukrainianContent} coverImage={coverImage} />

      <ContentLanguageSection language="EN" content={englishContent} coverImage={coverImage} />
    </Box>
  );
};
