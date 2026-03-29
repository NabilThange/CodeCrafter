import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Unified Platform</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <Link 
          href="/vane" 
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Vane</h2>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered search and chat interface
          </p>
        </Link>

        <Link 
          href="/portfolio" 
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Portfolio</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Intelligent ETF portfolio management
          </p>
        </Link>

        <Link 
          href="/monitor" 
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">WorldMonitor</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time global intelligence dashboard
          </p>
        </Link>
      </div>
    </div>
  );
}
