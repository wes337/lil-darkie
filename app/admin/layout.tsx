import type { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Login from "@/components/admin/login";
import Shell from "@/components/admin/shell";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/cms/auth";
import { siteIcons } from "@/lib/cms/content";
import "@/styles/globals.scss";
import "@/styles/admin.scss";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Lil Darkie admin", robots: "noindex", icons: await siteIcons() };
}

// Everything under /admin. Shows the password form until the visitor has an
// admin session. The API checks the same session on every save.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = (await cookies()).get(ADMIN_COOKIE)?.value;

  return (
    <html lang="en">
      <body className="admin">
        {(await isAdminSession(session)) ? (
          <>
            <Shell />
            {children}
          </>
        ) : (
          <Login />
        )}
      </body>
    </html>
  );
}
