'use client';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  MenuItem,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ChevronDown, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { StatusWithDate } from './components/StatusWithDate';
import { useWorksFiltering } from './useWorksFiltering';
import { type OpusGroup, type UngroupedGroup, WORKS_MOCK_DATA, type WorkStatus } from './works.mock';
import {
  WORKS_BASE_PATH,
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
import PencilIcon from '~/public/icons/pencil.svg';
import DropdownMenu from '~/shared/components/dropdown-menu/DropdownMenu';
import { EmptyState } from '~/shared/components/empty-state';
import { FilteringToolbar, SortSelect } from '~/shared/components/filtering-toolbar';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { filterSelectStyles } from '~/shared/components/selector/FilterSelect.styles';
import { mainHexPalette as colors } from '~/shared/theme/colors';
import { normalizeSearch } from '~/utils/normalizeSearch';

type WorksPageContentProps = Readonly<{
  activeTab: WorksTabValue;
}>;

const TABLE_DIVIDER_COLOR = '#CDD4DE';
const HORIZONTAL_ROW_DIVIDER_COLOR = '#D9DCE866';
const NUMBER_COLUMN_WIDTH = '48px';
const GROUP_GENRE_COLUMN_WIDTH = '220px';
const GROUP_YEARS_COLUMN_WIDTH = '96px';
const STATUS_COLUMN_WIDTH = '310px';
const ACCORDION_ICON_OFFSET = '26px';
const ACTIONS_COLUMN_WIDTH = '88px';
const GROUP_ROW_COLUMNS = `1px ${NUMBER_COLUMN_WIDTH} minmax(220px, 1fr) ${GROUP_GENRE_COLUMN_WIDTH} ${GROUP_YEARS_COLUMN_WIDTH} ${STATUS_COLUMN_WIDTH} ${ACTIONS_COLUMN_WIDTH}`;
const TABLE_HEADER_COLUMNS = `1px calc(${NUMBER_COLUMN_WIDTH} + ${ACCORDION_ICON_OFFSET}) minmax(220px, 1fr) ${GROUP_GENRE_COLUMN_WIDTH} ${GROUP_YEARS_COLUMN_WIDTH} ${STATUS_COLUMN_WIDTH} ${ACTIONS_COLUMN_WIDTH}`;
const INDIVIDUAL_WORK_ROW_COLUMNS = `1px minmax(220px, 1fr) ${GROUP_GENRE_COLUMN_WIDTH} ${GROUP_YEARS_COLUMN_WIDTH} ${STATUS_COLUMN_WIDTH} ${ACTIONS_COLUMN_WIDTH}`;
const ROW_ACTIONS_CELL_SX = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end'
} as const;
const WORK_ROW_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: INDIVIDUAL_WORK_ROW_COLUMNS,
  alignItems: 'center',
  borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
  minWidth: 0
} as const;
const GROUPED_WORK_ROW_SX = {
  ...WORK_ROW_GRID_SX,
  columnGap: '8px',
  py: '8px',
  px: 0
} as const;
const INDIVIDUAL_WORK_ROW_SX = {
  ...WORK_ROW_GRID_SX,
  columnGap: '8px',
  py: '12px'
} as const;
const MARKER_COLUMN_SX = { width: '1px' } as const;
const GENRE_SPACER_SX = { width: GROUP_GENRE_COLUMN_WIDTH } as const;
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
const WORK_ROW_TITLE_SX = {
  fontSize: '14px',
  fontWeight: 500,
  minWidth: 0,
  flex: 1,
  ...SINGLE_LINE_ELLIPSIS
} as const;
const YEAR_TEXT_SX = {
  ...META_TEXT_SX,
  fontWeight: 500,
  width: GROUP_YEARS_COLUMN_WIDTH,
  textAlign: 'left'
} as const;
const OPUS_COLUMN_DIVIDER_SX = {
  borderRight: `1px solid ${TABLE_DIVIDER_COLOR}`,
  pr: '10px'
} as const;
const TABLE_HEADER_TEXT_SX = {
  fontSize: '16px',
  lineHeight: '22px',
  fontWeight: 700,
  color: '#63666E',
  fontStyle: 'normal',
  ...SINGLE_LINE_ELLIPSIS
} as const;
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
  startDate: string;
  endDate?: string;
  status: WorkStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
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
  const [rawStartDate, rawEndDate] = group.yearRange.split('-').map((part) => part.trim());
  const startDate = rawStartDate || group.updatedAt.slice(0, 4);
  const endDate = rawEndDate || undefined;

  return {
    id: group.id,
    numberLabel: 'opusNumber' in group ? group.opusNumber : group.boNumber,
    title: group.title,
    genre: group.genre,
    startDate,
    endDate,
    status: group.status,
    createdAt: group.createdAt ?? group.updatedAt,
    updatedAt: group.updatedAt,
    publishedAt: group.publishedAt,
    works: group.works
  };
}

