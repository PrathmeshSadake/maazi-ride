import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if the Blob token is configured
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobToken) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "BLOB_READ_WRITE_TOKEN is not configured in environment variables",
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Vercel Blob token is configured properly",
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error testing Blob configuration:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Error testing Blob configuration",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
