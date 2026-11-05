export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Sem as variáveis, o site continua no ar só com a demonstração. */
export const supabaseConfigurado = supabaseUrl !== "" && supabaseAnonKey !== "";

/** "Continuar com Google" só aparece depois de o provedor Google estar ligado no Supabase (NEXT_PUBLIC_LOGIN_GOOGLE=1 na Vercel). */
export const loginGoogleLigado = process.env.NEXT_PUBLIC_LOGIN_GOOGLE === "1";
