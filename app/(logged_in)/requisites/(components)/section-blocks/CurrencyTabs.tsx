'use client';

import { Box } from '@mui/material';
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';

import { styles } from './CurrencyTabs.styles';
import { type RequisiteItem, REQUISITES_MESSAGES } from '~/constants/requisites';
import Button from '~/ds-components/button/Button';
import ActionMenu, { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';

interface CurrencyTabsProps {
  items: RequisiteItem[];
  activeId: string;
  editingId: string | null;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onUpdateCurrency: (id: string, currency: string) => void;
  onDeleteTab: (id: string) => void;
  setEditingId: (id: string | null) => void;
}

export const CurrencyTabs: React.FC<CurrencyTabsProps> = ({
  items,
  activeId,
  editingId,
  onSelectTab,
  onAddTab,
  onUpdateCurrency,
  onDeleteTab,
  setEditingId
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTargetId, setMenuTargetId] = useState<null | string>(null);
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isEscapedRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({
    left: 0,
    width: 0,
    opacity: 0
  });

  const updateIndicator = useCallback(() => {
    const currentTab = tabRefs.current[activeId];
    const container = containerRef.current;
    if (!currentTab || !container) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const tabRect = currentTab.getBoundingClientRect();
    const left = tabRect.left - containerRect.left;
    const width = tabRect.width;

    setIndicatorStyle({ left, width, opacity: 1 });
  }, [activeId]);

  useLayoutEffect(() => {
    updateIndicator();

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const resizeObserver = new ResizeObserver(() => {
      updateIndicator();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateIndicator, items, editingId, editingValue]);

  useEffect(() => {
    if (editingId) {
      const activeItem = items.find((item) => item.id === editingId);
      setEditingValue(activeItem ? activeItem.currency : '');
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [editingId, items]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuTargetId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuTargetId(null);
  };

  const handleStartRename = () => {
    if (menuTargetId) {
      const targetItem = items.find((item) => item.id === menuTargetId);
      setEditingValue(targetItem ? targetItem.currency : '');
      setEditingId(menuTargetId);
    }
    handleCloseMenu();
  };

  const handleDelete = () => {
    if (menuTargetId) {
      onDeleteTab(menuTargetId);
    }
    handleCloseMenu();
  };

  const handleCommitEdit = () => {
    if (isEscapedRef.current) {
      isEscapedRef.current = false;
      return;
    }
    if (editingId) {
      const trimmed = editingValue.trim();
      onUpdateCurrency(editingId, trimmed || REQUISITES_MESSAGES.DEFAULT_NEW_CURRENCY);
      setEditingId(null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCommitEdit();
    } else if (event.key === 'Escape') {
      isEscapedRef.current = true;
      setEditingId(null);
    }
  };

  const menuGroups: ActionMenuGroups = [
    {
      items: [
        {
          id: 'rename',
          text: {
            name: REQUISITES_MESSAGES.EDIT_TITLE_MENU,
            icon: <Pencil size={18} />
          },
          onClick: handleStartRename
        },
        {
          id: 'delete',
          text: {
            name: REQUISITES_MESSAGES.DELETE_REQUISITE_MENU,
            icon: <Trash2 size={18} />
          },
          onClick: handleDelete
        }
      ]
    }
  ];

  return (
    <Box sx={styles.wrapper}>
      <Box sx={styles.dividerLine} />

      <Box sx={styles.tabsContainer}>
        <Box sx={styles.groupCapsule} ref={containerRef}>
          <Box
            aria-hidden="true"
            data-testid="tab-indicator"
            sx={{
              ...styles.indicator,
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              opacity: indicatorStyle.opacity
            }}
          />

          {items.map((item) => {
            const isActive = item.id === activeId;
            const isEditing = item.id === editingId;

            return (
              <Box
                key={item.id}
                ref={(el: HTMLDivElement | null) => {
                  tabRefs.current[item.id] = el;
                }}
                sx={[
                  styles.tabItem,
                  isActive ? styles.tabItemActive : styles.tabItemInactive
                ]}
                onClick={() => {
                  if (!isEditing) onSelectTab(item.id);
                }}
                role="button"
                tabIndex={0}
              >
                {isEditing ? (
                  <input
                    ref={inputRef}
                    style={{
                      ...(styles.tabInput as React.CSSProperties),
                      width: `${Math.max(64, Math.min(200, (editingValue.length + 1) * 9))}px`
                    }}
                    value={editingValue}
                    onChange={(e) => {
                      setEditingValue(e.target.value);
                    }}
                    onBlur={handleCommitEdit}
                    onKeyDown={handleKeyDown}
                    placeholder={REQUISITES_MESSAGES.DEFAULT_NEW_CURRENCY}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span>{item.currency}</span>
                )}

                {isActive && !isEditing && (
                  <Box
                    component="span"
                    sx={styles.menuTrigger}
                    onClick={(e) => handleOpenMenu(e, item.id)}
                    aria-label="Опції реквізиту"
                    role="button"
                    tabIndex={0}
                  >
                    <EllipsisVertical size={16} />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={styles.actionButtonWrapper}>
        <Button
          variant="filled"
          color="primary"
          size="medium"
          onClick={onAddTab}
          sx={styles.addButton}
        >
          {REQUISITES_MESSAGES.ADD_REQUISITES}
        </Button>
      </Box>

      {anchorEl && (
        <ActionMenu
          anchorEl={anchorEl}
          onClose={handleCloseMenu}
          menuItems={menuGroups}
        />
      )}
    </Box>
  );
};
