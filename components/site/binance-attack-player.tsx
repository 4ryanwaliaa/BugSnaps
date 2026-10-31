"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Braces, Check, FileSignature, Laptop, Pause, Play, RotateCcw, ShieldCheck, Wallet } from "lucide-react";
import styles from "./binance-attack-player.module.css";

const companySource = "https://www.binance.com/en/support/announcement/detail/d3306d9dca5243548c813b605e1d1751";
const chainSource = "https://bitquery.io/investigations/binance-hack";

const steps = [
  {
    tab: "The opening", label: "Company report · investigation ongoing", title: "First, access was compromised.",
    description: "Binance initially suspected an employee laptop, then found other breach points. The exact route into its systems — and how the attacker obtained the wallet’s signatures — is still unknown.",
    takeaway: "The missing piece is how the attacker reached the authority needed to sign.",
    left: "Employee laptop", leftNote: "Initially suspected", right: "Binance systems", rightNote: "Additional breach points found", connector: "Exact route unknown", iconLeft: "laptop", iconRight: "wallet", source: companySource, sourceLabel: "Binance’s investigation update",
  },
  {
    tab: "The program", label: "Ethereum · on-chain reconstruction", title: "The attacker had a program on Ethereum.",
    description: "A smart contract is a program stored on the blockchain. Investigators identified an attacker-controlled contract whose instructions could move assets when run with the wallet’s authority.",
    takeaway: "Putting a program on Ethereum alone does not give it access to someone else’s wallet.",
    left: "Attacker", leftNote: "Controls the program", right: "Smart contract", rightNote: "Code stored on Ethereum", connector: "Program deployed", iconLeft: "laptop", iconRight: "code", source: chainSource, sourceLabel: "Bitquery’s on-chain investigation",
  },
  {
    tab: "The permission", label: "Ethereum · authorization transaction", title: "A signed permission connected the wallet to that code.",
    description: "The attacker’s wallet submitted a special transaction. Bitquery found 50 signed authorizations for different wallet transaction counts; one matched. It told the Binance wallet which contract’s code to use.",
    takeaway: "The transaction carried a signed pointer to the program. The program was already on the blockchain.",
    left: "Attacker’s wallet", leftNote: "Submits the transaction", right: "Binance wallet", rightNote: "Now points to the contract", connector: "Signed authorization", iconLeft: "wallet", iconRight: "wallet", source: chainSource, sourceLabel: "Read the transaction analysis",
  },
  {
    tab: "The trigger", label: "Ethereum · a later transaction", title: "A later call made the wallet run the program.",
    description: "The attacker then called the Binance wallet. Because the permission was active, Ethereum loaded the referenced contract’s instructions and ran them as that wallet.",
    takeaway: "The contract supplied the instructions. The Binance wallet supplied the authority and assets.",
    left: "Attacker", leftNote: "Sends a later call", right: "Binance wallet", rightNote: "Runs the referenced code", connector: "Call the wallet", iconLeft: "laptop", iconRight: "wallet", source: chainSource, sourceLabel: "See the observed execution",
  },
  {
    tab: "The transfer", label: "Ethereum · observed asset movement", title: "The code moved assets out of the wallet.",
    description: "Investigators traced ETH and tokens leaving the Binance wallet through that execution. The assets came from the wallet; they were not money held by the code’s separate contract address.",
    takeaway: "This explains one Ethereum part of the incident. Other blockchains were also affected through different transfers.",
    left: "Binance wallet", leftNote: "Assets leave this wallet", right: "Attacker’s recipient", rightNote: "Receives ETH and tokens", connector: "ETH + tokens", iconLeft: "wallet", iconRight: "wallet", source: chainSource, sourceLabel: "Follow the asset transfers",
  },
  {
    tab: "The stop", label: "Ethereum · response", title: "The permission had to be revoked.",
    description: "A delegation stays in place until it is changed or cleared. Bitquery reports that Binance later removed it. Pausing withdrawals on the exchange did not, by itself, cancel this on-chain permission.",
    takeaway: "Stopping an exchange service and removing a blockchain permission are two separate actions.",
    left: "Binance wallet", leftNote: "Delegation cleared", right: "Attacker’s contract", rightNote: "No longer delegated by this wallet", connector: "Connection removed", iconLeft: "shield", iconRight: "code", source: chainSource, sourceLabel: "Read the response timeline",
  },
] as const;

