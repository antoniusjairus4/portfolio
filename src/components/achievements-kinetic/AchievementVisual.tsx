'use client';

import Image from 'next/image';
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import styles from '@/components/achievements-kinetic/AchievementsChapter.module.css';
import type { AchievementExhibit } from '@/content/achievementsKinetic';

interface AchievementVisualProps {
  items: readonly AchievementExhibit[];
  activeIndex: number;
  children?: ReactNode;
}

function VisualImage({
  item,
  outgoing = false,
  eager = false,
}: {
  item: AchievementExhibit;
  outgoing?: boolean;
  eager?: boolean;
}) {
  return (
    <div
      className={`${styles.visualImage} ${outgoing ? styles.outgoingImage : styles.incomingImage}`}
    >
      <Image
        src={item.image.src}
        alt={outgoing ? '' : item.image.alt}
        fill
        unoptimized
        loading={eager ? 'eager' : 'lazy'}
        sizes="(max-width: 860px) 100vw, 58vw"
        style={{ objectPosition: item.image.position }}
      />
    </div>
  );
}

// The effect slot can later host a ReactBits treatment without changing scroll synchronization.
export function AchievementVisual({ items, activeIndex, children }: AchievementVisualProps) {
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const previousIndexRef = useRef(activeIndex);

  useLayoutEffect(() => {
    const previous = previousIndexRef.current;
    if (previous === activeIndex) return;
    previousIndexRef.current = activeIndex;
    setOutgoingIndex(previous);
    const timer = window.setTimeout(() => setOutgoingIndex(null), 720);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  const active = items[activeIndex];
  if (!active) return null;

  return (
    <div className={styles.visual} data-achievement-visual={active.key}>
      <div className={styles.visualFrame}>
        <div className={styles.visualEffectSlot} data-visual-effect-slot>
          {outgoingIndex !== null && items[outgoingIndex] && (
            <VisualImage key={`outgoing-${outgoingIndex}`} item={items[outgoingIndex]} outgoing />
          )}
          <VisualImage key={`active-${active.key}`} item={active} eager={activeIndex === 0} />
          {children}
        </div>
        <div className={styles.visualCaption}>
          <span>{active.title}</span>
          <span>{active.index}</span>
        </div>
      </div>
    </div>
  );
}
