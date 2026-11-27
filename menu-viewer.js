const menuSheets = document.querySelector('.menu-sheets');
const menuViewer = document.querySelector('.menu-viewer');
const menuViewerImage = menuViewer.querySelector('.menu-viewer-image');
const menuViewerScroll = menuViewer.querySelector('.menu-viewer-scroll');
const menuZoomOut = menuViewer.querySelector('.menu-viewer-zoom-out');
const menuZoomIn = menuViewer.querySelector('.menu-viewer-zoom-in');
const maximumZoom = 3;
let menuZoom = 1;
let openedBy;
let startedOnBackdrop = false;

function renderMenuZoom() {
  const aspectRatio = Number(menuViewerImage.getAttribute('width')) /
    Number(menuViewerImage.getAttribute('height'));
  const fitWidth = Math.min(menuViewerScroll.offsetWidth, menuViewerScroll.offsetHeight * aspectRatio);
  menuViewerImage.style.width = `${fitWidth * menuZoom}px`;
  menuZoomOut.setAttribute('aria-disabled', String(menuZoom === 1));
  menuZoomIn.setAttribute('aria-disabled', String(menuZoom === maximumZoom));
  menuViewerScroll.tabIndex = menuZoom > 1 ? 0 : -1;
}

function changeMenuZoom(delta) {
  const zoom = Math.max(1, Math.min(maximumZoom, menuZoom + delta));
  if (zoom === menuZoom) return;

  const viewport = menuViewerScroll.getBoundingClientRect();
  const centerX = viewport.left + menuViewerScroll.clientWidth / 2;
  const centerY = viewport.top + menuViewerScroll.clientHeight / 2;
  const before = menuViewerImage.getBoundingClientRect();
  const centerOnImageX = (centerX - before.left) / before.width;
  const centerOnImageY = (centerY - before.top) / before.height;

  menuZoom = zoom;
  renderMenuZoom();

  const after = menuViewerImage.getBoundingClientRect();
  menuViewerScroll.scrollBy({
    left: after.left + after.width * centerOnImageX - centerX,
    top: after.top + after.height * centerOnImageY - centerY,
    behavior: 'instant',
  });
}

function isMenuBackdrop(target) {
  return target.matches('.menu-viewer, .menu-viewer-scroll, .menu-viewer-sheet');
}

menuSheets.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || typeof menuViewer.showModal !== 'function' || event.defaultPrevented ||
      event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

  const preview = link.querySelector('img');
  event.preventDefault();
  openedBy = link;
  startedOnBackdrop = false;
  menuZoom = 1;
  menuViewerImage.alt = preview.alt;
  menuViewerImage.setAttribute('width', preview.getAttribute('width'));
  menuViewerImage.setAttribute('height', preview.getAttribute('height'));
  menuViewerImage.src = link.href;
  menuViewer.showModal();
  renderMenuZoom();
  menuViewerScroll.scrollTo(0, 0);
});

menuZoomIn.addEventListener('click', () => changeMenuZoom(.5));
menuZoomOut.addEventListener('click', () => changeMenuZoom(-.5));
window.addEventListener('resize', () => {
  if (menuViewer.open) renderMenuZoom();
});

menuViewer.addEventListener('pointerdown', (event) => {
  startedOnBackdrop = isMenuBackdrop(event.target);
});

menuViewer.addEventListener('click', (event) => {
  if (startedOnBackdrop && isMenuBackdrop(event.target)) menuViewer.close();
});

menuViewer.addEventListener('close', () => {
  menuViewerImage.removeAttribute('src');
  openedBy?.focus({ preventScroll: true });
});
