import { str } from './another-file';
import './ignored-dir';

const val: string = 123;

declare function expectsNumber(v: number): string;

expectsNumber('string');

console.log(str);
