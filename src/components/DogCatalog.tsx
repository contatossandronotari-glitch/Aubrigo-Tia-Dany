import React, { useState, useEffect } from "react";
import { Dog } from "../types";
import { Search, Heart, ShieldCheck, Cake, Weight, CheckCircle2, ChevronRight, X, AlertCircle, Cat, Rabbit, Sparkles, Dog as DogIcon } from "lucide-react";

interface DogCatalogProps {
  onAdoptRequest: (dog: Dog) => void;
}

export default function DogCatalog({ onAdoptRequest }: DogCatalogProps) {
  const [catalogTab, setCatalogTab] = useState<'dogs' | 'cats' | 'exotics' | 'adopted'>('dogs');
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("Todos");
  const [selectedGender, setSelectedGender] = useState<string>("Todos");
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  
  // Adoption form state
  const [adoptionFullName, setAdoptionFullName] = useState("");
  const [adoptionAge, setAdoptionAge] = useState("");
  const [adoptionCpf, setAdoptionCpf] = useState("");
  const [adoptionResidence, setAdoptionResidence] = useState("");
  const [adoptionWhy, setAdoptionWhy] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchCatalogData = async () => {
    try {
      setLoading(true);
      if (catalogTab === "dogs") {
        const response = await fetch("/api/dogs");
        if (response.ok) {
          const data = await response.json();
          setDogs(data);
        }
      } else if (catalogTab === "cats") {
        const response = await fetch("/api/cats");
        if (response.ok) {
          const data = await response.json();
          setDogs(data);
        }
      } else if (catalogTab === "exotics") {
        const response = await fetch("/api/exotics");
        if (response.ok) {
          const data = await response.json();
          setDogs(data);
        }
      } else if (catalogTab === "adopted") {
        const [resDogs, resCats, resExotics] = await Promise.all([
          fetch("/api/dogs"),
          fetch("/api/cats"),
          fetch("/api/exotics")
        ]);
        let combined: any[] = [];
        if (resDogs.ok) {
          const data = await resDogs.json();
          combined = [...combined, ...data.map((d: any) => ({ ...d, speciesLabel: "Cão" }))];
        }
        if (resCats.ok) {
          const data = await resCats.json();
          combined = [...combined, ...data.map((c: any) => ({ ...c, speciesLabel: "Gato" }))];
        }
        if (resExotics.ok) {
          const data = await resExotics.json();
          combined = [...combined, ...data.map((e: any) => ({ ...e, speciesLabel: "Outros" }))];
        }
        setDogs(combined.filter(p => p.status === "Adotado"));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do catálogo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, [catalogTab]);

  useEffect(() => {
    let result = dogs;
    if (catalogTab !== "adopted") {
      result = dogs.filter(dog => dog.status !== "Adotado");
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        dog =>
          dog.name.toLowerCase().includes(term) ||
          dog.breed.toLowerCase().includes(term) ||
          dog.description.toLowerCase().includes(term)
      );
    }

    if (selectedSize !== "Todos") {
      result = result.filter(dog => dog.size === selectedSize);
    }

    if (selectedGender !== "Todos") {
      result = result.filter(dog => dog.gender === selectedGender);
    }

    setFilteredDogs(result);
  }, [searchTerm, selectedSize, selectedGender, dogs, catalogTab]);

  const handleOpenAdoptionForm = (dog: Dog) => {
    setSelectedDog(dog);
    setSubmitSuccess(false);
    setAdoptionFullName("");
    setAdoptionAge("");
    setAdoptionCpf("");
    setAdoptionResidence("");
    setAdoptionWhy("");
  };

  const handleAdoptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDog) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/adoptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petId: selectedDog.id,
          petName: selectedDog.name,
          petSpecies: selectedDog.id.startsWith("cat_") ? "Gato" : (selectedDog.id.startsWith("exotic_") ? "Exótico" : "Cão"),
          fullName: adoptionFullName,
          age: Number(adoptionAge),
          cpf: adoptionCpf,
          residence: adoptionResidence,
          whyAdopt: adoptionWhy
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        fetchCatalogData();
      } else {
        const err = await response.json();
        alert(err.error || "Erro ao enviar solicitação de adoção");
      }
    } catch (error) {
      console.error("Erro ao solicitar adoção:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-4" id="adopt-catalog-view">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3" id="catalog-species-tabs">
        <button
          onClick={() => { setCatalogTab("dogs"); setSearchTerm(""); }}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all cursor-pointer ${
            catalogTab === "dogs"
              ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
              : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
          }`}
        >
          <DogIcon className="h-4 w-4" />
          Cachorros 🐶
        </button>
        <button
          onClick={() => { setCatalogTab("cats"); setSearchTerm(""); }}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all cursor-pointer ${
            catalogTab === "cats"
              ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
              : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
          }`}
        >
          <Cat className="h-4 w-4" />
          Gatos 🐱
        </button>
        <button
          onClick={() => { setCatalogTab("exotics"); setSearchTerm(""); }}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all cursor-pointer ${
            catalogTab === "exotics"
              ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
              : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
          }`}
        >
          <Rabbit className="h-4 w-4" />
          Outros Animais 🐰
        </button>
        <button
          onClick={() => { setCatalogTab("adopted"); setSearchTerm(""); }}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all cursor-pointer md:ml-auto ${
            catalogTab === "adopted"
              ? "bg-teal-600 text-white shadow-sm shadow-teal-500/20"
              : "bg-teal-50/50 border border-teal-100 text-teal-800 hover:text-teal-900 hover:bg-teal-50"
          }`}
        >
          <Sparkles className="h-4 w-4 fill-current" />
          Já Adotados! 🎉
        </button>
      </div>

      {/* Intro and Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-stone-900 font-display">
            {catalogTab === "dogs" && "Nossos Cães Resgatados"}
            {catalogTab === "cats" && "Nossos Gatinhos Resgatados"}
            {catalogTab === "exotics" && "Outros Animais Especiais"}
            {catalogTab === "adopted" && "Finais Felizes e Vidas Salvas"}
          </h2>
          <p className="text-stone-500 text-xs">
            {catalogTab === "dogs" && "Filtre por tamanho ou gênero para encontrar o cãozinho ideal para seu lar."}
            {catalogTab === "cats" && "Filtre para encontrar o companheiro felino que vai encher sua casa de ronrons."}
            {catalogTab === "exotics" && "Nossos coelhos, porquinhos-da-índia e outros pets que aguardam carinho."}
            {catalogTab === "adopted" && "Mural de honra com todos os nossos queridos pets que já encontraram uma família de verdade!"}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              id="dog-search-input"
              placeholder="Buscar por nome ou raça..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none w-full md:w-60 transition-all"
            />
          </div>

          <select
            id="size-filter-select"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all cursor-pointer"
          >
            <option value="Todos">Todos os tamanhos</option>
            <option value="Pequeno">Pequeno</option>
            <option value="Médio">Médio</option>
            <option value="Grande">Grande</option>
          </select>

          <select
            id="gender-filter-select"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all cursor-pointer"
          >
            <option value="Todos">Todos os gêneros</option>
            <option value="Macho">Macho</option>
            <option value="Fêmea">Fêmea</option>
          </select>
        </div>
      </div>

      {/* Grid of Dogs */}
      {loading ? (
        <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl" id="dogs-loading-state">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-stone-500 text-sm mt-4">Carregando focinhos fofos...</p>
        </div>
      ) : filteredDogs.length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl space-y-3" id="dogs-empty-state">
          <AlertCircle className="h-12 w-12 text-stone-300 mx-auto" />
          <p className="text-stone-600 font-medium">Nenhum cãozinho encontrado</p>
          <p className="text-stone-400 text-sm max-w-md mx-auto">
            Experimente mudar os filtros ou o termo de busca para encontrar outros cachorros que estão aguardando adoção.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="dogs-grid">
          {filteredDogs.map((dog) => (
            <div
              key={dog.id}
              id={`dog-card-${dog.id}`}
              className="bg-white border border-stone-200 rounded-3xl overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Photo container */}
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100 border-b border-stone-100">
                  <img
                    src={dog.imageUrl}
                    alt={dog.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback image in case Unsplash fails or URL is broken
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600";
                    }}
                  />
                  {/* Status Tag */}
                  <span
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      dog.status === "Adotado"
                        ? "bg-emerald-500 text-white border border-emerald-600 animate-bounce"
                        : dog.status === "Em Processo"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-teal-100 text-teal-800 border border-teal-200"
                    }`}
                  >
                    {dog.status}
                  </span>
                </div>

                {/* Info Container */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-2xl font-bold text-stone-900 tracking-tight font-display">{dog.name}</h3>
                        {(dog as any).speciesLabel && (
                          <span className="bg-stone-100 text-stone-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {(dog as any).speciesLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-stone-500 text-sm font-medium">{dog.breed}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      dog.gender === "Macho" ? "bg-sky-50 text-sky-700 border border-sky-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {dog.gender}
                    </span>
                  </div>

                  {/* Quick specs */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-stone-100 text-center">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Idade</p>
                      <div className="flex items-center justify-center gap-1 text-xs font-bold text-stone-700">
                        <Cake className="h-3 w-3 text-amber-500" />
                        {dog.age}
                      </div>
                    </div>
                    <div className="space-y-0.5 border-x border-stone-100">
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Porte</p>
                      <p className="text-xs font-bold text-stone-700">{dog.size}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Peso</p>
                      <div className="flex items-center justify-center gap-1 text-xs font-bold text-stone-700">
                        <Weight className="h-3 w-3 text-amber-500" />
                        {dog.weight}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-stone-600 text-sm leading-relaxed line-clamp-3">
                    {dog.description || "Nenhuma descrição informada. Esse pet adora brincar e está muito animado!"}
                  </p>

                  {/* Behavior badges */}
                  {dog.behavior && dog.behavior.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {dog.behavior.map((b, idx) => (
                        <span key={idx} className="bg-stone-100 text-stone-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-6 pt-0 border-t border-stone-50 mt-auto">
                {dog.status === "Adotado" ? (
                  <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-sm border border-emerald-150 shadow-xs">
                    <Sparkles className="h-4 w-4 fill-current text-emerald-600" />
                    Adotado com Sucesso! ❤️
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenAdoptionForm(dog)}
                    id={`dog-adopt-btn-${dog.id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all text-sm cursor-pointer shadow-sm"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                    Quero Conhecer / Adotar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adoption Form & Details Modal */}
      {selectedDog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4" id="adoption-modal">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header image/banner */}
            <div className="relative h-64 sm:h-80 bg-stone-100">
              <img
                src={selectedDog.imageUrl}
                alt={selectedDog.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedDog(null)}
                id="close-modal-btn"
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md backdrop-blur-sm transition-all"
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-md border border-white">
                <h3 className="text-2xl font-bold font-display text-stone-900 leading-none">{selectedDog.name}</h3>
                <span className="text-xs text-stone-500 font-medium">{selectedDog.breed}</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Dog description & details */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-stone-800 text-base mb-2 font-display">Sobre mim</h4>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {selectedDog.description || "Nenhuma descrição detalhada informada. Esse amiguinho está esperando por você!"}
                  </p>
                </div>

                {/* Vaccines */}
                <div>
                  <h4 className="font-bold text-stone-800 text-base mb-2.5 font-display flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Vacinas Aplicadas
                  </h4>
                  {selectedDog.vaccines && selectedDog.vaccines.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDog.vaccines.map((v, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-100">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 fill-current" />
                          {v}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-400 text-xs italic">Nenhuma vacina cadastrada ainda.</p>
                  )}
                </div>

                {/* Dog characteristics */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                  <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Características:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-stone-400 font-medium">Gênero:</span> <span className="font-bold text-stone-700">{selectedDog.gender}</span></div>
                    <div><span className="text-stone-400 font-medium">Porte:</span> <span className="font-bold text-stone-700">{selectedDog.size}</span></div>
                    <div><span className="text-stone-400 font-medium">Idade:</span> <span className="font-bold text-stone-700">{selectedDog.age}</span></div>
                    <div><span className="text-stone-400 font-medium">Peso:</span> <span className="font-bold text-stone-700">{selectedDog.weight}</span></div>
                  </div>
                </div>
              </div>

              {/* Adoption contact form */}
              <div className="border-t md:border-t-0 md:border-l border-stone-100 md:pl-8 pt-6 md:pt-0">
                {submitSuccess ? (
                  <div className="text-center py-8 space-y-4" id="adoption-success-message">
                    <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg text-stone-800">Solicitação Enviada!</h4>
                      <p className="text-sm text-stone-500">
                        Nossos voluntários receberam seu interesse e entrarão em contato por WhatsApp ou E-mail para agendar sua visita ao abrigo!
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedDog(null)}
                      className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-xl text-xs cursor-pointer transition-all w-full"
                    >
                      Entendido, obrigado!
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAdoptionSubmit} className="space-y-4" id="adoption-contact-form">
                    <div>
                      <h4 className="font-bold text-stone-800 text-base mb-1 font-display">Solicitar Interesse</h4>
                      <p className="text-stone-500 text-xs mb-4">
                        Preencha o formulário abaixo. Nossa equipe entrará em contato o mais breve possível para agendar uma visita e conhecer o {selectedDog.name}.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="adopt-name" className="text-xs font-bold text-stone-600 block">Nome completo</label>
                      <input
                        type="text"
                        id="adopt-name"
                        required
                        placeholder="Ex: João Silva da Costa"
                        value={adoptionFullName}
                        onChange={(e) => setAdoptionFullName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="adopt-age" className="text-xs font-bold text-stone-600 block">Idade</label>
                        <input
                          type="number"
                          id="adopt-age"
                          required
                          min="18"
                          max="120"
                          placeholder="Ex: 28"
                          value={adoptionAge}
                          onChange={(e) => setAdoptionAge(e.target.value)}
                          className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="adopt-cpf" className="text-xs font-bold text-stone-600 block">CPF</label>
                        <input
                          type="text"
                          id="adopt-cpf"
                          required
                          placeholder="Ex: 000.000.000-00"
                          value={adoptionCpf}
                          onChange={(e) => setAdoptionCpf(e.target.value)}
                          className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="adopt-residence" className="text-xs font-bold text-stone-600 block">Residência</label>
                      <input
                        type="text"
                        id="adopt-residence"
                        required
                        placeholder="Rua, Número, Bairro, Cidade - Estado"
                        value={adoptionResidence}
                        onChange={(e) => setAdoptionResidence(e.target.value)}
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="adopt-why" className="text-xs font-bold text-stone-600 block">Porque quer adotar</label>
                      <textarea
                        id="adopt-why"
                        rows={3}
                        required
                        placeholder="Conte-nos por que você quer adotar este amiguinho..."
                        value={adoptionWhy}
                        onChange={(e) => setAdoptionWhy(e.target.value)}
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Solicitação de Adoção"}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
