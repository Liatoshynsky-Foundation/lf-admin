'use client';

import { Box, Typography } from '@mui/material';
import { Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { styles } from './page.styles';
import Alert from '~/ds-components/alert/Alert';
import Button from '~/ds-components/button/Button';
import ButtonGroup from '~/ds-components/button-group/ButtonGroup';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import FavouriteStarIcon from '~/public/icons/favourite-star.svg';
import CompositionModal from '~/shared/components/composition-modal/CompositionModal';
import ContentCard from '~/shared/components/content-card/ContentCard';
import DeleteCardModal from '~/shared/components/delete-card-modal/DeleteCardModal';
import DeleteFileModal from '~/shared/components/delete-file-modal/DeleteFileModal';
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
import { FilesCardsLayoutView } from '~/shared/components/files-cards-layout';
import { FilteringToolbar, type FilteringToolbarFilterConfig } from '~/shared/components/filtering-toolbar';
import { SortSelect } from '~/shared/components/filtering-toolbar';
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
import { UsedCard } from '~/shared/components/media-modal/components/used-card/UsedCard';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import { FileView } from '~/shared/components/media-modal/views/file-view/FileView';
import UploadView from '~/shared/components/media-modal/views/upload-view/UploadView';
import MinimizedFileCard from '~/shared/components/minimized-file-card/MinimizedFileCard';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { RenameFileModal } from '~/shared/components/rename-file-modal/RenameFileModal';
import { Search, type SearchOption } from '~/shared/components/search/Search';
import type { FilterOption } from '~/shared/components/selector/FilterSelect';
import { FilterSelect } from '~/shared/components/selector/FilterSelect';
import FilterSelectItem from '~/shared/components/selector/FilterSelectItem/FilterSelectItem';
import { CollapseListNavigation } from '~/shared/components/side-navigation/collapse-list-navigation/CollapseListNavigation';
import { LinkElement } from '~/shared/components/side-navigation/link-element/LinkElement';
import { ListElement } from '~/shared/components/side-navigation/list-element/ListElement';
import { Toaster } from '~/shared/components/toaster/Toaster';
import { ViewToggle } from '~/shared/components/view-toggle';

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

const pageHeaderTabs = [
  { value: 'Tab1', label: 'tab1', href: '/style-guide' },
  { value: 'Tab2', label: 'tab2', href: '/style-guide', disabled: true },
  { value: 'Tab3', label: 'tab3', href: '/style-guide' }
];

type SortField = 'date' | 'name';
type SortOrder = 'newest' | 'oldest' | 'asc' | 'desc';

const sortSelectFields: { value: SortField; label: string }[] = [
  { value: 'date', label: 'Нові спочатку' },
  { value: 'name', label: 'Назва файлу' }
];

const sortSelectOrders: Record<SortField, { value: SortOrder; label: string }[]> = {
  date: [
    { value: 'newest', label: 'Новіші-старіші' },
    { value: 'oldest', label: 'Старіші-новіші' }
  ],
  name: [
    { value: 'asc', label: 'А-Я' },
    { value: 'desc', label: 'Я-А' }
  ]
};

const SandboxSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={styles.sandboxWrapper}>
    <Typography variant="h4" sx={styles.sandboxText}>
      Тестування {title}
    </Typography>
    {children}
  </Box>
);

