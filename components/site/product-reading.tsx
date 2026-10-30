import Link from "next/link";
import { Section } from "@/components/site/page-parts";
import { productWorkflowPosts } from "@/lib/articles/product-workflows";

export function ProductReading({ productId }: { productId: "endpointradar" | "phishlens" | "myrecon" }) {
  const articles = productWorkflowPosts.filter((article) => article.productId === productId);
  const title = { endpointradar: "Windows endpoint security guides", phishlens: "Phishing link assessment guides", myrecon: "Digital footprint and breach exposure guides" }[productId];
  return (
    <Section labelledBy={`${productId}-reading`} className="border-t border-white/10">
      <h2 id={`${productId}-reading`} className="text-3xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-4 max-w-2xl text-muted">Practical workflows, examples and limits to help you interpret your results.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {articles.map((article) => (
          <article key={article.slug} className="rounded-2xl border border-white/10 bg-surface p-6">
            <h3 className="text-xl font-semibold"><Link href={`/blog/${article.slug}`} className="hover:text-accent">{article.title}</Link></h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{article.description}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
