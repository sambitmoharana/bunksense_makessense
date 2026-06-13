// Vercel Serverless Function for AI Academic Advisor
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleAdvisorRequest } from "./advisor-handler.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for security and browser accessibility
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Parse req.body. In Vercel, it is pre-parsed.
    const body = req.body;
    if (!body || typeof body !== "object") {
      return res.status(400).json({ error: "Missing or invalid request body." });
    }

    const result = await handleAdvisorRequest(body, apiKey);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("AI Advisor Server Error:", error);
    return res.status(500).json({
      error: "An internal server error occurred while processing your request.",
      details: error.message,
    });
  }
}
