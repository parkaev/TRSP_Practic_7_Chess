const socket = io();
const board = document.getElementById('board');
const usernameInput = document.getElementById('username');

// Уникальный ID пользователя
const userId = 'user_' + Math.random().toString(36).substr(2, 9);

// === ШАХМАТНАЯ ДОСКА ===
let selected = null;

// Создание доски 8x8
for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
        const square = document.createElement('div');
        square.className = `square ${(x + y) % 2 === 0 ? 'white' : 'black'}`;
        square.dataset.x = x;
        square.dataset.y = y;

        // Начальная позиция фигуры
        if (x === 0 && y === 0) {
            square.innerHTML = `<div class="piece" draggable="true">♞</div>`;
        }

        board.appendChild(square);
    }
}

// Обработка кликов по доске
board.addEventListener('click', e => {
    const target = e.target;

    // Клик по фигуре
    if (target.classList.contains('piece')) {
        selected = target;
    }

    // Клик по клетке
    else if (selected && target.classList.contains('square')) {
        const newX = target.dataset.x;
        const newY = target.dataset.y;

        // Перемещаем локально
        target.innerHTML = '';
        target.appendChild(selected);
        selected = null;

        // Отправляем новое положение на сервер
        socket.emit('move_piece', { x: newX, y: newY });
    }
});

// Получение перемещения фигуры от других клиентов
socket.on('piece_moved', data => {
    const { x, y } = data;

    // Удаляем фигуру из текущего места
    const currentPiece = document.querySelector('.piece');
    if (currentPiece) {
        currentPiece.parentElement.innerHTML = '';
    }

    // Добавляем фигуру в новую клетку
    const targetSquare = document.querySelector(`.square[data-x='${x}'][data-y='${y}']`);
    if (targetSquare) {
        targetSquare.innerHTML = `<div class="piece" draggable="true">♞</div>`;
    }
});


// === ЧАТ ===
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat');

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    const name = usernameInput.value.trim() || 'Аноним';

    if (message !== '') {
        socket.emit('chat_message', {
            user_id: userId,
            name: name,
            message: message
        });
        chatInput.value = '';
    }
});

// Получение сообщений от сервера
socket.on('chat_message', (data) => {
    const p = document.createElement('p');
    p.innerHTML = `<strong>${data.name}:</strong> ${data.message}`;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
});
