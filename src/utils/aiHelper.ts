export function extractAndParseJSON(rawText: string): unknown {
  try {
    // Capture an object or array even when the model adds prose or markdown around it.
    const match = rawText.match(/[\{\[][\s\S]*[\}\]]/);
    if (!match) {
      throw new Error("Không tìm thấy cấu trúc JSON trong phản hồi.");
    }
    return JSON.parse(match[0]);
  } catch (error) {
    console.error("Lỗi parse JSON. Nguyên bản API trả về:", rawText, error);
    throw new Error("Dữ liệu trả về không đúng định dạng JSON.");
  }
}
