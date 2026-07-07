import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Home, Check, Info, ShieldAlert, Phone, Users, CheckCircle, Heart, MapPin, AlertCircle } from "lucide-react";
import { FosterHome } from "../types";

export default function FosterArea() {
  const [fosterHomes, setFosterHomes] = useState<FosterHome[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  // Form states
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [neighborhood, setNeighborhood] = useState<string>("");
  const [residenceType, setResidenceType] = useState<"Casa" | "Apartamento" | "Sítio/Chácara">("Casa");
  const [hasPet, setHasPet] = useState<boolean>(false);
  const [petDetails, setPetDetails] = useState<string>("");
  const [spaceDescription, setSpaceDescription] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchFosterHomes();
  }, []);

  const fetchFosterHomes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/foster-homes");
      if (res.ok) {
        const data = await res.json();
        setFosterHomes(data);
      } else {
        console.error("Erro ao carregar lares temporários");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !phone.trim() || !city.trim() || !neighborhood.trim() || !spaceDescription.trim()) {
      setError("Todos os campos marcados com * são obrigatórios.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/foster-homes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim(),
          neighborhood: neighborhood.trim(),
          residenceType,
          hasPet,
          petDetails: hasPet ? petDetails.trim() : "",
          spaceDescription: spaceDescription.trim(),
        }),
      });

      if (response.ok) {
        setSuccess(true);
        // Clear form
        setFullName("");
        setEmail("");
        setPhone("");
        setCity("");
        setNeighborhood("");
        setResidenceType("Casa");
        setHasPet(false);
        setPetDetails("");
        setSpaceDescription("");
        fetchFosterHomes(); // Refresh counters and list
      } else {
        const errData = await response.json();
        setError(errData.error || "Erro ao registrar cadastro.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro de rede ao conectar com o servidor. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // Safe name obfuscation for public listings (e.g. Mariana Souza -> Mariana S.)
  const obfuscateName = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length <= 1) return name;
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  // Calculate statistics
  const totalRegistered = fosterHomes.length;
  const availableCount = fosterHomes.filter((f) => f.status === "Disponível").length;
  const occupiedCount = fosterHomes.filter((f) => f.status === "Ocupado").length;
  const unavailableCount = fosterHomes.filter((f) => f.status === "Indisponível").length;

  return (
    <div className="space-y-10" id="foster-area-container">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full tracking-wider uppercase inline-flex items-center gap-1.5 shadow-sm">
          <Heart className="h-3 w-3 fill-current text-amber-500" />
          Acolhimento Responsável
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
          Seja um Lar Temporário
        </h2>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          O Lar Temporário é um dos pilares mais importantes do Aubrigo. Hospedar um animal resgatado por algumas semanas abre espaço para novos resgates e prepara o pet para o convívio em um lar definitivo!
        </p>
      </div>

      {/* Realtime Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto" id="foster-stats-grid">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center space-y-2 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="p-3 bg-stone-100 rounded-2xl text-stone-700">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Lares Cadastrados</p>
            <h3 className="text-4xl font-black text-stone-900 font-display mt-1">
              {loading ? "..." : totalRegistered}
            </h3>
          </div>
          <p className="text-[11px] text-stone-500">Famílias acolhedoras registradas</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center space-y-2 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 bg-teal-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <p className="text-teal-600/70 font-bold uppercase text-[10px] tracking-wider">Lares Disponíveis</p>
            <h3 className="text-4xl font-black text-teal-600 font-display mt-1">
              {loading ? "..." : availableCount}
            </h3>
          </div>
          <p className="text-[11px] text-stone-500">Prontos para acolher um pet</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center space-y-2 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 bg-purple-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-purple-600/70 font-bold uppercase text-[10px] tracking-wider">Lares em Atividade (Ocupados)</p>
            <h3 className="text-4xl font-black text-purple-600 font-display mt-1">
              {loading ? "..." : occupiedCount}
            </h3>
          </div>
          <p className="text-[11px] text-stone-500">Hospedando animais no momento</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        {/* Left column: registration form or success */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 px-4 space-y-5"
                id="foster-success-view"
              >
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto border border-teal-200 shadow-sm animate-bounce">
                  <Check className="h-8 w-8 stroke-[3]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-stone-900 text-2xl font-display">Cadastro Concluído com Sucesso!</h3>
                  <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
                    Muito obrigado pelo seu carinho e disposição! O Aubrigo da Tia Dany analisará o seu perfil. Em breve entraremos em contato via WhatsApp para alinhar os próximos passos.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-3 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-2xl text-xs transition-all shadow-sm cursor-pointer"
                  >
                    Fazer outro cadastro ou Atualizar
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" id="foster-registration-form">
                <div>
                  <h3 className="font-bold text-stone-800 text-xl font-display">Formulário de Cadastro</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Preencha as informações detalhadas sobre sua residência e sua disponibilidade para acolhimento de cães ou gatos resgatados.
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-2xl flex items-start gap-2 animate-pulse">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-600 block">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Amanda Santos"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-2xl bg-stone-50 text-stone-800 text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/10 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-600 block">WhatsApp / Telefone *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: (11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-2xl bg-stone-50 text-stone-800 text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-stone-600 block">E-mail de Contato *</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: amanda@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-2xl bg-stone-50 text-stone-800 text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/10 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-600 block">Tipo de Residência *</label>
                    <select
                      value={residenceType}
                      onChange={(e) => setResidenceType(e.target.value as any)}
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-2xl bg-stone-50 text-stone-800 text-xs focus:bg-white outline-none cursor-pointer transition-all"
                    >
                      <option value="Casa">Casa</option>
                      <option value="Apartamento">Apartamento</option>
                      <option value="Sítio/Chácara">Sítio/Chácara</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-600 block">Cidade *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: São Paulo"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-2xl bg-stone-50 text-stone-800 text-xs focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-600 block">Bairro *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pinheiros"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-2xl bg-stone-50 text-stone-800 text-xs focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-3">
                  <span className="text-xs font-bold text-stone-700 block">Você já possui algum pet morando com você atualmente?</span>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-600">
                      <input
                        type="radio"
                        checked={hasPet}
                        onChange={() => setHasPet(true)}
                        className="h-4 w-4 text-amber-500 border-stone-300 focus:ring-amber-500/20"
                      />
                      Sim, tenho pets
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-600">
                      <input
                        type="radio"
                        checked={!hasPet}
                        onChange={() => {
                          setHasPet(false);
                          setPetDetails("");
                        }}
                        className="h-4 w-4 text-amber-500 border-stone-300 focus:ring-amber-500/20"
                      />
                      Não possuo pets
                    </label>
                  </div>

                  {hasPet && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pt-2 space-y-1"
                    >
                      <label className="text-[10px] font-bold text-stone-500 block">Especifique as espécies, raças e temperamento deles *</label>
                      <textarea
                        required={hasPet}
                        placeholder="Ex: 1 cachorro de pequeno porte dócil, castrado e vacinado."
                        value={petDetails}
                        onChange={(e) => setPetDetails(e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-2xl bg-white text-stone-800 text-xs outline-none transition-all"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-600 block">Descrição do Espaço & Motivação *</label>
                  <p className="text-[10px] text-stone-400 mb-1">
                    Conte-nos sobre o local onde o animal ficará (ex: quintal cercado, telas nas janelas) e o que te motiva a ser um lar temporário.
                  </p>
                  <textarea
                    required
                    placeholder="Ex: Temos uma casa com quintal espaçoso e fechado. Eu e meu companheiro trabalhamos em home-office e adoramos dar atenção para cães. Gostaríamos de acolher cães de médio ou pequeno porte..."
                    value={spaceDescription}
                    onChange={(e) => setSpaceDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-2xl bg-stone-50 text-stone-800 text-xs focus:bg-white outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-bold rounded-2xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitting ? "Cadastrando..." : "Enviar Cadastro de Lar Temporário"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right column: program info and community preview list */}
        <div className="lg:col-span-5 space-y-6">
          {/* Info cards */}
          <div className="bg-amber-50/50 border border-amber-200/60 p-6 rounded-3xl space-y-4">
            <h4 className="font-bold text-amber-800 text-sm font-display flex items-center gap-1.5 uppercase tracking-wide">
              <Info className="h-4 w-4 shrink-0 text-amber-500" />
              Como funciona o Lar Temporário?
            </h4>
            <div className="space-y-3.5 text-xs text-amber-950">
              <p>
                <strong>1. O Aubrigo apoia você:</strong> Nós fornecemos a ração, medicamentos e arcamos com as despesas veterinárias se o pet precisar de consultas durante a estadia.
              </p>
              <p>
                <strong>2. Período flexível:</strong> A hospedagem dura geralmente de 2 a 6 semanas, dependendo do andamento de vacinas ou da fila de adoção do pet.
              </p>
              <p>
                <strong>3. Entrevista prévia:</strong> Após enviar o formulário, agendamos uma conversa rápida para entender qual o perfil de animal mais adequado para sua casa (tamanho, energia, convivência com crianças/outros pets).
              </p>
            </div>
          </div>

          {/* Secure Live community preview */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h4 className="font-bold text-stone-800 text-sm font-display uppercase tracking-wider">Nossos Lares Registrados</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">Veja algumas das famílias voluntárias que fazem parte do nosso Aubrigo.</p>
            </div>

            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-10 bg-stone-100 rounded-xl"></div>
                <div className="h-10 bg-stone-100 rounded-xl"></div>
                <div className="h-10 bg-stone-100 rounded-xl"></div>
              </div>
            ) : fosterHomes.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Nenhum lar temporário cadastrado ainda. Seja o primeiro!</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1" id="foster-community-list">
                {fosterHomes.map((foster) => (
                  <div
                    key={foster.id}
                    className="p-3.5 border border-stone-100 rounded-2xl flex items-center justify-between gap-4 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-xs text-stone-800 font-bold">{obfuscateName(foster.fullName)}</strong>
                        <span className="text-[10px] bg-stone-100 border border-stone-200 text-stone-500 font-bold px-1.5 py-0.5 rounded-md">
                          {foster.residenceType}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-stone-400 shrink-0" />
                        {foster.neighborhood}, {foster.city}
                      </p>
                    </div>

                    <div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        foster.status === "Disponível"
                          ? "bg-teal-50 text-teal-800 border-teal-200"
                          : foster.status === "Ocupado"
                          ? "bg-purple-50 text-purple-800 border-purple-200 animate-pulse"
                          : "bg-stone-100 text-stone-600 border-stone-200"
                      }`}>
                        {foster.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
