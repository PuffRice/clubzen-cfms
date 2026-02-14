// Minimal ambient typings for Jest globals used in tests
// Placed in `controller/` so the existing tsconfig include picks it up.

declare function describe(desc: string, fn: () => void): void;
declare function it(desc: string, fn?: () => any): void;
declare function test(desc: string, fn?: () => any): void;
declare function beforeAll(fn: () => any): void;
declare function afterAll(fn: () => any): void;
declare function beforeEach(fn: () => any): void;
declare function afterEach(fn: () => any): void;

declare const expect: {
  (actual: any): {
    toBe: (expected: any) => void;
    toEqual: (expected: any) => void;
    toMatchObject: (expected: any) => void;
    toHaveProperty: (prop: string, value?: any) => void;
    toBeGreaterThan: (n: number) => void;
    toMatch: (re: RegExp | string) => void;
    not: any;
  };
  any: (ctor: any) => any;
  stringContaining?: (s: string) => any;
};
