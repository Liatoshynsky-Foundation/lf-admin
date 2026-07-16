'use client';

import { Badge, Box, Button, IconButton, Tooltip } from '@mui/material';
import { Filter, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { styles } from './FilteringToolbar.styles';
import { ControlPanel } from '~/shared/components/control-panel';
import { Search, type SearchProps } from '~/shared/components/search/Search';
import { FilterOption, FilterSelect } from '~/shared/components/selector/FilterSelect';

export type FilteringToolbarFilterConfig = Readonly<{
  id: string;
  label: string;
  options: readonly FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
  variant?: 'filled' | 'outlined';
  disabled?: boolean;
  maxSelections?: number;
  hideCounterChip?: boolean;
  hideClearAction?: boolean;
  menuMinWidth?: number;
  clearLabel?: string;
}>;

export type FilteringToolbarProps = Readonly<{
  search?: SearchProps;
  filters?: readonly FilteringToolbarFilterConfig[];
  isFiltersOpen?: boolean;
  onToggleFilters?: () => void;
  activeFiltersCount?: number;
  onClearFilters?: () => void;
  clearFiltersTooltip?: string;
  filtersButtonLabel?: string;
  rightSlot?: ReactNode;
  bottomTrailingContent?: ReactNode;
  dataTestId?: string;
}>;

type FilterToggleButtonProps = Readonly<{
  resolvedActiveFiltersCount: number;
  filtersButtonLabel: string;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
}>;

type FilteringToolbarRightContentProps = Readonly<{
  hasFilterToggle: boolean;
  resolvedActiveFiltersCount: number;
  filtersButtonLabel: string;
  isFiltersOpen: boolean;
  onToggleFilters?: () => void;
  rightSlot?: ReactNode;
}>;

type ClearFiltersButtonProps = Readonly<{
  clearFiltersTooltip: string;
  onClearFilters?: () => void;
  resolvedActiveFiltersCount: number;
}>;

type FilteringToolbarBottomContentProps = Readonly<{
  bottomTrailingContent?: ReactNode;
  clearFiltersTooltip: string;
  filters: readonly FilteringToolbarFilterConfig[];
  onClearFilters?: () => void;
  resolvedActiveFiltersCount: number;
}>;

function renderSearchContent(search?: SearchProps): ReactNode | undefined {
  if (!search) {
    return undefined;
  }

  return (
    <Box sx={styles.searchContainer}>
      <Search {...search} />
    </Box>
  );
}

function renderFilterToggleButton({
  resolvedActiveFiltersCount,
  filtersButtonLabel,
  isFiltersOpen,
  onToggleFilters
}: FilterToggleButtonProps) {
  return (
    <Badge
      badgeContent={resolvedActiveFiltersCount}
      color="error"
      overlap="circular"
      invisible={resolvedActiveFiltersCount === 0}
      sx={styles.badge}
    >
      <Button
        variant="outlined"
        startIcon={<Filter size={18} strokeWidth={1.75} />}
        onClick={onToggleFilters}
        sx={styles.filterButton(isFiltersOpen)}
      >
        {filtersButtonLabel}
      </Button>
    </Badge>
  );
}

function renderRightContent({
  hasFilterToggle,
  resolvedActiveFiltersCount,
  filtersButtonLabel,
  isFiltersOpen,
  onToggleFilters,
  rightSlot
}: FilteringToolbarRightContentProps): ReactNode | undefined {
  const hasRightSlot = rightSlot !== undefined && rightSlot !== null;

  if (!hasFilterToggle && !hasRightSlot) {
    return undefined;
  }

  if (!hasFilterToggle || !onToggleFilters) {
    return <>{rightSlot}</>;
  }

  return (
    <>
      {renderFilterToggleButton({
        resolvedActiveFiltersCount,
        filtersButtonLabel,
        isFiltersOpen,
        onToggleFilters
      })}
      {rightSlot}
    </>
  );
}

function renderClearFiltersButton({
  clearFiltersTooltip,
  onClearFilters,
  resolvedActiveFiltersCount
}: ClearFiltersButtonProps) {
  if (!onClearFilters) {
    return null;
  }

  return (
    <Tooltip
      title={clearFiltersTooltip}
      placement="top"
      arrow
      slotProps={{
        transition: {
          timeout: 0
        },
        tooltip: { sx: styles.tooltip },
        arrow: { sx: styles.tooltipArrow }
      }}
    >
      <span>
        {resolvedActiveFiltersCount > 0 ? (
          <IconButton aria-label="clear-filters" onClick={onClearFilters} sx={styles.clearButton}>
            <X size={22} strokeWidth={1.75} />
          </IconButton>
        ) : null}
      </span>
    </Tooltip>
  );
}

function renderBottomContent({
  bottomTrailingContent,
  clearFiltersTooltip,
  filters,
  onClearFilters,
  resolvedActiveFiltersCount
}: FilteringToolbarBottomContentProps): ReactNode | undefined {
  const hasBottomContent = filters.length > 0 || Boolean(bottomTrailingContent);

  if (!hasBottomContent) {
    return undefined;
  }

  return (
    <Box sx={styles.bottomContentWrapper}>
      <Box sx={styles.bottomContentRow}>
        <Box sx={styles.filtersList}>
          {filters.map((filter) => (
            <FilterSelect
              key={filter.id}
              label={filter.label}
              options={filter.options}
              value={filter.value}
              onChange={filter.onChange}
              variant={filter.variant}
              disabled={filter.disabled}
              maxSelections={filter.maxSelections}
              hideCounterChip={filter.hideCounterChip}
              hideClearAction={filter.hideClearAction}
              menuMinWidth={filter.menuMinWidth}
              clearLabel={filter.clearLabel}
            />
          ))}

          {renderClearFiltersButton({
            clearFiltersTooltip,
            onClearFilters,
            resolvedActiveFiltersCount
          })}
        </Box>

        {bottomTrailingContent}
      </Box>
    </Box>
  );
}

export function FilteringToolbar({
  search,
  filters = [],
  isFiltersOpen = false,
  onToggleFilters,
  activeFiltersCount,
  onClearFilters,
  clearFiltersTooltip = 'Очистити всі фільтри',
  filtersButtonLabel = 'Фільтри',
  rightSlot,
  bottomTrailingContent,
  dataTestId = 'FilteringToolbar'
}: FilteringToolbarProps) {
  const resolvedActiveFiltersCount =
    activeFiltersCount ?? filters.reduce((count, filter) => count + filter.value.length, 0);
  const bottomContent = renderBottomContent({
    bottomTrailingContent,
    clearFiltersTooltip,
    filters,
    onClearFilters,
    resolvedActiveFiltersCount
  });
  const hasBottomContent = bottomContent !== undefined;
  const hasFilterToggle = hasBottomContent && Boolean(onToggleFilters);

  return (
    <ControlPanel
      dataTestId={dataTestId}
      leftContent={renderSearchContent(search)}
      rightContent={renderRightContent({
        hasFilterToggle,
        resolvedActiveFiltersCount,
        filtersButtonLabel,
        isFiltersOpen,
        onToggleFilters,
        rightSlot
      })}
      isBottomOpen={hasBottomContent && isFiltersOpen}
      bottomContent={bottomContent}
    />
  );
}
