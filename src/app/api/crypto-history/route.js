export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const interval = searchParams.get('interval');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
  
    const url = `https://rest.coincap.io/v3/assets/${id}/history?interval=${interval}${start ? `&start=${start}` : ''}${end ? `&end=${end}` : ''}`;
  
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.COINCAP_API_KEY}`,
      },
    });
  
    const data = await res.json();
    return Response.json(data);
  }
  