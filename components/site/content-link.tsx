import Link from "next/link";
import type { ComponentProps } from "react";

// Public content is already server rendered. Avoid prefetching every card and
// footer link while readers (and rendering crawlers) scroll large directories.
// Click navigation still uses Next.js normally; its RSC cache keys stay intact.
export default function ContentLink(props: ComponentProps<typeof Link>) {
  return <Link {...props} prefetch={false} />;
}
