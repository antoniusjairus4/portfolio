history.scrollRestoration = 'auto';

(() => {
  const navigation = performance.getEntriesByType('navigation')[0];
  const isHistoryTraversal = navigation && navigation.type === 'back_forward';
  const hasDirectTarget = window.location.hash.length > 1;

  if (!isHistoryTraversal && !hasDirectTarget) {
    window.scrollTo(0, 0);
    window.addEventListener(
      'pageshow',
      (event) => {
        if (!event.persisted) window.scrollTo(0, 0);
      },
      { once: true },
    );
  }

  window.addEventListener('pagehide', () => {
    history.replaceState({ ...history.state, __portfolioScrollY: window.scrollY }, '');
  });
})();
