package com.example.tutrotialws3.config;


import com.example.tutrotialws3.dto.ChatMessage;
import com.example.tutrotialws3.dto.MessageType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    private static final Logger log = LogManager.getLogger(WebSocketEventListener.class);

    private final SimpMessageSendingOperations messagingTemplate;

    public WebSocketEventListener(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    //    Прослушиваем все события отключения сессии
//    Каждый раз когда пользователь разрывает соединение мы должны информировать об этом остальных
//    Таким образом мы должны сообщить всем участникам или пользователям приложения для чата что пользователь покинул чат
//    Поєтому нам нужно прослушать событие отключения сеанса
//    SessionDisconnectEvent - событие отключения сеанса
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
//        Оборачиваем сообщение события в объект StompHeaderAccessor чтобы получить доступ к заголовкам сообщения
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
//        Получаем из сессии атрибут юзера
        String username = (String) headerAccessor.getSessionAttributes().get("username");

        if (username != null) {
            log.info("User disconnected: {} ", username);

            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setType(MessageType.LEAVER);
            chatMessage.setSender(username);

//            В определенных топик отправляем сообщение подписчикам о том что пользователь отключился
            messagingTemplate.convertAndSend("/topic/public", chatMessage);
        }
    }
}
