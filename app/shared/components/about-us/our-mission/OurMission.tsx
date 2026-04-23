'use client';

import { Skeleton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import { styles } from './OurMission.styles';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { ImagePreviewBlock } from '~/ds-components/photo-block/PhotoBlock';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ensureIds } from '~/lib/utils/ensureIds';
import { proseToText, textToProse } from '~/lib/utils/prose';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { ConfigurableListItem } from '~/types/accordionBlocks';
import { CropResult } from '~/types/common';
import { MissionListItemWithId } from '~/types/store/pages/about-us/blocks/missionBlock';
import { getImageUrl } from '~/utils/getImageUrl';

export type MissionPoint = ConfigurableListItem & { value: string };

export type MissionImage = {
  src: string;
  generatedSrc: string;
  caption: { uk: string; en: string };
  alt: { uk: string; en: string };
  crop?: CropResult | null;
};

type MissionImageBlockProps = {
  image: MissionImage;
  locale: 'uk' | 'en';
  title: string;
  onChangeCaption: (value: string) => void;
  onChangeImage: (url: string, crop?: CropResult | null) => void;
};

const MissionImageBlock = ({ image, locale, title, onChangeCaption, onChangeImage }: MissionImageBlockProps) => (
  <Box sx={styles.imageBlockWrapper}>
    <ImagePreviewBlock
      imageUrl={getImageUrl(image)}
      title={title}
      fileName={image.src || ''}
      initialCrop={image.crop}
      onChangeImage={onChangeImage}
    />
    <CustomTextField
      title="Підпис до зображення"
      label="Підпис"
      value={image.caption[locale]}
      fullWidth
      multiline
      onChange={(e) => onChangeCaption(e.target.value)}
    />
  </Box>
);

const OurMission = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.OUR_MISSION;
  const currentLocale: 'uk' | 'en' = useStore((state) => state.locale);

  const { block } = usePageBlock(pageId, blockId);
  const setField = useStore((state) => state.setField);

  if (!block) return <Skeleton sx={{ height: '60px' }} />;

  const missionList: MissionListItemWithId[] = ensureIds(block.list);

  const missionPoints: MissionPoint[] = missionList.map((item) => ({
    id: item.id,
    value: proseToText(item[currentLocale])
  }));

  const handleChangeMissionPoint = (id: string | number, value: string) => {
    const updatedList: MissionListItemWithId[] = missionList.map((item) =>
      item.id === id ? { ...item, [currentLocale]: textToProse(value) } : item
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
    return { id: newItem.id, value: '' };
  };

  const handleDeleteMissionPoint = (id: string | number) => {
    const newList = missionList.filter((item) => item.id !== id);
    setField(pageId, blockId, 'list', newList);
  };

  const handleCaptionChange = (key: 'smallImage' | 'bigImage', value: string) => {
    const image = block[key];
    if (!image) return;
    setField(pageId, blockId, key, {
      ...image,
      caption: { ...image.caption, [currentLocale]: value }
    });
  };

  const handleImageChange = (key: 'smallImage' | 'bigImage', url: string, crop?: CropResult | null) => {
    const image = block[key];
    if (!image) return;

    setField(pageId, blockId, key, {
      ...image,
      src: url,
      isTmp: false,
      crop: crop ?? null
    } as typeof image);
  };

  return (
    <CollapsibleBlock title="Наша місія">
      <Box sx={styles.wrapper}>
        <CustomTextField
          title="Заголовок секції"
          label="Текст заголовка"
          value={block.title?.[currentLocale] || ''}
          fullWidth
          multiline
          onChange={(e) => setField(pageId, blockId, 'title', { ...block.title, [currentLocale]: e.target.value })}
        />
      </Box>

      {missionPoints.length > 0 && (
        <>
          <Typography variant="subtitle1" component="h4" sx={styles.pointHeader}>
            Текст секції:
          </Typography>
          <ConfigurableList<MissionPoint>
            items={missionPoints}
            addBtnLabel="Додати пункт"
            editable
            onChange={({ id, value }) => handleChangeMissionPoint(id, value)}
            onDelete={handleDeleteMissionPoint}
            onCreate={handleAddMissionPoint}
            renderItem={({ item, onChange }) => (
              <CustomTextField
                label="Пункт місії"
                value={item.value}
                fullWidth
                multiline
                onChange={(e) => onChange({ ...item, value: e.target.value })}
              />
            )}
            separator={false}
          />
        </>
      )}

      <Divider sx={styles.divider} />

      {block.smallImage && (
        <MissionImageBlock
          image={block.smallImage}
          locale={currentLocale}
          title="Перше зображення секції"
          onChangeCaption={(value) => handleCaptionChange('smallImage', value)}
          onChangeImage={(url, crop) => handleImageChange('smallImage', url, crop)}
        />
      )}

      {block.bigImage && (
        <MissionImageBlock
          image={block.bigImage}
          locale={currentLocale}
          title="Друге зображення секції"
          onChangeCaption={(value) => handleCaptionChange('bigImage', value)}
          onChangeImage={(url, crop) => handleImageChange('bigImage', url, crop)}
        />
      )}
    </CollapsibleBlock>
  );
};

export default OurMission;
