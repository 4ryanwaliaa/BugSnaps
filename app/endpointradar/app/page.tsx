import type { Metadata } from "next";
import Workspace from "./workspace";

export const metadata: Metadata = {
  title: "EndpointRadar Workspace",
  description: "Review your EndpointRadar scan results privately in your browser.",
  robots: { index: false, follow: true },
};

export default function EndpointRadarAppPage() {
  return <Workspace />;
}
