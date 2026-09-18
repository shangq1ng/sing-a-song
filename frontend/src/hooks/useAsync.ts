import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'success'; data: T };

export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [nonce, setNonce] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    loaderRef
      .current()
      .then(data => {
        if (active) {
          setState({ status: 'success', data });
        }
      })
      .catch(error => {
        if (active) {
          setState({ status: 'error', error });
        }
      });

    return () => {
      active = false;
    };
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce(value => value + 1), []);

  return { state, reload };
}
