import { Request, Response } from "express";
import { syncContact } from "../services/sync.service";

export async function wixToHubSpotHandler(req: Request, res: Response) {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Missing request body" });
    }

    await syncContact({
      source: "wix",
      contact: req.body
    });

    return res.json({ success: true });
  } catch (err: any) {
    console.error("WIX HANDLER ERROR:", err);

    return res.status(500).json({
      error: "sync failed",
      message: err.message
    });
  }
}