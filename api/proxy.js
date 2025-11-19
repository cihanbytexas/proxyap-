export default async function handler(req, res) {
  try {
    const target = req.query.url;

    if (!target) {
      return res.status(400).json({ error: "url parametresi gerekli" });
    }

    // Body’yi oku (GET dışındaki methodlarda)
    let body = undefined;
    if (req.method !== "GET") {
      body = await req.text();
    }

    // Hedef API'ye istek gönder
    const response = await fetch(target, {
      method: req.method,     // GET, POST, PUT hepsini destekler
      headers: {
        ...req.headers,
        host: undefined,      // Host header'ı sil, yoksa bazı API'ler hata verir
      },
      body: body,             // POST/PUT body’sini iletir
    });

    // Cevabı al
    const contentType = response.headers.get("content-type") || "";

    // JSON ise JSON döndür
    if (contentType.includes("application/json")) {
      const json = await response.json();
      return res.status(response.status).json(json);
    }

    // Diğer türler (text / html / xml)
    const text = await response.text();
    res.status(response.status).send(text);

  } catch (err) {
    res.status(500).json({
      error: "Proxy hata verdi",
      detail: err.message
    });
  }
}
