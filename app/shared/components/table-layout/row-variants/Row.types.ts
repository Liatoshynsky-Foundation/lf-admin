import React from 'react';

export type MenuItem = {
  id: string;
  text: {
    name: string;
    icon?: React.ReactNode;
  };
  href?: string;
  onClick?: () => void;
};

export type BaseRowData<TGroup, TSub, TPlain> =
  | {
      type: 'group';
      id: string;
      groupData: TGroup;
      subRows: readonly (TSub & { id: string })[];
      editAction?: { editHref: string; editLabel: string };
      menuActions?: { menuItems: readonly (readonly MenuItem[])[]; menuTriggerLabel: string };
      isDefaultExpanded?: boolean;
    }
  | {
      type: 'individual';
      id: string;
      plainData: TPlain;
      editAction?: { editHref: string; editLabel: string };
      menuActions?: { menuItems: readonly (readonly MenuItem[])[]; menuTriggerLabel: string };
    };

export type ColumnDef<TGroup, TSub, TPlain> = {
  id: string;
  headerLabel?: string;
  width?: string;
  hasRightDivider?: boolean;
  hasLeftDivider?: boolean;
  align?: 'left' | 'center' | 'right';

  renderGroup?: (group: TGroup) => React.ReactNode;
  renderSub?: (sub: TSub & { id: string }, group: TGroup) => React.ReactNode;
  renderPlain?: (plain: TPlain) => React.ReactNode;
};
