import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.stubEnv("VITE_CPF_API_URL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});
