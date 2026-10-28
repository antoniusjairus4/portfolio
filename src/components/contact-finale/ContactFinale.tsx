'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './ContactFinale.module.css';

const email = 'antoniusjairusofficial@gmail.com';

const socialLinks = [
  {
    id: 'github',
    label: 'GITHUB',
    username: 'antoniusjairus4',
    href: 'https://github.com/antoniusjairus4',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={styles.socialIcon}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    label: 'LINKEDIN',
    username: 'antoniusjairus4',
    href: 'https://www.linkedin.com/in/antoniusjairus4',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={styles.socialIcon}
      >
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.3a1.63 1.63 0 0 0-1.63 1.63c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    label: 'INSTAGRAM',
    username: '@antoniusjairus4',
    href: 'https://www.instagram.com/antoniusjairus4',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={styles.socialIcon}
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.4" />
      </svg>
    ),
  },
  {
    id: 'x',
    label: 'X',
    username: '@antoniusjairus4',
    href: 'https://x.com/antoniusjairus4',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={styles.socialIcon}
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'gmail',
    label: 'GMAIL',
    username: 'antoniusjairusofficial@gmail.com',
    href: 'mailto:antoniusjairusofficial@gmail.com',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={styles.socialIcon}
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 6L12 13L2 6" />
      </svg>
    ),
  },
];

export function ContactFinale() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const pointerPos = useRef({ targetX: 0.5, targetY: 0.5, currentX: 0.5, currentY: 0.5 });
  const rafRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(section);

    const onPointerMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      if (rect.height <= 0 || rect.width <= 0) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      pointerPos.current.targetX = Math.max(0, Math.min(1, x));
      pointerPos.current.targetY = Math.max(0, Math.min(1, y));
    };

    const updateLoop = () => {
      const pos = pointerPos.current;
      pos.currentX += (pos.targetX - pos.currentX) * 0.08;
      pos.currentY += (pos.targetY - pos.currentY) * 0.08;

      if (section) {
        section.style.setProperty('--mouse-x', `${(pos.currentX * 100).toFixed(2)}%`);
        section.style.setProperty('--mouse-y', `${(pos.currentY * 100).toFixed(2)}%`);
        section.style.setProperty('--parallax-x', `${((pos.currentX - 0.5) * 42).toFixed(2)}px`);
        section.style.setProperty('--parallax-y', `${((pos.currentY - 0.5) * 26).toFixed(2)}px`);
      }
      rafRef.current = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    rafRef.current = requestAnimationFrame(updateLoop);

    return () => {
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleBackToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className={styles.chapter}
      data-revealed={revealed}
      aria-labelledby="contact-heading"
    >
      {/* Background layer 1: subtle paper/noise grain */}
      <div className={styles.bgGrain} aria-hidden="true" />

      {/* Background layer 2: cursor ambient illumination */}
      <div className={styles.bgAmbientLight} aria-hidden="true" />

      {/* Background layer 3: gigantic ghost typography "CONNECT" with subtle counter-parallax */}
      <div className={styles.ghostTypography} aria-hidden="true">
        CONNECT
      </div>

      <div className={styles.contentContainer}>
        {/* Top/Hero Composition */}
        <div className={styles.heroRow}>
          {/* Left Column: Hanging Badge Staging Zone */}
          <div className={styles.badgeStageArea}>
            <div className={styles.badgeHint} aria-hidden="true">
              <span className={styles.hintDot} />
              <span>DRAG BADGE · TAP TO FLIP · SCAN WHATSAPP</span>
            </div>
          </div>

          {/* Right Column: Contact Hero Typography & Email CTA */}
          <div className={styles.contactHero}>
            <div className={styles.contactHeroHeader}>
              <span className={styles.kicker}>CONTACT / 05</span>

              <h2 id="contact-heading" className={styles.headline}>
                <span className={styles.lineWrap}>
                  <span className={styles.lineInner}>LET&apos;S BUILD</span>
                </span>
                <span className={styles.lineWrap}>
                  <span className={styles.lineInner}>AND SCALE</span>
                </span>
                <span className={styles.lineWrap}>
                  <span className={styles.lineInner}>TO THE NEXT LEVEL.</span>
                </span>
              </h2>

              <p className={styles.subline}>PROJECTS / COLLABORATIONS / IDEAS</p>
            </div>

            <div className={styles.emailWrapper}>
              <a href={`mailto:${email}`} className={styles.emailCta}>
                <span className={styles.emailText}>{email}</span>
                <span className={styles.emailArrow} aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Middle: Horizontal Social Identity Rail */}
        <nav className={styles.socialRail} aria-label="Social profiles and channels">
          {socialLinks.map((item) => (
            <a
              key={item.id}
              href={item.href}
              target={item.id === 'gmail' ? undefined : '_blank'}
              rel={item.id === 'gmail' ? undefined : 'noopener noreferrer'}
              className={styles.socialCell}
              data-platform={item.id}
            >
              <div className={styles.cellIconWrap}>{item.icon}</div>
              <div className={styles.cellContent}>
                <div className={styles.cellHeader}>
                  <span className={styles.cellPlatform}>{item.label}</span>
                  <span className={styles.mobileArrow} aria-hidden="true">
                    ↗
                  </span>
                </div>
                <span className={styles.cellUsername}>
                  <span className={styles.usernameText}>{item.username}</span>
                  <span className={styles.desktopArrow} aria-hidden="true">
                    ↗
                  </span>
                </span>
              </div>
            </a>
          ))}
        </nav>

        {/* Bottom: Minimal Footer */}
        <footer className={styles.footer}>
          <p className={styles.copyright}>
            © 2026 Antonius Jairus — Designed &amp; developed by Antonius Jairus
          </p>
          <div className={styles.footerActions}>
            <Link href="/projects" className={styles.projectLink}>
              PROJECT ARCHIVE ↗
            </Link>
            <a href="#top" onClick={handleBackToTop} className={styles.backToTop}>
              BACK TO TOP ↑
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}
