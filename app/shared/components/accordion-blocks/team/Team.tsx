import { debounce, IconButton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';

import { styles } from './Team.styles';
import { ContributorCard } from '~/components/contributor-card/ContributorCard';
import Button from '~/ds-components/button/Button';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { Svg } from '~/ds-components/colored-svg/ColoredSvg';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import Plus from '~/public/icons/plus.svg';
import TrashIcon from '~/public/icons/trash.svg';
import { ContributorData } from '~/types/accordionBlocks';

type TeamProps = {
  introText: string;
  sectionTitle: string;
  contributors: Array<ContributorData>;
};

const Team = ({ introText, sectionTitle, contributors }: TeamProps) => {
  const [editedIntroText, setEditedIntroText] = useState(introText);
  const [editedSectionTitle, setEditedSectionTitle] = useState(sectionTitle);
  const [editedContributors, setEditedContributors] = useState(contributors);

  const editIntroWithDelay = debounce(setEditedIntroText, 500);
  const editSectionWithDelay = debounce(setEditedSectionTitle, 500);

  const addContributor = () => {
    setEditedContributors([...editedContributors, { name: 'name', description: 'desc' }]);
  };

  const removeContributor = (index: number) => {
    setEditedContributors(editedContributors.filter((_, i) => i !== index));
  };

  return (
    <CollapsibleBlock title="Команда" sx={styles.teamBlock} childrenContainerSx={styles.contributorBlock}>
      <CustomTextField
        title="Вступний текст секції"
        label="Текст заголовку"
        defaultValue={editedIntroText}
        onChange={(e) => editIntroWithDelay(e.target.value)}
        fullWidth
      />
      <CustomTextField
        title="Заголовок секції"
        label="Текст заголовку"
        defaultValue={editedSectionTitle}
        onChange={(e) => editSectionWithDelay(e.target.value)}
        fullWidth
      />
      <Typography sx={styles.contributorsTitle} variant="subtitle1">
        Учасники Команди:
      </Typography>
      {editedContributors.map((contributor, index) => (
        <Box key={contributor.name + index} sx={styles.contributorContainer}>
          <ContributorCard
            contributorNameValue={contributor.name}
            contributorDescriptionValue={contributor.description}
          />
          <IconButton sx={styles.svgContainer} onClick={() => removeContributor(index)}>
            <Svg Component={TrashIcon} alt="Видалити учасника" stroke="#E53D11" />
          </IconButton>
        </Box>
      ))}
      <Button variant="outlined" color="primary" sx={styles.addBtn} onClick={addContributor} startIcon={<Plus />}>
        Додати учасника
      </Button>
    </CollapsibleBlock>
  );
};

export default Team;
