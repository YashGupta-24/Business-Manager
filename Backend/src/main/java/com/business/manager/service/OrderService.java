package com.business.manager.service;

import com.business.manager.model.Item;
import com.business.manager.model.Order;
import com.business.manager.model.OrderItem;
import com.business.manager.repository.ItemRepository;
import com.business.manager.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ItemRepository itemRepository;

    // Create Draft Order
    public Order createOrder(Order order, String businessId) {
        // Set basic details
        order.setBusinessId(businessId);
        order.setCreatedAt(LocalDateTime.now());

        // Generate a readable ID (e.g., first 8 chars of UUID for simplicity)
        if (order.getReadableOrderId() == null) {
            order.setReadableOrderId(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        return orderRepository.save(order);
    }

    // Finalize Order: Deduct Stock
    @Transactional // Ensures if one item fails, the whole order fails (Consistency)
    public void finalizeOrder(String orderId) {
        Order order = getOrderById(orderId);

        for (OrderItem orderItem : order.getItems()) {
            // Logic: Packet items deplete the BULK source they are linked to
            String sourceId = orderItem.getSourceId();
            Double weightPerPacket = orderItem.getWeightMultiplier();
            Double qtySold = orderItem.getQty();

            if (sourceId != null && !sourceId.isEmpty()) {
                // Find the Bulk Item (Source)
                Item bulkItem = itemRepository.findById(sourceId)
                        .orElseThrow(() -> new RuntimeException("Source Bulk Item not found for: " + orderItem.getName()));

                // Calculate total weight to deduct (e.g., 5 packets * 1kg = 5kg)
                double totalDeduction = qtySold * weightPerPacket;

                if (bulkItem.getStockQuantity() < totalDeduction) {
                    throw new RuntimeException("Insufficient Bulk Stock for: " + bulkItem.getName());
                }

                // Update & Save
                bulkItem.setStockQuantity(bulkItem.getStockQuantity() - totalDeduction);
                itemRepository.save(bulkItem);
            }
        }
    }

    // Helper: Get Single Order (Used for PDF generation & Finalization)
    public Order getOrderById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));
    }

    // Get All Orders for Dashboard (Optional)
    public List<Order> getAllOrders(String businessId) {
        return orderRepository.findByBusinessId(businessId);
    }
}