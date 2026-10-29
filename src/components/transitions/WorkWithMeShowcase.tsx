'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './WorkWithMeShowcase.css';

gsap.registerPlugin(ScrollTrigger);

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

const projects = [
  {
    id: '01',
    title: 'Custom Software for Chit Funds',
    description: 'Get custom works and and full stack application',
    image: '/images/work-with-me/project-01-workspace.png',
    alt: 'A laptop displaying a management dashboard on a warmly lit desk',
    position: 'center',
    slug: 'rajamanickam-chit-fund',
  },
  {
    id: '02',
    title: 'Palindrome',
    description: 'Your startup needs a tech team? contact us we build you your entire software',
    image: '/images/work-with-me/project-02-pricing.png',
    alt: 'A foldable tablet displaying a pricing interface in a bright workspace',
    position: 'center',
    slug: 'palindrome',
  },
  {
    id: '03',
    title: 'Kaiforge',
    description: 'Spots analytics and web application and mobile apps',
    image: '/images/work-with-me/project-03-sports-app.png',
    alt: 'A hand holding a phone with a sports dashboard in a moody workspace',
    position: '42% center',
    slug: 'kaiforge',
  },
  {
    id: '04',
    title: 'Portfolio',
    description: 'Specially tailored for an E - Grade Scientist at Zological survey of India',
    image: '/images/work-with-me/project-04-marine-portfolio.png',
    alt: 'A wide monitor displaying a marine research portfolio in a dark workspace',
    position: 'center',
    slug: 'dr-js-yogesh-kumar-zsi',
  },
] as const;

const rail = ['IDEA', 'DESIGN', 'BUILD', 'IMPACT'] as const;

export interface WorkWithMeShowcaseHandle {
  setProgress: (progress: number) => void;
}

