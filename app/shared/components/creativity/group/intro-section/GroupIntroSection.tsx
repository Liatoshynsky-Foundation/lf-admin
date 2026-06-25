import { Box } from '@mui/material';

import {styles} from './GroupIntroSection.styles';
import { GroupDataField } from '~/constants/creativity';
import { EditorLanguage } from '~/constants/publications';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

type MultilingualText = { uk: string; en: string };

type MultilingualRichText = { uk: Record<string, unknown> | null; en: Record<string, unknown> | null };

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
    <CollapsibleBlock title="Вступна секція" defaultExpanded>
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
          fieldType="formatting"
          label="Опис"
          value={data.description[langKey] ?? undefined}
          onChange={(value: unknown) => onChange('description', value, true)}
        />

      </Box>
    </CollapsibleBlock>
  );
};
