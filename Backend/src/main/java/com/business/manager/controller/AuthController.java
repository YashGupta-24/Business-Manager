package com.business.manager.controller;

import com.business.manager.model.Business;
import com.business.manager.service.BusinessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.business.manager.util.JwtUtil;

import lombok.extern.slf4j.Slf4j;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
// @CrossOrigin(origins = "http://localhost:5173") // Optional: depending on global CORS config
public class AuthController {

    @Autowired
    private BusinessService businessService;

    @Autowired
    private JwtUtil jwtUtil;

    // 1. Register a new Business
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Business business) {
        log.info("Received signup request for business: {}", business.getBusinessName());
        try {
            businessService.registerBusiness(business);
            log.debug("Successfully registered business: {}", business.getBusinessName());
            return ResponseEntity.ok(Map.of("message", "Business registered successfully"));
        } catch (RuntimeException e) {
            log.error("Failed to register business {}: {}", business.getBusinessName(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 2. Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Business business, jakarta.servlet.http.HttpServletResponse response) {
        log.info("Received login request for business: {}", business.getBusinessName());
        try {
            Business dbBusiness = businessService.authenticate(business.getBusinessName(), business.getPassword());

            // 🎫 GENERATE TOKEN
            String token = jwtUtil.generateToken(dbBusiness.getId(), dbBusiness.getBusinessName());
            log.debug("Successfully authenticated business: {}", business.getBusinessName());

            // 🍪 SET JWT AS HTTP-ONLY COOKIE
            jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("jwt", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // Set to true if using HTTPS in production
            cookie.setPath("/");
            cookie.setMaxAge(10 * 60 * 60); // 10 Hours
            response.addCookie(cookie);

            return ResponseEntity.ok(Map.of(
                    "message", "Login Success",
                    "businessName", dbBusiness.getBusinessName(),
                    "businessId", dbBusiness.getId(),
                    "address", dbBusiness.getAddress() != null ? dbBusiness.getAddress() : ""
                    // We no longer send "token" in the JSON body for security
            ));
        } catch (RuntimeException e) {
            log.warn("Failed login attempt for business {}: {}", business.getBusinessName(), e.getMessage());
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    // 3. Logout (Clear Cookie)
    @PostMapping("/logout")
    public ResponseEntity<?> logout(jakarta.servlet.http.HttpServletResponse response) {
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0); // This deletes the cookie
        response.addCookie(cookie);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}