function formatGroupYears(startDate: string, endDate?: string): string {
  if (!endDate || endDate === startDate) {
    return startDate;
  }

  return `${startDate} - ${endDate}`;
}

function getGroupEditHref(groupId: string): string {
  return `${WORKS_BASE_PATH}/group/${groupId}/edit`;
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

function useDropdownState() {
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

  const handleToggle = () => {
    setAnchorEl((previous) => (previous ? null : triggerRef.current));
  };

  return { anchorEl, triggerRef, handleOpen, handleClose, handleToggle };
}

function DropdownItemsList<T extends { id: string }>({
  items,
  renderItem
}: Readonly<{
  items: readonly T[];
  renderItem: (item: T) => React.ReactNode;
}>) {
  return <Box sx={MENU_LIST_SX}>{items.map((item) => renderItem(item))}</Box>;
}

function ContextMenu({
  items,
  triggerLabel
}: Readonly<{
  items: readonly ContextMenuItem[];
  triggerLabel: string;
}>) {
  const { anchorEl, triggerRef, handleOpen, handleClose } = useDropdownState();

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

function EditAction({ href, label }: Readonly<{ href: string; label: string }>) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.stopPropagation();
  };

  return (
    <Box
      sx={(theme) => ({
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: theme.spacing(-1.5),
        flexShrink: 0
      })}
    >
      <IconButton
        component={Link}
        href={href}
        onClick={handleClick}
        aria-label={label}
        sx={{
          color: colors.black,
          width: '32px',
          height: '32px',
          p: 0,
          borderRadius: '50%',
          '& svg': { width: '18px', height: '18px' },
          '&:hover': {
            bgcolor: alpha(colors.black, 0.08)
          }
        }}
      >
        <PencilIcon />
      </IconButton>
    </Box>
  );
}

function WorkRowCells({ title, year }: Readonly<{ title: string; year: string }>) {
  return (
    <>
      <Typography sx={WORK_ROW_TITLE_SX}>{title}</Typography>
      <Box sx={GENRE_SPACER_SX} />
      <Typography sx={YEAR_TEXT_SX}>{year}</Typography>
      <Box sx={{ width: STATUS_COLUMN_WIDTH }} />
      <Box sx={ROW_ACTIONS_CELL_SX}>
        <ContextMenu items={WORK_MENU_ITEMS} triggerLabel={`Дії твору ${title}`} />
      </Box>
    </>
  );
}

function WorksTableHeader() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: TABLE_HEADER_COLUMNS,
        columnGap: '8px',
        alignItems: 'center',
        px: 0,
        py: '8px',
        borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
        minWidth: 0
      }}
    >
      <Box sx={MARKER_COLUMN_SX} />
      <Typography sx={{ ...TABLE_HEADER_TEXT_SX, textAlign: 'left', justifySelf: 'start', width: '100%', pl: 0 }}>
        Опуси
      </Typography>
      <Typography sx={TABLE_HEADER_TEXT_SX}>Назва</Typography>
      <Typography sx={TABLE_HEADER_TEXT_SX}>Жанр</Typography>
      <Typography sx={TABLE_HEADER_TEXT_SX}>Роки</Typography>
      <Typography sx={TABLE_HEADER_TEXT_SX}>Статус</Typography>
      <Box sx={{ width: ACTIONS_COLUMN_WIDTH }} />
    </Box>
  );
}

