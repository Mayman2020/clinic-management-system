package com.clinicmanagement.modules.prescription.service;

import com.clinicmanagement.modules.prescription.dto.PrescriptionItemResponse;
import com.clinicmanagement.modules.prescription.dto.PrescriptionPrintData;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service @RequiredArgsConstructor
public class PrescriptionPdfService {
    private final PrescriptionService prescriptionService;
    private static final Font TITLE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
    private static final Font NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 11);
    private static final Font SMALL = FontFactory.getFont(FontFactory.HELVETICA, 9, java.awt.Color.GRAY);
    private static final Font BOLD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);

    public byte[] generate(Long prescriptionId) {
        PrescriptionPrintData rx = prescriptionService.getPrintData(prescriptionId);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 48, 48, 48, 48);
            PdfWriter.getInstance(doc, out);
            doc.open();

            Paragraph clinic = new Paragraph(rx.getClinicName() != null ? rx.getClinicName() : "Clinic", TITLE);
            clinic.setAlignment(Element.ALIGN_CENTER);
            doc.add(clinic);
            Paragraph subtitle = new Paragraph("Prescription", SMALL);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            doc.add(subtitle);

            doc.add(Chunk.NEWLINE);
            doc.add(new Paragraph("Rx No: " + (rx.getPrescriptionNo() != null ? rx.getPrescriptionNo() : "—"), BOLD));
            doc.add(new Paragraph("Patient: " + (rx.getPatientName() != null ? rx.getPatientName() : "—"), NORMAL));
            doc.add(new Paragraph("Doctor: Dr. " + (rx.getDoctorName() != null ? rx.getDoctorName() : "—"), NORMAL));
            if (rx.getIssuedAt() != null) {
                doc.add(new Paragraph("Date: " + rx.getIssuedAt().format(DateTimeFormatter.ISO_LOCAL_DATE), SMALL));
            }
            doc.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3, 2, 2, 2});
            addHeader(table, "Medicine");
            addHeader(table, "Dosage");
            addHeader(table, "Frequency");
            addHeader(table, "Duration");
            if (rx.getItems() != null) {
                for (PrescriptionItemResponse item : rx.getItems()) {
                    addCell(table, item.getMedicineName());
                    addCell(table, item.getDosage());
                    addCell(table, item.getFrequency());
                    addCell(table, item.getDuration());
                }
            }
            doc.add(table);

            if (rx.getNotes() != null && !rx.getNotes().isBlank()) {
                Paragraph notes = new Paragraph("Notes: " + rx.getNotes(), NORMAL);
                notes.setSpacingBefore(16);
                doc.add(notes);
            }

            Paragraph sig = new Paragraph("\n\n_________________________\nDoctor Signature", SMALL);
            sig.setAlignment(Element.ALIGN_RIGHT);
            sig.setSpacingBefore(32);
            doc.add(sig);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate prescription PDF", e);
        }
    }

    private static void addHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        cell.setBackgroundColor(new java.awt.Color(240, 240, 240));
        cell.setPadding(6);
        table.addCell(cell);
    }

    private static void addCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "—", NORMAL));
        cell.setPadding(5);
        table.addCell(cell);
    }
}
