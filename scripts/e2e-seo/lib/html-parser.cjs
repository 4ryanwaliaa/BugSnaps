"use strict";

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

const RAW_TEXT_TAGS = new Set([
  "script", "style", "noscript", "textarea", "title",
]);

const SKIP_VISIBLE_TAGS = new Set([
  "script", "style", "noscript", "template", "svg",
]);

const BLOCK_TAGS = new Set([
  "address", "article", "aside", "blockquote", "br", "dd", "details",
  "dialog", "div", "dl", "dt", "fieldset", "figcaption", "figure",
  "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header",
  "hgroup", "hr", "li", "main", "nav", "ol", "p", "pre", "section",
  "summary", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul",
]);

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00A0",
  ensp: "\u2002",
  emsp: "\u2003",
  thinsp: "\u2009",
  zwnj: "\u200C",
  zwj: "\u200D",
  rsquo: "\u2019",
  lsquo: "\u2018",
  rdquo: "\u201D",
  ldquo: "\u201C",
  sbquo: "\u201A",
  bdquo: "\u201E",
  ndash: "\u2013",
  mdash: "\u2014",
  hellip: "\u2026",
  copy: "\u00A9",
  reg: "\u00AE",
  trade: "\u2122",
  bull: "\u2022",
  middot: "\u00B7",
  times: "\u00D7",
  divide: "\u00F7",
  plusmn: "\u00B1",
  deg: "\u00B0",
  sect: "\u00A7",
  para: "\u00B6",
  laquo: "\u00AB",
  raquo: "\u00BB",
  lsaquo: "\u2039",
  rsaquo: "\u203A",
  prime: "\u2032",
  Prime: "\u2033",
  rarr: "\u2192",
  larr: "\u2190",
  uarr: "\u2191",
  darr: "\u2193",
  harr: "\u2194",
  le: "\u2264",
  ge: "\u2265",
  ne: "\u2260",
  asymp: "\u2248",
  infin: "\u221E",
  euro: "\u20AC",
  pound: "\u00A3",
  yen: "\u00A5",
  cent: "\u00A2",
  iquest: "\u00BF",
  iexcl: "\u00A1",
  check: "\u2713",
  cross: "\u2717",
  permil: "\u2030",
  micro: "\u00B5",
  alpha: "\u03B1",
  beta: "\u03B2",
  gamma: "\u03B3",
  delta: "\u03B4",
  omega: "\u03C9",
  Agrave: "\u00C0",
  Aacute: "\u00C1",
  Acirc: "\u00C2",
  Atilde: "\u00C3",
  Auml: "\u00C4",
  Aring: "\u00C5",
  AElig: "\u00C6",
  Ccedil: "\u00C7",
  Egrave: "\u00C8",
  Eacute: "\u00C9",
  Ecirc: "\u00CA",
  Euml: "\u00CB",
  Igrave: "\u00CC",
  Iacute: "\u00CD",
  Icirc: "\u00CE",
  Iuml: "\u00CF",
  ETH: "\u00D0",
  Ntilde: "\u00D1",
  Ograve: "\u00D2",
  Oacute: "\u00D3",
  Ocirc: "\u00D4",
  Otilde: "\u00D5",
  Ouml: "\u00D6",
  Oslash: "\u00D8",
  Ugrave: "\u00D9",
  Uacute: "\u00DA",
  Ucirc: "\u00DB",
  Uuml: "\u00DC",
  Yacute: "\u00DD",
  THORN: "\u00DE",
  szlig: "\u00DF",
  agrave: "\u00E0",
  aacute: "\u00E1",
  acirc: "\u00E2",
  atilde: "\u00E3",
  auml: "\u00E4",
  aring: "\u00E5",
  aelig: "\u00E6",
  ccedil: "\u00E7",
  egrave: "\u00E8",
  eacute: "\u00E9",
  ecirc: "\u00EA",
  euml: "\u00EB",
  igrave: "\u00EC",
  iacute: "\u00ED",
  icirc: "\u00EE",
  iuml: "\u00EF",
  eth: "\u00F0",
  ntilde: "\u00F1",
  ograve: "\u00F2",
  oacute: "\u00F3",
  ocirc: "\u00F4",
  otilde: "\u00F5",
  ouml: "\u00F6",
  oslash: "\u00F8",
  ugrave: "\u00F9",
  uacute: "\u00FA",
  ucirc: "\u00FB",
  uuml: "\u00FC",
  yacute: "\u00FD",
  thorn: "\u00FE",
  yuml: "\u00FF",
  OElig: "\u0152",
  oelig: "\u0153",
  Scaron: "\u0160",
  scaron: "\u0161",
  Yuml: "\u0178",
};

