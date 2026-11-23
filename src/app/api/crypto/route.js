export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim().toLowerCase();

    if (!id || !/^[a-z0-9-]+$/.test(id)) {
      return Response.json(
        { error: "A valid crypto asset id is required." },
        { status: 400 }
      );
    }

    if (!process.env.COINCAP_API_KEY) {
      console.error("COINCAP_API_KEY is not configured");
      return Response.json(
        { error: "Market data is temporarily unavailable." },
        { status: 503 }
      );
    }

    const res = await fetch(`https://rest.coincap.io/v3/assets/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.COINCAP_API_KEY}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const body = await res.text();
    let data = null;

    if (body) {
      try {
        data = JSON.parse(body);
      } catch {
        console.error(`CoinCap returned invalid JSON for ${id}`);
      }
    }

    if (!res.ok) {
      console.error(`CoinCap request for ${id} failed with ${res.status}`);
      return Response.json(
        { error: "Unable to load this asset's market data." },
        { status: res.status === 404 ? 404 : 502 }
      );
    }

    if (!data?.data) {
      console.error(`CoinCap returned no market data for ${id}`);
      return Response.json(
        { error: "Market data is temporarily unavailable." },
        { status: 502 }
      );
    }

    return Response.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown market data error";
    console.error("Crypto market data request failed:", message);

    return Response.json(
      { error: "Market data is temporarily unavailable." },
      { status: 502 }
    );
  }
}
