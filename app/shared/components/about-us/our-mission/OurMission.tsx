'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import { DEFAULT_MISSION_POINTS, IMAGE_BLOCKS_INITIAL, OUR_MISSION_TEXT } from './OurMission.contants';
import { styles } from './OurMission.styles';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { ImagePreviewBlock } from '~/ds-components/photo-block/PhotoBlock';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import useInitBlock from '~/shared/hooks/use-init-block/useInitBlock';
import { useStore } from '~/store';
import { ConfigurableListItem } from '~/types/accordionBlocks';

export type MissionImage = {
  id: string;
  imageUrl: string;
  title?: string;
  fileName?: string;
  caption: string;
  cropWidth: number;
  cropHeight: number;
};

export type MissionPoint = ConfigurableListItem & {
  value: string;
};

const MissionImageBlock = ({
  imageData,
  onChangeImage,
  onChangeCaption
}: {
  imageData: MissionImage;
  onChangeImage: (id: string, file: File) => void;
  onChangeCaption: (id: string, caption: string) => void;
}) => {
  return (
    <Box sx={styles.imageBlockWrapper}>
      <ImagePreviewBlock
        imageUrl={imageData.imageUrl}
        title={imageData.title}
        fileName={imageData.fileName}
        cropWidth={imageData.cropWidth}
        cropHeight={imageData.cropHeight}
        onChangeImage={(file) => onChangeImage(imageData.id, file)}
      />
      <CustomTextField
        title={OUR_MISSION_TEXT.imageCaptionTitle}
        label={OUR_MISSION_TEXT.imageCaptionLabel}
        value={imageData.caption}
        fullWidth
        multiline
        onChange={(e) => onChangeCaption(imageData.id, e.target.value)}
      />
    </Box>
  );
};

const OurMission = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.OUR_MISSION;

  const block = useInitBlock(pageId, blockId, {
    title: OUR_MISSION_TEXT.sectionTitle,
    missionPoints: DEFAULT_MISSION_POINTS.map((point) => ({
      id: crypto.randomUUID(),
      value: point
    })),
    imageBlocks: IMAGE_BLOCKS_INITIAL
  });

  const setField = useStore((state) => state.setField);

  const handleChangeImage = (id: string, file: File) => {
    const newUrl = URL.createObjectURL(file);
    const updated = block.imageBlocks.map((img: MissionImage) =>
      img.id === id ? { ...img, imageUrl: newUrl, fileName: file.name } : img
    );
    setField(pageId, blockId, 'imageBlocks', updated);
  };

  const handleChangeCaption = (id: string, caption: string) => {
    const updated = block.imageBlocks.map((img: MissionImage) => (img.id === id ? { ...img, caption } : img));
    setField(pageId, blockId, 'imageBlocks', updated);
  };

  const handleChangeMissionPoint = (updatedPoint: MissionPoint) => {
    const updated = block.missionPoints.map((point: MissionPoint) =>
      point.id === updatedPoint.id ? updatedPoint : point
    );
    setField(pageId, blockId, 'missionPoints', updated);
  };

  const handleDeleteMissionPoint = (id: string | number) => {
    setField(
      pageId,
      blockId,
      'missionPoints',
      block.missionPoints.filter((point: MissionPoint) => point.id !== id)
    );
  };

  const handleCreateMissionPoint = () => {
    const newPoint: MissionPoint = {
      id: crypto.randomUUID(),
      value: ''
    };
    const updated = [...block.missionPoints, newPoint];
    setField(pageId, blockId, 'missionPoints', updated);
    return newPoint;
  };

  return (
    <CollapsibleBlock title={OUR_MISSION_TEXT.sectionTitle}>
      <Box sx={styles.wrapper}>
        <CustomTextField
          title={OUR_MISSION_TEXT.titleFieldTitle}
          label={OUR_MISSION_TEXT.titleFieldLabel}
          value={block.title || ''}
          fullWidth
          multiline
          onChange={(e) => setField(pageId, blockId, 'title', e.target.value)}
        />
      </Box>

      {block.missionPoints?.length > 0 && (
        <Box component="h4" sx={styles.pointHeader}>
          {OUR_MISSION_TEXT.pointFieldTitle}
        </Box>
      )}

      <ConfigurableList<MissionPoint>
        items={block.missionPoints || []}
        addBtnLabel={OUR_MISSION_TEXT.addPointButton}
        editable
        onCreate={handleCreateMissionPoint}
        onChange={handleChangeMissionPoint}
        onDelete={handleDeleteMissionPoint}
        renderItem={({ item, onChange }) => (
          <CustomTextField
            label={OUR_MISSION_TEXT.pointFieldLabel}
            value={item.value}
            fullWidth
            multiline
            onChange={(e) => onChange({ ...item, value: e.target.value })}
          />
        )}
        separator={false}
      />

      <Divider sx={styles.divider} />

      {block.imageBlocks?.map((image: MissionImage) => (
        <MissionImageBlock
          key={image.id}
          imageData={image}
          onChangeImage={handleChangeImage}
          onChangeCaption={handleChangeCaption}
        />
      ))}
    </CollapsibleBlock>
  );
};

export default OurMission;
