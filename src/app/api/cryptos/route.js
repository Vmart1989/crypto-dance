export async function GET() {
    try {
      const res = await fetch("https://api.coincap.io/v2/assets?limit=100", {
        headers: {
          "Authorization": `Bearer ${process.env.COINCAP_API_KEY}` // if the API uses Bearer tokens
          
        },
      });
      const data = await res.json();
  
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Error fetching crypto data" }),
        { status: 500 }
      );
    }
  }