import React, { useState } from "react";
import { UserCheck, Sparkles, CheckCircle2, ChevronRight, AlertCircle, Heart, FileText, Phone, GraduationCap, ShieldCheck } from "lucide-react";

export default function VolunteerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const volunteerAreas = [
    { id: "passeio", label: "Passeio e Socialização", desc: "Levar os cães para passear e dar muito carinho." },
    { id: "eventos", label: "Adoção & Eventos", desc: "Ajudar nas feiras de adoção e divulgação online." },
    { id: "veterinaria", label: "Apoio Veterinário", desc: "Para profissionais ou estudantes de veterinária." },
    { id: "limpeza", label: "Limpeza & Organização", desc: "Manutenção do espaço e higienização dos boxes." },
    { id: "admin", label: "Administrativo & TI", desc: "Ajuda no controle de dados, planilhas e redes sociais." },
  ];

  const handleAreaChange = (label: string) => {
    if (areas.includes(label)) {
      setAreas(areas.filter((a) => a !== label));
    } else {
      setAreas([...areas, label]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (areas.length === 0) {
      setErrorMsg("Selecione pelo menos uma área de interesse para se voluntariar.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/volunteers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          areas,
          availability,
          status: "Pendente",
        }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errData = await response.json();
        setErrorMsg(errData.error || "Erro ao realizar cadastro.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocorreu um erro ao enviar seu formulário. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setName("");
    setEmail("");
    setPhone("");
    setAreas([]);
    setAvailability("");
    setErrorMsg("");
  };

  return (
    <div className="space-y-12 py-4" id="volunteer-view">
      {/* Hero Header */}
      <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold uppercase tracking-wide">
            <UserCheck className="h-3.5 w-3.5 text-teal-600" />
            Faça parte da nossa matilha
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 font-display">
            Seja um Voluntário no Abrigo
          </h2>
          <p className="text-stone-600 leading-relaxed text-base">
            O recurso mais valioso que você pode doar aos nossos animais é o seu tempo. Nossos cachorros dependem da dedicação de voluntários para passear, brincar, receber cuidados de saúde e ficarem prontos para uma adoção feliz. Se você ama animais, seu lugar é com a gente!
          </p>
        </div>
      </section>

      {/* Main Flow Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Volunteer Registration Form */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8">
          {success ? (
            <div className="text-center py-10 space-y-6" id="volunteer-success-panel">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-2xl text-stone-900 font-display">Cadastro Realizado!</h3>
                <p className="text-stone-600 text-sm max-w-md mx-auto">
                  Que notícia incrível, <strong>{name}</strong>! Seus dados foram salvos na nossa lista de pendentes e entraremos em contato nos próximos dias para agendar seu treinamento e integração inicial no abrigo.
                </p>
              </div>
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
                >
                  Cadastrar outro voluntário
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" id="volunteer-form">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-stone-900 font-display">Informações de Contato</h3>
                <p className="text-xs text-stone-400">Preencha seus dados para receber nosso contato inicial via WhatsApp ou E-mail.</p>
              </div>

              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 text-xs font-semibold" id="volunteer-form-error">
                  <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="vol-name" className="text-xs font-bold text-stone-600 block">Nome Completo</label>
                  <input
                    type="text"
                    id="vol-name"
                    required
                    placeholder="Ex: Pedro Henrique"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="vol-email" className="text-xs font-bold text-stone-600 block">E-mail</label>
                    <input
                      type="email"
                      id="vol-email"
                      required
                      placeholder="pedro@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="vol-phone" className="text-xs font-bold text-stone-600 block">WhatsApp / Celular</label>
                    <input
                      type="tel"
                      id="vol-phone"
                      required
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Area Checklist */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-stone-800 font-display">Áreas de Interesse</h3>
                  <p className="text-xs text-stone-400">Em quais frentes você gostaria de colaborar? Escolha uma ou mais.</p>
                </div>
                <div className="space-y-2">
                  {volunteerAreas.map((area) => (
                    <label
                      key={area.id}
                      className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                        areas.includes(area.label)
                          ? "border-teal-500 bg-teal-50/20"
                          : "border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={areas.includes(area.label)}
                        onChange={() => handleAreaChange(area.label)}
                        className="mt-1 h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-stone-800">{area.label}</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">{area.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability field */}
              <div className="space-y-1.5 pt-2">
                <label htmlFor="vol-availability" className="text-sm font-bold text-stone-800 font-display">Disponibilidade e Horários</label>
                <input
                  type="text"
                  id="vol-availability"
                  required
                  placeholder="Ex: Sábados de manhã, Terças à noite, Finais de semana..."
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all text-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Cadastrando..." : "Enviar Cadastro de Voluntário"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

        {/* Right Column - Quick guidelines (Como Funciona em Destaque) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white font-bold font-display shadow-sm">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-stone-900 text-lg font-display leading-tight">Como Funciona o Voluntariado</h3>
                <span className="text-[10px] text-amber-700 font-mono font-bold uppercase tracking-wider block">Passo a Passo em Destaque</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 bg-white p-4 rounded-2xl border border-stone-100 shadow-xs">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-800">1. Preenchimento</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-1">
                    Envie seus dados básicos e selecione suas áreas de afinidade no formulário ao lado.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 bg-white p-4 rounded-2xl border border-stone-100 shadow-xs">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-800">2. Alinhamento & Contato</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-1">
                    Nossa equipe entrará em contato via WhatsApp/Ligação para alinhar as datas e horários de preferência.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 bg-white p-4 rounded-2xl border border-stone-100 shadow-xs">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-800">3. Treinamento e Integração</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-1">
                    Participe de um treinamento prático de 1 hora no abrigo para conhecer as regras de segurança e manejo dos pets.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 bg-white p-4 rounded-2xl border border-stone-100 shadow-xs">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-800">4. Mãos na Massa!</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-1 font-medium text-stone-600">
                    Comece oficialmente a transformar vidas e espalhar amor para nossos cães, gatos e outros resgatados.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 text-center pt-2 border-t border-amber-200/50">
              Precisa de ajuda ou tem dúvidas? Entre em contato pelo nosso rodapé.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
