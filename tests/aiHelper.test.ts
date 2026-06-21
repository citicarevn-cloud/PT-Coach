import { afterEach, describe, expect, it, vi } from "vitest";
import { extractAndParseJSON } from "../src/utils/aiHelper.js";

describe("extractAndParseJSON", () => {
  afterEach(() => vi.restoreAllMocks());

  it("extracts an object from prose and markdown", () => {
    expect(extractAndParseJSON("Kết quả:\n```json\n{\"ok\":true}\n```\nHoàn tất")).toEqual({ ok: true });
  });

  it("extracts a top-level array", () => {
    expect(extractAndParseJSON("Danh sách: [1,{\"day\":2}] kết thúc")).toEqual([1, { day: 2 }]);
  });

  it("returns one standardized error for missing or malformed JSON", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => extractAndParseJSON("không có dữ liệu cấu trúc")).toThrow("Dữ liệu trả về không đúng định dạng JSON.");
    expect(() => extractAndParseJSON("prefix {invalid} suffix")).toThrow("Dữ liệu trả về không đúng định dạng JSON.");
    expect(console.error).toHaveBeenCalledTimes(2);
  });
});
