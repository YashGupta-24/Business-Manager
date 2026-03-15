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
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ItemRepository itemRepository;

    // Create Draft Order
    public Order createOrder(Order order, String businessId) {
        log.info("Creating draft order for businessId: {}", businessId);
        // Set basic details
        order.setBusinessId(businessId);
        order.setCreatedAt(LocalDateTime.now());

        // Generate a readable ID (e.g., first 8 chars of UUID for simplicity)
        if (order.getReadableOrderId() == null) {
            order.setReadableOrderId(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        Order savedOrder = orderRepository.save(order);
        log.debug("Created draft order with readable ID: {}", savedOrder.getReadableOrderId());
        return savedOrder;
    }

    // Finalize Order: Deduct Stock
    @Transactional // Ensures if one item fails, the whole order fails (Consistency)
    public void finalizeOrder(String orderId) {
        log.info("Finalizing order ID: {}", orderId);
        Order order = getOrderById(orderId);

        for (OrderItem orderItem : order.getItems()) {
            // Logic: Packet items deplete the BULK source they are linked to
            String sourceId = orderItem.getSourceId();
            Double weightPerPacket = orderItem.getWeightMultiplier();
            Double qtySold = orderItem.getQty();

            if (sourceId != null && !sourceId.isEmpty()) {
                // Find the Bulk Item (Source)
                Item bulkItem = itemRepository.findById(sourceId)
                        .orElseThrow(() -> {
                            log.error("Finalization failed: Source Bulk Item ID {} not found for {}", sourceId, orderItem.getName());
                            return new RuntimeException("Source Bulk Item not found for: " + orderItem.getName());
                        });

                // Calculate total weight to deduct (e.g., 5 packets * 1kg = 5kg)
                double totalDeduction = qtySold * weightPerPacket;

                if (bulkItem.getStockQuantity() < totalDeduction) {
                    log.error("Finalization failed: Insufficient stock for {}. Required: {}, Available: {}", bulkItem.getName(), totalDeduction, bulkItem.getStockQuantity());
                    throw new RuntimeException("Insufficient Bulk Stock for: " + bulkItem.getName());
                }

                // Update & Save
                bulkItem.setStockQuantity(bulkItem.getStockQuantity() - totalDeduction);
                itemRepository.save(bulkItem);
                log.debug("Deducted {} units from bulk item '{}' (ID: {})", totalDeduction, bulkItem.getName(), bulkItem.getId());
            }
        }
        log.info("Successfully finalized order ID: {}", orderId);
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