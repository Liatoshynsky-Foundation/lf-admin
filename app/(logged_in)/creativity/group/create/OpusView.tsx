'use client';

import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { styles } from './page.styles';
import {
  OPUS_DETAILS_LABELS,
  OPUS_GROUP_PATH,
  OPUS_MUTATION_RESULTS,
  OPUS_PAGE_TITLES,
  OPUSES_BASE_PATH
} from '~/constants/opus';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import ProgressStatus from '~/shared/components/divided-header/progress-status/ProgressStatus';
import OpusDetailsBlock from '~/shared/components/forms/opus-details-block/OpusDetailsBlock';
import SeoMetadataBlock from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { useUpsertOpus } from '~/shared/hooks/use-upsert-opus/useUpsertOpus';
import { BaseContentStatuses } from '~/types/enums/common.enums';

interface OpusViewProps {
  data: Omit<ReturnType<typeof useUpsertOpus>, 'duplicateCompositionNames'> & {
    duplicateCompositionNames?: string[];
  };
  mode?: 'create' | 'edit';
}

export default function OpusView({ data, mode = 'create' }: Readonly<OpusViewProps>) {
  const {
    details,
    setDetails,
    detailsErrors,
    duplicateCompositionNames,
    seoValue,
    setSeoValue,
    crop,
    setCrop,
    forceShowErrors,
    isSaved,
    handleSave
  } = data;
  const router = useRouter();

  const onEdit = async (): Promise<void> => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    try {
      const id = await handleSave(BaseContentStatuses.Draft);

      if (!id) {
        return;
      }

      toast.success(mode === 'create' ? OPUS_MUTATION_RESULTS.created : OPUS_MUTATION_RESULTS.updated);
      router.push(`${OPUS_GROUP_PATH}/${id}/content?from=${mode}`);
    } catch (error) {
      toast.error(`Помилка: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <>
      <DividedHeader
        originUrl={OPUSES_BASE_PATH}
        rightActionsComponent={<HeaderRightActions mode="create" onEdit={onEdit} editLabel="Перейти до редагування" />}
      >
        <Typography variant="h7">{mode === 'edit' ? OPUS_PAGE_TITLES.edit : OPUS_PAGE_TITLES.create}</Typography>
        <ProgressStatus isSaved={isSaved} />
      </DividedHeader>

      <Box sx={styles.contentWrapper}>
        <Accordion defaultExpanded disableGutters elevation={0} sx={styles.detailsAccordion}>
          <AccordionSummary expandIcon={<ChevronDown size={24} strokeWidth={1.5} />} sx={styles.detailsSummary}>
            <Typography variant="h6" sx={styles.detailsTitle}>
              {OPUS_DETAILS_LABELS.blockTitle}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={styles.detailsContent}>
            <OpusDetailsBlock
              value={details}
              onChange={setDetails}
              errors={detailsErrors}
              duplicateCompositionNames={duplicateCompositionNames}
            />
          </AccordionDetails>
        </Accordion>

        <Box sx={styles.seoWrapper}>
          <SeoMetadataBlock
            showAlternativeText
            forceShowErrors={forceShowErrors}
            value={seoValue}
            onChange={setSeoValue}
            crop={{ uk: crop, en: crop }}
            onChangeCrop={(newCrop) => setCrop(newCrop?.uk ?? null)}
          />
        </Box>
      </Box>
    </>
  );
}
