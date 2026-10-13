/* Tanvolam API bridge
   Frontend is hosted on Render Static Site while the API runs on a separate
   Render Web Service. Keep the browser URL unchanged and route only /api/*
   requests to the API service.
*/
(function () {
  'use strict';

  const API_ORIGIN = 'https://tanvolam-api.onrender.com';
  window.JX_API_ORIGIN = API_ORIGIN;

  const nativeFetch = window.fetch.bind(window);
  function toApiUrl(input) {
    const raw = typeof input === 'string' ? input : (input && input.url);
    if (!raw) return raw;
    try {
      const url = new URL(raw, window.location.href);
      if (url.origin === window.location.origin && url.pathname.startsWith('/api/')) {
        return API_ORIGIN + url.pathname + url.search + url.hash;
      }
      return raw;
    } catch (_) {
      return raw;
    }
  }

  window.fetch = function (input, init) {
    const apiUrl = toApiUrl(input);
    const isRequestObject = typeof input !== 'string' && input instanceof Request;
    let nextInput = input;
    let nextInit = init ? { ...init } : {};

    if (apiUrl && apiUrl !== (typeof input === 'string' ? input : input?.url)) {
      if (isRequestObject) {
        nextInput = new Request(apiUrl, input);
      } else {
        nextInput = apiUrl;
      }
    }

    // Authentication uses the jx_session cookie. Cross-origin fetches need
    // explicit credentials, while same-origin asset requests remain valid.
    if (!Object.prototype.hasOwnProperty.call(nextInit, 'credentials')) {
      nextInit.credentials = 'include';
    }

    return nativeFetch(nextInput, nextInit);
  };

  // The chat stream may use EventSource rather than fetch(). Rewrite its
  // relative /api/* URL and keep the login cookie on the cross-origin stream.
  if (typeof window.EventSource === 'function') {
    const NativeEventSource = window.EventSource;
    const PatchedEventSource = function (url, config) {
      const nextConfig = config ? { ...config } : {};
      nextConfig.withCredentials = true;
      return new NativeEventSource(toApiUrl(url), nextConfig);
    };
    PatchedEventSource.prototype = NativeEventSource.prototype;
    PatchedEventSource.CONNECTING = NativeEventSource.CONNECTING;
    PatchedEventSource.OPEN = NativeEventSource.OPEN;
    PatchedEventSource.CLOSED = NativeEventSource.CLOSED;
    window.EventSource = PatchedEventSource;
  }
})();
