import { notFound } from "next/navigation";

import UiPreview from "./ui-preview";

/** 새 디자인 시스템 컴포넌트를 상태별로 모아 보는 개발용 화면. 배포 환경에서는 열리지 않는다. */
export default function DevUiPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <UiPreview />;
}
