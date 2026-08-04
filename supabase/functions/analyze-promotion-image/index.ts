// Lê a foto de um produto/etiqueta de preço antes da publicação (Ofertaki).
// Bloqueia imagens que não mostrem claramente um produto ou cartaz de
// promoção, e extrai título/preço quando reconhece. Chamada só por
// usuários logados (verify_jwt fica ligado por padrão nesta função).

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_MODEL = 'gemini-2.5-flash';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROMPT_TEXT =
  'Esta foto foi tirada para publicar uma promoção num app comunitário de ofertas de supermercado (Ofertaki). ' +
  'Analise se ela mostra claramente um produto de supermercado e/ou uma etiqueta/cartaz de preço legível, e ' +
  'extraia os dados possíveis. Responda só com o JSON pedido pelo schema.';

const ANALYSIS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    valid: {
      type: 'BOOLEAN',
      description:
        'true somente se a imagem mostra claramente um produto de supermercado e/ou uma etiqueta/cartaz de preço legível. false para qualquer outra coisa (paredes, pessoas, telas, fotos aleatórias, imagens borradas demais para identificar um produto).',
    },
    reason: {
      type: 'STRING',
      description:
        'Motivo curto em português, só quando valid=false (ex: "a foto não mostra um produto ou etiqueta de preço").',
    },
    confidence: {
      type: 'NUMBER',
      description: 'Confiança de 0 a 100 na análise acima.',
    },
    title: {
      type: 'STRING',
      description: 'Nome do produto identificado (ex: "Arroz Tio João 5kg"), só quando valid=true e o nome estiver legível.',
    },
    price: {
      type: 'NUMBER',
      description: 'Preço promocional/atual em reais (só o número, ex: 14.70), só quando valid=true e estiver legível.',
    },
    originalPrice: {
      type: 'NUMBER',
      description: 'Preço original riscado/"de R$" em reais, só quando visível na etiqueta.',
    },
  },
  required: ['valid', 'confidence'],
};

type AnalysisResult = {
  valid: boolean;
  confidence: number;
  reason?: string;
  title?: string;
  price?: number;
  originalPrice?: number;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY não configurada.' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(JSON.stringify({ error: 'imageBase64 é obrigatório.' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: typeof mimeType === 'string' ? mimeType : 'image/jpeg',
                    data: imageBase64,
                  },
                },
                { text: PROMPT_TEXT },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: ANALYSIS_SCHEMA,
          },
        }),
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error('Gemini API error', response.status, detail);
      return new Response(JSON.stringify({ error: 'Falha ao analisar a imagem.' }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('Gemini API: sem texto na resposta', JSON.stringify(payload));
      return new Response(JSON.stringify({ error: 'Resposta inesperada da IA.' }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    let result: AnalysisResult;
    try {
      result = JSON.parse(text);
    } catch {
      console.error('Gemini API: JSON inválido', text);
      return new Response(JSON.stringify({ error: 'Resposta inesperada da IA.' }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('analyze-promotion-image error', err);
    return new Response(JSON.stringify({ error: 'Erro inesperado ao analisar a imagem.' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
