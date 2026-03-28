'use client';

import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

import { FORMAT_FILTER_OPTIONS } from '~/constants/file-formats';
import {
  FILE_TABS,
  FILES_UPLOAD_ACCEPT,
  FILES_UPLOAD_ERROR,
  type FilesSortValue,
  type FilesTabValue,
  SORT_FIELD_OPTIONS,
  SORT_OPTIONS,
  SORT_ORDER_OPTIONS,
  type SortFieldValue,
  USAGE_FILTER_OPTIONS
} from '~/constants/files';
import { readFileAsDataURL } from '~/lib/utils/readFileAsDataURL';
import { ControlPanel } from '~/shared/components/control-panel';
import { colors } from '~/shared/components/design-system/button/Button.styles';
import DropdownMenu from '~/shared/components/dropdown-menu/DropdownMenu';
import {
  type FileDetailsSidebarFile,
  FileInfoSidebar,
  type FileUsageLink
} from '~/shared/components/file-info-sidebar/FileInfoSidebar';
import { SIDEBAR_WIDTH } from '~/shared/components/file-info-sidebar/FileInfoSidebar.styles';
import {
  FilesCardsLayout,
  type FilesCardsLayoutItem,
  type FilesCardsLayoutView
} from '~/shared/components/files-cards-layout';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalRenderers } from '~/shared/components/media-modal/MediaModal.renderers';
import type { MediaModalOpenState, MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import { UploadView } from '~/shared/components/media-modal/views/upload-view/UploadView';
import { Search } from '~/shared/components/search/Search';
import { FilterSelect } from '~/shared/components/selector/FilterSelect';
import { filterSelectStyles } from '~/shared/components/selector/FilterSelect.styles';
import FilterSelectItem from '~/shared/components/selector/FilterSelectItem/FilterSelectItem';
import { ViewToggle } from '~/shared/components/view-toggle';
import { useAllAssets } from '~/shared/hooks/use-assets/useAssets';
import { normalizeSearch } from '~/shared/utils/normalizeSearch';
import { AssetType, useUploadBlobMutation } from '~/types/graphql/generated/graphql';

type FilesPageFileItem = FilesCardsLayoutItem & {
  description?: string;
  format?: string;
  createdAtRaw?: string;
  size?: string;
  previewUrl?: string;
  addedBy?: { name: string; avatarUrl?: string };
  usage: FileUsageLink[];
};

const fileTypeMap: Record<AssetType, FilesCardsLayoutItem['type']> = {
  [AssetType.Image]: 'image',
  [AssetType.Pdf]: 'pdf',
  [AssetType.Audio]: 'audio'
};

const isFilesSupportedFile = (file: File): boolean => {
  if (file.type) {
    return (
      file.type === 'image/jpeg' ||
      file.type === 'image/jpg' ||
      file.type === 'image/png' ||
      file.type === 'application/pdf' ||
      file.type === 'audio/mpeg' ||
      file.type === 'audio/wav'
    );
  }

  return /\.(jpe?g|png|pdf|mp3|wav)$/i.test(file.name);
};

const renderFilesUpload: MediaModalRenderers['upload'] = (props) => (
  <UploadView
    {...props}
    accept={FILES_UPLOAD_ACCEPT}
    invalidFileError={FILES_UPLOAD_ERROR}
    isAllowedFile={isFilesSupportedFile}
    ariaLabel="Upload file"
  />
);

const formatDateAdded = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('uk-UA');
};

const formatFileSize = (sizeBytes: number) => {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  const sizeKb = sizeBytes / 1024;
  if (sizeKb < 1024) {
    return `${sizeKb.toFixed(1)} KB`;
  }

  const sizeMb = sizeKb / 1024;
  return `${sizeMb.toFixed(1)} MB`;
};

const formatFromMimeType = (mimeType: string, filename: string) => {
  const byMime = mimeType.split('/')[1]?.toLowerCase();
  if (byMime === 'jpeg') return 'jpg';
  if (byMime === 'mpeg' && filename.toLowerCase().endsWith('.mp3')) return 'mp3';
  if (byMime) return byMime;

  const ext = filename.split('.').pop()?.toLowerCase();
  return ext || undefined;
};

