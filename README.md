

Wix ↔ HubSpot Bi-Directional Sync App
A full-stack integration system that connects Wix sites with HubSpot CRM, enabling secure OAuth-based authentication, dynamic field mapping, and reliable bi-directional contact synchronization.

Features
Core Sync Engine
•	Wix → HubSpot contact sync (create/update)
•	HubSpot → Wix sync support (webhook-ready)
•	Conflict resolution using updatedAt
•	Duplicate prevention using hashing + sync metadata

OAuth 2.0 Authentication
•	Secure HubSpot OAuth flow
•	Access + refresh token storage in MongoDB
•	Automatic token refresh before expiry
•	No API keys exposed in frontend

Dynamic Field Mapping
•	UI-based mapping configuration
•	Supports:
o	Wix fields → HubSpot properties
o	Direction control (bi-directional supported)
o	Transform rules (trim, lowercase, none)
•	Stored in MongoDB for persistence

Lead & Form Capture
•	Wix form submissions synced to HubSpot
•	Supports:
o	email
o	firstName
o	lastName
o	UTM tracking fields
•	Near real-time sync (API-based)

Loop Prevention
Prevents infinite sync loops using:
•	lastSource tracking (wix | hubspot | system)
•	lastHash comparison
•	Contact ID mapping (Wix ↔ HubSpot)

Architecture
Wix Frontend
   ↓
React Mapping UI
   ↓
Node.js (Express API)
   ↓
MongoDB
   ↓
HubSpot CRM API
   ↑
Webhooks (HubSpot → Wix sync)

Tech Stack
Frontend
•	React (TypeScript)
•	Axios
•	Plain CSS (no UI framework dependency)
Backend
•	Node.js
•	Express.js
•	TypeScript
•	Mongoose
Database
•	MongoDB
External API
•	HubSpot CRM API (OAuth + Contacts API)

Installation
1. Clone Repository
git clone https://github.com/your-username/wix-hubspot-sync.git
cd wix-hubspot-sync

2. Backend Setup
cd hubspot-app
npm install
Create .env
CLIENT_ID=your_hubspot_client_id
CLIENT_SECRET=your_hubspot_client_secret
REDIRECT_URI=http://localhost:4000/oauth/callback
MONGO_URI=your_mongodb_connection
Run backend
npm run dev

3. Frontend Setup
cd client
npm install
npm start
Runs at:
http://localhost:3000

OAuth Flow
1.	User visits:
http://localhost:4000/oauth/login
2.	Redirected to HubSpot authorization
3.	Callback handled at:
http://localhost:4000/oauth/callback
4.	Tokens stored securely in MongoDB

Sync Flow
Wix → HubSpot
Wix Form Submission
   ↓
Sync Engine
   ↓
Mapping Engine applies rules
   ↓
HubSpot Upsert Contact

HubSpot → Wix
HubSpot Webhook
   ↓
Receive event
   ↓
Apply mapping rules
   ↓
Update Wix contact

Conflict Resolution Strategy
function resolveConflict(wix, hubspot) {
  return new Date(wix.updatedAt) > new Date(hubspot.updatedAt)
    ? "wix"
    : "hubspot";
}

Mapping Model
{
  wixField: "email",
  hubspotField: "email",
  direction: "bi_directional",
  transform: "none"
}

API Endpoints
Auth
•	GET /oauth/login
•	GET /oauth/callback
Mapping
•	GET /mapping
•	POST /mapping
Sync
•	POST /sync/wix-to-hubspot
•	POST /webhook/hubspot

Testing
Create mapping
curl -X POST http://localhost:4000/mapping \
-H "Content-Type: application/json" \
-d '[{
  "wixField": "email",
  "hubspotField": "email",
  "direction": "bi_directional",
  "transform": "none"
}]'

Fetch mappings
curl http://localhost:4000/mapping

Sync contact
curl -X POST http://localhost:4000/sync/wix-to-hubspot \
-H "Content-Type: application/json" \
-d '{
  "id": "wix_001",
  "email": "test@example.com",
  "firstName": "Richard"
}'

Security
•	OAuth 2.0 only authentication
•	No API keys exposed in frontend
•	Token refresh mechanism implemented
•	CORS restricted to frontend origin
•	Sensitive data stored in backend only

Key Design Decisions
•	MongoDB for flexible mapping storage
•	REST API for integration simplicity
•	Stateless sync engine using mapping rules
•	Hash-based duplicate prevention
•	Event-driven webhook structure (HubSpot → Wix)

Future Improvements
•	Real-time WebSocket sync
•	Multi-tenant support
•	Admin dashboard analytics
•	Retry queue for failed syncs
•	Rate-limit handling for HubSpot API


Author
Richard Oluwaseun Iyama

 Status
OAuth working
Mapping system working
HubSpot integration working
Sync engine implemented
Webhook sync optional enhancement

