/** 오늘 날짜(KST) "YYYY-MM-DD". sv-SE 로케일이 ISO 형식으로 찍어 주는 점을 이용한다. */
export const todayKst = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());

/** Date → "YYYY-MM-DD"(로컬 날짜 기준). toISOString()은 UTC라 하루가 밀릴 수 있어 쓰지 않는다. */
export const toDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** "YYYY-MM-DD" → 로컬 자정 Date */
export const fromDateString = (value: string) => new Date(`${value}T00:00:00`);
