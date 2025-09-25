import express from "express";

import { setupApp } from "./app";

const app = express();
setupApp(app);

const PORT = Number(process.env.PORT) || 5001;

const server = app.listen(PORT);

server.on("listening -> ", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
