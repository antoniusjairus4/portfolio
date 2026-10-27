'use client';

import { useEffect, useRef, useState } from 'react';
import Lanyard from '@/components/ui/Lanyard';
import styles from './AchievementsContactLanyard.module.css';

export function AchievementsContactLanyard() {
  const frameRef = useRef(0);
  const [rig, setRig] = useState({ active: false, anchorInset: 0.035 });

  useEffect(() => {
    let disconnectRig: (() => void) | undefined;
    let waitingObserver: MutationObserver | undefined;

    const connectRig = () => {
      if (disconnectRig) return true;

      const finale = document.querySelector<HTMLElement>('[data-achievement-panel="finale"]');
      const contact = document.getElementById('contact');
      const anchor = document.querySelector<HTMLElement>('[data-shared-lanyard-anchor]');
      if (!finale || !contact || !anchor) return false;

      const update = () => {
        frameRef.current = 0;
        const viewportHeight = Math.max(1, window.innerHeight);
        const anchorRect = anchor.getBoundingClientRect();
        const contactRect = contact.getBoundingClientRect();
        const finaleAtStatement = finale.dataset.achievementBeat === 'statement';
        const contactVisible = contactRect.top < viewportHeight && contactRect.bottom > 0;
        const next = {
          active: finaleAtStatement || contactVisible,
          anchorInset: anchorRect.top / viewportHeight,
        };

        setRig((current) =>
          current.active === next.active && Math.abs(current.anchorInset - next.anchorInset) < 0.001
            ? current
            : next,
        );
      };

      const schedule = () => {
        if (!frameRef.current) frameRef.current = requestAnimationFrame(update);
      };

      const beatObserver = new MutationObserver(schedule);
      beatObserver.observe(finale, {
        attributes: true,
        attributeFilter: ['data-achievement-beat'],
      });
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      schedule();

      disconnectRig = () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
        beatObserver.disconnect();
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
        size={0.48}
        anchor="left"
        anchorInset={rig.anchorInset}
        showAnchor
        strapLength={0.68}
        strapColor="#8b1e2d"
        strapWidth={0.7}
        tagMark="P"
        tagMarkColor="#f2e8d5"
        metal="graphite"
        gravity={0.7}
        damping={0.36}
        elasticity={0.6}
        breeze={rig.active ? 0.34 : 0}
        interactive={rig.active}
        pointerEventsThrough
        intro
      />
    </div>
  );
}
