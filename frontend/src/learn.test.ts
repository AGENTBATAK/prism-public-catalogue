import { describe, expect, it } from 'vitest';
import { lessons } from './content/learn';

describe('locally bundled Learn content', () => {
  it('provides parallel English and Hindi lessons with credited source links and archive searches', () => {
    expect(lessons.en.map(({ id }) => id)).toEqual(lessons.hi.map(({ id }) => id));
    expect(lessons.en).toHaveLength(5);
    for (const lesson of [...lessons.en, ...lessons.hi]) {
      expect(lesson.summary.length).toBeGreaterThan(60);
      expect(lesson.activity.length).toBeGreaterThan(25);
      expect(lesson.search.length).toBeGreaterThan(2);
      expect(lesson.sources.length).toBeGreaterThanOrEqual(2);
      for (const source of lesson.sources) {
        expect(source.url.startsWith('https://')).toBe(true);
        expect(source.organization.length).toBeGreaterThan(15);
      }
    }
  });
});