// ── Opus accordion row ────────────────────────────────────────────────────────
function GroupedRow({
  group,
  defaultExpanded
}: Readonly<{
  group: GroupRowData;
  defaultExpanded?: boolean;
}>) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        border: 'none',
        borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
        mb: '4px',
        overflow: 'hidden',
        '&:before': { display: 'none' },
        '&.Mui-expanded': { mb: '4px' }
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronDown size={18} />}
        sx={{
          px: 0,
          minHeight: '56px',
          flexDirection: 'row-reverse',
          borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
          '& .MuiAccordionSummary-expandIconWrapper': {
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ml: '6px',
            mr: 0,
            flexShrink: 0
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
            columnGap: '8px',
            alignItems: 'center',
            minWidth: 0
          }}
        >
          <Box
            sx={{
              width: '1px',
              alignSelf: 'stretch',
              backgroundColor: 'transparent'
            }}
          />

          <Typography
            sx={{
              fontWeight: 600,
              fontStyle: 'italic',
              fontSize: '14px',
              color: 'text.secondary',
              width: NUMBER_COLUMN_WIDTH,
              ...OPUS_COLUMN_DIVIDER_SX,
              ...SINGLE_LINE_ELLIPSIS
            }}
          >
            {group.numberLabel}
          </Typography>

          <Typography sx={{ ...TITLE_TEXT_SX, fontWeight: 600 }}>
            {group.title}
          </Typography>

          <Typography sx={{ ...META_TEXT_SX, fontWeight: 600, width: GROUP_GENRE_COLUMN_WIDTH }}>
            {group.genre}
          </Typography>

          <Typography sx={{ ...META_TEXT_SX, fontWeight: 600, width: GROUP_YEARS_COLUMN_WIDTH, textAlign: 'left' }}>
            {formatGroupYears(group.startDate, group.endDate)}
          </Typography>

          <Box sx={{ width: STATUS_COLUMN_WIDTH, minWidth: 0 }}>
            <StatusWithDate
              status={group.status}
              createdAt={group.createdAt}
              updatedAt={group.updatedAt}
              publishedAt={group.publishedAt}
              dividerColor={TABLE_DIVIDER_COLOR}
            />
          </Box>

          <Box sx={ROW_ACTIONS_CELL_SX}>
            <EditAction
              href={getGroupEditHref(group.id)}
              label={`Редагувати групу ${group.title}`}
            />

            <ContextMenu items={GROUP_MENU_ITEMS} triggerLabel={`Дії групи ${group.title}`} />
          </Box>
        </Box>
      </AccordionSummary>

      {group.works.length > 0 && (
        <AccordionDetails sx={{ pl: 0, pr: 0, pt: 0, pb: 0 }}>
          {group.works.map((work, index) => (
            <Box
              key={work.id}
              sx={{
                ...GROUPED_WORK_ROW_SX,
                borderBottom: index === group.works.length - 1 ? 'none' : GROUPED_WORK_ROW_SX.borderBottom
              }}
            >
              <Box sx={MARKER_COLUMN_SX} />
              <WorkRowCells title={work.title} year={work.year} />
            </Box>
          ))}
        </AccordionDetails>
      )}
    </Accordion>
  );
}

// ── Individual work (ungrouped work without container) ──────────────────────
function IndividualWorkRow({ work }: Readonly<{ work: IndividualWorkData }>) {
  return (
    <Box sx={INDIVIDUAL_WORK_ROW_SX}>
      {/* Left marker column (empty for individual works) */}
      <Box sx={MARKER_COLUMN_SX} />

      <Typography sx={WORK_ROW_TITLE_SX}>{work.title}</Typography>

      <Box sx={GENRE_SPACER_SX} />

      <Typography
        sx={{
          ...META_TEXT_SX,
          width: GROUP_YEARS_COLUMN_WIDTH,
          textAlign: 'left'
        }}
      >
        {work.year}
      </Typography>

      <Box sx={{ width: STATUS_COLUMN_WIDTH }} />

      <Box sx={ROW_ACTIONS_CELL_SX}>
        <ContextMenu items={WORK_MENU_ITEMS} triggerLabel={`Дії твору ${work.title}`} />
      </Box>
    </Box>
  );
}

function GroupRowsList({ groups }: Readonly<{ groups: readonly (OpusGroup | UngroupedGroup)[] }>) {
  return (
    <>
      {groups.map((group) => (
        <GroupedRow
          key={group.id}
          group={toGroupRowData(group)}
          defaultExpanded
        />
      ))}
    </>
  );
}

// ── Create button (same pattern as PublicationsCreateAction) ──────────────────
function WorksCreateAction() {
  const { anchorEl, triggerRef, handleClose, handleToggle } = useDropdownState();

  const handleToggleMenu = handleToggle;
  const handleCloseMenu = handleClose;

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
      language: group.language
    }))
  );

  const visibleUngroupedWorks = sortGroups(
    allUngroupedWorks.filter(
      (work) =>
        matchesSelectedFilters(work) &&
        (matchesSearch(work.title) || matchesSearch(work.genre))
    ),
    sortValue
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
      <Box sx={{ pt: '12px' }}>
        <WorksTableHeader />

        {showOpus && <GroupRowsList groups={visibleOpusGroups} />}

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
