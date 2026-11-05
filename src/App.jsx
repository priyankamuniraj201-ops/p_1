import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { DESIGNER, EXHIBITS } from "./data.js";

const MuseumScene = lazy(() =>
  import("./MuseumScene.jsx").then(({ MuseumScene: scene }) => ({ default: scene })),
);
const ProductPreview = lazy(() => import("./PreviewScene.jsx"));

function getIsMobile() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function InteractiveDemo({ exhibit }) {
  const [setting, setSetting] = useState(55);
  const [isOn, setIsOn] = useState(true);
  const controlsRef = useRef(null);

  const handleKeyDown = (event) => {
    const directions = {
      ArrowLeft: "rotateLeft",
      ArrowRight: "rotateRight",
      ArrowUp: "tiltUp",
      ArrowDown: "tiltDown",
    };
    const action = directions[event.key];
    if (!action) return;
    event.preventDefault();
    controlsRef.current?.[action]();
  };

  return (
    <div className="demo">
      <div
        className="demo__stage demo__stage--interactive"
        role="group"
        aria-label={`Interactive 3D ${exhibit.title} preview. Drag to orbit, use the arrow keys, or use the view controls to inspect it from all sides.`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <Suspense fallback={<span className="demo__loading">Preparing 3D preview…</span>}>
          <ProductPreview
            exhibit={exhibit}
            setting={setting}
            isOn={isOn}
            controlsRef={controlsRef}
          />
        </Suspense>
        <span className="demo__caption">DRAG TO ORBIT · ARROWS TO INSPECT</span>
      </div>
      <div className="demo__controls">
        <label htmlFor="demo-setting">
          {exhibit.demoLabel}
          <span>{setting}%</span>
        </label>
        <input
          id="demo-setting"
          type="range"
          min="0"
          max="100"
          value={setting}
          onChange={(event) => setSetting(Number(event.target.value))}
        />
        <div className="demo__actions">
          <div className="demo__view-controls" aria-label="Product view controls">
            <button type="button" aria-label="Rotate left" onClick={() => controlsRef.current?.rotateLeft()}>←</button>
            <button type="button" aria-label="Rotate right" onClick={() => controlsRef.current?.rotateRight()}>→</button>
            <button type="button" aria-label="Tilt up" onClick={() => controlsRef.current?.tiltUp()}>↑</button>
            <button type="button" aria-label="Tilt down" onClick={() => controlsRef.current?.tiltDown()}>↓</button>
          </div>
          <button className="button button--quiet" type="button" onClick={() => controlsRef.current?.reset()}>
            Reset view
          </button>
          <button
            className="button button--quiet"
            type="button"
            onClick={() => setIsOn((value) => !value)}
            aria-pressed={isOn}
          >
            {isOn ? "Pause preview" : "Resume preview"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExhibitDialog({ exhibit, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    function trapFocus(event) {
      if (event.key !== "Tab") return;
      const focusable = dialog.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    dialog.addEventListener("keydown", trapFocus);
    return () => dialog.removeEventListener("keydown", trapFocus);
  }, []);

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        ref={dialogRef}
      >
        <div className="dialog__topline">
          <span>{exhibit.eyebrow}</span>
          <button
            ref={closeRef}
            className="icon-button"
            type="button"
            aria-label="Close exhibit details"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className={`dialog__content${exhibit.pdf ? "" : " dialog__content--information"}${exhibit.portrait ? " dialog__content--profile" : ""}`}>
          <div className="dialog__copy">
            <p className="eyebrow">{exhibit.subtitle}</p>
            <h2 id="dialog-title">{exhibit.title}</h2>
            <p className="dialog__description">{exhibit.description}</p>
            {exhibit.bullets && (
              <ul className="detail-list">
                {exhibit.bullets.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
            {exhibit.stats && (
              <div className="project-stats">
                {exhibit.stats.map((stat) => (
                  <div className="project-stats__item" key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
            {exhibit.experiences && (
              <div className="dialog-experiences">
                {exhibit.experiences.map((experience) => (
                  <article className="experience-card" key={experience.company}>
                    <div className="experience-card__heading">
                      <h3>{experience.company}</h3>
                      <time>{experience.dates}</time>
                    </div>
                    <strong>{experience.role}</strong>
                    <p>{experience.description}</p>
                  </article>
                ))}
              </div>
            )}
            {exhibit.toolGroups && (
              <div className="dialog-tool-groups">
                {exhibit.toolGroups.map((group) => (
                  <section className={`tool-group tool-group--${group.title.toLowerCase()}`} key={group.title}>
                    <div className="tool-group__heading">
                      <h3>{group.title}</h3>
                      <span>{group.detail}</span>
                    </div>
                    <div className="tool-group__items">
                      {group.items.map((item) => <span key={item}>{item}</span>)}
                    </div>
                  </section>
                ))}
              </div>
            )}
            {exhibit.pdf && (
              <a
                className="button button--primary"
                href={exhibit.pdf}
                target="_blank"
                rel="noreferrer"
              >
                Open project PDF <span aria-hidden="true">↗</span>
              </a>
            )}
            {exhibit.links && (
              <div className="contact-links">
                {exhibit.links.map((link) => (
                  <a key={link.href} href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer">
                    {link.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
          {exhibit.pdf ? (
            <div className="dialog__project">
              <InteractiveDemo exhibit={exhibit} />
              {exhibit.process && (
                <ol className="process-list">
                  {exhibit.process.map((step, index) => (
                    <li key={step.title}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div><h3>{step.title}</h3><p>{step.text}</p></div>
                    </li>
                  ))}
                </ol>
              )}
              {exhibit.features && (
                <ul className="feature-list">
                  {exhibit.features.map((feature) => (
                    <li key={feature.title}><strong>{feature.title}</strong><span>{feature.text}</span></li>
                  ))}
                </ul>
              )}
              {exhibit.closing && <p className="project-closing">{exhibit.closing}</p>}
            </div>
          ) : exhibit.portrait ? (
            <div className={`dialog__note${exhibit.portrait ? " dialog__note--profile" : ""}`}>
              <img src={exhibit.portrait} alt={`Portrait of ${DESIGNER.name}`} />
              <div className="wall-art__highlights">
                {exhibit.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const journeyRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openExhibit, setOpenExhibit] = useState(null);
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const activeExhibit = EXHIBITS[activeIndex];
  const navigateTo = (id) => {
    const index = EXHIBITS.findIndex((exhibit) => exhibit.id === id);
    if (index >= 0) goToExhibit(index);
  };

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobile(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const goToExhibit = useCallback((index) => {
    const clampedIndex = Math.max(0, Math.min(EXHIBITS.length - 1, index));
    if (isMobile) {
      document.getElementById(EXHIBITS[clampedIndex].id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setActiveIndex(clampedIndex);
      return;
    }

    const journey = journeyRef.current;
    if (!journey) return;
    const destination = journey.offsetTop + clampedIndex * window.innerHeight;
    window.scrollTo({ top: destination, behavior: "smooth" });
    setActiveIndex(clampedIndex);
  }, [isMobile]);

  useEffect(() => {
    function onKeyDown(event) {
      if (openExhibit) {
        if (event.key === "Escape") setOpenExhibit(null);
        return;
      }
      if (event.target instanceof HTMLElement &&
        (event.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName))) {
        return;
      }
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        goToExhibit(activeIndex + 1);
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        goToExhibit(activeIndex - 1);
      } else if (event.key === "Enter" && !isMobile) {
        event.preventDefault();
        setOpenExhibit(activeExhibit);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeExhibit, activeIndex, goToExhibit, isMobile, openExhibit]);

  const handleActiveChange = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  const showExhibit = (exhibit) => setOpenExhibit(exhibit);

  return (
    <>
      <main id="top">
        <section
          id="journey"
          className="journey"
          ref={journeyRef}
          aria-label="Virtual museum walkthrough"
        >
          {!isMobile && (
            <Suspense fallback={null}>
              <MuseumScene trigger={journeyRef} onActiveChange={handleActiveChange} onSelect={showExhibit} />
            </Suspense>
          )}
          <header className="topbar">
            <a className="wordmark" href="#top" onClick={(event) => {
              event.preventDefault();
              navigateTo("entrance");
            }}>
              <span>{DESIGNER.name.toUpperCase()} <small>INDUSTRIAL DESIGNER</small></span>
            </a>
            <nav className="topbar__nav" aria-label="Main navigation">
              <a href="#top" onClick={(event) => { event.preventDefault(); navigateTo("entrance"); }}>Home</a>
              <a href="#about" onClick={(event) => { event.preventDefault(); navigateTo("about"); }}>About</a>
              <a href="#works" onClick={(event) => { event.preventDefault(); navigateTo("swara"); }}>Works</a>
              <a href="#connect" onClick={(event) => { event.preventDefault(); navigateTo("connect"); }}>Connect</a>
            </nav>
          </header>

          {!isMobile ? (
            <div className="walkthrough-ui">
              <div
                className={`station-card${activeExhibit.panel?.side === "left" || activeExhibit.roomPosition?.[0] < 0 ? " station-card--right" : ""}`}
                aria-live="polite"
              >
                <p className="eyebrow">{activeExhibit.eyebrow}</p>
                <h1>{activeExhibit.title}</h1>
                <p className="station-card__subtitle">{activeExhibit.subtitle}</p>
                <p className="station-card__description">{activeExhibit.description}</p>
                {activeExhibit.highlights && (
                  <div className="station-card__highlights" aria-label="Practice highlights">
                    {activeExhibit.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}
                  </div>
                )}
                {activeExhibit.experiences && (
                  <div className="station-card__experience">
                    {activeExhibit.experiences.map((experience) => (
                      <article key={experience.company}>
                        <strong>{experience.company}</strong>
                        <time>{experience.dates}</time>
                        <span>{experience.role}</span>
                      </article>
                    ))}
                  </div>
                )}
                {activeExhibit.toolGroups && (
                  <div className="station-card__toolkit">
                    {activeExhibit.toolGroups.map((group) => (
                      <section key={group.title}>
                        <h2>{group.title}</h2>
                        <p>{group.items.join(" · ")}</p>
                      </section>
                    ))}
                  </div>
                )}
                {activeExhibit.links && (
                  <div className="station-card__links">
                    {activeExhibit.links.map((link) => (
                      <a key={link.href} href={link.href}>{link.label} ↗</a>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => activeExhibit.id === "entrance" ? navigateTo("swara") : setOpenExhibit(activeExhibit)}
                >
                  {activeExhibit.cta ?? "Explore this exhibit"} <span aria-hidden="true">↗</span>
                </button>
              </div>
              <div className="walkthrough-footer">
                <div className="progress-block">
                  <span className="progress-block__count">
                    {String(activeIndex).padStart(2, "0")} <i>/</i> {String(EXHIBITS.length - 1).padStart(2, "0")}
                  </span>
                  <div className="progress-track" aria-hidden="true">
                    <span style={{ width: `${(activeIndex / (EXHIBITS.length - 1)) * 100}%` }} />
                  </div>
                  <span className="progress-block__label">EXHIBIT</span>
                </div>
                <div className="walk-controls">
                  <button type="button" className="icon-button" aria-label="Previous exhibit" onClick={() => goToExhibit(activeIndex - 1)}>↑</button>
                  <button type="button" className="icon-button" aria-label="Next exhibit" onClick={() => goToExhibit(activeIndex + 1)}>↓</button>
                </div>
                <p className="scroll-hint"><span aria-hidden="true">↓</span> Scroll to walk through</p>
              </div>
            </div>
          ) : (
            <div className="mobile-gallery">
              <div className="mobile-intro">
                <p className="eyebrow">{DESIGNER.name} / {DESIGNER.role}</p>
                <h1>For the everyday.</h1>
                <p>Built to be kept.</p>
                <span className="mobile-intro__line" aria-hidden="true" />
              </div>
              {EXHIBITS.slice(1).map((exhibit, index) => (
                <article className="mobile-exhibit" id={exhibit.id} key={exhibit.id}>
                  <div className={`mobile-exhibit__art mobile-exhibit__art--${exhibit.kind}`} aria-hidden="true">
                    {exhibit.portrait ? (
                      <>
                        <span>PM</span>
                        <img src={exhibit.portrait} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />
                      </>
                    ) : <span />}
                  </div>
                  <p className="eyebrow">{exhibit.eyebrow}</p>
                  <h2>{exhibit.title}</h2>
                  <p className="mobile-exhibit__subtitle">{exhibit.subtitle}</p>
                  <p>{exhibit.description}</p>
                  {exhibit.experiences && (
                    <div className="mobile-experience-list">
                      {exhibit.experiences.map((experience) => (
                        <article key={experience.company}>
                          <div><h3>{experience.company}</h3><time>{experience.dates}</time></div>
                          <strong>{experience.role}</strong>
                          <p>{experience.description}</p>
                        </article>
                      ))}
                    </div>
                  )}
                  {exhibit.toolGroups && (
                    <div className="mobile-tool-groups">
                      {exhibit.toolGroups.map((group) => (
                        <section key={group.title}>
                          <h3>{group.title}<span>{group.detail}</span></h3>
                          <div>{group.items.map((item) => <span key={item}>{item}</span>)}</div>
                        </section>
                      ))}
                    </div>
                  )}
                  <button type="button" className="button button--primary" onClick={() => showExhibit(exhibit)}>
                    Explore this exhibit <span aria-hidden="true">↗</span>
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} {DESIGNER.name} · INDUSTRIAL DESIGN PORTFOLIO</span>
        <a href={`mailto:${DESIGNER.email}`}>{DESIGNER.email}</a>
      </footer>
      {openExhibit && <ExhibitDialog exhibit={openExhibit} onClose={() => setOpenExhibit(null)} />}
    </>
  );
}
