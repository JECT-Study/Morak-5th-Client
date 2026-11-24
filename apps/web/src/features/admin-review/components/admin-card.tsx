import type { ReactNode } from "react";

/** 검수 화면의 카드. 머리말(제목·보조 문구)과 본문으로 나뉜다. (Figma "Background+Border") */
export default function AdminCard({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-line-subtle bg-surface-primary rounded-8 border">
      <header className="border-line-subtle flex items-center gap-3 border-b px-5 py-4">
        {header}
      </header>
      <div className="flex flex-col gap-5 p-5">{children}</div>
    </section>
  );
}
