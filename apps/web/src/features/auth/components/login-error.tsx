type Props = Pick<PageProps<"/login">, "searchParams">;

const MESSAGE: Record<string, string> = {
  login_failed: "로그인에 실패했어요. 다시 시도해 주세요.",
  invalid_state: "로그인 요청이 만료됐어요. 다시 시도해 주세요.",
};

export default async function LoginError({ searchParams }: Props) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? MESSAGE[error] : undefined;
  if (!message) return null;

  return (
    <p role="alert" className="text-label-sm text-(--color-semantic-feedback-destructive)">
      {message}
    </p>
  );
}
