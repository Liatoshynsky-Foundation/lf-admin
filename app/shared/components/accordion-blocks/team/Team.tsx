import { debounce, Typography } from '@mui/material';
import React, { useState } from 'react';

import { styles } from './Team.styles';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';
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
  const [editedIntroText, setEditedIntroText] = useState(introText);
  const [editedSectionTitle, setEditedSectionTitle] = useState(sectionTitle);
  const [editedContributors, setEditedContributors] = useState(contributors);

  const editIntroWithDelay = debounce(setEditedIntroText, 500);
  const editSectionWithDelay = debounce(setEditedSectionTitle, 500);

  const addContributor = () => {
    const newContributor = {
      id: Date.now().toString(),
      name: 'Placeholder Name',
      description: 'Placeholder Description'
    };
    setEditedContributors((prev) => [...prev, newContributor]);
    return newContributor;
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
      <ConfigurableList
        items={editedContributors}
        addBtnLabel="Додати учасника"
        editable
        onCreate={addContributor}
        onChange={(newValue) => {
          setEditedContributors((prev) =>
            prev.map((contributor) => (contributor.id === newValue.id ? newValue : contributor))
          );
        }}
        onDelete={(id) => {
          const index = editedContributors.findIndex((contributor) => contributor.id === id);
          if (index !== -1) {
            removeContributor(index);
          }
        }}
        renderItem={(params) => (
          <ContributorCard
            contributorNameValue={params.item.name}
            contributorDescriptionValue={params.item.description}
          />
        )}
      />
    </CollapsibleBlock>
  );
};

export default Team;
