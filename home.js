import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxZ-mSgJhuTdGcH3T4oJym3qjGso71keM",
  authDomain: "user1111-c84a0.firebaseapp.com",
  databaseURL: "https://user1111-c84a0-default-rtdb.firebaseio.com",
  projectId: "user1111-c84a0",
  storageBucket: "user1111-c84a0.firebasestorage.app",
  messagingSenderId: "901723757936",
  appId: "1:901723757936:web:d1f18c83c721edfb0c03b5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const tg = window.Telegram.WebApp;
const userData = tg.initDataUnsafe.user;

// Foydalanuvchi ma'lumotlarini yuklash
if (userData) {
    const userId = userData.id;
    document.getElementById('user-name').innerText = userData.first_name;
    document.getElementById('user-id-text').innerText = "ID: " + userId;
    if (userData.photo_url) document.getElementById('user-photo').src = userData.photo_url;

    // 1. Balansni bazadan olish (Realtime)
    const balanceRef = ref(db, 'users/' + userId + '/balance');
    onValue(balanceRef, (snapshot) => {
        const balance = snapshot.val() || 0;
        document.getElementById('balance-amount').innerText = balance;
    });

    // 2. Bazadagi jami vazifalar sonini hisoblash
    const tasksRef = ref(db, 'tasks');
    onValue(tasksRef, (snapshot) => {
        if (snapshot.exists()) {
            const tasksCount = Object.keys(snapshot.val()).length;
            document.getElementById('active-tasks-count').innerText = tasksCount;
        } else {
            document.getElementById('active-tasks-count').innerText = "0";
        }
    });

} else {
    document.getElementById('user-name').innerText = "Test User";
}

tg.ready();
