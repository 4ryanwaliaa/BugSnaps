"use strict";

const { decodeEntities } = require("./html-parser.cjs");

function extractXmlTagText(raw) {
  if (!raw || typeof raw !== "string") return "";
  const parts = [];
  let idx = 0;
  while (idx < raw.length) {
    const start = raw.indexOf("<![CDATA[", idx);
    if (start === -1) {
      parts.push(decodeEntities(raw.slice(idx)));
      break;
    }
    if (start > idx) {
      parts.push(decodeEntities(raw.slice(idx, start)));
    }
    const end = raw.indexOf("]]>", start + 9);
    if (end === -1) {
      // Leave unclosed CDATA intact so callers detect malformed XML/URL
      parts.push(raw.slice(start));
      break;
    }
    parts.push(raw.slice(start + 9, end));
    idx = end + 3;
  }
  return parts.join("").trim();
}

function parseSitemapXml(xmlText) {
  const entries = [];
  const errors = [];
  if (!xmlText || typeof xmlText !== "string") {
    return { entries, isUrlset: false, errors: ["Empty sitemap body"] };
  }

  const cleanedXml = xmlText.replace(/<!--[\s\S]*?-->/g, "");
  const isUrlset = /<urlset\b/i.test(cleanedXml);
  if (!isUrlset) {
    errors.push("Missing <urlset> root element");
  }

  for (const match of cleanedXml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)) {
    const block = match[1];
    const locMatch = block.match(/<loc\b[^>]*>([\s\S]*?)<\/loc>/i);
    const lastmodMatch = block.match(/<lastmod\b[^>]*>([\s\S]*?)<\/lastmod>/i);
    const loc = locMatch ? extractXmlTagText(locMatch[1]) : "";
    const lastmod = lastmodMatch ? extractXmlTagText(lastmodMatch[1]) : null;
    if (!loc) {
      errors.push("Sitemap <url> block missing <loc>");
      continue;
    }
    entries.push({ loc, lastmod });
  }

  return { entries, isUrlset, errors };
}

function parseRobotsTxt(text) {
  const groups = [];
  const sitemaps = [];
  if (!text || typeof text !== "string") {
    return { groups, sitemaps };
  }

  let currentGroup = { agents: [], rules: [] };
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;

    const sitemapMatch = line.match(/^sitemap:\s*(\S.*)$/i);
    if (sitemapMatch) {
      sitemaps.push(sitemapMatch[1].trim());
      continue;
    }

    const directiveMatch = line.match(/^(user-agent|allow|disallow):\s*(.*)$/i);
    if (!directiveMatch) continue;

    const key = directiveMatch[1].toLowerCase();
    const value = directiveMatch[2].trim();

    if (key === "user-agent") {
      if (currentGroup.rules.length > 0) {
        groups.push(currentGroup);
        currentGroup = { agents: [], rules: [] };
      }
      currentGroup.agents.push(value.toLowerCase());
    } else if (currentGroup.agents.length > 0) {
      currentGroup.rules.push({ key, value });
    }
  }
  if (currentGroup.agents.length > 0) {
    groups.push(currentGroup);
  }

  return { groups, sitemaps };
}

function getRulesForAgent(parsedRobots, agentName) {
  const lower = String(agentName || "").toLowerCase();
  const matching = parsedRobots.groups.filter((g) => g.agents.includes(lower));
  return matching.flatMap((g) => g.rules);
}

function parseLlmsTxt(text) {
  const links = [];
  const sitemaps = [];
  if (!text || typeof text !== "string") {
    return { links, sitemaps };
  }

  for (const m of text.matchAll(/\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g)) {
    links.push({ label: m[1].trim(), url: m[2].trim() });
  }
  // Fallback for bare ](https://...) if brackets were split across lines
  if (links.length === 0) {
    for (const m of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
      links.push({ label: "", url: m[1].trim() });
    }
  }

  for (const m of text.matchAll(/^Sitemap:\s*(\S+)/gim)) {
    sitemaps.push(m[1].trim());
  }

  return { links, sitemaps };
}

module.exports = {
  parseSitemapXml,
  parseRobotsTxt,
  getRulesForAgent,
  parseLlmsTxt,
};
