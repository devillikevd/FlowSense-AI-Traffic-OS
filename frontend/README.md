# FlowSense Frontend

This frontend is the React + Vite dashboard for FlowSense, an intelligent traffic operations system for Delhi-NCR.

## Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Notes

- The app expects the backend API to run at `http://127.0.0.1:8000/api`.
- Run the backend from the project root using `uvicorn backend.main:app --reload`.
- ESLint is configured with React hook support and Vite refresh plugin.
