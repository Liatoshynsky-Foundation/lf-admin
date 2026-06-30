import { SxProps, Theme } from '@mui/material';
import React from 'react';

export interface ListElementType {
  title: string;
  iconSrc?: string;
  href?: string;
  disabled?: boolean;
}
export interface AdditionalElement {
  element: ListElementType;
  collapseElements?: ListElementType[];
}
export interface LinkElementProps {
  element: ListElementType;
  open: boolean;
  sxItem?: SxProps<Theme>;
  handleClick?: () => void;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}
export interface CollapseListNavigationProps {
  openNavbar: boolean;
  elementProps: AdditionalElement;
  onExpansionChange?: (isExpanded: boolean) => void;
}
export interface DividerProps {
  open: boolean;
  text: string;
}
