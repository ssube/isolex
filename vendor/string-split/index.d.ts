declare namespace SplitString {
  interface SplitOptions {
    brackets: boolean;
    keepEscaping: boolean;
    keepQuotes: boolean;
    keepDoubleQuotes: boolean;
    keepSingleQuotes: boolean;
    separator: string;
  }

  interface SplitStatic {
    (str: string): Array<string>;
    (str: string, delimiter: string): Array<string>;
    (str: string, options: SplitOptions): Array<string>;
  }
}

declare const split: SplitString.SplitStatic;

declare module 'split-string' {
  export = split;
}
