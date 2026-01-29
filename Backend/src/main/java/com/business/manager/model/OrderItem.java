package com.business.manager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    private String itemId;      // ID of the Packet (e.g., "Rice 1kg")
    private String name;        // Snapshot of the name
    private Double qty;         // How many packets?
    private Double price;       // Price at the time of sale

    // Crucial for calculations
    private String sourceId;    // The Bulk Item ID
    private Double weightMultiplier; // e.g., 1.0 or 0.5
}