export type RowActionConfig = {
  editHref?: string;
  editLabel?: string;
  menuItems: readonly { id: string; label: string; danger?: boolean }[];
  menuTriggerLabel: string;
};

export type BaseRowData<TGroup, TSub, TPlain> =
  | {
      type: 'group';
      id: string;
      groupData: TGroup;
      subRows: readonly TSub[];
	  renderer: GroupRowRenderer<TGroup, TSub>;
      actions?: RowActionConfig;
      subRowActions?: (subItem: TSub) => RowActionConfig;
    }
  | {
      type: 'individual';
      id: string;
      plainData: TPlain;
	  renderer: IndividualRowRenderer<TPlain>;
      actions?: RowActionConfig;
    };

export type GroupRowRenderer<TGroup, TSub> = {
  renderGroupCell: (colId: string, groupItem: TGroup) => React.ReactNode;
  renderSubCell: (colId: string, subItem: TSub) => React.ReactNode;
};

export type IndividualRowRenderer<TPlain> = {
  renderPlainCell: (colId: string, plainItem: TPlain) => React.ReactNode;
};
