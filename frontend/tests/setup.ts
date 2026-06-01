import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
