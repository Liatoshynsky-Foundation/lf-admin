import { SxProps } from '@mui/material';

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
  sxItem?: SxProps;
  handleClick?: () => void;
  children?: React.ReactNode;
}
export interface CollapseListNavigationProps {
  openNavbar: boolean;
  elementProps: AdditionalElement;
}
export interface DividerProps {
  open: boolean;
  text: string;
}
