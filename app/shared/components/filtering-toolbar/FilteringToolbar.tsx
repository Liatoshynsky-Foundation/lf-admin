'use client';

import {
  Badge,
  Box,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { ControlPanel } from '~/shared/components/control-panel';
import { colors } from '~/shared/components/design-system/button/Button.styles';
import { Search, type SearchProps } from '~/shared/components/search/Search';
import { type FilterOption,FilterSelect } from '~/shared/components/selector/FilterSelect';

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
  const hasBottomContent = filters.length > 0 || Boolean(bottomTrailingContent);
  const hasRightSlot = rightSlot !== undefined && rightSlot !== null;
  const hasFilterToggle = hasBottomContent && Boolean(onToggleFilters);
  const hasRightContent = hasFilterToggle || hasRightSlot;

  return (
    <ControlPanel
      dataTestId={dataTestId}
      leftContent={
        search ? (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <Search {...search} />
          </Box>
        ) : undefined
      }
      rightContent={
        hasRightContent ? (
          <>
            {hasFilterToggle ? (
              <Badge
                badgeContent={resolvedActiveFiltersCount}
                color="error"
                overlap="circular"
                invisible={resolvedActiveFiltersCount === 0}
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
                  startIcon={<Image src="/icons/filter-dark.svg" alt="filters" width={18} height={18} />}
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
            ) : null}

            {rightSlot}
          </>
        ) : undefined
      }
      isBottomOpen={hasBottomContent && isFiltersOpen}
      bottomContent={
        hasBottomContent ? (
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

                {onClearFilters ? (
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
                          <Image src="/icons/close.svg" alt="clear" width={22} height={22} />
                        </IconButton>
                      ) : null}
                    </span>
                  </Tooltip>
                ) : null}
              </Box>

              {bottomTrailingContent}
            </Box>
          </Box>
        ) : undefined
      }
    />
  );
}