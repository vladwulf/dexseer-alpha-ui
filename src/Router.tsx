import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { RootLayout } from "./components/layout/RootLayout";
import AlertsExplorerPage from "./pages/AlertsExplorer.page";
import { AnalyticsPage } from "./pages/Analytics.page";
import { AssetDetailPage } from "./pages/assets/AssetDetail.page";
import { DashboardPage } from "./pages/Dashboard.page";
import Simulation from "./pages/simulations/longs.simulation";
import { ScannerV2Page } from "./pages/v2/ScannerV2.page";

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
      { path: "/assets/:symbol", element: <AssetDetailPage /> },
      { path: "/simulation", element: <Simulation /> },
      { path: "/v2/scanner", element: <ScannerV2Page /> },
    ],
  },
]);

export const Router = () => {
  return <RouterProvider router={routes} />;
};
