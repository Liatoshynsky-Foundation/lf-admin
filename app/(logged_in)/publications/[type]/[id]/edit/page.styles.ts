
import { publicationsChipsColors } from '~/shared/theme/colors';

type ChipColorType = 'draft' | 'published' | 'news' | 'event' | 'media';

const ChipsColorsMap: Record<ChipColorType, string> = {
  draft: publicationsChipsColors.draftBg,
  published: publicationsChipsColors.publishedBg,
  news: publicationsChipsColors.newsBg,
  event: publicationsChipsColors.eventBg,
  media: publicationsChipsColors.mediaMentionBg
};

export const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    bgcolor: 'adminBlue.50'
  },
  header: {
    bgcolor: 'white'
  },
  menu: {
    mt: 1,
    '& .MuiPaper-root': {
      '&::-webkit-scrollbar': {
        display: 'none'
      },
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',

      overflowY: 'auto'
    }
  },
  menuItem: {
    p: '10px 16px',
    borderRadius: '8px',
    height: 44
  },
  mainContent: {
    bgcolor: 'adminBlue.50',
    p: '16px 32px'
  },
  collapse: {
    bgcolor: 'white',
    border: '1px solid',
    borderColor: 'blue.200',
    px: '24px',
    '& .MuiAccordionSummary-root, & .MuiAccordionDetails-root': {
      p: '4px 0'
    },
    '& .MuiAccordionSummary-content': {}
  },
  contentEditor: {
    border: 'none',
    p: 0,
    bgcolor: 'white',
    '& .bn-editor': {
      p: 0,
      bgcolor: 'white'
    }
  },
  chip: (color: ChipColorType) => ({
    pointerEvents: 'none',
    cursor: 'default',
    userSelect: 'none',

    '&:hover': {
      bgcolor: 'inherit'
    },
    '&:active': {
      boxShadow: 'none'
    },

    '& .MuiTouchRipple-root': {
      display: 'none'
    },

    bgcolor: ChipsColorsMap[color],
    height: 28,
    '& .MuiChip-root': {
      p: '4px 8px'
    }
  })
};
