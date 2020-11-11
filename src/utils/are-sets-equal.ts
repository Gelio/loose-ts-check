export const areSetsEqual = (set1: Set<any>, set2: Set<any>) => {
  if (set1 === set2) {
    return true;
  }

  if (set1.size !== set2.size) {
    return false;
  }

  return Array.from(set1).every((elem) => set2.has(elem));
};
