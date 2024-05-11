package com.example.tutrotialws3.dto;

import lombok.Data;

import java.awt.*;

@Data
public class ChatMessage {
    private String content;
    private String sender;
    private MessageType type;
}
