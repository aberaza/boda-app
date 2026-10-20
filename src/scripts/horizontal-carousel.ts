import Swiper from 'swiper';
import { Mousewheel } from 'swiper/modules';

export interface HorizontalController {
  root: HTMLElement;
  move: (direction: -1 | 1) => void;
}

export function initHorizontalCarousels(): HorizontalController[] {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return Array.from(document.querySelectorAll<HTMLElement>('[data-horizontal-carousel]')).map(
    (root) => {
      const viewport = root.querySelector<HTMLElement>('[data-horizontal-viewport]');
      if (!viewport) throw new Error('Horizontal carousel viewport missing');
      const panels = Array.from(viewport.querySelectorAll<HTMLElement>('[data-horizontal-panel]'));
      const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-horizontal-dot]'));
      const previous = root.querySelector<HTMLButtonElement>('[data-horizontal-prev]');
      const nextButtons = Array.from(
        root.querySelectorAll<HTMLButtonElement>('[data-horizontal-next]'),
      );
      const status = root.querySelector<HTMLElement>('[data-horizontal-status]');
      const speed = reduced ? 0 : 350;

      const update = (swiper: Swiper) => {
        const active = swiper.activeIndex;
        const focus = document.activeElement;
        if (panels.some((panel, i) => i !== active && panel.contains(focus))) {
          dots[active]?.focus({ preventScroll: true });
        }
        panels.forEach((panel, index) => {
          panel.inert = index !== active;
          panel.setAttribute('aria-hidden', String(index !== active));
        });
        dots.forEach((dot, index) => {
          if (index === active) dot.setAttribute('aria-current', 'step');
          else dot.removeAttribute('aria-current');
        });
        if (previous) previous.disabled = swiper.isBeginning;
        nextButtons.forEach((button) => {
          button.disabled = swiper.isEnd;
        });
        if (status)
          status.textContent =
            (panels[active]?.getAttribute('aria-label') ?? '') +
            ' · ' +
            (active + 1) +
            ' / ' +
            panels.length;
        root.dataset.horizontalIndex = String(active);
        root.dispatchEvent(new CustomEvent('horizontal:change', { detail: active }));
      };

      const swiper = new Swiper(viewport, {
        modules: [Mousewheel],
        direction: 'horizontal',
        slidesPerView: 1,
        loop: false,
        speed,
        touchStartPreventDefault: false,
        longSwipesRatio: 0.25,
        mousewheel: {
          forceToAxis: true,
          releaseOnEdges: true,
          thresholdDelta: 12,
          thresholdTime: 350,
        },
        on: { init: update, slideChange: update },
      });

      const move = (direction: -1 | 1) => {
        if (swiper.animating) return;
        if (direction < 0) swiper.slidePrev(speed);
        else swiper.slideNext(speed);
      };
      previous?.addEventListener('click', () => move(-1));
      nextButtons.forEach((button) => button.addEventListener('click', () => move(1)));
      dots.forEach((dot, index) =>
        dot.addEventListener('click', () => swiper.slideTo(index, speed)),
      );
      root.addEventListener('horizontal:refresh', () => swiper.update());
      return { root, move };
    },
  );
}
