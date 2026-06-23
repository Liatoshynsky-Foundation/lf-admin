import React from 'react';

export type MenuItem = {
  id: string;
  label: string;
  danger?: boolean;
};

export type RowActionConfig = {
  editAction?: {
    editHref: string;
    editLabel: string;
  };
  menuActions?: {
    menuItems: readonly MenuItem[];
    menuTriggerLabel: string;
  };
};

export type BaseRowData<TGroup, TSub, TPlain> =
  | {
      type: 'group';
      id: string;
      groupData: TGroup;
      subRows: readonly TSub[];
      editAction?: { editHref: string; editLabel: string };
      menuActions?: { menuItems: readonly MenuItem[]; menuTriggerLabel: string };
      subRowActions?: (sub: TSub) => { menuItems: readonly MenuItem[]; menuTriggerLabel: string };
      isDefaultExpanded?: boolean;
    }
  | {
      type: 'individual';
      id: string;
      plainData: TPlain;
      editAction?: { editHref: string; editLabel: string };
      menuActions?: { menuItems: readonly MenuItem[]; menuTriggerLabel: string };
    };

export type ColumnDef<TGroup, TSub, TPlain> = {
  id: string;
  headerLabel?: string;
  width?: string;
  hasRightDivider?: boolean;
  hasLeftDivider?: boolean;
  align?: 'left' | 'center' | 'right';

  renderGroup?: (group: TGroup) => React.ReactNode;
  renderSub?: (sub: TSub, group: TGroup) => React.ReactNode;
  renderPlain?: (plain: TPlain) => React.ReactNode;
};