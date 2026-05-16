'use client';

import { Box, Typography } from '@mui/material';
import { Upload } from 'lucide-react';
import { useState } from 'react';

import Alert from '~/ds-components/alert/Alert';
import Button from '~/ds-components/button/Button';
import ButtonGroup from '~/ds-components/button-group/ButtonGroup';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import FavouriteStarIcon from '~/public/icons/favourite-star.svg';
import ContentCard from '~/shared/components/content-card/ContentCard';
import DiscardChangesModal from '~/shared/components/design-system/discard-changes-modal/DiscardChangesModal';
import CustomLink from '~/shared/components/design-system/link/CustomLink';
import PasswordField from '~/shared/components/design-system/password-field/PasswordField';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import { CustomTabs } from '~/shared/components/design-system/tabs/Tabs';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import TooltipCustom from '~/shared/components/design-system/tooltip/Tooltip';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import ProgressStatus from '~/shared/components/divided-header/progress-status/ProgressStatus';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';
import { EmptyState } from '~/shared/components/empty-state';
import FileCard from '~/shared/components/file-card';
import { FileInfoSidebar } from '~/shared/components/file-info-sidebar/FileInfoSidebar';
import { ImagePreviewModal } from '~/shared/components/file-info-sidebar/image-preview-modal/ImagePreviewModal';
import { FilteringToolbar, type FilteringToolbarFilterConfig } from '~/shared/components/filtering-toolbar';
import SeoCollapsibleBlock from '~/shared/components/forms/seo-collapsible-block/SeoCollapsibleBlock';
import { SeoBaseFields } from '~/shared/components/forms/seo-metadata-form/seo-base-fields/SeoBaseFields';
import DateTimePicker from '~/shared/components/forms/seo-metadata-form/seo-date-time-picker/DateTimePicker';
import SeoMetadataBlock from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import SeoMetadataForm from '~/shared/components/forms/seo-metadata-form/SeoMetadataForm';
import { Header } from '~/shared/components/header/Header';
import LoginModal from '~/shared/components/login-modal/LoginModal';
import { MediaModalContainer } from '~/shared/components/media-modal/components/container/MediaModalContainer';
import { FilterDropdown } from '~/shared/components/media-modal/components/filter-dropdown/FilterDropdown';
import { GalleryCard } from '~/shared/components/media-modal/components/gallery-card/GalleryCard';
import { SearchButton } from '~/shared/components/media-modal/components/search-button/SearchButton';
import { MediaModalSwitcher } from '~/shared/components/media-modal/components/switcher/MediaModalSwitcher';
import { Search, type SearchOption } from '~/shared/components/search/Search';
import type { FilterOption } from '~/shared/components/selector/FilterSelect';