function decodeEntities(str) {
  if (!str || typeof str !== "string" || !str.includes("&")) return str || "";
  return str.replace(/&(#x[\da-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]+);/g, (full, body) => {
    if (body[0] === "#") {
      const isHex = body[1] === "x" || body[1] === "X";
      const num = parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10);
      if (!Number.isFinite(num) || num <= 0 || num > 0x10ffff || (num >= 0xd800 && num <= 0xdfff)) {
        return "\uFFFD";
      }
      return String.fromCodePoint(num);
    }
    if (Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, body)) {
      return NAMED_ENTITIES[body];
    }
    const lower = body.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, lower)) {
      return NAMED_ENTITIES[lower];
    }
    return full;
  });
}

function normalizeForParity(str) {
  if (!str || typeof str !== "string") return "";
  return decodeEntities(str)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseAttributes(raw) {
  const attrs = Object.create(null);
  let i = 0;
  const len = raw.length;
  while (i < len) {
    while (i < len && /[\s/]/.test(raw[i])) i++;
    if (i >= len) break;
    const nameStart = i;
    while (i < len && !/[\s=/>]/.test(raw[i])) i++;
    const name = raw.slice(nameStart, i).toLowerCase();
    if (!name) {
      i++;
      continue;
    }
    while (i < len && /\s/.test(raw[i])) i++;
    if (i < len && raw[i] === "=") {
      i++;
      while (i < len && /\s/.test(raw[i])) i++;
      let value = "";
      if (i < len && (raw[i] === '"' || raw[i] === "'")) {
        const quote = raw[i++];
        const valStart = i;
        while (i < len && raw[i] !== quote) i++;
        value = raw.slice(valStart, i);
        if (i < len && raw[i] === quote) i++;
      } else {
        const valStart = i;
        while (i < len && !/[\s>]/.test(raw[i])) i++;
        value = raw.slice(valStart, i);
      }
      attrs[name] = decodeEntities(value);
    } else {
      attrs[name] = "";
    }
  }
  return attrs;
}

function findTagEnd(html, start) {
  let i = start;
  let quote = null;
  const len = html.length;
  while (i < len) {
    const ch = html[i];
    if (quote) {
      if (ch === quote) quote = null;
    } else {
      if (ch === '"' || ch === "'") quote = ch;
      else if (ch === ">") return i;
    }
    i++;
  }
  return len;
}

function parseHtml(html) {
  const root = { type: "root", tag: "#root", attrs: Object.create(null), children: [] };
  if (!html || typeof html !== "string") return root;

  const stack = [root];
  const len = html.length;
  let i = 0;

  while (i < len) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      const text = html.slice(i);
      if (text) stack[stack.length - 1].children.push({ type: "text", text });
      break;
    }
    if (lt > i) {
      stack[stack.length - 1].children.push({ type: "text", text: html.slice(i, lt) });
    }

    if (html.startsWith("<!--", lt)) {
      const commentEnd = html.indexOf("-->", lt + 4);
      i = commentEnd === -1 ? len : commentEnd + 3;
      continue;
    }

    if (html[lt + 1] === "!" || html[lt + 1] === "?") {
      const declEnd = findTagEnd(html, lt + 2);
      i = declEnd < len ? declEnd + 1 : len;
      continue;
    }

    if (html[lt + 1] === "/") {
      const gt = html.indexOf(">", lt + 2);
      const rawClose = (gt === -1 ? html.slice(lt + 2) : html.slice(lt + 2, gt)).trim();
      const closeName = rawClose.split(/\s+/)[0].toLowerCase();
      if (closeName) {
        for (let s = stack.length - 1; s >= 1; s--) {
          if (stack[s].tag === closeName) {
            stack.length = s;
            break;
          }
        }
      }
      i = gt === -1 ? len : gt + 1;
      continue;
    }

    const nameMatch = html.slice(lt + 1, lt + 64).match(/^([a-zA-Z][a-zA-Z0-9:-]*)/);
    if (!nameMatch) {
      stack[stack.length - 1].children.push({ type: "text", text: "<" });
      i = lt + 1;
      continue;
    }

    const tagName = nameMatch[1].toLowerCase();
    const afterName = lt + 1 + nameMatch[1].length;
    const tagEnd = findTagEnd(html, afterName);
    const rawAttrStr = html.slice(afterName, tagEnd);
    const selfClosing = /\/\s*$/.test(rawAttrStr);
    const attrs = parseAttributes(rawAttrStr);

    const elem = { type: "element", tag: tagName, attrs, children: [] };
    stack[stack.length - 1].children.push(elem);
    i = tagEnd < len ? tagEnd + 1 : len;

    if (RAW_TEXT_TAGS.has(tagName) && !selfClosing) {
      const closeRe = new RegExp(`</${tagName}\\s*>`, "i");
      const rest = html.slice(i);
      const closeMatch = closeRe.exec(rest);
      if (closeMatch) {
        const rawContent = rest.slice(0, closeMatch.index);
        if (rawContent) elem.children.push({ type: "text", text: rawContent });
        i += closeMatch.index + closeMatch[0].length;
      } else {
        if (rest) elem.children.push({ type: "text", text: rest });
        i = len;
      }
      continue;
    }

    if (!VOID_TAGS.has(tagName) && !selfClosing) {
      stack.push(elem);
    }
  }

  return root;
}

