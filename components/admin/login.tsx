"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setError(!response.ok);
    if (response.ok) router.refresh();
  }

  return (
    <form className="login" onSubmit={submit}>
      <h1>Lil Darkie admin</h1>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required autoFocus />
      </label>
      {error && <p role="alert">Incorrect password. Try again.</p>}
      <button className="primary">Enter</button>
    </form>
  );
}
