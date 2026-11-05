/* eslint-disable @next/next/no-img-element -- foto pequena do Storage do Supabase, já reduzida no envio. */

/** Foto de perfil redonda; sem foto, a inicial do nome sobre a cor da Repasa. */
export function Avatar({ nome, foto, className = "size-8 text-sm" }: { nome?: string | null; foto?: string | null; className?: string }) {
  if (foto) {
    return <img src={foto} alt="" className={`${className} shrink-0 rounded-full bg-suave object-cover`} />;
  }
  const inicial = (nome?.trim()[0] ?? "?").toUpperCase();
  return (
    <span aria-hidden className={`${className} flex shrink-0 items-center justify-center rounded-full bg-primaria font-extrabold text-white`}>
      {inicial}
    </span>
  );
}
