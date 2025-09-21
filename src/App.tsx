import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { useExpensesStore } from './store/useExpensesStore';
import { Toaster } from 'react-hot-toast';

function App(): JSX.Element {
  const init = useExpensesStore((s) => s.init);
  const setOnlineStatus = useExpensesStore((s) => s.setOnlineStatus);

  useEffect(() => {
    init();

    // Monitor online/offline status
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [init, setOnlineStatus]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LoginPage />} />
          <Route path='/dashboard' element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster position='top-right' />
    </>
  );
}

export default App;
