'use client';

import { DragEndEvent } from '@dnd-kit/core';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { JSONContent } from '@tiptap/react';

import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { SortableItemWrapper } from '../../sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '../../sortable-list/SortableList';
import { styles } from './OurMission.styles';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { CROP_RATIOS } from '~/constants/publications';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { ImagePreviewBlock } from '~/ds-components/photo-block/PhotoBlock';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ensureIds } from '~/lib/utils/ensureIds';
import { proseToHeaderText } from '~/lib/utils/prose';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useTitleValidation } from '~/shared/hooks/use-title-validation/useTitleValidation';
import { useStore } from '~/store';
import { ConfigurableListItem } from '~/types/accordionBlocks';
import { CropResult, LocalizedJSON, ProseDoc } from '~/types/common';
import { MissionListItemWithId } from '~/types/store/pages/about-us/blocks/missionBlock';
import { getImageUrl } from '~/utils/getImageUrl';

export type MissionPoint = ConfigurableListItem & { value: JSONContent };

export type MissionImage = {
  src: string;
  generatedSrc: string;
  caption: LocalizedJSON;
  alt: LocalizedJSON;
  crop?: CropResult | null;
};

type MissionImageBlockProps = {
  image: MissionImage;
  locale: 'uk' | 'en';
  title: string;
  aspectRatio?: number;
  onChangeCaption: (value: JSONContent) => void;
  onChangeImage: (url: string, crop?: CropResult | null) => void;
};

const MissionImageBlock = ({ image, locale, title, aspectRatio, onChangeCaption, onChangeImage }: MissionImageBlockProps) => (
  <Box sx={styles.imageBlockWrapper}>
    <ImagePreviewBlock
      imageUrl={getImageUrl(image)}
      title={title}
      fileName={image.src || ''}
      initialCrop={image.crop}
      aspectRatio = {aspectRatio}
      onChangeImage={onChangeImage}
    />
    <CustomTextField
      fieldType="formatting"
      title={`Підпис до зображення (${title})`}
      label="Підпис"
      value={image.caption[locale]}
      onChange={(value) => onChangeCaption(value)}
    />
  </Box>
);

const OurMission = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.OUR_MISSION;
  const currentLocale: 'uk' | 'en' = useStore((state) => state.locale);

  const { block } = usePageBlock(pageId, blockId);
  const setField = useStore((state) => state.setField);
  const toggleBlockVisibility = useStore((state) => state.toggleBlockVisibility);
  const missionList: MissionListItemWithId[] = block ? ensureIds(block.list) : [];

  const titleValidation = useTitleValidation(`${pageId}:${blockId}:title`, block?.title?.[currentLocale] as ProseDoc);

  const handleDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, missionList, (reordered) => {
      setField(pageId, blockId, 'list', reordered);
    });
  };

  if (!block) return <EditBlockSkeleton />;


  const missionPoints: MissionPoint[] = missionList.map((item) => ({
    id: item.id,
    value: item[currentLocale]
  }));

  const handleChangeMissionPoint = (id: string | number, value: JSONContent) => {
    const updatedList: MissionListItemWithId[] = missionList.map((item) =>
      item.id === id ? { ...item, [currentLocale]: value } : item
    );
    setField(pageId, blockId, 'list', updatedList);
  };

  const handleAddMissionPoint = (): MissionPoint => {
    const newItem: MissionListItemWithId = {
      uk: { type: 'doc', content: [] },
      en: { type: 'doc', content: [] },
      id: crypto.randomUUID()
    };
    const newList = [...missionList, newItem];
    setField(pageId, blockId, 'list', newList);
    return { id: newItem.id, value: {} };
  };

  const handleDeleteMissionPoint = (id: string | number) => {
    const newList = missionList.filter((item) => item.id !== id);
    setField(pageId, blockId, 'list', newList);
  };

  const handleCaptionChange = (key: 'smallImage' | 'bigImage', value: JSONContent) => {
    const image = block[key]!;
    setField(pageId, blockId, key, {
      ...image,
      caption: { ...image.caption, [currentLocale]: value }
    });
  };

  const handleImageChange = (key: 'smallImage' | 'bigImage', url: string, crop?: CropResult | null) => {
    const image = block[key]!;

    setField(pageId, blockId, key, {
      ...image,
      src: url,
      isTmp: false,
      crop: crop ?? null
    } as typeof image);
  };


  const headerTitle = proseToHeaderText(block.title?.[currentLocale] as ProseDoc, 'Наша місія');

  return (
    <CollapsibleBlock
      title={headerTitle}
      grip
      hidden={block.hidden}
      onToggleVisibility={() => toggleBlockVisibility(pageId, blockId)}
    >
      <Box sx={styles.wrapper}>
        <CustomTextField
          fieldType="formatting"
          title="Заголовок секції"
          label="Текст заголовка"
          value={block.title?.[currentLocale]}
          onChange={(value) => setField(pageId, blockId, 'title', { ...block.title, [currentLocale]: value })}
          onBlur={titleValidation.onBlur}
          error={titleValidation.error}
          helperText={titleValidation.helperText}
        />
      </Box>

      {missionPoints.length > 0 && (
        <>
          <Typography variant="subtitle1" component="h4" sx={styles.pointHeader}>
            Текст секції:
          </Typography>
          <SortableList
            id="mission points"
            items={missionPoints.map((p) => p.id as string)}
            onDragEnd={handleDragEnd}
          >
            <ConfigurableList<MissionPoint>
              items={missionPoints}
              addBtnLabel="Додати пункт"
              editable
              onChange={({ id, value }) => handleChangeMissionPoint(id, value)}
              onDelete={handleDeleteMissionPoint}
              onCreate={handleAddMissionPoint}
              renderItem={({ item, onChange }) => (
                <SortableItemWrapper id={item.id as string} key={item.id} gripHandle>
                  <CustomTextField
                    fieldType="formatting"
                    label="Пункт місії"
                    value={item.value}
                    onChange={(value) => onChange({ ...item, value })}
                  />
                </SortableItemWrapper>
              )}
              separator={false}
            />
          </SortableList>
        </>
      )}

      <Divider sx={styles.divider} />

      {block.smallImage && (
        <MissionImageBlock
          image={block.smallImage}
          locale={currentLocale}
          title="Перше зображення секції"
          aspectRatio={CROP_RATIOS.FUNDATION_PROFILE_SMALL}
          onChangeCaption={(value) => handleCaptionChange('smallImage', value)}
          onChangeImage={(url, crop) => handleImageChange('smallImage', url, crop)}
        />
      )}

      {block.bigImage && (
        <MissionImageBlock
          image={block.bigImage}
          locale={currentLocale}
          title="Друге зображення секції"
          aspectRatio={CROP_RATIOS.FUNDATION_PROFILE_BIG}
          onChangeCaption={(value) => handleCaptionChange('bigImage', value)}
          onChangeImage={(url, crop) => handleImageChange('bigImage', url, crop)}
        />
      )}
    </CollapsibleBlock>
  );
};

export default OurMission;
