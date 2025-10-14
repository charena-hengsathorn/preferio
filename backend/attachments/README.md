# Attachments Directory

This directory stores uploaded attachments for landfill reports.

## Structure

```
attachments/
  ├── P7922/
  │   └── 20251013_120000_invoice.pdf
  ├── P7923/
  │   └── 20251013_130000_receipt.xlsx
  └── ...
```

Each report gets its own subdirectory (e.g., `P7922/`) where uploaded files are stored with timestamped filenames.

## File Naming

Format: `YYYYMMDD_HHMMSS_originalfilename.ext`

Example: `20251013_192239_invoice.pdf`

## Metadata

Attachment metadata (filename, size, uploader, timestamp) is stored in `all_reports.json` under each report's `attachments` array.
