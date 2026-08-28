import './globals.css';
import MarketTicker from '../components/MarketTicker';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AuthGate from '../components/AuthGate';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'investIQ - Intelligent Multi-Asset Investment & Trading OS',
  description: 'Track, analyze, and trade Stocks, Mutual Funds, and Fixed Deposits with AI market insights.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090D16] text-slate-100 antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <AuthGate>
            <MarketTicker />
            <div className="flex flex-1 min-h-[calc(100vh-41px)]">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <Navbar />
                <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
                  {children}
                </main>
              </div>
            </div>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
