export function friendlyApiError(
  code: string | undefined,
  serverMessage: string | undefined,
  fallback = "Chưa thể xử lý yêu cầu. Vui lòng thử lại.",
): string {
  if (code === "AI_INVALID_RESPONSE") {
    return "AI chưa tạo được lộ trình hoàn chỉnh. Vui lòng thử lại sau ít phút.";
  }
  if (code === "OCR_INVALID_RESPONSE" || code === "INBODY_REQUIRED_FIELDS_MISSING") {
    return "AI chưa đọc đủ dữ liệu trong ảnh. Hãy dùng ảnh rõ hơn hoặc nhập Inbody thủ công.";
  }
  if (code === "AI_NOT_CONFIGURED" || code === "OCR_NOT_CONFIGURED" || code === "GEMINI_KEY_REQUIRED") {
    return "Chưa cài đặt AI API Key. Hãy mở Settings để thêm Gemini, OpenAI hoặc Groq key trước khi sử dụng AI.";
  }
  if (code === "AI_PROVIDER_ERROR" || code === "OCR_PROVIDER_ERROR" || code === "GEMINI_PROVIDER_ERROR") {
    return "Gemini đang tạm thời không phản hồi. Hãy kiểm tra API key, quota rồi thử lại.";
  }
  return serverMessage?.trim() || fallback;
}
