'use client';

import useLiveAge from '@/hooks/useLiveAge';
import {
  AGE_PRECISION_FULL,
  agePlaceholder,
  COUNTRIES_VISITED,
  CURRENT_CITY,
} from '@/lib/telemetry';

import type { StatData } from '../../components/Stats/types';

/**
 * The stats page reports age at deliberately absurd precision.
 *
 * The placeholder is the rendered content; `useLiveAge` writes the reading into
 * this node directly, so the ticking never re-renders React.
 */
export function Age() {
  const ref = useLiveAge<HTMLSpanElement>(AGE_PRECISION_FULL);

  return (
    <span className="stat-live" ref={ref}>
      {agePlaceholder(AGE_PRECISION_FULL)}
    </span>
  );
}

// Hidden for privacy. Flip this when a real birth date is set.
const SHOW_AGE = false;

const data: StatData[] = [
  ...(SHOW_AGE
    ? [
        {
          key: 'age',
          label: 'Current age',
          value: <Age />,
        } satisfies StatData,
      ]
    : []),
  {
    key: 'countries',
    label: 'Countries visited',
    value: COUNTRIES_VISITED,
  },
  {
    key: 'location',
    label: 'Current city',
    value: CURRENT_CITY,
  },
];

export default data;
