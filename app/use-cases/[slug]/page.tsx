import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SecurityUseCasePage } from "@/components/site/security-use-case-page";
import { SECURITY_USE_CASES, securityUseCase, useCasePath } from "@/lib/security-use-cases";
import { pageMetadata } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SECURITY_USE_CASES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const item = securityUseCase((await params).slug);
  if (!item) return {};
  return pageMetadata({ title: item.title, description: item.description, path: useCasePath(item.slug), type: "article", published: item.updated, modified: item.updated });
}

export default async function UseCaseDetail({ params }: Params) {
  const item = securityUseCase((await params).slug);
  if (!item) notFound();
  return <SecurityUseCasePage item={item} />;
}
