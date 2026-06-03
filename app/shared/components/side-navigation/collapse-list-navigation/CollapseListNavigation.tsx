import { Box, Collapse, List, Paper, Popper } from '@mui/material';
import { CollapseListNavigationProps } from 'app/types/sideNavigation';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { LinkElement } from '../link-element/LinkElement';
import { ListElement } from '../list-element/ListElement';
import { styles as SideNavigationStyles } from '../SideNavigation.styles';
import { styles } from './CollapeListNavigation.styles';

export const CollapseListNavigation: React.FC<CollapseListNavigationProps> = ({
  openNavbar,
  elementProps,
  onExpansionChange
}) => {
  const { element, collapseElements } = elementProps;
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const prevOpenNavbarRef = useRef(openNavbar);

  const handleClick = () => {
    const newState = !isSubmenuOpen;
    setIsSubmenuOpen(newState);
    if (!openNavbar) {
      onExpansionChange?.(newState);
    }
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (!openNavbar) {
      setAnchorEl(event.currentTarget);
      setIsSubmenuOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!openNavbar) {
      setAnchorEl(null);
      setIsSubmenuOpen(false);
    }
  };

  useEffect(() => {
    if (prevOpenNavbarRef.current !== openNavbar) {
      prevOpenNavbarRef.current = openNavbar;

      onExpansionChange?.(false);
      setIsSubmenuOpen(false);
    }
  }, [openNavbar, onExpansionChange]);

  const shouldShowContent = openNavbar || isSubmenuOpen;

  const collapseContent = collapseElements?.map((item) => (
    <LinkElement
      element={item}
      open={shouldShowContent}
      key={item.title}
      sxItem={[{ mb: '0' }, !openNavbar && styles.subItem]}
    />
  ));

  return (
    <Box sx={{ position: 'relative' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <ListElement
        element={element}
        open={openNavbar}
        handleClick={openNavbar ? handleClick : undefined}
        sxItem={{ mb: '0' }}
      >
        {openNavbar && (
          <Box
            sx={{
              ...SideNavigationStyles.hideInClosed(shouldShowContent),
              ...styles.listBox
            }}
          >
            {isSubmenuOpen ? (
              <Image src="/icons/chevronDown.svg" alt="open list" width={20} height={20} />
            ) : (
              <Image src="/icons/chevronRight.svg" alt="close list" width={20} height={20} />
            )}
          </Box>
        )}
      </ListElement>

      {openNavbar ? (
        <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit sx={styles.collapse}>
          <List disablePadding>{collapseContent}</List>
        </Collapse>
      ) : null}
      <Popper
        open={!openNavbar && isSubmenuOpen}
        anchorEl={anchorEl}
        placement="right-start"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, -20]
            }
          },
          { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
          {
            name: 'flip',
            enabled: false
          }
        ]}
        sx={{ zIndex: 1000 }}
      >
        <Paper sx={styles.floatingSubmenu}>
          <List disablePadding>{collapseContent}</List>
        </Paper>
      </Popper>
    </Box>
  );
};
