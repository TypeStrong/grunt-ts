/// <reference path="../underscore/underscore.d.ts"/>

declare module _str {
    export function include(str: string, substr: string): boolean;
    export function lines(str: string): string[];
    export function trim(str: string): string;
}

declare module "underscore.string" {
    export = _str;
}