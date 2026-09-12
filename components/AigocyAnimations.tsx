'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function AigocyAnimations() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // 1. Scroll Effect Fade (.effectFade)
    const fadeElements = document.querySelectorAll('.effectFade');
    const fadeTweens: gsap.core.Tween[] = [];

    fadeElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      let fromVars: gsap.TweenVars = { autoAlpha: 0 };
      let toVars: gsap.TweenVars = { autoAlpha: 1, duration: 1, ease: 'power3.out' };
      let startPush = 'top 95%';
      let delay = htmlEl.dataset.delay ? parseFloat(htmlEl.dataset.delay) : 0;
      toVars.delay = delay;

      if (htmlEl.classList.contains('fadeUp')) {
        fromVars.y = 40;
        toVars.y = 0;
      } else if (htmlEl.classList.contains('fadeDown')) {
        fromVars.y = -40;
        toVars.y = 0;
      } else if (htmlEl.classList.contains('fadeLeft')) {
        fromVars.x = -40;
        toVars.x = 0;
      } else if (htmlEl.classList.contains('fadeRight')) {
        fromVars.x = 40;
        toVars.x = 0;
      } else if (htmlEl.classList.contains('fadeZoom')) {
        fromVars.scale = 0.85;
        toVars.scale = 1;
      }

      if (htmlEl.classList.contains('view-visible')) {
        startPush = 'top 101%';
      }

      gsap.set(htmlEl, fromVars);

      const tween = gsap.to(htmlEl, {
        ...toVars,
        scrollTrigger: {
          trigger: htmlEl,
          start: startPush,
          toggleActions: 'play none none none',
        },
      });
      fadeTweens.push(tween);
    });

    // 2. Animate Box (.animate-box)
    const animateBoxes = document.querySelectorAll('.animate-box');
    animateBoxes.forEach((box) => {
      gsap.fromTo(
        box,
        { x: -100, y: -40, scale: 0.85, opacity: 0 },
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: box,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // 3. Tech Progress Lines (.progress-line)
    const progressLines = document.querySelectorAll('.progress-line');
    progressLines.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const progress = htmlEl.dataset.progress || '100';

      gsap.fromTo(
        htmlEl,
        { width: '5%' },
        {
          width: `${progress}%`,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: htmlEl,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // 4. Parallax Grow transforms (.img-transform-3)
    const transform3Items = document.querySelectorAll('.img-transform-3');
    transform3Items.forEach((item) => {
      gsap.to(item, {
        transform: 'translate(-10px, -10px)',
        ease: 'none',
        scrollTrigger: {
          trigger: item,
          scrub: 1.5,
          start: 'top 80%',
          end: 'top center',
        },
      });
    });

    // 5. Hash navigation scroll handler
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return null;
}
