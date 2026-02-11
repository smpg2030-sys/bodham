import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface ResponsiveLayoutProps {
    children: React.ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            {/* Desktop Sidebar */}
            {isDesktop && <Sidebar />}

            {/* Main Content Area */}
            <main className={`flex-1 flex flex-col items-center ${isDesktop ? "pb-0" : "pb-20"}`}>
                <div className="w-full max-w-[768px] min-h-screen flex flex-col bg-white shadow-sm border-x border-slate-100">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            {!isDesktop && <BottomNav />}
        </div>
    );
}
