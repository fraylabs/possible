import "@testing-library/jest-dom/vitest";
import "../styles.css";
import { expect } from "vitest";
import * as matchers from "vitest-axe/matchers";

expect.extend(matchers);
