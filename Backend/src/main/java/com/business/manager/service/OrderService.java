package com.business.manager.service;

import com.business.manager.model.Order;
import com.business.manager.model.OrderItem;
import com.business.manager.model.Item;
import com.business.manager.repository.OrderRepository;
import com.business.manager.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ItemRepository itemRepository;

    // 1. Create a Draft Order (No stock deduction yet)
    public Order createDraft(Order order) {
        order.setStatus("DRAFT");
        order.setCreatedAt(LocalDateTime.now());

        // Simple auto-increment logic for ID
        Order lastOrder = orderRepository.findTopByOrderByReadableOrderIdDesc();
        order.setReadableOrderId(lastOrder != null ? lastOrder.getReadableOrderId() + 1 : 1001L);

        return orderRepository.save(order);
    }

    public Order getOrderById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));
    }

    // 2. FINALIZE ORDER - The "Pack-to-Order" Logic
    @Transactional // Ensures if one item fails, the whole thing rolls back
    public Order finalizeOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"DRAFT".equals(order.getStatus())) {
            throw new RuntimeException("Order is already finalized!");
        }

        // Loop through every item in the order
        for (OrderItem orderItem : order.getItems()) {

            // Check if this item uses raw material (Bulk)
            if (orderItem.getSourceId() != null) {
                Item bulkItem = itemRepository.findById(orderItem.getSourceId())
                        .orElseThrow(() -> new RuntimeException("Bulk Item not found for: " + orderItem.getName()));

                // CALCULATE: Qty * Multiplier (e.g., 10 packets * 0.5kg = 5kg needed)
                double requiredBulk = orderItem.getQty() * orderItem.getWeightMultiplier();

                if (bulkItem.getStockQuantity() < requiredBulk) {
                    throw new RuntimeException("Not enough stock for " + bulkItem.getName() + "! Needed: " + requiredBulk + "kg");
                }

                // DEDUCT STOCK
                bulkItem.setStockQuantity(bulkItem.getStockQuantity() - requiredBulk);
                itemRepository.save(bulkItem);
            }
        }

        order.setStatus("FINALIZED");
        return orderRepository.save(order);
    }
}