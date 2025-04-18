import { AppLayout } from "@/app/components/layout/app-layout";
import PipelineView from "@/app/views/Pipeline";
import PositionsView from "@/app/views/Positions";
import MetricsView from "@/app/views/Metrics";
import CVUpload from "@/app/views/CV-Upload";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <PipelineView />,
      },
      {
        path: "positions",
        element: <PositionsView />,
      },
      {
        path: "metrics",
        element: <MetricsView />,
      },
      {
        path: "cv-upload",
        element: <CVUpload />,
      },
    ],
  },
]);
