import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { MainDashboard } from './components/MainDashboard';
import { SensorData } from './components/SensorData';
import { UserManagement } from './components/UserManagement';
import { SettingsPage } from './components/SettingsPage';
import { SettingsProvider } from './context/SettingsContext';

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = () => {
      const storedSession = localStorage.getItem('userSession');
      if (storedSession) {
        try {
          const { user, timestamp, page } = JSON.parse(storedSession);
          const now = new Date().getTime();
          
          // Check if session is still valid (within 30 minutes)
          if (now - timestamp < SESSION_DURATION) {
            setCurrentUser(user);
            setCurrentPage(page || 'dashboard');
            
            // Update timestamp to extend session
            const updatedSession = {
              user,
              timestamp: now,
              page: page || 'dashboard'
            };
            localStorage.setItem('userSession', JSON.stringify(updatedSession));
          } else {
            // Session expired, clear it
            localStorage.removeItem('userSession');
          }
        } catch (error) {
          // Invalid session data, clear it
          localStorage.removeItem('userSession');
        }
      }
      setIsCheckingSession(false);
    };

    checkSession();
  }, []);

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        const storedSession = localStorage.getItem('userSession');
        if (storedSession) {
          try {
            const { timestamp } = JSON.parse(storedSession);
            const now = new Date().getTime();
            
            if (now - timestamp >= SESSION_DURATION) {
              // Session expired, logout
              handleLogout();
            }
          } catch (error) {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleLogin = (role, name, userData) => {
    const user = { 
      username: name, 
      role: role,
      email: userData.email,
      fullUserData: userData 
    };
    console.log('Login successful - User data:', user); // Debug log
    
    // Store session in localStorage
    const session = {
      user,
      timestamp: new Date().getTime(),
      page: 'dashboard'
    };
    localStorage.setItem('userSession', JSON.stringify(session));
    
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    // Clear session from localStorage
    localStorage.removeItem('userSession');
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    
    // Update current page in session
    if (currentUser) {
      const storedSession = localStorage.getItem('userSession');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          session.page = page;
          session.timestamp = new Date().getTime(); // Update timestamp on navigation
          localStorage.setItem('userSession', JSON.stringify(session));
        } catch (error) {
          // If there's an error, don't break navigation
          console.error('Error updating session:', error);
        }
      }
    }
  };

  // Show loading spinner while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-gray-50">
        {currentPage === 'dashboard' && (
          <MainDashboard
            user={currentUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'users' && (
          <UserManagement
            user={currentUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'settings' && (
          <SettingsPage
            user={currentUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'sensors' && (
          <SensorData
            user={currentUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'alerts' && (
          <MainDashboard
            user={currentUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </SettingsProvider>
  );
}
