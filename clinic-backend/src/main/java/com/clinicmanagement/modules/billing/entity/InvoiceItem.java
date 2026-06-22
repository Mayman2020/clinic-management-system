package com.clinicmanagement.modules.billing.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name = "invoice_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "invoice_id") private Invoice invoice;
    @Column(name = "item_type", nullable = false, length = 50) private String itemType;
    @Column(nullable = false, length = 300) private String description;
    private BigDecimal quantity;
    @Column(name = "unit_price", nullable = false) private BigDecimal unitPrice;
    @Column(name = "total_price", nullable = false) private BigDecimal totalPrice;
    @Column(name = "reference_id") private Long referenceId;
}
