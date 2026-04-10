// Массив с новостями
let newsArray = [];

// Загружаем новости из localStorage
function loadNews() {
    const saved = localStorage.getItem('newsPortal');
    if (saved) {
        newsArray = JSON.parse(saved);
    }
    renderNews();
}

// Сохраняем новости
function saveNews() {
    localStorage.setItem('newsPortal', JSON.stringify(newsArray));
}

// Отображение новостей для всех
function renderNews() {
    const newsGrid = document.getElementById('newsGrid');
    
    if (newsArray.length === 0) {
        newsGrid.innerHTML = `<div class="empty-state">📭 Новостей пока нет</div>`;
        return;
    }
    
    newsGrid.innerHTML = '';
    
    // Показываем новости (сначала новые)
    [...newsArray].reverse().forEach((news, idx) => {
        const originalIndex = newsArray.length - 1 - idx;
        const date = new Date(news.date);
        const formattedDate = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()} ${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`;
        const uniqueId = `news-${Date.now()}-${originalIndex}`;
        
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <div class="news-header">
                <h3>${escapeHtml(news.title)}</h3>
                <div class="news-date">🕒 ${formattedDate}</div>
            </div>
            <div class="news-preview">${escapeHtml(news.preview)}</div>
            <div class="news-full" id="${uniqueId}-full" style="display: none;">${escapeHtml(news.full).replace(/\n/g, '<br>')}</div>
            <button class="read-more-btn" onclick="toggleNews('${uniqueId}', this)">📖 Читать далее</button>
        `;
        newsGrid.appendChild(card);
    });
}

// Защита от XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Открыть/закрыть новость
window.toggleNews = function(uniqueId, btn) {
    const fullDiv = document.getElementById(`${uniqueId}-full`);
    if (fullDiv.style.display === 'none') {
        fullDiv.style.display = 'block';
        btn.innerHTML = '📖 Свернуть';
    } else {
        fullDiv.style.display = 'none';
        btn.innerHTML = '📖 Читать далее';
    }
};

// === АДМИНКА ===

// Показать окно входа
function showLogin() {
    document.getElementById('loginOverlay').classList.remove('hidden');
}

// Скрыть окно входа
function hideLogin() {
    document.getElementById('loginOverlay').classList.add('hidden');
}

// Вход в админку
function login(password) {
    // СЕКРЕТНЫЙ КОД — поменяй на свой!
    const SECRET_CODE = 'admin123';
    
    if (password === SECRET_CODE) {
        localStorage.setItem('isAdmin', 'true');
        hideLogin();
        showAdminPanel();
        alert('✅ Добро пожаловать в админ-панель!');
    } else {
        alert('❌ Неверный код доступа');
    }
}

// Показать админ-панель
function showAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.remove('hidden');
}

// Скрыть админ-панель
function hideAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.add('hidden');
}

// Выход из админки
function logout() {
    localStorage.removeItem('isAdmin');
    hideAdminPanel();
    alert('👋 Вы вышли из админ-панели');
}

// Добавить новость
function addNews() {
    const title = document.getElementById('titleInput').value.trim();
    const preview = document.getElementById('previewInput').value.trim();
    const full = document.getElementById('fullInput').value.trim();
    
    if (!title || !preview || !full) {
        alert('❌ Заполните все поля!');
        return;
    }
    
    const newNews = {
        title: title,
        preview: preview,
        full: full,
        date: new Date().toISOString()
    };
    
    newsArray.unshift(newNews);
    saveNews();
    renderNews();
    
    // Очищаем поля
    document.getElementById('titleInput').value = '';
    document.getElementById('previewInput').value = '';
    document.getElementById('fullInput').value = '';
    
    alert('✅ Новость добавлена!');
}

// Проверка при загрузке — остаётся ли админ
function checkAdminOnLoad() {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
        showAdminPanel();
    }
}

// Скрытая кнопка для вызова входа (для планшета — тройной тап по шапке)
let tapCount = 0;
let tapTimer;

function setupSecretTrigger() {
    const header = document.querySelector('.header');
    header.addEventListener('click', () => {
        tapCount++;
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => { tapCount = 0; }, 500);
        
        if (tapCount === 3) {
            tapCount = 0;
            showLogin();
        }
    });
}

// Ждём загрузку
document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    checkAdminOnLoad();
    setupSecretTrigger();
    
    // Кнопка входа
    document.getElementById('loginBtn').addEventListener('click', () => {
        const pwd = document.getElementById('adminPassword').value;
        login(pwd);
        document.getElementById('adminPassword').value = '';
    });
    
    // Кнопка добавления новости
    document.getElementById('addNewsBtn').addEventListener('click', addNews);
    
    // Кнопка выхода
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Закрыть окно входа по клику на фон
    document.getElementById('loginOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('loginOverlay')) {
            hideLogin();
        }
    });
});