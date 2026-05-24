import axios from "axios";
import { Token } from "../models/Token";

export async function getAccessToken(): Promise<string> {
  const token = await Token.findOne();

  if (!token || !token.accessToken || !token.refreshToken) {
    throw new Error("OAuth token not initialized. Please run HubSpot OAuth flow again.");
  }

  const expiresAt = Number(token.expiresAt);

  if (!expiresAt || Number.isNaN(expiresAt)) {
    throw new Error("Invalid token expiry date in database");
  }

  // Add safety buffer for 60s early refresh
  const buffer = 60 * 1000;

  // Still valid to return cached token
  if (Date.now() < expiresAt - buffer) {
    return token.accessToken;
  }

  console.log("Refreshing HubSpot access token...");

  try {
    const { data } = await axios.post(
      "https://api.hubapi.com/oauth/v1/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        refresh_token: token.refreshToken
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        timeout: 10000
      }
    );

    if (!data?.access_token) {
      throw new Error("HubSpot did not return access_token");
    }

    const newExpiry = Date.now() + data.expires_in * 1000;

    // atomic update safety
    await Token.updateOne(
      { _id: token._id },
      {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || token.refreshToken,
        expiresAt: newExpiry
      }
    );

    console.log("Token refreshed successfully");

    return data.access_token;
  } catch (err: any) {
    console.error(
      "HubSpot token refresh failed:",
      err.response?.data || err.message
    );

    throw new Error("Failed to refresh HubSpot access token");
  }
}