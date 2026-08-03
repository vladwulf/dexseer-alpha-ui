import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { RootLayout } from "./components/layout/RootLayout";
import { AlertsPage } from "./pages/Alerts.page";
import { AnalyticsPage } from "./pages/Analytics.page";
import { AssetDetailPage } from "./pages/assets/AssetDetail.page";
import { OpportunitiesPage } from "./pages/Opportunities.page";
import { ScannerV2Page } from "./pages/v2/ScannerV2.page";

const routes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <ScannerV2Page /> },
      // { path: "/patterns", element: <PatternsPage /> },
      // { path: "/chart", element: <ChartPage /> },
      { path: "/analytics", element: <AnalyticsPage /> },
      { path: "/alerts", element: <AlertsPage /> },
      { path: "/opportunities", element: <OpportunitiesPage /> },
      { path: "/assets/:symbol", element: <AssetDetailPage /> },
      { path: "/v2/scanner", element: <Navigate to="/" replace /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export const Router = () => {
  return <RouterProvider router={routes} />;
};
