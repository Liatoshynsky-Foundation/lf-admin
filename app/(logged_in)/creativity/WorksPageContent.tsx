'use client';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Typography
} from '@mui/material';
import { ChevronDown, CircleCheckBig, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { useWorksFiltering } from './useWorksFiltering';
import { type OpusGroup, type UngroupedGroup, WORKS_MOCK_DATA, type WorkStatus } from './works.mock';
import {
  WORKS_CREATE_OPTIONS,
  WORKS_EMPTY_STATE_DESCRIPTION,
  WORKS_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  WORKS_EMPTY_STATE_NO_RESULTS_TITLE,
  WORKS_EMPTY_STATE_TITLE,
  WORKS_PAGE_TITLE,
  WORKS_STATUSES,
  WORKS_TABS,
  type WorksStatusValue,
  type WorksTabValue
} from '~/constants/creativity';
import type { FilesSortValue } from '~/constants/sort';
import { formatDate } from '~/lib/utils/formatDate';
import { getStatus } from '~/lib/utils/getStatus';
import contentCardStyles from '~/shared/components/content-card/ContentCard.styles';
import contentCardBadgeStyles from '~/shared/components/content-card/ContentCardBadge.styles';
import { colors } from '~/shared/components/design-system/button/Button.styles';
import DropdownMenu from '~/shared/components/dropdown-menu/DropdownMenu';
import { EmptyState } from '~/shared/components/empty-state';
import { FilteringToolbar, SortSelect } from '~/shared/components/filtering-toolbar';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { filterSelectStyles } from '~/shared/components/selector/FilterSelect.styles';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { normalizeSearch } from '~/utils/normalizeSearch';

type WorksPageContentProps = Readonly<{
  activeTab: WorksTabValue;
}>;

const OPUS_HIGHLIGHT_NUMBERS = new Set(['op. 1', 'op. 2', 'op. 3']);
const TABLE_DIVIDER_COLOR = '#D9DCE866';
const NUMBER_COLUMN_WIDTH = '56px';
const GROUP_META_COLUMN_WIDTH = '320px';
const YEAR_COLUMN_WIDTH = '96px';
const STATUS_COLUMN_WIDTH = '280px';
const GROUP_ROW_COLUMNS = `1px ${NUMBER_COLUMN_WIDTH} minmax(260px, 1fr) ${GROUP_META_COLUMN_WIDTH} ${STATUS_COLUMN_WIDTH} 40px`;
const INDIVIDUAL_WORK_ROW_COLUMNS = `1px 1fr ${YEAR_COLUMN_WIDTH} 40px`;
const SINGLE_LINE_ELLIPSIS = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
} as const;
const META_TEXT_SX = {
  color: 'text.secondary',
  fontSize: '14px',
  minWidth: 0,
  ...SINGLE_LINE_ELLIPSIS
} as const;
const TITLE_TEXT_SX = { fontSize: '15px', minWidth: 0, ...SINGLE_LINE_ELLIPSIS } as const;
const WORK_ROW_TITLE_SX = { fontSize: '14px', minWidth: 0, flex: 1, ...SINGLE_LINE_ELLIPSIS } as const;
const YEAR_TEXT_SX = { ...META_TEXT_SX, width: YEAR_COLUMN_WIDTH, textAlign: 'right' } as const;
const MENU_LIST_SX = { px: '8px', py: '4px' } as const;
const MENU_ITEM_BASE_SX = {
  ...filterSelectStyles.menuItem,
  minHeight: 'auto',
  px: '12px',
  py: '8px',
  borderRadius: '8px'
} as const;

type GroupRowData = Readonly<{
  id: string;
  numberLabel: string;
  title: string;
  genre: string;
  yearRange: string;
  status: WorkStatus;
  updatedAt: string;
  works: ReadonlyArray<{ id: string; title: string; year: string }>;
}>;

type GroupFilterData = Readonly<{
  title: string;
  genre: string;
  language: 'uk' | 'en' | 'bilingual';
  status: WorkStatus;
  updatedAt: string;
  works: ReadonlyArray<{ title: string }>;
}>;

