import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const userId = tg.initDataUnsafe.user?.id || 0;
const BOT_TOKEN = "8756409847:AAF-MdVUIQSf0HaqavXESBvHZ6UV6lsg9rw";

// 1. Balansni realtime yangilash
onValue(ref(db, `users/${userId}/balance`), (snap) => {
    const balEl = document.getElementById('balance-amount');
    if(balEl) balEl.innerText = snap.val() || 0;
});

// 2. Vazifalarni yuklash
onValue(ref(db, 'tasks'), (snapshot) => {
    const list = document.getElementById('tasks-list');
    if(!list) return;
    list.innerHTML = "";
    
    if (!snapshot.exists()) {
        list.innerHTML = "<p style='text-align:center;'>Vazifalar hozircha yo'q</p>";
        return;
    }

    snapshot.forEach((child) => {
        const task = child.val();
        const taskId = child.key;

        if (task.ownerId == userId) return;

        const div = document.createElement('div');
        div.className = "glass-card task-item";
        div.innerHTML = `
            <div>
                <b style="color:#3b82f6;">${task.channel}</b>
                <p style="font-size:12px; color:#94a3b8;">Mukofot: 2 tanga</p>
            </div>
            <div style="display:flex; flex-direction:column;">
                <button class="task-btn" onclick="window.open('https://t.me/${task.channel.replace('@','')}')">OBUNA BO'LISH</button>
                <button class="task-btn check-btn" id="btn-${taskId}">TEKSHIRISH</button>
            </div>
        `;
        list.appendChild(div);
        document.getElementById(`btn-${taskId}`).onclick = () => verifyTask(taskId, task);
    });
});

async function verifyTask(taskId, task) {
    const btn = document.getElementById(`btn-${taskId}`);
    btn.innerText = "⏳...";
    btn.disabled = true;

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${task.channel}&user_id=${userId}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.ok && (data.result.status === 'member' || data.result.status === 'administrator' || data.result.status === 'creator')) {
            const userRef = ref(db, `users/${userId}/balance`);
            const currentBal = (await get(userRef)).val() || 0;
            await update(ref(db, `users/${userId}`), { balance: currentBal + 2 });
            tg.showAlert("Muvaffaqiyatli! +2 tanga qo'shildi.");
        } else {
            tg.showAlert("Vazifa bajarilmadi! Avval kanalga obuna bo'ling.");
            btn.innerText = "TEKSHIRISH";
            btn.disabled = false;
        }
    } catch (e) {
        tg.showAlert("Xatolik! Bot kanalda admin bo'lishi kerak.");
        btn.innerText = "TEKSHIRISH";
        btn.disabled = false;
    }
}
