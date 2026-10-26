history.scrollRestoration = 'manual';

(() => {
  const navigation = performance.getEntriesByType('navigation')[0];
  const shouldRestore =
    navigation && (navigation.type === 'reload' || navigation.type === 'back_forward');
  const hasDirectTarget = window.location.hash.length > 1;
  const storageKey = `portfolio-scroll:${window.location.pathname}${window.location.search}`;
  const historyScrollY = history.state?.__portfolioScrollY;
  const storedScrollY = Number(sessionStorage.getItem(storageKey));
  const savedScrollY =
    typeof historyScrollY === 'number' && Number.isFinite(historyScrollY)
      ? historyScrollY
      : Number.isFinite(storedScrollY)
        ? storedScrollY
        : 0;

  window.__portfolioInitialScrollY = !hasDirectTarget && shouldRestore ? savedScrollY : 0;

  const saveScrollPosition = () => {
    sessionStorage.setItem(storageKey, String(window.scrollY));
    history.replaceState({ ...history.state, __portfolioScrollY: window.scrollY }, '');
  };

  window.addEventListener('pagehide', saveScrollPosition);
  window.addEventListener('beforeunload', saveScrollPosition);
})();
