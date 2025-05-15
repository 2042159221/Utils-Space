// app/api/compress-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper function to ensure a directory exists
async function ensureDir(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch (e) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Define a temporary directory for uploads and compressed files
// IMPORTANT: In a real production environment, use a more robust solution for temp files
// and ensure proper cleanup. For local development, `os.tmpdir()` or a project-local dir is fine.
const TEMP_DIR = path.join(process.cwd(), '.tmp_uploads');

export async function POST(request: NextRequest) {
  console.log('Received request to /api/compress-pdf');
  await ensureDir(TEMP_DIR); // Ensure temp directory exists

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file type. Only PDF is allowed.' }, { status: 400 });
    }

    console.log(`Received file: ${file.name}, size: ${file.size}`);

    // 1. Save the uploaded file temporarily
    const inputFileName = `input-${Date.now()}-${file.name}`;
    const inputFilePath = path.join(TEMP_DIR, inputFileName);
    const outputFileName = `output-${Date.now()}-${file.name}`;
    const outputFilePath = path.join(TEMP_DIR, outputFileName);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputFilePath, fileBuffer);
    console.log(`File saved to ${inputFilePath}`);

    // 2. Call Ghostscript to compress the PDF
    //    Adjust Ghostscript command and options as needed.
    //    Ensure Ghostscript (gs) is installed and in your system's PATH.
    //    Example: '-dPDFSETTINGS=/ebook' is a good balance.
    //             '/screen' for smaller size, '/prepress' for higher quality.
    const gsCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputFilePath}" "${inputFilePath}"`;

    console.log(`Executing Ghostscript: ${gsCommand}`);
    try {
      const { stdout, stderr } = await execAsync(gsCommand);
      if (stderr) {
        console.error('Ghostscript stderr:', stderr);
        // Depending on Ghostscript's behavior, stderr might not always indicate a fatal error.
        // You might need to check if outputFilePath was created.
      }
      console.log('Ghostscript stdout:', stdout);

      // Check if the output file was created and has size
      try {
        const stats = await fs.stat(outputFilePath);
        if (stats.size === 0) {
          throw new Error('Ghostscript produced an empty file.');
        }
      } catch (statError) {
        console.error('Error checking output file stats or file not created:', statError);
        throw new Error('Ghostscript failed to produce an output file.');
      }
      

    } catch (gsError) {
      console.error('Error executing Ghostscript:', gsError);
      // Clean up input file on Ghostscript error
      await fs.unlink(inputFilePath).catch(e => console.error("Failed to delete temp input file on gs error", e));
      return NextResponse.json({ error: 'Failed to compress PDF using Ghostscript.', details: gsError instanceof Error ? gsError.message : String(gsError) }, { status: 500 });
    }
    
    console.log(`PDF compressed successfully: ${outputFilePath}`);

    // 3. Read the compressed file and return it
    const compressedFileBuffer = await fs.readFile(outputFilePath);

    // 4. Clean up temporary files
    await fs.unlink(inputFilePath).catch(e => console.error("Failed to delete temp input file", e));
    await fs.unlink(outputFilePath).catch(e => console.error("Failed to delete temp output file", e));
    console.log('Temporary files cleaned up.');

    // Return the compressed file
    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="compressed-${file.name}"`);

    return new NextResponse(compressedFileBuffer, { status: 200, headers });

  } catch (error) {
    console.error('Error in /api/compress-pdf:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}