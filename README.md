<p align="center">
  <img src="https://img.shields.io/badge/AI-Powered-6366f1?style=for-the-badge&logo=openai&logoColor=white" alt="AI Powered" />
  <img src="https://img.shields.io/badge/Delhi--NCR-Traffic%20Intelligence-06b6d4?style=for-the-badge&logo=googlemaps&logoColor=white" alt="Delhi-NCR" />
  <img src="https://img.shields.io/badge/Status-Live-10b981?style=for-the-badge&logo=statuspage&logoColor=white" alt="Status" />
  <img src="https://img.shields.io/badge/Version-2.0-8b5cf6?style=for-the-badge&logo=semver&logoColor=white" alt="Version" />
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://readme-typing-svg.demolab.com?font=Outfit&weight=800&size=42&pause=1000&color=818CF8&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=60&lines=FlowSense+%E2%9A%A1+AI+Traffic+Intelligence" />
    <img src="https://readme-typing-svg.demolab.com?font=Outfit&weight=800&size=42&pause=1000&color=6366F1&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=60&lines=FlowSense+%E2%9A%A1+AI+Traffic+Intelligence" alt="FlowSense" />
  </picture>
</p>

<p align="center">
  <em>Next-generation real-time urban traffic intelligence platform for Delhi-NCR.<br/>
  Predict congestion. Optimize routes. Save the city — one signal at a time.</em>
</p>

<p align="center">
  <a href="#-live-demo"><img src="https://img.shields.io/badge/🚀_Live_Demo-Click_Here-6366f1?style=for-the-badge" alt="Live Demo" /></a>
  &nbsp;
  <a href="#-quick-start"><img src="https://img.shields.io/badge/⚡_Quick_Start-Setup_Guide-06b6d4?style=for-the-badge" alt="Quick Start" /></a>
  &nbsp;
  <a href="#-architecture"><img src="https://img.shields.io/badge/🏗️_Architecture-Deep_Dive-8b5cf6?style=for-the-badge" alt="Architecture" /></a>
</p>

---

## 🚀 Live Demo

