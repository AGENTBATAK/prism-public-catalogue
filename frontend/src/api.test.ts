import { describe, expect, it } from 'vitest';
import { snippetParts } from './api';

describe('snippet rendering', () => {
  it('keeps FTS highlight markup as data rather than HTML', () => {
    expect(snippetParts('A <mark>polar</mark> report')).toEqual([
      { text: 'A ', marked: false }, { text: 'polar', marked: true }, { text: ' report', marked: false },
    ]);
  });
  it('handles plain source text', () => {
    expect(snippetParts('plain text')).toEqual([{ text: 'plain text', marked: false }]);
  });
});