type IconName = "laptop" | "wallet" | "code" | "shield";

function ActorIcon({ name }: { name: IconName }) {
  const Icon = name === "laptop" ? Laptop : name === "wallet" ? Wallet : name === "code" ? Braces : ShieldCheck;
  return <Icon size={46} strokeWidth={1.5} aria-hidden="true" />;
}

function Connection({ step }: { step: number }) {
  return (
    <div className={styles.connection} aria-hidden="true">
      <svg viewBox="0 0 240 70" className={styles.wire}>
        <path d="M 8 35 H 222" className={styles.track} />
        {step === 0 ? <text x="120" y="44" textAnchor="middle" className={styles.question}>?</text> : step === 5 ? <g className={styles.cut}><path d="m108 23 24 24m0-24-24 24" /></g> : <>
          <path d="m212 25 12 10-12 10" className={styles.arrowhead} />
          <rect x="12" y="27" width="18" height="16" rx="4" className={styles.packet} />
          {step === 4 && <rect x="12" y="27" width="18" height="16" rx="8" className={`${styles.packet} ${styles.packetTwo}`} />}
        </>}
      </svg>
      <span>{steps[step].connector}</span>
    </div>
  );
}

function SceneDetail({ step }: { step: number }) {
  if (step === 2) return (
    <div className={styles.envelope}>
      <div className={styles.envelopeTitle}><FileSignature size={19} aria-hidden="true" /><strong>Inside the authorization transaction</strong><span>Simplified</span></div>
      <dl>
        <div><dt>Submitted by</dt><dd>Attacker’s wallet</dd></div>
        <div><dt>Permission signed for</dt><dd>Binance wallet</dd></div>
        <div><dt>Points to</dt><dd>Existing contract address <span className={styles.symbolic}>[program address]</span></dd></div>
        <div><dt>Wallet count check</dt><dd><Check size={15} aria-hidden="true" /> One authorization matched</dd></div>
      </dl>
      <p>How those signatures were obtained remains unknown. This illustration contains no real transaction payload.</p>
    </div>
  );
  if (step === 3) return (
    <div className={styles.executionDetail}>
      <span className={styles.codeChip}><Braces size={21} aria-hidden="true" /> Existing contract</span>
      <span className={styles.readArrow} aria-hidden="true">→</span>
      <div><strong>Instructions execute as the Binance wallet</strong><p>The code is read from the contract, but it acts in the wallet’s context.</p></div>
    </div>
  );
  if (step === 4) return (
    <div className={styles.assetDetail}><span className={styles.token}>Ξ</span><span className={`${styles.token} ${styles.tokenAlt}`}>$</span><div><strong>ETH and tokens</strong><p>These transfers are part of the total incident, not the entire reported $6.3 billion.</p></div></div>
  );
  if (step === 5) return (
    <div className={styles.stopDetail}><ShieldCheck size={28} aria-hidden="true" /><div><strong>The wallet no longer points to that contract.</strong><p>Revoking permission stops this route. It does not reverse completed transfers.</p></div></div>
  );
  return (
    <div className={styles.detailNote}><span>{step === 0 ? "UNRESOLVED" : "THE KEY DISTINCTION"}</span><p>{step === 0 ? "The public blockchain can show valid signatures and transfers. It cannot show exactly who requested a signature inside Binance’s systems." : "A contract is like a set of instructions. The next step is what gave those instructions power to act as the Binance wallet."}</p></div>
  );
}

