import GanacheDiagnostics from '@/components/ganache-diagnostics'

export default function DiagnosticsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-900 mb-8 text-center">
          Blockchain Diagnostics
        </h1>
        <GanacheDiagnostics />
      </div>
    </main>
  )
}