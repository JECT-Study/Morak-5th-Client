import type { ReactNode } from "react";

type FormCardProps = {
  title: string;
  children: ReactNode;
};

/** 만들기 폼에서 관련 항목을 묶는 흰 카드(Figma "진행 일정", "모집 조건"). */
export default function FormCard({ title, children }: FormCardProps) {
  return (
    <section className="bg-surface-primary rounded-12 flex flex-col gap-3 p-3">
      <h3 className="text-label-md font-label-normal text-fg-secondary">{title}</h3>
      {children}
    </section>
  );
}
