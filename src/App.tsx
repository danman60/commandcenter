import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from './pages/Dashboard';
import { LeadBoard } from './pages/LeadBoard';
import { Workbench } from './pages/Workbench';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <h1 className="text-3xl font-bold text-gray-900">CommandCenter</h1>
                <p className="text-gray-600">Dance Studio CRM</p>
              </div>
            </div>
          </header>

          <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="nav">
                <NavLink
                  to="/"
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/leads"
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  Lead Board
                </NavLink>
                <NavLink
                  to="/workbench"
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  Workbench
                </NavLink>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<LeadBoard />} />
              <Route path="/workbench" element={<Workbench />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;