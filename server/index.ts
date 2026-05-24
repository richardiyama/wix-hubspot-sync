import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors = require("cors");

import oauth from "./controllers/oauth.controller";
import sync from "./controllers/sync.controller";
import webhook from "./controllers/webhook.controller";
import mapping from "./controllers/mapping.controller";


dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

mongoose.connect(process.env.MONGO_URI!);

mongoose.connection.on("connected", () => {
  console.log("MongoDB Connected ✔");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB Error", err);
});

app.use("/oauth", oauth);
app.use("/sync", sync);
app.use("/webhook", webhook);
app.use("/mapping", mapping);



app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "hubspot-wix-sync",
    timestamp: new Date().toISOString()
  });
});

app.listen(4000, () => console.log("Server running"));