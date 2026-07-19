'use client';
import { Typography } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { styles } from './FoundationFounders.style';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';
import { ContributorCard } from '~/components/contributor-card/ContributorCard';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ensureIds } from '~/lib/utils/ensureIds';
import { proseToHeaderText } from '~/lib/utils/prose';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useTitleValidation } from '~/shared/hooks/use-title-validation/useTitleValidation';
import { useStore } from '~/store';
import { ImageType, LocalizedString, ProseDoc } from '~/types/common';
import { TeamMemberWithId } from '~/types/store/pages/about-us/blocks/foundationFounderBlock';
export const FoundationFounders = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.FOUNDATION_FOUNDERS;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale: keyof LocalizedString = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);
  const toggleBlockVisibility = useStore((state) => state.toggleBlockVisibility);

  const titleTextValidation = useTitleValidation(`${pageId}:${blockId}:titleText`, block?.titleText?.[currentLocale] as ProseDoc);
  const listTitleValidation = useTitleValidation(`${pageId}:${blockId}:listTitle`, block?.listTitle?.[currentLocale] as ProseDoc);

  if (!block) return <EditBlockSkeleton />;

  const memberList: TeamMemberWithId[] = ensureIds(block.members);

  const updateMembers = (newMembers: TeamMemberWithId[]) => {
    setField(pageId, blockId, 'members', newMembers);
  };

  const addMember = (): TeamMemberWithId => {
    const emptyDoc = { uk: {}, en: {} };
    const newMember: TeamMemberWithId = {
      id: crypto.randomUUID(),
      name: emptyDoc,
      description: emptyDoc,
      photo: {
        src: '',
        alt: { uk: {}, en: {} },
        caption: { uk: {}, en: {} },
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

  const handleChangeTitleText = (value: JSONContent) => {
    setField(pageId, blockId, 'titleText', {
      ...block.titleText,
      [currentLocale]: value
    });
  };

  const handleChangeListTitle = (value: JSONContent) => {
    setField(pageId, blockId, 'listTitle', {
      ...block.listTitle,
      [currentLocale]: value
    });
  };

  const headerTitle = proseToHeaderText(block.listTitle?.[currentLocale] as ProseDoc, 'Команда Фундації');

  return (
    <CollapsibleBlock
      title={headerTitle}
      grip
      hidden={block.hidden}
      onToggleVisibility={() => toggleBlockVisibility(pageId, blockId)}
    >
      <CustomTextField
        fieldType="formatting"
        title="Вступний текст секції"
        label="Текст заголовку"
        value={block.titleText[currentLocale]}
        onChange={(value) => handleChangeTitleText(value)}
        onBlur={titleTextValidation.onBlur}
        error={titleTextValidation.error}
        helperText={titleTextValidation.helperText}
      />

      <CustomTextField
        fieldType="formatting"
        title="Заголовок секції"
        label="Текст заголовку"
        value={block.listTitle[currentLocale]}
        onChange={(value) => handleChangeListTitle(value)}
        onBlur={listTitleValidation.onBlur}
        error={listTitleValidation.error}
        helperText={listTitleValidation.helperText}
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
