import Link from "@/components/site/content-link";
import { Breadcrumbs, JsonLd, Prose, SiteShell } from "@/components/site/page-parts";
import type { Block, Post } from "@/lib/blog";
import { BinanceAttackPlayer } from "./binance-attack-player";
import styles from "./binance-explainer.module.css";

function renderBlock(block: Block, index: number) {
  if (block.type === "h2") return <h2 key={index}>{block.text}</h2>;
  if (block.type === "p") return <p key={index}>{block.text}</p>;
  if (block.type === "callout") return <p key={index} className={styles.reportCallout}>{block.text}</p>;
  const Tag = block.type === "ol" ? "ol" : "ul";
  return <Tag key={index}>{block.items.map((item) => <li key={item}>{item}</li>)}</Tag>;
}

export function BinanceExplainerPage({ article, articleJsonLd }: { article: Post; articleJsonLd: unknown }) {
  const sources = article.related.filter((link) => link.href.startsWith("https://"));
  const related = article.related.filter((link) => !link.href.startsWith("https://"));
  const path = `/blog/${article.slug}`;

  return (
    <SiteShell>
      <JsonLd data={articleJsonLd} />
      <div className={styles.page}>
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.frame}>
          <Breadcrumbs items={[{ name: "Blog", path: "/blog" }, { name: "Binance breach explainer", path }]} />
          <header className={styles.hero}>
            <div className={styles.heroRail}><span>BUGSNAPS / INCIDENT ATLAS</span><span>FIELD NOTE 001 — 31 OCT 2026</span></div>
            <div className={styles.heroGrid}>
              <div>
                <p className={styles.kicker}>BINANCE HACK 2026 · EXPLAINED IN PLAIN LANGUAGE</p>
                <h1>THE<br /><em>BINANCE</em><br />HACK<span className={styles.heroPeriod}>.</span></h1>
                <p className={styles.heroLead}>How did the Binance hack happen? Follow the reported Ethereum hot wallet attack and see how an EIP-7702 authorization pointed the wallet to attacker-controlled code.</p>
                <div className={styles.heroActions}>
                  <a href="#attack-explained" className={styles.primaryAction}>WATCH THE ATTACK UNFOLD <span aria-hidden="true">↓</span></a>
                  <a href="#full-report" className={styles.secondaryAction}>READ THE FULL REPORT <span aria-hidden="true">↗</span></a>
                </div>
              </div>
              <div className={styles.heroArt} aria-hidden="true">
                <div className={styles.orbitOne} /><div className={styles.orbitTwo} />
                <div className={styles.heroCoin}><span>?</span></div>
                <div className={styles.heroChip}>FOLLOW THE EVIDENCE<br /><strong>NOT THE RUMOUR</strong></div>
                <div className={styles.heroSpark}>✳</div>
              </div>
            </div>
            <div className={styles.heroFoot}><span>BY BUGSNAPS · {article.readingMinutes} MIN READ</span><span>INFORMATION AS OF 31 OCT 2026 · SUBJECT TO CHANGE</span></div>
          </header>

          <div className={styles.metricBand} aria-label="Key incident figures">
            <div><span>01 / REPORTED IMPACT</span><strong>~$6.3B</strong><p>Binance estimate</p></div>
            <div><span>02 / FROZEN ON-CHAIN</span><strong>~$3B</strong><p>Binance report; frozen is not returned</p></div>
            <div><span>03 / USER LOSSES</span><strong>PLEDGED</strong><p>Binance says it will cover losses</p></div>
          </div>

          <BinanceAttackPlayer />

          <section className={styles.quickAnswers} aria-labelledby="questions-heading">
            <div><p className={styles.kicker}>THE QUESTIONS BEHIND THE ANIMATION</p><h2 id="questions-heading">Binance hack and EIP-7702: your questions answered.</h2><p>Open a question for the plain-English answer.</p></div>
            <div className={styles.answerList}>
              <details><summary>How did the Binance hack use EIP-7702?</summary><p>On Ethereum, investigators found a signed authorization that delegated the Binance 14 hot wallet to attacker-controlled contract code. Later calls ran that code in the wallet’s context and moved assets. This describes one part of the incident; other chains were also affected.</p><a href="https://bitquery.io/investigations/binance-hack" target="_blank" rel="noopener noreferrer">Read the on-chain investigation ↗</a></details>
              <details><summary>Did they hide a virus inside a payment?</summary><p>The reported Ethereum mechanism used a signed permission attached to a special transaction. That permission pointed the wallet to a program already on the blockchain. A later call made the wallet run the program. This does not establish that a virus was hidden inside an ordinary payment.</p><a href="https://eips.ethereum.org/EIPS/eip-7702" target="_blank" rel="noopener noreferrer">Read the Ethereum specification ↗</a></details>
              <details><summary>Why would the blockchain accept that?</summary><p>Ethereum checks the signature and the authorization’s other requirements. A valid signature proves that the permission was signed for that wallet; it does not explain how the attacker got it or prove that Binance intended the action. That gap is part of the investigation.</p></details>
              <details><summary>Could receiving coins make my wallet run someone’s code?</summary><p>Receiving coins alone does not give the sender permission to set your wallet’s EIP-7702 delegation. The mechanism shown here requires a valid authorization for the affected wallet. Review unfamiliar signing requests carefully; a permission can do more than send a single payment.</p><a href="https://eips.ethereum.org/EIPS/eip-7702#security-considerations" target="_blank" rel="noopener noreferrer">Read the security considerations ↗</a></details>
              <details><summary>Does a valid signature mean the private key was stolen?</summary><p>It does not establish that. A signing process can potentially be misused without copying its key. Binance says it found no evidence of a wallet private-key leak. The full path from the intrusion to the signed authorizations remains unknown.</p><a href="https://www.binance.com/en/support/announcement/detail/d3306d9dca5243548c813b605e1d1751" target="_blank" rel="noopener noreferrer">Read Binance’s investigation update ↗</a></details>
            </div>
          </section>

          <section className={styles.truthSection} aria-labelledby="truth-heading">
            <div className={styles.truthIntro}><p className={styles.kicker}>BEFORE YOU SHARE A HEADLINE</p><h2 id="truth-heading">Keep three ideas separate.</h2></div>
            <div className={styles.truthGrid}>
              <div><span className={styles.truthIcon}>↗</span><h3>Assets moved</h3><p>The reported dollar figure describes cryptoassets leaving exchange wallets. It does not establish that every customer account was entered.</p></div>
              <div><span className={styles.truthIcon}>⊘</span><h3>Assets frozen</h3><p>Token issuers and partners can block movement of some assets. A frozen asset has not necessarily been recovered or returned.</p></div>
              <div><span className={styles.truthIcon}>✳</span><h3>Losses covered</h3><p>Binance pledged to cover user losses with SAFU and company funds. Completion of reimbursement has not been independently verified.</p></div>
            </div>
          </section>

          <section className={styles.actionSection} aria-labelledby="action-heading">
            <div><p className={styles.kicker}>IF YOU USE BINANCE</p><h2 id="action-heading">Your next move should be calm.</h2><p>Use official channels and your own account activity to decide what applies to you. Scammers often exploit the confusion after a major incident.</p></div>
            <ol>
              <li><span>01</span><p>Open the verified app or type Binance’s address yourself. Check its incident updates and your account activity.</p></li>
              <li><span>02</span><p>Ignore “recovery agents,” urgent transfer requests and support messages asking for codes or a recovery phrase.</p></li>
              <li><span>03</span><p>Review sessions, multifactor authentication and API keys. Contact official support about activity you do not recognize.</p></li>
            </ol>
          </section>

          <section id="full-report" className={styles.reportSection} aria-labelledby="report-heading">
            <div className={styles.reportHeading}><p className={styles.kicker}>THE COMPLETE EXPLAINER</p><h2 id="report-heading">Read the full report.</h2><p>Published <time dateTime={article.published}>{article.published}</time> · Updated as new verified information becomes available.</p></div>
            <article className={styles.reportCard}><Prose>{article.body.map(renderBlock)}</Prose></article>
          </section>

          <aside className={styles.sourceSection} aria-labelledby="sources-heading">
            <div><p className={styles.kicker}>CHECK THE RECORD</p><h2 id="sources-heading">Sources and further reading.</h2></div>
            <ul>{sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.label}<span aria-hidden="true">↗</span></a></li>)}
              {related.map((item) => <li key={item.href}><Link href={item.href}>{item.label}<span aria-hidden="true">↗</span></Link></li>)}
            </ul>
          </aside>
          <div className={styles.endNote}><span>END OF FIELD NOTE 001</span><Link href="/blog">← BACK TO THE BLOG</Link></div>
        </div>
      </div>
    </SiteShell>
  );
}
