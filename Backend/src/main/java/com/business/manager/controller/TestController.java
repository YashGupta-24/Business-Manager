package com.business.manager.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/test")
    public String checkSystem() {
        return "System is Online. Database connection pending check...";
    }
}