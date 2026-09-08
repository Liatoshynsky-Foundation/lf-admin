'use client';
import { Box, Stack } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

import SectionDivider from '../../shared/components/design-system/section-divider/SectionDivider';
import { EditBlockSkeleton } from '../../shared/components/edit-block-skeleton/EditBlockSkeleton';
import { TEAM_MEMBER_NUMERALS } from './FoundationTeamContent.consts';
import { styles } from './FoundationTeamContent.styles';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';
import { ContributorCard } from '~/components/contributor-card/ContributorCard';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import { textToProse } from '~/lib/utils/prose';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { ImageType, LocalizedString } from '~/types/common';
import { TeamMemberWithId } from '~/types/store/pages/about-us/blocks/foundationFounderBlock';
export const FoundationTeamContent = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.FOUNDATION_FOUNDERS;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale: keyof LocalizedString = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);

  if (!block) return <EditBlockSkeleton />;

  const memberList: TeamMemberWithId[] = ensureIds(block.members);

  const updateMembers = (newMembers: TeamMemberWithId[]) => {
    setField(pageId, blockId, 'members', newMembers);
  };

  const addMember = (): TeamMemberWithId => {
    const emptyDoc = { uk: textToProse(''), en: textToProse('') };

    const newMember: TeamMemberWithId = {
      id: uuidv4(),
      name: emptyDoc,
      description: emptyDoc,
      photo: {
        src: '',
        alt: emptyDoc,
        generatedSrc: ''
      }
    };
    updateMembers([...memberList, newMember]);
    return newMember;
  };

  const removeMember = (id: string) => {
    if (memberList.length <= 1) return;
    updateMembers(memberList.filter((member) => member.id !== id));
  };

  const updateMember = (updated: TeamMemberWithId) => {
    updateMembers(memberList.map((member) => (member.id === updated.id ? updated : member)));
  };

  return (
    <Stack sx={styles.mainStack}>
      <Box sx={{ bgcolor: 'white', borderRadius: 4, p: 3, border: '1px solid', borderColor: 'grey.300' }}>
        <ConfigurableList<TeamMemberWithId>
          items={memberList}
          addBtnLabel="Додати учасника"
          editable={false}
          onCreate={addMember}
          onChange={updateMember}
          onDelete={removeMember}
          addButtonSx={styles.configListAddBtn}
          renderItem={({ item, onDelete, index }) => {
            const numeralText = TEAM_MEMBER_NUMERALS[index] || `${index + 1}-й`;

            return (
              <Box key={item.id} sx={styles.memberBox}>
                <SectionDivider
                  sx={styles.sectionDivider}
                  onDelete={memberList.length > 1 ? onDelete : undefined}
                  testId={`delete-${item.id}`}
                >
                  {numeralText} учасник
                </SectionDivider>
                <ContributorCard
                  contributor={item}
                  currentLocale={currentLocale}
                  onChangeName={(name) => updateMember({ ...item, name: { ...item.name, [currentLocale]: name } })}
                  onChangeDescription={(desc) =>
                    updateMember({ ...item, description: { ...item.description, [currentLocale]: desc } })
                  }
                  onChangePhoto={(photo: Omit<ImageType, 'caption'>) => updateMember({ ...item, photo })}
                />
              </Box>
            );
          }}
        />
      </Box>
    </Stack>
  );
};
