import React, { useEffect, useState } from "react";
import { Heart, Users, Sparkles, ShieldCheck, HeartHandshake, ArrowRight, Cat, Rabbit, TrendingUp, ArrowDownRight, DollarSign } from "lucide-react";
import { DashboardStats } from "../types";

interface HomeHeroProps {
  setActiveTab: (tab: string) => void;
}

export default function HomeHero({ setActiveTab }: HomeHeroProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalAdopted = stats ? (stats.adoptedDogs + (stats.adoptedCats || 0) + (stats.adoptedExotics || 0)) : 0;

  const statsItems = [
    {
      id: "stat-dogs-housed",
      label: "Cães Hospedados",
      value: stats ? stats.availableDogs : "...",
      color: "text-amber-600 bg-amber-50 border-amber-100",
      icon: Sparkles,
      desc: "Prontos para adoção",
    },
    {
      id: "stat-cats-housed",
      label: "Gatos Hospedados",
      value: stats ? (stats.availableCats ?? 0) : "...",
      color: "text-teal-600 bg-teal-50 border-teal-100",
      icon: Cat,
      desc: "Ronronando por carinho",
    },
    {
      id: "stat-exotics-housed",
      label: "Animais Exóticos",
      value: stats ? (stats.availableExotics ?? 0) : "...",
      color: "text-purple-600 bg-purple-50 border-purple-100",
      icon: Rabbit,
      desc: "Coelhos, furões & aves",
    },
    {
      id: "stat-dogs-adopted",
      label: "Lares Felizes",
      value: stats ? totalAdopted : "...",
      color: "text-rose-600 bg-rose-50 border-rose-100",
      icon: Heart,
      desc: "Pets adotados",
    },
    {
      id: "stat-volunteers",
      label: "Voluntários",
      value: stats ? stats.totalVolunteers : "...",
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      icon: Users,
      desc: "Anjos nos ajudando",
    },
    {
      id: "stat-donations",
      label: "Arrecadação total",
      value: stats ? `R$ ${stats.totalDonationsAmount.toLocaleString()}` : "...",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      icon: HeartHandshake,
      desc: "Ração, vacinas & clínica",
    },
  ];

  return (
    <div className="space-y-10 py-4" id="home-view">
      {/* Small Top Financial Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-900 text-white p-5 rounded-3xl shadow-sm border border-stone-800" id="top-financial-dashboard">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider font-sans">Valores Recebidos</p>
            <p className="text-base font-extrabold font-mono tracking-tight text-emerald-400 mt-0.5">
              {stats ? `R$ ${stats.totalDonationsAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ 0,00"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-x border-stone-800 pt-3 sm:pt-0 sm:px-4">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <ArrowDownRight className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider font-sans">Contas a Pagar</p>
            <p className="text-base font-extrabold font-mono tracking-tight text-rose-400 mt-0.5">
              {stats ? `R$ ${stats.pendingBillsAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ 0,00"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider font-sans">Saldo em Caixa</p>
            <p className="text-base font-extrabold font-mono tracking-tight text-amber-400 mt-0.5">
              {stats ? `R$ ${(stats.totalDonationsAmount - stats.paidBillsAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ 0,00"}
            </p>
          </div>
        </div>
      </div>

      {/* Hero section */}
      <section className="relative overflow-hidden bg-white border border-stone-200 rounded-3xl p-8 md:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5 fill-current text-amber-500 animate-pulse" />
              Amigos de quatro patas precisam de você
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display tracking-tight text-stone-900 leading-[1.1]">
              Não compre amor, <span className="text-amber-500 underline decoration-amber-200 decoration-wavy">Adote</span>.
            </h1>
            <p className="text-stone-600 text-lg leading-relaxed max-w-xl">
              Dezenas de focinhos carinhosos esperam por um lar quentinho no nosso abrigo. Oferecemos amor incondicional, rabo abanando e uma lealdade que dura a vida toda. Mude uma vida hoje!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => setActiveTab("adopt")}
                id="hero-adopt-cta"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all shadow-md shadow-amber-500/20 text-center cursor-pointer"
              >
                Conhecer Cães Disponíveis
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab("donations")}
                id="hero-donate-cta"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold transition-all text-center cursor-pointer"
              >
                Como Ajudar Financeiramente
              </button>
            </div>
          </div>

          {/* Hero Image / Collage */}
          <div className="relative">
            <div className="aspect-4/3 overflow-hidden rounded-2xl bg-stone-100 shadow-lg border border-stone-200">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1000"
                alt="Dois cachorrinhos felizes brincando"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-stone-100 hidden sm:flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Todos os nossos cães são</p>
                <p className="text-sm font-bold text-stone-800">100% Vacinados e Castrados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats counter */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-stone-900">
            Nosso Impacto em Números
          </h2>
          <p className="text-stone-500 text-sm">
            Estatísticas geradas em tempo real com base nos registros e na ajuda generosa da nossa comunidade.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6" id="home-stats-grid">
          {statsItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                id={item.id}
                className="bg-white border border-stone-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                      {item.label}
                    </p>
                    <p className="text-3xl font-extrabold text-stone-900 font-display mt-2">
                      {item.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <p className="text-xs text-stone-400 font-medium">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core values / Info */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">1</div>
          <h3 className="font-bold text-lg text-stone-800">Processo Responsável</h3>
          <p className="text-stone-500 text-sm leading-relaxed">
            Entrevistamos as famílias para garantir que o estilo de vida combine com o temperamento do cachorro, garantindo uma adoção de sucesso.
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">2</div>
          <h3 className="font-bold text-lg text-stone-800">Suporte Veterinário</h3>
          <p className="text-stone-500 text-sm leading-relaxed">
            Nossos cães recebem exames veterinários, tratamento contra vermes, carrapatos, vacinas essenciais e castração antes de irem para casa.
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">3</div>
          <h3 className="font-bold text-lg text-stone-800">Lar Temporário & Carinho</h3>
          <p className="text-stone-500 text-sm leading-relaxed">
            Enquanto não são adotados, eles vivem em um abrigo espaçoso, limpo, alimentados com ração super premium e recebem carinho dos voluntários.
          </p>
        </div>
      </section>
    </div>
  );
}
