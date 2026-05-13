# 🚗 FatigueWatch — Driver Drowsiness Detection System

  > Real-time AI-powered driver fatigue monitoring with live dashboard, GPS tracking, and emergency alerts.

  ---

  ## 📌 Overview

  **FatigueWatch** is a comprehensive driver safety system that uses your device's webcam and MediaPipe computer vision to monitor signs of drowsiness in real time. It detects yawning, eye closure, blink rate, and head position — then triggers graduated audio and visual alerts before a dangerous situation occurs.

  Built for hackathon demonstration and real-world applicability.

  ---

  ## ✨ Features

  ### 🔐 Driver Login
  - Secure sign-in with **Full Name**, **Phone Number**, **Emergency Contact Number**, and **Email**
  - Optional profile photo upload — displayed on the dashboard
  - Strict validation:
    - Phone numbers must be exactly **10 digits**
    - Email must follow proper format (e.g. `name@gmail.com`)
  - All data stored locally on-device — nothing sent to external servers

  ### 📷 Real-Time Drowsiness Detection
  Powered by **MediaPipe FaceMesh** (468 facial landmarks):
  | Metric | Description |
  |--------|-------------|
  | 👁️ Eye State | Open / Drowsy / Closed using Eye Aspect Ratio (EAR) |
  | 😮 Yawn Detection | Triple-check: average MAR > 0.25, peak > 0.30, sustained 25 frames (~0.8s) |
  | 👁️‍🗨️ Blink Rate | Blinks per minute — elevated rate signals fatigue |
  | 🙆 Head Position | Center / Left / Right / Down via nose-eye geometry |
  | 📊 Drowsiness Score | 0–100 composite score driving alert levels |

  ### 🚨 Alert System (3-Tier)
  | Level | Trigger | Sound |
  |-------|---------|-------|
  | ✅ Safe | Score < 35 | Silent |
  | ⚠️ Warning | Score ≥ 35 or drowsy eyes | Two sharp descending tones |
  | 🚨 Critical | Score ≥ 65 | Rapid horn bursts + auto emergency protocol |

  - Alerts play **3 beeps** (1 second apart) then go silent until driver recovers
  - **Critical alert** automatically fires siren sound and on-screen emergency toast

  ### 🆘 Emergency Actions
  - **Emergency Alert button** — plays siren wail and notifies:
    - Ambulance (112)
    - Your registered phone number
    - Your emergency contact number
    - Your email address
  - **Take a Break button** — logs the break and resets the 45-minute reminder

  ### ⏰ 45-Minute Break Reminder
  - Silently tracks time since last break
  - Plays a notification sound and shows a reminder toast every 45 minutes
  - Resets automatically when you tap "Take a Break"

  ### 🗺️ Live GPS Location Tracking
  - Auto-starts on page load using the browser's Geolocation API
  - Live map (OpenStreetMap via Leaflet — **no API key needed**)
  - Plots route trail, shows live speed and GPS accuracy
  - Re-center button to snap back to current position

  ### 📊 Analytics Dashboard
  - Real-time fatigue score chart (Recharts)
  - Detection event log with timestamps
  - Metrics cards: drowsiness score, blink rate, eye state, head position
  - System health indicators and WebSocket connection status

  ---

  ## 🛠️ Tech Stack

  | Layer | Technology |
  |-------|-----------|
  | Frontend | React 18 + TypeScript |
  | Styling | Tailwind CSS + Shadcn/ui + Radix UI |
  | Computer Vision | MediaPipe FaceMesh |
  | Maps | Leaflet + OpenStreetMap |
  | Charts | Recharts |
  | State | TanStack Query (React Query) |
  | Routing | Wouter |
  | Real-time | WebSocket |
  | Backend | Node.js + Express.js |
  | ORM | Drizzle ORM (PostgreSQL-ready) |
  | Build | Vite + ESBuild |

  ---

  ## 🚀 Getting Started

  ### Prerequisites
  - Node.js 18+
  - npm

  ### Installation

  ```bash
  git clone https://github.com/Kishore10kumar/hack.git
  cd hack
  npm install
  ```

  ### Run in Development

  ```bash
  npm run dev
  ```

  Open [http://localhost:5000](http://localhost:5000) in your browser.

  > **Camera permission required** — allow webcam access when prompted for detection to work.

  ---

  ## 📁 Project Structure

  ```
  hack/
  ├── client/
  │   └── src/
  │       ├── components/         # UI components (webcam, profile, charts, map)
  │       ├── context/            # UserContext (login state)
  │       ├── hooks/              # Custom React hooks
  │       ├── lib/                # Core logic (face detection, audio alerts)
  │       └── pages/              # Login & Dashboard pages
  ├── server/
  │   ├── index.ts                # Express server
  │   ├── routes.ts               # API routes
  │   └── storage.ts              # In-memory data store
  └── shared/
      └── schema.ts               # Drizzle schema + Zod types
  ```

  ---

  ## 🖥️ Usage

  1. Open the app → **Driver Sign In** page appears
  2. Fill in your name, phone (10 digits), emergency contact, and email
  3. Optionally upload your profile photo
  4. Click **Start Monitoring** → dashboard opens with live webcam feed
  5. Allow camera access — detection starts automatically
  6. In case of emergency, tap the **Emergency Alert** button

  ---

  ## 🔒 Privacy

  - All driver data is stored in **browser localStorage only**
  - No video or images are ever uploaded or saved
  - Location data stays on-device and is used only for the live map view

  ---

  ## 👨‍💻 Author

  **Kishore Kumar**  
  GitHub: [@Kishore10kumar](https://github.com/Kishore10kumar)

  ---

  ## 📄 License

  MIT License — free to use, modify, and distribute.
  