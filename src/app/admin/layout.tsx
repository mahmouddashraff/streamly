import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 w-full md:w-auto overflow-x-hidden relative">
        {children}
      </div>
    </div>
  );
}
