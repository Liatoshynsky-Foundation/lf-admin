import { Box } from '@mui/material';

import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

type MultilingualText = { uk: string; en: string };

type MultilingualRichText = { uk: any; en: any };

type OpusIntroSectionProps = {
  data: {
    parts: MultilingualText;
    description: MultilingualRichText;
  };
  currentLanguage: string;
  onChange: (field: string, value: any, isMultilingual?: boolean) => void;
};

export const OpusIntroSection = ({ data, currentLanguage, onChange }: OpusIntroSectionProps) => {
  const langKey = currentLanguage === 'UA' ? 'uk' : 'en';

  return (
    <CollapsibleBlock title="Вступна секція" defaultExpanded>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        <CustomTextField
          label="Частини"
          value={data.parts[langKey]}
          onChange={(e) => onChange('parts', e.target.value, true)}
          multiline
          fullWidth
          sx={{
            '& .MuiInputBase-root': {
              height: 'auto',
              padding: '12px 16px',
            }
          }}
        />

        <CustomTextField
          fieldType="formatting"
          label="Опис"
          value={data.description[langKey]}
          onChange={(value: any) => onChange('description', value, true)}
        />

      </Box>
    </CollapsibleBlock>
  );
};
