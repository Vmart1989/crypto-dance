// app/api/currency/route.js
export async function GET(req) {
    // Get the target currency from query parameters; default to EUR if not provided.
    const { searchParams } = new URL(req.url);
    const targetCurrency = searchParams.get("target") || "EUR";
  
    try {
      const response = await fetch(
        `https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.FREECURRENCYAPI_KEY}&currencies=${targetCurrency}&base_currency=USD`
      );
      const data = await response.json();
  
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching conversion rate:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch conversion rate" }),
        { status: 500 }
      );
    }
  }
  