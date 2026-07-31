import { CustomerLoginPage } from "@/screens/login";

const oauthErrors: Record<string, string> = {
  google_not_configured:
    "Вход через Google пока не настроен. Добавьте GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET.",
  google_cancelled: "Вход через Google был отменен.",
  google_invalid_state:
    "Сессия входа через Google устарела. Попробуйте еще раз.",
  google_failed: "Не удалось войти через Google. Попробуйте позже.",
};

type LoginPageProps = {
  searchParams: Promise<{
    oauth?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const oauth = Array.isArray(params.oauth) ? params.oauth[0] : params.oauth;
  const initialError = oauth ? (oauthErrors[oauth] ?? null) : null;

  return <CustomerLoginPage initialError={initialError} />;
}
