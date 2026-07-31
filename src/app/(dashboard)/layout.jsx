import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ChatProvider } from "@/components/providers/chat-provider";

export default function DashboardLayout({ children }) {
  return (
    <ChatProvider>
      <div className="h-screen flex flex-col font-sans overflow-hidden">
        <DashboardHeader />
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto bg-background" data-lenis-prevent="true">
            {children}
          </main>
        </div>
      </div>
    </ChatProvider>
  );
}
