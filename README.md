# 🔥 ไฟป๋อดี: ไอเดียชุมชน จัดการไฟป่า

## Fire Management Platform

A comprehensive web application for grassroots forest fire management in Chiang Mai, Thailand. This platform helps communities visualize village fire management plans, track resources, and coordinate volunteer efforts.

## ✨ What's New - Frontend/Backend Separation

The platform has been restructured into a modern full-stack architecture:

- **Backend API**: Serves combined village data from GIS and community plan sources
- **Frontend SPA**: React application that consumes the API
- **Smart Matching**: Automatically matches community plans with village boundaries by name and location
- **Real-time Stats**: Accurate village statistics with proper plan detection

## 🏗️ Architecture

This project is separated into two main components:

- **Backend** (`/backend`): Node.js + Express API server
- **Frontend** (`/frontend`): React + Vite + Chakra UI + Leaflet.js

## 📊 Data Sources

The platform combines two key datasets:

1. **GIS Data** (`all-fvillage-cnx.json`): Geographic boundaries and metadata for 1000+ villages in Chiang Mai
2. **Community Plans** (`comunity-plan.json`): Fire management plans for 20 villages with detailed information about:
   - Prevention and response activities
   - Budget allocations and funding needs
   - Equipment inventories
   - Volunteer lists and contact information

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Option 1: Use the Development Script (Recommended)

```bash
./start-dev.sh
```

This will start both backend and frontend servers automatically.

### Option 2: Manual Setup

#### 1. Start the Backend API

```bash
cd backend
npm install
npm run dev
```

The API server will start on `http://localhost:3001`

#### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The web application will start on `http://localhost:5173`

## 🔧 Development

### Backend API Endpoints

- `GET /api/health` - Health check
- `GET /api/villages` - Get all villages
- `GET /api/villages/:id` - Get village by ID
- `GET /api/villages/filter/:type` - Get filtered villages
  - Types: `with-plan`, `without-plan`, `need-volunteers`, `need-funding`
- `GET /api/stats` - Get village statistics

### Frontend Structure

```
frontend/src/
├── components/          # React components
│   ├── Header.jsx      # Top navigation
│   ├── Map.jsx         # Interactive Leaflet map
│   ├── VillageDetailSidebar.jsx  # Village details panel
│   └── FilterSidebar.jsx         # Filter controls
├── services/           # API communication
│   └── apiService.js   # Backend API client
├── data/              # Data utilities
│   └── villageDataService.js    # Data processing
└── theme/             # Chakra UI theme
    └── index.js       # Custom theme configuration
```

## 🎨 Features

### Interactive Map

- **Village Polygons**: Real geographic boundaries with color coding
- **Status Indicators**:
  - 🟢 Green: Villages with complete plans
  - 🔴 Red: Need volunteers + funding
  - 🟠 Orange: Need volunteers only
  - 🔵 Blue: Need funding only
  - ⚫ Gray: No plans yet
- **Focus & Highlight**: Click villages to focus map and highlight selection
- **Hover Effects**: Interactive polygon highlighting

### Comprehensive Village Details

- **Basic Information**: Population, forest area, occupations
- **Fire Management Activities**: Organized by timing (Before/During/After)
- **Budget Breakdown**: Detailed cost analysis with progress tracking
- **Equipment Inventory**: Current vs needed equipment
- **Volunteer Information**: Contact details and roles
- **Risk Assessment**: Problem areas and limitations

### Smart Filtering

- Filter by plan status
- Filter by resource needs
- Real-time statistics

## 🎯 Village Status Logic

The system determines village status by combining GIS data with community plans:

1. **Villages with Plans** (~28 found): Matched by name/location from `comunity-plan.json`
   - May still need additional volunteers or funding based on plan details
2. **Villages without Plans** (1100+ total): Only in GIS data
   - Automatically marked as needing both volunteers and funding

## 🌈 Design System

### Brand Colors

- **Orange**: `#f7931e` - Primary brand color
- **Green**: `#5ab14c` - Success/completion
- **Dark Blue**: `#073b4c` - Text and accents
- **Background**: `#585452` - Neutral background
- **Light Text**: `#f0e9dc` - Light text on dark backgrounds

### Typography

- **Font**: DB Helvethaica X - Professional Thai font with excellent readability
  - Regular (400): `dbhelvethaicax-webfont.woff2`
  - Medium (500): `dbhelvethaicaxmed-webfont.woff2`
  - Bold (700): `dbhelvethaicaxbd-webfont.woff2`
- **Style**: Community-first, approachable design with professional typography

## 🔄 Data Flow

1. **Backend** loads and processes both JSON files on startup
2. **Smart Matching** algorithm matches community plans with GIS villages by name and location
3. **API** serves combined village data with status calculations
4. **Frontend** fetches data asynchronously with loading states
5. **Map** renders villages as interactive polygons
6. **Sidebar** displays detailed information for selected villages

## 📱 Responsive Design

The application is optimized for:

- Desktop computers (primary use case)
- Tablets (community meetings)
- Mobile devices (field work)

## 🛠️ Technical Stack

### Backend

- **Node.js** + **Express** - API server
- **ES Modules** - Modern JavaScript
- **CORS** enabled for frontend communication
- **Smart Matching Algorithm** - Fuzzy village name matching

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Chakra UI v2** - Component library
- **Leaflet.js** - Interactive maps
- **React Router** - Navigation
- **Async Data Loading** - With loading states and error handling

## 🚦 Environment Variables

### Frontend

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:3001/api
```

### Backend

Create `backend/.env`:

```
PORT=3001
NODE_ENV=development
```

## 📈 Current Statistics

The platform currently tracks:

- **Total villages**: 1,171 (from GIS data)
- **Villages with plans**: ~28 (matched from community plans)
- **Villages needing volunteers**: Calculated based on plan details
- **Villages needing funding**: Calculated based on budget shortfalls

## 🔍 Village Matching Algorithm

The backend uses a sophisticated matching algorithm to connect community plans with GIS villages:

1. **Exact Match**: Village name + district + subdistrict
2. **Name Match**: Village name only (fallback)
3. **Fuzzy Match**: Removes common prefixes like "บ้าน" and "หมู่บ้าน"

This ensures maximum coverage while maintaining accuracy.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## 📄 License

This project is developed for community fire management in Northern Thailand.

---

**Built with ❤️ for forest fire prevention and community resilience**
