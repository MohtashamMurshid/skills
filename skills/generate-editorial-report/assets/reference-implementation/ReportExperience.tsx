"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Mail, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const spreadLabels = [
  "Cover",
  "Preface",
  "Operations",
  "getdesign",
  "Citysage",
  "Instruments",
  "Register",
  "Inventory",
  "Field notes",
  "Colophon",
];

const skills = [
  ["Languages", "TypeScript, JavaScript, Python, Java, C/C++, Kotlin"],
  ["Web systems", "React, Next.js, Node.js, Express, Django, FastAPI"],
  ["Operations", "Git, Docker, AWS, PostgreSQL, Firebase, Cloudflare"],
  ["Intelligence", "PyTorch, TensorFlow, OpenAI, Hugging Face, agents"],
];

type ReportExperienceProps = {
  npmDownloadText: string;
};

export default function ReportExperience({ npmDownloadText }: ReportExperienceProps) {
  const railRef = useRef<HTMLElement>(null);
  const [activeSpread, setActiveSpread] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const reduceMotion = useReducedMotion();

  const playPageSound = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(132, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(82, context.currentTime + 0.09);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.11);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
    oscillator.addEventListener("ended", () => void context.close());
  }, [soundEnabled]);

  const goTo = useCallback(
    (index: number) => {
      const next = Math.min(spreadLabels.length - 1, Math.max(0, index));
      const rail = railRef.current;
      if (!rail) return;
      const desktop = window.matchMedia("(min-width: 900px)").matches;
      rail.children[next]?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        inline: desktop ? "start" : "nearest",
        block: desktop ? "nearest" : "start",
      });
      playPageSound();
    },
    [playPageSound, reduceMotion],
  );

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const sections = Array.from(rail.querySelectorAll<HTMLElement>("[data-spread]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSpread(Number((visible.target as HTMLElement).dataset.spread));
      },
      { root: rail, threshold: [0.45, 0.7] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") goTo(activeSpread + 1);
      if (event.key === "ArrowLeft" || event.key === "PageUp") goTo(activeSpread - 1);
      if (event.key === "Home") goTo(0);
      if (event.key === "End") goTo(spreadLabels.length - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSpread, goTo]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const redirectVerticalWheel = (event: WheelEvent) => {
      if (!window.matchMedia("(min-width: 900px)").matches) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      rail.scrollLeft += event.deltaY;
    };

    rail.addEventListener("wheel", redirectVerticalWheel, { passive: false });
    return () => rail.removeEventListener("wheel", redirectVerticalWheel);
  }, []);

  const reveal = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { amount: 0.45, once: false },
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <main className="report-shell">
      <a className="report-skip" href="#report-spread-1">Skip cover</a>

      <header className="report-chrome" aria-label="Report navigation">
        <button className="report-mark" onClick={() => goTo(0)} aria-label="Return to cover">
          OII <span>/ FR–01</span>
        </button>
        <div className="report-chrome-center" aria-live="polite">
          <span>{String(activeSpread + 1).padStart(2, "0")}</span>
          <span className="report-chrome-rule" />
          <span>{spreadLabels[activeSpread]}</span>
        </div>
        <div className="report-chrome-actions">
          <Link href="/gallery">Archive</Link>
          <button
            onClick={() => setSoundEnabled((enabled) => !enabled)}
            aria-label={soundEnabled ? "Turn sound off" : "Turn sound on"}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
          </button>
        </div>
      </header>

      <nav className="report-progress" aria-label="Report pages">
        {spreadLabels.map((label, index) => (
          <button
            key={label}
            className={index === activeSpread ? "is-active" : ""}
            onClick={() => goTo(index)}
            aria-label={`Go to page ${index + 1}: ${label}`}
            aria-current={index === activeSpread ? "page" : undefined}
          />
        ))}
      </nav>

      <section ref={railRef} className="report-rail" aria-label="Field report">
        <article className="report-spread report-cover" data-spread="0" id="report-spread-0">
          <Image
            src="/report/cover-observatory.png"
            alt="A tiny surveyor observes an enormous mechanical bird observatory in a faded landscape."
            fill
            priority
            sizes="100vw"
            className="report-cover-image"
          />
          <div className="report-cover-wash" />
          <div className="report-cover-copy">
            <p className="report-kicker">The field office of Mohtasham Murshid Madani</p>
            <h1>The Office of<br />Imaginary Infrastructure</h1>
            <div className="report-cover-author">
              <span>Written, built and observed by</span>
              <strong>Mohtasham<br />Murshid Madani</strong>
              <small>Software · artificial intelligence · design</small>
            </div>
            <div className="report-cover-bottom">
              <p>Field Report <span>№ 01</span></p>
              <p>Mohtasham.dev<br />Kuala Lumpur<br />2026</p>
            </div>
          </div>
          <button className="report-enter" onClick={() => goTo(1)}>
            Open report <ArrowRight aria-hidden="true" />
          </button>
        </article>

        <article className="report-spread report-paper report-preface" data-spread="1" id="report-spread-1">
          <motion.div className="report-preface-grid" {...reveal}>
            <figure className="report-portrait">
              <Image
                src="/report/director-mohtasham.png"
                alt="Archival black-and-white portrait of Mohtasham Murshid Madani holding flowers and a rolled document."
                fill
                sizes="(max-width: 899px) 80vw, 31vw"
                className="report-portrait-image"
              />
              <figcaption>Mohtasham Murshid Madani / Director</figcaption>
            </figure>
            <div className="report-letter">
              <p className="report-kicker">Memorandum from the director</p>
              <h2>A report on work that prefers becoming to being finished.</h2>
              <div className="report-columns">
                <p>
                  The Office constructs software, studies intelligent systems, and records evidence of beautiful accidents. Its mandate is deliberately broad: build useful instruments, keep curiosity operational, and leave every system more legible than it was found.
                </p>
                <p>
                  This first report gathers active operations, released tools, visual records, and matters still under observation. It is authored by Mohtasham Murshid Madani—software engineer, AI researcher, founder, and custodian of the Office.
                </p>
              </div>
              <p className="report-signature">Mohtasham</p>
              <p className="report-caption">Director, Office of Imaginary Infrastructure</p>
            </div>
          </motion.div>
          <Folio number="02" label="Preface" />
        </article>

        <article className="report-spread report-paper report-operations" data-spread="2" id="report-spread-2">
          <motion.div className="report-page-heading" {...reveal}>
            <p className="report-kicker">Division I / Current operations</p>
            <h2>Two systems remain<br />under active observation.</h2>
          </motion.div>
          <motion.div className="report-operation-list" {...reveal}>
            <ProjectRow index="01" name="getdesign" role="Founder" text="On-demand design systems from any URL, delivered through the web, API, CLI, and a portable agent." href="/work/getdesign" />
            <ProjectRow index="02" name="Citysage" role="AI Engineer" text="Intelligent software considered at the scale and complexity of a city." href="/work/citysage" />
          </motion.div>
          <motion.figure className="report-bird-flight" {...reveal}>
            <Image src="/report/courier-birds-cutout.png" alt="Engraved mechanical courier birds carrying small data capsules." fill sizes="(max-width: 899px) 100vw, 38vw" />
            <figcaption>Plate 01. Dispatches moving between active divisions.</figcaption>
          </motion.figure>
          <Folio number="03" label="Operations" />
        </article>

        <article className="report-spread report-paper report-getdesign" data-spread="3" id="report-spread-3">
          <motion.div className="report-dossier-copy" {...reveal}>
            <p className="report-kicker">Primary instrument / OI–01</p>
            <h2>getdesign</h2>
            <p className="report-deck">A portable memory for visual systems.</p>
            <p>
              Given a URL, getdesign observes the language of an interface and returns a design system that can travel. The work treats visual consistency as infrastructure rather than decoration.
            </p>
            <Link className="report-text-link" href="/work/getdesign">
              Open full dossier <ArrowUpRight aria-hidden="true" />
            </Link>
          </motion.div>
          <motion.div className="report-evidence-card" {...reveal}>
            <div className="report-evidence-top"><span>getdesign.app</span><span>ACTIVE / 2026</span></div>
            <div className="report-evidence-body">
              <Image
                src="/report/getdesign-interface.png"
                alt="The public getdesign interface showing its design-system extraction workflow."
                fill
                sizes="48vw"
                className="report-ui-shot"
              />
            </div>
            <div className="report-evidence-footer"><span>WEB</span><span>API</span><span>CLI</span><span>AGENT</span></div>
          </motion.div>
          <motion.figure className="report-drafting-figure" {...reveal}>
            <Image src="/report/drafting-bird-cutout.png" alt="An engraved mechanical bird drafts an interface from cards, rulers, gears, and thread." fill sizes="(max-width: 899px) 100vw, 40vw" />
          </motion.figure>
          <Folio number="04" label="getdesign" />
        </article>

        <article className="report-spread report-paper report-citysage" data-spread="4" id="report-spread-4">
          <motion.div className="report-city-grid" {...reveal}>
            <div>
              <p className="report-kicker">Civic-scale inquiry / OI–02</p>
              <h2>Citysage</h2>
              <p className="report-deck">What becomes visible when intelligence is considered at the scale of a city?</p>
              <p className="report-body-copy">
                The Office contributes AI engineering to Citysage: practical systems intended to make complex urban environments more legible, responsive, and useful.
              </p>
              <Link className="report-text-link" href="/work/citysage">Open full dossier <ArrowUpRight aria-hidden="true" /></Link>
              <figure className="report-city-proof">
                <Image
                  src="/report/citysage-interface.png"
                  alt="The public Citysage urban intelligence assistant interface."
                  fill
                  sizes="(max-width: 899px) 90vw, 34vw"
                  className="report-ui-shot"
                />
                <figcaption>Public interface / Citysage</figcaption>
              </figure>
            </div>
            <figure className="report-root-figure">
              <Image src="/report/root-server.png" alt="An engraved server cabinet grows roots into layers of earth while cables sprout like branches." fill sizes="(max-width: 899px) 80vw, 35vw" />
              <figcaption>Plate 02. Infrastructure must take root before it becomes visible.</figcaption>
            </figure>
          </motion.div>
          <Folio number="05" label="Citysage" />
        </article>

        <article className="report-spread report-paper report-instruments" data-spread="5" id="report-spread-5">
          <motion.div className="report-page-heading compact" {...reveal}>
            <p className="report-kicker">Division II / Instruments released</p>
            <h2>Small machines for<br />crossing difficult boundaries.</h2>
          </motion.div>
          <motion.div className="report-instrument-grid" {...reveal}>
            <InstrumentCard number="03" title="Markdown to Docx" descriptor={npmDownloadText} text="Plain text enters. An editable document leaves." href="/work/markdown-to-docx" />
            <InstrumentCard number="04" title="Eikon Studio" descriptor="Open-source image harness" text="Persistent generations, history, skills, and file tagging for agents." href="/work/eikon-studio" />
          </motion.div>
          <div className="report-specimen-lines" aria-hidden="true"><span /><span /><span /><span /></div>
          <Folio number="06" label="Instruments" />
        </article>

        <article className="report-spread report-paper report-register" data-spread="6" id="report-spread-6">
          <motion.div className="report-register-grid" {...reveal}>
            <div className="report-register-heading">
              <p className="report-kicker">Selected public works</p>
              <h2>Register of<br />open mechanisms</h2>
              <p>Maintained in public, inspected by strangers, altered through use.</p>
            </div>
            <div className="report-ledger">
              <LedgerRow year="2026" title="getdesign" meta="Design systems / active" href="https://getdesign.app" />
              <LedgerRow year="2026" title="Eikon Studio" meta="Agent tooling / active" href="https://eikonstudio.xyz" />
              <LedgerRow year="2025" title="Markdown to Docx" meta="Document conversion / npm" href="https://npmjs.com/package/@mohtasham/md-to-docx" />
              <LedgerRow year="∞" title="GitHub Archive" meta="Repositories / experiments" href="https://github.com/mohtashammurshid" />
            </div>
          </motion.div>
          <motion.figure className="report-register-birds" {...reveal}>
            <Image src="/report/courier-birds-cutout.png" alt="Mechanical courier birds moving through an archival register." fill sizes="(max-width: 899px) 100vw, 58vw" />
          </motion.figure>
          <Folio number="07" label="Register" />
        </article>

        <article className="report-spread report-paper report-inventory" data-spread="7" id="report-spread-7">
          <motion.div className="report-page-heading compact" {...reveal}>
            <p className="report-kicker">Equipment and capabilities</p>
            <h2>Inventory of working knowledge</h2>
          </motion.div>
          <motion.div className="report-inventory-table" {...reveal}>
            <div className="report-table-head"><span>Department</span><span>Instruments currently in service</span><span>Condition</span></div>
            {skills.map(([category, list], index) => (
              <div className="report-table-row" key={category}>
                <span>{String(index + 1).padStart(2, "0")} / {category}</span>
                <span>{list}</span>
                <span>Operational</span>
              </div>
            ))}
          </motion.div>
          <motion.blockquote className="report-inventory-quote" {...reveal}>
            “Tools are kept not as trophies, but as permissions to attempt stranger work.”
          </motion.blockquote>
          <Folio number="08" label="Inventory" />
        </article>

        <article className="report-spread report-paper report-field-notes" data-spread="8" id="report-spread-8">
          <motion.div className="report-notes-grid" {...reveal}>
            <div className="report-notes-copy">
              <p className="report-kicker">Field notes / current preoccupations</p>
              <h2>Developing skill through doing.</h2>
              <p>
                Guiltlessly exploring passions and interests; imbuing quality. Remaining mindful that everything around us is someone’s life work.
              </p>
              <div className="report-note-links">
                <a href="https://blog.mohtasham.dev">Technical writing <ArrowUpRight aria-hidden="true" /></a>
                <Link href="/gallery">Visual archive <ArrowUpRight aria-hidden="true" /></Link>
                <a href="https://www.researchgate.net/profile/Mohtasham-Madani">Research record <ArrowUpRight aria-hidden="true" /></a>
              </div>
            </div>
            <div className="report-photo-pair">
              <figure><Image src="/gallery/IMG_0566.jpg" alt="A photograph from Mohtasham's visual archive." fill sizes="28vw" /><figcaption>Field image 01</figcaption></figure>
              <figure><Image src="/gallery/IMG_0607.jpg" alt="A second photograph from Mohtasham's visual archive." fill sizes="28vw" /><figcaption>Field image 02</figcaption></figure>
            </div>
          </motion.div>
          <Folio number="09" label="Field notes" />
        </article>

        <article className="report-spread report-colophon" data-spread="9" id="report-spread-9">
          <motion.div className="report-colophon-inner" {...reveal}>
            <p className="report-kicker">End of field report № 01</p>
            <h2>The Office remains open.</h2>
            <p>
              Correspondence concerning software, intelligent systems, unfinished ideas, and useful accidents may be directed to the address below.
            </p>
            <a className="report-mail" href="mailto:mohtashammurshid@gmail.com">
              <Mail aria-hidden="true" /> mohtashammurshid@gmail.com
            </a>
            <div className="report-colophon-links">
              <a href="https://github.com/mohtashammurshid">GitHub</a>
              <a href="https://www.linkedin.com/in/mohtashammurshid/">LinkedIn</a>
              <a href="https://x.com/mohtashamdotdev">X</a>
              <Link href="/gallery">Archive</Link>
            </div>
            <div className="report-seal" aria-hidden="true"><span>OII</span><small>01</small></div>
            <p className="report-fineprint">Designed and assembled in Kuala Lumpur · Set in EB Garamond and IBM Plex Mono · 2026</p>
          </motion.div>
          <button className="report-return" onClick={() => goTo(0)}><ArrowLeft aria-hidden="true" /> Return to cover</button>
        </article>
      </section>

      <div className="report-arrows" aria-label="Page controls">
        <button onClick={() => goTo(activeSpread - 1)} disabled={activeSpread === 0} aria-label="Previous page"><ArrowLeft /></button>
        <button onClick={() => goTo(activeSpread + 1)} disabled={activeSpread === spreadLabels.length - 1} aria-label="Next page"><ArrowRight /></button>
      </div>

      <AnimatePresence>
        {activeSpread === 0 && (
          <motion.p className="report-scroll-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.8 }}>
            Scroll to advance
          </motion.p>
        )}
      </AnimatePresence>
    </main>
  );
}

function Folio({ number, label }: { number: string; label: string }) {
  return <div className="report-folio" aria-hidden="true"><span>{label}</span><span>{number}</span></div>;
}

function ProjectRow({ index, name, role, text, href }: { index: string; name: string; role: string; text: string; href: string }) {
  return (
    <Link href={href} className="report-operation-row">
      <span>{index}</span><span><strong>{name}</strong><small>{role}</small></span><p>{text}</p><ArrowUpRight aria-hidden="true" />
    </Link>
  );
}

function InstrumentCard({ number, title, descriptor, text, href }: { number: string; title: string; descriptor: string; text: string; href: string }) {
  return (
    <Link href={href} className="report-instrument-card">
      <span className="report-instrument-number">OI–{number}</span>
      <h3>{title}</h3><p>{text}</p><small>{descriptor}</small><ArrowUpRight aria-hidden="true" />
    </Link>
  );
}

function LedgerRow({ year, title, meta, href }: { year: string; title: string; meta: string; href: string }) {
  return <a className="report-ledger-row" href={href}><span>{year}</span><strong>{title}</strong><span>{meta}</span><ArrowUpRight aria-hidden="true" /></a>;
}