type FilterableItemData = Readonly<{
  title: string;
  genre: string;
  language: 'uk' | 'en' | 'bilingual';
  status: WorkStatus;
  updatedAt: string;
}>;

function isWorksStatusValue(status: WorkStatus): status is WorksStatusValue {
  return WORKS_STATUSES.includes(status as WorksStatusValue);
}

type IndividualWorkData = Readonly<{
  id: string;
  title: string;
  year: string;
  genre: string;
  status: WorkStatus;
  updatedAt: string;
  language: 'uk' | 'en' | 'bilingual';
}>;

function toGroupRowData(group: OpusGroup | UngroupedGroup): GroupRowData {
  return {
    id: group.id,
    numberLabel: 'opusNumber' in group ? group.opusNumber : group.boNumber,
    title: group.title,
    genre: group.genre,
    yearRange: group.yearRange,
    status: group.status,
    updatedAt: group.updatedAt,
    works: group.works
  };
}

function sortGroups<T extends { title: string; updatedAt: string }>(
  groups: readonly T[],
  sortValue: FilesSortValue
): T[] {
  return [...groups].sort((left, right) => {
    if (sortValue === 'date_desc') {
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    }

    if (sortValue === 'date_asc') {
      return new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime();
    }

    if (sortValue === 'name_asc') {
      return left.title.localeCompare(right.title, 'uk', { sensitivity: 'base' });
    }

    return right.title.localeCompare(left.title, 'uk', { sensitivity: 'base' });
  });
}

// ── Status chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  if (status === BaseContentStatuses.Published) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#2E7D32',
          fontSize: '14px',
          whiteSpace: 'nowrap'
        }}
      >
        <CircleCheckBig size={16} />
      </Box>
    );
  }

  const isDraft = status === BaseContentStatuses.Draft;
  return (
    <Chip
      label={isDraft ? 'Чернетка' : 'Редагується'}
      size="small"
      sx={{
        backgroundColor: contentCardBadgeStyles.draftBadge.backgroundColor,
        color: '#190D03',
        fontWeight: contentCardBadgeStyles.draftBadge.fontWeight,
        fontSize: contentCardBadgeStyles.draftBadge.fontSize,
        height: '24px',
        '& .MuiChip-label': {
          color: '#190D03'
        }
      }}
    />
  );
}

// ── Status label (for opus row, shows date aside status badge) ────────────────
function StatusWithDate({ status, date }: { status: string; date: string }) {
  const normalizedStatus =
    status === BaseContentStatuses.Editing ? BaseContentStatuses.Published : status;
  const statusText =
    getStatus(normalizedStatus, date, date, date) || `Редаговано ${formatDate(date)}`;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        ...SINGLE_LINE_ELLIPSIS,
        pl: '10px',
        borderLeft: `1px solid ${TABLE_DIVIDER_COLOR}`,
        minWidth: 0
      }}
    >
      <StatusChip status={status} />
      <Typography
        variant="body2"
        sx={{ ...contentCardStyles.date, fontSize: '14px', minWidth: 0, ...SINGLE_LINE_ELLIPSIS }}
      >
        {statusText}
      </Typography>
    </Box>
  );
}

// ── Opus context menu ─────────────────────────────────────────────────────────
const GROUP_MENU_ITEMS = [
  { id: 'edit', label: 'Редагувати' },
  { id: 'publish', label: 'Опублікувати' },
  { id: 'unpublish', label: 'Зняти з публікації' },
  { id: 'ungroup', label: 'Розгрупувати' },
  { id: 'seo', label: 'SEO налаштування' },
  { id: 'share', label: 'Поширити' },
  { id: 'delete', label: 'Видалити', danger: true }
] as const;

// ── Ungrouped work context menu ───────────────────────────────────────────────
const WORK_MENU_ITEMS = [
  { id: 'upload_audio', label: 'Завантажити аудіо' },
  { id: 'upload_pdf', label: 'Завантажити PDF' },
  { id: 'seo', label: 'SEO налаштування' },
  { id: 'share', label: 'Поширити' },
  { id: 'delete', label: 'Видалити', danger: true }
] as const;

