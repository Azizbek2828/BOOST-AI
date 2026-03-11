const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe.user?.id;
const BASE_URL = "https://69b1056aadac80b427c3bc97.mockapi.io";

async function loadBalance() {
    if(!userId) return;
    const res = await fetch(`${BASE_URL}/users?telegramID=${userId}`);
    const data = await res.json();
    if(data.length > 0) document.getElementById('balance-amount').innerText = data[0].balance;
}
loadBalance();

document.getElementById('subs-count').addEventListener('input', (e) => {
    const count = e.target.value;
    document.getElementById('total-price').innerText = `Jami xarajat: ${count * 4} tanga`;
});

window.publishTask = async function() {
    const username = document.getElementById('channel-username').value.trim();
    const count = parseInt(document.getElementById('subs-count').value);
    const totalPrice = count * 4;

    if (!username.startsWith('@')) {
        tg.showAlert("@ belgisini unutmang!");
        return;
    }

    const res = await fetch(`${BASE_URL}/users?telegramID=${userId}`);
    const users = await res.json();
    
    if (users.length === 0 || users[0].balance < totalPrice) {
        tg.showAlert("Mablag' yetarli emas!");
        return;
    }

    const btn = document.getElementById('btn-create');
    btn.disabled = true; btn.innerText = "Yaratilmoqda...";

    try {
        // 1. Vazifani bazaga qo'shish
        await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({
                ownerId: userId.toString(),
                channel: username,
                requiredSubs: count,
                completedCount: 0
            })
        });

        // 2. Balansni yangilash
        await fetch(`${BASE_URL}/users/${users[0].id}`, {
            method: 'PUT',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({ balance: users[0].balance - totalPrice })
        });

        tg.showAlert("Vazifa muvaffaqiyatli joylandi!");
        window.location.href = "home.html";
    } catch (e) {
        tg.showAlert("Xatolik yuz berdi!");
        btn.disabled = false; btn.innerText = "Vazifani Joylash";
    }
}
