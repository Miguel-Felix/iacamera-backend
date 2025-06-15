const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

app.post("/processar", async (req, res) => {
  const { pergunta, imagem } = req.body;

  if (!pergunta || !imagem) {
    return res.status(400).json({ erro: "Pergunta e imagem obrigatórias." });
  }

  try {
    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "Você é um assistente visual especializado em identificar objetos e responder perguntas sobre imagens, sempre com respostas em português claras e objetivas.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: pergunta },
                { type: "image_url", image_url: { url: imagem } },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      }
    );

    const json = await openaiRes.json();
    const resposta =
      json?.choices?.[0]?.message?.content || "Não consegui entender.";

    res.json({ resposta });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao consultar a IA." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor online na porta ${PORT}`));
