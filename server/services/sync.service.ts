import crypto from "crypto";
import { Mapping } from "../models/Mapping";
import { upsertHubSpotContact } from "./hubspot.service";

/**
 * Create stable hash for idempotency and loop prevention
 */
function createHash(data: any) {
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        email: data.email,
        firstName: data.firstName
      })
    )
    .digest("hex");
}

/**
 * CORE BI-DIRECTIONAL SYNC ENGINE
 */
export async function syncContact({
  source,
  contact
}: {
  source: "wix" | "hubspot";
  contact: any;
}) {
  if (!contact?.email) {
    throw new Error("Contact email is required for sync");
  }

  const incomingHash = createHash(contact);

 
  const existing = await Mapping.findOne({
    $or: [
      { wixContactId: contact.id },
      { hubspotContactId: contact.id },
      { email: contact.email }
    ]
  });

  
  if (
    existing &&
    existing.lastSource === source &&
    existing.lastHash === incomingHash
  ) {
    console.log("Duplicate sync ignored (idempotent)");
    return { skipped: true };
  }

  
  if (
    existing &&
    existing.lastSource !== source &&
    existing.lastHash === incomingHash
  ) {
    console.log("Cross-source duplicate ignored");
    return { skipped: true };
  }

  
  const hubspotPayload = {
    email: contact.email,
    firstname: contact.firstName || ""
  };

  
  const hubspotResponse = await upsertHubSpotContact(hubspotPayload);

  
  await Mapping.findOneAndUpdate(
    {
      $or: [
        { wixContactId: contact.id },
        { hubspotContactId: contact.id },
        { email: contact.email }
      ]
    },
    {
      $set: {
        lastHash: incomingHash,
        lastSource: source,
        updatedAt: new Date()
      },
      $setOnInsert: {
        wixContactId: source === "wix" ? contact.id : undefined,
        hubspotContactId:
          source === "hubspot" ? contact.id : hubspotResponse.id
      }
    },
    { upsert: true, new: true }
  );

  
  console.log("Sync successful", {
    source,
    email: contact.email,
    wixId: contact.id,
    hubspotId: hubspotResponse.id
  });

  return {
    success: true,
    hubspotId: hubspotResponse.id
  };
}