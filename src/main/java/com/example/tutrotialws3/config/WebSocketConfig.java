package com.example.tutrotialws3.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    //    регистрируем конечную точку
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").withSockJS();
    }

    //    настройка брокера сообщений
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
//        Настраиваем конечный префикс, когда сюда что-то придет, то отправится обрабатываться на конкретный контроллер
        registry.setApplicationDestinationPrefixes("/app");
//        Регистрируем пункты назначений
        registry.enableSimpleBroker("/topic");
    }
}
