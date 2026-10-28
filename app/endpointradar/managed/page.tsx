import type { Metadata } from "next";
import ManagedWorkspace from "./workspace";

export const metadata: Metadata = { title: "EndpointRadar managed workspace", robots: { index: false, follow: false } };
export default function Page() {
  const configured = process.env.ENDPOINTRADAR_DATABASE_LOCKED === "true" || (process.env.NODE_ENV !== "production" && process.env.ENDPOINTRADAR_ALLOW_EMULATOR === "true");
  if (!configured) return <main className="mx-auto min-h-screen max-w-2xl px-6 py-24"><h1 className="text-3xl font-semibold">Managed workspace setup is pending</h1><p className="mt-5 text-muted">The service needs its server configuration before device enrollment and client access can be enabled.</p><a href="/endpointradar/app" className="mt-6 inline-flex text-blue-400 underline">Open the local scan workspace</a></main>;
  return <ManagedWorkspace />;
}