function isHiddenNode(node) {
  if (!node || node.type !== "element") return false;
  if (SKIP_VISIBLE_TAGS.has(node.tag)) return true;
  const attrs = node.attrs || {};
  if (Object.prototype.hasOwnProperty.call(attrs, "hidden")) return true;
  if ((attrs["aria-hidden"] || "").trim().toLowerCase() === "true") return true;
  const style = attrs.style || "";
  if (/(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden)(?:\s*!important)?\s*(?:;|$)/i.test(style)) {
    return true;
  }
  return false;
}

function getRawText(node) {
  if (!node) return "";
  if (node.type === "text") return node.text;
  let out = "";
  for (const child of node.children || []) out += getRawText(child);
  return out;
}

function extractVisibleText(node, options = {}) {
  const parts = [];
  const excludeNav = Boolean(options.excludeNav);
  const excludeCtaBand = Boolean(options.excludeCtaBand);
  const excludeFooter = Boolean(options.excludeFooter);
  const excludeSummary = Boolean(options.excludeSummary);
  const preserveNewlines = Boolean(options.preserveNewlines);

  function walk(cur) {
    if (!cur) return;
    if (cur.type === "text") {
      parts.push(preserveNewlines ? decodeEntities(cur.text).replace(/\s+/g, " ") : cur.text);
      return;
    }
    if (cur.type === "element") {
      if (isHiddenNode(cur)) return;
      if (excludeNav && cur.tag === "nav") return;
      if (excludeFooter && cur.tag === "footer") return;
      if (excludeSummary && cur.tag === "summary") return;
      if (
        excludeCtaBand &&
        cur.tag === "section" &&
        (cur.attrs["aria-labelledby"] || "").trim().toLowerCase() === "cta-title"
      ) {
        return;
      }
      const isBlock = BLOCK_TAGS.has(cur.tag);
      const sep = preserveNewlines ? "\n" : " ";
      if (isBlock) parts.push(sep);
      for (const child of cur.children) walk(child);
      if (isBlock) parts.push(sep);
      return;
    }
    for (const child of cur.children || []) walk(child);
  }

  walk(node);
  if (preserveNewlines) {
    return parts
      .join("")
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join("\n");
  }
  return decodeEntities(parts.join("")).replace(/\s+/g, " ").trim();
}

