import Sidebar from "@/components/Sidebar";
import "./protected.css";

export default function ProtectedLayout({ children }) {
  return (
    <div className="protected-layout">
      <Sidebar />
      <div className="protected-content">
        {children}
      </div>
    </div>
  );
}
