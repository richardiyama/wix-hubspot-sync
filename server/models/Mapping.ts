import mongoose from "mongoose";

const MappingSchema = new mongoose.Schema({
  // Field mapping
  wixField: { type: String, required: true },
  hubspotField: { type: String, required: true },

  // Direction 
  direction: {
    type: String,
    enum: ["wix_to_hubspot", "hubspot_to_wix", "bi_directional"],
    default: "bi_directional"
  },

  // Transform 
  transform: {
    type: String,
    enum: ["trim", "lowercase", "none"],
    default: "none"
  },

  // Sync tracking
  wixContactId: { type: String },
  hubspotContactId: { type: String },

  lastHash: { type: String },

  lastSource: {
    type: String,
    enum: ["wix", "hubspot", "system"],
    default: "system"
  },

  updatedAt: { type: Date, default: Date.now }
});

export const Mapping = mongoose.model("Mapping", MappingSchema);