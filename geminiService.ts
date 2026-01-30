
import { GoogleGenAI } from "@google/genai";
import { MunicipalityData } from "./types";

const getClient = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    console.warn("API Key do Gemini não encontrada.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getMunicipalityInsight = async (municipality: MunicipalityData): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Chave de API não configurada. Configure a variável de ambiente API_KEY na Vercel.";

  const prompt = `
    Como consultor sênior de gestão fazendária, analise para o Prefeito de ${municipality.name}:
    - Histórico IVA: 2022(${municipality.iva2022}), 2023(${municipality.iva2023}), 2024(${municipality.iva2024})
    - Variação Recente: ${municipality.variacaoDefinito2024}%
    - Projeção de Repasse 2025/26: R$ ${municipality.projecaoRepasse.toLocaleString('pt-BR')}
    - Incremento no IPM: ${municipality.incrementoIpm.toFixed(4)}

    Crie um "Ponto de Atenção Estratégico" para o Prefeito.
    Analise o cenário e destaque oportunidades de melhoria na arrecadação ou riscos fiscais.
    Seja executivo e diplomático. Máximo 3 frases (aprox. 40 palavras). Sem introduções genéricas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Análise estratégica indisponível.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao processar insights estratégicos.";
  }
};
