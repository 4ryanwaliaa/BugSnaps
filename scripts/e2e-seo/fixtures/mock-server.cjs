"use strict";

const http = require("node:http");

const CANONICAL_ORIGIN = "https://bugsnaps.in";

const ROBOTS_BOTS = [
  "*",
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "DuckDuckBot",
  "Slurp",
  "MojeekBot",
  "PetalBot",
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot",
  "Meta-ExternalAgent",
  "Twitterbot",
  "LinkedInBot",
];

const PRIVATE_ROUTES = [
  "/mypentest/app",
  "/mypentest/app/new",
  "/mypentest/app/assessment",
  "/mypentest/app/billing",
  "/endpointradar/app",
  "/endpointradar/managed",
  "/phishing-detector/team",
];

function padSubstantiveWords(topic, count = 340) {
  const baseSentences = [
    `${topic} requires repeatable verification across application endpoints, headers, and access controls.`,
    `Security engineers inspect session boundaries, input validation, and transport policies before deploying changes.`,
    `Each finding should include exact request parameters, status codes, and reproducible server responses.`,
    `Teams prioritize remediation by exploitability, exposed data sensitivity, and realistic attack paths.`,
    `Periodic manual review complements automated scanning when evaluating business logic workflows.`,
    `Clear documentation helps developers verify fixes quickly without introducing regressions in production.`,
  ];
  const out = [];
  let words = 0;
  let idx = 0;
  while (words < count) {
    const s = baseSentences[idx % baseSentences.length];
    out.push(s);
    words += s.split(/\s+/).length;
    idx++;
  }
  return out.join(" ");
}

