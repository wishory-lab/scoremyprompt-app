export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );
}
