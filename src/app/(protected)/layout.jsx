import Sidebar from "@/components/Sidebar";
import OfflineSync from "@/components/OfflineSync";
import NotificationScheduler from "@/components/NotificationScheduler";
import TopRightProfile from "@/components/TopRightProfile";
import "./protected.css";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProtectedLayout({ children }) {
  return (
    <div className="protected-layout">
      <Sidebar />
      <div className="protected-content">
        <TopRightProfile />
        {children}
      </div>
      <OfflineSync />
      <NotificationScheduler />
    </div>
  );
}