function buildHtml({
  routePath,
  title,
  description,
  h1,
  ogType = "website",
  canonicalOverride = null,
  extraHead = "",
  breadcrumbs = null,
  jsonLdList = [],
  mainBody = "",
  extraFooterLinks = [],
  robotsMeta = "index, follow",
  navExtraLinks = [],
}) {
  const canonical = canonicalOverride || (routePath === "/" ? CANONICAL_ORIGIN : `${CANONICAL_ORIGIN}${routePath}`);

  const navLinks = [
    ["/", "Home"],
    ["/products", "Products"],
    ["/mypentest", "MyPentest"],
    ["/services", "Services"],
    ["/pricing", "Pricing"],
    ["/compare", "Compare"],
    ["/resources", "Resources"],
    ["/blog", "Blog"],
    ["/guides", "Guides"],
    ["/use-cases", "Use Cases"],
    ["/alternatives", "Alternatives"],
    ["/about", "About"],
    ["/contact", "Contact"],
    ...navExtraLinks,
  ];

  const navHtml = navLinks
    .map(([href, label]) => `<a href="${href}">${label}</a>`)
    .join(" ");

  let breadcrumbHtml = "";
  const allJsonLd = [...jsonLdList];
  if (breadcrumbs && breadcrumbs.length > 0) {
    const itemsHtml = breadcrumbs
      .map((b, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        if (isLast) {
          return `<li><span aria-current="page">${b.name}</span></li>`;
        }
        return `<li><a href="${b.path}">${b.name}</a><span aria-hidden="true">/</span></li>`;
      })
      .join("");
    breadcrumbHtml = `<nav aria-label="Breadcrumb"><ol>${itemsHtml}</ol></nav>`;
    allJsonLd.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: b.name,
        item: b.path === "/" ? CANONICAL_ORIGIN : `${CANONICAL_ORIGIN}${b.path}`,
      })),
    });
  }

  const ldScripts = allJsonLd
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join("\n");

  const footerLinks = [
    ["/privacy", "Privacy"],
    ["/site-map", "Site Map"],
    ...extraFooterLinks,
  ]
    .map(([href, label]) => `<a href="${href}">${label}</a>`)
    .join(" ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta name="robots" content="${robotsMeta}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:type" content="${ogType}" />
<meta property="og:site_name" content="BugSnaps" />
<meta property="og:url" content="${canonical}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${CANONICAL_ORIGIN}/opengraph-image.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${CANONICAL_ORIGIN}/opengraph-image.png" />
${extraHead}
</head>
<body>
<header>
  <nav aria-label="Main">${navHtml}</nav>
</header>
<main id="main">
  ${breadcrumbHtml}
  <h1>${h1}</h1>
  ${mainBody}
</main>
<footer>
  <nav aria-label="Footer links">
    <h2>Company</h2>
    ${footerLinks}
  </nav>
</footer>
${ldScripts}
</body>
</html>`;
}

function buildBaselinePages(mutation) {
  const pages = new Map();
  const orgSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${CANONICAL_ORIGIN}/#organization`,
        name: "BugSnaps",
        url: CANONICAL_ORIGIN,
        logo: `${CANONICAL_ORIGIN}/opengraph-image.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${CANONICAL_ORIGIN}/#website`,
        name: "BugSnaps",
        url: CANONICAL_ORIGIN,
        publisher: { "@id": `${CANONICAL_ORIGIN}/#organization` },
      },
    ],
  };

  pages.set("/", {
    title: "BugSnaps Web Security & Pentesting",
    description: "Run MyPentest, EndpointRadar, and PhishLens security checks with transparent scope and evidence-driven reports.",
    h1: "BugSnaps Security Testing Platform",
    jsonLdList: [
      orgSchema,
      {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        contentUrl: `${CANONICAL_ORIGIN}/images/website-security-review.webp`,
        caption: "Website security review workflow preview",
      },
    ],
    navExtraLinks:
      mutation === "T3.3-DEPTH"
        ? []
        : [["/solutions/saas-security", "SaaS Security"]],
    mainBody: `
      <p>BugSnaps builds practical web security testing tools including MyPentest, EndpointRadar, and PhishLens for engineering teams.</p>
      <img src="/_next/image?url=%2Fimages%2Fwebsite-security-review.webp&w=1200&q=75" alt="Security review" />
      <a href="/mypentest/how-to-use">How to use MyPentest</a>
      <a href="/mypentest/checks">MyPentest 56 Checks</a>
      <a href="/glossary">Security Glossary</a>
      <a href="/updates">Product Updates</a>
      ${mutation === "T3.3-DEPTH" ? "" : `<a href="/solutions/saas-security">SaaS Security Solutions</a>`}
    `,
    extraFooterLinks: mutation === "T3.3-DEPTH" ? [["/solutions/saas-security", "SaaS Security"]] : [],
  });

  pages.set("/products", {
    title: "Security Testing Products - BugSnaps",
    description: "Explore MyPentest, EndpointRadar, PhishLens, and MyRecon tools built for reproducible web and endpoint security checks.",
    h1: "BugSnaps Security Testing Products",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Products", path: "/products" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "BugSnaps Security Testing Products",
        url: `${CANONICAL_ORIGIN}/products`,
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "MyPentest", url: `${CANONICAL_ORIGIN}/mypentest` },
        ],
      },
    ],
    mainBody: `<p>Explore BugSnaps security products designed for web applications, endpoints, and suspicious URLs.</p>`,
  });

  // /mypentest: Pattern A FAQ (<details><summary><h3>)
  const mypentestFaq = [
    {
      question: "How does MyPentest verify ownership before scanning?",
      answer: "MyPentest requires DNS TXT verification bound to your account before running active checks.",
    },
    {
      question: "Which report formats does MyPentest export?",
      answer: "MyPentest exports reports in PDF, HTML, Markdown, JSON, and SARIF formats.",
    },
  ];
  const mypentestAsset =
    mutation === "T1.6-ASSETS"
      ? `<img src="/images/missing-asset.webp" alt="Broken asset" />`
      : `<img src="/images/website-security-review.webp" alt="Website security review" />`;
  const mypentestClaim =
    mutation === "T4.2-UNSHIPPED"
      ? `<p>MyRecon feeds deep targets into MyPentest and MyPentest is free to run on every release.</p>`
      : "";
  const mypentestFaqHtml =
    mutation === "T3.1-FAQ-HIDDEN"
      ? `<section aria-labelledby="faq-title"><h2 id="faq-title">FAQ</h2>
          <div hidden><details><summary><h3>${mypentestFaq[0].question}</h3><span aria-hidden="true">+</span></summary><p>${mypentestFaq[0].answer}</p></details></div>
          <details><summary><h3>${mypentestFaq[1].question}</h3><span aria-hidden="true">+</span></summary><p>${mypentestFaq[1].answer}</p></details>
         </section>`
      : `<section aria-labelledby="faq-title"><h2 id="faq-title">FAQ</h2>
          <details><summary><h3>${mypentestFaq[0].question}</h3><span aria-hidden="true">+</span></summary><p>${mypentestFaq[0].answer}</p></details>
          <details><summary><h3>${mypentestFaq[1].question}</h3><span aria-hidden="true">+</span></summary><p>${mypentestFaq[1].answer}</p></details>
         </section>`;

  const mypentestFaqJsonLd =
    mutation === "T3.1-FAQ-ANSWER-SWAPPED"
      ? [
          {
            "@type": "Question",
            name: mypentestFaq[0].question,
            acceptedAnswer: { "@type": "Answer", text: "Read our pricing page for scan pack details." },
          },
          {
            "@type": "Question",
            name: mypentestFaq[1].question,
            acceptedAnswer: { "@type": "Answer", text: mypentestFaq[1].answer },
          },
        ]
      : mypentestFaq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        }));
  const mypentestSwappedBody =
    mutation === "T3.1-FAQ-ANSWER-SWAPPED"
      ? `<p>Read our pricing page for scan pack details.</p>`
      : "";

  pages.set("/mypentest", {
    title: "MyPentest Web Pentest Scanner - BugSnaps",
    description: "Run 56 passive and safe-active web security checks with DNS TXT verification, dual-account testing, and five report formats.",
    h1: "MyPentest Automated Web Security Testing",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "MyPentest", path: "/mypentest" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "MyPentest",
        applicationCategory: "SecurityApplication",
        operatingSystem: "Web",
        url: `${CANONICAL_ORIGIN}/mypentest`,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: mypentestFaqJsonLd,
      },
    ],
    mainBody: `
      <p>MyPentest runs 56 passive and safe-active web security checks with DNS TXT domain verification and SARIF exports.</p>
      ${mypentestSwappedBody}
      ${mypentestAsset}
      ${mypentestClaim}
      ${mypentestFaqHtml}
    `,
  });

  // /services
  const servicesBody =
    mutation === "T1.4-H1"
      ? `<h1>Duplicate H1 Heading</h1><h3>Skipped H2 directly to H3</h3><p>Manual penetration testing services for web and API systems.</p>`
      : mutation === "T1.4-HIDDEN-IMPORTANT"
        ? `<div style="display: none !important;"><h2>Hidden Section Heading</h2><p>Hidden content ignored by parser.</p></div><h3>Visible Subheading</h3><p>Manual penetration testing services for web and API systems.</p>`
        : `<h2>Manual Penetration Testing Services</h2><p>BugSnaps conducts quoted manual penetration tests for web applications, APIs, cloud accounts, and networks.</p>`;
  pages.set("/services", {
    title: "Manual Penetration Testing Services - BugSnaps",
    description: "Quoted manual web application, API, cloud, and network penetration testing with clear findings and retest support.",
    h1: "Manual Penetration Testing Services",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Manual Penetration Testing",
        description: "Quoted manual security testing for web, API, network, and cloud infrastructure.",
        url: `${CANONICAL_ORIGIN}/services`,
        provider: { "@id": `${CANONICAL_ORIGIN}/#organization`, "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN },
      },
    ],
    mainBody: servicesBody,
  });

  // /pricing: Pattern B FAQ (<details><summary><span>)
  const pricingFaq = [
    {
      question: "Are MyPentest plans one-time purchases?",
      answer: "Yes. Every paid MyPentest pack is a one-time purchase with no recurring subscription.",
    },
  ];
  const pricingJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Offer",
      price: "4.99",
      priceCurrency: "USD",
    },
  ];
  if (mutation !== "T3.1-FAQ-UNMARKED") {
    pricingJsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: pricingFaq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }
  const pricingClaim =
    mutation === "T4.2-FABRICATED"
      ? `<p>Trusted by 5,000+ enterprises and reduces average MTTR from weeks to hours across production deployments.</p>`
      : "";
  pages.set("/pricing", {
    title: "Penetration Testing Pricing Plans - BugSnaps",
    description: "Compare free and one-time paid MyPentest scan packs in INR and USD with transparent target limits and five export formats.",
    h1: "Transparent Penetration Testing Pricing Plans",
    canonicalOverride: mutation === "T1.2-CANONICAL" ? `${CANONICAL_ORIGIN}/wrong-canonical` : null,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }],
    jsonLdList: pricingJsonLd,
    mainBody: `
      <p>Choose transparent one-time penetration testing pricing plans in INR via Razorpay or USD via PayPal.</p>
      ${pricingClaim}
      <section aria-labelledby="faq-title">
        <h2 id="faq-title">Frequently asked questions</h2>
        <details>
          <summary><span>${pricingFaq[0].question}</span><span aria-hidden="true">+</span></summary>
          <p>${pricingFaq[0].answer}</p>
        </details>
      </section>
    `,
  });

  // /resources
  const resourcesLinks =
    mutation === "T1.6-LINKS"
      ? `<a href="/non-existent-broken-page">Broken link</a> <a href="#missing-frag">Missing anchor</a>`
      : mutation === "T1.6-TRAILING-SLASH"
        ? `<a href="/about/">About BugSnaps trailing slash</a>`
        : `<a href="/templates/api-security-test-cases.csv">API Security Template CSV</a> <a href="#guides-section">Jump to guides</a>`;
  pages.set("/resources", {
    title: "Security Templates & Testing Resources - BugSnaps",
    description: "Download CSV security test templates, readiness checklists, and practical technical guides built for engineering teams.",
    h1: "Security Testing Templates & Resources",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Security Testing Templates & Resources",
        url: `${CANONICAL_ORIGIN}/resources`,
      },
    ],
    mainBody: `<section id="guides-section"><h2>Downloadable Templates</h2><p>Access practical CSV templates and security testing resources.</p>${resourcesLinks}</section>`,
  });

  // /about
  const aboutTitle =
    mutation === "T1.3-TITLE-DUP"
      ? "Manual Penetration Testing Services - BugSnaps"
      : mutation === "T1.3-TITLE-DUP-BRAND"
        ? "About BugSnaps - BugSnaps"
        : "About BugSnaps Security Founder - BugSnaps";
  const aboutClaim =
    mutation === "T4.2-SELFCERT"
      ? `<p>BugSnaps is SOC 2 Type II certified and ISO 27001 attested for enterprise scanning.</p>`
      : `<p>BugSnaps is founded by Aryan Walia, CEH-certified penetration tester in Gurugram, India. BugSnaps has not completed its own independent SOC 2 examination.</p>`;
  pages.set("/about", {
    title: aboutTitle,
    description: "Learn about BugSnaps, founded by CEH-certified penetration tester Aryan Walia in Gurugram with transparent scope limits.",
    h1: "About BugSnaps and Founder Aryan Walia",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "About", path: "/about" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About BugSnaps",
        url: `${CANONICAL_ORIGIN}/about`,
        mainEntity: {
          "@type": "Person",
          name: "Aryan Walia",
        },
      },
    ],
    mainBody: aboutClaim,
  });

  // /contact
  pages.set("/contact", {
    title: "Contact BugSnaps Security Team - BugSnaps",
    description:
      mutation === "T1.3-DESC-BOUNDS"
        ? "Contact BugSnaps team for security testing help today."
        : "Contact BugSnaps in Gurugram for manual penetration testing quotes, responsible disclosure, or product support.",
    h1: "Contact BugSnaps Security Team",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact BugSnaps",
        url: `${CANONICAL_ORIGIN}/contact`,
      },
    ],
    mainBody: `<p>Reach our security engineering team at aryan@bugsnaps.in for penetration testing quotes or support.</p>`,
  });

  // /privacy (legal allowlist 70-165)
  pages.set("/privacy", {
    title: "Privacy Policy - BugSnaps",
    description: "Read the BugSnaps privacy policy covering ephemeral scan retention, analytics consent, and data handling.",
    h1: "BugSnaps Privacy Policy",
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: "BugSnaps Privacy Policy",
        url: `${CANONICAL_ORIGIN}/privacy`,
      },
    ],
    mainBody: `<p>BugSnaps keeps ephemeral scan reports for 24 hours and gates analytics cookies on explicit user consent.</p>`,
  });

  // /blog & posts
  const extraBlogPosts = [];
  if (mutation === "T4.1-SERP-PREFIX") {
    for (let k = 1; k <= 5; k++) {
      extraBlogPosts.push(`/blog/series-post-${k}`);
    }
  }
  const blogPosts = ["/blog/clean-post-one", "/blog/clean-post-two", "/blog/avoiding-vendor-lock-in", ...extraBlogPosts];

  const blogListLinks = blogPosts
    .filter((p) => !(mutation === "T1.7-HUBS" && p === "/blog/clean-post-two"))
    .map((p) => `<li><a href="${p}">${p}</a></li>`)
    .join("");
  const blogPrefetchExtra =
    mutation === "T1.6-PREFETCH-BLOAT"
      ? Array.from({ length: 5 }, (_, idx) => `<link rel="prefetch" href="/blog/clean-post-one?p=${idx}" />`).join("")
      : "";
  const blogRscHref =
    mutation === "T1.6-PREFETCH-BLOAT"
      ? `<a href="/blog/clean-post-one?_rsc=123">Bad RSC link</a>`
      : "";

  pages.set("/blog", {
    title: "Web Security Engineering Blog - BugSnaps",
    description: "Read practical security testing articles on API authorization checks, phishing triage, and Windows posture reviews.",
    h1: "BugSnaps Web Security Engineering Blog",
    extraHead: blogPrefetchExtra,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "BugSnaps Security Blog",
        url: `${CANONICAL_ORIGIN}/blog`,
      },
    ],
    mainBody: `<p>Practical articles covering web security engineering and vulnerability verification.</p><ul>${blogListLinks}</ul>${blogRscHref}`,
  });

  let postOneClaim = "";
  if (mutation === "T4.2-ZERO-FP") {
    postOneClaim = `<p>MyPentest delivers zero false positives in production across all scans.</p>`;
  } else if (mutation === "T4.2-ZERO-FP-HYPHEN") {
    postOneClaim = `<p>MyPentest delivers 0% false-positive results across web scans.</p>`;
  } else if (mutation === "T4.2-HEADING-BYPASS") {
    postOneClaim = `<h2>Not every tool works the same</h2><p>MyPentest delivers zero false positives across production scans.</p>`;
  } else if (mutation === "T4.2-GUARANTEE") {
    postOneClaim = `<p>MyPentest guarantees complete legal protection and offers definitive, proven detection.</p>`;
  } else if (mutation === "T4.2-UNSHIPPED-EXTRA") {
    postOneClaim = `<p>MyPentest includes OpenAPI import and unlimited free scans on every account.</p>`;
  }

  pages.set("/blog/clean-post-one", {
    title:
      mutation === "T2.1-TRUNC"
        ? "API Authorization Verification Guide With Extended Extra Words Exceeding Limit"
        : mutation === "T4.1-SERP-PREFIX"
          ? "Complete Web Application Security Guide Post One"
          : "API Authorization Verification Guide - BugSnaps",
    description: "Walk through practical BOLA and IDOR verification steps with dual-account session checks and honest scope limits.",
    h1: "API Authorization Verification Guide",
    ogType: "article",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: "API Authorization Guide", path: "/blog/clean-post-one" },
    ],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "API Authorization Verification Guide",
        description: "Walk through practical BOLA and IDOR verification steps.",
        datePublished: "2026-11-15",
        dateModified: "2026-11-20",
        author: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN },
        publisher: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN, logo: `${CANONICAL_ORIGIN}/opengraph-image.png` },
        mainEntityOfPage: `${CANONICAL_ORIGIN}/blog/clean-post-one`,
      },
    ],
    mainBody: `
      <p>2 min read · Published <time datetime="2026-11-15">Nov 15, 2026</time></p>
      <p>BugSnaps Security Research</p>
      <p>Achieving and maintaining SOC 2 Type II certification is a milestone for B2B technology providers.</p>
      <p>BugSnaps delivers PCI DSS compliant penetration test documentation complete with proof-of-concept evidence and CVSS vector strings.</p>
      <p>Verify API authorization boundaries across dual test accounts while documenting exact evidence.</p>
      <p>Does MyPentest guarantee zero false positives? No. Reports distinguish confirmed, likely, and informational observations.</p>
      <p>BugSnaps has not completed its own independent SOC 2 examination, and Vercel provides underlying SOC 2 Type II infrastructure.</p>
      <p>When preparing for SOC 2 or ISO 27001 audits, teams attach reproducible HTTP evidence.</p>
      <p>Scheduled retests are on the roadmap and not currently available, and MyRecon is separate from MyPentest.</p>
      <p>No inflated metrics, no borrowed logos, no testimonials are used anywhere in our verification claims.</p>
      ${postOneClaim}
      <p>${padSubstantiveWords("API authorization testing", 260)}</p>
    `,
  });

  const postTwoBodyWords =
    mutation === "T2.4-THIN"
      ? `<p>Short thin stub about security logs.</p>
         <nav aria-label="TOC"><a href="/guides">Guides</a> ${padSubstantiveWords("Nav padding", 180)}</nav>
         <section aria-labelledby="cta-title"><h2 id="cta-title">Run scan</h2><p>${padSubstantiveWords("CTA band padding", 180)}</p></section>`
      : `<p>2 min read</p><p>${padSubstantiveWords("Windows event log security analysis", 340)}</p>`;

  pages.set("/blog/clean-post-two", {
    title:
      mutation === "T4.1-SERP-PREFIX"
        ? "Complete Web Application Security Guide Post Two"
        : "Windows Event Log Security Analysis - BugSnaps",
    description: "Inspect high-signal Windows security event IDs including 1102, 4672, and 5140 across incident review workflows.",
    h1: "Windows Event Log Security Analysis",
    ogType: "article",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: "Windows Event Analysis", path: "/blog/clean-post-two" },
    ],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Windows Event Log Security Analysis",
        description: "Inspect high-signal Windows security event IDs.",
        datePublished: "2026-11-16",
        dateModified: mutation === "T4.2-FUTURE-DATE" ? "2027-01-15" : "2026-11-20",
        author: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN },
        publisher: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN, logo: `${CANONICAL_ORIGIN}/opengraph-image.png` },
        mainEntityOfPage: `${CANONICAL_ORIGIN}/blog/clean-post-two`,
      },
    ],
    mainBody: `
      ${mutation === "T4.2-READING-TIME" ? "<p>8 min read</p>" : ""}
      ${postTwoBodyWords}
    `,
  });

  for (let k = 1; k <= extraBlogPosts.length; k++) {
    const p = `/blog/series-post-${k}`;
    pages.set(p, {
      title: `Complete Web Application Security Guide Part ${k}`,
      description: `Detailed walkthrough number ${k} covering web application security testing workflows and verification checks.`,
      h1: `Complete Web Application Security Guide Part ${k}`,
      ogType: "article",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: `Guide Part ${k}`, path: p },
      ],
      jsonLdList: [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `Complete Web Application Security Guide Part ${k}`,
          description: `Detailed walkthrough number ${k}.`,
          datePublished: "2026-11-16",
          dateModified: "2026-11-20",
          author: { "@type": "Person", name: "Aryan Walia" },
          publisher: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN, logo: `${CANONICAL_ORIGIN}/opengraph-image.png` },
          mainEntityOfPage: `${CANONICAL_ORIGIN}${p}`,
        },
      ],
      mainBody: `<p>2 min read</p><p>${padSubstantiveWords(`Web application security guide ${k}`, 340)}</p>`,
    });
  }

  pages.set("/blog/avoiding-vendor-lock-in", {
    title: "Avoiding Security Vendor Lock-in - BugSnaps",
    description: "Compare pay-as-you-go security scan packs against annual contracts with zero vendor lock-in and portable SARIF exports.",
    h1: "Avoiding Security Vendor Lock-in",
    ogType: "article",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: "Avoiding Vendor Lock-in", path: "/blog/avoiding-vendor-lock-in" },
    ],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Avoiding Security Vendor Lock-in",
        description: "Compare pay-as-you-go scan packs against annual contracts without vendor lock-in.",
        datePublished: "2026-11-18",
        dateModified: "2026-11-20",
        author: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN },
        publisher: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN, logo: `${CANONICAL_ORIGIN}/opengraph-image.png` },
        mainEntityOfPage: `${CANONICAL_ORIGIN}/blog/avoiding-vendor-lock-in`,
      },
    ],
    mainBody: `<p>2 min read</p><p>${padSubstantiveWords("Portable security testing without vendor lock-in", 340)}</p>`,
  });

  // /guides & /guides/clean-guide (Pattern C FAQ: <h3> + <p>)
  pages.set("/guides", {
    title: "Security Assessment Guides - BugSnaps",
    description: "Browse practical security assessment guides for cookies, HTTP headers, Windows Event IDs, and API token validation.",
    h1: "Security Assessment Guides Directory",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Security Assessment Guides",
        url: `${CANONICAL_ORIGIN}/guides`,
      },
    ],
    mainBody: `<p>Browse security assessment guides.</p><a href="/guides/clean-guide">Secure Cookie Attribute Review</a> <a href="/guides/device-stopped-checking-in">Troubleshoot Device Stopped Checking In</a>`,
  });

  const guideFaqQ = "Why does SameSite matter on session cookies?";
  const guideFaqA = "SameSite restricts cross-site request transmission and reduces CSRF exposure.";
  pages.set("/guides/clean-guide", {
    title: "Secure Cookie Attribute Review Guide - BugSnaps",
    description: "Verify HttpOnly, Secure, and SameSite flags across session cookies to reduce token exposure and CSRF risks today.",
    h1: "Secure Cookie Attribute Review Guide",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      {
        name: mutation === "T3.2-BREADCRUMB" ? "Wrong Breadcrumb Text" : "Secure Cookie Guide",
        path: "/guides/clean-guide",
      },
    ],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Secure Cookie Attribute Review Guide",
        description: "Verify HttpOnly, Secure, and SameSite flags across session cookies.",
        dateModified: "2026-11-20",
        author: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN },
        publisher: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN, logo: `${CANONICAL_ORIGIN}/opengraph-image.png` },
        mainEntityOfPage: `${CANONICAL_ORIGIN}/guides/clean-guide`,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: guideFaqQ,
            acceptedAnswer: { "@type": "Answer", text: guideFaqA },
          },
        ],
      },
    ],
    mainBody: `
      <p>${padSubstantiveWords("Secure cookie attribute verification", 340)}</p>
      <section aria-labelledby="faq-title">
        <h2 id="faq-title">Frequently asked questions</h2>
        <div>
          <h3>${guideFaqQ}</h3>
          <p>${guideFaqA}</p>
        </div>
      </section>
    `,
  });
  if (mutation === "T3.2-BREADCRUMB") {
    // Mismatch between <nav> and BreadcrumbList JSON-LD
    const g = pages.get("/guides/clean-guide");
    g.breadcrumbs = null;
    g.extraNavOverride = `<nav aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/guides">Guides</a></li><li><span aria-current="page">Different Visible Label</span></li></ol></nav>`;
    g.jsonLdList.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: CANONICAL_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${CANONICAL_ORIGIN}/guides` },
        { "@type": "ListItem", position: 3, name: "Secure Cookie Guide", item: `${CANONICAL_ORIGIN}/guides/clean-guide` },
      ],
    });
  }

  pages.set("/guides/device-stopped-checking-in", {
    title: "Fix a Device That Stopped Checking In - BugSnaps",
    description: "Troubleshoot a Windows device that has stopped checking in using Event IDs, network checks, and policy sync logs.",
    h1: "Troubleshoot a Windows Device Stopped Checking In",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: "Device Checking In", path: "/guides/device-stopped-checking-in" },
    ],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Troubleshoot a Windows Device Stopped Checking In",
        description: "Troubleshoot a Windows device that has stopped checking in.",
        dateModified: "2026-11-20",
        author: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN },
        publisher: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN, logo: `${CANONICAL_ORIGIN}/opengraph-image.png` },
        mainEntityOfPage: `${CANONICAL_ORIGIN}/guides/device-stopped-checking-in`,
      },
    ],
    mainBody: `<p>${padSubstantiveWords("Windows device stopped checking in", 340)}</p>`,
  });

  // /use-cases & /use-cases/clean-uc
  pages.set("/use-cases", {
    title: "Security Testing Use Cases - BugSnaps",
    description: "Explore practical web and API security testing use cases across SaaS, fintech, healthcare, and engineering teams.",
    h1: "Security Testing Use Cases",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Use Cases", path: "/use-cases" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Security Testing Use Cases",
        url: `${CANONICAL_ORIGIN}/use-cases`,
      },
    ],
    mainBody: `<p>Explore industry and workflow security testing use cases.</p><a href="/use-cases/clean-uc">Fintech API Security Testing</a>`,
  });

  pages.set("/use-cases/clean-uc", {
    title: "Fintech API Security Testing - BugSnaps",
    description: "Assess fintech web apps and payment APIs for authorization flaws, rate limits, and transport security controls.",
    h1: "Fintech API Security Testing Use Case",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Use Cases", path: "/use-cases" },
      { name: "Fintech API Security", path: "/use-cases/clean-uc" },
    ],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Fintech API Security Testing Use Case",
        description: "Assess fintech web apps and payment APIs.",
        dateModified: "2026-11-20",
        author: { "@type": "Organization", "@id": `${CANONICAL_ORIGIN}/#organization`, name: "BugSnaps" },
        publisher: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN, logo: `${CANONICAL_ORIGIN}/opengraph-image.png` },
        mainEntityOfPage: `${CANONICAL_ORIGIN}/use-cases/clean-uc`,
      },
    ],
    mainBody: `<p>${padSubstantiveWords("Fintech API security testing", 340)}</p>`,
  });

  // /compare & /compare/mypentest-vs-tool-a
  pages.set("/compare", {
    title: "Compare MyPentest Against Tools - BugSnaps",
    description: "Compare MyPentest one-time pricing, verification depth, and report export formats against common security scanners.",
    h1: "Compare MyPentest Security Scanners",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Compare", path: "/compare" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Compare MyPentest",
        url: `${CANONICAL_ORIGIN}/compare`,
      },
    ],
    mainBody: `<p>Compare MyPentest against common web security tools.</p><a href="/compare/mypentest-vs-tool-a">MyPentest vs Tool A</a>`,
  });

  pages.set("/compare/mypentest-vs-tool-a", {
    title: "MyPentest vs Tool A Comparison - BugSnaps",
    description: "Compare MyPentest and Tool A across transparent one-time scan pricing, DNS TXT domain verification, and SARIF outputs.",
    h1: "MyPentest vs Tool A Security Comparison",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Compare", path: "/compare" },
      { name: "MyPentest vs Tool A", path: "/compare/mypentest-vs-tool-a" },
    ],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "MyPentest vs Tool A",
        description: "Compare MyPentest and Tool A.",
        dateModified: "2026-11-20",
        author: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN },
        publisher: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN, logo: `${CANONICAL_ORIGIN}/opengraph-image.png` },
        mainEntityOfPage: `${CANONICAL_ORIGIN}/compare/mypentest-vs-tool-a`,
      },
    ],
    mainBody: `<p>${padSubstantiveWords("MyPentest vs Tool A security comparison", 340)}</p>`,
  });

  // /alternatives & /alternatives/tool-a (Pattern D FAQ: <dl><dt><dd>)
  pages.set("/alternatives", {
    title: "Web Security Scanner Alternatives - BugSnaps",
    description: "Evaluate practical alternatives to legacy web vulnerability scanners with transparent one-time pricing and exports.",
    h1: "Web Security Scanner Alternatives",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Alternatives", path: "/alternatives" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Tool A Alternatives", url: `${CANONICAL_ORIGIN}/alternatives/tool-a` },
        ],
      },
    ],
    mainBody: `<p>Evaluate alternatives to commercial security scanners.</p><a href="/alternatives/tool-a">Tool A Alternatives</a>`,
  });

  const altFaqQ = "How does MyPentest differ from Tool A pricing?";
  const altFaqA = "MyPentest offers one-time scan packs instead of mandatory annual contracts.";
  pages.set("/alternatives/tool-a", {
    title: "Tool A Alternatives for Web Testing - BugSnaps",
    description: "Compare Tool A alternatives offering transparent one-time web security scans, DNS verification, and SARIF output.",
    h1: "Tool A Alternatives for Web Security Testing",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Alternatives", path: "/alternatives" },
      { name: "Tool A Alternatives", path: "/alternatives/tool-a" },
    ],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Tool A Alternatives for Web Security Testing",
        description: "Compare Tool A alternatives.",
        dateModified: "2026-11-20",
        about: { "@type": "SoftwareApplication", name: "Tool A", url: "https://example.com/tool-a" },
        author: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN },
        publisher: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN, logo: `${CANONICAL_ORIGIN}/opengraph-image.png` },
        mainEntityOfPage: `${CANONICAL_ORIGIN}/alternatives/tool-a`,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: altFaqQ,
            acceptedAnswer: { "@type": "Answer", text: altFaqA },
          },
        ],
      },
    ],
    mainBody: `
      <p>${padSubstantiveWords("Tool A alternatives comparison", 340)}</p>
      <section aria-labelledby="faq-title">
        <h2 id="faq-title">Tool A alternatives: common questions</h2>
        <dl>
          <div>
            <dt>${altFaqQ}</dt>
            <dd>${altFaqA}</dd>
          </div>
        </dl>
      </section>
    `,
  });

  // /solutions/saas-security
  pages.set("/solutions/saas-security", {
    title: "SaaS Web & API Security Testing - BugSnaps",
    description: "Harden multi-tenant SaaS applications and REST APIs with combined automated checks and manual penetration testing.",
    h1: "SaaS Application & API Security Solutions",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: "SaaS Security", path: "/solutions/saas-security" },
    ],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "SaaS Security Testing",
        description: "Multi-tenant SaaS application and API security testing.",
        url: `${CANONICAL_ORIGIN}/solutions/saas-security`,
        provider: { "@id": `${CANONICAL_ORIGIN}/#organization`, "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN },
      },
    ],
    mainBody: `<p>${padSubstantiveWords("SaaS security testing solution", 340)}</p>`,
  });

  // Supporting routes: /mypentest/checks, /glossary, /updates, /mypentest/how-to-use
  pages.set("/mypentest/checks", {
    title: "MyPentest 56 Security Checks List - BugSnaps",
    description: "Inspect all 32 passive and 24 safe-active checks executed by MyPentest across headers, cookies, TLS, and web APIs.",
    h1: "MyPentest 56 Security Checks Reference",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "MyPentest", path: "/mypentest" },
      { name: "56 Checks", path: "/mypentest/checks" },
    ],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: "MyPentest 56 Security Checks Reference",
        description: "Complete list of 32 passive and 24 safe-active checks.",
        datePublished: "2026-11-18",
        dateModified: "2026-11-20",
        author: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN },
        publisher: { "@type": "Organization", name: "BugSnaps", url: CANONICAL_ORIGIN, logo: `${CANONICAL_ORIGIN}/opengraph-image.png` },
        mainEntityOfPage: `${CANONICAL_ORIGIN}/mypentest/checks`,
      },
    ],
    mainBody: `<p>Complete reference for all 56 MyPentest passive and safe-active security checks.</p>`,
  });

  pages.set("/glossary", {
    title: "Web Security & Pentesting Glossary - BugSnaps",
    description: "Clear engineering definitions for BOLA, IDOR, SARIF, Punycode, WinRM posture checks, and DNS TXT domain verification.",
    h1: "Web Security and Pentesting Glossary",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Glossary", path: "/glossary" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "DefinedTermSet",
        name: "BugSnaps Security Glossary",
        hasDefinedTerm: [
          {
            "@type": "DefinedTerm",
            name: "SARIF",
            description: "Static Analysis Results Interchange Format for machine-readable security findings.",
          },
        ],
      },
    ],
    mainBody: `<p>Clear engineering definitions for security testing and vulnerability assessment terms.</p>`,
  });

  pages.set("/updates", {
    title: "BugSnaps Product Updates Timeline - BugSnaps",
    description: "Track verified shipped updates and changelog releases across MyPentest, EndpointRadar, and PhishLens security tools.",
    h1: "BugSnaps Product Updates Timeline",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Updates", path: "/updates" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: "BugSnaps Product Updates",
        url: `${CANONICAL_ORIGIN}/updates`,
      },
    ],
    mainBody: `<p>Chronological changelog of verified capabilities shipped across BugSnaps products.</p>`,
  });

  const howToUseFaqQ = "How long is the MyPentest tutorial?";
  const howToUseFaqA = "The tutorial video runs 7 minutes and 29 seconds covering DNS TXT verification and reporting.";
  const howToUseJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "MyPentest Complete Tutorial",
      description: "Step-by-step walkthrough of MyPentest DNS verification and scan setup.",
      thumbnailUrl: mutation === "T1.5-JSONLD" ? undefined : `${CANONICAL_ORIGIN}/tutorials/mypentest-tutorial.jpg`,
      uploadDate: "2026-10-15",
      contentUrl: `${CANONICAL_ORIGIN}/tutorials/mypentest-complete-tutorial.mp4`,
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "Run a MyPentest Web Security Scan",
      step: [{ "@type": "HowToStep", name: "Verify domain via DNS TXT", text: "Add the TXT record to verify ownership." }],
    },
  ];
  if (mutation !== "T3.1-FAQ-DIV-UNMARKED") {
    howToUseJsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: howToUseFaqQ,
          acceptedAnswer: { "@type": "Answer", text: howToUseFaqA },
        },
      ],
    });
  }

  pages.set("/mypentest/how-to-use", {
    title: "How to Use MyPentest Walkthrough - BugSnaps",
    description: "Watch the MyPentest tutorial and follow step-by-step DNS TXT verification and scan configuration instructions.",
    h1: "How to Use MyPentest Step by Step",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "MyPentest", path: "/mypentest" },
      { name: "How to Use", path: "/mypentest/how-to-use" },
    ],
    jsonLdList: howToUseJsonLd,
    mainBody: `
      <p>Follow this <time datetime="PT7M29S">7m 29s</time> tutorial to verify domain ownership and launch your first MyPentest assessment.</p>
      <video poster="/tutorials/mypentest-tutorial.jpg"><source src="/tutorials/mypentest-complete-tutorial.mp4" type="video/mp4" /></video>
      <div class="faq-wrapper">
        <h2>Quick answers while you follow along</h2>
        <div>
          <details>
            <summary><h3>${howToUseFaqQ}</h3><span aria-hidden="true">+</span></summary>
            <p>${howToUseFaqA}</p>
          </details>
        </div>
      </div>
    `,
  });

  // /site-map
  const allPaths = [...pages.keys(), "/site-map"];
  pages.set("/site-map", {
    title: "HTML Site Map & All Pages - BugSnaps",
    description: "Browse the complete HTML site map of BugSnaps product pages, security guides, comparisons, and engineering blog posts.",
    h1: "BugSnaps HTML Site Map",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Site Map", path: "/site-map" }],
    jsonLdList: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "BugSnaps HTML Site Map",
        url: `${CANONICAL_ORIGIN}/site-map`,
      },
    ],
    mainBody: `
      <p>Browse all indexable pages on BugSnaps or open the XML sitemap.</p>
      <a href="/sitemap.xml">Open the XML sitemap</a>
      <ul>${allPaths.map((p) => `<li><a href="${p}">${p}</a></li>`).join("")}</ul>
    `,
  });

  return pages;
}

