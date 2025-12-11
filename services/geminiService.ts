import { GoogleGenAI } from "@google/genai";
import { Product, Sale } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (products: Product[], sales: Sale[]): Promise<string> => {
  try {
    // Summarize data to avoid huge payloads
    const lowStockItems = products.filter(p => p.stock <= p.minStock).map(p => p.name);
    const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
    const recentSalesCount = sales.length;

    const prompt = `
      Actúa como un consultor experto de negocios para una licorería.
      Analiza los siguientes datos resumidos y dame 3 recomendaciones breves y prácticas (máximo 2 oraciones cada una) para mejorar las ventas o gestión.
      
      Datos:
      - Productos en stock crítico: ${lowStockItems.join(', ') || 'Ninguno'}
      - Ventas recientes (Total): $${totalSales}
      - Número de transacciones recientes: ${recentSalesCount}
      
      Formato de respuesta:
      1. [Recomendación sobre inventario]
      2. [Recomendación sobre ventas/promociones]
      3. [Tip general de negocio]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No se pudieron generar insights en este momento.";
  } catch (error) {
    console.error("Error generating insights:", error);
    return "El asistente IA no está disponible temporalmente. Verifica tu conexión.";
  }
};
