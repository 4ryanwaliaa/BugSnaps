import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VersusPageView } from "@/components/site/versus-page";
import { VERSUS_PREFIX, competitor, competitors, versusPath } from "@/lib/competitors";
import { getPlans } from "@/lib/plans";
import { pageMetadata } from "@/lib/site";

/*
 * /compare/mypentest-vs-<competitor>. The category comparisons have their own
 * folders beside this one and take precedence; only the slugs listed in
 * lib/competitors.ts render here, everything else is a 404.
 */

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return competitors.map((c) => ({ slug: `${VERSUS_PREFIX}${c.slug}` }));
}

function fromSlug(slug: string) {
  return slug.startsWith(VERSUS_PREFIX) ? competitor(slug.slice(VERSUS_PREFIX.length)) : undefined;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const them = fromSlug((await params).slug);
  if (!them) return {};
  return pageMetadata({
    title: `MyPentest vs ${them.name}: Features, Pros & Cons, Pricing`,
    description: them.metaDescription,
    path: versusPath(them.slug),
  });
}

export default async function VersusPage({ params }: Params) {
  const them = fromSlug((await params).slug);
  if (!them) notFound();
  const plans = await getPlans();
  return <VersusPageView them={them} plans={plans} />;
}
