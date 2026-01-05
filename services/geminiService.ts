import { GoogleGenAI, Type } from "@google/genai";
import { Lead, EnrichedData } from "../types";

const getAiClient = () => {
  // Use process.env.API_KEY directly as per guidelines
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Uses Gemini with Google Maps Grounding to find business leads.
 */
export const searchLeads = async (activity: string, city: string): Promise<Lead[]> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";
  
  const prompt = `Find 10 popular places for "${activity}" in "${city}". List them.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        temperature: 0.7,
      },
    });

    const leads: Lead[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk, index) => {
        const c = chunk as any; 
        
        if (c.maps) {
           leads.push({
             id: c.maps.placeId || `lead-${index}-${Date.now()}`,
             name: c.maps.title || "Unknown Business",
             address: c.maps.address || "Address not available",
             mapUri: c.maps.uri,
             status: 'discovered'
           });
        }
      });
    }

    const uniqueLeads = Array.from(new Map(leads.map(item => [item.id, item])).values());
    return uniqueLeads;

  } catch (error) {
    console.error("Error searching leads:", error);
    throw error;
  }
};

/**
 * Uses Gemini to act as a Digital Strategy Expert.
 */
export const enrichLeadWithAI = async (lead: Lead, activity: string): Promise<EnrichedData> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  // Prompt spécifique demandé par l'expert Full-Stack
  const expertPrompt = `
    En tant qu'expert en stratégie digitale, analyse les données suivantes pour l'entreprise "${lead.name}" située à "${lead.address}".
    
    1. Trouve leur site web et email officiel (via Google Search).
    2. Analyse les données : {nom: "${lead.name}", site: [Trouvé ou Inconnu], note: "${lead.rating || 'N/A'}"}.
    3. Identifie un point faible technique précis (ex: vitesse, SEO, responsive, absence de site).
    4. Rédige un pitch de vente de 2 phrases percutantes pour proposer une refonte ou une amélioration.

    Format de réponse attendu : JSON uniquement.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: expertPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            website: { type: Type.STRING, description: "URL du site ou 'Not found'" },
            email: { type: Type.STRING, description: "Email public ou 'Not found'" },
            isMobileFriendly: { type: Type.BOOLEAN, description: "Estimation mobile-friendly" },
            weakness: { type: Type.STRING, description: "Le point faible technique identifié" },
            pitch: { type: Type.STRING, description: "Le pitch de vente de 2 phrases" },
          },
          required: ["website", "email", "isMobileFriendly", "weakness", "pitch"],
        },
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text) as EnrichedData;
    
    return data;

  } catch (error) {
    console.error(`Error enriching lead ${lead.name}:`, error);
    return {
      website: "N/A",
      email: "N/A",
      isMobileFriendly: false,
      weakness: "Erreur d'analyse",
      pitch: "Impossible d'analyser ce prospect pour le moment. Une vérification manuelle est recommandée."
    };
  }
};