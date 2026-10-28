import type { Metadata } from "next";
import ManagedWorkspace from "./workspace";

export const metadata: Metadata = { title: "EndpointRadar managed workspace", robots: { index: false, follow: false } };
export default function Page() { return <ManagedWorkspace />; }
