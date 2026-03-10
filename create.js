import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, update, push, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const userId = tg.initDataUnsafe.user.id;

let currentBalance = 0;

// Balansni kuzatish
onValue(ref(db, 'users/' + userId + '/balance'), (snapshot) => {
    currentBalance = snapshot.val() || 0;
    document.getElementById('balance-amount').innerText = currentBalance;
});

// Narxni hisoblash
document.getElementById('subs-count').addEventListener('input', (e) => {
    const count = e.target.value;
    document.getElementById('total-price').innerText = `Jami xarajat: ${count * 4} tanga`;
});

// Vazifa yaratish funksiyasi
window.publishTask = async function() {
    const username = document.getElementById('channel-username').value.trim();
    const count = parseInt(document.getElementById('subs-count').value);
    const totalPrice = count * 4;

    if (!username.startsWith('@')) {
        tg.showAlert("Username @ bilan boshlanishi shart!");
        return;
    }

    if (currentBalance < totalPrice) {
        tg.showAlert("Mablag' yetarli emas!");
        return;
    }

    // Balansni kamaytirish va vazifani qo'shish
    const newTaskRef = push(ref(db, 'tasks'));
    await set(newTaskRef, {
        ownerId: userId,
        channel: username,
        requiredSubs: count,
        completedCount: 0,
        createdAt: Date.now()
    });

    await update(ref(db, 'users/' + userId), {
        balance: currentBalance - totalPrice
    });

    tg.showAlert("Vazifa muvaffaqiyatli yaratildi!");
    window.location.href = "home.html";
}
