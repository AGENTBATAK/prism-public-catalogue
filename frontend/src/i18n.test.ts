import { describe, expect, it } from 'vitest';
import english from './locales/en.json';
import hindi from './locales/hi.json';

describe('Hindi translations', () => {
  it('contains every English UI key', () => {
    expect(Object.keys(hindi).sort()).toEqual(Object.keys(english).sort());
  });
});
