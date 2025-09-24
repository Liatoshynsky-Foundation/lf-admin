'use client';
import { Skeleton, Typography } from '@mui/material';

import { styles } from './FoundationFounders.style';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';
import { ContributorCard } from '~/components/contributor-card/ContributorCard';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ensureIds } from '~/lib/utils/ensureIds';
import { proseToText, textToProse } from '~/lib/utils/prose';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { ImageType, LocalizedString } from '~/types/common';
import { TeamMemberWithId } from '~/types/store/pages/about-us/blocks/foundationFounderBlock';

export const FoundationFounders = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.FOUNDATION_FOUNDERS;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale: keyof LocalizedString = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);

  if (!block) return <Skeleton sx={{ height: '60px' }} />;

  const memberList: TeamMemberWithId[] = ensureIds(block.members);

  const updateMembers = (newMembers: TeamMemberWithId[]) => {
    setField(pageId, blockId, 'members', newMembers);
  };

  const addMember = (): TeamMemberWithId => {
    const newMember: TeamMemberWithId = {
      id: crypto.randomUUID(),
      name: { uk: 'Placeholder Name', en: 'Placeholder Name' },
      description: { uk: 'Placeholder Description', en: 'Placeholder Description' },
      photo: {
        src: '',
        alt: { uk: '', en: '' },
        caption: { uk: '', en: '' },
        generatedSrc: ''
      }
    };
    updateMembers([...memberList, newMember]);
    return newMember;
  };

  const removeMember = (id: string) => {
    updateMembers(memberList.filter((member) => member.id !== id));
  };

  const updateMember = (updated: TeamMemberWithId) => {
    updateMembers(memberList.map((member) => (member.id === updated.id ? updated : member)));
  };

  const handleChangeTitleText = (value: string) => {
    setField(pageId, blockId, 'titleText', {
      ...block.titleText,
      [currentLocale]: textToProse(value)
    });
  };

  const handleChangeListTitle = (value: string) => {
    setField(pageId, blockId, 'listTitle', {
      ...block.listTitle,
      [currentLocale]: textToProse(value)
    });
  };

  return (
    <CollapsibleBlock title="Команда Фундації">
      <CustomTextField
        title="Вступний текст секції"
        label="Текст заголовку"
        fullWidth
        value={proseToText(block.titleText[currentLocale])}
        onChange={(e) => handleChangeTitleText(e.target.value)}
      />

      <CustomTextField
        title="Заголовок секції"
        label="Текст заголовку"
        fullWidth
        value={block.listTitle[currentLocale]}
        onChange={(e) => handleChangeListTitle(e.target.value)}
      />

      <Typography sx={styles.contributorsTitle} variant="subtitle1">
        Учасники Команди:
      </Typography>

      <ConfigurableList<TeamMemberWithId>
        items={memberList}
        addBtnLabel="Додати учасника"
        editable
        onCreate={addMember}
        onChange={updateMember}
        onDelete={removeMember}
        renderItem={({ item }) => (
          <ContributorCard
            key={item.id}
            contributor={item}
            currentLocale={currentLocale}
            onChangeName={(name) => updateMember({ ...item, name: { ...item.name, [currentLocale]: name } })}
            onChangeDescription={(desc) =>
              updateMember({ ...item, description: { ...item.description, [currentLocale]: desc } })
            }
            onChangePhoto={(photo: ImageType) => updateMember({ ...item, photo })}
          />
        )}
      />
    </CollapsibleBlock>
  );
};
