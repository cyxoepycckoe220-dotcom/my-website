// ========== ИСПРАВЛЕННАЯ ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ ==========
async function loadUsers() {
    database.ref('users').on('value', async (snapshot) => {
        const usersData = snapshot.val();
        console.log('📥 Загружены пользователи:', usersData); // Проверка в консоли
        
        if (usersData) {
            users = usersData;
        } else {
            users = {};
        }
        
        await renderDialogs();
    });
}

async function renderDialogs() {
    const container = document.getElementById('dialogsList');
    if (!container) return;
    
    // Получаем список пользователей, исключая себя
    const usersList = Object.values(users).filter(u => u && u.id !== myId);
    
    console.log('👥 Список пользователей для отображения:', usersList);
    
    if (usersList.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">👥 Нет других пользователей<br><small>Поделись ссылкой с друзьями!</small></div>';
        return;
    }
    
    let html = '';
    for (const user of usersList) {
        // Проверяем, есть ли никнейм
        const displayName = user.nickname || user.name || 'Без имени';
        const avatar = user.avatar || '😀';
        
        // Получаем бейджи пользователя
        let badgeHtml = '';
        try {
            const badges = await getUserBadges(user.id);
            badgeHtml = badges.map(b => `<span class="dialog-badge" style="color: ${badgeStyles[b.color]?.color || '#ffd700'}">${b.icon}</span>`).join('');
        } catch(e) { console.log('Ошибка загрузки бейджей:', e); }
        
        html += `
            <div class="dialog-item ${currentChatId === user.id ? 'active' : ''}" onclick="selectChat('${user.id}')">
                <div class="dialog-avatar">${avatar}</div>
                <div class="dialog-info">
                    <div class="dialog-name">${escapeHtml(displayName)} ${badgeHtml}</div>
                    <div class="dialog-last-message">${user.online ? '🟢 Онлайн' : '⚫ Офлайн'}</div>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}