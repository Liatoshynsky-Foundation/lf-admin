'use client';

import { Box, Typography } from '@mui/material';

import { styles } from './NewsContentMedia.styles';
import { InlineEditableText } from '~/shared/components/inline-editable-text/InlineEditableText';

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
  onUkrainianTitleChange?: (newTitle: string) => Promise<void>;
  onEnglishTitleChange?: (newTitle: string) => Promise<void>;
  onUkrainianDescriptionChange?: (newDescription: string) => Promise<void>;
  onEnglishDescriptionChange?: (newDescription: string) => Promise<void>;
};

const ContentLanguageSection = ({
  language,
  content,
  coverImage,
  onTitleChange,
  onDescriptionChange
}: {
  language: string;
  content: NewsContent;
  coverImage?: { src: string; alt: string };
  onTitleChange?: (newTitle: string) => Promise<void>;
  onDescriptionChange?: (newDescription: string) => Promise<void>;
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
        {onTitleChange ? (
          <InlineEditableText
            value={content.title}
            onSave={onTitleChange}
            variant="body1"
            placeholder="Введіть заголовок"
          />
        ) : (
          <Typography sx={styles.contentText}>{content.title || 'Не вказано'}</Typography>
        )}
      </Box>

      <Box sx={styles.contentBlock}>
        <Typography sx={styles.fieldLabel}>Опис</Typography>
        {onDescriptionChange ? (
          <InlineEditableText
            value={content.description}
            onSave={onDescriptionChange}
            variant="body1"
            multiline
            rows={4}
            placeholder="Введіть опис"
          />
        ) : (
          <Typography sx={styles.contentText}>{content.description || 'Не вказано'}</Typography>
        )}
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

export const NewsContentMedia = ({
  englishContent,
  ukrainianContent,
  coverImage,
  onUkrainianTitleChange,
  onEnglishTitleChange,
  onUkrainianDescriptionChange,
  onEnglishDescriptionChange
}: NewsContentMediaProps) => {
  return (
    <Box sx={styles.container}>
      <ContentLanguageSection
        language="UK"
        content={ukrainianContent}
        coverImage={coverImage}
        onTitleChange={onUkrainianTitleChange}
        onDescriptionChange={onUkrainianDescriptionChange}
      />

      <ContentLanguageSection
        language="EN"
        content={englishContent}
        coverImage={coverImage}
        onTitleChange={onEnglishTitleChange}
        onDescriptionChange={onEnglishDescriptionChange}
      />
    </Box>
  );
};
