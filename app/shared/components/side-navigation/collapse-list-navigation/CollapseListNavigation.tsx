import { Box, Collapse, List } from '@mui/material';
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
  const prevOpenNavbarRef = useRef(openNavbar);

  const handleClick = () => {
    const newState = !isSubmenuOpen;
    setIsSubmenuOpen(newState);
    if (!openNavbar) {
      onExpansionChange?.(newState);
    }
  };

  const handleMouseEnter = () => {
    if (!openNavbar) {
      setIsSubmenuOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!openNavbar) {
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
    <LinkElement element={item} open={shouldShowContent} key={item.title} sxItem={{ mb: '0' }} />
  ));

  return (
    <Box sx={{ position: 'relative' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <ListElement
        element={element}
        open={shouldShowContent}
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
      {!openNavbar && isSubmenuOpen && (
        <Box sx={styles.floatingSubmenu}>
          <List disablePadding>{collapseContent}</List>
        </Box>
      )}
    </Box>
  );
};
