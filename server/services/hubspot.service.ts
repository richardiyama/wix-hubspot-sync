import axios from "axios";
import { getAccessToken } from "./token.service";

export async function upsertHubSpotContact(data: any) {
  try {
    const token = await getAccessToken();

    if (!token) {
      throw new Error("No access token found");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    console.log("Syncing contact:", data.email);

    // Search by email
    const searchRes = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/contacts/search",
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: data.email
              }
            ]
          }
        ]
      },
      { headers }
    );

    // Update if exists
    if (searchRes.data.results.length > 0) {
      const contactId = searchRes.data.results[0].id;

      console.log("🔁 Updating existing contact:", contactId);

      const updateRes = await axios.patch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
        {
          properties: {
            firstname: data.firstName || data.firstname
          }
        },
        { headers }
      );

      return {
        id: contactId,
        action: "updated",
        data: updateRes.data
      };
    }

    // Create if not found
    console.log("Creating new contact");

    const createRes = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        properties: {
          email: data.email,
          firstname: data.firstName || data.firstname
        }
      },
      { headers }
    );

    return {
      id: createRes.data.id,
      action: "created",
      data: createRes.data
    };

  } catch (error: any) {
    console.error(
      "HubSpot ERROR:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message || "HubSpot sync failed"
    );
  }
}