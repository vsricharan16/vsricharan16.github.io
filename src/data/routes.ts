import { AUTHOR_NAME } from '@/lib/utils';

export interface Route {
  label: string;
  path: string;
  index?: boolean;
  primary?: boolean;
  /** When false, the page stays in the repo but is omitted from nav and footer. */
  listed?: boolean;
}

const routes: Route[] = [
  {
    index: true,
    label: AUTHOR_NAME,
    path: '/',
  },
  {
    label: 'About',
    path: '/about',
  },
  {
    label: 'Resume',
    path: '/resume',
  },
  {
    label: 'Writing',
    path: '/writing',
  },
  // Parked: a stats page is a poor fit for this professional site.
  {
    label: 'Stats',
    path: '/stats',
    listed: false,
  },
  {
    label: 'Contact',
    path: '/contact',
  },
  // Parked until the student-project archive is polished.
  {
    label: 'Archive',
    path: '/projects',
    primary: false,
    listed: false,
  },
];

export function isListedRoute(route: Route): boolean {
  return route.listed !== false;
}

export default routes;
