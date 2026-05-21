import { Navigate, RouterProvider, createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layout/RootLayout";
import { DashboardPage } from "./pages/Dashboard.page";
import { PatternsPage } from "./pages/Patterns.page";
import { AnalyticsPage } from "./pages/Analytics.page";
import ChartPage from "./pages/Chart.page";
import Simulation from "./pages/simulations/longs.simulation";
import AlertsExplorerPage from "./pages/AlertsExplorer.page";

const routes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/alerts", element: <Navigate to="/alerts/explorer" replace /> },
      { path: "/alerts/explorer", element: <AlertsExplorerPage /> },
      // { path: "/patterns", element: <PatternsPage /> },
      // { path: "/chart", element: <ChartPage /> },
      { path: "/analytics", element: <AnalyticsPage /> },
      { path: "/simulation", element: <Simulation /> },
    ],
  },
]);

export const Router = () => {
  return <RouterProvider router={routes} />;
};
