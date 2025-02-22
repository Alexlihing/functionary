import { RouterProvider } from "react-router-dom";
import router from "./components/router/routes";
import DirectorySelector from "./components/DirectorySelector";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <RouterProvider router={router} />
      <div className="directory-selector-container">
        <DirectorySelector />
      </div>
    </div>
  );
}

export default App;
