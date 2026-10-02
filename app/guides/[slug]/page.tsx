import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SecurityGuidePage } from "@/components/site/security-guide-page";
import { getSecurityGuide, guidePath, SECURITY_GUIDES } from "@/lib/security-guides";
import { pageMetadata } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SECURITY_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getSecurityGuide((await params).slug);
  if (!guide) return {};
  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: guidePath(guide.slug),
    type: "article",
    published: guide.updated,
    modified: guide.updated,
  });
}

export default async function GuideRoute({ params }: Props) {
  const guide = getSecurityGuide((await params).slug);
  if (!guide) notFound();
  return <SecurityGuidePage guide={guide} />;
}
