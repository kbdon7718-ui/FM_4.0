export default function FleetLayout({ onLogout, children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4">
        <h1 className="text-lg font-semibold">Fleet dekha raha hu Dashboard</h1>
        <p className="text-sm opacity-80">Live vehicle tracking</p>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