function extractVisibleLines(node, options = {}) {
  const text = extractVisibleText(node, { ...options, preserveNewlines: true });
  return text ? text.split("\n").filter(Boolean) : [];
}

function findFirst(node, predicate) {
  if (!node) return null;
  if (node.type === "element" && predicate(node)) return node;
  for (const child of node.children || []) {
    const found = findFirst(child, predicate);
    if (found) return found;
  }
  return null;
}

function findAll(node, predicate, out = []) {
  if (!node) return out;
  if (node.type === "element" && predicate(node)) out.push(node);
  for (const child of node.children || []) findAll(child, predicate, out);
  return out;
}

function extractHeadings(container) {
  if (!container) return [];
  const headings = [];
  function walk(node) {
    if (!node) return;
    if (node.type === "root") {
      for (const child of node.children || []) walk(child);
      return;
    }
    if (node.type !== "element") return;
    if (isHiddenNode(node)) return;
    const m = node.tag.match(/^h([1-6])$/);
    if (m) {
      headings.push({
        level: Number(m[1]),
        text: extractVisibleText(node),
      });
      return;
    }
    for (const child of node.children) walk(child);
  }
  walk(container);
  return headings;
}

function flattenJsonLd(parsed) {
  const out = [];
  function visit(item) {
    if (!item || typeof item !== "object") return;
    if (Array.isArray(item)) {
      for (const el of item) visit(el);
      return;
    }
    if (Array.isArray(item["@graph"])) {
      for (const el of item["@graph"]) visit(el);
      return;
    }
    out.push(item);
  }
  visit(parsed);
  return out;
}

function isStaticAssetUrl(rawHref) {
  if (!rawHref || typeof rawHref !== "string") return false;
  const trimmed = rawHref.trim();
  if (trimmed.startsWith("/_next/image?")) return true;
  let pathname = trimmed;
  try {
    pathname = new URL(trimmed, "https://bugsnaps.in").pathname;
  } catch {
    return false;
  }
  if (/^\/(?:downloads|images|templates|tutorials|benchmarks|fonts)\//i.test(pathname)) return true;
  if (/\.(?:webp|png|jpe?g|svg|gif|ico|mp4|webm|vtt|csv|txt|ps1|pdf|zip|ttf|woff2?|json)$/i.test(pathname)) {
    return true;
  }
  return false;
}

function findVisibleFirst(node, predicate) {
  if (!node) return null;
  if (node.type === "element") {
    if (isHiddenNode(node)) return null;
    if (predicate(node)) return node;
  }
  for (const child of node.children || []) {
    const found = findVisibleFirst(child, predicate);
    if (found) return found;
  }
  return null;
}

function findVisibleAll(node, predicate, out = []) {
  if (!node) return out;
  if (node.type === "element") {
    if (isHiddenNode(node)) return out;
    if (predicate(node)) out.push(node);
  }
  for (const child of node.children || []) findVisibleAll(child, predicate, out);
  return out;
}

function extractFaqItemsFromSection(sectionNode) {
  const detailsBlocks = findVisibleAll(sectionNode, (n) => n.tag === "details");
  if (detailsBlocks.length > 0) {
    const items = [];
    for (const d of detailsBlocks) {
      const summary = findVisibleFirst(d, (n) => n.tag === "summary");
      if (!summary) continue;
      const q = normalizeForParity(extractVisibleText(summary)).replace(/\s*[+×]\s*$/, "").trim();
      const a = normalizeForParity(extractVisibleText(d, { excludeSummary: true }));
      if (q && a) items.push({ question: q, answer: a });
    }
    if (items.length > 0) return items;
  }

  const dlBlocks = findVisibleAll(sectionNode, (n) => n.tag === "dl");
  if (dlBlocks.length > 0) {
    const items = [];
    for (const dl of dlBlocks) {
      const dts = findVisibleAll(dl, (n) => n.tag === "dt");
      const dds = findVisibleAll(dl, (n) => n.tag === "dd");
      for (let i = 0; i < Math.min(dts.length, dds.length); i++) {
        const q = normalizeForParity(extractVisibleText(dts[i]));
        const a = normalizeForParity(extractVisibleText(dds[i]));
        if (q && a) items.push({ question: q, answer: a });
      }
    }
    if (items.length > 0) return items;
  }

  const items = [];
  function collectHeadingAnswerPairs(container) {
    const children = (container.children || []).filter((c) => c.type === "element" && !isHiddenNode(c));
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.tag === "h3") {
        const q = normalizeForParity(extractVisibleText(child));
        const ansParts = [];
        let j = i + 1;
        while (j < children.length && children[j].tag !== "h3" && children[j].tag !== "h2") {
          const t = normalizeForParity(extractVisibleText(children[j]));
          if (t) ansParts.push(t);
          j++;
        }
        const a = ansParts.join(" ").trim();
        if (q && a) items.push({ question: q, answer: a });
        i = j - 1;
      } else {
        collectHeadingAnswerPairs(child);
      }
    }
  }
  collectHeadingAnswerPairs(sectionNode);
  return items;
}

