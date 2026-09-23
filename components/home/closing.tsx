import { CtaBand } from "@/components/site/page-parts";
import { LAUNCH_OFFER } from "@/lib/plans";

export function HomeClosing() {
  return (
    <CtaBand
      title="Run MyPentest free."
      lead={`${LAUNCH_OFFER.detail} Sign in, verify your domain, and see what it finds.`}
    />
  );
}
