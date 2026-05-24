import React, { useEffect, useState } from "react";
import axios from "axios";

type Direction = "wix_to_hubspot" | "hubspot_to_wix" | "bi_directional";

type MappingRow = {
  id?: string;
  wixField: string;
  hubspotField: string;
  direction: Direction;
  transform?: string;
};

const defaultWixFields = ["email", "firstName", "lastName"];
const hubspotFields = ["email", "firstname", "lastname"];

export default function FieldMappingUI() {
  const [rows, setRows] = useState<MappingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  
  // LOAD MAPPINGS
  
  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get("http://localhost:4000/mapping");

        if (Array.isArray(res.data)) {
          setRows(res.data);
        } else {
          setRows([]);
        }
      } catch (err) {
        console.error("Failed to load mappings", err);
        setRows([]);
      } finally {
        setInitialLoading(false);
      }
    }

    load();
  }, []);

  
  // ADD ROW
 
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        wixField: "",
        hubspotField: "",
        direction: "bi_directional",
        transform: "none"
      }
    ]);
  };

  
  // UPDATE ROW
  
  const updateRow = (
    index: number,
    key: keyof MappingRow,
    value: string
  ) => {
    setRows((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [key]: value
      };

      return updated;
    });
  };

 
  // REMOVE ROW
  
  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  
  // VALIDATION
  
  const isValid = () => {
    const hubspotSet = new Set<string>();

    for (const row of rows) {
      if (!row.wixField || !row.hubspotField) return false;

      if (hubspotSet.has(row.hubspotField)) {
        return false;
      }

      hubspotSet.add(row.hubspotField);
    }

    return true;
  };

 
  // SAVE
  
  const saveMappings = async () => {
    if (!isValid()) {
      alert("Invalid mapping: missing fields or duplicates detected");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:4000/mapping", rows);
      alert("Mappings saved successfully");
    } catch (err: any) {
  console.error("FULL ERROR:", err);
  console.error("RESPONSE DATA:", err?.response?.data);
  console.error("STATUS:", err?.response?.status);

  alert(
    err?.response?.data?.error ||
    "Failed to save mappings"
  );

    } finally {
      setLoading(false);
    }
  };

  
  // UI
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Field Mapping Configuration</h2>

      <p style={styles.subtitle}>
        Map Wix fields to HubSpot properties for bi-directional sync
      </p>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Wix Field</th>
            <th>HubSpot Property</th>
            <th>Direction</th>
            <th>Transform</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {initialLoading ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 15 }}>
                Loading mappings...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 15 }}>
                No mappings yet. Click “Add Mapping”
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={row.id || index}>
                {/* Wix Field */}
                <td>
                  <select
                    value={row.wixField}
                    onChange={(e) =>
                      updateRow(index, "wixField", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {defaultWixFields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </td>

                {/* HubSpot Field */}
                <td>
                  <select
                    value={row.hubspotField}
                    onChange={(e) =>
                      updateRow(index, "hubspotField", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {hubspotFields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Direction */}
                <td>
                  <select
                    value={row.direction}
                    onChange={(e) =>
                      updateRow(index, "direction", e.target.value)
                    }
                  >
                    <option value="wix_to_hubspot">Wix → HubSpot</option>
                    <option value="hubspot_to_wix">HubSpot → Wix</option>
                    <option value="bi_directional">Bi-directional</option>
                  </select>
                </td>

                {/* Transform */}
                <td>
                  <input
                    value={row.transform || ""}
                    placeholder="trim | lowercase | none"
                    onChange={(e) =>
                      updateRow(index, "transform", e.target.value)
                    }
                  />
                </td>

                {/* Delete */}
                <td>
                  <button onClick={() => removeRow(index)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Actions */}
      <div style={styles.actions}>
        <button onClick={addRow}>+ Add Mapping</button>

        <button
          onClick={saveMappings}
          disabled={loading || !isValid()}
        >
          {loading ? "Saving..." : "Save Mapping"}
        </button>
      </div>
    </div>
  );
}


  // STYLES

const styles: any = {
  container: {
    padding: 20,
    fontFamily: "Arial",
    maxWidth: 900
  },
  title: {
    fontSize: 22,
    fontWeight: "bold"
  },
  subtitle: {
    marginBottom: 20,
    color: "#666"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  actions: {
    marginTop: 20,
    display: "flex",
    gap: 10
  }
};