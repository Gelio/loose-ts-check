import { partition } from './partition';

describe('partition', () => {
  it('should correctly partition items', () => {
    const items = [1, 10, 2, 5, 4];

    const [evens, odds] = partition(items, (num) => num % 2 === 0);

    expect(evens).toEqual([10, 2, 4]);
    expect(odds).toEqual([1, 5]);
  });
});
