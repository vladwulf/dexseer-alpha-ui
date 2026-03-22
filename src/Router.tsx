import { RouterProvider, createBrowserRouter } from "react-router";
import { DashboardPage } from "./pages/Dashboard.page";
import { PatternsPage } from "./pages/Patterns.page";
import ChartPage from "./pages/Chart.page";
import Simulation from "./pages/simulations/longs.simulation";
import AlertsExplorerPage from "./pages/AlertsExplorer.page";

const routes = createBrowserRouter([
  {
    path: "/alerts/explorer",
    element: <AlertsExplorerPage />,
  },
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
  {
    path: "/simulation",
    element: <Simulation />,
  },
]);

export const Router = () => {
  return <RouterProvider router={routes} />;
};
