import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import data, { Age } from '../../stats/personal';

describe('personal stats data', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exports an array of stats', () => {
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('each stat has required properties', () => {
    for (const stat of data) {
      expect(stat).toHaveProperty('key');
      expect(stat).toHaveProperty('label');
      expect(typeof stat.label).toBe('string');
    }
  });

  it('does not export the age stat while birthday is hidden', () => {
    const ageStat = data.find((s) => s.key === 'age');

    expect(ageStat).toBeUndefined();
  });

  it('has a countries visited stat', () => {
    const countriesStat = data.find((s) => s.key === 'countries');

    expect(countriesStat).toBeDefined();
    expect(countriesStat!.label).toBe('Countries visited');
    expect(countriesStat!.value).toBe(2);
    expect(countriesStat!.link).toBeUndefined();
  });

  it('has a current location stat', () => {
    const locationStat = data.find((s) => s.key === 'location');

    expect(locationStat).toBeDefined();
    expect(locationStat!.label).toBe('Current city');
    expect(locationStat!.value).toBe('San Jose, CA');
  });

  it('keeps Age available for later without ticking it on the page', () => {
    expect(Age).toBeTypeOf('function');
  });
});
