package com.sms.Student_Management.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sms.Student_Management.entity.Message;
import com.sms.Student_Management.service.MessageService;

@RestController
@RequestMapping("/messages")
public class MessageController {

    private static final Logger log = LoggerFactory.getLogger(MessageController.class);
    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/send/{studentId}")
    public Message sendMessage(
            @PathVariable Long studentId,
            @RequestBody Message message) {
        log.info("Request to send message to student ID: {}", studentId);
        return messageService.sendMessageToStudent(studentId, message);
    }

    @PostMapping("/send")
    public List<Message> sendMessageToStudents(
            @RequestParam List<Long> studentIds,
            @RequestBody Message message) {
        return messageService.sendMessageToStudents(studentIds, message);
    }

    @GetMapping("/my-messages")
    public List<Message> getMyMessages() {
        log.info("Request to get messages for current student");
        return messageService.getMyMessages();
    }

    @GetMapping("/teacher/sent")
    public List<Message> getMessagesSentByTeacher() {
        log.info("Request to get messages sent by current teacher");
        return messageService.getMessagesSentByTeacher();
    }

    @PutMapping("/{messageId}/read")
    public Message markAsRead(@PathVariable Long messageId) {
        log.info("Request to mark message ID: {} as read", messageId);
        return messageService.markAsRead(messageId);
    }
}
