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
      if (url.origin === window.location.origin && url.pathname.startsWith('/api/')) return API_ORIGIN + url.pathname + url.search + url.hash;
      return raw;
    } catch (_) { return raw; }
  }
  window.fetch=function(input,init){const apiUrl=toApiUrl(input),isReq=typeof input!=='string'&&input instanceof Request;let ni=init?{...init}:{};let next=input;if(apiUrl&&(apiUrl!==(typeof input==='string'?input:input?.url))){next=isReq?new Request(apiUrl,input):apiUrl}if(!Object.prototype.hasOwnProperty.call(ni,'credentials'))ni.credentials='include';return nativeFetch(next,ni)};
  if(typeof window.EventSource==='function'){
    const NativeEventSource=window.EventSource;
    const Patched=function(url,config){const c=config?{...config}:{};c.withCredentials=true;return new NativeEventSource(toApiUrl(url),c)};
    Patched.prototype=NativeEventSource.prototype;Patched.CONNECTING=NativeEventSource.CONNECTING;Patched.OPEN=NativeEventSource.OPEN;Patched.CLOSED=NativeEventSource.CLOSED;window.EventSource=Patched;
  }
  const tag=document.createElement('script');
  tag.src='/js/admv-runtime.js?v=20261013-engine1';
  tag.async=false;
  (document.head||document.documentElement).appendChild(tag);
})();