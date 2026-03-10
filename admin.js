import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase konfiguratsiyasi
const firebaseConfig = {
  apiKey: "AIzaSyAxZ-mSgJhuTdGcH3T4oJym3qjGso71keM",
  authDomain: "user1111-c84a0.firebaseapp.com",
  databaseURL: "https://user1111-c84a0-default-rtdb.firebaseio.com",
  projectId: "user1111-c84a0",
  storageBucket: "user1111-c84a0.firebasestorage.app",
  messagingSenderId: "901723757936",
  appId: "1:901723757936:web:d1f18c83c721edfb0c03b5"
};

// Firebase-ni ishga tushirish
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Funksiyani window ob'ektiga yuklash (HTML-dagi onclick ko'rishi uchun)
window.sendCoins = async function() {
    const idInput = document.getElementById('target-id');
    const coinInput = document.getElementById('coin-amount');
    const btn = document.getElementById('btn-send');

    const targetId = idInput.value.trim();
    const amount = parseInt(coinInput.value);

    // 1. Ma'lumotlarni tekshirish
    if (!targetId || isNaN(amount)) {
        alert("ID yoki miqdor kiritilmadi!");
        return;
    }

    // Tugmani bloklash
    btn.disabled = true;
    btn.innerText = "Yuborilmoqda...";

    try {
        // 2. Foydalanuvchi yo'liga murojaat
        const userRef = ref(db, 'users/' + targetId);
        const snapshot = await get(userRef);

        let newBalance;
        if (snapshot.exists()) {
            // Foydalanuvchi bo'lsa, balansini oshirish
            const currentBalance = snapshot.val().balance || 0;
            newBalance = currentBalance + amount;
        } else {
            // Foydalanuvchi bo'lsa, yangi yaratish
            newBalance = amount;
        }

        // 3. Bazani yangilash
        await update(userRef, {
            balance: newBalance
        });

        alert("Muvaffaqiyatli! Yangi balans: " + newBalance);
        
        // Inputlarni tozalash
        idInput.value = "";
        coinInput.value = "";

    } catch (error) {
        console.error("Firebase xatosi:", error);
        alert("Xatolik yuz berdi: " + error.message);
    } finally {
        // Tugmani qaytarish
        btn.disabled = false;
        btn.innerText = "Tanga yuborish";
    }
};
