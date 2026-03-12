# CloseLoop Frontend

This is the front-end application for CloseLoop, built using **React (v18)** and styled with **TailwindCSS**. It utilizes various UI components such as **Radix UI** and **Lucide React** icons to deliver a modern user experience. The application setup is managed via CRA (Create React App) using `craco` for custom configurations like Tailwind.

## 📁 Directory Structure
- `src/` - The main source code folder containing all React code.
  - `src/components/` - Reusable UI widgets and layout segments.
  - `src/pages/` - Main route views mapping to different application screens.
  - `src/context/` - React Context files for managing global state (like Auth).
  - `src/hooks/` - Custom React hooks.
  - `src/lib/` - Utility functions and helpers.
- `public/` - Static assets, HTML template, and icons.
- `package.json` - Node dependencies, scripts, and project metadata.

## 🛠 Prerequisites
- **Node.js** (v18+ recommended)
- **Yarn** or **npm** as the package manager.

## 🚀 Local Setup & Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Dependencies:**
   Install all necessary packages via npm or yarn:
   ```bash
   npm install
   # OR
   yarn install
   ```
   *Note: CloseLoop's `package.json` has `yarn` specified as the main package manager lock, but `npm install` works natively too.*

3. **Set up Environment Variables:**
   Create a `.env` file in the root of the `frontend` folder (if it doesn't already exist or if you need to configure custom API endpoints). By default during development, the frontend will likely need to know where the backend URL lies, often `REACT_APP_API_URL=http://localhost:8000`.

4. **Start the Development Server:**
   ```bash
   npm start
   # OR
   yarn start
   ```

   The app will automatically compile and open in your default browser at [http://localhost:3000](http://localhost:3000). The page will reload if you make edits in the code. You will also see any lint errors in the console.

## 🏗 Building for Production

To build the app for production to the `build` folder:
```bash
npm run build
# OR
yarn build
```
This correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.

## 🧪 Testing
The testing configuration is managed through `craco`:
```bash
npm test
# OR
yarn test
```
This runs the test watcher in an interactive mode.
