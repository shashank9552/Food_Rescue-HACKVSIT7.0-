# Food Rescue AI — React Client Scaffold

This directory contains the Vite + React frontend scaffold for the **Food Rescue AI** dashboard application.

## 📂 Project Structure
- **[src/firebase/config.js](file:///Users/sanjanamilind/sanjana/food-rescue/client/src/firebase/config.js)**: Placeholder configuration shell for the Firebase Client SDK.
- **[src/hooks/](file:///Users/sanjanamilind/sanjana/food-rescue/client/src/hooks/)**: Placeholder custom hooks:
  - `useAuth`: Mock authentication and user object.
  - `useCollection`: Real-time subscription listener template for Firestore.
  - `useCallableFunction`: Client invoking handler for `findMatch` and `predictWaste` Cloud Functions.
- **[src/components/](file:///Users/sanjanamilind/sanjana/food-rescue/client/src/components/)**: Mock dashboard UI blocks:
  - `MockMap`: Visual map placeholder for displaying pick-up pathways.
  - `FoodListingCard`: Listing details and state action triggers.
  - `StatusTracker`: Progress indicator for listing statuses (posted, claimed, picked up, delivered).
  - `PredictionCard`: Interactive panel for generating waste forecasts.
  - `MatchSuggestions`: Layout panel listing calculated matches.
  - `TabNav`: Horizontal tab system allowing instant navigation.
- **[src/pages/](file:///Users/sanjanamilind/sanjana/food-rescue/client/src/pages/)**: Core layouts:
  - `RestaurantDashboard`: Surplus listing posting and predictions.
  - `NGODashboard`: Listing claiming and distance calculations.
  - `VolunteerDashboard`: Pickups and delivery progress marking.
  - `AdminDashboard`: Platform aggregations (total meals saved and carbon avoided).

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a local `.env` configuration file copying the format of `.env.example`:
```bash
cp .env.example .env
```
Fill in the variables with your Firebase client app parameters.

### 3. Launch Development Server
```bash
npm run dev
```

Visit the local url shown (default: `http://localhost:5173`) to verify that the scaffold boots successfully and handles page navigation between dashboards.
