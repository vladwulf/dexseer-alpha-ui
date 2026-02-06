import { RouterProvider, createBrowserRouter } from "react-router";
import { DashboardPage } from "./pages/Dashboard.page";
import { PatternsPage } from "./pages/Patterns.page";
import ChartPage from "./pages/Chart.page";
import BacktestPage from "./pages/Backtest.page";
import BacktestAlertsPage from "./pages/Backtest-alerts.page";
import { ScreenerPage } from "./pages/Screener.page";

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
    path: "/backtest-alerts",
    element: <BacktestAlertsPage />,
  },
  {
    path: "/backtest",
    element: <BacktestPage />,
  },
  {
    path: "/screener/test",
    element: <ScreenerPage />,
  },
  {
    path: "/",
    element: <DashboardPage />,
  },
]);

export const Router = () => {
  return <RouterProvider router={routes} />;
};