| Environment | URL | Status |
|:-----------:|:---:|:------:|
| **Production** | [**🔗 your-deployment-url.vercel.app**](#) | ![Live](https://img.shields.io/badge/●-Live-10b981?style=flat-square) |
| **Staging** | [🔗 staging link](#) | ![Staging](https://img.shields.io/badge/●-Staging-f59e0b?style=flat-square) |
| **API Docs** | [🔗 /docs](#) | ![API](https://img.shields.io/badge/●-Swagger-06b6d4?style=flat-square) |

> 💡 **Replace the links above** with your actual deployment URLs after deploying.

---

## 🎯 What is FlowSense?

**FlowSense** is an AI-powered **urban traffic command center** that transforms how cities manage mobility. Built specifically for **Delhi-NCR's 14 critical zones**, it combines machine learning, real-time data simulation, and an ultra-premium glassmorphism interface to deliver:

- 🧠 **Predictive Intelligence** — 30–120 min congestion forecasting with SHAP explainability
- 🗺️ **Smart Routing** — Dijkstra-based pathfinding with toll, emissions & AI scoring
- 🎛️ **Command Center** — City-wide operational dashboard with weather impact modeling
- 🚨 **Emergency Response** — One-click green corridor activation with signal override
- 💬 **AI Assistant** — Hinglish conversational bot trained on Delhi-NCR traffic patterns
- 📊 **Analytics Engine** — Heatmaps, zone comparison, temporal pattern analysis

---

## ✨ Feature Highlights

<table>
<tr>
<td width="50%">

### 🏙️ Dashboard
- Real-time congestion pulse for 14 zones
- Animated stat cards with AI confidence scores
- Interactive Leaflet map with heatmap overlays
- Live incident feed & camera alerts
- Flood risk, pollution AQI & airport access

</td>
<td width="50%">

### 🧭 Route Lab
- 3-way route comparison (Fastest / Economical / Eco)
- Toll fee estimation (NHAI/FASTag data)
- CO₂ emission tracking per route
- AI recommendation scoring (0–100%)
- Emergency corridor with signal override

</td>
</tr>
<tr>
<td width="50%">

### 🎛️ Command Center
- Predictive traffic timeline (30/60 min)
- Weather forecast with rain impact modeling
- Upcoming events & road closure tracking
- Smart signal grid monitoring (48 intersections)
- Actionable items with priority scoring
- Public safety alerts & pollution hotspots

</td>
<td width="50%">

### 📊 Analytics & AI
- Zone-vs-zone congestion comparison
- Temporal heatmaps (hour × zone matrix)
- SHAP explainability charts
- Bar/line charts with Recharts
- Predictive confidence breakdown
- EV charging station availability

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
flowsense/
├── 🎨 frontend/                    # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx                 # Main layout + routing (877 LOC)
│   │   ├── App.css                 # Premium glassmorphism design system
│   │   ├── index.css               # Foundation layer + animations
│   │   ├── demoData.js             # Full Delhi-NCR simulation engine
│   │   ├── TrafficMap.jsx          # Leaflet map + heatmap + routes
│   │   ├── SHAPPanel.jsx           # SHAP explainability visualization
│   │   └── components/
│   │       ├── Sidebar.jsx         # Animated nav with spring physics
│   │       ├── ParticleCanvas.jsx  # Mouse-interactive particle system
│   │       ├── CommandCenter.jsx   # City AI operations hub
│   │       ├── AnalyticsView.jsx   # Charts & data visualization
│   │       ├── WeatherPanel.jsx    # Weather impact module
│   │       ├── SettingsPanel.jsx   # User preferences
│   │       ├── NotificationCenter.jsx  # Alert management
│   │       └── AnimatedCounter.jsx # Smooth number transitions
│   └── index.html                  # SEO-optimized entry point
│
├── ⚙️ backend/                     # FastAPI server
│   ├── main.py                     # API routes & WebSocket
│   ├── predictive_engine.py        # ML inference pipeline
│   └── ai_capabilities.py         # Advanced AI features
│
├── 🤖 ml/                          # Machine Learning
│   ├── model.pkl                   # Trained XGBoost model (1.7MB)
│   ├── features.pkl                # Feature pipeline
│   ├── best_params.json            # Hyperparameter config
│   ├── train.py                    # Model training script
│   ├── preprocess.py               # Data preprocessing
│   └── generate_synthetic_dataset.py  # Delhi-NCR data generator
│
├── 📁 data/                        # Supporting datasets
├── 📓 notebooks/                   # Jupyter experiments
├── 🧪 test_backend.py             # API test suite
└── 📋 requirements.txt            # Python dependencies
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center"><b>Layer</b></td>
<td align="center"><b>Technologies</b></td>
</tr>
<tr>
<td><b>Frontend</b></td>
<td>
  <img src="https://img.shields.io/badge/React-19.2-61dafb?logo=react&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Vite-8.0-646cff?logo=vite&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-ff69b4?logo=framer&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Recharts-3.8-22b5bf?style=flat-square" />
  <img src="https://img.shields.io/badge/Lucide-Icons-f56565?style=flat-square" />
</td>
</tr>
<tr>
<td><b>Backend</b></td>
<td>
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Uvicorn-0.24-2196f3?style=flat-square" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776ab?logo=python&logoColor=white&style=flat-square" />
</td>
</tr>
<tr>
<td><b>ML / AI</b></td>
<td>
  <img src="https://img.shields.io/badge/XGBoost-2.0+-ff6600?logo=xgboost&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/scikit--learn-1.4-f7931e?logo=scikit-learn&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/NumPy-1.26-013243?logo=numpy&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Pandas-2.2-150458?logo=pandas&logoColor=white&style=flat-square" />
</td>
</tr>
<tr>
<td><b>Design</b></td>
<td>
  <img src="https://img.shields.io/badge/Glassmorphism-UI-6366f1?style=flat-square" />
  <img src="https://img.shields.io/badge/Inter-Typography-000?style=flat-square" />
  <img src="https://img.shields.io/badge/Outfit-Display_Font-818cf8?style=flat-square" />
  <img src="https://img.shields.io/badge/JetBrains_Mono-Code-22d3ee?style=flat-square" />
</td>
</tr>
</table>

---

## ⚡ Quick Start

### Prerequisites

| Tool | Version | Required |
|:----:|:-------:|:--------:|
| Node.js | ≥ 18.x | ✅ |
| npm | ≥ 9.x | ✅ |
| Python | ≥ 3.10 | ⬜ Backend only |
| Git | Latest | ✅ |

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/flowsense.git
cd flowsense

# Install frontend dependencies
cd frontend
npm install
```

### 2️⃣ Run Frontend (Standalone — No Backend Needed!)

```bash
npm run dev
```

> 🎉 The frontend runs **fully standalone** with a built-in demo data engine that simulates all Delhi-NCR traffic intelligence. No backend required!

### 3️⃣ Run Backend (Optional — for production ML inference)

```bash
# From project root
python -m venv venv
venv\Scripts\Activate.ps1        # Windows
# source venv/bin/activate       # macOS/Linux

pip install -r requirements.txt
uvicorn backend.main:app --reload
```

### 4️⃣ Build for Production

```bash
cd frontend
npm run build    # Output: frontend/dist/
npm run preview  # Preview production build locally
```

---

## 🌐 Deployment

### Vercel (Recommended for Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Netlify

```bash
cd frontend
npm run build
# Drag & drop `dist/` folder to netlify.com
```

### Docker (Full Stack)

```dockerfile
# Frontend
FROM node:18-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY ml/ ./ml/
COPY --from=frontend /app/dist ./static/
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🗺️ Delhi-NCR Coverage

FlowSense monitors **14 critical traffic zones** across the National Capital Region:

| Zone | Coordinates | Typical Congestion |
|:-----|:----------:|:------------------:|
| Connaught Place | 28.6328°N, 77.2197°E | 🔴 Very High |
| IGI Airport | 28.5562°N, 77.1000°E | 🟠 High |
| Cyber Hub (Gurugram) | 28.5034°N, 77.0880°E | 🟠 High |
| AIIMS | 28.5672°N, 77.2100°E | 🔴 Very High |
| Noida Sector 18 | 28.5718°N, 77.3207°E | 🟠 High |
| MG Road | 28.5603°N, 77.2336°E | 🟠 High |
| Dwarka Mor | 28.6034°N, 77.0628°E | 🟡 Medium |
| Lajpat Nagar | 28.5672°N, 77.2522°E | 🟡 Medium |
| Nehru Place | 28.5533°N, 77.2594°E | 🟡 Medium |
| Rohini | 28.7300°N, 77.1055°E | 🟡 Medium |
| Vaishali | 28.6201°N, 77.3844°E | 🟡 Medium |
| Saket | 28.5245°N, 77.2137°E | 🟢 Low |
| Pitampura | 28.7134°N, 77.1485°E | 🟢 Low |
| Indirapuram | 28.6405°N, 77.3673°E | 🟢 Low |

---

## 🤖 AI & ML Pipeline

```mermaid
graph LR
    A[📡 Data Ingestion] --> B[🔄 Preprocessing]
    B --> C[🧠 XGBoost Model]
    C --> D[📊 SHAP Explainability]
    D --> E[🎯 Predictions]
    E --> F[🗺️ Dijkstra Routing]
    F --> G[💡 Recommendations]
    
    style A fill:#6366f1,color:#fff,stroke:none
    style B fill:#8b5cf6,color:#fff,stroke:none
    style C fill:#06b6d4,color:#fff,stroke:none
    style D fill:#10b981,color:#fff,stroke:none
    style E fill:#f59e0b,color:#fff,stroke:none
    style F fill:#f97316,color:#fff,stroke:none
    style G fill:#f43f5e,color:#fff,stroke:none
```

### Model Details

| Component | Description |
|:----------|:-----------|
| **Algorithm** | XGBoost Gradient Boosting Classifier |
| **Training Data** | Synthetic Delhi-NCR dataset (14 zones × temporal features) |
| **Features** | Hour, day of week, vehicle density, weather, events, road width |
| **Output** | 4-class congestion: Low / Medium / High / Very High |
| **Explainability** | SHAP values for top 6 contributing factors per prediction |
| **Routing** | Weighted Dijkstra with congestion-aware edge penalties |

### Demo Data Engine

The frontend includes a **self-contained simulation engine** (`demoData.js` — 618 LOC) that generates realistic Delhi-NCR data:

- ⚡ Zone-level congestion with temporal drift
- 🛣️ Dijkstra pathfinding on a weighted adjacency graph
- 🌦️ Weather forecasting with rain impact modeling
- 🚧 Incident simulation with realistic Delhi locations
- 💬 Hinglish chatbot with 20+ intent categories
- 📊 SHAP factor generation per congestion level

---

## 🎨 Design Philosophy

FlowSense follows a **premium glassmorphism** design language:

| Principle | Implementation |
|:----------|:---------------|
| **Glass Surfaces** | `backdrop-filter: blur(20px) saturate(1.2)` with animated prismatic borders |
| **Aurora Background** | 4-layer radial gradient mesh with mouse-following cursor glow |
| **Typography** | Outfit (display) + Inter (body) + JetBrains Mono (data) |
| **Motion** | Framer Motion spring physics + CSS `cubic-bezier(.16,1,.3,1)` easing |
| **Particles** | Canvas-based system with mouse repulsion & gradient connections |
| **Color System** | HSL-based palette: Indigo → Cyan → Emerald → Rose spectrum |
| **Micro-interactions** | Floating icons, pulsing dots, shimmer cards, ripple buttons |

---

## 📡 API Reference

<details>
<summary><b>Click to expand API endpoints</b></summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `GET` | `/api/all_predictions` | All zone congestion predictions |
| `GET` | `/api/forecast/{location}` | 15/30/60 min forecast for a zone |
| `GET` | `/api/route_profiles` | Multi-route comparison (fastest/eco/cheap) |
| `GET` | `/api/traffic_heatmap` | Heatmap intensity data for all zones |
| `GET` | `/api/dynamic_reroute` | AI-optimized reroute recommendation |
| `GET` | `/api/command_center` | Full command center payload |
| `GET` | `/api/smart_signal/{location}` | Signal timing optimization |
| `GET` | `/api/pollution_route/{location}` | Eco-routing with AQI data |
| `GET` | `/api/chat?q=...` | AI assistant (Hinglish) |
| `WS`  | `/ws/live` | Real-time prediction stream |

</details>

---

## 🧪 Testing

```bash
# Backend tests
python test_backend.py

# Frontend lint
cd frontend
npm run lint

# Production build test
npm run build
```

---

## 📁 Environment Variables

| Variable | Default | Description |
|:---------|:--------|:-----------|
| `VITE_API_URL` | `http://127.0.0.1:8000/api` | Backend API base URL |
| `VITE_WS_URL` | `ws://127.0.0.1:8000/ws/live` | WebSocket endpoint |
| `VITE_MAP_TILE` | CartoDB Dark | Map tile provider |

---

## 🤝 Contributing

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "feat: add amazing feature"

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

### Commit Convention

| Prefix | Usage |
|:-------|:------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `ui:` | UI/UX enhancement |
| `perf:` | Performance improvement |
| `docs:` | Documentation |
| `refactor:` | Code restructuring |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <img src="https://img.shields.io/badge/Made_with-❤️-f43f5e?style=for-the-badge" alt="Made with love" />
  <img src="https://img.shields.io/badge/Built_for-Delhi--NCR-06b6d4?style=for-the-badge" alt="Built for Delhi-NCR" />
  <img src="https://img.shields.io/badge/Powered_by-AI-6366f1?style=for-the-badge" alt="Powered by AI" />
</p>

<p align="center">
  <b>FlowSense</b> — Predict. Optimize. Transform. 🚦
</p>

<p align="center">
  <sub>⭐ Star this repo if FlowSense helps you understand urban traffic intelligence!</sub>
</p>
