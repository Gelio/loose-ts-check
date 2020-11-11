import { areSetsEqual } from './are-sets-equal';

describe('areSetsEqual', () => {
  it('should return true if it is the same reference', () => {
    const set = new Set();

    expect(areSetsEqual(set, set)).toBe(true);
  });

  it('should return false if sets contain different number of elements', () => {
    const set1 = new Set();
    const set2 = new Set(['a']);

    expect(areSetsEqual(set1, set2)).toBe(false);
  });

  it('should return false if sets contain different elements', () => {
    const set1 = new Set(['b']);
    const set2 = new Set(['a']);

    expect(areSetsEqual(set1, set2)).toBe(false);
  });

  it('should return true if sets contain the same elements', () => {
    const set1 = new Set(['a', 'b']);
    const set2 = new Set(['a', 'b']);

    expect(areSetsEqual(set1, set2)).toBe(true);
  });
});
