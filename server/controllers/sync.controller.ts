import express from "express";
import { Mapping } from "../models/Mapping";
import { upsertHubSpotContact } from "../services/hubspot.service";
import { hash } from "../services/hash.service";

const router = express.Router();

/**
 * Wix → HubSpot Sync
 */
router.post("/wix-to-hubspot", async (req, res) => {
  try {
    const contact = req.body;

    if (!contact?.id || !contact?.email) {
      return res.status(400).json({
        error: "Invalid payload"
      });
    }

    const payload = {
      email: contact.email,
      firstname: contact.firstName || ""
    };

    const newHash = hash(payload);

    const existing = await Mapping.findOne({
      wixContactId: contact.id
    });

    //TRUE IDEMPOTENCY CHECK 
    if (
      existing?.lastHash === newHash &&
      existing?.lastSource === "wix"
    ) {
      return res.sendStatus(200);
    }

    // Push to HubSpot
    const hubspot = await upsertHubSpotContact(payload);

    // Upsert mapping
    await Mapping.findOneAndUpdate(
      { wixContactId: contact.id },
      {
        wixContactId: contact.id,
        hubspotContactId: hubspot.id,
        lastHash: newHash,
        lastSource: "wix",
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return res.sendStatus(200);
  } catch (err: any) {
  console.error("HUBSPOT RAW ERROR:", err.response?.data || err.message);

  throw new Error(
    err.response?.data?.message || err.message || "OAuth failed"
  );
}
});

export default router;