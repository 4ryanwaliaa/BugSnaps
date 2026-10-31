import Link from "@/components/site/content-link";
import { Breadcrumbs, JsonLd, Prose, SiteShell } from "@/components/site/page-parts";
import type { Block, Post } from "@/lib/blog";
import { BinanceIncidentJourney } from "./binance-incident-journey";
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
                <p className={styles.kicker}>A CRYPTO INCIDENT, EXPLAINED IN PLAIN LANGUAGE</p>
                <h1>THE<br /><em>BINANCE</em><br />BREACH<span className={styles.heroPeriod}>.</span></h1>
                <p className={styles.heroLead}>A reported <strong>$6.3 billion</strong> impact. A still unfolding investigation. Explore the sequence, then separate what is known from what is still being checked.</p>
                <div className={styles.heroActions}>
                  <a href="#attack-explained" className={styles.primaryAction}>EXPLORE THE INCIDENT <span aria-hidden="true">↓</span></a>
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

          <section id="attack-explained" className={styles.attackSection} aria-labelledby="attack-heading">
            <div className={styles.attackIntro}>
              <p className={styles.kicker}>THE ATTACK, MADE SIMPLE</p>
              <h2 id="attack-heading">How did the money move?</h2>
              <p>Investigators have traced part of the attack on Ethereum. Think of it as an attacker getting a wallet to follow instructions from a program they controlled.</p>
            </div>
            <ol className={styles.attackSteps}>
              <li><span>01</span><div><h3>An opening inside Binance</h3><p>Binance initially said a compromised DevOps engineer’s laptop may have allowed access to a service container and unauthorized withdrawals. It later found additional breach points. How the attacker gained each access is still being investigated.</p><a href="https://www.binance.com/en/support/announcement/detail/d3306d9dca5243548c813b605e1d1751" target="_blank" rel="noopener noreferrer">Binance investigation update ↗</a></div></li>
              <li><span>02</span><div><h3>A program was already on Ethereum</h3><p>On-chain investigators describe an attacker-controlled smart contract: a program deployed on the blockchain. Its code could move assets when executed with the wallet’s authority.</p><a href="https://bitquery.io/investigations/binance-hack" target="_blank" rel="noopener noreferrer">See the on-chain investigation ↗</a></div></li>
              <li><span>03</span><div><h3>A signed instruction pointed to it</h3><p>Bitquery reports that the attacker’s wallet submitted a transaction with 50 signed EIP-7702 authorizations for a Binance wallet. Each was for a different wallet transaction count; one matched. It pointed the Binance wallet to the attacker’s contract. How the signatures were obtained remains unknown.</p><a href="https://bitquery.io/investigations/binance-hack" target="_blank" rel="noopener noreferrer">Read the transaction analysis ↗</a></div></li>
              <li><span>04</span><div><h3>Calls ran the program as the wallet</h3><p>Once delegated, calls to the wallet could execute the contract’s code in the wallet’s context. Investigators report that this was used to transfer ETH and tokens away. This describes an Ethereum part of the incident, not how every chain was affected.</p></div></li>
            </ol>
            <div className={styles.transactionExplainer}>
              <div><p className={styles.kicker}>WAIT — WAS THE CODE INSIDE THE TRANSACTION?</p><h3>It pointed to code already deployed.</h3><p>The transaction carried a signed authorization referring to the contract’s address. The contract contained the instructions; later calls caused those instructions to run using the wallet’s authority.</p></div>
              <div className={styles.transactionFlow} aria-label="Illustration: signed authorization points the wallet to an existing contract; calls then run the contract code in the wallet context">
                <div><span>1 / AUTHORIZATION</span><strong>Wallet → contract address</strong><small>Signed permission points to the program</small></div>
                <span className={styles.flowArrow} aria-hidden="true">↓</span>
                <div><span>2 / EXECUTION</span><strong>Call → wallet runs code</strong><small>Contract instructions act in the wallet’s context</small></div>
                <span className={styles.flowArrow} aria-hidden="true">↓</span>
                <div><span>3 / RESULT</span><strong>Assets move out</strong><small>ETH and tokens transferred on Ethereum</small></div>
              </div>
              <p className={styles.attackCaveat}><strong>Still unknown:</strong> the exact entry path and how the authorization was obtained. Binance says it found no evidence of a wallet private-key leak; a valid signature alone does not tell us whether a key was copied or a signing process was misused. <a href="https://eips.ethereum.org/EIPS/eip-7702" target="_blank" rel="noopener noreferrer">How EIP-7702 works ↗</a></p>
            </div>
          </section>

          <BinanceIncidentJourney />

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