type ContextMenuItem = { id: string; label: string; danger?: boolean };

function DropdownItemsList({
  items,
  renderItem
}: {
  items: readonly ContextMenuItem[];
  renderItem: (item: ContextMenuItem) => React.ReactNode;
}) {
  return <Box sx={MENU_LIST_SX}>{items.map((item) => renderItem(item))}</Box>;
}

function ContextMenu({
  items,
  triggerLabel
}: {
  items: readonly ContextMenuItem[];
  triggerLabel: string;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <Box
        sx={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <IconButton
          component="span"
          ref={triggerRef}
          onClick={handleOpen}
          aria-label={triggerLabel}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchorEl)}
          sx={{
            color: '#190D03',
            width: '32px',
            height: '32px',
            p: 0,
            borderRadius: '50%',
            '&:hover': {
              bgcolor: 'rgba(25,13,3,0.08)'
            }
          }}
        >
          <MoreVertical size={22} color="#190D03" />
        </IconButton>
      </Box>

      <DropdownMenu
        disableScrollLock
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{ '& .MuiPaper-root': { width: '200px' } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        menuList={
          <DropdownItemsList
            items={items}
            renderItem={(item) => (
              <MenuItem
                key={item.id}
                onClick={handleClose}
                sx={{
                  ...MENU_ITEM_BASE_SX,
                  color: item.danger ? 'error.main' : colors.black,
                  '&:hover': {
                    bgcolor: item.danger ? 'rgba(211,47,47,0.04)' : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                {item.label}
              </MenuItem>
            )}
          />
        }
      />
    </>
  );
}

function WorkRowCells({
  title,
  year,
  menuItems
}: {
  title: string;
  year: string;
  menuItems: readonly ContextMenuItem[];
}) {
  return (
    <>
      <Typography sx={WORK_ROW_TITLE_SX}>{title}</Typography>
      <Typography sx={YEAR_TEXT_SX}>{year}</Typography>
      <ContextMenu items={menuItems} triggerLabel={`Дії твору ${title}`} />
    </>
  );
}

// ── Opus accordion row ────────────────────────────────────────────────────────
function GroupedRow({
  group,
  defaultExpanded,
  groupMenuItems,
  workMenuItems,
  withLeftMarker
}: {
  group: GroupRowData;
  defaultExpanded?: boolean;
  groupMenuItems: readonly ContextMenuItem[];
  workMenuItems: readonly ContextMenuItem[];
  withLeftMarker?: boolean;
}) {
  const shouldShowOpusMarker = Boolean(withLeftMarker);

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        borderBottom: `1px solid ${TABLE_DIVIDER_COLOR}`,
        borderRadius: 0,
        mb: '4px',
        overflow: 'hidden',
        '&:before': { display: 'none' },
        '&.Mui-expanded': { mb: '4px' }
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronDown size={18} />}
        sx={{
          px: '16px',
          minHeight: '56px',
          flexDirection: 'row-reverse',
          '& .MuiAccordionSummary-expandIconWrapper': {
            mr: '12px',
            ml: 0
          },
          '& .MuiAccordionSummary-content': {
            display: 'block',
            my: '12px',
            minWidth: 0,
            width: '100%'
          }
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: GROUP_ROW_COLUMNS,
            columnGap: '12px',
            alignItems: 'center',
            minWidth: 0
          }}
        >
          <Box
            sx={{
              width: '1px',
              alignSelf: 'stretch',
              backgroundColor: shouldShowOpusMarker ? TABLE_DIVIDER_COLOR : 'transparent'
            }}
          />

          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '14px',
              color: 'text.secondary',
              width: NUMBER_COLUMN_WIDTH,
              ...SINGLE_LINE_ELLIPSIS
            }}
          >
            {group.numberLabel}
          </Typography>

          <Typography sx={{ ...TITLE_TEXT_SX, fontWeight: 600 }}>{group.title}</Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '8px',
              width: GROUP_META_COLUMN_WIDTH,
              minWidth: 0
            }}
          >
            <Typography sx={META_TEXT_SX}>{group.genre}</Typography>
            <Typography sx={META_TEXT_SX}>{group.yearRange}</Typography>
          </Box>

          <Box sx={{ width: STATUS_COLUMN_WIDTH, minWidth: 0 }}>
            <StatusWithDate status={group.status} date={group.updatedAt} />
          </Box>

          <ContextMenu items={groupMenuItems} triggerLabel={`Дії групи ${group.title}`} />
        </Box>
      </AccordionSummary>

      {group.works.length > 0 && (
        <AccordionDetails sx={{ px: '16px', pt: 0, pb: 0 }}>
          {group.works.map((work, index) => (
            <Box
              key={work.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                py: '8px',
                pl: '81px',
                borderBottom:
                  index === group.works.length - 1 ? 'none' : `1px solid ${TABLE_DIVIDER_COLOR}`,
                minWidth: 0
              }}
            >
              <WorkRowCells title={work.title} year={work.year} menuItems={workMenuItems} />
            </Box>
          ))}
        </AccordionDetails>
      )}
    </Accordion>
  );
}

