import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractTextFromFile } from "@/lib/file-extract";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const sessionId = formData.get("sessionId") as string;
        const file = formData.get("file") as File;

        if (!sessionId || !file) {
            return NextResponse.json({ error: "Missing sessionId or file" }, { status: 400 });
        }

        console.log(`📁 [UPLOAD] File received: "${file.name}" (${file.type}, ${file.size} bytes)`);

        // Verify session belongs to user
        const briefSession = await db.briefSession.findFirst({
            where: { id: sessionId, userId: session.user.id },
        });
        if (!briefSession) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Read file buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log(`📁 [UPLOAD] Buffer created: ${buffer.length} bytes`);

        // Save file to disk
        const uploadsDir = join(process.cwd(), "uploads", sessionId);
        await mkdir(uploadsDir, { recursive: true });

        const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const filePath = join(uploadsDir, safeName);
        await writeFile(filePath, buffer);
        console.log(`📁 [UPLOAD] File saved to: ${filePath}`);

        // Extract text
        console.log(`📄 [EXTRACT] Starting text extraction for "${file.name}" (${file.type})...`);
        const extractedText = await extractTextFromFile(buffer, file.type, file.name);

        if (extractedText) {
            console.log(`✅ [EXTRACT] Success: "${file.name}" → ${extractedText.length} chars extracted`);
            console.log(`✅ [EXTRACT] Preview (first 300 chars): ${extractedText.substring(0, 300)}`);
        } else {
            console.log(`⚠️ [EXTRACT] No text extracted from "${file.name}"`);
        }

        // Save to DB (text stored per file!)
        const briefFile = await db.briefFile.create({
            data: {
                sessionId,
                originalName: file.name,
                mimeType: file.type,
                fileSize: file.size,
                storagePath: filePath,
                extractedText: extractedText || null,
            },
        });
        console.log(`💾 [DB] File record created: ${briefFile.id}, hasText: ${!!extractedText}`);

        return NextResponse.json({
            id: briefFile.id,
            originalName: briefFile.originalName,
            mimeType: briefFile.mimeType,
            fileSize: briefFile.fileSize,
            hasText: !!extractedText,
            extractedTextLength: extractedText?.length || 0,
            textPreview: extractedText ? extractedText.substring(0, 200) + "..." : null,
        });
    } catch (error) {
        console.error("❌ [UPLOAD] Error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
