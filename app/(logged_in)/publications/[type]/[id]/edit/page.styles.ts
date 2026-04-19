

type ChipColorType = 'draft' | 'published' | 'news' | 'events' | 'media';

const publicationsChipsColors: Record<ChipColorType, string> = {
  published: '#579A40',
  draft: 'red.200',
  news: '#B6D0F7',
  events: '#F7B6E1',
  media: '#B6F7CF'
};


export const styles = {
  container: {
    width: '100%',
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
  menuSubheader: {
    height: 26,
    display: 'flex',
    alignItems: 'center'
  },
  menuItem: {
    p: '10px 16px',
    borderRadius: '8px',
    height: 44
  },
  draftCaption: {
    color: 'red.600',
  },
  mainContent: {
    minHeight: '100vh',
    bgcolr: 'adminBlue.50',
    p: '16px 32px'
  },
  // collapse: {
  //   bgcolor: 'white',
  //   border: '1px solid',
  //   borderColor: 'blue.200',
  //   px: '24px',
  //   '& .MuiAccordionSummary-root, & .MuiAccordionDetails-root': {
  //     p: '4px 0'
  //   },
  // },
  contentEditor: {
    p: '24px',
    bgcolor: 'white',
    borderRadius: '20px',
    borderColor: 'blue.200',
    '& .bn-editor': {
      maxWidth: '1136px',
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

    bgcolor: publicationsChipsColors[color],
    height: 28,
    '& .MuiChip-root': {
      p: '4px 8px'
    }
  })
};
