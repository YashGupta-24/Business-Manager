package com.business.manager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "businesses")
public class Business {
    @Id
    private String id; // This IS the businessId

    private String businessName; // Unique (used for login)
    private String password;

    // Extra details for the Bill
    private String address;
    private String gstNumber;
}