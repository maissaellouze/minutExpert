import { useApp } from './context/AppContext';
import LandingScreen from './components/landing/LandingScreen';
import { LoginScreen, RegisterScreen } from './components/auth/AuthScreens';
import ClientApp from './components/client/ClientApp';
import ExpertApp from './components/expert/ExpertApp';
import AdminApp from './components/admin/AdminApp';
import SessionScreen from './components/session/SessionScreen';
import ExpertSessionScreen from './components/expert/ExpertSessionScreen';
import { Toast } from './components/ui';

export default function App() {
  const { screen } = useApp();

  const renderScreen = () => {
    switch (screen) {
      case 'landing':  return <LandingScreen />;
      case 'login':    return <LoginScreen />;
      case 'register': return <RegisterScreen />;
      case 'client':   return <ClientApp />;
      case 'expert':   return <ExpertApp />;
      case 'admin':    return <AdminApp />;
      case 'session':        return <SessionScreen />;
      case 'expert-session':  return <ExpertSessionScreen />;
      default:         return <LandingScreen />;
    }
  };

  return (
    <>
      {renderScreen()}
      <Toast />
    </>
  );
}
