import { RouterProvider, createBrowserRouter } from "react-router";
import { DashboardPage } from "./pages/Dashboard.page";
import { PatternsPage } from "./pages/Patterns.page";
import ChartPage from "./pages/Chart.page";

const routes = createBrowserRouter([
  {
    path: "/patterns",
    element: <PatternsPage />,
  },
  {
    path: "/chart",
    element: <ChartPage />,
  },
  {
    path: "/",
    element: <DashboardPage />,
  },
]);

export const Router = () => {
  return <RouterProvider router={routes} />;
};
