import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/app/components/ui/sidebar";
import { AppSidebar } from "@/app/components/layout/app-sidebar";
import { Toaster } from "@/app/components/ui/sonner";
import { ModeToggle } from "@/app/components/mode-toggle";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-full w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 min-w-0 flex flex-col">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <SidebarTrigger />
            <ModeToggle />
          </div>
          <div className="flex-1 min-h-0 p-4 overflow-hidden">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
