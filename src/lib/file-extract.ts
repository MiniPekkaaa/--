/**
 * File text extraction utilities.
 * Extracts plain text from PDF, DOCX, XLSX files.
 */

export async function extractTextFromFile(
    buffer: Buffer,
    mimeType: string,
    fileName: string
): Promise<string> {
    try {
        if (mimeType === "application/pdf") {
            return await extractPDF(buffer);
        }

        if (
            mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            mimeType === "application/msword" ||
            fileName.endsWith(".docx") ||
            fileName.endsWith(".doc")
        ) {
            return await extractDOCX(buffer);
        }

        if (
            mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            mimeType === "application/vnd.ms-excel" ||
            fileName.endsWith(".xlsx") ||
            fileName.endsWith(".xls")
        ) {
            return await extractXLSX(buffer);
        }

        if (mimeType.startsWith("text/")) {
            return buffer.toString("utf-8");
        }

        return `[Файл: ${fileName} — формат не поддерживается для извлечения текста]`;
    } catch (error) {
        console.error(`Error extracting text from ${fileName}:`, error);
        return `[Ошибка извлечения текста из файла: ${fileName}]`;
    }
}

async function extractPDF(buffer: Buffer): Promise<string> {
    // Dynamic import to avoid bundling issues
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text.trim();
}

async function extractDOCX(buffer: Buffer): Promise<string> {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
}

async function extractXLSX(buffer: Buffer): Promise<string> {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const lines: string[] = [];

    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;
        lines.push(`=== Лист: ${sheetName} ===`);
        const csv = XLSX.utils.sheet_to_csv(sheet);
        lines.push(csv);
    }

    return lines.join("\n").trim();
}
