import express from "express";
import axios from "axios";
import { Token } from "../models/Token";

const router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID!;
const REDIRECT_URI = process.env.REDIRECT_URI!;


router.get("/login", (req, res) => {
  const url = `https://app.hubspot.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=contacts`;

  res.redirect(url);
});

router.get("/callback", async (req, res) => {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).send("Missing code");
    }

    const { data } = await axios.post(
      "https://api.hubapi.com/oauth/v1/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        redirect_uri: process.env.REDIRECT_URI!,
        code
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    console.log("TOKEN RECEIVED:", data);

    
    await Token.deleteMany({});

    const saved = await Token.create({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000
    });

    console.log("TOKEN SAVED:", saved._id);

    return res.send("HubSpot Connected Successfully");
  } catch (err: any) {
    console.error("OAuth Error:", err.response?.data || err.message);
    return res.status(500).send("OAuth failed");
  }
});

export default router;