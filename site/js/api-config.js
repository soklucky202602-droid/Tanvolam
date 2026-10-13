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
    } catch (_) { return raw; }
  }

  window.fetch = function (input, init) {
    const apiUrl = toApiUrl(input);
    const isRequestObject = typeof input !== 'string' && input instanceof Request;
    let nextInput = input;
    let nextInit = init ? { ...init } : {};
    if (apiUrl && apiUrl !== (typeof input === 'string' ? input : input?.url)) {
      if (isRequestObject) nextInput = new Request(apiUrl, input);
      else nextInput = apiUrl;
    }
    if (!Object.prototype.hasOwnProperty.call(nextInit, 'credentials')) nextInit.credentials = 'include';
    return nativeFetch(nextInput, nextInit);
  };

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

  // VLTKIDLE2-style ADMV runtime: the admin only queues commands;
  // the game client consumes and applies them while the character is open.
  const tag=document.createElement('script');
  tag.src='/js/admv-runtime.js?v=20261013-queue1';
  tag.async=false;
  (document.head||document.documentElement).appendChild(tag);
})();
