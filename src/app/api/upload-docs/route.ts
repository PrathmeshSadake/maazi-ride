import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

// Maximum file size (8 MB)
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

// export const config = {
//   api: {
//     bodyParser: false,
//     responseLimit: "10mb",
//   },
// };

export async function POST(request: NextRequest) {
  try {
    // Ensure we have the required Vercel Blob token
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      console.error("Missing BLOB_READ_WRITE_TOKEN environment variable");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 8MB limit" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if it's an image or PDF
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be an image or PDF" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const timestamp = Date.now();
    const filename = `documents/${timestamp}-${file.name.replace(/\s+/g, "-")}`;

    try {
      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
      });

      console.log("blob", blob.url);

      return NextResponse.json(
        { url: blob.url },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (blobError) {
      console.error("Vercel Blob upload error:", blobError);
      return NextResponse.json(
        { error: "Failed to upload to storage service" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error processing upload request:", error);
    return NextResponse.json(
      { error: "Failed to process upload request" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
