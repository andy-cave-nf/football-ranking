

export function cartesianProduct<A, B>(a: A[], b: B[]): [A, B][];
export function cartesianProduct<A, B, C>(a: A[], b: B[], c: C[]): [A, B, C][];
export function cartesianProduct<T>(...inputArrays: T[][]): T[][] {
  return inputArrays.reduce(
    (acc, curr) =>
      acc.flatMap((accElement) => curr.map((currElement) => [...accElement, currElement])),
    [[]] as T[][]
  );
}
