import { Box, Typography } from '@mui/material';
import { JSONContent } from '@tiptap/react';
import { ArrowUpRight, LayoutPanelTop } from 'lucide-react';
import Link from 'next/link';

import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import SectionDivider from '../../design-system/section-divider/SectionDivider';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useTitleValidation } from '~/shared/hooks/use-title-validation/useTitleValidation';
import { useStore } from '~/store';
import { LocalizedString, ProseDoc } from '~/types/common';

const FoundationFoundersRedirect = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.FOUNDATION_FOUNDERS;

  const setField = useStore((state) => state.setField);
  const toggleBlockVisibility = useStore((state) => state.toggleBlockVisibility);
  const currentLocale: keyof LocalizedString = useStore((state) => state.locale);
  const { block } = usePageBlock(pageId, blockId);

  const titleTextValidation = useTitleValidation(
    `${pageId}:${blockId}:titleText`,
    block?.titleText?.[currentLocale] as ProseDoc
  );
  const listTitleValidation = useTitleValidation(
    `${pageId}:${blockId}:listTitle`,
    block?.listTitle?.[currentLocale] as ProseDoc
  );

  if (!block) return <EditBlockSkeleton />;

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
  return (
    <Box>
      <CollapsibleBlock
        title="Команда Фундації"
        grip
        hidden={block.hidden}
        onToggleVisibility={() => toggleBlockVisibility(pageId, blockId)}
      >
        <CustomTextField
          sx={{ mb: 2, mt: '4px' }}
          fieldType="formatting"
          label="Заголовок списку"
          value={block.listTitle?.[currentLocale]}
          onChange={(value) => handleChangeListTitle(value)}
          onBlur={listTitleValidation.onBlur}
          error={listTitleValidation.error}
          helperText={listTitleValidation.helperText}
        />

        <CustomTextField
          fieldType="formatting"
          label="Головний текст"
          value={block.titleText?.[currentLocale]}
          onChange={(value) => handleChangeTitleText(value)}
          onBlur={titleTextValidation.onBlur}
          error={titleTextValidation.error}
          helperText={titleTextValidation.helperText}
          sx={{ mb: 2, mt: '4px' }}
        />

        <SectionDivider>Члени Команди</SectionDivider>

        <Typography variant="body1" sx={{ color: 'blue.800' }}>
          Ця частина секції редагується у налаштуваннях
          <Typography
            variant="inherit"
            component="span"
            sx={{ display: 'inline-flex', alignItems: 'center', mx: 1, verticalAlign: 'middle' }}
          >
            <LayoutPanelTop size={20} style={{ marginRight: '4px' }} /> Секції сайту.
          </Typography>
          <Link
            href="/foundation-team"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              verticalAlign: 'middle',
              gap: '4px',
              textDecoration: 'underline',
              textDecorationSkipInk: 'none',
              color: 'black'
            }}
          >
            Перейти до редагування
            <ArrowUpRight />
          </Link>
        </Typography>
      </CollapsibleBlock>
    </Box>
  );
};

export default FoundationFoundersRedirect;
