"use client";
import { useState, type FormEvent } from "react";

export default function PasswordView() {
  const [fields, setFields] = useState({ current: "", next: "", confirm: "" });
  const [message, setMessage] = useState<{ ok: boolean; text: string }>();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (fields.next !== fields.confirm) {
      return setMessage({ ok: false, text: "New passwords don't match" });
    }
    const response = await fetch("/api/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: fields.current, next: fields.next }),
    });
    if (response.ok) {
      setFields({ current: "", next: "", confirm: "" });
      return setMessage({ ok: true, text: "Password changed" });
    }
    const body = await response.json().catch(() => ({}));
    setMessage({ ok: false, text: body.error ?? "Couldn't change the password" });
  }

  const input = (name: keyof typeof fields, label: string, autoComplete: string) => (
    <label className="field">
      <span>{label}</span>
      <input
        type="password"
        autoComplete={autoComplete}
        required
        value={fields[name]}
        onChange={(event) => setFields({ ...fields, [name]: event.target.value })}
      />
    </label>
  );

  return (
    <main className="view narrow">
      <header className="row">
        <h1>Password</h1>
      </header>
      <form onSubmit={submit}>
        {input("current", "Old password", "current-password")}
        {input("next", "New password", "new-password")}
        {input("confirm", "Confirm new password", "new-password")}
        {message && (
          <p className={message.ok ? "saved" : "issues"} role={message.ok ? "status" : "alert"}>
            {message.text}
          </p>
        )}
        <button className="primary">Change password</button>
      </form>
    </main>
  );
}
