import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Lead, EnrichedData } from "../types";

/**
 * Initialise le client Google AI avec la clé d'environnement.
 * Sur Vercel, assurez-vous d'ajouter API_KEY dans les Environment Variables.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY || "";
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Recherche des prospects en utilisant Gemini avec Grounding (Google Search).
 */
export const searchLeads = async (activity: string, city: string): Promise<Lead[]> => {
  const genAI = getAiClient();
  // Utilisation de gemini-1.5-flash pour la rapidité et le coût
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" 
  });
  
  const prompt = `Trouve 10 entreprises réelles pour l'activité "${activity}" à "${city}". 
  Pour chaque entreprise, donne : nom, adresse complète, et si possible un site web.
  Réponds uniquement sous forme de tableau JSON d'objets avec les clés : name, address, website.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [{ googleSearchRetrieval: {} }] // Active la recherche Google en temps réel
    });

    const response = await result.response;
    const text = response.text();
    
    // Nettoyage pour s'assurer qu'on ne garde que le JSON
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const rawLeads = JSON.parse(cleanJson);

    return rawLeads.map((l: any, index: number) => ({
      id: `lead-${index}-${Date.now()}`,
      name: l.name || "Inconnu",
      address: l.address || "Adresse non listée",
      website: l.website || "",
      status: 'discovered'
    }));

  } catch (error) {
    console.error("Error searching leads:", error);
    return [];
  }
};

/**
 * Analyse un prospect pour générer une stratégie digitale personnalisée.
 */
export const enrichLeadWithAI = async (lead: Lead, activity: string): Promise<EnrichedData> => {
  const genAI = getAiClient();
  
  // Configuration du modèle avec un schéma de réponse strict pour éviter les erreurs de parsing
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          website: { type: SchemaType.STRING },
          email: { type: SchemaType.STRING },
          isMobileFriendly: { type: SchemaType.BOOLEAN },
          weakness: { type: SchemaType.STRING },
          pitch: { type: SchemaType.STRING },
        },
        required: ["website", "email", "isMobileFriendly", "weakness", "pitch"],
      },
    }
  });

  const expertPrompt = `
    En tant qu'expert en stratégie digitale, analyse l'entreprise "${lead.name}" à "${lead.address}" (${activity}).
    1. Identifie leur présence en ligne (site et email).
    2. Trouve un point faible technique (SEO, responsive, absence de site).
    3. Rédige un pitch de vente percutant de 2 phrases.
  `;

  try {
    const result = await model.generateContent(expertPrompt);
    const text = result.response.text();
    return JSON.parse(text) as EnrichedData;

  } catch (error) {
    console.error(`Error enriching lead ${lead.name}:`, error);
    return {
      website: lead.website || "N/A",
      email: "N/A",
      isMobileFriendly: false,
      weakness: "Analyse automatique indisponible",
      pitch: "Contactez ce prospect pour auditer ses besoins digitaux manuellement."
    };
  }
};
     } 
  ;};