// ── Individual work (ungrouped work without container) ──────────────────────
function IndividualWorkRow({ work }: { work: IndividualWorkData }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: INDIVIDUAL_WORK_ROW_COLUMNS,
        columnGap: '12px',
        alignItems: 'center',
        px: '16px',
        py: '12px',
        borderBottom: `1px solid ${TABLE_DIVIDER_COLOR}`,
        minWidth: 0
      }}
    >
      {/* Left marker column (empty for individual works) */}
      <Box sx={{ width: '1px' }} />

      <WorkRowCells title={work.title} year={work.year} menuItems={WORK_MENU_ITEMS} />
    </Box>
  );
}

function GroupRowsList({ groups, withLeftMarker }: { groups: readonly (OpusGroup | UngroupedGroup)[]; withLeftMarker?: boolean }) {
  return (
    <>
      {groups.map((group) => (
        <GroupedRow
          key={group.id}
          group={toGroupRowData(group)}
          defaultExpanded
          groupMenuItems={GROUP_MENU_ITEMS}
          workMenuItems={WORK_MENU_ITEMS}
          withLeftMarker={
            withLeftMarker && 'opusNumber' in group
              ? OPUS_HIGHLIGHT_NUMBERS.has(group.opusNumber.toLowerCase())
              : undefined
          }
        />
      ))}
    </>
  );
}

