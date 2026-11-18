/**
 * UUID v4. crypto.randomUUID는 보안 연결(HTTPS·localhost)에서만 있어서,
 * 앱 WebView가 개발 중에 PC의 LAN IP(http://192.168.x.x)로 열면 없다.
 * 그럴 때는 어디서나 되는 crypto.getRandomValues로 같은 형식을 만든다.
 */
export function createUuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // 버전 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
