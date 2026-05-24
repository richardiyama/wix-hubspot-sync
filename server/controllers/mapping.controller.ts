import express from "express";
import { Mapping } from "../models/Mapping";

const router = express.Router();

/**
 * Save mappings (replace all mappings)
 */
router.post("/", async (req, res) => {
  try {
    const mappings = req.body;

    if (!Array.isArray(mappings)) {
      return res.status(400).json({
        error: "Mappings must be an array"
      });
    }

    
    await Mapping.deleteMany({});
    await Mapping.insertMany(mappings);

    res.json({
      success: true,
      count: mappings.length
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to save mappings",
      message: err.message
    });
  }
});


router.get("/", async (req, res) => {
  try {
    const mappings = await Mapping.find({});
    return res.json(mappings);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch mappings" });
  }
});


export default router;