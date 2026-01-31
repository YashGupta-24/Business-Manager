package com.business.manager.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // Generates Getters, Setters, toString
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "items")
public class Item {

    @Id
    private String id;

    private String name; // e.g., "Basmati Rice (Bulk)" OR "Rice Premium (1kg)"

    private ItemType type; // BULK or PACKET

    // --- FOR BULK ITEMS (The Raw Material) ---
    private Double stockQuantity; // In Kg. Example: 50.0
    private Double lowStockThreshold; // Alert if below this. Example: 10.0

    // --- FOR PACKET ITEMS (The Product you sell) ---
    private Double price; // Selling Price. Example: 90.00

    // The "Link" to the Parent Bulk Item
    private String sourceId; // The ID of the Bulk Item this packet is made from

    // How much Bulk does this packet use?
    // Example: 1.0 for 1kg packet, 0.5 for 500g packet
    private Double weightMultiplier;

    private String businessId;
}