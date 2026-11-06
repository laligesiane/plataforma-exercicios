/**
 * Palavrões de baixo calão e ofensas, em português, espanhol e inglês, que a Repasa não deixa salvar.
 *
 * Como a lista é conferida (ver index.ts): cada palavra do texto é comparada inteira, sem acento,
 * em minúsculas, com números trocados por letras (p0rr4 → porra) e letras repetidas juntas
 * (porraaa → porra). Por isso "computador" não é barrado por ter "puta" no meio.
 *
 * Ficaram de fora, de propósito, palavras com outro sentido comum (pau, rola, pinto, piranha,
 * coco, zorra, concha, polla, coger, cock, dick, ass...), para não barrar texto de estudo.
 * Para acrescentar uma palavra, escreva como se fala: sem precisar de acento nem plural com "s".
 */
export const PALAVROES = {
  pt: [
    "porra", "caralho", "caralha", "carai", "krl", "buceta", "boceta", "xoxota", "xereca", "xota",
    "puta", "puto", "putaria", "putinha", "putona", "puteiro", "merda", "merdinha", "bosta",
    "foda", "foder", "fodase", "fodido", "fodida", "fudido", "fudida", "fuder", "foda-se",
    "cu", "cuzao", "cuzinho", "arrombado", "arrombada", "viado", "viadinho", "punheta", "punheteiro",
    "boquete", "piroca", "caceta", "vadia",
    "fdp", "pqp", "vsf", "tnc", "vtnc", "tmnc", "pnc",
  ],
  es: [
    "mierda", "joder", "jodido", "jodida", "jodete", "coño", "cabron", "cabrona", "gilipollas", "gilipolla",
    "pendejo", "pendeja", "verga", "chingar", "chingada", "chingado", "chingate", "culero", "culera",
    "culo", "hijueputa", "hijoputa", "hdp", "carajo", "maricon", "marica", "conchetumare", "culiao",
    "ojete", "follar", "mamaguevo", "malparido", "malparida", "puta", "puto", "putita", "sudaca",
  ],
  en: [
    "fuck", "fucking", "fucker", "fucked", "fuckin", "motherfucker", "shit", "shitty", "bullshit",
    "bitch", "cunt", "asshole", "dickhead", "pussy", "whore", "slut", "wanker", "twat", "cocksucker",
    "nigger", "nigga", "faggot", "jackass", "dumbass", "stfu", "wtf",
  ],
} as const;

/**
 * Começos de palavra que já bastam para barrar (pegam "fuckface", "caralhada"...).
 * Só entram raízes que não começam nenhuma palavra comum.
 */
export const RAIZES = ["fuck", "caralh", "bucet", "bocet", "xoxot", "punhet", "chingad", "gilipol", "motherf", "cocksuck", "arromba"] as const;
