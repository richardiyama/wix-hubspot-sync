import express from "express";
import { Mapping } from "../models/Mapping";

const router = express.Router();

/**
 * HubSpot → Wix Sync 
 */
router.post("/webhook", async (req, res) => {
  try {
   
    const event = req.body?.[0];

    if (!event?.objectId) {
      return res.status(400).json({
        error: "Invalid webhook payload"
      });
    }

    const hubspotContactId = event.objectId;

    const existing = await Mapping.findOne({
      hubspotContactId
    });

    // Prevent reverse-loop 
    if (existing?.lastSource === "wix") {
      return res.sendStatus(200);
    }

   

    await Mapping.findOneAndUpdate(
      { hubspotContactId },
      {
        hubspotContactId,
        lastSource: "hubspot",
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return res.sendStatus(200);
  } catch (err) {
    console.error("HUBSPOT → WIX WEBHOOK ERROR:", err);
    return res.status(500).json({
      error: "webhook_failed"
    });
  }
});

export default router;