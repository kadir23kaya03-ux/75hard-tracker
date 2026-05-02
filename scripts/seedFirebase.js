// Bu script Firebase'deki tüm kullanıcı profillerini siler ve
// bir admin (Kadir) profili oluşturur.
// Çalıştırmak için: node scripts/seedFirebase.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBXPf52D_jO60-K5I9yI8JvPxDMnY0eg9c",
  authDomain: "hard-day-challenge.firebaseapp.com",
  databaseURL: "https://hard-day-challenge-default-rtdb.firebaseio.com",
  projectId: "hard-day-challenge",
  storageBucket: "hard-day-challenge.firebasestorage.app",
  messagingSenderId: "889893558776",
  appId: "1:889893558776:web:6681d50686e0bd2884de0d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log('🔥 Firebase bağlantısı kuruldu...');

  // 1. Mevcut tüm profilleri sil
  const snapshot = await getDocs(collection(db, 'users'));
  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, 'users', d.id));
    console.log(`❌ Silindi: ${d.id}`);
  }

  // 2. Admin profili oluştur
  const adminId = 'kadir_admin';
  await setDoc(doc(db, 'users', adminId), {
    name: 'KADİR',
    pin: '1608',
    role: 'COMMANDER',
    isAdmin: true,
    currentDay: 1,
    progress: 0,
    tasks: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  });
  console.log('✅ Admin profili oluşturuldu: kadir_admin / PIN: 1234');

  console.log('\n🎯 Seed tamamlandı! Uygulamayı açabilirsin.');
  process.exit(0);
}

seed().catch(e => {
  console.error('Hata:', e);
  process.exit(1);
});
