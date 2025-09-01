import { Box } from '@mui/system';
import React from 'react';

import { SvgImage } from '../../svg-image/SvgImage';
import { styles } from './Team.styles';
import { ContributorCard } from '~/components/contributor-card/ContributorCard';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ContributorData } from '~/types/accordionBlocks';

type TeamProps = {
  introText: string;
  sectionTitle: string;
  contributors: Array<ContributorData>;
};

const Team = ({ introText, sectionTitle, contributors }: TeamProps) => {
  return (
    <CollapsibleBlock title="Команда">
      <CustomTextField title="Вступний текст секції" label="Текст заголовку" defaultValue={introText} fullWidth />
      <CustomTextField title="Заголовок секції" label="Текст заголовку" defaultValue={sectionTitle} fullWidth />
      {contributors.map((contributor, index) => (
        <Box key={contributor.name + index} sx={styles.contributorContainer}>
          <ContributorCard
            contributorNameValue={contributor.name}
            contributorDescriptionValue={contributor.description}
          />
          <SvgImage src="/icons/trash.svg" alt="Видалити учасника" width={24} height={24} />
        </Box>
      ))}
    </CollapsibleBlock>
  );
};

export default Team;
