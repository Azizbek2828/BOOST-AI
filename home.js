const tg = window.Telegram.WebApp;
const userData = tg.initDataUnsafe.user;
const BASE_URL = "https://69b1056aadac80b427c3bc97.mockapi.io";

async function initHome() {
    if (userData) {
        const userId = userData.id.toString();
        document.getElementById('user-name').innerText = userData.first_name;
        document.getElementById('user-id-text').innerText = "ID: " + userId;
        if (userData.photo_url) document.getElementById('user-photo').src = userData.photo_url;

        // 1. Foydalanuvchi balansini MockAPI dan olish
        try {
            const res = await fetch(`${BASE_URL}/users?telegramID=${userId}`);
            const users = await res.json();
            
            if (users.length > 0) {
                document.getElementById('balance-amount').innerText = users[0].balance;
            } else {
                // Yangi foydalanuvchi bo'lsa bazaga qo'shish
                await fetch(`${BASE_URL}/users`, {
                    method: 'POST',
                    headers: {'content-type':'application/json'},
                    body: JSON.stringify({ telegramID: userId, balance: 0 })
                });
                document.getElementById('balance-amount').innerText = "0";
            }
        } catch (e) { console.log("Xato:", e); }

        // 2. Vazifalar sonini hisoblash
        try {
            const taskRes = await fetch(`${BASE_URL}/tasks`);
            const tasks = await taskRes.json();
            document.getElementById('active-tasks-count').innerText = tasks.length;
        } catch (e) { console.log(e); }
    }
}

initHome();
tg.ready();
