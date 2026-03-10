import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔹 Yangilangan Firebase Konfiguratsiyasi
const firebaseConfig = {
  apiKey: "AIzaSyAxZ-mSgJhuTdGcH3T4oJym3qjGso71keM",
  authDomain: "user1111-c84a0.firebaseapp.com",
  databaseURL: "https://user1111-c84a0-default-rtdb.firebaseio.com",
  projectId: "user1111-c84a0",
  storageBucket: "user1111-c84a0.firebasestorage.app",
  messagingSenderId: "901723757936",
  appId: "1:901723757936:web:c94a330b79916b6b0c03b5",
  measurementId: "G-W1WPZHRJX8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const tg = window.Telegram.WebApp;
const userData = tg.initDataUnsafe.user;

if (userData) {
    const userId = userData.id;
    document.getElementById('user-name').innerText = userData.first_name;
    document.getElementById('user-id-text').innerText = "ID: " + userId;
    if (userData.photo_url) document.getElementById('user-photo').src = userData.photo_url;

    // 1. Balansni realtime olish
    const balanceRef = ref(db, 'users/' + userId + '/balance');
    onValue(balanceRef, (snapshot) => {
        const balance = snapshot.val() || 0;
        document.getElementById('balance-amount').innerText = balance;
    });

    // 2. Vazifalar sonini hisoblash
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
