package com.podocare.PodoCareWebsite.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.CMYKColor;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.podocare.PodoCareWebsite.DTO.EmployeeDTO;
import com.podocare.PodoCareWebsite.DTO.ProductDTO;
import com.podocare.PodoCareWebsite.DTO.request.ProductFilterDTO;
import com.podocare.PodoCareWebsite.config.security.services.UserDetailsImpl;
import com.podocare.PodoCareWebsite.service.ProductPdfService;
import com.podocare.PodoCareWebsite.service.ProductService;
import com.podocare.PodoCareWebsite.utils.SessionUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductPdfServiceImpl implements ProductPdfService {

    private final ProductService productService;

    private static final Font TITLE_FONT;
    private static final Font CATEGORY_FONT;
    private static final Font HEADER_FONT;
    private static final Font CELL_FONT_BOLD;
    private static final Font CELL_FONT_NORMAL;
    private static final Font CELL_FONT_ITALIC;
    private static final Font GENERATED_BY_FONT;

    private static final CMYKColor HEADER_BG_COLOR = new CMYKColor(0,0,0,30);

    static {
        try {
            BaseFont arialBase = BaseFont.createFont(
                    new ClassPathResource("fonts/arial.ttf").getURL().toString(),
                    BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            BaseFont arialBoldBase = BaseFont.createFont(
                    new ClassPathResource("fonts/arialbd.ttf").getURL().toString(),
                    BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            BaseFont arialItalicBase = BaseFont.createFont(
                    new ClassPathResource("fonts/ariali.ttf").getURL().toString(),
                    BaseFont.IDENTITY_H, BaseFont.EMBEDDED);

            TITLE_FONT = new Font(arialBoldBase, 14);
            CATEGORY_FONT = new Font(arialBoldBase, 12);
            HEADER_FONT = new Font(arialBoldBase, 9);
            CELL_FONT_BOLD = new Font(arialBoldBase, 8);
            CELL_FONT_NORMAL = new Font(arialBase, 8);
            CELL_FONT_ITALIC = new Font(arialItalicBase, 7);
            GENERATED_BY_FONT = new Font(arialItalicBase, 8);
        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Failed to load fonts from classpath", e);
        }
    }

    @Override
    public byte[] generateInventoryReport(ProductFilterDTO filter) {

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4);

        try {
            PdfWriter writer = PdfWriter.getInstance(document, outputStream);

            String currentDate = LocalDate.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy"));
            String footerText = "Wygenerowane dnia: " + currentDate + ", autor: " + getEmployeeName();
            writer.setPageEvent(new FooterPageEvent(footerText));

            document.open();
            addTitle(document, currentDate);

            List<ProductDTO> products = productService.getProducts(filter);

            Map<String, List<ProductDTO>> productsByCategory = products.stream()
                    .collect(Collectors.groupingBy(p -> p.getCategory().getName()));

            Comparator<ProductDTO> byBrandThenName = Comparator
                    .comparing((ProductDTO p) -> p.getBrand() != null ? p.getBrand().getName() : "", String.CASE_INSENSITIVE_ORDER)
                    .thenComparing(ProductDTO::getName, String.CASE_INSENSITIVE_ORDER);
            productsByCategory.values().forEach(list -> list.sort(byBrandThenName));

            for (Map.Entry<String, List<ProductDTO>> entry : productsByCategory.entrySet()) {
                addCategorySection(document, entry.getKey(), entry.getValue());
            }

        } catch (DocumentException e) {
            throw new RuntimeException("Error while generating PDF file: " + e.getMessage(), e);
        } finally {
            document.close();
        }

        return outputStream.toByteArray();
    }

    private void addTitle(Document document, String currentDate) throws DocumentException {
        Paragraph title = new Paragraph("Stan magazynowy " + currentDate, TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
    }

    private void addCategorySection(Document document, String categoryName, List<ProductDTO> products) throws DocumentException {

        Paragraph categoryHeader = new Paragraph(categoryName, CATEGORY_FONT);
        document.add(categoryHeader);

        PdfPTable table = new PdfPTable(4);

        table.setWidthPercentage(100);

        table.setWidths(new float[]{5f, 3f, 0.75f, 2f});
        table.setSpacingBefore(7.5f);
        addTableHeader(table);

        int rowNumber = 1;
        for (ProductDTO product : products) {
            addProductRow(table, product, rowNumber++);
        }


        document.add(table);
    }

    private void addTableHeader(PdfPTable table) {
        String[] headers = {"Nazwa produktu", "Marka", "Stan", "Uwagi"};

        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, HEADER_FONT));
            cell.setBackgroundColor(HEADER_BG_COLOR);
            cell.setHorizontalAlignment(header.equals(headers[0]) ? Element.ALIGN_LEFT : Element.ALIGN_CENTER);
            cell.setPadding(5f);
            table.addCell(cell);
        }
    }

    private void addProductRow(PdfPTable table, ProductDTO product, int rowNumber) {
        String volume = formatVolume(product);
        Phrase namePhrase = new Phrase();
        namePhrase.add(new Chunk(product.getName() + " ".repeat(2), CELL_FONT_NORMAL));
        namePhrase.add(new Chunk(volume, CELL_FONT_ITALIC));
        PdfPCell nameCell = new PdfPCell(namePhrase);
        nameCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        nameCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        nameCell.setPadding(3f);
        table.addCell(nameCell);

        String brandName = product.getBrand() != null ? product.getBrand().getName() : "-";
        table.addCell(createCell(brandName, Element.ALIGN_CENTER));

        String supply = product.getSupply() != null ? product.getSupply().toString() : "0";
        table.addCell(createCell(supply, Element.ALIGN_CENTER));

        String notes = "";
        table.addCell(createCell(notes, Element.ALIGN_CENTER));
    }

    private PdfPCell createCell(String text, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, CELL_FONT_NORMAL));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(2f);
        return cell;
    }

    private String formatVolume(ProductDTO product) {
        if (product.getVolume() == null) {
            return "";
        }

        String unit = product.getUnit() != null ? product.getUnit().name() : "";
        return product.getVolume() + unit.toLowerCase();
    }

    private static class FooterPageEvent extends PdfPageEventHelper {
        private final String footerText;

        public FooterPageEvent(String footerText) {
            this.footerText = footerText;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            Phrase footer = new Phrase(footerText, GENERATED_BY_FONT);
            float x = document.left();
            float y = document.bottom() - 10;
            com.lowagie.text.pdf.ColumnText.showTextAligned(cb, Element.ALIGN_LEFT, footer, x, y, 0);
        }
    }

    private String getEmployeeName() {
        UserDetailsImpl userDetails = SessionUtils.getUserDetailsFromSession();
        if (userDetails != null && userDetails.getEmployee() != null) {
            EmployeeDTO employee = userDetails.getEmployee();
            return employee.getName();
        }
        return "Unknown";
    }
}