const normalizeFormatFilterValue = (value: string): string => {
  if (value === 'jpeg') {
    return 'jpg';
  }

  if (value === 'svg+xml') {
    return 'svg';
  }

  if (value === 'msword') {
    return 'doc';
  }

  if (value === 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return 'docx';
  }

  if (value === 'vnd.ms-excel') {
    return 'xls';
  }

  if (value === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return 'xlsx';
  }

  if (value === 'x-zip-compressed') {
    return 'zip';
  }

  return value;
};

const DOCS_FORMAT_VALUES = new Set<string>(['pdf', 'zip', 'doc', 'docx', 'xls', 'xlsx']);

const usageToLink = (pageId?: string | null) => {
  if (!pageId) {
    return undefined;
  }

  return pageId.startsWith('/') ? pageId : `/${pageId}`;
};

const getUsageFilterValues = (usageLinks: FileUsageLink[]): string[] => {
  if (!usageLinks.length) {
    return ['unused'];
  }

  const categories = new Set<string>();

  usageLinks.forEach((usageLink) => {
    const normalizedLabel = normalizeSearch(usageLink.label);

    if (/новин|медіа|news|media/.test(normalizedLabel)) {
      categories.add('news_media');
      return;
    }

    if (/поді|event/.test(normalizedLabel)) {
      categories.add('events');
      return;
    }

    if (/творч|creative/.test(normalizedLabel)) {
      categories.add('creativity');
      return;
    }

    if (/файл|files/.test(normalizedLabel)) {
      categories.add('files');
      return;
    }

    if (/науков|scientific|research/.test(normalizedLabel)) {
      categories.add('research');
      return;
    }

    categories.add('main_pages');
  });

  return Array.from(categories);
};

