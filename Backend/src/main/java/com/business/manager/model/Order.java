package com.business.manager.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String readableOrderId; // e.g., 1001, 1002 (easier for humans)
    private String partyName;
    private String status; // "DRAFT", "FINALIZED", "DELIVERED"

    private List<OrderItem> items;
    private Double totalAmount;

    private LocalDateTime createdAt;

    private String businessId;
}