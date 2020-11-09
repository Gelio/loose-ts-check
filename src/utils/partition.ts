export const partition = <T>(
  arr: T[],
  predicate: (item: T) => boolean,
): [T[], T[]] => {
  const matchingItems: T[] = [];
  const nonMatchingItems: T[] = [];

  arr.forEach((item) => {
    const arrayToAppend = predicate(item) ? matchingItems : nonMatchingItems;

    arrayToAppend.push(item);
  });

  return [matchingItems, nonMatchingItems];
};