export default function StyleGuide() {
  const tabs = [
    { id: '1', label: 'Tab1' },
    { id: '2', label: 'Tab2' },
    { id: '3', label: 'Tab3' }
  ];

  const searchMock: SearchOption[] = [
    { id: '1', title: 'Option1' },
    { id: '2', title: 'Option2' },
    { id: '3', title: 'Option3' },
    { id: '4', title: 'Option4' },
    { id: '5', title: 'Option5' }
  ];

  const categoryOptions: FilterOption[] = [
    { value: 'frontend', label: 'Фронтенд' },
    { value: 'backend', label: 'Бекенд' },
    { value: 'design', label: 'Дизайн' }
  ];

  const statusOptions: FilterOption[] = [
    { value: 'active', label: 'Активно' },
    { value: 'archived', label: 'В архіві' }
  ];

  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState('1');
  const [isControlledOpen, setIsControlledOpen] = useState(false);
  const [isImagePreviewModalOpen, setIsImagePreviewModalOpen] = useState(false);
  const [isFileInfoSidebarOpen, setIsFileInfoSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isMediaModalContainerOpen, setIsMediaModalContainerOpen] = useState(false);

  const handleOpenDiscardChangesModal = () => setIsDiscardChangesModalOpen(true);
  const handleCloseDiscardChangesModal = () => setIsDiscardChangesModalOpen(false);
  const handleOpenImagePreviewModal = () => setIsImagePreviewModalOpen(true);
  const handleCloseImagePreviewModal = () => setIsImagePreviewModalOpen(false);
  const handleOpenFileInfoSidebar = () => setIsFileInfoSidebarOpen(true);
  const handleCloseFileInfoSidebar = () => setIsFileInfoSidebarOpen(false);
  const handleOpenMediaModalContainer = () => setIsMediaModalContainerOpen(true);
  const handleCloseMediaModalContainer = () => setIsMediaModalContainerOpen(false);

  const handleSubmitChanges = () => {
    setIsDiscardChangesModalOpen(false);
  };

  const handleTabChange = (id: string) => {
    setActiveTabId(id);
  };

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
  };

  const filtersConfig: FilteringToolbarFilterConfig[] = [
    {
      id: 'category-filter',
      label: 'Категорія',
      options: categoryOptions,
      value: selectedCategories,
      onChange: setSelectedCategories
    },
    {
      id: 'status-filter',
      label: 'Статус',
      options: statusOptions,
      value: selectedStatuses,
      onChange: setSelectedStatuses
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '40px' }}>
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

      <Button size="small" variant="filled" color="tertiary" onClick={handleOpenDiscardChangesModal}>
        Open modal
      </Button>

      <DiscardChangesModal
        open={isDiscardChangesModalOpen}
        handleClose={handleCloseDiscardChangesModal}
        handleSubmit={handleSubmitChanges}
      />

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
        id="content-card1"
        type="news"
        coverImage={{
          src: 'https://shorturl.at/xkStA',
          alt: { en: 'event', uk: 'подія' }
        }}
        title={{ en: 'Event' }}
        status="draft"
        onClick={() => {}}
      ></ContentCard>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування HeaderRightActions
      </Typography>

      <Typography variant="h6" sx={{ mt: 2 }}>
        1. Mode: create
      </Typography>

      <HeaderRightActions mode="create"></HeaderRightActions>

      <Typography variant="h6" sx={{ mt: 2 }}>
        2. Mode: seo
      </Typography>

      <HeaderRightActions mode="seo"></HeaderRightActions>

      <Typography variant="h6" sx={{ mt: 2 }}>
        3. Mode: edit
      </Typography>

      <HeaderRightActions mode="edit"></HeaderRightActions>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування ProgressStatus
      </Typography>

      <ProgressStatus></ProgressStatus>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування TitleDropdown
      </Typography>

      <TitleDropdown title="Золотий обруч" type="SEO" onMenuOpen={() => {}} />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування DividedHeader
      </Typography>

      <DividedHeader />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування EmptyState
      </Typography>

      <EmptyState
        title="title"
        description="description"
        icon={<FavouriteStarIcon />}
        action={{ label: 'Click me', href: '#', onClick: () => {} }}
      />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування FileCard
      </Typography>

      <FileCard
        fileType="image"
        fileData={{
          id: 'a1',
          name: 'file',
          dateAdded: '01.01.2001',
          isStarred: true,
          usageLinks: 2,
          imageSrc: '/images/image.png'
        }}
      />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування ImagePreviewModal
      </Typography>

      <Button size="small" variant="filled" color="tertiary" onClick={handleOpenImagePreviewModal}>
        Open modal
      </Button>

      <ImagePreviewModal
        open={isImagePreviewModalOpen}
        src="https://shorturl.at/xkStA"
        alt="kitten"
        onClose={handleCloseImagePreviewModal}
      />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування FileInfoSidebar
      </Typography>

      <Button size="small" variant="filled" color="tertiary" onClick={handleOpenFileInfoSidebar}>
        Open sidebar
      </Button>

      {isFileInfoSidebarOpen && (
        <FileInfoSidebar
          file={{
            id: 'a1',
            type: 'image',
            filename: 'File #1',
            previewUrl: 'google.com',
            addedBy: { name: 'Admin' },
            addedAt: '01.01.2001',
            format: 'png',
            size: '1.55 Mb',
            usageLinks: [{ id: '01', label: 'label', href: 'google.com' }],
            isStarred: true
          }}
          onClose={handleCloseFileInfoSidebar}
        ></FileInfoSidebar>
      )}

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування Search
      </Typography>

      <Search
        search={searchValue}
        setSearch={setSearchValue}
        options={searchMock}
        placeholder="Пошук..."
        maxWidth="400px"
      />

      <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: '8px', maxWidth: '400px' }}>
        <Typography variant="body1">
          <strong>Значення state:</strong> {searchValue || 'немає'}
        </Typography>
      </Box>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування FilteringToolbar
      </Typography>

      <FilteringToolbar
        search={{ search: searchValue, setSearch: setSearchValue, options: searchMock, placeholder: 'Пошук...' }}
        filters={filtersConfig}
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen((prev) => !prev)}
        onClearFilters={handleClearAllFilters}
        filtersButtonLabel="Фільтри"
        clearFiltersTooltip="Скинути всі налаштування"
        rightSlot={
          <Button variant="filled" color="tertiary">
            Кнопка
          </Button>
        }
      />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування SeoCollapsibleBlock
      </Typography>

      <SeoCollapsibleBlock title="title" defaultExpanded>
        <Typography variant="bodySm">Child</Typography>
        <Typography variant="bodySm">Child</Typography>
        <Typography variant="bodySm">Child</Typography>
      </SeoCollapsibleBlock>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування SeoBaseFields
      </Typography>

      <SeoBaseFields
        value={{ title: 'Title', description: 'Description', keywords: 'keyword1, keyword2' }}
        errors={{
          description: 'Description is too short'
        }}
        touched={{ description: true }}
        onFieldChange={() => {}}
        onBlur={() => {}}
        showKeywords={true}
        labels={{
          metaTitle: 'Header',
          metaDescription: 'Description'
        }}
      />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування DateTimePicker
      </Typography>

      <DateTimePicker
        onChange={() => {}}
        labels={{ startDateTime: 'Дата початку події', endDateTime: 'Дата кінця події' }}
      />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування DateTimeFields
      </Typography>

      <DateTimePicker
        onChange={() => {}}
        labels={{ startDateTime: 'Дата початку події', endDateTime: 'Дата кінця події' }}
      />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування SeoMetadataBlock
      </Typography>

      <SeoMetadataBlock />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування SeoMetadataForm
      </Typography>

      <SeoMetadataForm
        value={{ title: 'Title', description: 'Description', keywords: 'keyword1, keyword2' }}
        onChange={() => {}}
        locale="uk"
        ogImage="https://shorturl.at/xkStA"
        onImageChange={() => {}}
        allowIndexing={false}
        onIndexingChange={() => {}}
      ></SeoMetadataForm>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування Header
      </Typography>

      <Header
        title="Title"
        onPreview={() => {}}
        onSave={() => {}}
        onCancel={() => {}}
        isSaving
        onLanguageChange={() => {}}
      />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування LoginModal
      </Typography>

      <LoginModal onSubmit={() => {}} />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування MediaModalContainer
      </Typography>

      <Button size="small" variant="filled" color="tertiary" onClick={handleOpenMediaModalContainer}>
        Open modal
      </Button>

      <MediaModalContainer open={isMediaModalContainerOpen} onClose={handleCloseMediaModalContainer}>
        <Typography variant="bodySm">Child</Typography>
        <Typography variant="bodySm">Child</Typography>
        <Typography variant="bodySm">Child</Typography>
      </MediaModalContainer>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування FilterDropdown
      </Typography>

      <FilterDropdown
        label="Label1"
        value="Value1"
        options={[
          { value: 'Value1', label: 'Label1' },
          { value: 'Value2', label: 'Label2' },
          { value: 'Value3', label: 'Label3' }
        ]}
        onChange={() => {}}
      />

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування GalleryCard
      </Typography>

      <Box sx={{ maxWidth: '400px', padding: '10px', backgroundColor: '#232529' }}>
        <GalleryCard
          src="https://shorturl.at/xkStA"
          fileName="File"
          isStarred
          usageLocations={['Main page', 'Files page']}
          onClick={() => {}}
          testId="file1"
        />
      </Box>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування SearchButton
      </Typography>

      <Box sx={{ maxWidth: '400px', padding: '10px', backgroundColor: 'grey' }}>
        <SearchButton value="Search" onSearch={() => {}} placeholder="Search..." testId="Search" />
      </Box>

      <Typography variant="h4" sx={{ backgroundColor: 'peachpuff' }}>
        Тестування MediaModalSwitcher
      </Typography>

      <MediaModalSwitcher value='GALLERY' onChange={()=>{}}/>
    </Box>
  );
}
