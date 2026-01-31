package com.business.manager.controller;

import com.business.manager.model.Order;
import com.business.manager.service.OrderService;
import com.business.manager.service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PdfService pdfService;

    // 1. Create Draft Order (Stamped with Business ID)
    @PostMapping("/create")
    public Order createOrder(@RequestBody Order order, @RequestHeader("X-Business-Id") String businessId) {
        return orderService.createOrder(order, businessId);
    }

    // 2. Finalize Order (Deduct Stock)
    @PostMapping("/{id}/finalize")
    public ResponseEntity<?> finalizeOrder(@PathVariable String id) {
        try {
            orderService.finalizeOrder(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. Generate PDF Invoice
    @GetMapping("/{id}/pdf")
    public ResponseEntity<InputStreamResource> generatePdf(@PathVariable String id) {
        // Fetch order details
        Order order = orderService.getOrderById(id);

        // Generate PDF using Service
        ByteArrayInputStream bis = pdfService.generateInvoice(order);

        // Prepare Response for Download
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=invoice_" + order.getReadableOrderId() + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}