export function BinanceAttackPlayer() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const step = steps[active];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    const pauseWhenHidden = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => { media.removeEventListener("change", updateMotion); document.removeEventListener("visibilitychange", pauseWhenHidden); };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (active === steps.length - 1) setPlaying(false);
      else setActive(active + 1);
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [active, playing]);

  function selectStep(index: number) {
    setPlaying(false);
    setActive(index);
  }

  function togglePlay() {
    if (!playing && active === steps.length - 1) setActive(0);
    setPlaying(!playing);
  }

  return (
    <section id="attack-explained" className={styles.section} aria-labelledby="attack-player-title">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>WATCH THE EXPLANATION</p>
        <h2 id="attack-player-title">How a permission<br /> became a way in.</h2>
        <p>Follow the Ethereum part of the attack, one move at a time. Press play or choose a step to go at your own pace.</p>
      </div>
      <div className={styles.player} data-playing={playing} data-reduced-motion={reducedMotion}>
        <div className={styles.playerTop}><span>THE BINANCE INCIDENT / SIX STEPS</span><span>ILLUSTRATED RECONSTRUCTION</span></div>
        <div className={styles.controls}>
          <button type="button" className={styles.playButton} onClick={togglePlay} aria-label={playing ? "Pause walkthrough" : active === steps.length - 1 ? "Replay walkthrough" : "Play walkthrough"}>
            {playing ? <Pause size={18} aria-hidden="true" /> : active === steps.length - 1 ? <RotateCcw size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            {playing ? "Pause" : active === steps.length - 1 ? "Replay" : "Play the story"}
          </button>
          <span className={styles.counter}>{String(active + 1).padStart(2, "0")} <span>/ 06</span></span>
          <div className={styles.arrows}>
            <button type="button" disabled={active === 0} onClick={() => selectStep(active - 1)} aria-label="Previous step"><ArrowLeft size={18} aria-hidden="true" /><span>Back</span></button>
            <button type="button" disabled={active === steps.length - 1} onClick={() => selectStep(active + 1)} aria-label="Next step"><span>Next</span><ArrowRight size={18} aria-hidden="true" /></button>
          </div>
        </div>
        <div className={styles.steps} role="group" aria-label="Choose an attack step">
          {steps.map((item, index) => <button type="button" key={item.tab} aria-pressed={index === active} onClick={() => selectStep(index)} className={index === active ? styles.selectedStep : undefined}><span>{String(index + 1).padStart(2, "0")}</span>{item.tab}</button>)}
        </div>
        <div className={styles.scene} key={active} data-step={active}>
          <div className={styles.sceneLabel}><span className={styles.signal} />{step.label}</div>
          <div className={styles.diagram} aria-label={`${step.left}. ${step.connector}. ${step.right}.`}>
            <div className={styles.actor}><div className={styles.iconPlate}><ActorIcon name={step.iconLeft} /></div><strong>{step.left}</strong><small>{step.leftNote}</small></div>
            <Connection step={active} />
            <div className={`${styles.actor} ${styles.destination}`}><div className={styles.iconPlate}><ActorIcon name={step.iconRight} /></div><strong>{step.right}</strong><small>{step.rightNote}</small></div>
          </div>
          <SceneDetail step={active} />
        </div>
        <div className={styles.narration}>
          <div aria-live={playing ? "off" : "polite"} aria-atomic="true"><p className={styles.stepEyebrow}>STEP {active + 1} OF 6</p><h3>{step.title}</h3><p>{step.description}</p></div>
          <div className={styles.takeaway}><span>REMEMBER THIS</span><p>{step.takeaway}</p><a href={step.source} target="_blank" rel="noopener noreferrer">{step.sourceLabel} ↗</a></div>
        </div>
        <div className={styles.progress} aria-hidden="true"><span key={`${active}-${playing}`} className={playing ? styles.progressRunning : undefined} /></div>
      </div>
      <p className={styles.caption}>Educational animation, not a live feed or a complete forensic map. The Ethereum sequence follows Bitquery’s investigation; the initial access remains under investigation. <a href="https://eips.ethereum.org/EIPS/eip-7702" target="_blank" rel="noopener noreferrer">Read the EIP-7702 specification ↗</a></p>
    </section>
  );
}
