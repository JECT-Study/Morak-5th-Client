/** 0단계 라우트 뼈대용 빈 화면. 화면을 구현하면서 지운다. */
export default function ScreenPlaceholder({ name }: { name: string }) {
  return (
    <main className="text-object-assistive flex flex-1 items-center justify-center p-4">
      {name} 화면 준비 중
    </main>
  );
}
