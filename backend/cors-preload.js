'use strict';

// Render hosts the frontend and API on different origins. This tiny preload
// adds CORS headers and answers browser preflight requests without requiring
// any change to the existing API route implementation.
const http = require('http');
const FRONTEND_ORIGIN = 'https://tanvolam.onrender.com';
const nativeCreateServer = http.createServer;

http.createServer = function patchedCreateServer(requestListener, ...args) {
  return nativeCreateServer.call(http, (req, res) => {
    const origin = req.headers.origin;
    const allowed = origin === FRONTEND_ORIGIN;

    if (allowed) {
      res.setHeader('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Vary', 'Origin');
    }

    if (req.method === 'OPTIONS' && allowed) {
      res.statusCode = 204;
      res.end();
      return;
    }

    return requestListener(req, res);
  }, ...args);
};
