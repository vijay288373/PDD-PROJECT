# Agri Guard AI

A premium React + Vite progressive web application (PWA) designed to empower farmers with real-time AI-powered plant disease diagnoses, live meteorological forecasts, and agricultural mandi price intelligence.

This application runs fully locally **without any Base44 server dependency** and is ready to be hosted online with a real-time cloud database!

---

## 🚀 Key Features

* 📱 **Plant Scan & Diagnose**: Upload leaf photos to receive instant organic & chemical treatment options, severity evaluations, and agronomical recommendations (powered by Google Gemini API).
* 🌦️ **Live Geolocation Weather**: Displays current and 7-day physical weather parameters (temp, wind, relative humidity, rain probability, uv index) fetched in real-time from the **Open-Meteo API** based on actual coordinates.
* 📊 **Indian Mandi Prices**: Real-time mandi rates and AI commodity price forecasts grounded through live **Google Search**.
* 🔌 **Hybrid Cloud Database (Supabase REST)**: Performs all data synchronization (profile, scan history, alerts) directly against a **Supabase database** in real-time if credentials are set, and falls back to browser `localStorage` if not set.

---

## 🛠️ Quick Start

### 1. Prerequisites
1. Open the project folder in your terminal.
2. Install dependencies:
   ```bash
   npm install
   ```

### 2. Configure Environment Variables
Copy `.env.example` to a new file named `.env`:
```env
# Paste your Gemini API key here (get one free at https://aistudio.google.com/)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Supabase cloud database (leave empty to use local browser storage)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 3. Run Locally
Start the development server:
```bash
# If PowerShell script running is disabled on your machine, run via cmd:
cmd /c "node_modules\.bin\vite.cmd --port 5173"

# Otherwise:
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🗄️ Cloud Database Setup (Supabase)

To enable persistent data storage across devices:
1. Create a free project on [Supabase](https://supabase.com/).
2. Open the **SQL Editor** in your Supabase dashboard and execute the tables creation script provided inside [`implementation_plan.md`](file:///C:/Users/vijay/.gemini/antigravity/brain/c48c74f9-08b5-4edb-944d-99fc79776e96/implementation_plan.md).
3. Copy your project URL and Anon Key into your `.env` file or hosting provider's environment variables.

