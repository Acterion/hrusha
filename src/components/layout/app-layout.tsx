import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/app/components/ui/sidebar";
import { AppSidebar } from "@/app/components/layout/app-sidebar";
import { Toaster } from "@/app/components/ui/sonner";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-14 items-center border-b px-4">
            <SidebarTrigger />
          </div>
          <div className="p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
