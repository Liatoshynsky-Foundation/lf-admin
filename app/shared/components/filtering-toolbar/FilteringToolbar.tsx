'use client';

import { Badge, Box, Button, IconButton, Tooltip } from '@mui/material';
import { Filter, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { ControlPanel } from '~/shared/components/control-panel';
import { Search, type SearchProps } from '~/shared/components/search/Search';
import { type FilterOption, FilterSelect } from '~/shared/components/selector/FilterSelect';
import { mainHexPallete as colors } from '~/shared/theme/colors';

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
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
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
      sx={{
        '& .MuiBadge-badge:not(.MuiBadge-invisible)': {
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
        startIcon={<Filter size={18} strokeWidth={1.75} />}
        onClick={onToggleFilters}
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
        {resolvedActiveFiltersCount > 0 ? (
          <IconButton
            aria-label="clear-filters"
            onClick={onClearFilters}
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