const FAQ_INTENT_RE = /\b(?:faq|frequently asked questions|common questions|questions people ask|your questions answered|quick answers|questions about)\b/i;

function extractPage(html, routePath, canonicalOrigin = "https://bugsnaps.in") {
  const root = parseHtml(html);
  const titleNode = findFirst(root, (n) => n.tag === "title");
  const title = titleNode ? decodeEntities(getRawText(titleNode)).replace(/\s+/g, " ").trim() : "";

  const metaTags = findAll(root, (n) => n.tag === "meta");
  const metaMap = Object.create(null);
  for (const m of metaTags) {
    const key = (m.attrs.name || m.attrs.property || m.attrs["http-equiv"] || "").trim().toLowerCase();
    if (key && typeof m.attrs.content === "string" && metaMap[key] === undefined) {
      metaMap[key] = m.attrs.content;
    }
  }

  const linkTags = findAll(root, (n) => n.tag === "link");
  let canonical = null;
  const prefetchLinks = [];
  for (const l of linkTags) {
    const relTokens = (l.attrs.rel || "").toLowerCase().split(/\s+/).filter(Boolean);
    if (relTokens.includes("canonical") && l.attrs.href && !canonical) {
      canonical = l.attrs.href;
    }
    if (relTokens.includes("prefetch") && l.attrs.href) {
      prefetchLinks.push(l.attrs.href);
    }
  }

  const bodyNode = findFirst(root, (n) => n.tag === "body") || root;
  const mainNode = findFirst(root, (n) => n.tag === "main");

  const headingsFull = extractHeadings(bodyNode);
  const headingsMain = mainNode ? extractHeadings(mainNode) : [];

  const jsonLdBlocks = [];
  const jsonLdNodes = [];
  for (const s of findAll(root, (n) => n.tag === "script" && (n.attrs.type || "").toLowerCase().includes("ld+json"))) {
    const raw = getRawText(s).trim();
    try {
      const parsed = JSON.parse(raw);
      jsonLdBlocks.push({ raw, parsed, error: null });
      jsonLdNodes.push(...flattenJsonLd(parsed));
    } catch (err) {
      jsonLdBlocks.push({ raw, parsed: null, error: err.message });
    }
  }

  const ids = new Set();
  for (const el of findAll(root, (n) => typeof n.attrs.id === "string" && n.attrs.id.length > 0)) {
    ids.add(el.attrs.id);
  }

  const linksAll = [];
  const linksEditorial = [];
  const linksMain = [];
  const assets = [];
  const times = [];

  function walkLinksAndAssets(node, ctx) {
    if (!node) return;
    if (node.type === "root") {
      for (const child of node.children || []) walkLinksAndAssets(child, ctx);
      return;
    }
    if (node.type !== "element") return;
    const nextCtx = {
      inFooter: ctx.inFooter || node.tag === "footer",
      inHeader: ctx.inHeader || node.tag === "header",
      inMain: ctx.inMain || node.tag === "main",
      inNavMain:
        ctx.inNavMain ||
        (node.tag === "nav" && (node.attrs["aria-label"] || "").toLowerCase() === "main"),
    };

    if (node.tag === "a" && typeof node.attrs.href === "string" && node.attrs.href.trim() !== "") {
      const href = node.attrs.href.trim();
      const linkObj = {
        href,
        text: extractVisibleText(node),
        inFooter: nextCtx.inFooter,
        inHeader: nextCtx.inHeader,
        inMain: nextCtx.inMain,
        inNavMain: nextCtx.inNavMain,
      };
      linksAll.push(linkObj);
      if (nextCtx.inMain) linksMain.push(linkObj);
      if ((nextCtx.inNavMain || nextCtx.inHeader || nextCtx.inMain) && !nextCtx.inFooter) {
        linksEditorial.push(linkObj);
      }
      if (isStaticAssetUrl(href)) {
        assets.push({ url: href, source: "a[href]" });
      }
    }

    if ((node.tag === "img" || node.tag === "source" || node.tag === "track") && node.attrs.src) {
      assets.push({ url: node.attrs.src.trim(), source: `${node.tag}[src]` });
    }
    if (node.tag === "video" && node.attrs.poster) {
      assets.push({ url: node.attrs.poster.trim(), source: "video[poster]" });
    }
    if (node.tag === "time" && node.attrs.datetime) {
      times.push(node.attrs.datetime.trim());
    }

    for (const child of node.children) walkLinksAndAssets(child, nextCtx);
  }

  walkLinksAndAssets(root, { inFooter: false, inHeader: false, inMain: false, inNavMain: false });

  if (metaMap["og:image"]) assets.push({ url: metaMap["og:image"].trim(), source: "meta[og:image]" });
  if (metaMap["twitter:image"]) assets.push({ url: metaMap["twitter:image"].trim(), source: "meta[twitter:image]" });

  // Breadcrumb nav
  const breadcrumbNav = findFirst(
    root,
    (n) => n.tag === "nav" && (n.attrs["aria-label"] || "").trim().toLowerCase() === "breadcrumb"
  );
  let breadcrumbs = null;
  if (breadcrumbNav) {
    const lis = findAll(breadcrumbNav, (n) => n.tag === "li");
    breadcrumbs = lis.map((li) => {
      const a = findFirst(li, (n) => n.tag === "a");
      const currentEl = findFirst(li, (n) => (n.attrs["aria-current"] || "").toLowerCase() === "page");
      return {
        text: extractVisibleText(li),
        href: a && a.attrs.href ? a.attrs.href.trim() : null,
        isCurrent: Boolean(currentEl || (li.attrs["aria-current"] || "").toLowerCase() === "page"),
      };
    });
  }

  // FAQ sections inside <main> (<section> or <div>/<article> with direct <h2> matching FAQ_INTENT_RE)
  const faqSections = [];
  if (mainNode) {
    function collectFaqBlocks(node) {
      if (!node || node.type !== "element" || isHiddenNode(node)) return;

      if (node.tag === "section") {
        const secId = node.attrs.id || "";
        const labelledBy = node.attrs["aria-labelledby"] || "";
        let labelHeadingText = "";
        if (labelledBy) {
          const labelEl = findFirst(node, (n) => n.attrs.id === labelledBy);
          if (labelEl) labelHeadingText = extractVisibleText(labelEl);
        }
        const firstH2 = findFirst(node, (n) => n.tag === "h2" && !isHiddenNode(n));
        const firstH2Text = firstH2 ? extractVisibleText(firstH2) : "";
        const firstP = findFirst(node, (n) => n.tag === "p" && !isHiddenNode(n));
        const firstPText = firstP ? extractVisibleText(firstP) : "";

        const isFaqSection =
          FAQ_INTENT_RE.test(secId) ||
          FAQ_INTENT_RE.test(labelledBy) ||
          FAQ_INTENT_RE.test(labelHeadingText) ||
          FAQ_INTENT_RE.test(firstH2Text) ||
          FAQ_INTENT_RE.test(firstPText);

        if (isFaqSection) {
          const items = extractFaqItemsFromSection(node);
          if (items.length > 0) {
            faqSections.push({ id: secId || labelledBy || "faq", items });
            return; // Avoid double-counting nested wrappers inside this FAQ <section>
          }
        }
      } else if (node.tag === "div" || node.tag === "article") {
        const directH2 = (node.children || []).find(
          (c) => c.type === "element" && c.tag === "h2" && !isHiddenNode(c)
        );
        const directH2Text = directH2 ? extractVisibleText(directH2) : "";
        if (directH2Text && FAQ_INTENT_RE.test(directH2Text)) {
          const items = extractFaqItemsFromSection(node);
          if (items.length > 0) {
            faqSections.push({
              id: node.attrs.id || node.attrs["aria-labelledby"] || "faq",
              items,
            });
            return; // Avoid double-counting nested wrappers inside this FAQ wrapper
          }
        }
      }

      for (const child of node.children || []) {
        collectFaqBlocks(child);
      }
    }

    collectFaqBlocks(mainNode);
  }

  const mainText = mainNode ? extractVisibleText(mainNode) : "";
  const mainTextNewlined = mainNode ? extractVisibleText(mainNode, { preserveNewlines: true }) : "";
  const mainLines = mainTextNewlined ? mainTextNewlined.split("\n").filter(Boolean) : [];
  const mainSubstantiveText = mainNode
    ? extractVisibleText(mainNode, { excludeNav: true, excludeCtaBand: true })
    : "";
  const mainSubstantiveWordCount = mainSubstantiveText
    ? mainSubstantiveText.split(/\s+/).filter(Boolean).length
    : 0;

  let leadParagraph = "";
  if (mainNode) {
    const paragraphs = findAll(mainNode, (n) => n.tag === "p" && !isHiddenNode(n));
    for (const p of paragraphs) {
      const t = extractVisibleText(p);
      if (t.length >= 40) {
        leadParagraph = t;
        break;
      }
    }
    if (!leadParagraph && paragraphs.length > 0) {
      leadParagraph = extractVisibleText(paragraphs[0]);
    }
  }

  return {
    routePath,
    canonicalOrigin,
    title,
    description: typeof metaMap.description === "string" ? metaMap.description : "",
    meta: metaMap,
    canonical,
    prefetchLinks,
    hasMain: Boolean(mainNode),
    headingsFull,
    headingsMain,
    jsonLdBlocks,
    jsonLdNodes,
    ids,
    linksAll,
    linksMain,
    linksEditorial,
    assets,
    times,
    breadcrumbs,
    faqSections,
    mainText,
    mainTextNewlined,
    mainLines,
    mainSubstantiveText,
    mainSubstantiveWordCount,
    leadParagraph,
  };
}

module.exports = {
  decodeEntities,
  normalizeForParity,
  parseHtml,
  extractVisibleText,
  extractVisibleLines,
  extractHeadings,
  flattenJsonLd,
  extractPage,
  isStaticAssetUrl,
  findFirst,
  findAll,
};
