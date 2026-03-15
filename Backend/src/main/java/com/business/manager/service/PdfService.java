package com.business.manager.service;

import com.business.manager.model.Order;
import com.business.manager.model.OrderItem;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class PdfService {

    public ByteArrayInputStream generateInvoice(Order order) {
        log.info("Generating PDF Invoice for order: {}", order.getReadableOrderId());
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. HEADER
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph title = new Paragraph(order.getPartyName(), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph("\n")); // Spacer

            Paragraph date = new Paragraph(order.getCreatedAt().toString().split("T")[0]);
            date.setAlignment(Element.ALIGN_CENTER);
            document.add(date);

            document.add(new Paragraph("\n"));

            // 2. ORDER DETAILS
//            document.add(new Paragraph("Order #: " + order.getReadableOrderId()));
//            document.add(new Paragraph("Customer: " + order.getPartyName()));
//            document.add(new Paragraph("Date: " + order.getCreatedAt().toString().split("T")[0]));
//            document.add(new Paragraph("\n"));

            // 3. TABLE
            PdfPTable table = new PdfPTable(4); // 4 Columns
            table.setWidthPercentage(100);
            table.setWidths(new int[]{4, 2, 2, 2}); // Relative widths

            // Table Header
            addHeader(table, "Item Name");
            addHeader(table, "Price");
            addHeader(table, "Qty");
            addHeader(table, "Total");

            // Table Rows
            for (OrderItem item : order.getItems()) {
                table.addCell(item.getName());
                table.addCell("Rs " + item.getPrice());
                table.addCell(String.valueOf(item.getQty()));
                table.addCell("Rs " + (item.getPrice() * item.getQty()));
            }

            document.add(table);

            // 4. TOTAL
            document.add(new Paragraph("\n"));
            Paragraph totalPara = new Paragraph("Grand Total: Rs " + order.getTotalAmount(),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
            totalPara.setAlignment(Element.ALIGN_RIGHT);
            document.add(totalPara);

            document.close();
            log.debug("Successfully generated PDF Invoice byte array for order: {}", order.getReadableOrderId());

        } catch (DocumentException e) {
            log.error("Error generating PDF Invoice for order {}: {}", order.getReadableOrderId(), e.getMessage());
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
        cell.setPadding(5);
        table.addCell(cell);
    }
}