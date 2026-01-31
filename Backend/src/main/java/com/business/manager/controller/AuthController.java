package com.business.manager.controller;

import com.business.manager.model.Business;
import com.business.manager.service.BusinessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
// @CrossOrigin(origins = "http://localhost:5173") // Optional: depending on global CORS config
public class AuthController {

    @Autowired
    private BusinessService businessService;

    // 1. Register a new Business
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Business business) {
        try {
            businessService.registerBusiness(business);
            return ResponseEntity.ok(Map.of("message", "Business registered successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 2. Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Business business) {
        try {
            // Validate credentials via Service
            Business dbBusiness = businessService.authenticate(business.getBusinessName(), business.getPassword());

            // Return critical info for the Frontend to store in LocalStorage
            return ResponseEntity.ok(Map.of(
                    "message", "Login Success",
                    "businessName", dbBusiness.getBusinessName(),
                    "businessId", dbBusiness.getId(),        // 👈 Used for X-Business-Id header
                    "address", dbBusiness.getAddress() != null ? dbBusiness.getAddress() : ""
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }
}