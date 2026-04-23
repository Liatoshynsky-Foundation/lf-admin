'use client';

import { Box, Typography } from '@mui/material';
import { Upload } from 'lucide-react';
import { useState } from 'react';

import Alert from '~/ds-components/alert/Alert';
import Button from '~/ds-components/button/Button';
import ButtonGroup from '~/ds-components/button-group/ButtonGroup';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import ContentCard from '~/shared/components/content-card/ContentCard';
import DiscardChangesModal from '~/shared/components/design-system/discard-changes-modal/DiscardChangesModal';
import CustomLink from '~/shared/components/design-system/link/CustomLink';
import PasswordField from '~/shared/components/design-system/password-field/PasswordField';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import { CustomTabs } from '~/shared/components/design-system/tabs/Tabs';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import TooltipCustom from '~/shared/components/design-system/tooltip/Tooltip';

export default function StyleGuide() {
  const tabs = [
    { id: '1', label: 'Tab1' },
    { id: '2', label: 'Tab2' },
    { id: '3', label: 'Tab3' }
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState('1');
  const [isControlledOpen, setIsControlledOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSubmit = () => {
    setIsOpen(false);
  };

  const handleTabChange = (id: string) => {
    setActiveTabId(id);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '40px', maxWidth: '800px' }}>
      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування Alert
      </Typography>

      <Typography variant="h6">1. Variant: Filled</Typography>
      <Alert severity="error" variant="filled" title="Title" description="Description" label="Label" />
      <Alert severity="warning" variant="filled" title="Title" description="Description" label="Label" />
      <Alert severity="info" variant="filled" title="Title" description="Description" label="Label" />
      <Alert severity="success" variant="filled" title="Title" description="Description" label="Label" />

      <Typography variant="h6" sx={{ mt: 4 }}>
        2. Variant: Outlined
      </Typography>
      <Alert severity="error" variant="outlined" title="Title" description="Description" label="Label" />
      <Alert severity="warning" variant="outlined" title="Title" description="Description" label="Label" />
      <Alert severity="info" variant="outlined" title="Title" description="Description" label="Label" />
      <Alert severity="success" variant="outlined" title="Title" description="Description" label="Label" />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування Button
      </Typography>

      <Typography variant="h6">1. Variant: Filled, Palette: Primary, Size: Small</Typography>
      <Button size="small" variant="filled" color="primary" endIcon={<Upload size={20} aria-hidden="true" />}>
        Завантажити файл
      </Button>

      <Typography variant="h6">2. Variant: Outlined, Palette: Primary, Size: Medium</Typography>
      <Button size="medium" variant="outlined" color="primary" endIcon={<Upload size={20} aria-hidden="true" />}>
        Завантажити файл
      </Button>

      <Typography variant="h6">3. Variant: Filled, Palette: Secondary, Size: Large</Typography>
      <Box
        sx={{
          backgroundColor: 'black',
          padding: '16px',
          borderRadius: '8px'
        }}
      >
        <Button
          fullWidth
          size="large"
          variant="filled"
          color="secondary"
          endIcon={<Upload size={20} aria-hidden="true" />}
        >
          Завантажити файл
        </Button>
      </Box>

      <Typography variant="h6">4. Variant: Outlined, Palette: Secondary, Size: Small</Typography>
      <Box
        sx={{
          backgroundColor: 'black',
          padding: '16px',
          borderRadius: '8px'
        }}
      >
        <Button
          fullWidth
          size="small"
          variant="outlined"
          color="secondary"
          endIcon={<Upload size={20} aria-hidden="true" />}
        >
          Завантажити файл
        </Button>
      </Box>

      <Typography variant="h6">5. Variant: Filled, Palette: Tertiary, Size: Small</Typography>
      <Button size="small" variant="filled" color="tertiary" endIcon={<Upload size={20} aria-hidden="true" />}>
        Завантажити файл
      </Button>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування ButtonGroup
      </Typography>

      <Typography variant="h6">1. Palette: Primary, Size: Small (Default)</Typography>
      <ButtonGroup buttons={['Опція 1', 'Опція 2', 'Опція 3']} defaultActiveButton={0} />

      <Typography variant="h6" sx={{ mt: 2 }}>
        2. Palette: Primary, Size: Big
      </Typography>
      <ButtonGroup
        buttons={['Опція 1', 'Опція 2', 'Опція 3', 'Опція 4']}
        defaultActiveButton={1}
        size="big"
        palette="primary"
      />

      <Typography variant="h6" sx={{ mt: 2 }}>
        3. Palette: Secondary, Size: Small
      </Typography>
      <ButtonGroup buttons={['Опція 1', 'Опція 2', 'Опція 3']} defaultActiveButton={0} palette="secondary" />

      <Typography variant="h6" sx={{ mt: 2 }}>
        4. Palette: Secondary, Size: Big
      </Typography>
      <ButtonGroup
        buttons={['Опція 1', 'Опція 2', 'Опція 3', 'Опція 4']}
        defaultActiveButton={2}
        size="big"
        palette="secondary"
      />

      <Typography variant="h6" sx={{ mt: 2 }}>
        5. Palette: Tertiary, Size: Small
      </Typography>
      <ButtonGroup buttons={['Опція 1', 'Опція 2', 'Опція 3']} defaultActiveButton={0} palette="tertiary" />

      <Typography variant="h6" sx={{ mt: 2 }}>
        6. Palette: Tertiary, Size: Big
      </Typography>
      <ButtonGroup
        buttons={['Опція 1', 'Опція 2', 'Опція 3', 'Опція 4']}
        defaultActiveButton={2}
        size="big"
        palette="tertiary"
      />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування CollapsibleBlock
      </Typography>

      <CollapsibleBlock title="Collapse">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius distinctio ex nisi, voluptatum eligendi sed rerum
        facere perferendis ab natus assumenda molestias? Amet magni repudiandae doloremque voluptas, numquam
        reprehenderit animi.
      </CollapsibleBlock>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування DiscardChangesModal
      </Typography>

      <Button size="small" variant="filled" color="tertiary" onClick={handleOpen}>
        Open modal
      </Button>

      <DiscardChangesModal open={isOpen} handleClose={handleClose} handleSubmit={handleSubmit} />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування CustomLink
      </Typography>

      <CustomLink path="#">Link</CustomLink>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування PasswordField
      </Typography>

      <PasswordField helperText={'Enter the password'}></PasswordField>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування PhotoBlock
      </Typography>

      <ImagePreviewBlock imageUrl="https://shorturl.at/xkStA" onChangeImage={() => {}}></ImagePreviewBlock>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування CustomTabs
      </Typography>

      <CustomTabs tabs={tabs} activeTab={activeTabId} onTabChange={handleTabChange}></CustomTabs>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування CustomTextField
      </Typography>

      <CustomTextField
        title="Заголовок сторінки"
        titleSx={{ fontSize: 18, fontWeight: 700 }}
        label="Заголовок сторінки"
      ></CustomTextField>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування TooltipCustom
      </Typography>

      <Typography variant="h6" sx={{ mt: 2 }}>
        1. Default
      </Typography>

      <TooltipCustom text="Some text">
        <Button fullWidth size="large" variant="filled" color="primary">
          Hover me
        </Button>
      </TooltipCustom>

      <Typography variant="h6" sx={{ mt: 2 }}>
        2. With an arrow
      </Typography>

      <TooltipCustom text="Some text" showArrow placement="bottom">
        <Button fullWidth size="large" variant="filled" color="primary">
          Hover me
        </Button>
      </TooltipCustom>

      <Typography variant="h6" sx={{ mt: 2 }}>
        3. Without children as default Typography
      </Typography>

      <Box textAlign="center">
        <TooltipCustom
          text="Hover text"
          wrapperProps={{
            sx: {
              width: '100%',
              border: '1px dashed grey',
              p: 1,
              display: 'inline-block',
              cursor: 'help'
            }
          }}
          textProps={{
            sx: { fontWeight: 'bold' }
          }}
        />
      </Box>

      <Typography variant="h6" sx={{ mt: 2 }}>
        4. Controllable
      </Typography>

      <TooltipCustom title={<b>I am opened with the state</b>} showArrow placement="right" isOpen={isControlledOpen}>
        <Button
          fullWidth
          size="large"
          variant="filled"
          color="primary"
          onClick={() => setIsControlledOpen(!isControlledOpen)}
        >
          Click me
        </Button>
      </TooltipCustom>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування ContentCard
      </Typography>

      <ContentCard
        type="event"
        coverImage={{ src: 'https://shorturl.at/xkStA', alt: { en: 'event', uk: 'подія' } }}
        title={{ en: 'Event' }}
        status="draft"
        onClickMenu={() => {}}
      ></ContentCard>
    </Box>
  );
}
