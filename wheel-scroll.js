const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const scrollKeys = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Tab']);
// Lenis uses a damping rate of 0.1 × 60 per second by default.
const responseTime = 1000 / 6;
let frame;
let position;
let target;
let lastScrollY;
let lastFrameTime;

function stop() {
  if (frame !== undefined) cancelAnimationFrame(frame);
  frame = undefined;
}

function animate(now) {
  frame = undefined;

  // If the browser moved the page (for example, via its scrollbar), yield immediately.
  if (window.scrollY !== lastScrollY) return;

  const remaining = target - position;
  const step = 1 - Math.exp(-Math.max(0, now - lastFrameTime) / responseTime);
  const finished = Math.abs(remaining) <= 1;
  position = finished ? target : position + remaining * step;
  lastFrameTime = now;

  window.scrollTo({ top: position, behavior: 'instant' });
  lastScrollY = window.scrollY;

  if (!finished) frame = requestAnimationFrame(animate);
}

function onWheel(event) {
  if (event.target.closest?.('dialog[open]') || event.defaultPrevented || !event.cancelable || event.ctrlKey || event.metaKey ||
      event.shiftKey || event.buttons || event.clientX >= document.documentElement.clientWidth) {
    stop();
    return;
  }

  const mode = event.deltaMode;
  if (!event.deltaY || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;

  const current = window.scrollY;
  const { scrollHeight, clientHeight } = document.scrollingElement;
  const max = scrollHeight - clientHeight;
  const unit = mode === WheelEvent.DOM_DELTA_LINE ? 16 :
    mode === WheelEvent.DOM_DELTA_PAGE ? clientHeight : 1;
  const delta = event.deltaY * unit;

  if (frame === undefined || current !== lastScrollY ||
      Math.sign(target - current) !== Math.sign(delta)) {
    stop();
    target = position = lastScrollY = current;
    lastFrameTime = performance.now();
  }

  target = Math.max(0, Math.min(max, target + delta));
  if (target === current) return;

  event.preventDefault();
  if (frame === undefined) frame = requestAnimationFrame(animate);
}

function configure() {
  stop();
  if (reducedMotion.matches) {
    window.removeEventListener('wheel', onWheel);
  } else {
    window.addEventListener('wheel', onWheel, { passive: false });
  }
}

window.addEventListener('pointerdown', stop, { passive: true });
document.documentElement.addEventListener('pointerleave', stop, { passive: true });
window.addEventListener('keydown', (event) => {
  if (scrollKeys.has(event.key)) stop();
});
window.addEventListener('resize', stop);
window.addEventListener('pagehide', stop);
reducedMotion.addEventListener('change', configure);
configure();

document.querySelector('.wander')?.addEventListener('click', (event) => {
  const { hash } = event.currentTarget;
  const destination = document.getElementById(hash.slice(1));
  if (!destination || reducedMotion.matches || event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  event.preventDefault();
  stop();
  if (location.hash !== hash) history.pushState(null, '', hash);
  destination.focus({ preventScroll: true });
  destination.scrollIntoView({ behavior: 'smooth' });
});
