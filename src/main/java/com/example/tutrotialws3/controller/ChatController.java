package com.example.tutrotialws3.controller;

import com.example.tutrotialws3.dto.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {
//    Создадим два метода: метод добавления пользователя, а второй метод отправки сообщения

    //    Указываем этот метод для обработки этой конечной точки когда клиент отправляет сообщение
    @MessageMapping("/chat.sendMessage")
//    Определяем в какую тему/очередь будем перенаправлять сообщение
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(
            @Payload ChatMessage chatMessage,
//            Получаем доступ к заголовку сообщения
            SimpMessageHeaderAccessor headerAccessor
    ) {
//        Получаем атрибуты сеанса и добавляем в атрибут нового пользователя
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
//        Возвращаем сообщение
        return chatMessage;
    }
}
