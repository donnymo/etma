for (const photo of document.querySelectorAll('.food-photo')) {
  photo.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') photo.setAttribute('data-preview', '');
  });

  photo.addEventListener('pointerleave', () => {
    photo.removeAttribute('data-preview');
  });

  photo.addEventListener('click', (event) => {
    if (event.pointerType === 'mouse' && photo.hasAttribute('data-preview')) return;

    const isAlternate = photo.getAttribute('aria-pressed') === 'true';
    photo.setAttribute('aria-pressed', String(!isAlternate));
  });
}
