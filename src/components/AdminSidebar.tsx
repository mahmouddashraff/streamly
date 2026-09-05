"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Film, Settings, Home, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Videos", href: "/admin/videos", icon: Film },
    { name: "Podcasts", href: "/admin/podcasts", icon: Film },
    { name: "Exclusives", href: "/admin/exclusives", icon: Film },
    { name: "Soon", href: "/admin/soon", icon: Film },
    { name: "Today's Events", href: "/admin/todays-events", icon: Film },
    { name: "Channels", href: "/admin/channels", icon: Film },
    { name: "Guests", href: "/admin/guests", icon: Film },
    { name: "Presenters", href: "/admin/presenters", icon: Film },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-accent tracking-tighter">STREAMLY ADMIN</h2>
        <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-muted-foreground hover:text-white transition-colors rounded">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/admin");
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                isActive 
                  ? "bg-accent/10 text-accent font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-3 rounded-md text-muted-foreground hover:bg-muted hover:text-white transition-colors"
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          Back to Site
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center p-4 bg-card border-b border-border sticky top-0 z-40 w-full shadow-sm">
        <button 
          onClick={() => setIsOpen(true)} 
          className="p-1 ltr:mr-3 rtl:ml-3 text-muted-foreground hover:text-white transition-colors rounded"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-accent tracking-tighter">STREAMLY ADMIN</h2>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer / Desktop Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 ltr:left-0 rtl:right-0 z-50 w-64 bg-card ltr:border-r rtl:border-l border-border flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen md:flex",
        isOpen 
          ? "translate-x-0" 
          : "ltr:-translate-x-full rtl:translate-x-full"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}
