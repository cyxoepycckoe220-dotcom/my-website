// ========== ИНИЦИАЛИЗАЦИЯ FIREBASE ==========
// ВСТАВЬ СВОИ КЛЮЧИ СЮДА! (из Firebase Console)
const firebaseConfig = {
    apiKey: "ТВОЙ_API_KEY",
    authDomain: "ТВОЙ_ПРОЕКТ.firebaseapp.com",
    databaseURL: "https://ТВОЙ_ПРОЕКТ-default-rtdb.firebaseio.com",
    projectId: "ТВОЙ_ПРОЕКТ",
    storageBucket: "ТВОЙ_ПРОЕКТ.firebasestorage.app",
    messagingSenderId: "ТВОЙ_SENDER_ID",
    appId: "ТВОЙ_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ========== ОСНОВНЫЕ ПЕРЕМЕННЫЕ ==========
let myId = Math.random().toString(36).substr(2, 8);
let myName = prompt('Введи своё имя:', 'User_' + myId.substr(0, 4)) || 'Guest';
let isEditorMode = false;
let siteElements = [];

// ========== ЗАГРУЗКА И СОХРАНЕНИЕ ==========
function loadSite() {
    const saved = localStorage.getItem('sitemaker_site');
    if (saved) {
        siteElements = JSON.parse(saved);
    } else {
        siteElements = [
            { id: '1', type: 'title', content: '✨ SiteMaker' },
            { id: '2', type: 'text', content: 'Создай свой сайт вместе с друзьями! Ты видишь их мышки? 🖱️' },
            { id: '3', type: 'button', content: 'Нажми меня', link: '#' }
        ];
    }
    renderSite();
    applyLiveStylesAndScripts(); // применить CSS/JS после загрузки
}

function saveSite() {
    localStorage.setItem('sitemaker_site', JSON.stringify(siteElements));
    database.ref('siteContent').set({ elements: siteElements });
}

// Применить все CSS и JS блоки на странице
function applyLiveStylesAndScripts() {
    // Удаляем старые динамические стили/скрипты
    document.querySelectorAll('.dynamic-style, .dynamic-script').forEach(el => el.remove());
    
    siteElements.forEach(element => {
        if (element.type === 'css' && element.content) {
            const style = document.createElement('style');
            style.className = 'dynamic-style';
            style.textContent = element.content;
            document.head.appendChild(style);
        } else if (element.type === 'js' && element.content) {
            const script = document.createElement('script');
            script.className = 'dynamic-script';
            script.textContent = element.content;
            document.body.appendChild(script);
        }
    });
}

// ========== ОТОБРАЖЕНИЕ САЙТА ==========
function renderSite() {
    const container = document.getElementById('pageContent');
    if (!container) return;
    
    const bgColor = localStorage.getItem('bgColor') || '#f5f5f5';
    const textColor = localStorage.getItem('textColor') || '#000000';
    document.body.style.backgroundColor = bgColor;
    document.body.style.color = textColor;
    
    container.innerHTML = '';
    
    siteElements.forEach(element => {
        const div = document.createElement('div');
        div.className = 'editable-element';
        div.dataset.id = element.id;
        
        if (element.type === 'title') {
            const h = document.createElement('h1');
            h.textContent = element.content;
            div.appendChild(h);
        } 
        else if (element.type === 'text') {
            const p = document.createElement('p');
            p.textContent = element.content;
            div.appendChild(p);
        } 
        else if (element.type === 'button') {
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
            div.appendChild(btn);
        } 
        else if (element.type === 'image') {
            const img = document.createElement('img');
            img.src = element.content;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '12px';
            div.appendChild(img);
        }
        else if (element.type === 'html') {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = element.content;
            div.appendChild(wrapper);
        }
        else if (element.type === 'css') {
            const pre = document.createElement('pre');
            pre.className = 'code-block';
            pre.textContent = element.content || '/* Твой CSS код */';
            div.appendChild(pre);
        }
        else if (element.type === 'js') {
            const pre = document.createElement('pre');
            pre.className = 'code-block';
            pre.textContent = element.content || '// Твой JavaScript код';
            div.appendChild(pre);
        }
        
        if (isEditorMode) {
            const controls = document.createElement('div');
            controls.className = 'element-controls';
            controls.innerHTML = `
                <button onclick="editElement('${element.id}')">✏️</button>
                <button class="delete-element" onclick="deleteElement('${element.id}')">🗑️</button>
            `;
            div.appendChild(controls);
        }
        
        container.appendChild(div);
    });
    
    if (siteElements.length === 0 && !isEditorMode) {
        container.innerHTML = `<div class="welcome-message"><h1>✨ SiteMaker</h1><p>Нажми "Редактор" чтобы начать!</p></div>`;
    }
    
    // После отрисовки применяем CSS/JS блоки
    applyLiveStylesAndScripts();
}

// ========== РЕДАКТИРОВАНИЕ ЭЛЕМЕНТОВ ==========
window.editElement = function(id) {
    const el = siteElements.find(e => e.id === id);
    if (!el) return;
    
    let newContent = '';
    if (el.type === 'title' || el.type === 'text') {
        newContent = prompt('Редактировать текст:', el.content);
    } 
    else if (el.type === 'button') {
        newContent = prompt('Текст кнопки:', el.content);
        let newLink = prompt('Ссылка:', el.link || '#');
        if (newLink) el.link = newLink;
    }
    else if (el.type === 'image') {
        newContent = prompt('URL картинки:', el.content);
    }
    else if (el.type === 'html') {
        newContent = prompt('Введите HTML код:', el.content);
    }
    else if (el.type === 'css') {
        newContent = prompt('Введите CSS стили:', el.content);
    }
    else if (el.type === 'js') {
        newContent = prompt('Введите JavaScript код:', el.content);
    }
    
    if (newContent !== undefined && newContent !== null) el.content = newContent;
    saveSite();
    renderSite();
};

window.deleteElement = function(id) {
    if (confirm('Удалить элемент?')) {
        siteElements = siteElements.filter(e => e.id !== id);
        saveSite();
        renderSite();
    }
};

// ========== ДОБАВЛЕНИЕ НОВЫХ БЛОКОВ ==========
function addElement(type) {
    let content = '';
    let link = '#';
    
    switch(type) {
        case 'title': content = prompt('Заголовок:', 'Новый заголовок'); break;
        case 'text': content = prompt('Текст:', 'Новый текст'); break;
        case 'button': 
            content = prompt('Текст кнопки:', 'Нажми меня');
            link = prompt('Ссылка:', '#');
            break;
        case 'image': content = prompt('URL картинки:', 'https://picsum.photos/300/200'); break;
        case 'html': content = prompt('Введите HTML код:', '<div style="padding:20px;background:#f0f0f0;">Привет, мир!</div>'); break;
        case 'css': content = prompt('Введите CSS стили:', 'body { background: lightblue; }'); break;
        case 'js': content = prompt('Введите JavaScript код:', 'alert("Привет от SiteMaker!");'); break;
    }
    
    if (!content && type !== 'html') return;
    
    siteElements.push({
        id: Date.now() + '_' + Math.random(),
        type: type,
        content: content || '',
        link: link
    });
    saveSite();
    renderSite();
}

function clearSite() {
    if (confirm('Очистить весь сайт? Все элементы будут удалены!')) {
        siteElements = [];
        saveSite();
        renderSite();
    }
}

function applyStyles() {
    const bg = document.getElementById('bgColor')?.value;
    const color = document.getElementById('textColor')?.value;
    if (bg) localStorage.setItem('bgColor', bg);
    if (color) localStorage.setItem('textColor', color);
    renderSite();
}

// ========== РЕЖИМ РЕДАКТОРА ==========
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

// ========== ЖИВЫЕ МЫШКИ (Firebase) ==========
let cursorsRef = database.ref('cursors');

function sendMousePosition(x, y) {
    database.ref('cursors/' + myId).set({
        x: x, y: y, name: myName, timestamp: Date.now()
    });
}

function removeMyCursor() {
    database.ref('cursors/' + myId).remove();
}

function listenCursors() {
    cursorsRef.on('value', (snapshot) => {
        const cursors = snapshot.val() || {};
        document.querySelectorAll('.remote-cursor').forEach(el => el.remove());
        
        let count = 0;
        for (let id in cursors) {
            if (id === myId) continue;
            count++;
            const cursor = cursors[id];
            const colors = ['#ff0000', '#00ff00', '#0066ff', '#ffaa00', '#ff00ff', '#00cccc'];
            const colorIndex = (id.charCodeAt(0) || 0) % colors.length;
            
            const cursorDiv = document.createElement('div');
            cursorDiv.className = 'remote-cursor';
            cursorDiv.style.left = cursor.x + 'px';
            cursorDiv.style.top = cursor.y + 'px';
            cursorDiv.style.border = `2px solid ${colors[colorIndex]}`;
            cursorDiv.style.background = `${colors[colorIndex]}33`;
            cursorDiv.innerHTML = `<div class="cursor-name">${escapeHtml(cursor.name || '???')}</div>`;
            document.body.appendChild(cursorDiv);
        }
        
        document.getElementById('onlineCount').innerHTML = `👥 ${count + 1} онлайн`;
        
        const now = Date.now();
        for (let id in cursors) {
            if (cursors[id].timestamp && now - cursors[id].timestamp > 5000) {
                database.ref('cursors/' + id).remove();
            }
        }
    });
}

function listenSiteChanges() {
    database.ref('siteContent').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && data.elements && !isEditorMode) {
            if (JSON.stringify(siteElements) !== JSON.stringify(data.elements)) {
                siteElements = data.elements;
                renderSite();
            }
        }
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initMyCursor() {
    const cursor = document.getElementById('myCursor');
    if (!cursor) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = (e.clientX - 12) + 'px';
        cursor.style.top = (e.clientY - 12) + 'px';
        sendMousePosition(e.clientX, e.clientY);
    });
    
    document.addEventListener('mouseleave', removeMyCursor);
    window.addEventListener('beforeunload', removeMyCursor);
}

// ========== ЗАПУСК ==========
document.addEventListener('DOMContentLoaded', () => {
    loadSite();
    initMyCursor();
    listenCursors();
    listenSiteChanges();
    
    setInterval(() => {
        if (myId) {
            database.ref('cursors/' + myId).update({ timestamp: Date.now() });
        }
    }, 3000);
    
    document.getElementById('editorBtn').onclick = enterEditor;
    document.getElementById('exitEditorBtn').onclick = exitEditor;
    document.getElementById('closeEditorBtn').onclick = exitEditor;
    document.getElementById('clearSiteBtn').onclick = clearSite;
    
    document.getElementById('addTextBtn').onclick = () => addElement('text');
    document.getElementById('addTitleBtn').onclick = () => addElement('title');
    document.getElementById('addButtonBtn').onclick = () => addElement('button');
    document.getElementById('addImageBtn').onclick = () => addElement('image');
    document.getElementById('addHtmlBtn').onclick = () => addElement('html');
    document.getElementById('addCssBtn').onclick = () => addElement('css');
    document.getElementById('addJsBtn').onclick = () => addElement('js');
    
    document.getElementById('bgColor').onchange = applyStyles;
    document.getElementById('textColor').onchange = applyStyles;
});