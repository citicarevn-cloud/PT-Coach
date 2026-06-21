"use client";

import { Activity, CheckCircle2, Scale, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { friendlyApiError } from "@/utils/clientError";

type UploadType = "inbody" | "workout";

export default function ImageUpload() {
  const router = useRouter();
  const inbodyInputRef = useRef<HTMLInputElement>(null);
  const workoutInputRef = useRef<HTMLInputElement>(null);
  const [uploadingType, setUploadingType] = useState<UploadType | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function uploadImage(file: File, uploadType: UploadType) {
    setUploadingType(uploadType);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadType", uploadType);

      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const payload = await response.json() as { success?: boolean; error?: string; message?: string };
      if (!response.ok || !payload.success) throw new Error(friendlyApiError(payload.error, payload.message));

      setStatus({
        type: "success",
        message: uploadType === "inbody"
          ? "Đã phân tích và lưu chỉ số Inbody."
          : "Đã phân tích và lưu kết quả tập luyện.",
      });
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Chưa thể xử lý ảnh. Vui lòng thử lại.",
      });
    } finally {
      setUploadingType(null);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>, uploadType: UploadType) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void uploadImage(file, uploadType);
  }

  const isUploading = uploadingType !== null;

  return (
    <section aria-labelledby="image-upload-title" className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white">
          <Sparkles size={21} />
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-teal-700 uppercase">AI Vision</p>
          <h2 id="image-upload-title" className="mt-0.5 text-lg font-extrabold text-slate-900">
            Cập nhật dữ liệu từ ảnh
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Chọn ảnh Fitdays hoặc Strava, AI sẽ tự đọc và lưu kết quả.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <input
          ref={inbodyInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFileChange(event, "inbody")}
          disabled={isUploading}
          aria-label="Chọn ảnh Inbody"
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inbodyInputRef.current?.click()}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-50 px-3 py-3 text-sm font-bold text-teal-800 transition hover:bg-teal-100 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Scale size={18} />
          {uploadingType === "inbody" ? "Đang phân tích AI..." : "Tải ảnh Inbody"}
        </button>

        <input
          ref={workoutInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFileChange(event, "workout")}
          disabled={isUploading}
          aria-label="Chọn ảnh kết quả tập"
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => workoutInputRef.current?.click()}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-50 px-3 py-3 text-sm font-bold text-orange-800 transition hover:bg-orange-100 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Activity size={18} />
          {uploadingType === "workout" ? "Đang phân tích AI..." : "Tải ảnh Kết quả tập"}
        </button>
      </div>

      {status && (
        <div
          role="status"
          className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {status.type === "success" && <CheckCircle2 size={16} className="shrink-0" />}
          {status.message}
        </div>
      )}
    </section>
  );
}
