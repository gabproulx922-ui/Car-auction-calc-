export type Lang = "fr" | "en";

export const I18N = {
  fr: {
    settingsTitle: "Paramètres",
    settingsSubtitle: "Défaut: Copart Canada • Pre-bid • Secured • Taxes Québec",

    currency: "Devise",
    fx: "FX (1 USD → CAD)",
    fxAuto: "Auto (BdC)",
    provinceTaxes: "Province (taxes)",
    taxes: "Taxes",
    taxBase: "Base taxes",
    bidMode: "Mode d’enchère",
    payment: "Paiement",

    supabaseTitle: "Supabase Sync (optionnel)",
    supabaseSubtitle: "Connecte-toi pour synchroniser la Deal Queue. Sinon, l'app reste en localStorage.",
    emailPlaceholder: "Email pour magic link",
    sendLink: "Envoyer le lien",
    signedOut: "Déconnecté",
    signedIn: "Connecté",
    signOut: "Se déconnecter",
    supabaseMissing: "Supabase n'est pas configuré. Ajoute les variables d'environnement :",

    vinTitle: "1) Décodage VIN",
    vinSubtitle: "NHTSA vPIC (gratuit)",
    vinPlaceholder: "VIN (17 caractères)",
    decode: "Décoder",

    bidTitle: "2) Moteur de bid",
    bidSubtitle: "Frais Copart Canada + taxes QC + bid max (itératif)",
    estExitValue: "Valeur de sortie estimée",
    fixedCosts: "Coûts fixes",
    targetProfit: "Profit cible",
    calculate: "Calculer",
    saveDeal: "Sauvegarder dans Deal Queue",
    maxBid: "Bid max",
    profitLadder: "Profit ladder (Top 5)",
    colProfit: "PROFIT",
    colMaxBid: "BID MAX",
    colFees: "FRAIS",
    colTaxes: "TAXES",

    dealQueueTitle: "Deal Queue",
    mode: "Mode",
    refresh: "Rafraîchir",
    clear: "Vider",
    delete: "Supprimer",
    noDeals: "Aucun deal sauvegardé.",

    notesTitle: "Notes MVP",
  },
  en: {
    settingsTitle: "Settings",
    settingsSubtitle: "Default: Copart Canada • Pre-bid • Secured • Québec taxes",

    currency: "Currency",
    fx: "FX (1 USD → CAD)",
    fxAuto: "Auto (BoC)",
    provinceTaxes: "Province (taxes)",
    taxes: "Taxes",
    taxBase: "Tax base",
    bidMode: "Bid mode",
    payment: "Payment",

    supabaseTitle: "Supabase Sync (optional)",
    supabaseSubtitle: "Sign in to sync the Deal Queue. Otherwise, the app stays in localStorage.",
    emailPlaceholder: "Email for magic link",
    sendLink: "Send link",
    signedOut: "Signed out",
    signedIn: "Signed in",
    signOut: "Sign out",
    supabaseMissing: "Supabase is not configured. Add environment variables:",

    vinTitle: "1) VIN decode",
    vinSubtitle: "NHTSA vPIC (free)",
    vinPlaceholder: "VIN (17 characters)",
    decode: "Decode",

    bidTitle: "2) Bid engine",
    bidSubtitle: "Copart Canada fees + QC taxes + max bid (iterative)",
    estExitValue: "Estimated exit value",
    fixedCosts: "Fixed costs",
    targetProfit: "Target profit",
    calculate: "Calculate",
    saveDeal: "Save to Deal Queue",
    maxBid: "Max bid",
    profitLadder: "Profit ladder (Top 5)",
    colProfit: "PROFIT",
    colMaxBid: "MAX BID",
    colFees: "FEES",
    colTaxes: "TAXES",

    dealQueueTitle: "Deal Queue",
    mode: "Mode",
    refresh: "Refresh",
    clear: "Clear",
    delete: "Delete",
    noDeals: "No saved deals.",

    notesTitle: "MVP notes",
  },
} as const;

export type TDict = (typeof I18N)["fr"];
export const t = (lang: Lang): TDict => I18N[lang];
