import { Outlet } from "react-router-dom";
import ResponsiveLayout from "./components/ResponsiveLayout";
import FloatingSupport from "./components/FloatingSupport";

export default function InnerApp() {
  return (
    <ResponsiveLayout>
      <Outlet />
      <FloatingSupport />
    </ResponsiveLayout>
  );
}
