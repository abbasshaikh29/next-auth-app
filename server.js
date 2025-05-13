const express = require("express");
const next = require("next");
const errorHandler = require("./src/lib/errorHandler").default;
const { createServer } = require("http");
const { initSocketIO } = require("./src/lib/socket");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressServer = express();
  const httpServer = createServer(expressServer);

  // Initialize Socket.io with our global instance
  initSocketIO(httpServer);

  // No need to make io accessible to our API routes anymore
  // as we'll use the global instance directly

  expressServer.use(errorHandler);

  expressServer.all("*", (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