// ── Create button (same pattern as PublicationsCreateAction) ──────────────────
function WorksCreateAction() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleToggleMenu = () => {
    setAnchorEl((previous) => (previous ? null : triggerRef.current));
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <Button
        ref={triggerRef}
        variant="contained"
        onClick={handleToggleMenu}
        endIcon={<ChevronDown size={18} aria-hidden="true" />}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
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
        Створити
      </Button>

      <DropdownMenu
        disableScrollLock
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        sx={{ '& .MuiPaper-root': { width: '170px' } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        menuList={
          <DropdownItemsList
            items={WORKS_CREATE_OPTIONS}
            renderItem={(option) => (
              <MenuItem
                key={option.id}
                component={Link}
                href={option.href}
                onClick={handleCloseMenu}
                sx={{
                  ...MENU_ITEM_BASE_SX,
                  color: colors.black,
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                  '&.Mui-focusVisible': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                {option.label}
              </MenuItem>
            )}
          />
        }
      />
    </>
  );
}

// ── Main page content ─────────────────────────────────────────────────────────
export function WorksPageContent({ activeTab }: WorksPageContentProps) {
  const { sortValue, selectedFilters, toolbarProps, sortProps } = useWorksFiltering();

  const searchValue = (toolbarProps.search?.search ?? '').trim().toLowerCase();
  const normalizedSearch = normalizeSearch(searchValue);

  const matchesSearch = (text: string) =>
    !normalizedSearch || normalizeSearch(text.toLowerCase()).includes(normalizedSearch);

  const matchesSelectedFilters = (item: FilterableItemData) => {
    const statusMatches =
      isWorksStatusValue(item.status) &&
      (selectedFilters.status.length === 0 || selectedFilters.status.includes(item.status));
    const languageMatches =
      selectedFilters.language.length === 0 || selectedFilters.language.includes(item.language);
    const genreMatches = selectedFilters.genre.length === 0 || selectedFilters.genre.includes(item.genre);

    return statusMatches && languageMatches && genreMatches;
  };

  const getVisibleGroups = <T extends GroupFilterData>(
    groups: readonly T[],
    numberSelector: (group: T) => string
  ) =>
      sortGroups(
        groups.filter(
          (group) =>
            matchesSelectedFilters(group) &&
          (matchesSearch(group.title) ||
            matchesSearch(numberSelector(group)) ||
            matchesSearch(group.genre) ||
            group.works.some((work) => matchesSearch(work.title)))
        ),
        sortValue
      );

  const visibleOpusGroups = getVisibleGroups(WORKS_MOCK_DATA.opusGroups, (group) => group.opusNumber);

  const visibleUngroupedGroups = getVisibleGroups(
    WORKS_MOCK_DATA.ungroupedGroups,
    (group) => group.boNumber
  );

  // Extract all individual ungrouped works (when 'works' tab is active)
  const allUngroupedWorks = WORKS_MOCK_DATA.ungroupedGroups.flatMap((group) =>
    group.works.map((work) => ({
      id: work.id,
      title: work.title,
      year: work.year,
      genre: group.genre,
      status: group.status,
      updatedAt: group.updatedAt,
      language: group.language as 'uk' | 'en' | 'bilingual'
    }))
  );

  const visibleUngroupedWorks = allUngroupedWorks.filter(
    (work) =>
      matchesSelectedFilters(work) &&
      (matchesSearch(work.title) || matchesSearch(work.genre))
  );

  const hasActiveCriteria = Boolean(searchValue) || Boolean(toolbarProps.activeFiltersCount);

  const content = (() => {
    const showOpus = activeTab === 'all' || activeTab === 'opus';
    const showUngrouped = activeTab === 'all' || activeTab === 'ungrouped';
    const showIndividualWorks = activeTab === 'all' || activeTab === 'works';

    const hasOpus = showOpus && visibleOpusGroups.length > 0;
    const hasUngrouped = showUngrouped && visibleUngroupedGroups.length > 0;
    const hasIndividualWorks = showIndividualWorks && visibleUngroupedWorks.length > 0;

    if (!hasOpus && !hasUngrouped && !hasIndividualWorks) {
      return (
        <EmptyState
          title={hasActiveCriteria ? WORKS_EMPTY_STATE_NO_RESULTS_TITLE : WORKS_EMPTY_STATE_TITLE}
          description={
            hasActiveCriteria ? WORKS_EMPTY_STATE_NO_RESULTS_DESCRIPTION : WORKS_EMPTY_STATE_DESCRIPTION
          }
        />
      );
    }

    return (
      <Box>
        {showOpus && <GroupRowsList groups={visibleOpusGroups} withLeftMarker />}

        {showUngrouped && <GroupRowsList groups={visibleUngroupedGroups} />}

        {showIndividualWorks && visibleUngroupedWorks.map((work) => (
          <IndividualWorkRow key={work.id} work={work} />
        ))}
      </Box>
    );
  })();

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      <PageHeader
        title={WORKS_PAGE_TITLE}
        activeTab={activeTab}
        tabs={WORKS_TABS}
        action={<WorksCreateAction />}
      />

      <FilteringToolbar
        {...toolbarProps}
        dataTestId="works-control-panel"
        bottomTrailingContent={
          <SortSelect
            {...sortProps}
            minWidth={208}
            dataTestId="works-sort-select"
          />
        }
      />

      {content}
    </Box>
  );
}