export default function FilesPage() {
  const [view, setView] = useState<FilesCardsLayoutView>('grid');
  const [activeTab, setActiveTab] = useState<FilesTabValue>('all');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadModalInitial, setUploadModalInitial] = useState<MediaModalOpenState | undefined>(undefined);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formatFilters, setFormatFilters] = useState<string[]>([]);
  const [usageFilters, setUsageFilters] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState<FilesSortValue>(() => {
    if (globalThis.window === undefined) return 'date_desc';
    const saved = localStorage.getItem('files_sort');
    return (SORT_OPTIONS.some((o) => o.value === saved) ? saved : 'date_desc') as FilesSortValue;
  });
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState<HTMLElement | null>(null);
  const sortTriggerRef = useRef<HTMLDivElement | null>(null);
  const { data, loading, error, refetch } = useAllAssets();
  const [uploadBlob] = useUploadBlobMutation();

  const handleOpenUploadFlow = () => {
    setUploadModalInitial({ tab: 'UPLOAD' });
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadFlow = () => {
    setIsUploadModalOpen(false);
    setUploadModalInitial(undefined);
  };

  const handleUploadApply = async (result: MediaModalResult) => {
    if (result.selected.kind !== 'upload') {
      return;
    }

    const file = result.selected.file;
    const dataUrl = await readFileAsDataURL(file);
    const base64 = dataUrl.split(',')[1];

    if (!base64) {
      throw new Error('Не вдалося прочитати файл для завантаження.');
    }

    const uploadResult = await uploadBlob({
      variables: {
        folderName: 'tmp',
        blobName: file.name,
        buffer: base64,
        contentType: file.type || 'application/octet-stream'
      }
    });

    if (!uploadResult.data?.uploadBlob.success) {
      throw new Error('Не вдалося завантажити файл. Спробуйте ще раз.');
    }

    await refetch();
  };

  const allFiles = useMemo<FilesPageFileItem[]>(() => {
    return (data?.allAssets ?? []).map((asset) => ({
      id: asset.id,
      type: fileTypeMap[asset.type],
      name: asset.filename,
      dateAdded: formatDateAdded(asset.createdAt),
      createdAtRaw: asset.createdAt,
      isStarred: asset.isStarred,
      usageLinks: asset.usageRefs.length,
      imageSrc: asset.type === AssetType.Image ? asset.url : undefined,
      previewUrl: asset.type === AssetType.Image ? asset.url : undefined,
      format: formatFromMimeType(asset.mimeType, asset.filename),
      size: formatFileSize(asset.sizeBytes),
      addedBy: asset.createdBy ? { name: asset.createdBy } : undefined,
      usage: asset.usageRefs.map((usageRef, index) => ({
        id: `${asset.id}-${index}`,
        label: usageRef.pageId ?? 'Невідомий розділ',
        href: usageToLink(usageRef.pageId)
      })),
      description: asset.description ?? undefined
    }));
  }, [data?.allAssets]);

  const titleOptions = useMemo(() => {
    return Array.from(new Map(allFiles.map((file) => [file.id, { id: file.id, title: file.name }])).values());
  }, [allFiles]);

  const files = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    const filtered = allFiles.filter((file) => {
      const matchesSearch = !normalizedSearch || file.name.toLowerCase().includes(normalizedSearch);
      const normalizedFileFormat = normalizeFormatFilterValue(file.format?.toLowerCase() ?? '');
      const matchesFormat =
        !formatFilters.length ||
        formatFilters.some((formatFilter) => normalizeFormatFilterValue(formatFilter) === normalizedFileFormat);
      const fileUsageFilterValues = getUsageFilterValues(file.usage);
      const matchesUsage = !usageFilters.length || usageFilters.some((usageFilter) => fileUsageFilterValues.includes(usageFilter));

      return matchesSearch && matchesFormat && matchesUsage;
    });

    return [...filtered].sort((left, right) => {
      if (sortValue === 'name_asc') {
        return left.name.localeCompare(right.name, 'uk');
      }

      if (sortValue === 'name_desc') {
        return right.name.localeCompare(left.name, 'uk');
      }

      const leftDate = new Date(left.createdAtRaw ?? left.dateAdded).getTime();
      const rightDate = new Date(right.createdAtRaw ?? right.dateAdded).getTime();

      if (sortValue === 'date_asc') {
        return leftDate - rightDate;
      }

      return rightDate - leftDate;
    });
  }, [allFiles, formatFilters, search, sortValue, usageFilters]);

  const activeFiltersCount = formatFilters.length + usageFilters.length;
  const currentSortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];
  const currentSortField: SortFieldValue = sortValue.startsWith('date') ? 'date' : 'name';

  const handleToggleSortMenu = () => {
    setSortMenuAnchorEl((previous) => (previous ? null : sortTriggerRef.current));
  };

  const handleCloseSortMenu = () => {
    setSortMenuAnchorEl(null);
    requestAnimationFrame(() => sortTriggerRef.current?.focus());
  };

  const handleSortFieldChange = (field: SortFieldValue) => {
    if (field === 'date') {
      setSortValue((previous) => {
        const next = previous.startsWith('date') ? previous : 'date_desc';
        localStorage.setItem('files_sort', next);
        return next;
      });
      return;
    }

    setSortValue((previous) => {
      const next = previous.startsWith('name') ? previous : 'name_asc';
      localStorage.setItem('files_sort', next);
      return next;
    });
  };

  const clearFilters = () => {
    setFormatFilters([]);
    setUsageFilters([]);
  };

  const filteredFiles = useMemo(() => {
    if (activeTab === 'all') {
      return files;
    }

    if (activeTab === 'favorites') {
      return files.filter((file) => file.isStarred);
    }

    if (activeTab === 'docs') {
      return files.filter((file) => DOCS_FORMAT_VALUES.has(normalizeFormatFilterValue(file.format?.toLowerCase() ?? '')));
    }

    return files.filter((file) => file.type === activeTab);
  }, [activeTab, files]);

  useEffect(() => {
    if (!filteredFiles.length) {
      setSelectedFileId(null);
      setHasInitializedSelection(false);
      return;
    }

    if (!hasInitializedSelection) {
      setSelectedFileId(filteredFiles[0].id);
      setHasInitializedSelection(true);
      return;
    }

    if (selectedFileId && !filteredFiles.some((file) => file.id === selectedFileId)) {
      setSelectedFileId(filteredFiles[0].id);
    }
  }, [filteredFiles, hasInitializedSelection, selectedFileId]);

  const selectedFile = useMemo(
    () => filteredFiles.find((file) => file.id === selectedFileId) ?? null,
    [filteredFiles, selectedFileId]
  );

  const sidebarFile: FileDetailsSidebarFile | null = selectedFile
    ? {
      id: selectedFile.id,
      type: selectedFile.type,
      filename: selectedFile.name,
      previewUrl: selectedFile.previewUrl,
      addedBy: selectedFile.addedBy,
      addedAt: selectedFile.dateAdded,
      format: selectedFile.format,
      size: selectedFile.size,
      usageLinks: selectedFile.usage,
      description: selectedFile.description,
      isStarred: selectedFile.isStarred
    }
    : null;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        pt: '15px',
        pr: { xs: 0, md: sidebarFile ? `${SIDEBAR_WIDTH + 12}px` : 0 },
        transition: 'padding-right 0.2s ease'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <Typography variant="h4"
          sx={{
            fontSize: '32px',
            lineHeight: 1.5,
            fontFamily: 'Mulish, sans-serif'
          }}
        >
          Файли
        </Typography>

        <Button
          variant="contained"
          onClick={handleOpenUploadFlow}
          endIcon={<Image src="/icons/cloud-upload.svg" alt="upload icon" width={20} height={20} />}
          sx={{
            borderRadius: '20px',
            px: '24px',
            py: '8px',
            minHeight: '40px',
            textTransform: 'none',
            color: colors.black,
            boxShadow: 'none',
            fontSize: '16px',
            lineHeight: 1.5,
            bgcolor: colors.yellow[500],
            '&:hover': {
              bgcolor: colors.yellow[600],
              boxShadow: 'none'
            }
          }}
        >
          Завантажити файл
        </Button>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, value: FilesTabValue) => setActiveTab(value)}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          minHeight: '40px',
          borderBottom: `1px solid ${colors.blue[300]}`,
          '& .MuiTabs-indicator': {
            backgroundColor: colors.black,
            height: '2px'
          }
        }}
      >
        {FILE_TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            disabled={tab.disabled}
            disableRipple
            sx={{
              textTransform: 'none',
              minHeight: '40px',
              px: '28px',
              pt: '6px',
              pb: '14px',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: 1.5,
              minWidth: '80px',
              color: colors.blue[800],
              '&.Mui-selected': {
                color: colors.black,
                fontWeight: 600
              }
            }}
          />
        ))}
      </Tabs>

      <ControlPanel
        leftContent={
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <Search search={search} setSearch={setSearch} options={titleOptions} />
          </Box>
        }
        rightContent={
          <>
            <Badge
              badgeContent={activeFiltersCount}
              color="error"
              overlap="circular"
              invisible={activeFiltersCount === 0}
              sx={{
                '& .MuiBadge-badge': {
                  top: '4px',
                  fontSize: '14px',
                  minWidth: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: '#A32B0E',
                  transform: 'translate(18px, -50%)'
                }
              }}
            >
              <Button
                variant="outlined"
                startIcon={
                  <Image src="/icons/filter-dark.svg" alt="filters" width={18} height={18} />
                }
                onClick={() => setIsFiltersOpen((previous) => !previous)}
                sx={{
                  borderRadius: '28px',
                  px: '24px',
                  py: '6px',
                  minHeight: '40px',
                  textTransform: 'none',
                  borderColor: colors.black,
                  color: colors.black,
                  bgcolor: isFiltersOpen ? '#190D031A' : colors.white,
                  fontSize: '16px',
                  '&:hover': {
                    borderColor: colors.black,
                    bgcolor: isFiltersOpen ? '#190D031A' : colors.blue[50]
                  }
                }}
              >
                Фільтри
              </Button>
            </Badge>

            <ViewToggle value={view} onChange={setView} />
          </>
        }
        isBottomOpen={isFiltersOpen}
        bottomContent={
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Box
              sx={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <FilterSelect
                  label="Формат"
                  options={FORMAT_FILTER_OPTIONS}
                  defaultValues={formatFilters}
                  hideClearAction
                  menuMinWidth={116}
                  onAdd={(_, __, allSelected) => setFormatFilters(allSelected)}
                  onRemove={(_, __, allSelected) => setFormatFilters(allSelected)}
                />

                <FilterSelect
                  label="Використання"
                  options={USAGE_FILTER_OPTIONS}
                  defaultValues={usageFilters}
                  hideClearAction
                  menuMinWidth={190}
                  onAdd={(_, __, allSelected) => setUsageFilters(allSelected)}
                  onRemove={(_, __, allSelected) => setUsageFilters(allSelected)}
                />

                <Tooltip
                  title="Очистити всі фільтри"
                  placement="top"
                  arrow
                  slotProps={{
                    transition: {
                      timeout: 0
                    },
                    tooltip: {
                      sx: {
                        minWidth: '153px',
                        height: '28px',
                        px: '16px',
                        py: '4px',
                        borderRadius: '20px',
                        bgcolor: '#3F444A',
                        fontStyle: 'italic',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }
                    },
                    arrow: {
                      sx: {
                        color: '#3F444A'
                      }
                    }
                  }}
                >
                  <span>
                    {activeFiltersCount > 0 ? (
                      <IconButton
                        aria-label="clear-filters"
                        onClick={clearFilters}
                        sx={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          bgcolor: '#fff',
                          color: '#190D03',
                          '&:hover': {
                            bgcolor: '#fff'
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5,
                            color: '#190D03'
                          }
                        }}
                      >
                        <Image src="/icons/close.svg" alt="clear" width={22} height={22} />
                      </IconButton>
                    ) : null}
                  </span>
                </Tooltip>
              </Box>

              <>
                <Box
                  ref={sortTriggerRef}
                  onClick={handleToggleSortMenu}
                  role="button"
                  tabIndex={0}
                  aria-haspopup="dialog"
                  aria-expanded={Boolean(sortMenuAnchorEl)}
                  sx={{
                    ...filterSelectStyles.root('filled', false),
                    minWidth: '208px'
                  }}
                >
                  <Typography sx={filterSelectStyles.label(false)}>{currentSortOption.label}</Typography>
                  <Box sx={filterSelectStyles.dropdownIcon(false)}>
                    <Image
                      src="/icons/chevron-down-dark.svg"
                      alt="chevron-down"
                      width={12}
                      height={12}
                      style={{ transform: 'translateY(2px)' }}
                    />
                  </Box>
                </Box>

                <DropdownMenu
                  disableScrollLock
                  anchorEl={sortMenuAnchorEl}
                  open={Boolean(sortMenuAnchorEl)}
                  onClose={handleCloseSortMenu}
                  sx={{
                    '& .MuiPaper-root': {
                      minWidth: '208px'
                    }
                  }}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  menuList={
                    <Box sx={{ padding: '8px' }}>
                      <Typography
                        sx={{
                          color: '#4E5061',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          px: '12px',
                          py: '4px'
                        }}
                      >
                        Сортувати за
                      </Typography>

                      {SORT_FIELD_OPTIONS.map((option) => (
                        <FilterSelectItem
                          key={option.value}
                          label={option.label}
                          selected={currentSortField === option.value}
                          onClick={() => handleSortFieldChange(option.value)}
                          sx={filterSelectStyles.menuItem}
                        />
                      ))}

                      <Divider sx={{ my: 1 }} />

                      <Typography
                        sx={{
                          color: '#4E5061',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          px: '12px',
                          py: '4px'
                        }}
                      >
                        Порядок
                      </Typography>

                      {SORT_ORDER_OPTIONS[currentSortField].map((option) => (
                        <FilterSelectItem
                          key={option.value}
                          label={option.label}
                          selected={sortValue === option.value}
                          onClick={() => {
                            setSortValue(option.value);
                            localStorage.setItem('files_sort', option.value);
                            handleCloseSortMenu();
                          }}
                          sx={filterSelectStyles.menuItem}
                        />
                      ))}
                    </Box>
                  }
                />
              </>
            </Box>
          </Box>
        }
      />

      <FilesCardsLayout view={view} items={filteredFiles} onItemClick={(item) => setSelectedFileId(item.id)} />

      {loading && <Typography>Завантаження файлів…</Typography>}
      {error && <Typography color="error">Не вдалося завантажити файли.</Typography>}

      {sidebarFile && (
        <FileInfoSidebar
          file={sidebarFile}
          onClose={() => setSelectedFileId(null)}
        />
      )}

      <MediaModal
        open={isUploadModalOpen}
        initial={uploadModalInitial}
        onClose={handleCloseUploadFlow}
        onApply={handleUploadApply}
        renderers={{ upload: renderFilesUpload }}
      />
    </Box>
  );
}
