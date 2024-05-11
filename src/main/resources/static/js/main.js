'use strict';

// Подключение к элементам DOM
var usernamePage = document.querySelector('#username-page'); // Страница ввода имени пользователя
var chatPage = document.querySelector('#chat-page'); // Страница чата
var usernameForm = document.querySelector('#usernameForm'); // Форма ввода имени пользователя
var messageForm = document.querySelector('#messageForm'); // Форма отправки сообщения
var messageInput = document.querySelector('#message'); // Поле ввода сообщения
var messageArea = document.querySelector('#messageArea'); // Область отображения сообщений
var connectingElement = document.querySelector('.connecting'); // Элемент для отображения статуса подключения

// Переменные для работы с WebSocket
var stompClient = null; // WebSocket клиент
var username = null; // Имя текущего пользователя

// Массив цветов для аватаров
var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

// Функция для установки соединения с WebSocket сервером
function connect(event) {
    // Получаем имя пользователя из формы ввода
    username = document.querySelector('#name').value.trim();

    // Проверяем, что имя пользователя не пустое
    if(username) {
        // Скрываем страницу ввода имени и отображаем страницу чата
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        // Создаем объект WebSocket и инициализируем Stomp клиент
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        // Подключаемся к WebSocket серверу
        stompClient.connect({}, onConnected, onError);
    }

    // Отменяем стандартное действие формы (перезагрузку страницы)
    event.preventDefault();
}

// Функция, вызываемая при успешном подключении к WebSocket серверу
function onConnected() {
    // Подписываемся на общую тему для получения сообщений
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Отправляем на сервер сообщение о присоединении нового пользователя
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    // Скрываем элемент отображения статуса подключения
    connectingElement.classList.add('hidden');
}

// Функция, вызываемая при ошибке подключения к WebSocket серверу
function onError(error) {
    // Выводим сообщение об ошибке на странице
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

// Функция для отправки сообщения через WebSocket
function sendMessage(event) {
    // Получаем содержимое сообщения из поля ввода
    var messageContent = messageInput.value.trim();

    // Проверяем, что сообщение не пустое и установлено соединение с WebSocket сервером
    if(messageContent && stompClient) {
        // Формируем объект сообщения
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        // Отправляем сообщение на сервер
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));

        // Очищаем поле ввода сообщения
        messageInput.value = '';
    }

    // Отменяем стандартное действие формы (перезагрузку страницы)
    event.preventDefault();
}

// Функция, вызываемая при получении нового сообщения от WebSocket сервера
function onMessageReceived(payload) {
    // Разбираем JSON-сообщение
    var message = JSON.parse(payload.body);

    // Создаем элемент сообщения
    var messageElement = document.createElement('li');

    // Определяем тип сообщения
    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        // Создаем аватар пользователя
        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        // Добавляем аватар к сообщению
        messageElement.appendChild(avatarElement);

        // Добавляем имя пользователя к сообщению
        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    // Добавляем текст сообщения к элементу
    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);

    // Добавляем сообщение к области сообщений и прокручиваем ее к последнему сообщению
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

// Функция для генерации цвета аватара пользователя
function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

// Добавляем обработчики событий для формы ввода имени пользователя и формы отправки сообщения
usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)
