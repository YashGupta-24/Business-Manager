package com.business.manager.controller;

import com.business.manager.model.Order;
import com.business.manager.service.OrderService;
import com.business.manager.service.PdfService;
import com.business.manager.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.extern.slf4j.Slf4j;
import java.io.ByteArrayInputStream;

@Slf4j
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private JwtUtil jwtUtil;

    // 1. Create Draft Order (Stamped with Business ID)
    @PostMapping("/create")
    public Order createOrder(@RequestBody Order order, @CookieValue("jwt") String token) {
        String businessId = jwtUtil.extractBusinessId(token);
        log.info("Creating draft order for businessId: {}", businessId);
        return orderService.createOrder(order, businessId);
    }

    // 2. Finalize Order (Deduct Stock)
    @PostMapping("/{id}/finalize")
    public ResponseEntity<?> finalizeOrder(@PathVariable String id) {
        log.info("Attempting to finalize order ID: {}", id);
        try {
            orderService.finalizeOrder(id);
            log.debug("Successfully finalized order ID: {}", id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Failed to finalize order ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. Generate PDF Invoice
    @GetMapping("/{id}/pdf")
    public ResponseEntity<InputStreamResource> generatePdf(@PathVariable String id) {
        log.info("Generating PDF invoice for order ID: {}", id);
        // Fetch order details
        Order order = orderService.getOrderById(id);

        // Generate PDF using Service
        ByteArrayInputStream bis = pdfService.generateInvoice(order);

        // Prepare Response for Download
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=invoice_" + order.getReadableOrderId() + ".pdf");
        
        log.debug("Successfully generated PDF invoice for order ID: {}", id);
        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}