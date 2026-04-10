// === ПОДКЛЮЧЕНИЕ К БЕСПЛАТНОМУ СЕРВЕРУ ДЛЯ МЫШЕК ===
// Используем публичный WebSocket сервер (бесплатно, не требует регистрации)
const SOCKET_URL = 'wss://socketsbay.com/wss/v2/1/sitemaker';

let socket = null;
let myId = Math.random().toString(36).substr(2, 8);
let myName = 'User_' + myId.substr(0, 4);
let remoteCursors = {};

// === ОСТАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let siteElements = [];
let isEditorMode = false;

// === ЗАГРУЗКА САЙТА (localStorage) ===
function loadSite() {
    const saved = localStorage.getItem('sitemaker_site');
    if (saved) {
        siteElements = JSON.parse(saved);
    } else {
        siteElements = [
            { id: 'title1', type: 'title', content: '✨ SiteMaker', link: '', styles: {} },
            { id: 'text1', type: 'text', content: 'Создай свой сайт вместе с друзьями! Ты видишь их мышки? 🖱️', link: '', styles: {} },
            { id: 'btn1', type: 'button', content: 'Нажми меня', link: '#', styles: {} }
        ];
    }
    renderSite();
}

function saveSite() {
    localStorage.setItem('sitemaker_site', JSON.stringify(siteElements));
    broadcastUpdate();
}

function broadcastUpdate() {
    const channel = new BroadcastChannel('sitemaker');
    channel.postMessage({ type: 'UPDATE', elements: siteElements });
}

const channel = new BroadcastChannel('sitemaker');
channel.onmessage = (event) => {
    if (event.data.type === 'UPDATE') {
        siteElements = event.data.elements;
        renderSite();
    }
};

// === РЕНДЕР САЙТА ===
function renderSite() {
    const container = document.getElementById('pageContent');
    if (!container) return;
    
    const bgColor = localStorage.getItem('sitemaker_bgColor') || '#f5f5f5';
    const textColor = localStorage.getItem('sitemaker_textColor') || '#000000';
    const fontFamily = localStorage.getItem('sitemaker_fontFamily') || 'system-ui';
    document.body.style.backgroundColor = bgColor;
    document.body.style.color = textColor;
    document.body.style.fontFamily = fontFamily;
    
    container.innerHTML = '';
    
    siteElements.forEach(element => {
        const elementDiv = document.createElement('div');
        elementDiv.className = 'editable-element';
        elementDiv.dataset.id = element.id;
        
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
        
        if (isEditorMode) {
            const controls = document.createElement('div');
            controls.className = 'element-controls';
            controls.innerHTML = `
                <button onclick="editElement('${element.id}')">✏️</button>
                <button class="delete-element" onclick="deleteElement('${element.id}')">🗑️</button>
            `;
            elementDiv.appendChild(controls);
        }
        
        container.appendChild(elementDiv);
    });
    
    if (siteElements.length === 0 && !isEditorMode) {
        container.innerHTML = `<div class="welcome-message"><h1>✨ SiteMaker</h1><p>Нажми "Редактор" чтобы начать!</p></div>`;
    }
}

// === УПРАВЛЕНИЕ ЭЛЕМЕНТАМИ ===
function addElement(type) {
    let content = '';
    let link = '';
    
    if (type === 'title') content = prompt('Заголовок:', 'Новый заголовок');
    else if (type === 'text') content = prompt('Текст:', 'Новый текст');
    else if (type === 'button') {
        content = prompt('Текст кнопки:', 'Нажми меня');
        link = prompt('Ссылка:', '#');
    }
    else if (type === 'image') content = prompt('URL картинки:', 'https://picsum.photos/300/200');
    else if (type === 'html') content = prompt('HTML код:', '<div>Мой блок</div>');
    
    if (!content && type !== 'html') return;
    
    siteElements.push({
        id: Date.now() + '_' + Math.random(),
        type: type,
        content: content || '',
        link: link || '#',
        styles: {}
    });
    saveSite();
    renderSite();
}

window.editElement = function(id) {
    const el = siteElements.find(e => e.id === id);
    if (!el) return;
    let newContent = prompt('Редактировать:', el.content);
    if (newContent) el.content = newContent;
    if (el.type === 'button') {
        let newLink = prompt('Ссылка:', el.link || '#');
        if (newLink) el.link = newLink;
    }
    saveSite();
    renderSite();
};

window.deleteElement = function(id) {
    if (confirm('Удалить?')) {
        siteElements = siteElements.filter(e => e.id !== id);
        saveSite();
        renderSite();
    }
};

function clearSite() {
    if (confirm('Очистить всё?')) {
        siteElements = [];
        saveSite();
        renderSite();
    }
}

function applyStyles() {
    const bg = document.getElementById('bgColor')?.value;
    const color = document.getElementById('textColor')?.value;
    const font = document.getElementById('fontFamily')?.value;
    if (bg) localStorage.setItem('sitemaker_bgColor', bg);
    if (color) localStorage.setItem('sitemaker_textColor', color);
    if (font) localStorage.setItem('sitemaker_fontFamily', font);
    renderSite();
}

