import { Box } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import { styles } from './GroupIntroSection.styles';
import { GroupDataField } from '~/constants/creativity';
import { EditorLanguage } from '~/constants/publications';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

type MultilingualText = { uk: string; en: string };

type MultilingualRichText = { uk: JSONContent | null; en: JSONContent | null };

type GroupIntroSectionProps = {
  data: {
    parts: MultilingualText;
    description: MultilingualRichText;
  };
  currentLanguage: EditorLanguage;
  onChange: (field: GroupDataField, value: unknown, isMultilingual?: boolean) => void;
};

export const GroupIntroSection = ({ data, currentLanguage, onChange }: GroupIntroSectionProps) => {
  const langKey = currentLanguage === 'UA' ? 'uk' : 'en';

  return (
    <Box sx={styles.mainContainer}>
      <CustomTextField
        label="Частини"
        value={data.parts[langKey]}
        onChange={(e) => onChange('parts', e.target.value, true)}
        multiline
        fullWidth
        sx={styles.partsTextField}
      />

      <CustomTextField
        key={`desc-${langKey}`}
        fieldType="formatting"
        label="Опис"
        value={data.description[langKey] ?? undefined}
        onChange={(value: unknown) => onChange('description', value, true)}
      />
    </Box>
  );
};
