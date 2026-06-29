package com.clinicmanagement.modules.billing.service;

import com.clinicmanagement.modules.billing.dto.InvoiceItemResponse;
import com.clinicmanagement.modules.billing.dto.InvoicePrintData;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service @RequiredArgsConstructor
public class InvoicePdfService {
    private final BillingService billingService;
    private static final Font TITLE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
    private static final Font NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 11);
    private static final Font SMALL = FontFactory.getFont(FontFactory.HELVETICA, 9, java.awt.Color.GRAY);

    public byte[] generate(Long invoiceId) {
        InvoicePrintData inv = billingService.getPrintData(invoiceId);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 48, 48, 48, 48);
            PdfWriter.getInstance(doc, out);
            doc.open();

            Paragraph clinic = new Paragraph(inv.getClinicName() != null ? inv.getClinicName() : "Clinic", TITLE);
            clinic.setAlignment(Element.ALIGN_CENTER);
            doc.add(clinic);

            Paragraph invNo = new Paragraph("Invoice: " + inv.getInvoiceNo(), NORMAL);
            invNo.setSpacingBefore(12);
            doc.add(invNo);
            doc.add(new Paragraph("Patient: " + (inv.getPatientName() != null ? inv.getPatientName() : "—"), NORMAL));
            if (inv.getCreatedAt() != null) {
                doc.add(new Paragraph("Date: " + inv.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE), SMALL));
            }
            doc.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{4, 1, 2, 2});
            addHeader(table, "Description");
            addHeader(table, "Qty");
            addHeader(table, "Unit");
            addHeader(table, "Total");
            if (inv.getItems() != null) {
                for (InvoiceItemResponse item : inv.getItems()) {
                    addCell(table, item.getDescription());
                    addCell(table, fmt(item.getQuantity()));
                    addCell(table, fmt(item.getUnitPrice()));
                    addCell(table, fmt(item.getTotalPrice()));
                }
            }
            doc.add(table);

            Paragraph totals = new Paragraph();
            totals.setSpacingBefore(16);
            totals.setAlignment(Element.ALIGN_RIGHT);
            totals.add(new Chunk("Subtotal: " + fmt(inv.getSubtotal()) + "\n", NORMAL));
            totals.add(new Chunk("Discount: " + fmt(inv.getDiscount()) + "\n", NORMAL));
            totals.add(new Chunk("Tax: " + fmt(inv.getTax()) + "\n", NORMAL));
            totals.add(new Chunk("Total: " + fmt(inv.getTotal()) + "\n", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            totals.add(new Chunk("Paid: " + fmt(inv.getPaidAmount()) + "\n", NORMAL));
            totals.add(new Chunk("Status: " + (inv.getStatus() != null ? inv.getStatus() : "—"), SMALL));
            doc.add(totals);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate invoice PDF", e);
        }
    }

    private static void addHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        cell.setBackgroundColor(new java.awt.Color(240, 240, 240));
        cell.setPadding(6);
        table.addCell(cell);
    }

    private static void addCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, NORMAL));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private static String fmt(BigDecimal v) {
        return v == null ? "0.00" : v.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();
    }
}