export const WorkWithMeShowcase = forwardRef<WorkWithMeShowcaseHandle>(
  function WorkWithMeShowcase(_props, ref) {
    const rootRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<(HTMLElement | null)[]>([]);
    const backgroundRefs = useRef<(HTMLDivElement | null)[]>([]);
    const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
    const descriptionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const indexRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const squareProgressRef = useRef<SVGRectElement>(null);
    const railRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const loadedRef = useRef([false, false, false, false]);
    const [loaded, setLoaded] = useState(loadedRef.current);

    const setProgress = useCallback((progress: number) => {
      const root = rootRef.current;
      if (!root || window.innerWidth <= 768) return;

      const p = clamp(progress);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const position =
        smoothstep(0.19, 0.31, p) + smoothstep(0.41, 0.53, p) + smoothstep(0.63, 0.75, p);
      const bounds = root.getBoundingClientRect();
      const nearViewport =
        bounds.top < window.innerHeight * 2 && bounds.bottom > -window.innerHeight;
      if (!nearViewport) return;
      const preloadThrough = p > 0 ? Math.min(3, Math.floor(position) + 1) : 0;
      let needsLoad = false;
      for (let index = 0; index <= preloadThrough; index += 1) {
        if (!loadedRef.current[index]) {
          loadedRef.current[index] = true;
          needsLoad = true;
        }
      }
      if (needsLoad) setLoaded([...loadedRef.current]);

      const mobile = window.innerWidth <= 640;
      const spacing = window.innerHeight * (mobile ? 0.27 : 0.35);
      const previewScale = mobile ? 0.4 : 0.32;
      const revealBackground = smoothstep(0, 0.045, p);
      const revealHero = smoothstep(0.015, 0.07, p);
      const revealText = smoothstep(0.035, 0.09, p);
      const revealRail = smoothstep(0.055, 0.1, p);
      const exit = 1 - smoothstep(0.89, 1, p);

      projects.forEach((_, index) => {
        const relative = index - position;
        const distance = Math.abs(relative);
        const image = imageRefs.current[index];
        const background = backgroundRefs.current[index];
        const title = titleRefs.current[index];
        const description = descriptionRefs.current[index];
        const number = indexRefs.current[index];

        if (image) {
          const scale = reduced ? 1 : 1 - (1 - previewScale) * Math.min(1, distance);
          const visibility = reduced
            ? 1 - smoothstep(0.25, 0.85, distance)
            : (1 - 0.48 * Math.min(1, distance)) * (1 - smoothstep(1, 1.42, distance));
          image.style.opacity = `${visibility * revealHero * exit}`;
          image.style.transform = reduced
            ? 'translate(-50%, -50%)'
            : `translate(-50%, -50%) translate3d(0, ${relative * spacing}px, 0) scale(${scale * (1 - 0.055 * (1 - exit))})`;
          image.style.zIndex = `${10 - Math.round(distance)}`;
          image.style.filter = reduced
            ? 'none'
            : `blur(${2 * Math.min(1, distance)}px) brightness(${1 - 0.25 * Math.min(1, distance)}) saturate(${1 - 0.28 * Math.min(1, distance)})`;
        }
        if (background) {
          background.style.opacity = `${0.85 * Math.max(0, 1 - distance) * revealBackground * exit}`;
        }
        const textVisibility = (1 - smoothstep(0.12, 0.9, distance)) * revealText * exit;
        if (title) {
          title.style.opacity = `${textVisibility}`;
          title.style.transform = reduced ? 'none' : `translate3d(0, ${relative * 20}px, 0)`;
        }
        if (description) {
          description.style.opacity = `${textVisibility}`;
          description.style.transform = reduced ? 'none' : `translate3d(0, ${relative * 14}px, 0)`;
        }
        if (number) {
          number.style.opacity = `${textVisibility}`;
          number.style.transform = reduced ? 'none' : `translate3d(0, ${relative * 46}px, 0)`;
        }
        const railItem = railRefs.current[index];
        if (railItem) {
          railItem.style.opacity = `${(0.32 + 0.68 * Math.max(0, 1 - distance)) * revealRail * exit}`;
        }
      });

      if (squareProgressRef.current) {
        squareProgressRef.current.style.strokeDashoffset = `${320 * (1 - (position + 1) / projects.length)}`;
      }
      root.style.setProperty('--work-ui-opacity', `${revealRail * exit}`);
    }, []);

    useEffect(() => {
      const media = gsap.matchMedia();
      media.add('(max-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const slides = Array.from(
          rootRef.current?.querySelectorAll<HTMLElement>('.work-showcase__mobile-slide') ?? [],
        );
        const timelines = slides.map((slide) => {
          const image = slide.querySelector<HTMLElement>('.work-showcase__mobile-image');
          const copy = slide.querySelector<HTMLElement>('.work-showcase__mobile-copy');
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: slide,
              start: 'top 85%',
              end: 'top 30%',
              scrub: 0.25,
              invalidateOnRefresh: true,
            },
          });
          if (image) timeline.fromTo(image, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 0);
          if (copy) timeline.fromTo(copy, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 0.2);
          return timeline;
        });
        return () => {
          for (const timeline of timelines) {
            timeline.scrollTrigger?.kill();
            timeline.kill();
          }
          gsap.set(
            slides.flatMap((slide) =>
              Array.from(
                slide.querySelectorAll('.work-showcase__mobile-image, .work-showcase__mobile-copy'),
              ),
            ),
            { clearProps: 'opacity,visibility' },
          );
        };
      });
      return () => media.revert();
    }, []);

    useImperativeHandle(ref, () => ({ setProgress }), [setProgress]);

    return (
      <div ref={rootRef} className="work-showcase">
        <div className="work-showcase__visual" aria-hidden="true">
          <div className="work-showcase__backgrounds">
            {projects.map((project, index) => (
              <div
                key={project.id}
                ref={(node) => {
                  backgroundRefs.current[index] = node;
                }}
                className="work-showcase__background"
              >
                {loaded[index] && (
                  // biome-ignore lint/performance/noImgElement: The blurred layer reuses the hero asset and only mounts near the reel.
                  <img
                    src={project.image}
                    alt=""
                    loading="eager"
                    decoding="async"
                    style={{ objectPosition: project.position }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="work-showcase__shade" />
          <p className="work-showcase__mark">WORK / SELECTED PROJECTS</p>

          <div className="work-showcase__images">
            {projects.map((project, index) => (
              <figure
                key={project.id}
                ref={(node) => {
                  imageRefs.current[index] = node;
                }}
                className="work-showcase__image"
              >
                {loaded[index] && (
                  // The same source is reused for the sharp image and its blurred atmosphere.
                  // biome-ignore lint/performance/noImgElement: The reveal mounts original assets on demand.
                  <img
                    src={project.image}
                    alt=""
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    style={{ objectPosition: project.position }}
                  />
                )}
              </figure>
            ))}
          </div>

          <div className="work-showcase__titles">
            {projects.map((project, index) => (
              <div
                key={project.id}
                ref={(node) => {
                  titleRefs.current[index] = node;
                }}
                className={`work-showcase__title${index === 0 ? ' work-showcase__title--long' : ''}`}
              >
                <span className="work-showcase__eyebrow">SELECTED WORK / {project.id}</span>
                <strong>{project.title}</strong>
              </div>
            ))}
          </div>

          <div className="work-showcase__descriptions">
            {projects.map((project, index) => (
              <p
                key={project.id}
                ref={(node) => {
                  descriptionRefs.current[index] = node;
                }}
                className="work-showcase__description"
              >
                {project.description}
              </p>
            ))}
          </div>

          <div className="work-showcase__index">
            <svg viewBox="0 0 84 84" aria-hidden="true" focusable="false">
              <rect
                    className="work-showcase__square-track"
                    x="2"
                    y="2"
                    width="80"
                    height="80"
                  />
              <rect
                ref={squareProgressRef}
                className="work-showcase__square-progress"
                x="2"
                y="2"
                width="80"
                height="80"
              />
            </svg>
            {projects.map((project, index) => (
              <span
                key={project.id}
                ref={(node) => {
                  indexRefs.current[index] = node;
                }}
              >
                {project.id}
              </span>
            ))}
          </div>

          <div className="work-showcase__rail">
            {rail.map((label, index) => (
              <span className="work-showcase__rail-group" key={label}>
                <span
                  ref={(node) => {
                    railRefs.current[index] = node;
                  }}
                  className="work-showcase__rail-item"
                >
                  {String(index + 1).padStart(2, '0')} {label}
                </span>
                {index < rail.length - 1 && <i aria-hidden="true">×</i>}
              </span>
            ))}
          </div>
        </div>

        <div className="work-showcase__mobile" aria-hidden="true">
          {projects.map((project, index) => (
            <article className="work-showcase__mobile-slide" key={project.id}>
              <div className="work-showcase__mobile-background">
                {/* biome-ignore lint/performance/noImgElement: The background reuses the slide image. */}
                <img
                  src={project.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: project.position }}
                />
              </div>
              <div className="work-showcase__mobile-shade" />
              <p className="work-showcase__mark">WORK / SELECTED PROJECTS</p>
              <figure className="work-showcase__mobile-image">
                {/* biome-ignore lint/performance/noImgElement: Keep the existing full-size project image. */}
                <img
                  src={project.image}
                  alt=""
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  style={{ objectPosition: project.position }}
                />
              </figure>
              <div className="work-showcase__mobile-index">
                <svg viewBox="0 0 84 84" focusable="false" aria-hidden="true">
                  <rect
                    className="work-showcase__square-track"
                    x="2"
                    y="2"
                    width="80"
                    height="80"
                  />
                  <rect
                    className="work-showcase__square-progress"
                    x="2"
                    y="2"
                    width="80"
                    height="80"
                  />
                </svg>
                <span>{project.id}</span>
              </div>
              <div
                className={`work-showcase__mobile-copy${index === 0 ? ' work-showcase__mobile-copy--long' : ''}`}
              >
                <span className="work-showcase__eyebrow">SELECTED WORK / {project.id}</span>
                <strong>{project.title}</strong>
                <p>{project.description}</p>
              </div>
              <div className="work-showcase__mobile-rail">
                {rail.map((label, railIndex) => (
                  <span key={label}>
                    {String(railIndex + 1).padStart(2, '0')} {label}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <ol className="work-showcase__accessible">
          {projects.map((project) => (
            <li key={project.id}>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <p>{project.alt}</p>
              <a href={`/projects/${project.slug}`}>
                Explore {project.title} by Antonius Jairus
              </a>
            </li>
          ))}
        </ol>
      </div>
    );
  },
);
