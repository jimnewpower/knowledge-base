# CSV and Excel processing with Apache POI cheat sheet

> Baseline: Java 21, Apache POI 5.4.x, and Apache Commons CSV 1.14.x. Examples target `.xlsx`. Reviewed: 2026-09-24.

Define the interchange schema before choosing a parser: column names, types, units, null representation, encoding, time zone, and rejected-row policy.

Related: [batch imports](batch-processing.md), [Java time](java-time.md), [data transformation](integration-transformation.md), [JavaFX](javafx.md).

## Choose the reader/writer

| Format/API | Good fit | Constraint |
|------------|----------|------------|
| Commons CSV | Delimited text with quoting/escaping | No native type, style, or formula model |
| POI `XSSFWorkbook` | Random access to `.xlsx` workbooks | Retains substantial workbook state in memory |
| POI XSSF SAX/event reader | Large sequential `.xlsx` imports | More explicit handling of cell types/shared strings |
| POI `SXSSFWorkbook` | Large sequential `.xlsx` exports | Flushed rows cannot be freely revisited; temporary disk required |
| POI `HSSFWorkbook` | Legacy `.xls` compatibility | Different format limits; not an `.xlsx` reader |

Do not parse CSV with `split(",")`: quoted fields may contain commas, quotes, and newlines. Specify dialect and charset; handle a BOM deliberately. Distinguish empty fields from absent values according to the contract, not parser defaults.

## Preserve types

- Keep identifiers, postal codes, and integers exceeding Excel's roughly 15 significant decimal digits as text. A numeric cell can lose precision before an importer sees it.
- Excel dates are numeric serials plus formatting and a workbook date system (1900 or 1904). They do not carry a time zone. A date-looking string is a different input type.
- `DataFormatter` helps reproduce display text; it is not a schema validator. Validate the actual cell type and domain value.
- Formula cells contain expressions and may have stale cached results. Choose whether to reject, preserve, or evaluate formulas; do not silently treat the cached value as fresh computation.
- Write untrusted spreadsheet text as a string cell, never as a formula. For CSV intended for spreadsheet opening, use a consumer-specific formula-injection policy; CSV quoting alone does not prevent formula interpretation.

## Small export

Method fragment; requires `poi-ooxml` 5.4.x. Imports `java.nio.file.Files`, `java.nio.file.Path`, `java.io.IOException`, and `org.apache.poi.xssf.usermodel.XSSFWorkbook`. The destination parent must exist; this example replaces an existing file.

```java
static void writeExample(Path destination) throws IOException {
    try (var workbook = new XSSFWorkbook()) {
        var sheet = workbook.createSheet("Observations");
        var header = sheet.createRow(0);
        header.createCell(0).setCellValue("sample_id");
        header.createCell(1).setCellValue("depth_m");
        var row = sheet.createRow(1);
        row.createCell(0).setCellValue("001234567890123456");
        row.createCell(1).setCellValue(42.5);
        try (var output = Files.newOutputStream(destination)) {
            workbook.write(output);
        }
    }
}
```

For production replacement, write to a sibling temporary file, finish/close it, then publish using the filesystem's supported move policy. Readers should not observe a partially written workbook.

## Scale and failure handling

Bound input size, decompression, rows, columns, and error collection. Do not disable POI's ZIP-bomb protections to make an unexplained failure disappear. Streaming reduces row retention, not every source of memory use: styles, merged regions, comments, and shared strings can still grow.

Reuse styles. Close workbooks, streams, and readers; ensure SXSSF temporary files are cleaned up using the lifecycle API for the deployed POI release. Record source row/sheet and reason for rejected records, then reconcile accepted/rejected totals. Test round trips with leading zeros, Unicode, quoted newlines, blanks, formulas, and both date systems.

## References

- [POI spreadsheet guide](https://poi.apache.org/components/spreadsheet/quick-guide.html)
- [SXSSFWorkbook lifecycle and streaming limits](https://poi.apache.org/apidocs/dev/org/apache/poi/xssf/streaming/SXSSFWorkbook.html)
- [Commons CSV API](https://commons.apache.org/proper/commons-csv/apidocs/index.html)
- [POI DateUtil](https://poi.apache.org/apidocs/dev/org/apache/poi/ss/usermodel/DateUtil.html)
