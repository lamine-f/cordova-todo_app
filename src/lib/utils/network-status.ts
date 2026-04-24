export const NetworkStatus = {
  isOnline: () => navigator.onLine,
  onChange: (fn: (online: boolean) => void) => {
    window.addEventListener('online',  () => fn(true));
    window.addEventListener('offline', () => fn(false));
  }
};
