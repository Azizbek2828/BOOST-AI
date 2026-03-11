const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe.user?.id || 0;
const BASE_URL = "https://69b1056aadac80b427c3bc97.mockapi.io";
const BOT_TOKEN = "8756409847:AAF-MdVUIQSf0HaqavXESBvHZ6UV6lsg9rw";

async function loadTasks() {
    const list = document.getElementById('tasks-list');
    try {
        const res = await fetch(`${BASE_URL}/tasks`);
        let tasks = await res.json();
        list.innerHTML = "";

        for (const task of tasks) {
            // 1. Bot adminligini tekshirish (Vazifa ochiqligini tekshirish)
            const checkBot = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${task.channel}&user_id=${BOT_TOKEN.split(':')[0]}`);
            const botData = await checkBot.json();

            // Agar bot admin bo'lmasa yoki vazifa tugagan bo'lsa - O'CHIRISH
            if (!botData.ok || botData.result.status !== 'administrator' || task.completedCount >= task.requiredSubs) {
                await fetch(`${BASE_URL}/tasks/${task.id}`, { method: 'DELETE' });
                continue; 
            }

            if (task.ownerId == userId) continue;

            const div = document.createElement('div');
            div.className = "glass-card task-item";
            div.innerHTML = `
                <div>
                    <b style="color:#3b82f6;">${task.channel}</b>
                    <p style="font-size:12px; color:#94a3b8;">Limit: ${task.completedCount}/${task.requiredSubs}</p>
                </div>
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <button class="task-btn" onclick="window.open('https://t.me/${task.channel.replace('@','')}')">OBUNA</button>
                    <button class="task-btn check-btn" id="btn-${task.id}">TEKSHIRISH</button>
                </div>
            `;
            list.appendChild(div);
            document.getElementById(`btn-${task.id}`).onclick = () => verifyTask(task.id, task);
        }
        
        if(list.innerHTML === "") list.innerHTML = "<p style='text-align:center;'>Vazifalar yo'q</p>";

    } catch (e) { console.error(e); }
}

async function verifyTask(taskId, task) {
    const btn = document.getElementById(`btn-${taskId}`);
    btn.innerText = "⏳"; btn.disabled = true;

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${task.channel}&user_id=${userId}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.ok && ['member', 'administrator', 'creator'].includes(data.result.status)) {
            // 1. Balansni oshirish
            const uRes = await fetch(`${BASE_URL}/users?telegramID=${userId}`);
            const users = await uRes.json();
            await fetch(`${BASE_URL}/users/${users[0].id}`, {
                method: 'PUT',
                headers: {'content-type':'application/json'},
                body: JSON.stringify({ balance: (parseInt(users[0].balance) || 0) + 2 })
            });

            // 2. Vazifa hisoblagichini oshirish
            await fetch(`${BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {'content-type':'application/json'},
                body: JSON.stringify({ completedCount: parseInt(task.completedCount) + 1 })
            });

            tg.showAlert("Muvaffaqiyatli! +2 tanga.");
            location.reload();
        } else {
            tg.showAlert("Obuna bo'lmagansiz!");
            btn.innerText = "TEKSHIRISH"; btn.disabled = false;
        }
    } catch (e) { btn.disabled = false; }
}

loadTasks();
