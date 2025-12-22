/**
 * Dashboard Layout
 * Общий layout для всех страниц дашборда
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* TODO: <Header /> */}
      <main>{children}</main>
    </div>
  );
}
