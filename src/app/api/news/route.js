// app/api/news/route.js
export const runtime = "nodejs"; // Ensures we can read env variables on the server

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.NEWSDATA_API_KEY; // from .env.local
    if (!apiKey) {
      return NextResponse.json(
        { error: "No API key found" },
        { status: 500 }
      );
    }

    // Example query: Searching for "crypto", English articles, category "business" or "technology", etc.
    // Check https://newsdata.io/docs for more query parameters
    const url = new URL("https://newsdata.io/api/1/news");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("q", "crypto");
    url.searchParams.set("language", "en");
    url.searchParams.set("image", "1");
    // Additional optional filters:
    // url.searchParams.set("category", "business,technology");
    url.searchParams.set("country", "us");

    const res = await fetch(url.toString());
    const json = await res.json();

    // Just return the entire response; we'll pick top 3 on the client
    return NextResponse.json(json);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
