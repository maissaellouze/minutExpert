import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { authAPI } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {

  // ─── Navigation
  const [screen, setScreen] = useState(() => {
    const role  = localStorage.getItem('role');
    const token = localStorage.getItem('access');
    if (token && role) return role;
    return 'landing';
  });

  const [clientPage, setClientPage] = useState('client-home');
  const [expertPage, setExpertPage] = useState('exp-dash');
  const [adminPage,  setAdminPage]  = useState('adm-overview');

  const navigate = useCallback((s) => {
    setScreen(s);
    window.scrollTo(0, 0);
  }, []);

  // ─── Auth state
  const [authLoading, setAuthLoading] = useState(false);
  const [authError,   setAuthError]   = useState('');
  const [currentUser, setCurrentUser] = useState(() => ({
    role: localStorage.getItem('role') || null,
  }));

  // Toast (déclaré tôt car utilisé dans login/signup)
  const [toast, setToast] = useState({ show: false, title: '', body: '' });
  const toastTimer = useRef(null);
  const showToast = useCallback((title, body = '') => {
    setToast({ show: true, title, body });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(
      () => setToast(t => ({ ...t, show: false })),
      3200
    );
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const json = await authAPI.login({ email, password });
      setCurrentUser({ role: json.role });
      showToast(
        json.role === 'client' ? 'Bienvenue !' :
        json.role === 'expert' ? 'Bienvenue Expert !' : 'Bienvenue Admin !',
        'Connexion réussie.'
      );
      navigate(json.role);
    } catch (err) {
      setAuthError(err.message || 'Identifiants incorrects.');
    } finally {
      setAuthLoading(false);
    }
  }, [navigate, showToast]);

  const signupClient = useCallback(async (data) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const json = await authAPI.signup(data);
      setCurrentUser({ role: json.role });
      showToast('Compte créé !', 'Bienvenue sur MinuteExpert.');
      navigate(json.role);
    } catch (err) {
      setAuthError(err.message || "Erreur lors de l'inscription.");
    } finally {
      setAuthLoading(false);
    }
  }, [navigate, showToast]);

  const logout = useCallback(() => {
    authAPI.logout();
    setCurrentUser({ role: null });
    navigate('landing');
    showToast('Déconnexion', 'À bientôt !');
  }, [navigate, showToast]);

  // ─── Booking state
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedSlot,   setSelectedSlot]   = useState(null);
  const [selectedDur,    setSelectedDur]    = useState(10);
  const [bookStep,       setBookStep]       = useState(0);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [bookedSlots, setBookedSlots] = useState({
    1: { Lundi: [1], Mercredi: [3] },
    2: { Mardi: [0, 2] },
  });
  const [mySlots, setMySlots] = useState({});

  const confirmBooking = useCallback(() => {
    if (!selectedSlot || !selectedExpert) return;
    const newBooked = { ...bookedSlots };
    if (!newBooked[selectedExpert.id]) newBooked[selectedExpert.id] = {};
    if (!newBooked[selectedExpert.id][selectedSlot.day]) newBooked[selectedExpert.id][selectedSlot.day] = [];
    if (!newBooked[selectedExpert.id][selectedSlot.day].includes(selectedSlot.si)) {
      newBooked[selectedExpert.id][selectedSlot.day] = [...newBooked[selectedExpert.id][selectedSlot.day], selectedSlot.si];
    }
    setBookedSlots(newBooked);
    const newMine = { ...mySlots };
    if (!newMine[selectedExpert.id]) newMine[selectedExpert.id] = {};
    if (!newMine[selectedExpert.id][selectedSlot.day]) newMine[selectedExpert.id][selectedSlot.day] = [];
    newMine[selectedExpert.id][selectedSlot.day] = [...(newMine[selectedExpert.id][selectedSlot.day] || []), selectedSlot.si];
    setMySlots(newMine);
    const booking = {
      id: Date.now(),
      expert: selectedExpert,
      slot: selectedSlot.label,
      dur: selectedDur,
      maxCost: (selectedExpert.rate * selectedDur * 1.15).toFixed(2),
      rate: selectedExpert.rate,
    };
    setUpcomingSessions(prev => [booking, ...prev]);
    setClientPage('booking-success');
    showToast('Réservation confirmée ✓', `${selectedSlot.label} avec ${selectedExpert.name}`);
  }, [selectedSlot, selectedExpert, selectedDur, bookedSlots, mySlots, showToast]);

  const cancelUpcoming = useCallback((id) => {
    setUpcomingSessions(prev => prev.filter(b => b.id !== id));
    showToast('Session annulée', 'Votre pré-autorisation a été libérée.');
  }, [showToast]);

  // ─── Session
  const [sessExpert, setSessExpert] = useState(null);
  const [sessDur,    setSessDur]    = useState(10);
  const launchSession = useCallback((expert, dur) => {
    setSessExpert(expert);
    setSessDur(dur);
    navigate('session');
  }, [navigate]);

  return (
    <AppContext.Provider value={{
      screen, navigate,
      clientPage, setClientPage,
      expertPage, setExpertPage,
      adminPage,  setAdminPage,
      currentUser,
      authLoading, authError, setAuthError,
      login, signupClient, logout,
      selectedExpert, setSelectedExpert,
      selectedSlot,   setSelectedSlot,
      selectedDur,    setSelectedDur,
      bookStep,       setBookStep,
      upcomingSessions, cancelUpcoming,
      bookedSlots, mySlots, confirmBooking,
      sessExpert, sessDur, launchSession,
      toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
