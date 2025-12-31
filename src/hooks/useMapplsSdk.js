import { useEffect, useState } from 'react';

export function useMapplsSdk({ timeoutMs = 8000 } = {}) {
  const [ready, setReady] = useState(() => Boolean(window?.mappls));
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready) return;

    let cancelled = false;
    const startedAt = Date.now();

    const tick = () => {
      if (cancelled) return;
      if (window?.mappls) {
        setReady(true);
        setError('');
        return;
      }

      if (Date.now() - startedAt > timeoutMs) {
        setError('Mappls SDK not loaded');
        return;
      }

      setTimeout(tick, 200);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [ready, timeoutMs]);

  return { ready, error };
}
