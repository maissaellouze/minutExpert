import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { authAPI, clientAPI } from '../services/api';

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
    role:       localStorage.getItem('role') || null,
    email:      localStorage.getItem('email') || '',
    first_name: localStorage.getItem('first_name') || '',
    last_name:  localStorage.getItem('last_name') || '',
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
      
      localStorage.setItem('email', json.email || '');
      localStorage.setItem('first_name', json.first_name || '');
      localStorage.setItem('last_name', json.last_name || '');
      
      setCurrentUser({ 
        role: json.role,
        email: json.email,
        first_name: json.first_name,
        last_name: json.last_name
      });
      
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
      
      localStorage.setItem('email', json.email || '');
      localStorage.setItem('first_name', json.first_name || '');
      localStorage.setItem('last_name', json.last_name || '');
      
      setCurrentUser({ 
        role: json.role,
        email: json.email,
        first_name: json.first_name,
        last_name: json.last_name
      });
      
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
    localStorage.removeItem('email');
    localStorage.removeItem('first_name');
    localStorage.removeItem('last_name');
    localStorage.removeItem('role');
    localStorage.removeItem('access');
    setCurrentUser({ role: null, email: '', first_name: '', last_name: '' });
    navigate('landing');
    showToast('Déconnexion', 'À bientôt !');
  }, [navigate, showToast]);

  const fetchProfile = useCallback(async () => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('access');
    if (!token || !role) return;

    try {
      let data;
      if (role === 'client') {
        data = await clientAPI.getMe();
      } else if (role === 'expert') {
        const { expertAPI } = await import('../services/api');
        data = await expertAPI.getMe();
      }
      if (data) {
        setCurrentUser(prev => {
          const next = { ...prev, ...data };
          // If it's an expert, sync nested expert_profile if it exists
          if (role === 'expert' && prev.expert_profile) {
            next.expert_profile = { ...prev.expert_profile, ...data };
          }
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        logout();
      }
    }
  }, []);

  // Fetch profile periodically to keep rating/balance fresh
  useEffect(() => {
    fetchProfile();
    const interval = setInterval(fetchProfile, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, [fetchProfile]);

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

  const confirmBooking = useCallback(async () => {
    if (!selectedSlot || !selectedExpert) return;

    if (currentUser?.role !== 'client') {
      showToast('Accès refusé', 'Seuls les clients peuvent réserver une session.');
      return;
    }

    // Persist to backend
    try {
      const result = await clientAPI.createBooking({
        expert_id: selectedExpert.id,
        slot_label: selectedSlot.label,
        duration: selectedDur,
        scheduled_at: new Date().toISOString(),
      });
      
      // Update local booked slots for immediate UI feedback
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
        id: result.id || Date.now(),
        expert: selectedExpert,
        slot: selectedSlot.label,
        dur: selectedDur,
        maxCost: (selectedExpert.rate * selectedDur * 1.15).toFixed(2),
        rate: selectedExpert.rate,
        booking_ref: result.booking_ref,
      };
      setUpcomingSessions(prev => [booking, ...prev]);
      setClientPage('booking-success');
      showToast('Réservation confirmée ✓', `${selectedSlot.label} avec ${selectedExpert.name}`);
    } catch (err) {
      console.error('Booking error:', err);
      showToast('Erreur de réservation', err.message || 'Veuillez réessayer.');
    }
  }, [selectedSlot, selectedExpert, selectedDur, bookedSlots, mySlots, showToast]);

  const cancelUpcoming = useCallback((id) => {
    setUpcomingSessions(prev => prev.filter(b => b.id !== id));
    showToast('Session annulée', 'Votre pré-autorisation a été libérée.');
  }, [showToast]);

  // ─── Session
  const [sessExpert, setSessExpert] = useState(null);
  const [sessDur,    setSessDur]    = useState(10);
  const [sessBookingId, setSessBookingId] = useState(null);
  const launchSession = useCallback((expert, dur, bookingId) => {
    setSessExpert(expert);
    setSessDur(dur);
    setSessBookingId(bookingId || null);
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
      sessExpert, sessDur, sessBookingId, launchSession,
      toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
