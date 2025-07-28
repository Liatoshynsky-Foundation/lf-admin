'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useState } from 'react';

import { DEFAULT_MISSION_POINTS, IMAGE_BLOCKS_INITIAL, OUR_MISSION_TEXT } from './OurMission.contants';
import { styles } from './OurMission.styles';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { ImagePreviewBlock } from '~/ds-components/photo-block/PhotoBlock';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ConfigurableListItem } from '~/types/accordionBlocks';

type MissionImage = {
  id: string;
  imageUrl: string;
  title?: string;
  fileName?: string;
  caption: string;
  cropWidth: number;
  cropHeight: number;
};

type MissionPoint = ConfigurableListItem & {
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
        defaultValue={imageData.caption}
        fullWidth
        multiline
        onChange={(e) => onChangeCaption(imageData.id, e.target.value)}
      />
    </Box>
  );
};

const OurMission = () => {
  const [missionPoints, setMissionPoints] = useState<MissionPoint[]>(
    DEFAULT_MISSION_POINTS.map((point) => ({
      id: crypto.randomUUID(),
      value: point
    }))
  );

  const [imageBlocks, setImageBlocks] = useState<MissionImage[]>(IMAGE_BLOCKS_INITIAL);

  const handleChangeImage = (id: string, file: File) => {
    const newUrl = URL.createObjectURL(file);
    setImageBlocks((prev) =>
      prev.map((img) => (img.id === id ? { ...img, imageUrl: newUrl, fileName: file.name } : img))
    );
  };

  const handleChangeCaption = (id: string, caption: string) => {
    setImageBlocks((prev) => prev.map((img) => (img.id === id ? { ...img, caption } : img)));
  };

  const handleChangeMissionPoint = (updatedPoint: MissionPoint) => {
    setMissionPoints((prev) => prev.map((point) => (point.id === updatedPoint.id ? updatedPoint : point)));
  };

  const handleDeleteMissionPoint = (id: string | number) => {
    setMissionPoints((prev) => prev.filter((point) => point.id !== id));
  };

  const handleCreateMissionPoint = () => {
    const newPoint: MissionPoint = {
      id: crypto.randomUUID(),
      value: ''
    };
    setMissionPoints((prev) => [...prev, newPoint]);
    return newPoint;
  };

  return (
    <CollapsibleBlock title={OUR_MISSION_TEXT.sectionTitle}>
      <Box sx={styles.wrapper}>
        <CustomTextField
          title={OUR_MISSION_TEXT.titleFieldTitle}
          label={OUR_MISSION_TEXT.titleFieldLabel}
          defaultValue={OUR_MISSION_TEXT.sectionTitle}
          fullWidth
          multiline
        />
      </Box>

      {missionPoints.length > 0 && (
        <Box component="h4" sx={styles.pointHeader}>
          {OUR_MISSION_TEXT.pointFieldTitle}
        </Box>
      )}

      <ConfigurableList<MissionPoint>
        items={missionPoints}
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

      {imageBlocks.map((image) => (
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
