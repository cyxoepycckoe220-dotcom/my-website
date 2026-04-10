// === Настройки ===
const SUPABASE_URL = 'https://cnwwqsxvmcxfwfijsflb.supabase.co';  // Замени на свой
const SUPABASE_KEY = 'sb_publishable_w8Zqb5UZs93sZJLvlbLHWg_4ykyd3Ey';              // Замени на свой

// ВРЕМЕННОЕ РЕШЕНИЕ (без сервера) - сохраняем в localStorage и синхронизируем через BroadcastChannel
// Это работает на одном устройстве. Чтобы работало на всех - нужен Supabase или Firebase

// Используем localStorage + событие для синхронизации на том же устройстве
let siteElements = [];
let isEditorMode = false;
let currentUserId = Math.random().toString(36).substr(2, 9);

// Загрузка сохранённого сайта
function loadSite() {
    const saved = localStorage.getItem('sitemaker_site');
    if (saved) {
        siteElements = JSON.parse(saved);
    } else {
        // Начальные элементы
        siteElements = [
            { id: 'title1', type: 'title', content: '✨ SiteMaker', styles: {} },
            { id: 'text1', type: 'text', content: 'Создай свой сайт вместе с друзьями! Нажми на кнопку "Редактор" и добавь что-нибудь.', styles: {} },
            { id: 'btn1', type: 'button', content: 'Круто!', link: '#', styles: {} }
        ];
    }
    renderSite();
}

// Сохранение сайта
function saveSite() {
    localStorage.setItem('sitemaker_site', JSON.stringify(siteElements));
    // Отправляем сообщение другим вкладкам (на том же устройстве)
    broadcastUpdate();
}

// Синхронизация между вкладками
function broadcastUpdate() {
    const channel = new BroadcastChannel('sitemaker');
    channel.postMessage({ type: 'UPDATE', elements: siteElements });
}

// Получение обновлений
const channel = new BroadcastChannel('sitemaker');
channel.onmessage = (event) => {
    if (event.data.type === 'UPDATE') {
        siteElements = event.data.elements;
        renderSite();
    }
};

// Рендер сайта
function renderSite() {
    const container = document.getElementById('pageContent');
    if (!container) return;
    
    // Применяем стили к body
    const bodyBg = localStorage.getItem('sitemaker_bgColor') || '#f5f5f5';
    const bodyColor = localStorage.getItem('sitemaker_textColor') || '#000000';
    const bodyFont = localStorage.getItem('sitemaker_fontFamily') || 'system-ui';
    document.body.style.backgroundColor = bodyBg;
    document.body.style.color = bodyColor;
    document.body.style.fontFamily = bodyFont;
    
    container.innerHTML = '';
    
    siteElements.forEach(element => {
        const elementDiv = document.createElement('div');
        elementDiv.className = 'editable-element';
        elementDiv.dataset.id = element.id;
        elementDiv.dataset.type = element.type;
        
        // Содержимое в зависимости от типа
        if (element.type === 'title') {
            const h = document.createElement('h1');
            h.textContent = element.content;
            elementDiv.appendChild(h);
        } else if (element.type === 'text') {
            const p = document.createElement('p');
            p.textContent = element.content;
            elementDiv.appendChild(p);
        } else if (element.type === 'button') {
            const btn = document.createElement('button');
            btn.textContent = element.content;
            btn.style.padding = '10px 20px';
            btn.style.borderRadius = '30px';
            btn.style.border = 'none';
            btn.style.cursor = 'pointer';
            btn.style.background = '#667eea';
            btn.style.color = 'white';
            if (element.link && element.link !== '#') {
                btn.onclick = () => window.open(element.link, '_blank');
            }
            elementDiv.appendChild(btn);
        } else if (element.type === 'image') {
            const img = document.createElement('img');
            img.src = element.content;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '12px';
            elementDiv.appendChild(img);
        } else if (element.type === 'html') {
            const div = document.createElement('div');
            div.innerHTML = element.content;
            elementDiv.appendChild(div);
        }
        
        // Кнопки управления (только в режиме редактора)
        if (isEditorMode) {
            const controls = document.createElement('div');
            controls.className = 'element-controls';
            controls.innerHTML = `
                <button class="edit-element" onclick="editElement('${element.id}')">✏️</button>
                <button class="delete-element" onclick="deleteElement('${element.id}')">🗑️</button>
            `;
            elementDiv.appendChild(controls);
        }
        
        container.appendChild(elementDiv);
    });
    
    // Если нет элементов и редактор выключен, показываем приветствие
    if (siteElements.length === 0 && !isEditorMode) {
        container.innerHTML = `
            <div class="welcome-message">
                <h1>✨ Добро пожаловать в SiteMaker!</h1>
                <p>Нажми на кнопку "Редактор", чтобы начать создавать свой сайт</p>
            </div>
        `;
    }
}

// Добавление элемента
function addElement(type) {
    let content = '';
    let link = '';
    
    if (type === 'title') {
        content = prompt('Введите заголовок:', 'Новый заголовок');
    } else if (type === 'text') {
        content = prompt('Введите текст:', 'Новый текст');
    } else if (type === 'button') {
        content = prompt('Текст кнопки:', 'Нажми меня');
        link = prompt('Ссылка (оставь пустым для #):', '#');
    } else if (type === 'image') {
        content = prompt('Введите URL картинки:', 'https://picsum.photos/300/200');
    } else if (type === 'html') {
        content = prompt('Введите HTML код:', '<div style="padding:20px;background:#f0f0f0;">Мой блок</div>');
    }
    
    if (!content && type !== 'html') return;
    
    const newElement = {
        id: Date.now() + '_' + Math.random(),
        type: type,
        content: content || '',
        link: link || '#',
        styles: {}
    };
    
    siteElements.push(newElement);
    saveSite();
    renderSite();
}