export default function StyleGuide() {
  const mockPdfFile = new File([''], 'my-document.pdf', {
    type: 'application/pdf',
    lastModified: Date.now()
  });

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
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isRenameFileModalOpen, setIsRenameFileModalOpen] = useState(false);
  const [isCompositionModalOpen, setIsCompositionModalOpen] = useState(false);

  const [currentField, setCurrentField] = useState<SortField>('date');
  const [currentOrder, setCurrentOrder] = useState<SortOrder>('newest');
  const [currentView, setCurrentView] = useState<FilesCardsLayoutView>('grid');
  const [isDeleteCardModalOpen, setIsDeleteCardModalOpen] = useState(false);
  const [isDeleteFileModalOpen, setIsDeleteFileModalOpen] = useState(false);
  const [isDeletingToggled, setIsDeletingToggled] = useState(false);
  const [isRefsIncluded, setIsRefsIncluded] = useState(false);

  const handleToggleDeletingMode = () => setIsDeletingToggled((prev) => !prev);
  const handleToggleRefsIncluded = () => setIsRefsIncluded((prev) => !prev);

  const activeFieldLabel = sortSelectFields.find((f) => f.value === currentField)?.label ?? '';

  const handleSubmitChanges = () => setIsDiscardChangesModalOpen(false);

  const handleTabChange = (id: string) => {
    setActiveTabId(id);
  };

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
  };

  const showSuccess = () => {
    toast.success('Успішний тост');
  };

  const showError = () => {
    toast.error('Тост-помилка');
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
    <Box sx={styles.pageWrapper}>
      <SandboxSection title="Alert">
        <Typography variant="h6">1. Variant: Filled</Typography>
        <Alert severity="error" variant="filled" title="Title" description="Description" label="Label" />
        <Alert severity="warning" variant="filled" title="Title" description="Description" label="Label" />
        <Alert severity="info" variant="filled" title="Title" description="Description" label="Label" />
        <Alert severity="success" variant="filled" title="Title" description="Description" label="Label" />

        <Typography variant="h6" sx={styles.blockSeparator}>
          2. Variant: Outlined
        </Typography>
        <Alert severity="error" variant="outlined" title="Title" description="Description" label="Label" />
        <Alert severity="warning" variant="outlined" title="Title" description="Description" label="Label" />
        <Alert severity="info" variant="outlined" title="Title" description="Description" label="Label" />
        <Alert severity="success" variant="outlined" title="Title" description="Description" label="Label" />
      </SandboxSection>

      <SandboxSection title="Button">
        <Typography variant="h6">1. Variant: Filled, Palette: Primary, Size: Small</Typography>
        <Button size="small" variant="filled" color="primary" endIcon={<Upload size={20} aria-hidden="true" />}>
          Завантажити файл
        </Button>

        <Typography variant="h6">2. Variant: Outlined, Palette: Primary, Size: Medium</Typography>
        <Button size="medium" variant="outlined" color="primary" endIcon={<Upload size={20} aria-hidden="true" />}>
          Завантажити файл
        </Button>

        <Typography variant="h6">3. Variant: Filled, Palette: Secondary, Size: Large</Typography>
        <Box sx={styles.downloadWrapper}>
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
        <Box sx={styles.downloadWrapper}>
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
      </SandboxSection>

      <SandboxSection title="ButtonGroup">
        <Typography variant="h6">1. Palette: Primary, Size: Small (Default)</Typography>
        <ButtonGroup buttons={['Опція 1', 'Опція 2', 'Опція 3']} defaultActiveButton={0} />

        <Typography variant="h6" sx={styles.componentVariantSeparator}>
          2. Palette: Primary, Size: Big
        </Typography>
        <ButtonGroup
          buttons={['Опція 1', 'Опція 2', 'Опція 3', 'Опція 4']}
          defaultActiveButton={1}
          size="big"
          palette="primary"
        />

        <Typography variant="h6" sx={styles.componentVariantSeparator}>
          3. Palette: Secondary, Size: Small
        </Typography>
        <ButtonGroup buttons={['Опція 1', 'Опція 2', 'Опція 3']} defaultActiveButton={0} palette="secondary" />

        <Typography variant="h6" sx={styles.componentVariantSeparator}>
          4. Palette: Secondary, Size: Big
        </Typography>
        <ButtonGroup
          buttons={['Опція 1', 'Опція 2', 'Опція 3', 'Опція 4']}
          defaultActiveButton={2}
          size="big"
          palette="secondary"
        />

        <Typography variant="h6" sx={styles.componentVariantSeparator}>
          5. Palette: Tertiary, Size: Small
        </Typography>
        <ButtonGroup buttons={['Опція 1', 'Опція 2', 'Опція 3']} defaultActiveButton={0} palette="tertiary" />

        <Typography variant="h6" sx={styles.componentVariantSeparator}>
          6. Palette: Tertiary, Size: Big
        </Typography>
        <ButtonGroup
          buttons={['Опція 1', 'Опція 2', 'Опція 3', 'Опція 4']}
          defaultActiveButton={2}
          size="big"
          palette="tertiary"
        />
      </SandboxSection>

      <SandboxSection title="CollapsibleBlock">
        <CollapsibleBlock title="Collapse">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius distinctio ex nisi, voluptatum eligendi sed
          rerum facere perferendis ab natus assumenda molestias? Amet magni repudiandae doloremque voluptas, numquam
          reprehenderit animi.
        </CollapsibleBlock>
      </SandboxSection>

      <SandboxSection title="DiscardChangesModal">
        <Button size="small" variant="filled" color="tertiary" onClick={() => setIsDiscardChangesModalOpen(true)}>
          Open modal
        </Button>

        <DiscardChangesModal
          open={isDiscardChangesModalOpen}
          handleClose={() => setIsDiscardChangesModalOpen(false)}
          handleSubmit={handleSubmitChanges}
        />
      </SandboxSection>

      <SandboxSection title="CustomLink">
        <CustomLink path="/style-guide">Link</CustomLink>
      </SandboxSection>

      <SandboxSection title="PasswordField">
        <PasswordField helperText={'Enter the password'}></PasswordField>
      </SandboxSection>

      <SandboxSection title="PhotoBlock">
        <ImagePreviewBlock imageUrl="https://shorturl.at/xkStA" onChangeImage={() => {}}></ImagePreviewBlock>
      </SandboxSection>

      <SandboxSection title="CustomTabs">
        <CustomTabs tabs={tabs} activeTab={activeTabId} onTabChange={handleTabChange}></CustomTabs>
      </SandboxSection>

      <SandboxSection title="CustomTextField">
        <CustomTextField
          title="Заголовок сторінки"
          titleSx={styles.textFieldInput}
          label="Заголовок сторінки"
        ></CustomTextField>
      </SandboxSection>

      <SandboxSection title="TooltipCustom">
        <Typography variant="h6" sx={styles.componentVariantSeparator}>
          1. Default
        </Typography>

        <TooltipCustom text="Some text">
          <Button fullWidth size="large" variant="filled" color="primary">
            Hover me
          </Button>
        </TooltipCustom>

        <Typography variant="h6" sx={styles.componentVariantSeparator}>
          2. With an arrow
        </Typography>

        <TooltipCustom text="Some text" showArrow placement="bottom">
          <Button fullWidth size="large" variant="filled" color="primary">
            Hover me
          </Button>
        </TooltipCustom>

        <Typography variant="h6" sx={styles.componentVariantSeparator}>
          3. Without children as default Typography
        </Typography>

        <Box textAlign="center">
          <TooltipCustom
            text="Hover text"
            wrapperProps={{
              sx: styles.customToolTipWrapper
            }}
            textProps={{
              sx: styles.customToolTipText
            }}
          />
        </Box>

        <Typography variant="h6" sx={styles.componentVariantSeparator}>
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
      </SandboxSection>

      <SandboxSection title="ContentCard">
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
        />
      </SandboxSection>

      <SandboxSection title="HeaderRightActions">
        <Typography variant="h6" sx={styles.componentVariantSeparator}>
          1. Mode: create
        </Typography>

        <HeaderRightActions mode="create"></HeaderRightActions>

        <Typography variant="h6" sx={styles.componentVariantSeparator}>
          2. Mode: seo
        </Typography>

        <HeaderRightActions mode="seo"></HeaderRightActions>

        <Typography variant="h6" sx={styles.componentVariantSeparator}>
          3. Mode: edit
        </Typography>

        <HeaderRightActions mode="edit"></HeaderRightActions>
      </SandboxSection>

      <SandboxSection title="ProgressStatus">
        <ProgressStatus />
      </SandboxSection>

      <SandboxSection title="TitleDropdown">
        <TitleDropdown title="Золотий обруч" type="SEO" onMenuOpen={() => {}} />
      </SandboxSection>

      <SandboxSection title="DividedHeader">
        <DividedHeader>
          <Typography variant="h7">{'Редагування Ми у ЗМІ'}</Typography>
        </DividedHeader>
      </SandboxSection>

      <SandboxSection title="EmptyState">
        <EmptyState
          title="title"
          description="description"
          icon={<FavouriteStarIcon />}
          action={{ label: 'Click me', href: '#', onClick: () => {} }}
        />
      </SandboxSection>

      <SandboxSection title="FileCard">
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
      </SandboxSection>

      <SandboxSection title="ImagePreviewModal">
        <Button size="small" variant="filled" color="tertiary" onClick={() => setIsImagePreviewModalOpen(true)}>
          Open modal
        </Button>

        <ImagePreviewModal
          open={isImagePreviewModalOpen}
          src="https://shorturl.at/xkStA"
          alt="kitten"
          onClose={() => setIsImagePreviewModalOpen(false)}
        />
      </SandboxSection>

      <SandboxSection title="FileInfoSidebar">
        <Button size="small" variant="filled" color="tertiary" onClick={() => setIsFileInfoSidebarOpen(true)}>
          Open sidebar
        </Button>

        {isFileInfoSidebarOpen && (
          <FileInfoSidebar
            file={{
              id: 'a1',
              type: 'image',
              filename: 'File #1',
              previewUrl: '/style-guide',
              addedBy: { name: 'Admin' },
              addedAt: '01.01.2001',
              format: 'png',
              size: '1.55 Mb',
              usageLinks: [{ id: '01', label: 'label', href: '/style-guide' }],
              isStarred: true
            }}
            onClose={() => setIsFileInfoSidebarOpen(false)}
          ></FileInfoSidebar>
        )}
      </SandboxSection>

      <SandboxSection title="Search">
        <Search
          search={searchValue}
          setSearch={setSearchValue}
          options={searchMock}
          placeholder="Пошук..."
          maxWidth="400px"
        />

        <Box sx={styles.searchStatePreview}>
          <Typography variant="body1">
            <strong>Значення state:</strong> {searchValue || 'немає'}
          </Typography>
        </Box>
      </SandboxSection>

      <SandboxSection title="FilteringToolbar">
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
          bottomTrailingContent={
            <SortSelect
              triggerLabel={`${activeFieldLabel}`}
              fieldOptions={sortSelectFields}
              orderOptions={sortSelectOrders}
              fieldValue={currentField}
              value={currentOrder}
              onFieldChange={(field) => {
                setCurrentField(field);
                setCurrentOrder(sortSelectOrders[field][0].value);
              }}
              onValueChange={(value) => {
                setCurrentOrder(value);
              }}
            />
          }
        />
      </SandboxSection>

      <SandboxSection title="SeoCollapsibleBlock">
        <SeoCollapsibleBlock title="title" defaultExpanded>
          <Typography variant="bodySm">Child</Typography>
          <Typography variant="bodySm">Child</Typography>
          <Typography variant="bodySm">Child</Typography>
        </SeoCollapsibleBlock>
      </SandboxSection>

      <SandboxSection title="SeoBaseFields">
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
      </SandboxSection>

      <SandboxSection title="DateTimePicker">
        <DateTimePicker
          onChange={() => {}}
          labels={{ startDateTime: 'Дата початку події', endDateTime: 'Дата кінця події' }}
        />
      </SandboxSection>

      <SandboxSection title="SeoMetadataBlock">
        <SeoMetadataBlock />
      </SandboxSection>

      <SandboxSection title="SeoMetadataForm">
        <SeoMetadataForm
          value={{ title: 'Title', description: 'Description', keywords: 'keyword1, keyword2' }}
          onChange={() => {}}
          locale="uk"
          ogImage="https://shorturl.at/xkStA"
          onImageChange={() => {}}
          allowIndexing={false}
          onIndexingChange={() => {}}
        ></SeoMetadataForm>
      </SandboxSection>

      <SandboxSection title="Header">
        <Header
          title="Title"
          onPreview={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          isSaving
          onLanguageChange={() => {}}
        />
      </SandboxSection>

      <SandboxSection title="LoginModal">
        <LoginModal onSubmit={() => {}} />
      </SandboxSection>

      <SandboxSection title="MediaModalContainer">
        <Button size="small" variant="filled" color="tertiary" onClick={() => setIsMediaModalContainerOpen(true)}>
          Open modal
        </Button>

        <MediaModalContainer open={isMediaModalContainerOpen} onClose={() => setIsMediaModalContainerOpen(false)}>
          <Typography variant="bodySm">Child</Typography>
          <Typography variant="bodySm">Child</Typography>
          <Typography variant="bodySm">Child</Typography>
        </MediaModalContainer>
      </SandboxSection>

      <SandboxSection title="FilterDropdown">
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
      </SandboxSection>

      <SandboxSection title="GalleryCard">
        <Box sx={styles.mediaContainer}>
          <GalleryCard
            src="https://shorturl.at/xkStA"
            fileName="File"
            isStarred
            usageLocations={['Main page', 'Files page']}
            onClick={() => {}}
          />
        </Box>
      </SandboxSection>

      <SandboxSection title="SearchButton">
        {' '}
        <Box sx={styles.searchButtonContainer}>
          <SearchButton value="Search" onSearch={() => {}} placeholder="Search..." />
        </Box>
      </SandboxSection>

      <SandboxSection title="MediaModalSwitcher">
        <MediaModalSwitcher value="GALLERY" onChange={() => {}} />
      </SandboxSection>

      <SandboxSection title="UsedCard">
        <Box sx={styles.mediaContainer}>
          <UsedCard src="https://shorturl.at/xkStA" fileName="File 1" locale="uk" onClick={() => {}} />
        </Box>
      </SandboxSection>

      <SandboxSection title="MediaModal">
        <Button size="small" variant="filled" color="tertiary" onClick={() => setIsMediaModalOpen(true)}>
          Open modal
        </Button>

        <MediaModal open={isMediaModalOpen} onClose={() => setIsMediaModalOpen(false)} onApply={() => {}} />
      </SandboxSection>

      <SandboxSection title="FileView">
        <Box sx={styles.mediaContainer}>
          <FileView file={mockPdfFile} />
        </Box>
      </SandboxSection>

      <SandboxSection title="UploadView">
        <Box sx={styles.mediaContainer}>
          <UploadView selected={null} onPick={() => {}} />
        </Box>
      </SandboxSection>

      <SandboxSection title="MinimizedFileCard">
        <MinimizedFileCard id="fileCard" fileType="img" starred linked name="File card 1" date="11.11.2011" />
      </SandboxSection>

      <SandboxSection title="PageHeader">
        <PageHeader title="Title" tabs={pageHeaderTabs} activeTab="Tab1" />
      </SandboxSection>

      <SandboxSection title="RenameFileModal">
        <Button size="small" variant="filled" color="tertiary" onClick={() => setIsRenameFileModalOpen(true)}>
          Open modal
        </Button>

        <RenameFileModal
          open={isRenameFileModalOpen}
          onClose={() => setIsRenameFileModalOpen(false)}
          fileId="fileId"
          currentFilename="File1"
        />
      </SandboxSection>

      <SandboxSection title="FilterSelectItem">
        <FilterSelectItem label="item1" selected />
      </SandboxSection>

      <SandboxSection title="FilterSelect">
        <FilterSelect label="label" options={categoryOptions} menuMinWidth={200} />
      </SandboxSection>

      <SandboxSection title="Toaster">
        <Button variant="filled" color="primary" onClick={showSuccess}>
          Показати Success-сповіщення
        </Button>

        <Button variant="filled" color="primary" onClick={showError}>
          Показати Error-сповіщення
        </Button>

        <Toaster />
      </SandboxSection>

      <SandboxSection title="ViewToggle">
        <ViewToggle
          value={currentView}
          onChange={(newValue) => {
            setCurrentView(newValue);
          }}
        />
      </SandboxSection>

      <SandboxSection title="LinkElement (closed)">
        <LinkElement element={{ title: 'Title', iconSrc: 'doc', href: '/style-guide' }} open={false} />
      </SandboxSection>

      <SandboxSection title="LinkElement (open)">
        <ListElement element={{ title: 'Title', iconSrc: 'doc', href: '/style-guide' }} open />
      </SandboxSection>

      <SandboxSection title="CollapseListNavigation">
        <CollapseListNavigation
          openNavbar={true}
          elementProps={{
            element: { title: 'Title1', iconSrc: 'doc', href: '/style-guide' },
            collapseElements: [
              { title: 'Title2', iconSrc: 'doc', href: '/style-guide' },
              { title: 'Title3', iconSrc: 'doc', href: '/style-guide' }
            ]
          }}
        />
      </SandboxSection>

      <SandboxSection title="DeleteCardModal">
        <Button size="small" variant="filled" color="tertiary" onClick={() => setIsDeleteCardModalOpen(true)}>
          Open modal
        </Button>

        <DeleteCardModal
          open={isDeleteCardModalOpen}
          onClose={() => setIsDeleteCardModalOpen(false)}
          onDelete={() => {}}
        />
      </SandboxSection>

      <SandboxSection title="DeleteFileModal">
        <Button size="small" variant="filled" color="tertiary" onClick={handleToggleDeletingMode}>
          Toggle isDeleting <p>(now {isDeletingToggled ? <b>on</b> : <b>off</b>})</p>
        </Button>

        <Button size="small" variant="filled" color="tertiary" onClick={handleToggleRefsIncluded}>
          Unclude usage refs: <p>{isRefsIncluded ? <b>yes</b> : <b>no</b>}</p>
        </Button>

        <Button size="small" variant="filled" color="tertiary" onClick={() => setIsDeleteFileModalOpen(true)}>
          Open modal
        </Button>

        <DeleteFileModal
          open={isDeleteFileModalOpen}
          onClose={() => setIsDeleteFileModalOpen(false)}
          onConfirm={() => {}}
          file={{
            id: 'id1',
            filename: 'File1',
            ...(isRefsIncluded && { usageRefs: [{ pageId: 'id1', blockId: 'block1' }] })
          }}
          isDeleting={isDeletingToggled}
        />
      </SandboxSection>
      <SandboxSection title="CompositionModal">
        <Button color='tertiary' variant="filled" sx={{ mt: 2 }} onClick={() => setIsCompositionModalOpen(true)}>
          Open modal
        </Button>
        <CompositionModal isOpen={isCompositionModalOpen} onClose={() => setIsCompositionModalOpen(false)} />
      </SandboxSection>
    </Box>
  );
}
