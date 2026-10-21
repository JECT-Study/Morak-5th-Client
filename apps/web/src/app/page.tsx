import { BlockButton } from "@jects/jds";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-12">
      <section className="border-stroke-subtle bg-surface-shallow rounded-12 flex flex-col gap-2 border p-6">
        <h1 className="text-object-boldest text-2xl font-bold">모락</h1>
        <p className="text-object-alternative">
          모두 모이면 즐겁다. 함께하는 자기계발 챌린지를 시작해보세요.
        </p>
      </section>
      <BlockButton>챌린지 둘러보기</BlockButton>
    </main>
  );
}
