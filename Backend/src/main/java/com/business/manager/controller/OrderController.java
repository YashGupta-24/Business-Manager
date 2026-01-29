package com.business.manager.controller;

import com.business.manager.model.Order;
import com.business.manager.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.business.manager.service.PdfService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PdfService pdfService;

    @GetMapping("/{id}/pdf")
    public ResponseEntity<InputStreamResource> generatePdf(@PathVariable String id) {
        // Fetch order (Assuming you have a method to get by ID, reuse repo)
        Order order = orderService.getOrderById(id); // NOTE: You might need to add this getter in OrderService

        ByteArrayInputStream bis = pdfService.generateInvoice(order);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=invoice_" + order.getReadableOrderId() + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @PostMapping("/create")
    public Order createOrder(@RequestBody Order order) {
        return orderService.createDraft(order);
    }

    @PostMapping("/{id}/finalize")
    public Order finalizeOrder(@PathVariable String id) {
        return orderService.finalizeOrder(id);
    }
}