// Редактирование элемента
window.editElement = function(id) {
    const element = siteElements.find(e => e.id === id);
    if (!element) return;
    
    let newContent = '';
    if (element.type === 'title') {
        newContent = prompt('Редактировать заголовок:', element.content);
    } else if (element.type === 'text') {
        newContent = prompt('Редактировать текст:', element.content);
    } else if (element.type === 'button') {
        newContent = prompt('Редактировать текст кнопки:', element.content);
        const newLink = prompt('Редактировать ссылку:', element.link || '#');
        element.link = newLink;
    } else if (element.type === 'image') {
        newContent = prompt('Редактировать URL картинки:', element.content);
    } else if (element.type === 'html') {
        newContent = prompt('Редактировать HTML:', element.content);
    }
    
    if (newContent) element.content = newContent;
    saveSite();
    renderSite();
};

// Удаление элемента
window.deleteElement = function(id) {
    if (confirm('Удалить этот элемент?')) {
        siteElements = siteElements.filter(e => e.id !== id);
        saveSite();
        renderSite();
    }
};

// Очистка всего сайта
function clearSite() {
    if (confirm('⚠️ Очистить весь сайт? Все элементы будут удалены!')) {
        siteElements = [];
        saveSite();
        renderSite();
    }
}

// Применение стилей
function applyStyles() {
    const bgColor = document.getElementById('bgColor')?.value;
    const textColor = document.getElementById('textColor')?.value;
    const fontFamily = document.getElementById('fontFamily')?.value;
    
    if (bgColor) localStorage.setItem('sitemaker_bgColor', bgColor);
    if (textColor) localStorage.setItem('sitemaker_textColor', textColor);
    if (fontFamily) localStorage.setItem('sitemaker_fontFamily', fontFamily);
    
    renderSite();
}

// Вход в редактор
function enterEditor() {
    isEditorMode = true;
    document.getElementById('editorBtn').style.display = 'none';
    document.getElementById('exitEditorBtn').style.display = 'block';
    document.getElementById('editorPanel').classList.remove('hidden');
    renderSite();
}

// Выход из редактора
function exitEditor() {
    isEditorMode = false;
    document.getElementById('editorBtn').style.display = 'block';
    document.getElementById('exitEditorBtn').style.display = 'none';
    document.getElementById('editorPanel').classList.add('hidden');
    renderSite();
}

// Кастомная мышка
function initCustomCursor() {
    const cursor = document.getElementById('mouseCursor');
    if (!cursor) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    });
    
    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
    });
    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
    });
}

// Онлайн-счётчик (имитация)
let onlineUsers = 1;
function updateOnlineCount() {
    const countBtn = document.getElementById('onlineCount');
    if (countBtn) {
        countBtn.innerHTML = `👥 ${onlineUsers} онлайн`;
    }
}
setInterval(() => {
    onlineUsers = Math.floor(Math.random() * 20) + 1;
    updateOnlineCount();
}, 10000);

// === Инициализация ===
document.addEventListener('DOMContentLoaded', () => {
    loadSite();
    initCustomCursor();
    updateOnlineCount();
    
    // Кнопки редактора
    const editorBtn = document.getElementById('editorBtn');
    const exitEditorBtn = document.getElementById('exitEditorBtn');
    const closeEditorBtn = document.getElementById('closeEditorBtn');
    const clearSiteBtn = document.getElementById('clearSiteBtn');
    const saveSiteBtn = document.getElementById('saveSiteBtn');
    
    if (editorBtn) editorBtn.onclick = enterEditor;
    if (exitEditorBtn) exitEditorBtn.onclick = exitEditor;
    if (closeEditorBtn) closeEditorBtn.onclick = exitEditor;
    if (clearSiteBtn) clearSiteBtn.onclick = clearSite;
    if (saveSiteBtn) saveSiteBtn.onclick = saveSite;
    
    // Кнопки добавления
    const addTextBtn = document.getElementById('addTextBtn');
    const addTitleBtn = document.getElementById('addTitleBtn');
    const addButtonBtn = document.getElementById('addButtonBtn');
    const addImageBtn = document.getElementById('addImageBtn');
    const addHtmlBtn = document.getElementById('addHtmlBtn');
    
    if (addTextBtn) addTextBtn.onclick = () => addElement('text');
    if (addTitleBtn) addTitleBtn.onclick = () => addElement('title');
    if (addButtonBtn) addButtonBtn.onclick = () => addElement('button');
    if (addImageBtn) addImageBtn.onclick = () => addElement('image');
    if (addHtmlBtn) addHtmlBtn.onclick = () => addElement('html');
    
    // Стили
    const bgColor = document.getElementById('bgColor');
    const textColor = document.getElementById('textColor');
    const fontFamily = document.getElementById('fontFamily');
    
    if (bgColor) bgColor.onchange = applyStyles;
    if (textColor) textColor.onchange = applyStyles;
    if (fontFamily) fontFamily.onchange = applyStyles;
});