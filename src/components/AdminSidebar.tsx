"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Film, PlusCircle, Settings, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSidebar() {
  const pathname = usePathname();

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

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold text-accent tracking-tighter">STREAMLY ADMIN</h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
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
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-3 rounded-md text-muted-foreground hover:bg-muted hover:text-white transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to Site
        </Link>
      </div>
    </aside>
  );
}
