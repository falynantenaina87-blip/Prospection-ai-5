import { Lead } from "../types";

/**
 * Nettoie le numéro de téléphone pour ne garder que les chiffres et le "+".
 */
export const validatePhone = (phone: string | undefined): string => {
  if (!phone) return "";
  // Ne garde que les chiffres et le symbole +
  return phone.replace(/[^0-9+]/g, '');
};

/**
 * Valide le format email via Regex.
 * Retourne "À prospecter" si invalide ou absent.
 */
export const validateEmail = (email: string | undefined): string => {
  if (!email) return "À prospecter";
  
  // Regex standard pour validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (emailRegex.test(email)) {
    return email;
  }
  return "À prospecter";
};

/**
 * Vérifie si l'URL est techniquement valide.
 */
export const validateWebsite = (url: string | undefined): string => {
  if (!url || url === 'Not found' || url === 'N/A') return "Non valide";
  
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch (e) {
    return "Non valide";
  }
};

/**
 * Validation globale d'un prospect avant export.
 */
export const validateLeadData = (lead: Lead): Lead => {
  return {
    ...lead,
    cleanPhone: validatePhone(lead.phone),
    cleanEmail: validateEmail(lead.email),
    cleanWebsite: validateWebsite(lead.website),
    // S'assure que le pitch existe, sinon valeur par défaut
    pitch: lead.pitch && lead.pitch.length > 5 ? lead.pitch : "Audit en cours. Contacter pour analyse manuelle.",
  };
};