// === РЕЖИМ РЕДАКТОРА ===
function enterEditor() {
    isEditorMode = true;
    document.getElementById('editorBtn').style.display = 'none';
    document.getElementById('exitEditorBtn').style.display = 'block';
    document.getElementById('editorPanel').classList.remove('hidden');
    renderSite();
}

function exitEditor() {
    isEditorMode = false;
    document.getElementById('editorBtn').style.display = 'block';
    document.getElementById('exitEditorBtn').style.display = 'none';
    document.getElementById('editorPanel').classList.add('hidden');
    renderSite();
}

// === ЖИВЫЕ МЫШКИ (WebSocket) ===
function initWebSocket() {
    try {
        socket = new WebSocket(SOCKET_URL);
        
        socket.onopen = () => {
            console.log('🟢 Подключено к серверу мышек');
            // Отправляем приветствие
            socket.send(JSON.stringify({
                type: 'join',
                id: myId,
                name: myName
            }));
        };
        
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'join') {
                    // Добавляем новую мышку
                    if (!remoteCursors[data.id] && data.id !== myId) {
                        remoteCursors[data.id] = {
                            id: data.id,
                            name: data.name,
                            x: 0,
                            y: 0
                        };
                        renderRemoteCursors();
                    }
                }
                else if (data.type === 'move') {
                    // Обновляем позицию мышки
                    if (remoteCursors[data.id]) {
                        remoteCursors[data.id].x = data.x;
                        remoteCursors[data.id].y = data.y;
                        renderRemoteCursors();
                    }
                }
                else if (data.type === 'leave') {
                    // Удаляем мышку
                    delete remoteCursors[data.id];
                    renderRemoteCursors();
                }
            } catch(e) {}
        };
        
        socket.onclose = () => {
            console.log('🔴 Отключено от сервера');
            setTimeout(initWebSocket, 3000);
        };
        
        socket.onerror = () => {
            console.log('⚠️ Ошибка подключения');
        };
    } catch(e) {
        console.log('WebSocket не поддерживается');
    }
}

// Отправляем движение мышки
function sendMouseMove(x, y) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'move',
            id: myId,
            x: x,
            y: y
        }));
    }
}

// Отправляем уход
function sendLeave() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'leave',
            id: myId
        }));
    }
}

// Рендер чужих мышек на экране
function renderRemoteCursors() {
    const container = document.getElementById('remoteCursorsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let id in remoteCursors) {
        const cursor = remoteCursors[id];
        const cursorDiv = document.createElement('div');
        cursorDiv.className = 'remote-cursor';
        cursorDiv.style.left = cursor.x + 'px';
        cursorDiv.style.top = cursor.y + 'px';
        
        // Случайный цвет для каждого пользователя
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffaa00', '#ff00ff', '#00ffff'];
        const colorIndex = (id.charCodeAt(0) || 0) % colors.length;
        cursorDiv.style.border = `2px solid ${colors[colorIndex]}`;
        cursorDiv.style.background = `${colors[colorIndex]}33`;
        
        cursorDiv.innerHTML = `<div class="cursor-name">${cursor.name}</div>`;
        container.appendChild(cursorDiv);
    }
    
    // Обновляем счётчик онлайн
    const countBtn = document.getElementById('onlineCount');
    if (countBtn) {
        const onlineCount = Object.keys(remoteCursors).length + 1;
        countBtn.innerHTML = `👥 ${onlineCount} онлайн`;
    }
}

// === СВОЯ МЫШКА ===
function initMyCursor() {
    const cursor = document.getElementById('myCursor');
    if (!cursor) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = (e.clientX - 12) + 'px';
        cursor.style.top = (e.clientY - 12) + 'px';
        sendMouseMove(e.clientX, e.clientY);
    });
    
    document.addEventListener('mouseleave', () => {
        sendLeave();
    });
}

// === ЗАПРОС ИМЕНИ ПОЛЬЗОВАТЕЛЯ ===
function askUserName() {
    const name = prompt('Введи своё имя (будут видеть другие):', myName);
    if (name && name.trim()) {
        myName = name.trim();
    }
}

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
    askUserName();
    loadSite();
    initMyCursor();
    initWebSocket();
    
    // Кнопки
    document.getElementById('editorBtn')?.addEventListener('click', enterEditor);
    document.getElementById('exitEditorBtn')?.addEventListener('click', exitEditor);
    document.getElementById('closeEditorBtn')?.addEventListener('click', exitEditor);
    document.getElementById('clearSiteBtn')?.addEventListener('click', clearSite);
    document.getElementById('saveSiteBtn')?.addEventListener('click', saveSite);
    
    document.getElementById('addTextBtn')?.addEventListener('click', () => addElement('text'));
    document.getElementById('addTitleBtn')?.addEventListener('click', () => addElement('title'));
    document.getElementById('addButtonBtn')?.addEventListener('click', () => addElement('button'));
    document.getElementById('addImageBtn')?.addEventListener('click', () => addElement('image'));
    document.getElementById('addHtmlBtn')?.addEventListener('click', () => addElement('html'));
    
    document.getElementById('bgColor')?.addEventListener('change', applyStyles);
    document.getElementById('textColor')?.addEventListener('change', applyStyles);
    document.getElementById('fontFamily')?.addEventListener('change', applyStyles);
});

// При закрытии страницы
window.addEventListener('beforeunload', () => {
    sendLeave();
});