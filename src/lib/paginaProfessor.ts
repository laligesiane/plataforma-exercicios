/** Página pública do professor: repasa.com.br/p/apelido. */

export const RESERVADOS = new Set(["admin", "repasa", "suporte", "professor", "aluno", "api", "ajuda"]);

/** Transforma o que a pessoa digitou num apelido de endereço: "Ana Lúcia" → "ana-lucia". */
export function normalizarApelido(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

/** Mensagem de erro, ou null se o apelido pode ser usado. Mesma regra do banco. */
export function problemaDoApelido(apelido: string): string | null {
  if (apelido.length < 3) return "O endereço precisa ter pelo menos 3 letras ou números.";
  if (!/^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$/.test(apelido)) return "Use só letras sem acento, números e hífen.";
  if (RESERVADOS.has(apelido)) return "Esse endereço é reservado. Escolha outro.";
  return null;
}

export type Contato = { texto: string; href?: string };

/** Vira link quando é e-mail ou endereço https; senão fica só o texto. */
export function lerContato(contato: string): Contato | null {
  const texto = contato.trim();
  if (!texto) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) return { texto, href: `mailto:${texto}` };
  if (/^https:\/\/[^\s]+$/i.test(texto)) return { texto: texto.replace(/^https:\/\//i, ""), href: texto };
  return { texto };
}

/* ---------- Redes sociais: o professor digita só o usuário (ou o número), o app monta o link. ---------- */

export const REDES = ["whatsapp", "instagram", "tiktok", "facebook", "youtube"] as const;
export type Rede = (typeof REDES)[number];

type InfoRede = {
  nome: string;
  /** Texto de exemplo no campo. */
  exemplo: string;
  /** Mesma regra do banco (0038). */
  padrao: RegExp;
  /** Domínios aceitos quando a pessoa cola o link inteiro. */
  dominios: RegExp;
  link: (valor: string) => string;
  /** Como o contato aparece escrito na página. */
  rotulo: (valor: string) => string;
  erro: string;
};

export const infoRedes: Record<Rede, InfoRede> = {
  whatsapp: {
    nome: "WhatsApp",
    exemplo: "(11) 91234-5678",
    padrao: /^[0-9]{10,15}$/,
    dominios: /^(wa\.me|api\.whatsapp\.com|whatsapp\.com)$/,
    link: (n) => `https://wa.me/${n}`,
    rotulo: formatarTelefone,
    erro: "Digite o WhatsApp com DDD, só números. Ex.: 11 91234-5678.",
  },
  instagram: {
    nome: "Instagram",
    exemplo: "seu.usuario",
    padrao: /^[A-Za-z0-9._]{1,30}$/,
    dominios: /^instagram\.com$/,
    link: (u) => `https://www.instagram.com/${u}`,
    rotulo: (u) => `@${u}`,
    erro: "Usuário do Instagram inválido: use letras, números, ponto e _ (até 30).",
  },
  tiktok: {
    nome: "TikTok",
    exemplo: "seu.usuario",
    padrao: /^[A-Za-z0-9._]{2,24}$/,
    dominios: /^tiktok\.com$/,
    link: (u) => `https://www.tiktok.com/@${u}`,
    rotulo: (u) => `@${u}`,
    erro: "Usuário do TikTok inválido: use letras, números, ponto e _ (2 a 24).",
  },
  facebook: {
    nome: "Facebook",
    exemplo: "sua.pagina",
    padrao: /^[A-Za-z0-9.]{5,50}$/,
    dominios: /^(facebook\.com|fb\.com)$/,
    link: (u) => `https://www.facebook.com/${u}`,
    rotulo: (u) => u,
    erro: "Usuário do Facebook inválido: use letras, números e ponto (pelo menos 5).",
  },
  youtube: {
    nome: "YouTube",
    exemplo: "seucanal",
    padrao: /^[A-Za-z0-9._-]{3,30}$/,
    dominios: /^youtube\.com$/,
    link: (u) => `https://www.youtube.com/@${u}`,
    rotulo: (u) => `@${u}`,
    erro: "Identificador do YouTube inválido: use letras, números, ponto, - e _ (3 a 30).",
  },
};

/** (11) 91234-5678 para números do Brasil; os demais ficam com + e os dígitos. */
export function formatarTelefone(numero: string): string {
  const m = numero.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : `+${numero}`;
}

/**
 * Limpa o que o professor digitou: tira @, espaços e, se ele colou o link inteiro, fica só com o usuário.
 * No WhatsApp fica só com os números e põe o 55 do Brasil quando vem só DDD + número.
 */
export function normalizarRede(rede: Rede, texto: string): string {
  let valor = texto.trim();
  if (!valor) return "";
  if (rede === "whatsapp") {
    const digitos = valor.replace(/\D/g, "").replace(/^0+/, "");
    return digitos.length === 10 || digitos.length === 11 ? `55${digitos}` : digitos;
  }
  const url = valor.match(/^(?:https?:\/\/)?(?:www\.|m\.|web\.)?([a-z.]+\.[a-z]+)\/(.*)$/i);
  if (url && infoRedes[rede].dominios.test(url[1].toLowerCase())) {
    valor = url[2].split(/[/?#]/).filter((parte) => parte && parte !== "c" && parte !== "user")[0] ?? "";
  }
  return valor.replace(/^@+/, "").trim();
}

/** Mensagem de erro, ou null se o valor (já normalizado) pode ser salvo. */
export function problemaDaRede(rede: Rede, valor: string): string | null {
  if (!valor) return null;
  if (rede === "facebook" && valor.toLowerCase() === "profile.php") return "No Facebook, use o nome de usuário do perfil ou da página (facebook.com/seunome).";
  return infoRedes[rede].padrao.test(valor) ? null : infoRedes[rede].erro;
}

/* ---------- Outras informações da página ---------- */

export const MODALIDADES = { online: "Aulas online", presencial: "Aulas presenciais", ambos: "Aulas online e presenciais" } as const;
export type Modalidade = keyof typeof MODALIDADES;

/** "Ensina há 8 anos" a partir do ano em que começou. */
export function tempoEnsinando(desde: number | null | undefined, anoAtual = new Date().getFullYear()): string | null {
  if (!desde || desde > anoAtual) return null;
  const anos = anoAtual - desde;
  if (anos === 0) return `Ensina desde ${desde}`;
  return `Ensina há ${anos} ${anos === 1 ? "ano" : "anos"}`;
}
