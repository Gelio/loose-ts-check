import { str } from './another-file';

const val: string = 123;

declare function expectsNumber(v: number): string;

expectsNumber('string').someMethod;

console.log(str);
