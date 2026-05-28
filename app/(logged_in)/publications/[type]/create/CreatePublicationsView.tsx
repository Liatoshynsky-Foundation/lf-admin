import { Box, Menu, MenuItem, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useRouter } from 'next/navigation';
import { MouseEvent, useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { styles as editStyles } from '../[id]/edit/EditPublicationsView.styles';
import { styles } from './page.styles';
import {
  ACTIONS_TYPE,
  ADMIN_TITLE_LABELS,
  CONTENT_MUTATION_RESULTS,
  HEADER_MENU_OPTIONS,
  MenuActionId,
  PAGE_TITLES,
  PUBLICATIONS_BASE_PATH
} from '~/constants/publications';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import SeoCollapsibleBlock from '~/shared/components/forms/seo-collapsible-block/SeoCollapsibleBlock';
import { SeoCanonicalUrlField } from '~/shared/components/forms/seo-metadata-form/seo-canonicalurl-field/SeoCanonicalUrlField';
import { SeoDateTimeFields } from '~/shared/components/forms/seo-metadata-form/seo-datetime-fields/SeoDateTimeFields';
import { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { useUpsertPublication } from '~/shared/hooks/use-upsert-publication/useUpsertPublication';
import { BaseContentStatuses } from '~/types/enums/common.enums';

interface PublicationViewProps {
  data: ReturnType<typeof useUpsertPublication>;
  mode?: 'edit' | 'create' | 'seo';
}

export default function CreatePublicationsView({ data, mode = 'create' }: Readonly<PublicationViewProps>) {
  const {
    publicationType,
    adminTitle,
    setAdminTitle,
    adminTitleError,
    publishDate,
    setPublishDate,
    seoValue,
    setSeoValue,
    crop,
    setCrop,
    handleSave,
    forceShowErrors,
    handleDateTimeChange
  } = data;
  const router = useRouter();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const isOpen = Boolean(anchor);

  const eventsExtraFields = useCallback(
    (_locale: 'uk' | 'en', value: SeoBlockValue['meta']['uk']) => (
      <SeoDateTimeFields
        startDateTime={value.startDateTime}
        endDateTime={value.endDateTime}
        onChange={handleDateTimeChange}
      />
    ),
    [handleDateTimeChange]
  );

  const mediaExtraFields = useCallback(
    (
      _locale: 'uk' | 'en',
      value: SeoBlockValue['meta']['uk'],
      onChange: (val: SeoBlockValue['meta']['uk']) => void
    ) => (
      <SeoCanonicalUrlField
        value={value.canonicalUrl ?? ''}
        onChange={(val) => onChange({ ...value, canonicalUrl: val })}
        onBlur={() => {}}
        forceShowErrors={forceShowErrors}
      />
    ),
    [forceShowErrors]
  );

  let seoExtraFields: typeof eventsExtraFields | typeof mediaExtraFields | undefined;
  if (publicationType === 'events') seoExtraFields = eventsExtraFields;
  else if (publicationType === 'media') seoExtraFields = mediaExtraFields;

  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget);

  const handleClose = () => setAnchor(null);

  const actions = (HEADER_MENU_OPTIONS.baseActions as ACTIONS_TYPE[]).filter(
    (a) => a.id !== MenuActionId.DELETE_DRAFT && a.id !== MenuActionId.PUBLISH
  );

  const handleMenuAction = async (actionId: MenuActionId) => {
    handleClose();
    try {
      switch (actionId) {
      case MenuActionId.PUBLISH: {
        const id = await handleSave(BaseContentStatuses.Published);
        if (id) {
          toast.success(CONTENT_MUTATION_RESULTS.draftPublished);
        }
        break;
      }

      case MenuActionId.SAVE_DRAFT: {
        const id = await handleSave(BaseContentStatuses.Draft);
        if (id) {
          toast.success(CONTENT_MUTATION_RESULTS.draftSaved);
        }
        break;
      }

      case MenuActionId.UPDATE_AND_EXIT: {
        const id = await handleSave(BaseContentStatuses.Draft);
        if (id) {
          toast.success(CONTENT_MUTATION_RESULTS.draftSaved);
          router.push(PUBLICATIONS_BASE_PATH);
        }
        break;
      }
      }
    } catch (err) {
      toast.error(`Помилка: ${err instanceof Error ? err.message : String(err)}`);
      console.error(`Action ${actionId} failed`, err);
    }
  };

  const onEdit = async () => {
    const id = await handleSave(BaseContentStatuses.Draft);
    router.push(`${PUBLICATIONS_BASE_PATH}/${publicationType}/${id}/edit`);
  };

  return (
    <>
      {mode !== 'seo' && (
        <DividedHeader
          originUrl={PUBLICATIONS_BASE_PATH}
          rightActionsComponent={
            publicationType === 'media' ? (
              <HeaderRightActions
                mode="edit"
                onPublish={() => handleMenuAction(MenuActionId.PUBLISH)}
                onMenuOpen={handleOpen}
              />
            ) : (
              <HeaderRightActions mode="create" onEdit={onEdit} />
            )
          }
        >
          <Typography variant="h7">{`${mode === 'edit' ? 'Редагування' : 'Створення'} ${PAGE_TITLES[publicationType]}`}</Typography>
        </DividedHeader>
      )}
      <Box sx={styles.contentWrapper}>
        <SeoCollapsibleBlock
          title="Деталі"
          defaultExpanded
          sx={styles.seoBlock as object}
          childrenContainerSx={styles.seoBlockChildren as object}
          showAlternativeText
          showTicketUrl={publicationType === 'events'}
          extraFieldsBeforeKeywords={publicationType === 'media'}
          forceShowErrors={forceShowErrors}
          crop={crop}
          onChangeCrop={setCrop}
          value={seoValue}
          onChange={setSeoValue}
          extraFields={seoExtraFields}
        >
          <TextField
            label={ADMIN_TITLE_LABELS[publicationType]}
            value={adminTitle}
            onChange={(e) => setAdminTitle(e.target.value)}
            error={Boolean(adminTitleError)}
            helperText={adminTitleError}
            sx={styles.textField}
            slotProps={{ input: { sx: styles.textFieldInput } }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
            <DatePicker
              label="Дата публікації"
              value={publishDate}
              onChange={(newVal) => setPublishDate(newVal)}
              slotProps={{
                textField: { sx: styles.datePickerTextField, InputProps: { sx: styles.datePickerInput } }
              }}
            />
          </LocalizationProvider>
        </SeoCollapsibleBlock>

        <Menu
          anchorEl={anchor}
          open={isOpen}
          onClose={handleClose}
          disableScrollLock
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { width: 260 } } }}
          sx={editStyles.menu}
        >
          {actions.map((action) => (
            <MenuItem sx={editStyles.menuItem} key={action.id} onClick={() => handleMenuAction(action.id)}>
              <Typography variant="textMd">{action.label}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </>
  );
}