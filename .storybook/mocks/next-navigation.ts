import { fn } from '@storybook/test';
import type { ReactNode } from 'react';

export interface NextNavigationParameters {
  pathname?: string;
  query?: Record<string, string>;
  segments?: Array<string | [string, string]>;
}

interface NavigationState {
  pathname: string;
  query: Record<string, string>;
  segments: Array<string | [string, string]>;
}

const defaultState: NavigationState = {
  pathname: '/',
  query: {},
  segments: [],
};

let navigationState: NavigationState = { ...defaultState };

export const router = {
  back: fn(),
  forward: fn(),
  prefetch: fn(async () => undefined),
  push: fn(),
  refresh: fn(),
  replace: fn(),
};

export const notFound = fn();
export const permanentRedirect = fn();
export const redirect = fn();

function toParams(segments: NavigationState['segments']) {
  return segments.reduce<Record<string, string>>((params, segment) => {
    if (Array.isArray(segment)) {
      params[segment[0]] = segment[1];
    }

    return params;
  }, {});
}

function toSearchParams(query: NavigationState['query']) {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    searchParams.set(key, value);
  });

  return searchParams;
}

export function setNextNavigationParameters(parameters?: NextNavigationParameters) {
  navigationState = {
    pathname: parameters?.pathname ?? defaultState.pathname,
    query: parameters?.query ?? defaultState.query,
    segments: parameters?.segments ?? defaultState.segments,
  };
}

export function resetNextNavigationMocks() {
  setNextNavigationParameters();
  router.back.mockClear();
  router.forward.mockClear();
  router.prefetch.mockClear();
  router.push.mockClear();
  router.refresh.mockClear();
  router.replace.mockClear();
  notFound.mockClear();
  permanentRedirect.mockClear();
  redirect.mockClear();
}

export function getRouter() {
  return router;
}

export function useParams() {
  return toParams(navigationState.segments);
}

export function usePathname() {
  return navigationState.pathname;
}

export function useRouter() {
  return router;
}

export function useSearchParams() {
  return toSearchParams(navigationState.query);
}

export function useServerInsertedHTML(callback: () => ReactNode) {
  return callback();
}

export function useSelectedLayoutSegment() {
  const segments = useSelectedLayoutSegments();

  return segments[0] ?? null;
}

export function useSelectedLayoutSegments() {
  return navigationState.segments.map((segment) => (Array.isArray(segment) ? segment[1] : segment));
}