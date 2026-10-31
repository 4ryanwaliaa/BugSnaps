"use client";

import { useState } from "react";
import styles from "./binance-explainer.module.css";

const scenes = [
  {
    number: "01", label: "The signal", time: "29 OCT · 20:05 UTC", eyebrow: "Observed on-chain",
    title: "Assets begin leaving exchange wallets.",
    body: "Elliptic traced the first reported wave to five XRP Ledger wallets. Transfers from Binance hot wallets on other chains followed. Its estimate is $6.43 billion; Binance puts the impact at about $6.3 billion.",
    note: "These are estimates of cryptoassets moved, not a count of customer accounts accessed.",
    tone: "observed", pulse: "transfer",
  },
  {
    number: "02", label: "The access", time: "30 OCT · INVESTIGATION", eyebrow: "Initial finding",
    title: "A laptop was one possible entry point.",
    body: "Binance initially pointed to a compromised DevOps engineer's laptop. A later update described additional points of breach. The complete attack path has not been published.",
    note: "Binance says it has found no evidence that wallet private keys leaked. That does not explain every unauthorized transfer.",
    tone: "developing", pulse: "access",
  },
  {
    number: "03", label: "The freeze", time: "30 OCT · RESPONSE", eyebrow: "Company report",
    title: "Some funds were frozen. That is not recovery.",
    body: "Binance reported roughly $3 billion frozen with help from blockchain partners. A freeze can stop certain tokens from moving; it does not mean those funds have already been returned.",
    note: "The amount frozen can change as investigators trace more transfers.",
    tone: "reported", pulse: "freeze",
  },
  {
    number: "04", label: "The promise", time: "30 OCT · NEXT STEPS", eyebrow: "Company commitment",
    title: "Binance pledged to cover user losses.",
    body: "The exchange says it will use its SAFU fund and corporate resources. This is a stated commitment, not independent confirmation that every affected user has already been reimbursed.",
    note: "Check Binance's official channels for the latest service status and account-specific instructions.",
    tone: "reported", pulse: "response",
  },
] as const;

function Guide({ active }: { active: number }) {
  return (
    <div className={styles.guide} aria-hidden="true">
      <div className={styles.guideHalo} />
      <div className={styles.guideBody}>
        <span className={styles.guideAntenna} />
        <span className={styles.guideFace}>
          <i className={styles.guideEye} /><i className={styles.guideEye} />
          <i className={styles.guideMouth} />
        </span>
        <span className={styles.guideBadge}>{String(active + 1).padStart(2, "0")}</span>
      </div>
      <span className={styles.guideShadow} />
    </div>
  );
}

export function BinanceIncidentJourney() {
  const [active, setActive] = useState(0);
  const scene = scenes[active];

  return (
    <section id="reconstruction" className={styles.journey} aria-labelledby="journey-heading">
      <div className={styles.journeyHeading}>
        <div>
          <p className={styles.kicker}>AN INTERACTIVE RECONSTRUCTION · 4 CLUES</p>
          <h2 id="journey-heading">Follow the trail.</h2>
          <p>Choose a clue to see what was observed, what Binance reported, and what remains uncertain.</p>
        </div>
        <p className={styles.journeyHint}>Guided by Pip <span aria-hidden="true">↘</span></p>
      </div>
      <div className={styles.journeyLayout}>
        <div className={styles.sceneBoard} data-pulse={scene.pulse}>
          <div className={styles.boardTop}><span>CASE FILE / BN–1029</span><span>ILLUSTRATIVE FLOW</span></div>
          <div className={styles.boardDiagram} aria-hidden="true">
            <div className={`${styles.boardNode} ${styles.nodePerson}`}><span>ACCESS</span></div>
            <div className={`${styles.boardNode} ${styles.nodeSystem}`}><span>EXCHANGE</span></div>
            <div className={`${styles.boardNode} ${styles.nodeAssets}`}><span>ASSETS</span></div>
            <div className={`${styles.boardNode} ${styles.nodeResponse}`}><span>RESPONSE</span></div>
            <div className={styles.boardWire} />
            <div className={styles.boardWireTwo} />
          </div>
          <div className={styles.boardBottom}>
            <Guide active={active} />
            <p><span>PIP SAYS</span>{scene.note}</p>
          </div>
        </div>
        <div className={styles.scenePanel}>
          <div className={styles.sceneTabs} role="group" aria-label="Incident clues">
            {scenes.map((item, index) => (
              <button type="button" key={item.number} aria-pressed={active === index} onClick={() => setActive(index)} className={active === index ? styles.sceneTabActive : styles.sceneTab}>
                <span>{item.number}</span>{item.label}
              </button>
            ))}
          </div>
          <div className={styles.sceneText} aria-live="polite" key={scene.number}>
            <div className={styles.sceneMeta}><span>{scene.time}</span><span data-tone={scene.tone}>{scene.eyebrow}</span></div>
            <h3>{scene.title}</h3>
            <p>{scene.body}</p>
          </div>
          <div className={styles.sceneControls}>
            <span>{String(active + 1).padStart(2, "0")} / 04</span>
            <button type="button" onClick={() => setActive((active + 1) % scenes.length)} aria-label={active === 3 ? "Return to first clue" : "Show next clue"}>
              {active === 3 ? "START AGAIN" : "NEXT CLUE"} <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </div>
      <p className={styles.illustrationNote}>The diagram explains the reported sequence. It is not a forensic map of Binance infrastructure.</p>
    </section>
  );
}
