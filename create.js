const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe.user?.id;
const BASE_URL = "https://69b1056aadac80b427c3bc97.mockapi.io";

async function loadBalance() {
    const res = await fetch(`${BASE_URL}/users?telegramID=${userId}`);
    const data = await res.json();
    if(data.length > 0) document.getElementById('balance-amount').innerText = data[0].balance;
}
loadBalance();

document.getElementById('subs-count').oninput = (e) => {
    document.getElementById('total-price').innerText = `Jami xarajat: ${e.target.value * 4} tanga`;
};

window.publishTask = async function() {
    const username = document.getElementById('channel-username').value.trim();
    const count = parseInt(document.getElementById('subs-count').value);
    const totalPrice = count * 4;

    const res = await fetch(`${BASE_URL}/users?telegramID=${userId}`);
    const users = await res.json();
    const currentBalance = users[0]?.balance || 0;

    if (currentBalance < totalPrice) {
        tg.showAlert("Mablag' yetarli emas!");
        return;
    }

    // 1. Vazifani yaratish
    await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({
            ownerId: userId,
            channel: username,
            requiredSubs: count,
            completedCount: 0
        })
    });

    // 2. Balansni yechish
    await fetch(`${BASE_URL}/users/${users[0].id}`, {
        method: 'PUT',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({ balance: currentBalance - totalPrice })
    });

    tg.showAlert("Vazifa joylandi!");
    window.location.href = "home.html";
}
