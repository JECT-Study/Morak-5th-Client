/** 긴 변 기본 최대 길이(px). 인증 사진 확인에 충분하고, 서버 한도(5MB)·Vercel 요청 한도(4.5MB)보다 한참 작아진다. */
const MAX_EDGE = 1600;
const QUALITY = 0.85;

/**
 * 올리기 전에 사진을 줄여 JPEG로 바꾼다. 폰 원본은 5MB를 넘기 쉽고, 크면 업로드도 느리다.
 * 줄일 수 없으면(지원하지 않는 형식 등) 원본을 그대로 돌려주고 서버 검사에 맡긴다.
 */
export async function compressImage(file: File, maxEdge = MAX_EDGE): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY),
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}
