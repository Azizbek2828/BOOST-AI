const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe.user?.id || 0;
const BASE_URL = "https://69b1056aadac80b427c3bc97.mockapi.io";
const BOT_TOKEN = "8756409847:AAF-MdVUIQSf0HaqavXESBvHZ6UV6lsg9rw";

async function loadTasks() {
    const list = document.getElementById('tasks-list');
    try {
        // 1. Vazifalarni olish
        const res = await fetch(`${BASE_URL}/tasks`);
        const tasks = await res.json();
        list.innerHTML = "";

        // 2. Foydalanuvchi balansini ko'rsatish
        const uRes = await fetch(`${BASE_URL}/users?telegramID=${userId}`);
        const uData = await uRes.json();
        if(uData.length > 0) {
            document.getElementById('balance-amount').innerText = uData[0].balance;
        }

        if (tasks.length === 0) {
            list.innerHTML = "<p style='text-align:center;'>Hozircha vazifalar yo'q.</p>";
            return;
        }

        tasks.forEach(task => {
            // Test uchun o'zimizga ham ko'rinadigan qildik
            const div = document.createElement('div');
            div.className = "glass-card task-item";
            div.innerHTML = `
                <div>
                    <b style="color:#3b82f6;">${task.channel}</b>
                    <p style="font-size:12px; color:#94a3b8;">Mukofot: 2 tanga</p>
                </div>
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <button class="task-btn" onclick="window.open('https://t.me/${task.channel.replace('@','')}')">OBUNA BO'LISH</button>
                    <button class="task-btn check-btn" id="btn-${task.id}" style="background:#22c55e;">TEKSHIRISH</button>
                </div>
            `;
            list.appendChild(div);
            document.getElementById(`btn-${task.id}`).onclick = () => verifyTask(task.id, task);
        });
    } catch (e) { 
        list.innerHTML = "Xatolik: Baza yuklanmadi.";
        console.error(e); 
    }
}

async function verifyTask(taskId, task) {
    const btn = document.getElementById(`btn-${taskId}`);
    btn.innerText = "⏳..."; btn.disabled = true;

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${task.channel}&user_id=${userId}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.ok && ['member', 'administrator', 'creator'].includes(data.result.status)) {
            const uRes = await fetch(`${BASE_URL}/users?telegramID=${userId}`);
            const users = await uRes.json();
            
            if(users.length > 0) {
                const newBal = (parseInt(users[0].balance) || 0) + 2;
                await fetch(`${BASE_URL}/users/${users[0].id}`, {
                    method: 'PUT',
                    headers: {'content-type':'application/json'},
                    body: JSON.stringify({ balance: newBal })
                });
                tg.showAlert("Muvaffaqiyatli! +2 tanga.");
                location.reload();
            }
        } else {
            tg.showAlert("Avval kanalga obuna bo'ling!");
            btn.innerText = "TEKSHIRISH"; btn.disabled = false;
        }
    } catch (e) {
        tg.showAlert("Xatolik! Bot kanalda admin bo'lishi shart.");
        btn.innerText = "TEKSHIRISH"; btn.disabled = false;
    }
}

loadTasks();
tg.ready();
