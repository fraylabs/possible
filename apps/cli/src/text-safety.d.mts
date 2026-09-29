export function hasInvisibleText(text: string): boolean;
export function stripInvisibleText(text: string): string;
export function visibleText(text: string): string;
export function assertVisibleText(value: unknown): void;
export function visibleValue<T>(value: T): T;
export function invisibleTextSpans(text: string): {start: number; end: number}[];
