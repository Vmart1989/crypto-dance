// app/api/crypto/route.js
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
  
    const res = await fetch(`https://rest.coincap.io/v3/assets/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.COINCAP_API_KEY}`,
      },
    });
  
    const data = await res.json();
    return Response.json(data);
  }
  