function startMockSite(mutation = null) {
  const pages = buildBaselinePages(mutation);
  const sitemapPaths = [...pages.keys()];

  const server = http.createServer((req, res) => {
    const hostHeader = (req.headers.host || "").split(":")[0].toLowerCase();
    const parsedUrl = new URL(req.url || "/", "http://127.0.0.1");
    const pathname = parsedUrl.pathname === "/" ? "/" : parsedUrl.pathname.replace(/\/+$/, "");

    // www redirect probe
    if (hostHeader === "www.bugsnaps.in") {
      if (mutation === "T2.3-TRANSPORT") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<html><body><h1>Served without redirect</h1></body></html>");
        return;
      }
      const dest = pathname === "/" ? CANONICAL_ORIGIN + "/" : CANONICAL_ORIGIN + pathname;
      res.writeHead(308, { Location: dest });
      res.end();
      return;
    }

    // RSC flight / ?_rsc= probe
    if (req.headers.rsc === "1") {
      res.writeHead(200, {
        "Content-Type": "text/x-component; charset=utf-8",
        "X-Robots-Tag": "noindex",
      });
      res.end('0:["$","div",null,{"children":"rsc"}]');
      return;
    }
    if (parsedUrl.searchParams.has("_rsc")) {
      const headers = { "Content-Type": "text/html; charset=utf-8" };
      if (mutation !== "T2.3-RSC") {
        headers["X-Robots-Tag"] = "noindex";
      }
      res.writeHead(200, headers);
      res.end("<html><body><main><h1>RSC Variant</h1></main></body></html>");
      return;
    }

    // Discovery files
    if (pathname === "/robots.txt") {
      const blocks = ROBOTS_BOTS.map((bot) => {
        const omitDisallow = mutation === "T1.1-ROBOTS" && bot === "Googlebot";
        const disallows = omitDisallow
          ? ["/mypentest/api", "/endpointradar/app", "/endpointradar/managed", "/endpointradar/api"]
          : ["/mypentest/app", "/mypentest/api", "/endpointradar/app", "/endpointradar/managed", "/endpointradar/api"];
        return [
          `User-Agent: ${bot}`,
          `Allow: /`,
          ...disallows.map((d) => `Disallow: ${d}`),
        ].join("\n");
      }).join("\n\n");
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`${blocks}\n\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml\n`);
      return;
    }

    if (pathname === "/sitemap.xml") {
      const urls = sitemapPaths
        .map((p) => {
          const loc = p === "/" ? CANONICAL_ORIGIN : `${CANONICAL_ORIGIN}${p}`;
          const locXml = p === "/privacy" ? `<![CDATA[${loc}]]>` : loc;
          return `<url><loc>${locXml}</loc><lastmod>2026-11-20</lastmod></url>`;
        })
        .join("");
      const commentNoise = `<!-- ignored comment: <url><loc>${CANONICAL_ORIGIN}/commented-out-route</loc><lastmod>2026-11-20</lastmod></url> -->`;
      const badCdata =
        mutation === "T1.1-SITEMAP-BAD-CDATA"
          ? `<url><loc><![CDATA[${CANONICAL_ORIGIN}/broken-cdata</loc><lastmod>2026-11-20</lastmod></url>`
          : "";
      res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
      res.end(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${commentNoise}${urls}${badCdata}</urlset>`
      );
      return;
    }

    if (pathname === "/llms.txt") {
      const curatedPaths = ["/resources", "/blog/clean-post-two"];
      if (mutation === "T1.1-LLMS") curatedPaths.push("/phishing-detector/team");
      const lines = curatedPaths
        .map((path) => `- [${path}](${CANONICAL_ORIGIN}${path})`)
        .join("\n");
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`# BugSnaps\n\n${lines}\n\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml\n`);
      return;
    }

    // Static assets & favicons
    if (pathname === "/favicon.ico") {
      if (mutation === "T1.6-FAVICON") {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<html><body><h1>Not Found</h1></body></html>");
        return;
      }
      res.writeHead(200, { "Content-Type": "image/x-icon", "Content-Length": "4" });
      res.end(Buffer.from([0, 0, 1, 0]));
      return;
    }
    if (pathname === "/apple-icon.png" || pathname === "/opengraph-image.png") {
      res.writeHead(200, { "Content-Type": "image/png", "Content-Length": "8" });
      res.end(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      return;
    }
    if (pathname === "/images/website-security-review.webp" || pathname === "/_next/image") {
      res.writeHead(200, { "Content-Type": "image/webp", "Content-Length": "4" });
      res.end(Buffer.from("RIFF"));
      return;
    }
    if (pathname === "/tutorials/mypentest-tutorial.jpg") {
      res.writeHead(200, { "Content-Type": "image/jpeg", "Content-Length": "3" });
      res.end(Buffer.from([0xff, 0xd8, 0xff]));
      return;
    }
    if (pathname === "/tutorials/mypentest-complete-tutorial.mp4") {
      res.writeHead(200, { "Content-Type": "video/mp4", "Content-Length": "4" });
      res.end(Buffer.from("ftyp"));
      return;
    }
    if (pathname === "/templates/api-security-test-cases.csv") {
      const csv = "case_id,title\nAPI-01,BOLA check\n";
      res.writeHead(200, { "Content-Type": "text/csv; charset=utf-8", "Content-Length": String(Buffer.byteLength(csv)) });
      res.end(csv);
      return;
    }

    // Private noindex routes
    if (PRIVATE_ROUTES.includes(pathname)) {
      const headers = { "Content-Type": "text/html; charset=utf-8" };
      const omitBoth = mutation === "T2.2-NOINDEX" && pathname === "/mypentest/app";
      const omitEndpointXRobots = mutation === "T2.2-ENDPOINT-XROBOTS" && pathname === "/endpointradar/app";
      if (!omitBoth && !omitEndpointXRobots) {
        headers["X-Robots-Tag"] = "noindex, nofollow";
      }
      const metaRobots = omitBoth ? "index, follow" : "noindex, nofollow";
      res.writeHead(200, headers);
      res.end(
        `<!DOCTYPE html><html><head><title>Private Workspace</title><meta name="robots" content="${metaRobots}" /></head><body><main><h1>Workspace</h1></main></body></html>`
      );
      return;
    }

    // Known indexable pages
    if (pages.has(pathname)) {
      if (mutation === "T1.2-STATUS" && pathname === "/about") {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Internal Server Error");
        return;
      }
      const spec = pages.get(pathname);
      let html = buildHtml({ routePath: pathname, ...spec });
      if (spec.extraNavOverride) {
        html = html.replace("<main id=\"main\">", `<main id="main">\n${spec.extraNavOverride}`);
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    // Soft-404 mutation
    if (mutation === "T2.3-SOFT404" && pathname === "/guides/not-a-guide-e2e-check") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html><html><head><title>Not found</title></head><body><main><h1>Not found</h1><a href="/">Home</a></main></body></html>`);
      return;
    }

    // Custom 404
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      `<!DOCTYPE html><html><head><title>Page not found - BugSnaps</title><meta name="robots" content="noindex, follow" /></head><body><main><h1>That page doesn't exist.</h1><a href="/">Return Home</a></main></body></html>`
    );
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${addr.port}`,
        close: () => new Promise((resClose) => server.close(() => resClose())),
      });
    });
  });
}

module.exports = {
  startMockSite,
};
