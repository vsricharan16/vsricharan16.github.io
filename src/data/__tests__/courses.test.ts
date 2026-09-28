import { describe, expect, it } from 'vitest';

import courses from '../resume/courses';

describe('courses data', () => {
  it('lists selected transcript courses', () => {
    expect(courses.length).toBeGreaterThan(0);
  });

  it('each course has required properties', () => {
    for (const course of courses) {
      expect(course.title.trim().length).toBeGreaterThan(0);
      expect(course.number.trim().length).toBeGreaterThan(0);
      expect(course.university.trim().length).toBeGreaterThan(0);
      expect(course.link).toMatch(/^https?:\/\//);
    }
  });

  it('uses unique course numbers', () => {
    const numbers = courses.map((course) => course.number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it('uses unique public titles', () => {
    const titles = courses.map((course) => course.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('includes machine learning and AI courses', () => {
    const titles = courses.map((course) => course.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        'Artificial Intelligence',
        'Machine Learning',
        'Data Mining',
        'Deep Learning for Vision',
      ]),
    );
  });
});
