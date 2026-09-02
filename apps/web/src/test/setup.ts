import "@testing-library/jest-dom/vitest";
import "../styles.css";
import { expect } from "vitest";
import * as matchers from "vitest-axe/matchers";

const storage = new Map<string, string>();
Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: {
    get length() { return storage.size; },
    clear() { storage.clear(); },
    getItem(key: string) { return storage.get(key) ?? null; },
    key(index: number) { return [...storage.keys()][index] ?? null; },
    removeItem(key: string) { storage.delete(key); },
    setItem(key: string, value: string) { storage.set(key, String(value)); },
  } satisfies Storage,
});

expect.extend(matchers);
