import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../LandingPage"; // Adjust this path based on where you put LandingPage.tsx
import FunctionMap from "../functionMap";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <div>Login Page</div>, // Replace with actual Login component when ready
  },
  {
    path: "/dashboard",
    element: <div>Dashboard</div>, // Replace with actual Dashboard component when ready
  },
  {
    path: "/functionMapping",
    element: <FunctionMap />, // Replace with actual Function Mapping component when ready
  },
]);

export default router;
