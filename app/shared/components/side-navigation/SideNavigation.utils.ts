import { NAVIGATION_DATA } from './SideNavigation.consts';

const collectNavigationHrefs = (): string[] =>
  Object.values(NAVIGATION_DATA)
    .flat()
    .flatMap((item) => ('collapseElements' in item && item.collapseElements ? item.collapseElements : [item]))
    .map((entry) => ('href' in entry ? entry.href : undefined))
    .filter((href): href is string => Boolean(href));

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
