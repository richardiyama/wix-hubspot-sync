import express from "express";

const router = express.Router();

let mappings: any[] = [];

// GET
router.get("/", (_, res) => {
  res.json(mappings);
});

// SAVE
router.post("/", (req, res) => {
  mappings = req.body;
  res.json({ success: true });
});

export default router;