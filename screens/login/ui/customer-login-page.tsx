"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authApi } from "@/entities/user";

type AuthMode = "login" | "register";

type CustomerLoginPageProps = {
  initialError?: string | null;
};

export function CustomerLoginPage({
  initialError = null,
}: CustomerLoginPageProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const isValid = email.trim().length > 3 && password.length >= 8;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      setError("Введите email и пароль минимум 8 символов");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const normalizedEmail = email.trim();

      if (mode === "register") {
        await authApi.register(normalizedEmail, password);
      }

      await authApi.login(normalizedEmail, password);

      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось выполнить вход"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-page text-text">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-base font-bold text-white">
            HM
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">
              Higload Market
            </p>
            <h1 className="text-2xl font-semibold">
              {mode === "login" ? "Вход" : "Регистрация"}
            </h1>
          </div>
        </div>

        <section className="rounded-md border border-border bg-surface p-5 shadow-[0_1px_2px_var(--shadow-card)]">
          <div className="mb-5 grid grid-cols-2 rounded-md border border-border-strong bg-surface-muted p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`h-10 rounded-md text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-surface text-text shadow-sm"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Войти
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`h-10 rounded-md text-sm font-semibold transition ${
                mode === "register"
                  ? "bg-surface text-text shadow-sm"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Создать
            </button>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
              />
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="password"
              >
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-ring"
              />
            </div>

            {error ? (
              <div className="rounded-md border border-error-border bg-error-bg px-3 py-2 text-sm font-medium text-error-text">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="h-11 w-full rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-ring disabled:cursor-not-allowed disabled:bg-disabled"
            >
              {isSubmitting
                ? "Отправка..."
                : mode === "login"
                  ? "Войти"
                  : "Зарегистрироваться"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase text-text-muted">
              или
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <a
            href={authApi.googleStartUrl("/account")}
            className="flex h-11 w-full items-center justify-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text-soft transition hover:border-primary/60 hover:text-text focus:outline-none focus:ring-4 focus:ring-primary-ring"
          >
            Войти через Google
          </a>
        </section>

        <div className="mt-4 text-sm">
          <Link
            className="font-semibold text-text-soft hover:text-text"
            href="/"
          >
            Маркетплейс
          </Link>
        </div>
      </div>
    </main>
  );
}
