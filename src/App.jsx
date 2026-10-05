import React, { useContext } from 'react';
import { AppProvider, AppContext } from './context/AppProvider';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import HrDashboard from './components/HrDashboard';
import Toast from './components/Toast';
import './index.css';

const MainApp = () => {
  const { session } = useContext(AppContext);

  return (
    <>
      {!session.role && <Login />}
      {session.role === 'employee' && <EmployeeDashboard />}
      {session.role === 'hr' && <HrDashboard />}
      <Toast />
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;
