'use client';

import { useEffect, useRef, useState } from 'react';
import Lanyard from '@/components/ui/Lanyard';
import styles from './AchievementsContactLanyard.module.css';

export function AchievementsContactLanyard() {
  const frameRef = useRef(0);
  const [rig, setRig] = useState({
    active: false,
    isMobile: false,
    anchorInset: 0.035,
    cardInset: 1.08,
  });

  useEffect(() => {
    let disconnectRig: (() => void) | undefined;
    let waitingObserver: MutationObserver | undefined;

    const connectRig = () => {
      if (disconnectRig) return true;

      const contact = document.getElementById('contact');
      if (!contact) return false;

      const update = () => {
        frameRef.current = 0;
        const viewportHeight = Math.max(1, window.innerHeight);
        const contactRect = contact.getBoundingClientRect();
        const contactVisible = contactRect.top < viewportHeight && contactRect.bottom > 0;
        const isMobile = window.innerWidth < 768;
        const next = {
          active: contactVisible,
          isMobile,
          anchorInset: isMobile
            ? Math.max(0.015, contactRect.top / viewportHeight + 0.02)
            : Math.max(0.035, contactRect.top / viewportHeight + 0.035),
          cardInset: isMobile
            ? Math.min(1.02, Math.max(0.2, contactRect.top / viewportHeight + 0.16))
            : Math.min(1.12, Math.max(0.16, contactRect.top / viewportHeight + 0.05)),
        };

        setRig((current) =>
          current.active === next.active &&
          current.isMobile === next.isMobile &&
          Math.abs(current.anchorInset - next.anchorInset) < 0.001 &&
          Math.abs(current.cardInset - next.cardInset) < 0.001
            ? current
            : next,
        );
      };

      const schedule = () => {
        if (!frameRef.current) frameRef.current = requestAnimationFrame(update);
      };

      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      schedule();

      disconnectRig = () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
      };

      return true;
    };

    if (!connectRig()) {
      waitingObserver = new MutationObserver(() => {
        if (connectRig()) {
          waitingObserver?.disconnect();
          waitingObserver = undefined;
        }
      });
      waitingObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      waitingObserver?.disconnect();
      disconnectRig?.();
    };
  }, []);

  return (
    <div className={styles.stage} data-active={rig.active} aria-hidden="true">
      <Lanyard
        frontImage="/images/contact/antonius-id-photo.png"
        backImage="/images/contact/whatsapp-qr.jpeg"
        frontImageFit="cover"
        backImageFit="contain"
        cardColor="#0c0907"
        orientation="portrait"
        finish="glossy"
        cornerRadius={0.22}
        size={rig.isMobile ? 0.42 : 0.46}
        anchor={rig.isMobile ? 'center' : 'left'}
        anchorInset={rig.anchorInset}
        cardInset={rig.cardInset}
        showAnchor
        strapLength={0.62}
        strapColor="#8b1e2d"
        strapWidth={0.68}
        tagMark="P"
        tagMarkColor="#f2e8d5"
        metal="graphite"
        gravity={0.68}
        damping={0.38}
        elasticity={0.58}
        breeze={rig.active ? (rig.isMobile ? 0.14 : 0.18) : 0}
        interactive={rig.active}
        pointerEventsThrough
        intro
      />
    </div>
  );
}
