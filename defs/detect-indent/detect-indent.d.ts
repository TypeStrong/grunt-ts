// Type definitions for detect-indent
// Project: https://github.com/sindresorhus/detect-indent
declare module 'detect-indent' {
    var detectIndent: (string: string) => { amount: number; type?: string; indent: string };
    export = detectIndent;
}
