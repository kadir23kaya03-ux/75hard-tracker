import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, User, ArrowLeft, Plus, Loader2, X } from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function Login({ onLogin }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Yeni profil oluşturma alanları
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Firebase'den profilleri çek
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const data = [];
        snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
        setProfiles(data);
      } catch (e) {
        console.error('Profiller yüklenemedi:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      if (newPin.length === 4) verifyPin(newPin);
    }
  };

  const verifyPin = (currentPin) => {
    if (currentPin === selectedProfile.pin) {
      onLogin({
        id: selectedProfile.id,
        name: selectedProfile.name,
        role: selectedProfile.role || 'OPERATIVE',
      });
    } else {
      setError(true);
      setTimeout(() => setPin(''), 500);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleCreateProfile = async () => {
    if (!newName.trim()) { setCreateError('İsim gir.'); return; }
    if (newPin.length !== 4) { setCreateError('4 haneli PIN gir.'); return; }

    setCreating(true);
    try {
      const id = newName.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
      const profileData = {
        name: newName.trim().toUpperCase(),
        pin: newPin,
        role: 'OPERATIVE',
        currentDay: 1,
        progress: 0,
        tasks: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', id), profileData);
      setProfiles(prev => [...prev, { id, ...profileData }]);
      setShowCreate(false);
      setNewName('');
      setNewPin('');
      setCreateError('');
    } catch (e) {
      setCreateError('Profil oluşturulamadı: ' + e.message);
    } finally {
      setCreating(false);
    }
  };

  const bgGrid = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=";

  return (
    <div className="min-h-screen bg-[var(--color-dark)] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      <div className={`absolute inset-0 bg-[url('${bgGrid}')] opacity-20 pointer-events-none`}></div>

      <AnimatePresence mode="wait">

        {/* ── YENİ PROFİL OLUŞTUR MODAL ── */}
        {showCreate && (
          <motion.div
            key="create"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm z-10 relative"
          >
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-3xl font-black tracking-tighter uppercase mb-2 text-center">YENİ<br/>PROFİL</h1>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">İsim ve 4 haneli PIN belirle</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">İSİM</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setCreateError(''); }}
                  placeholder="Örn: Kadir"
                  className="w-full bg-[#121212] border border-[#333] focus:border-red-600 outline-none px-4 py-3 text-white font-bold tracking-widest uppercase text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">4 HANELİ PIN</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={e => { if (e.target.value.length <= 4) { setNewPin(e.target.value); setCreateError(''); } }}
                  placeholder="••••"
                  maxLength={4}
                  className="w-full bg-[#121212] border border-[#333] focus:border-red-600 outline-none px-4 py-3 text-white font-mono text-2xl tracking-[0.5em] text-center transition-colors"
                />
              </div>

              {createError && (
                <p className="text-red-500 text-xs font-bold tracking-widest uppercase text-center">{createError}</p>
              )}

              <button
                onClick={handleCreateProfile}
                disabled={creating}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white py-4 text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {creating ? 'OLUŞTURULUYOR...' : 'PROFİL OLUŞTUR'}
              </button>

              <button
                onClick={() => { setShowCreate(false); setCreateError(''); setNewName(''); setNewPin(''); }}
                className="w-full border border-[#333] hover:border-[#555] text-gray-400 hover:text-white py-3 text-xs font-bold tracking-widest uppercase transition-colors"
              >
                İPTAL
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PROFİL SEÇİM EKRANI ── */}
        {!selectedProfile && !showCreate && (
          <motion.div
            key="profile-select"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm z-10 relative"
          >
            <div className="flex flex-col items-center mb-10">
              <h1 className="text-3xl font-black tracking-tighter uppercase mb-2 text-center">SELECT<br/>OPERATIVE</h1>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Identify Yourself</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {profiles.map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => setSelectedProfile(profile)}
                      className="bg-[#121212] border border-[#262626] hover:border-red-600 group p-6 flex flex-col items-center justify-center transition-all duration-300"
                    >
                      <div className="w-16 h-16 bg-[#1a1a1a] group-hover:bg-red-600/10 border border-[#333] group-hover:border-red-500 flex items-center justify-center mb-4 transition-colors">
                        <span className="text-2xl font-black text-gray-400 group-hover:text-red-500 transition-colors">
                          {profile.name?.substring(0, 2) || <User className="w-8 h-8" />}
                        </span>
                      </div>
                      <span className="font-bold tracking-widest uppercase text-sm group-hover:text-white transition-colors text-gray-300 text-center leading-tight">
                        {profile.name}
                      </span>
                      <span className="text-[9px] text-gray-600 font-bold tracking-widest uppercase mt-1">
                        {profile.role || 'OPERATIVE'}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowCreate(true)}
                  className="w-full border border-dashed border-[#333] hover:border-red-600/50 text-gray-500 hover:text-red-500 py-4 flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-all"
                >
                  <Plus className="w-4 h-4" /> YENİ PROFİL EKLE
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* ── PIN GİRİŞ EKRANI ── */}
        {selectedProfile && !showCreate && (
          <motion.div
            key="pin-pad"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm z-10 relative"
          >
            <button
              onClick={() => { setSelectedProfile(null); setPin(''); setError(false); }}
              className="absolute -top-12 left-0 flex items-center text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>

            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-red-600/10 border border-red-500 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                <span className="text-3xl font-black text-red-400">
                  {selectedProfile.name?.substring(0, 2)}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase mb-2 text-center">Clearance<br/>Required</h1>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">
                Operative: <span className="text-red-500">{selectedProfile.name}</span>
              </p>
            </div>

            {/* PIN Indicators */}
            <div className="flex justify-center space-x-4 mb-10">
              {[0, 1, 2, 3].map((index) => (
                <motion.div
                  key={index}
                  animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`w-4 h-4 border-2 transition-all duration-200 ${
                    pin.length > index
                      ? 'bg-red-600 border-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]'
                      : error
                      ? 'border-red-600'
                      : 'border-gray-700 bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  className="bg-[#121212] border border-[#262626] hover:border-red-600 hover:text-red-500 transition-colors h-16 text-2xl font-bold font-mono active:scale-95 flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handleKeyPress('0')}
                className="col-start-2 bg-[#121212] border border-[#262626] hover:border-red-600 hover:text-red-500 transition-colors h-16 text-2xl font-bold font-mono active:scale-95 flex items-center justify-center"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="col-start-3 bg-[#121212] border border-[#262626] hover:border-red-600 hover:text-red-500 transition-colors h-16 active:scale-95 flex items-center justify-center"
              >
                <span className="text-xs font-bold tracking-wider uppercase">Del</span>
              </button>
            </div>

            {error && (
              <p className="text-center text-red-500 text-xs font-bold tracking-widest uppercase mt-6 animate-pulse">
                YANLIŞ PIN — TEKRAR DENE
              </p>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
