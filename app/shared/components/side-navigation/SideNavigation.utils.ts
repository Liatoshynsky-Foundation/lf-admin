import { NAVIGATION_DATA } from './SideNavigation.consts';

const collectNavigationHrefs = (): string[] => {
  const sections = [NAVIGATION_DATA.main, NAVIGATION_DATA.content, NAVIGATION_DATA.other];
  const hrefs: string[] = [];

  for (const section of sections) {
    for (const item of section) {
      if ('href' in item && item.href) {
        hrefs.push(item.href);
      }

      if ('collapseElements' in item && item.collapseElements) {
        for (const child of item.collapseElements) {
          if (child.href) {
            hrefs.push(child.href);
          }
        }
      }
    }
  }

  return hrefs;
};

const NAVIGATION_HREFS = collectNavigationHrefs();

const matchesPath = (href: string, pathName: string): boolean => {
  if (href === '/') {
    return pathName === href;
  }

  return pathName === href || pathName.startsWith(`${href}/`);
};

export const isActivePath = (href: string | undefined, pathName: string | null): boolean => {
  if (!href || !pathName || !matchesPath(href, pathName)) {
    return false;
  }

  return !NAVIGATION_HREFS.some((candidate) => candidate.length > href.length && matchesPath(candidate, pathName));
};
