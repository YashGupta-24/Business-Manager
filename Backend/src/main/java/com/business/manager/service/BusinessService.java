package com.business.manager.service;

import com.business.manager.model.Business;
import com.business.manager.repository.BusinessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class BusinessService {

    @Autowired
    private BusinessRepository businessRepository;

    // Register a new Business
    public Business registerBusiness(Business business) {
        // Check if Business Name is unique
        if (businessRepository.findByBusinessName(business.getBusinessName()).isPresent()) {
            throw new RuntimeException("Business Name already exists! Please choose another.");
        }
        // In a real app, hash the password here (e.g., BCrypt)
        return businessRepository.save(business);
    }

    // Login Logic
    public Business authenticate(String businessName, String password) {
        Business business = businessRepository.findByBusinessName(businessName)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        if (!business.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }

        return business;
    }
}