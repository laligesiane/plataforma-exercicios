import { Lacuna } from "@/components/exercicios/Lacuna";
import { MultiplaEscolha } from "@/components/exercicios/MultiplaEscolha";
import { lacunasDemo, multiplaEscolhaDemo } from "@/lib/exemplos/demo";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Plataforma de Exercícios</h1>
      <p className="mt-1 text-sm opacity-70">Demonstração da correção item a item. Erre de propósito para ver a explicação.</p>

      <section className="mt-8">
        <h2 className="font-medium">1. Complete com o verbo ou a palavra correta</h2>
        {lacunasDemo.map((item) => (
          <Lacuna key={item.enunciado} item={item} />
        ))}
      </section>

      <section className="mt-8">
        <h2 className="font-medium">2. Escolha a preposição</h2>
        {multiplaEscolhaDemo.map((item) => (
          <MultiplaEscolha key={item.enunciado} item={item} />
        ))}
      </section>
    </main>
  );
}
