import React, { useState } from "react";
import { motion } from "motion/react";
import { Calendar, MapPin, Clock, Heart, Sparkles, Syringe, Filter, Check, Share2, Bell, AlertCircle } from "lucide-react";

interface Event {
  id: string;
  title: string;
  type: "Feira de Adoção" | "Campanha de Vacinação" | "Outro";
  date: string;
  time: string;
  location: string;
  description: string;
  highlights: string[];
  imageUrl: string;
}

export default function EventsArea() {
  const [filter, setFilter] = useState<"all" | "adopt" | "vax">("all");
  const [reminderEmail, setReminderEmail] = useState<string>("");
  const [reminderEventId, setReminderEventId] = useState<string | null>(null);
  const [reminderSuccess, setReminderSuccess] = useState<boolean>(false);

  const events: Event[] = [
    {
      id: "event_1",
      title: "Feira Especial de Adoção Aubrigo & Companhia",
      type: "Feira de Adoção",
      date: "19 de Julho, 2026",
      time: "10h às 16h",
      location: "Praça das Mangueiras, Centro (Ao lado da Igreja Matriz)",
      description: "Venha conhecer mais de 30 cães e gatos ansiosos por um lar cheio de amor! Teremos cães adultos castrados, filhotes brincalhões e gatinhos ronronantes prontos para adoção responsável.",
      highlights: [
        "Adoção assistida por veterinários",
        "Brindes exclusivos para adotantes",
        "Espaço de recreação com os pets",
        "Bazar beneficente com produtos do Aubrigo"
      ],
      imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "event_2",
      title: "Grande Mutirão de Vacinação e Microchipagem Gratuita",
      type: "Campanha de Vacinação",
      date: "02 de Agosto, 2026",
      time: "09h às 15h",
      location: "Ginásio de Esportes Municipal (Estacionamento Principal)",
      description: "Proteja seu melhor amigo! Vacinação antirrábica e polivalente gratuita para animais da comunidade em vulnerabilidade social, além de microchipagem preventiva de segurança.",
      highlights: [
        "Vacinas importadas de alta qualidade",
        "Aplicação de microchip com cadastro nacional",
        "Orientações preventivas contra zoonoses",
        "Entrega de vermífugos gratuitos"
      ],
      imageUrl: "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "event_3",
      title: "Encontro de Adotantes & Bazar do Aubrigo da Dany",
      type: "Feira de Adoção",
      date: "23 de Agosto, 2026",
      time: "11h às 17h",
      location: "Parque dos Ipês, Portão 3",
      description: "Um dia de celebração! Traga seu pet adotado no Aubrigo para reencontrar os voluntários, confraternizar com outras famílias e apoiar nosso bazar especial de arrecadação.",
      highlights: [
        "Bazar com roupas e acessórios pet",
        "Fotógrafo profissional de pets gratuito",
        "Desfile com histórias de resgates bem-sucedidos",
        "Rifa solidária com prêmios especiais"
      ],
      imageUrl: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "event_4",
      title: "Campanha de Saúde Pet: Vermifugação & Combate a Pulgas",
      type: "Campanha de Vacinação",
      date: "06 de Setembro, 2026",
      time: "10h às 14h",
      location: "Praça do Bairro Alegre",
      description: "Distribuição e aplicação supervisionada de antiparasitários e vermífugos para animais domésticos, visando o bem-estar e a erradicação de parasitas urbanos.",
      highlights: [
        "Avaliação veterinária de peso e pelagem",
        "Aplicação gratuita de pipetas antipulgas",
        "Palestras de posse responsável com educadores",
        "Apoio social para famílias cadastradas"
      ],
      imageUrl: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=600"
    }
  ];

  const filteredEvents = events.filter((e) => {
    if (filter === "all") return true;
    if (filter === "adopt") return e.type === "Feira de Adoção";
    if (filter === "vax") return e.type === "Campanha de Vacinação";
    return true;
  });

  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderEmail.trim()) return;
    setReminderSuccess(true);
    setTimeout(() => {
      setReminderSuccess(false);
      setReminderEventId(null);
      setReminderEmail("");
    }, 4000);
  };

  return (
    <div className="space-y-10" id="events-area-container">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full tracking-wider uppercase inline-flex items-center gap-1.5 shadow-sm">
          <Calendar className="h-3 w-3 text-amber-500" />
          Nossa Agenda Solidária
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
          Eventos & Ações Comunitárias
        </h2>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Participe das nossas feiras de adoção responsável e campanhas de saúde animal. Juntos, construímos uma comunidade mais consciente, saudável e repleta de carinho!
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-2" id="events-filter-bar">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer border ${
            filter === "all"
              ? "bg-stone-800 text-white border-stone-800 shadow-sm"
              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          Todos os Eventos
        </button>
        <button
          onClick={() => setFilter("adopt")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer border ${
            filter === "adopt"
              ? "bg-amber-500 text-white border-amber-500 shadow-sm"
              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
          }`}
        >
          <Heart className="h-3.5 w-3.5" />
          Feiras de Adoção
        </button>
        <button
          onClick={() => setFilter("vax")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer border ${
            filter === "vax"
              ? "bg-teal-600 text-white border-teal-600 shadow-sm"
              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
          }`}
        >
          <Syringe className="h-3.5 w-3.5" />
          Campanhas de Vacinação
        </button>
      </div>

      {/* Events Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto" id="events-grid">
        {filteredEvents.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Image Banner */}
              <div className="h-48 w-full relative overflow-hidden bg-stone-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-4 left-4 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md text-white ${
                  item.type === "Feira de Adoção" ? "bg-amber-500" : "bg-teal-600"
                }`}>
                  {item.type}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <h3 className="font-extrabold text-stone-900 text-lg sm:text-xl tracking-tight leading-snug font-display">
                  {item.title}
                </h3>

                {/* Date & Location Details */}
                <div className="space-y-2 text-xs text-stone-600 bg-stone-50/70 p-3.5 rounded-2xl border border-stone-100 font-sans">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
                    <span><strong>Data:</strong> {item.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                    <span><strong>Horário:</strong> {item.time}</span>
                  </div>
                  <div className="flex items-center gap-2 items-start">
                    <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Local:</strong> {item.location}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {item.description}
                </p>

                {/* Event Highlights */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">O que vai ter:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {item.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-stone-700">
                        <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-6 pt-0 border-t border-stone-50 mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => setReminderEventId(item.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <Bell className="h-4 w-4 text-amber-500" />
                Lembrar-me por E-mail
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reminder modal */}
      {reminderEventId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4" id="events-reminder-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-stone-200 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4 relative"
          >
            <button
              onClick={() => setReminderEventId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <Check className="h-5 w-5 transform rotate-45" />
            </button>

            {reminderSuccess ? (
              <div className="text-center py-6 space-y-4" id="reminder-success-view">
                <div className="w-12 h-12 bg-teal-50 text-teal-600 border border-teal-200 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-stone-900 text-lg font-display">Lembrete Ativado!</h4>
                  <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
                    Nós lhe enviaremos as informações detalhadas e atualizações sobre este evento por e-mail 1 dia antes da data. Muito obrigado!
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReminderSubmit} className="space-y-4" id="reminder-modal-form">
                <div className="space-y-1">
                  <span className="p-2 bg-amber-50 text-amber-700 rounded-xl inline-flex mb-1">
                    <Bell className="h-5 w-5" />
                  </span>
                  <h3 className="font-bold text-stone-900 text-lg font-display">Quer ser avisado?</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Insira seu e-mail para receber o endereço completo com mapa, recomendações e novidades exclusivas sobre o evento selecionado!
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-600 block">Seu E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: seu-nome@email.com"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-2xl bg-stone-50 text-stone-800 text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/10 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Confirmar Inscrição na Agenda
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Info Section about Event safety */}
      <div className="max-w-4xl mx-auto bg-stone-50 border border-stone-200 p-6 rounded-3xl flex flex-col sm:flex-row gap-4 items-start shadow-sm">
        <div className="p-3 bg-white text-amber-500 rounded-2xl border border-stone-100 shadow-sm shrink-0">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-stone-800 text-sm font-display">Instruções de Segurança & Adoção</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Para adotar em nossas feiras, traga seu documento de identidade com foto (RG ou CNH), comprovante de residência recente e uma caixinha de transporte segura (para gatos) ou guia (para cães). Todos os adotantes passam por uma entrevista de conscientização e assinam um termo de responsabilidade no ato.
          </p>
        </div>
      </div>
    </div>
  );
}
