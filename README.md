# Eco alert (CleanCity Civic Sanitation & AI Detection Platform)

> **Final-Year Computer Science Engineering (CSE) AI Vibe Coding Capstone Project**  
> A production-grade, 100% free and open-source civic reporting, machine-learning hazard detection, OpenStreetMap geolocation mapping, and municipal complaint tracking system.

---

## 1. Project Overview & Problem Statement

**Problem Statement (CleanCity):**  
Citizens across metropolitan areas regularly encounter garbage dumpster overflow, illegal construction rubble dumping, and blocked drainage canals, but have no easy way to report these issues or track whether municipal action has been taken. This lack of a simple reporting and accountability system leads to prolonged neglect of everyday sanitation problems.

**CleanCity Solution:**  
**Eco alert** provides an end-to-end civic accountability loop:
1. **Citizens** snap a photo of any civic sanitation violation.
2. **Artificial Intelligence** classifies the waste category, computes a 1–100 severity risk score, tags biological/chemical hazards, and allocates the appropriate municipal department.
3. **Open-Source GIS** pins the incident coordinates on Leaflet OpenStreetMap.
4. **Complaint Tracker** provides a 4-stage transparent lifecycle from report to verified fix with before/after photos.
5. **Municipal Admin Command Center** empowers authorities to dispatch compactor trucks, manage SLAs, and upload resolution proof.

---

## 2. The 5 Core Features

| Feature | Description | Open-Source Tech |
| :--- | :--- | :--- |
| **1. Report Civic Issue** | Photo upload with drag-and-drop, one-click demo presets, HTML5 GPS geolocation coordinates, ward assignment, and anonymous filing. | React, HTML5 Geolocation, Canvas |
| **2. AI Issue Detection** | Computer vision inspection, visual bounding box overlays, confidence score, 1-100 severity rating, health hazard identification, and raw structured JSON export. | Local Intelligent Vision Engine + Optional Gemini 2.5 Flash |
| **3. Location Mapping** | Full interactive OpenStreetMap with status-coded SVG pins (Reported, Under Review, In Progress, Resolved), category filters, and pan/zoom markers. | Leaflet.js, OpenStreetMap (Zero Paid API) |
| **4. Complaint Tracking** | Unique Tracking ID lookup (e.g. `ECO-1042`), 4-stage lifecycle timeline, interactive before/after photo comparison, and citizen priority upvoting. | React, LocalStorage, CSS Slider |
| **5. Admin Dashboard** | Municipal Command Center with real-time KPI metrics, category distribution charts, crew dispatch, resolution proof uploads, and CSV/JSON export. | React, Reactive Event Bus, Blob File Exporter |

---

## 3. 100% Free & Open-Source Cost Verification

This student project strictly follows the **Zero Paid Dependency Guarantee**:

- **No Paid APIs:** Maps use Leaflet + OpenStreetMap instead of paid Google Maps Platform.
- **No Mandatory AI Costs:** Built-in **Intelligent Civic Vision & Heuristic Classification Engine** runs 100% offline in the browser at $0.00 cost. Optional Gemini Free Tier key can be connected if desired.
- **No Paid Database:** Durable client-side persistence via **LocalStorage** with reactive event emission.
- **No Paid Hosting:** Zero-config static Single-Page Application (SPA) compatible with **Vercel** free hobby tier.
- **Total Project Cost:** **$0.00**

---

## 4. Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide Icons, Plus Jakarta Sans
- **Maps / GIS:** Leaflet 1.9.4, OpenStreetMap Tiles
- **AI / Computer Vision:** Browser-based Canvas Feature Extractor + Google GenAI SDK (`@google/genai`)
- **Effects & UI Polish:** Canvas Confetti, Reactive Storage Event Emitter

---

## 5. Folder Structure

```
eco-alert/
├── index.html                 # HTML entry point with OpenStreetMap Leaflet styles
├── metadata.json              # App capabilities & permissions
├── package.json               # NPM packages & build scripts
├── vite.config.ts             # Vite configuration with Tailwind CSS plugin
├── src/
│   ├── main.tsx               # React root entry
│   ├── App.tsx                # Master state controller & tab router
│   ├── index.css              # Global Tailwind CSS imports
│   ├── types/
│   │   └── index.ts           # CivicIssue, AiDetectionResult, CityAnalytics interfaces
│   ├── data/
│   │   └── sampleIssues.ts    # Seed demonstration datasets & presets
│   ├── services/
│   │   ├── aiService.ts       # Dual-Engine AI (Local Heuristics + Gemini SDK)
│   │   └── storageService.ts  # LocalStorage CRUD & reactive subscription
│   └── components/
│       ├── Navbar.tsx         # Header navigation with status counters
│       ├── Footer.tsx         # Footer with student credits & tech badges
│       ├── LandingPage.tsx    # Problem statement, stats, 5 feature cards
│       ├── ReportIssuePage.tsx      # FEATURE 1: Civic issue reporting form
│       ├── AiDetectionPage.tsx       # FEATURE 2: AI issue detection lab & JSON inspector
│       ├── LocationMapPage.tsx       # FEATURE 3: Leaflet OpenStreetMap viewer
│       ├── ComplaintTrackingPage.tsx # FEATURE 4: Complaint timeline & before/after proof
│       ├── AdminDashboardPage.tsx    # FEATURE 5: Municipal command center & CSV export
│       └── HelpAboutModal.tsx        # CSE Capstone Documentation & Viva Guide
└── README.md
```

---

## 6. How to Run Locally

### Prerequisites
- Node.js 18+ installed

### Steps
```bash
# 1. Clone or download the repository
git clone https://github.com/your-username/eco-alert-cleancity.git
cd eco-alert-cleancity

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open http://localhost:3000 in your browser
```

---

## 7. How to Push to GitHub

```bash
git init
git add .
git commit -m "feat: Initial commit of Eco alert CleanCity MVP"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/eco-alert.git
git push -u origin main
```

---

## 8. How to Deploy to Vercel (1-Click)

1. Push your code to GitHub.
2. Sign in to [Vercel](https://vercel.com) (Free Hobby tier).
3. Click **Add New** &rarr; **Project**.
4. Select your `eco-alert` repository.
5. Vercel will automatically detect **Vite**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click **Deploy**. Within 30 seconds, your application will be live with a production HTTPS URL!

---

## 9. AI Implementation Architecture

The application implements a dual-mode AI pipeline:

```
[User Photo + Description]
           ↓
   [aiService.analyzeCivicIssue]
           ↓
 ┌────────────────────────────────────────┐
 │ Is GEMINI_API_KEY available?           │
 └────────────────────────────────────────┘
       │                              │
     (YES)                           (NO)
       ↓                              ↓
[Google Gemini 2.5 Flash]     [Local Intelligent Engine]
- Multimodal Vision Call      - HTML5 Canvas feature extraction
- Strict JSON Schema          - Color variance & organic tone scan
                              - Semantic keyword risk classifier
       │                              │
       └──────────────┬───────────────┘
                      ↓
           [Structured JSON Output]
           - Category Classification
           - Severity Score (1-100)
           - Detected Materials & Hazards
           - Assigned Department & Fix SLA
           - Visual Bounding Coordinates
                      ↓
             [UI Rendering & Report]
```

---

## 10. Final Cost Check

- [x] No credit card required
- [x] No paid subscriptions
- [x] No paid APIs (Leaflet + OpenStreetMap used)
- [x] No paid database (Browser LocalStorage used)
- [x] No paid hosting (Vercel free tier compatible)
- [x] 100% demonstrable offline or without API keys
