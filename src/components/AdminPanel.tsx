import React, { useState, useEffect } from "react";
import { Dog, Volunteer, Donation, DashboardStats, DogSize, DogGender, DogStatus, VolunteerStatus, DonationPurpose, Bill, AdminUser, AdoptionRequest, FosterHome } from "../types";
import { Plus, Trash2, Edit, Check, X, Shield, Sparkles, Upload, FileText, Calendar, DollarSign, UserCheck, Heart, Info, Eye, Image as ImageIcon, Cat, Rabbit, Lock, LogOut, Tag, ShieldCheck, Users, TrendingUp, Key } from "lucide-react";

export default function AdminPanel() {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem("admin_logged_in") === "true";
  });
  const [currentUserLevel, setCurrentUserLevel] = useState<number | null>(() => {
    const val = sessionStorage.getItem("admin_level");
    return val ? Number(val) : null;
  });
  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    return sessionStorage.getItem("admin_name") || "";
  });

  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Navigation tabs within Admin Panel
  const [adminTab, setAdminTab] = useState<"stats" | "dogs" | "volunteers" | "donations" | "bills" | "adoptions" | "users" | "foster">("dogs");

  // Pet List Filters
  const [speciesFilter, setSpeciesFilter] = useState<"all" | "dog" | "cat" | "exotic">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Disponível" | "Em Processo" | "Adotado">("all");

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allPets, setAllPets] = useState<any[]>([]); // Combined list of dogs, cats, exotics
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [adoptions, setAdoptions] = useState<AdoptionRequest[]>([]);
  const [fosterHomes, setFosterHomes] = useState<FosterHome[]>([]);
  const [loading, setLoading] = useState(true);

  // User form states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userError, setUserError] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserLevel, setNewUserLevel] = useState<number>(1);

  // Adoption term/agreement preview state
  const [selectedAdoptionForTerm, setSelectedAdoptionForTerm] = useState<AdoptionRequest | null>(null);

  // Pet Form states (Insert / Update)
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<any | null>(null);
  
  const [petFormType, setPetFormType] = useState<"Cão" | "Gato" | "Exótico">("Cão");
  const [petName, setPetName] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petSize, setPetSize] = useState<DogSize>("Médio");
  const [petGender, setPetGender] = useState<DogGender>("Macho");
  const [petDescription, setPetDescription] = useState("");
  const [petVaccineInput, setPetVaccineInput] = useState("");
  const [petVaccines, setPetVaccines] = useState<string[]>([]);
  const [petStatus, setPetStatus] = useState<DogStatus>("Disponível");
  const [petImageUrl, setPetImageUrl] = useState("");
  const [petBehaviorInput, setPetBehaviorInput] = useState("");
  const [petBehavior, setPetBehavior] = useState<string[]>([]);
  const [petWeight, setPetWeight] = useState("");

  // Bill Form states
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [billDesc, setBillDesc] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDueDate, setBillDueDate] = useState("");
  const [billCategory, setBillCategory] = useState("Alimentação");
  const [billStatus, setBillStatus] = useState<"Pendente" | "Pago">("Pendente");

  // Base64 file state for Gemini analysis
  const [imageBase64, setImageBase64] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState("");

  // Handle credentials login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setIsLoggedIn(true);
          const level = Number(data.user.level);
          setCurrentUserLevel(level);
          setCurrentUserName(data.user.name);
          sessionStorage.setItem("admin_logged_in", "true");
          sessionStorage.setItem("admin_level", String(level));
          sessionStorage.setItem("admin_name", data.user.name);
          
          if (level >= 3) {
            setAdminTab("stats");
          } else {
            setAdminTab("dogs");
          }
          setLoginError("");
        }
      } else {
        const err = await response.json();
        setLoginError(err.error || "Credenciais inválidas. Verifique o usuário e senha.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Erro ao conectar com o servidor.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserLevel(null);
    setCurrentUserName("");
    sessionStorage.removeItem("admin_logged_in");
    sessionStorage.removeItem("admin_level");
    sessionStorage.removeItem("admin_name");
    setUsernameInput("");
    setPasswordInput("");
  };

  // Pre-fill helper for ease of use
  const handleQuickLogin = (user: string, pass: string) => {
    setUsernameInput(user);
    setPasswordInput(pass);
    setLoginError("");
  };

  // Load all admin collections
  const loadAdminData = async () => {
    if (!isLoggedIn || currentUserLevel === null) return;
    try {
      setLoading(true);
      const level = currentUserLevel;

      // 1. Pets (dogs, cats, exotics) are fetched by all levels
      const [resDogs, resCats, resExotics] = await Promise.all([
        fetch("/api/dogs"),
        fetch("/api/cats"),
        fetch("/api/exotics")
      ]);

      let merged: any[] = [];
      if (resDogs.ok) {
        const dogsData = await resDogs.json();
        merged = [...merged, ...dogsData.map((d: any) => ({ ...d, speciesType: "dog" as const }))];
      }
      if (resCats.ok) {
        const catsData = await resCats.json();
        merged = [...merged, ...catsData.map((c: any) => ({ ...c, speciesType: "cat" as const }))];
      }
      if (resExotics.ok) {
        const exoticsData = await resExotics.json();
        merged = [...merged, ...exoticsData.map((e: any) => ({ ...e, speciesType: "exotic" as const }))];
      }
      merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setAllPets(merged);

      // 2. Stats & Bills (Level 3 and 4)
      if (level >= 3) {
        const [resStats, resBills] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/bills")
        ]);
        if (resStats.ok) setStats(await resStats.json());
        if (resBills.ok) setBills(await resBills.json());
      }

      // 3. Adoptions & Foster Homes (Level 1, 2, 3 and 4)
      if (level >= 1) {
        const [resAdoptions, resFoster] = await Promise.all([
          fetch("/api/adoptions"),
          fetch("/api/foster-homes")
        ]);
        if (resAdoptions.ok) setAdoptions(await resAdoptions.json());
        if (resFoster.ok) setFosterHomes(await resFoster.json());
      }

      // 4. Users, Volunteers, Donations (Level 4 only)
      if (level === 4) {
        const [resVolunteers, resDonations, resUsers] = await Promise.all([
          fetch("/api/volunteers"),
          fetch("/api/donations"),
          fetch("/api/users")
        ]);
        if (resVolunteers.ok) setVolunteers(await resVolunteers.json());
        if (resDonations.ok) setDonations(await resDonations.json());
        if (resUsers.ok) setUsers(await resUsers.json());
      }

    } catch (error) {
      console.error("Erro ao carregar dados administrativos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadAdminData();
    }
  }, [isLoggedIn]);

  // ==========================================
  // ADOPTION REQUESTS & TERM GENERATION HANDLERS
  // ==========================================
  const handleUpdateAdoptionStatus = async (id: string, status: "Aprovado" | "Rejeitado") => {
    try {
      const response = await fetch(`/api/adoptions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        loadAdminData();
      } else {
        const err = await response.json();
        alert(err.error || "Erro ao atualizar solicitação");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao atualizar status.");
    }
  };

  const handleDeleteAdoption = async (id: string) => {
    if (!confirm("Deseja realmente remover este registro de adoção?")) return;
    try {
      const response = await fetch(`/api/adoptions/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        loadAdminData();
      } else {
        alert("Erro ao remover registro.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // USER LEVEL-MANAGEMENT HANDLERS
  // ==========================================
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError("");
    if (!newUserName.trim() || !newUserUsername.trim() || !newUserPassword.trim()) {
      setUserError("Todos os campos são obrigatórios.");
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: newUserUsername.trim(),
          password: newUserPassword,
          name: newUserName.trim(),
          level: Number(newUserLevel)
        })
      });

      if (response.ok) {
        setIsUserModalOpen(false);
        setNewUserName("");
        setNewUserUsername("");
        setNewUserPassword("");
        setNewUserLevel(1);
        loadAdminData();
      } else {
        const err = await response.json();
        setUserError(err.error || "Erro ao criar usuário.");
      }
    } catch (err) {
      console.error(err);
      setUserError("Erro de conexão.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        loadAdminData();
      } else {
        const err = await response.json();
        alert(err.error || "Erro ao excluir usuário.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle image upload and base64 parsing
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageBase64(base64);
        setPetImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Gemini AI analysis to generate a beautiful profile based on image / basic info
  const handleAnalyzeWithGemini = async () => {
    if (!imageBase64 && !petName) {
      setAiError(`Por favor, anexe uma foto ou digite o nome do(a) ${petFormType.toLowerCase()} para ajudar a IA do Gemini a criar um perfil.`);
      return;
    }
    setAiError("");
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/gemini/analyze-dog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: imageBase64 || null,
          name: petName,
          breedInput: petBreed,
          sizeInput: petSize,
          genderInput: petGender,
          species: petFormType,
        }),
      });

      if (response.ok) {
        const aiData = await response.json();
        if (aiData.breed) setPetBreed(aiData.breed);
        if (aiData.age) setPetAge(aiData.age);
        if (aiData.weight) setPetWeight(aiData.weight);
        if (aiData.description) setPetDescription(aiData.description);
        if (aiData.vaccines) setPetVaccines(aiData.vaccines);
        if (aiData.behavior) setPetBehavior(aiData.behavior);
      } else {
        const errorText = await response.text();
        setAiError("Ocorreu um erro ao chamar o Gemini: " + errorText);
      }
    } catch (err: any) {
      console.error(err);
      setAiError("Erro ao processar inteligência artificial: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Open modal for inserting or editing pet
  const handleOpenPetModal = (pet: any | null = null) => {
    if (pet) {
      setEditingPet(pet);
      setPetName(pet.name);
      setPetBreed(pet.breed);
      setPetAge(pet.age);
      setPetSize(pet.size);
      setPetGender(pet.gender);
      setPetDescription(pet.description);
      setPetVaccines(pet.vaccines || []);
      setPetStatus(pet.status);
      setPetImageUrl(pet.imageUrl);
      setPetBehavior(pet.behavior || []);
      setPetWeight(pet.weight || "");
      setImageBase64("");

      if (pet.speciesType === "cat") setPetFormType("Gato");
      else if (pet.speciesType === "exotic") setPetFormType("Exótico");
      else setPetFormType("Cão");
    } else {
      setEditingPet(null);
      setPetName("");
      setPetBreed("");
      setPetAge("");
      setPetSize("Médio");
      setPetGender("Macho");
      setPetDescription("");
      setPetVaccines(petFormType === "Cão" ? ["V10 Polivalente", "Antirrábica"] : petFormType === "Gato" ? ["Quádrupla Felina", "Antirrábica"] : ["Vermifugação"]);
      setPetStatus("Disponível");
      setPetImageUrl(
        petFormType === "Cão"
          ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600"
          : petFormType === "Gato"
          ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600"
          : "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600"
      );
      setPetBehavior(["Dócil", "Carinhoso"]);
      setPetWeight("");
      setImageBase64("");
    }
    setAiError("");
    setIsPetModalOpen(true);
  };

  // Save pet (Insert/Update)
  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: petName,
      breed: petBreed || "S.R.D.",
      age: petAge || "Idade não informada",
      size: petSize,
      gender: petGender,
      description: petDescription,
      vaccines: petVaccines,
      status: petStatus,
      imageUrl: petImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
      behavior: petBehavior,
      weight: petWeight || "N/A"
    };

    // Determine correct endpoint based on petFormType
    let endpoint = "/api/dogs";
    if (petFormType === "Gato") endpoint = "/api/cats";
    else if (petFormType === "Exótico") endpoint = "/api/exotics";

    try {
      let response;
      if (editingPet) {
        // If editing, use correct species endpoint based on the existing ID prefix
        let editEndpoint = `/api/dogs/${editingPet.id}`;
        if (editingPet.id.startsWith("cat_")) editEndpoint = `/api/cats/${editingPet.id}`;
        else if (editingPet.id.startsWith("exotic_")) editEndpoint = `/api/exotics/${editingPet.id}`;

        response = await fetch(editEndpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        setIsPetModalOpen(false);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Action: Signal Adopted / "Tirar o cadastro / Sinalizar que foi adotado"
  const handleQuickAdopt = async (pet: any) => {
    let endpoint = `/api/dogs/${pet.id}`;
    if (pet.id.startsWith("cat_")) endpoint = `/api/cats/${pet.id}`;
    else if (pet.id.startsWith("exotic_")) endpoint = `/api/exotics/${pet.id}`;

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Adotado" }),
      });

      if (response.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Pet
  const handleDeletePet = async (pet: any) => {
    if (!window.confirm(`Deseja realmente remover o(a) pet ${pet.name} do abrigo?`)) return;

    let endpoint = `/api/dogs/${pet.id}`;
    if (pet.id.startsWith("cat_")) endpoint = `/api/cats/${pet.id}`;
    else if (pet.id.startsWith("exotic_")) endpoint = `/api/exotics/${pet.id}`;

    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        loadAdminData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Volunteer Approvals (Admin/Total roles only)
  const handleUpdateVolunteerStatus = async (id: string, status: VolunteerStatus) => {
    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) loadAdminData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteVolunteer = async (id: string) => {
    if (!window.confirm("Remover este voluntário permanentemente?")) return;
    try {
      const res = await fetch(`/api/volunteers/${id}`, { method: "DELETE" });
      if (res.ok) loadAdminData();
    } catch (error) {
      console.error(error);
    }
  };

  // Bills CRUD Handlers (Only available for Tia Dany - "total" role)
  const handleOpenBillModal = (bill: Bill | null = null) => {
    if (bill) {
      setEditingBill(bill);
      setBillDesc(bill.description);
      setBillAmount(bill.amount.toString());
      setBillDueDate(bill.dueDate);
      setBillCategory(bill.category);
      setBillStatus(bill.status);
    } else {
      setEditingBill(null);
      setBillDesc("");
      setBillAmount("");
      setBillDueDate(new Date().toISOString().split("T")[0]);
      setBillCategory("Alimentação");
      setBillStatus("Pendente");
    }
    setIsBillModalOpen(true);
  };

  const handleSaveBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      description: billDesc,
      amount: Number(billAmount),
      dueDate: billDueDate,
      category: billCategory,
      status: billStatus,
    };

    try {
      let response;
      if (editingBill) {
        response = await fetch(`/api/bills/${editingBill.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/bills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        setIsBillModalOpen(false);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickPayBill = async (billId: string) => {
    try {
      const res = await fetch(`/api/bills/${billId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Pago" }),
      });
      if (res.ok) loadAdminData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (!window.confirm("Deseja realmente remover esta conta a pagar?")) return;
    try {
      const res = await fetch(`/api/bills/${billId}`, { method: "DELETE" });
      if (res.ok) loadAdminData();
    } catch (error) {
      console.error(error);
    }
  };

  // Add behavioral/vaccines tags helper
  const handleAddVaccine = () => {
    if (petVaccineInput.trim() && !petVaccines.includes(petVaccineInput.trim())) {
      setPetVaccines([...petVaccines, petVaccineInput.trim()]);
      setPetVaccineInput("");
    }
  };
  const handleRemoveVaccine = (val: string) => {
    setPetVaccines(petVaccines.filter(v => v !== val));
  };

  const handleAddBehavior = () => {
    if (petBehaviorInput.trim() && !petBehavior.includes(petBehaviorInput.trim())) {
      setPetBehavior([...petBehavior, petBehaviorInput.trim()]);
      setPetBehaviorInput("");
    }
  };
  const handleRemoveBehavior = (val: string) => {
    setPetBehavior(petBehavior.filter(b => b !== val));
  };

  // Filter combined pet array
  const filteredPets = allPets.filter((pet) => {
    const matchesSpecies =
      speciesFilter === "all" ||
      (speciesFilter === "dog" && pet.speciesType === "dog") ||
      (speciesFilter === "cat" && pet.speciesType === "cat") ||
      (speciesFilter === "exotic" && pet.speciesType === "exotic");

    const matchesStatus = statusFilter === "all" || pet.status === statusFilter;
    return matchesSpecies && matchesStatus;
  });

  // ==========================================
  // 1. RENDER LOGIN SCREEN (IF NOT LOGGED IN)
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-stone-200 rounded-3xl p-8 shadow-xl relative overflow-hidden" id="admin-login-screen">
        {/* Visual Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-amber-500"></div>

        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 font-display">Portal Administrativo</h2>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Acesse para gerenciar cadastros de animais, aprovar voluntários e acompanhar a contabilidade.
          </p>
        </div>

        {loginError && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="login-username" className="text-xs font-bold text-stone-600 uppercase block tracking-wider">Usuário</label>
            <input
              type="text"
              id="login-username"
              required
              placeholder="Digite o seu usuário"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="login-password" className="text-xs font-bold text-stone-600 uppercase block tracking-wider">Senha</label>
            <input
              type="password"
              id="login-password"
              required
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-amber-500/10 transition-colors cursor-pointer"
          >
            Entrar no Painel
          </button>
        </form>
      </div>
    );
  }

  // ==========================================
  // 2. RENDER ACTIVE ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="space-y-8 py-4" id="admin-view">
      {/* Session Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500 rounded-lg text-white">
              <Shield className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-extrabold text-stone-900 font-display">Aubrigo &mdash; Painel</h2>
          </div>
          <p className="text-xs text-stone-500">
            Logado como: <strong className="text-amber-600 font-bold">{currentUserName}</strong>
          </p>
        </div>

        {/* Dynamic Navigation Tabs based on Level */}
        <div className="flex flex-wrap gap-1 bg-stone-100 p-1.5 rounded-2xl w-full md:w-auto" id="admin-tabs">
          {currentUserLevel !== null && currentUserLevel >= 3 && (
            <button
              onClick={() => setAdminTab("stats")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                adminTab === "stats" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Métricas
            </button>
          )}

          <button
            onClick={() => setAdminTab("dogs")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === "dogs" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Animais / Pets
          </button>

          {currentUserLevel !== null && currentUserLevel >= 1 && (
            <>
              <button
                onClick={() => setAdminTab("adoptions")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  adminTab === "adoptions" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Solicitações de Adoção
              </button>
              <button
                onClick={() => setAdminTab("foster")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  adminTab === "foster" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Lares Temporários
              </button>
            </>
          )}

          {currentUserLevel !== null && currentUserLevel === 4 && (
            <>
              <button
                onClick={() => setAdminTab("volunteers")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  adminTab === "volunteers" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Voluntários
              </button>
              <button
                onClick={() => setAdminTab("donations")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  adminTab === "donations" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Doações
              </button>
              <button
                onClick={() => setAdminTab("users")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 bg-stone-200 hover:bg-stone-300 ${
                  adminTab === "users" ? "bg-stone-800 text-white shadow-sm" : "text-stone-700"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Usuários (Níveis)
              </button>
            </>
          )}

          {currentUserLevel !== null && currentUserLevel >= 3 && (
            <button
              onClick={() => setAdminTab("bills")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminTab === "bills" ? "bg-rose-500 text-white shadow-sm shadow-rose-500/10" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              Contas a Pagar
            </button>
          )}

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            className="ml-auto px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer flex items-center gap-1.5"
            title="Sair do Painel"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl" id="admin-loading-state">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-stone-500 text-sm mt-4">Sincronizando registros do Aubrigo...</p>
        </div>
      ) : (
        <>
          {/* ==========================================
              STATS VIEW (Level 3+)
             ========================================== */}
          {adminTab === "stats" && currentUserLevel !== null && currentUserLevel >= 3 && stats && (
            <div className="space-y-8" id="admin-stats-tab">
              {/* Stat Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Cães no Abrigo</span>
                      <span className="text-2xl font-extrabold text-stone-800 font-display mt-1 block">{stats.totalDogs}</span>
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                      <Heart className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-t border-stone-50 flex items-center justify-between text-[10px]">
                    <span className="text-teal-600 font-semibold bg-teal-50 px-1.5 py-0.5 rounded-full">
                      {stats.availableDogs} Disponíveis
                    </span>
                    <span className="text-stone-400 font-medium">{stats.adoptedDogs} Adotados</span>
                  </div>
                </div>

                <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Gatos no Abrigo</span>
                      <span className="text-2xl font-extrabold text-stone-800 font-display mt-1 block">{stats.totalCats}</span>
                    </div>
                    <div className="p-2 bg-teal-50 text-teal-600 rounded-lg border border-teal-100">
                      <Cat className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-t border-stone-50 flex items-center justify-between text-[10px]">
                    <span className="text-teal-600 font-semibold bg-teal-50 px-1.5 py-0.5 rounded-full">
                      {stats.availableCats} Disponíveis
                    </span>
                    <span className="text-stone-400 font-medium">{stats.adoptedCats} Adotados</span>
                  </div>
                </div>

                <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Exóticos no Abrigo</span>
                      <span className="text-2xl font-extrabold text-stone-800 font-display mt-1 block">{stats.totalExotics}</span>
                    </div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
                      <Rabbit className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-t border-stone-50 flex items-center justify-between text-[10px]">
                    <span className="text-teal-600 font-semibold bg-teal-50 px-1.5 py-0.5 rounded-full">
                      {stats.availableExotics} Disponíveis
                    </span>
                    <span className="text-stone-400 font-medium">{stats.adoptedExotics} Adotados</span>
                  </div>
                </div>

                <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Lares Formados</span>
                      <span className="text-2xl font-extrabold text-stone-800 font-display mt-1 block text-rose-500">
                        {stats.adoptedDogs + stats.adoptedCats + stats.adoptedExotics}
                      </span>
                    </div>
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
                      <Check className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-t border-stone-50">
                    <span className="text-[10px] text-stone-400 font-medium block">Total de animais adotados 🎉</span>
                  </div>
                </div>

                <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Voluntários</span>
                      <span className="text-2xl font-extrabold text-stone-800 font-display mt-1 block">{stats.totalVolunteers}</span>
                    </div>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                      <UserCheck className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-t border-stone-50">
                    {stats.pendingVolunteers > 0 ? (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full inline-block font-semibold">
                        {stats.pendingVolunteers} Novos Pendentes
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400 font-medium block">Todos aprovados</span>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Doações Arrecadadas</span>
                      <span className="text-lg font-extrabold text-emerald-600 font-display mt-1 block">R$ {stats.totalDonationsAmount.toLocaleString()}</span>
                    </div>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-t border-stone-50">
                    <span className="text-[10px] text-stone-400 font-medium block">Mantém o abrigo operando</span>
                  </div>
                </div>
              </div>

              {/* Financial Box / Gemini Promotion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Financial Summary */}
                <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                    <h3 className="font-bold text-stone-800 font-display text-base">Controle do Orçamento (Arrecadado vs. Contas)</h3>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-emerald-800 font-bold block uppercase">Arrecadado</span>
                        <span className="text-sm font-extrabold text-emerald-700 font-mono">R$ {stats.totalDonationsAmount.toLocaleString()}</span>
                      </div>
                      <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                        <span className="text-[10px] text-rose-800 font-bold block uppercase">Total Contas</span>
                        <span className="text-sm font-extrabold text-rose-700 font-mono">R$ {stats.totalBillsAmount.toLocaleString()}</span>
                      </div>
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                        <span className="text-[10px] text-stone-600 font-bold block uppercase">Saldo</span>
                        <span className={`text-sm font-extrabold font-mono ${stats.totalDonationsAmount - stats.totalBillsAmount >= 0 ? "text-teal-600" : "text-rose-600"}`}>
                          R$ {(stats.totalDonationsAmount - stats.totalBillsAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-stone-600 font-medium">
                        <span>Contas Pagas:</span>
                        <span className="text-teal-600 font-bold">R$ {stats.paidBillsAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-stone-600 font-medium">
                        <span>Contas Pendentes / A Vencer:</span>
                        <span className="text-rose-600 font-bold">R$ {stats.pendingBillsAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-900 text-white rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
                      IA Assistente Multi-Espécie
                    </div>
                    <h3 className="font-bold font-display text-lg">Gere Perfis de Cães, Gatos e Exóticos!</h3>
                    <p className="text-stone-300 text-xs leading-relaxed">
                      Utilize a tecnologia do Gemini para criar carteiras de vacinação recomendadas, histórias marcantes e descrições personalizadas para adoção. O sistema agora compreende as peculiaridades de cada espécie!
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                    <span>Alimentado por Gemini 3.5 Flash</span>
                    <Sparkles className="h-4 w-4 text-amber-400 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              PETS / ANIMAIS TAB (ALL ROLES)
             ========================================== */}
          {adminTab === "dogs" && (
            <div className="space-y-6" id="admin-dogs-tab">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-stone-800 text-lg font-display">Controle de Animais Hospedados</h3>
                  <p className="text-xs text-stone-500">
                    Gerencie o status de cães, gatos e outros animais sob a proteção do Aubrigo.
                  </p>
                </div>
                
                <button
                  onClick={() => handleOpenPetModal()}
                  id="admin-add-dog-btn"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Cadastrar Novo Pet
                </button>
              </div>

              {/* Filters Panel */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-stone-200 rounded-2xl shadow-sm">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider self-center mr-1">Filtrar Espécie:</span>
                  <button
                    onClick={() => setSpeciesFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      speciesFilter === "all" ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Todos ({allPets.length})
                  </button>
                  <button
                    onClick={() => setSpeciesFilter("dog")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      speciesFilter === "dog" ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    🐶 Cães ({allPets.filter(p => p.speciesType === "dog").length})
                  </button>
                  <button
                    onClick={() => setSpeciesFilter("cat")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      speciesFilter === "cat" ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    🐱 Gatos ({allPets.filter(p => p.speciesType === "cat").length})
                  </button>
                  <button
                    onClick={() => setSpeciesFilter("exotic")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      speciesFilter === "exotic" ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    🐰 Exóticos ({allPets.filter(p => p.speciesType === "exotic").length})
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider self-center mr-1">Status:</span>
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      statusFilter === "all" ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Todos os Status
                  </button>
                  <button
                    onClick={() => setStatusFilter("Disponível")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      statusFilter === "Disponível" ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Disponíveis
                  </button>
                  <button
                    onClick={() => setStatusFilter("Em Processo")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      statusFilter === "Em Processo" ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Em Processo
                  </button>
                  <button
                    onClick={() => setStatusFilter("Adotado")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      statusFilter === "Adotado" ? "bg-stone-400 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Adotados
                  </button>
                </div>
              </div>

              {/* Pets Table */}
              <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-xs text-stone-400 uppercase font-bold">
                        <th className="p-4 pl-6">Foto e Nome</th>
                        <th className="p-4">Espécie / Raça</th>
                        <th className="p-4">Especificações</th>
                        <th className="p-4">Vacinação</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-sm text-stone-600">
                      {filteredPets.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-stone-400 italic">
                            Nenhum animal cadastrado corresponde aos filtros ativos.
                          </td>
                        </tr>
                      ) : (
                        filteredPets.map((pet) => (
                          <tr key={pet.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="flex items-center gap-3">
                                <img
                                  src={pet.imageUrl}
                                  alt={pet.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <p className="font-bold text-stone-900">{pet.name}</p>
                                  <p className="text-xs text-stone-400">ID: {pet.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  pet.speciesType === "dog"
                                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                                    : pet.speciesType === "cat"
                                    ? "bg-teal-50 text-teal-800 border border-teal-200"
                                    : "bg-purple-50 text-purple-800 border border-purple-200"
                                }`}>
                                  {pet.speciesType === "dog" ? "🐶 Cão" : pet.speciesType === "cat" ? "🐱 Gato" : "🐰 Exótico"}
                                </span>
                                <p className="text-xs text-stone-600 font-medium">{pet.breed}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-0.5 text-xs">
                                <p><span className="text-stone-400">Gênero:</span> <span className="font-semibold text-stone-700">{pet.gender}</span></p>
                                <p><span className="text-stone-400">Porte:</span> <span className="font-semibold text-stone-700">{pet.size}</span></p>
                                <p><span className="text-stone-400">Idade/Peso:</span> <span className="font-semibold text-stone-700">{pet.age} {pet.weight && `/ ${pet.weight}`}</span></p>
                              </div>
                            </td>
                            <td className="p-4 max-w-xs">
                              <div className="flex flex-wrap gap-1">
                                {pet.vaccines && pet.vaccines.length > 0 ? (
                                  pet.vaccines.map((v: string, idx: number) => (
                                    <span key={idx} className="bg-stone-100 text-stone-600 text-[9px] font-semibold px-1.5 py-0.5 rounded">
                                      {v}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-stone-400 italic">Isento / Sem vacinas</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                pet.status === "Disponível"
                                  ? "bg-teal-50 text-teal-800 border-teal-200"
                                  : pet.status === "Em Processo"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-stone-100 text-stone-500 border-stone-200"
                              }`}>
                                {pet.status}
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex justify-end gap-1.5">
                                {/* Direct click-to-adopt action: "Sinalizar Adotado" */}
                                {pet.status !== "Adotado" && (
                                  <button
                                    onClick={() => handleQuickAdopt(pet)}
                                    className="px-2 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                    title="Sinalizar que o animal foi adotado!"
                                  >
                                    🎉 Adotado!
                                  </button>
                                )}

                                {currentUserLevel !== null && currentUserLevel >= 2 && (
                                  <button
                                    onClick={() => handleOpenPetModal(pet)}
                                    className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 transition-colors cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                )}

                                {currentUserLevel !== null && currentUserLevel === 4 && (
                                  <button
                                    onClick={() => handleDeletePet(pet)}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 transition-colors cursor-pointer"
                                    title="Excluir do Abrigo"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              VOLUNTEERS TAB (LEVEL 4 ONLY)
             ========================================== */}
          {adminTab === "volunteers" && currentUserLevel !== null && currentUserLevel === 4 && (
            <div className="space-y-6" id="admin-volunteers-tab">
              <h3 className="font-bold text-stone-800 text-lg font-display">Gerenciar Cadastro de Voluntários</h3>

              <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-xs text-stone-400 uppercase font-bold">
                        <th className="p-4 pl-6">Nome Completo</th>
                        <th className="p-4">E-mail / WhatsApp</th>
                        <th className="p-4">Áreas de Interesse</th>
                        <th className="p-4">Disponibilidade</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-sm text-stone-600">
                      {volunteers.map((vol) => (
                        <tr key={vol.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-stone-900">{vol.name}</td>
                          <td className="p-4">
                            <p className="text-stone-700">{vol.email}</p>
                            <p className="text-xs text-stone-400">{vol.phone}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {vol.areas && vol.areas.map((area, idx) => (
                                <span key={idx} className="bg-teal-50 text-teal-800 border border-teal-100 text-[10px] font-semibold px-2 py-0.5 rounded">
                                  {area}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-xs font-medium text-stone-700">{vol.availability}</td>
                          <td className="p-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              vol.status === "Aprovado"
                                ? "bg-teal-50 text-teal-800 border-teal-200"
                                : vol.status === "Rejeitado"
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}>
                              {vol.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex justify-end gap-1.5">
                              {vol.status === "Pendente" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateVolunteerStatus(vol.id, "Aprovado")}
                                    className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-600 transition-colors cursor-pointer"
                                    title="Aprovar Voluntário"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateVolunteerStatus(vol.id, "Rejeitado")}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition-colors cursor-pointer"
                                    title="Rejeitar Solicitação"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteVolunteer(vol.id)}
                                className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 transition-colors cursor-pointer"
                                title="Remover Voluntário"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              DONATIONS TAB (LEVEL 4 ONLY)
             ========================================== */}
          {adminTab === "donations" && currentUserLevel !== null && currentUserLevel === 4 && (
            <div className="space-y-6" id="admin-donations-tab">
              <h3 className="font-bold text-stone-800 text-lg font-display">Histórico de Apoio Financeiro</h3>

              <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-xs text-stone-400 uppercase font-bold">
                        <th className="p-4 pl-6">Doador</th>
                        <th className="p-4">Finalidade</th>
                        <th className="p-4">Método</th>
                        <th className="p-4">Mensagem de Apoio</th>
                        <th className="p-4">Data</th>
                        <th className="p-4 pr-6 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-sm text-stone-600">
                      {donations.map((don) => (
                        <tr key={don.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="p-4 pl-6">
                            <p className="font-bold text-stone-900">{don.donorName}</p>
                            <p className="text-xs text-stone-400">{don.email}</p>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                              don.purpose === "Medicamentos"
                                ? "bg-rose-50 text-rose-800 border border-rose-100"
                                : don.purpose === "Manutenção do Abrigo"
                                ? "bg-amber-50 text-amber-800 border border-amber-100"
                                : "bg-teal-50 text-teal-800 border border-teal-100"
                            }`}>
                              {don.purpose}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-semibold text-stone-700">{don.paymentMethod}</td>
                          <td className="p-4 text-xs italic text-stone-500 max-w-xs truncate" title={don.message}>
                            {don.message || "—"}
                          </td>
                          <td className="p-4 text-xs text-stone-400">
                            {new Date(don.date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-4 pr-6 text-right font-extrabold text-stone-900">
                            R$ {don.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              BILLS / CONTAS A PAGAR TAB (LEVEL 3+)
             ========================================== */}
          {adminTab === "bills" && currentUserLevel !== null && currentUserLevel >= 3 && (
            <div className="space-y-6" id="admin-bills-tab">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-stone-800 text-lg font-display">Controle de Contas a Pagar (Despesas do Aubrigo)</h3>
                  <p className="text-xs text-stone-500">
                    Cadastre despesas, acompanhe os vencimentos e realize a conciliação financeira do abrigo.
                  </p>
                </div>
                
                <button
                  onClick={() => handleOpenBillModal()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Cadastrar Nova Conta
                </button>
              </div>

              {/* Bills List */}
              <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-xs text-stone-400 uppercase font-bold">
                        <th className="p-4 pl-6">Descrição da Despesa</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4">Data de Vencimento</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Valor</th>
                        <th className="p-4 pr-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-sm text-stone-600">
                      {bills.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-stone-400 italic">
                            Nenhuma conta a pagar cadastrada até o momento.
                          </td>
                        </tr>
                      ) : (
                        bills.map((bill) => (
                          <tr key={bill.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-4 pl-6 font-bold text-stone-900">{bill.description}</td>
                            <td className="p-4">
                              <span className="bg-stone-100 text-stone-700 text-xs px-2.5 py-1 rounded-lg border border-stone-200">
                                {bill.category}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-mono font-medium text-stone-600">
                              {new Date(bill.dueDate + "T12:00:00").toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                bill.status === "Pago"
                                  ? "bg-teal-50 text-teal-800 border-teal-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200 animate-pulse"
                              }`}>
                                {bill.status}
                              </span>
                            </td>
                            <td className="p-4 text-right font-extrabold text-stone-900">
                              R$ {bill.amount.toLocaleString()}
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex justify-end gap-1.5">
                                {bill.status === "Pendente" && (
                                  <button
                                    onClick={() => handleQuickPayBill(bill.id)}
                                    className="px-2 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                    title="Marcar conta como paga"
                                  >
                                    ✓ Marcar Pago
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenBillModal(bill)}
                                  className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 transition-colors cursor-pointer"
                                  title="Editar Despesa"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBill(bill.id)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 transition-colors cursor-pointer"
                                  title="Remover Despesa"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              ADOPTIONS TAB (LEVEL 1+)
             ========================================== */}
          {adminTab === "adoptions" && (
            <div className="space-y-6" id="admin-adoptions-tab">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-stone-800 text-lg font-display">Solicitações de Adoção Recebidas</h3>
                  <p className="text-xs text-stone-500">
                    Acompanhe e analise as propostas de adoção preenchidas pelos interessados no catálogo de animais.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-xs text-stone-400 uppercase font-bold">
                        <th className="p-4 pl-6">Interessado</th>
                        <th className="p-4">Contato / CPF</th>
                        <th className="p-4">Residência</th>
                        <th className="p-4">Animal Escolhido</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-sm text-stone-600">
                      {adoptions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-stone-400 italic">
                            Nenhuma solicitação de adoção registrada no momento.
                          </td>
                        </tr>
                      ) : (
                        adoptions.map((adop) => (
                          <tr key={adop.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-4 pl-6">
                              <p className="font-bold text-stone-900">{adop.fullName}</p>
                              <p className="text-xs text-stone-400">Idade: {adop.age} anos</p>
                            </td>
                            <td className="p-4">
                              <p className="text-stone-700 font-mono text-xs">CPF: {adop.cpf}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-xs text-stone-500 max-w-xs">{adop.residence}</p>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex px-2 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-100">
                                {adop.petName} ({adop.petSpecies})
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                adop.status === "Aprovado"
                                  ? "bg-teal-50 text-teal-800 border-teal-200"
                                  : adop.status === "Rejeitado"
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
                              }`}>
                                {adop.status}
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex justify-end items-center gap-1.5">
                                {adop.status === "Pendente" && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateAdoptionStatus(adop.id, "Aprovado")}
                                      className="px-2.5 py-1 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                      title="Aprovar Adoção"
                                    >
                                      Aprovar
                                    </button>
                                    <button
                                      onClick={() => handleUpdateAdoptionStatus(adop.id, "Rejeitado")}
                                      className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                      title="Rejeitar Solicitação"
                                    >
                                      Rejeitar
                                    </button>
                                  </>
                                )}

                                {adop.status === "Aprovado" && (
                                  <button
                                    onClick={() => setSelectedAdoptionForTerm(adop)}
                                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Visualizar ou imprimir o termo de adoção"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                    Termo de Adoção
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteAdoption(adop.id)}
                                  className="p-1 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                                  title="Excluir Registro"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {adoptions.length > 0 && (
                <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6">
                  <h4 className="font-bold text-stone-800 text-sm mb-4 uppercase tracking-wider font-display">Motivações dos Adotantes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adoptions.map((adop) => (
                      <div key={adop.id} className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <strong className="text-xs text-stone-700 font-bold">{adop.fullName} para {adop.petName}</strong>
                          <span className="text-[10px] text-stone-400">{new Date(adop.createdAt || "").toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-stone-500 italic bg-stone-50 p-3 rounded-xl border border-stone-100">
                          &ldquo;{adop.whyAdopt}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              FOSTER HOMES (LAR TEMPORÁRIO) TAB (LEVEL 1+)
             ========================================== */}
          {adminTab === "foster" && currentUserLevel !== null && currentUserLevel >= 1 && (
            <div className="space-y-6" id="admin-foster-tab">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-stone-800 text-lg font-display">Controle de Lares Temporários</h3>
                  <p className="text-xs text-stone-500">
                    Acompanhe as famílias acolhedoras cadastradas, altere suas disponibilidades e veja detalhes sobre o espaço físico.
                  </p>
                </div>
                {/* Stats overview in Foster Tab */}
                <div className="flex gap-4 text-xs font-bold text-stone-700 bg-stone-50 border border-stone-200 p-3 rounded-2xl">
                  <span>Total: {fosterHomes.length}</span>
                  <span className="text-teal-600">Disponíveis: {fosterHomes.filter(f => f.status === 'Disponível').length}</span>
                  <span className="text-purple-600">Ocupados: {fosterHomes.filter(f => f.status === 'Ocupado').length}</span>
                </div>
              </div>

              {/* Foster Homes Table / Card list */}
              <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 bg-stone-50/50 border-b border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-600 uppercase tracking-widest">Famílias Cadastradas</span>
                </div>

                {fosterHomes.length === 0 ? (
                  <div className="p-12 text-center text-stone-400 italic text-sm">
                    Nenhum lar temporário cadastrado no momento.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200 text-stone-400 text-[10px] font-bold uppercase tracking-wider bg-stone-50/50">
                          <th className="p-4">Nome / Contato</th>
                          <th className="p-4">Localização / Residência</th>
                          <th className="p-4">Animais Atuais</th>
                          <th className="p-4">Espaço / Descrição</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                        {fosterHomes.map((foster) => (
                          <tr key={foster.id} className="hover:bg-stone-50/40 transition-colors">
                            <td className="p-4 space-y-1">
                              <p className="font-bold text-stone-900 text-sm">{foster.fullName}</p>
                              <div className="flex flex-col gap-0.5 text-[11px] text-stone-500 font-mono">
                                <span>{foster.email}</span>
                                <span>{foster.phone}</span>
                              </div>
                            </td>
                            <td className="p-4 space-y-1">
                              <p className="font-semibold">{foster.city} - {foster.neighborhood}</p>
                              <span className="inline-block px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-600 font-bold rounded-md text-[10px]">
                                {foster.residenceType}
                              </span>
                            </td>
                            <td className="p-4">
                              {foster.hasPet ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-100 rounded-full font-bold text-[10px]">
                                    Sim, tem pets
                                  </span>
                                  <p className="text-[11px] text-stone-500 max-w-xs">{foster.petDetails}</p>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-600 border border-stone-200 rounded-full font-bold text-[10px]">
                                  Não possui pets
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <p className="text-[11px] text-stone-600 max-w-sm line-clamp-3 hover:line-clamp-none transition-all cursor-help" title={foster.spaceDescription}>
                                {foster.spaceDescription}
                              </p>
                            </td>
                            <td className="p-4">
                              <select
                                value={foster.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value;
                                  try {
                                    const res = await fetch(`/api/foster-homes/${foster.id}`, {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ status: newStatus })
                                    });
                                    if (res.ok) {
                                      loadAdminData(); // refresh
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer outline-none ${
                                  foster.status === "Disponível"
                                    ? "bg-teal-50 text-teal-800 border-teal-200"
                                    : foster.status === "Ocupado"
                                    ? "bg-purple-50 text-purple-800 border-purple-200"
                                    : "bg-stone-100 text-stone-600 border-stone-200"
                                }`}
                              >
                                <option value="Disponível">Disponível</option>
                                <option value="Ocupado">Ocupado</option>
                                <option value="Indisponível">Indisponível</option>
                              </select>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={async () => {
                                  if (confirm(`Tem certeza que deseja excluir o cadastro de lar temporário de ${foster.fullName}?`)) {
                                    try {
                                      const res = await fetch(`/api/foster-homes/${foster.id}`, {
                                        method: "DELETE"
                                      });
                                      if (res.ok) {
                                        loadAdminData(); // refresh
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }
                                }}
                                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                                title="Excluir Cadastro"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              USERS (LEVEL-MANAGEMENT) TAB (LEVEL 4 ONLY)
             ========================================== */}
          {adminTab === "users" && currentUserLevel !== null && currentUserLevel === 4 && (
            <div className="space-y-6" id="admin-users-tab">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-stone-800 text-lg font-display">Gerenciamento de Níveis de Acesso</h3>
                  <p className="text-xs text-stone-500">
                    Crie e remova usuários, definindo suas permissões de voluntários conforme as dinâmicas do Aubrigo.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setUserError("");
                    setIsUserModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Novo Voluntário / Nível
                </button>
              </div>

              <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-xs text-stone-400 uppercase font-bold">
                        <th className="p-4 pl-6">Nome</th>
                        <th className="p-4">Usuário</th>
                        <th className="p-4">Nível de Permissão</th>
                        <th className="p-4">Regras de Acesso</th>
                        <th className="p-4 pr-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-sm text-stone-600">
                      {users.map((usr) => {
                        const isMainAdmin = usr.username.toLowerCase() === "administrador";
                        return (
                          <tr key={usr.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="flex items-center gap-2">
                                <span className={`p-1 rounded-lg ${isMainAdmin ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"}`}>
                                  <Shield className="h-3.5 w-3.5" />
                                </span>
                                <span className="font-bold text-stone-900">{usr.name}</span>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-xs text-stone-500">{usr.username}</td>
                            <td className="p-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-bold border ${
                                usr.level === 4
                                  ? "bg-rose-50 border-rose-200 text-rose-800"
                                  : usr.level === 3
                                  ? "bg-amber-50 border-amber-200 text-amber-800"
                                  : usr.level === 2
                                  ? "bg-teal-50 border-teal-200 text-teal-800"
                                  : "bg-stone-100 border-stone-200 text-stone-600"
                              }`}>
                                Nível {usr.level}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-stone-500">
                              {usr.level === 1 && "Apenas marcar adotado"}
                              {usr.level === 2 && "Cadastrar os animais, sinalar adoção"}
                              {usr.level === 3 && "Tudo do Nível 2 + adicionar e pagar contas"}
                              {usr.level === 4 && "Administrador (Acesso total)"}
                            </td>
                            <td className="p-4 pr-6 text-right">
                              {!isMainAdmin ? (
                                <button
                                  onClick={() => handleDeleteUser(usr.id)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 transition-colors cursor-pointer"
                                  title="Remover Acesso"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">Protegido</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ==========================================
          ADD/EDIT PET MODAL (ALL ROLES)
         ========================================== */}
      {isPetModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4" id="dog-form-modal">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 rounded-t-3xl">
              <div>
                <h3 className="font-bold text-stone-900 text-lg font-display">
                  {editingPet ? `Editar Informações de ${petFormType}` : `Cadastrar Novo(a) ${petFormType}`}
                </h3>
                <p className="text-xs text-stone-500">Forneça os dados ou utilize o Gemini para criar descrições lindas.</p>
              </div>
              <button
                onClick={() => setIsPetModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePet} className="p-6 space-y-6">
              {/* Image attachment / URL & AI option */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <ImageIcon className="h-4 w-4 text-amber-500" />
                    1. Imagem e Análise Inteligente
                  </label>
                  {/* Gemini Trigger Button */}
                  <button
                    type="button"
                    onClick={handleAnalyzeWithGemini}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-extrabold uppercase tracking-wide cursor-pointer disabled:opacity-50 transition-colors self-start"
                  >
                    <Sparkles className="h-3.5 w-3.5 fill-current" />
                    {isAnalyzing ? "Analisando com Gemini..." : "Gerar Perfil com Gemini"}
                  </button>
                </div>

                {aiError && (
                  <p className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] font-semibold text-rose-700 flex items-center gap-2">
                    <Info className="h-4 w-4 shrink-0 text-rose-500" />
                    {aiError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload */}
                  <div className="space-y-1">
                    <span className="text-xs text-stone-500 font-medium block">Anexar foto do computador</span>
                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-stone-300 rounded-xl hover:bg-stone-100/50 cursor-pointer transition-colors h-24">
                      <Upload className="h-5 w-5 text-stone-400" />
                      <span className="text-[10px] text-stone-400 font-semibold mt-1">Carregar arquivo (JPG/PNG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Preview */}
                  <div className="space-y-1">
                    <span className="text-xs text-stone-500 font-medium block">Visualização / Imagem Ativa</span>
                    <div className="h-24 rounded-xl border border-stone-200 overflow-hidden bg-stone-100 flex items-center justify-center relative">
                      {petImageUrl ? (
                        <img
                          src={petImageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] text-stone-400">Sem imagem</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-stone-100">
                  <label htmlFor="pet-image-url" className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Ou insira uma URL direta de Imagem</label>
                  <input
                    type="url"
                    id="pet-image-url"
                    placeholder="https://exemplo.com/foto.jpg"
                    value={petImageUrl}
                    onChange={(e) => setPetImageUrl(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Species and Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="pet-form-species" className="text-xs font-bold text-stone-600 block">Espécie</label>
                  <select
                    id="pet-form-species"
                    disabled={editingPet !== null} // Lock species on edit
                    value={petFormType}
                    onChange={(e) => {
                      const selected = e.target.value as "Cão" | "Gato" | "Exótico";
                      setPetFormType(selected);
                      // Update default vaccines based on species
                      setPetVaccines(selected === "Cão" ? ["V10 Polivalente", "Antirrábica"] : selected === "Gato" ? ["Quádrupla Felina", "Antirrábica"] : ["Vermifugação"]);
                    }}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="Cão">🐶 Cachorro</option>
                    <option value="Gato">🐱 Gato</option>
                    <option value="Exótico">🐰 Animal Exótico / Outro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="pet-form-name" className="text-xs font-bold text-stone-600 block">Nome do Pet</label>
                  <input
                    type="text"
                    id="pet-form-name"
                    required
                    placeholder="Ex: Billy, Mimi"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="pet-form-breed" className="text-xs font-bold text-stone-600 block">Raça / Tipo</label>
                  <input
                    type="text"
                    id="pet-form-breed"
                    placeholder="Ex: Siamês, Vira-lata, Mini Coelho"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Specs Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label htmlFor="pet-form-age" className="text-xs font-bold text-stone-600 block">Idade Estimada</label>
                  <input
                    type="text"
                    id="pet-form-age"
                    placeholder="Ex: 2 anos"
                    value={petAge}
                    onChange={(e) => setPetAge(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="pet-form-weight" className="text-xs font-bold text-stone-600 block">Peso Estimado</label>
                  <input
                    type="text"
                    id="pet-form-weight"
                    placeholder="Ex: 12 kg, 4 kg"
                    value={petWeight}
                    onChange={(e) => setPetWeight(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="pet-form-size" className="text-xs font-bold text-stone-600 block">Porte</label>
                  <select
                    id="pet-form-size"
                    value={petSize}
                    onChange={(e) => setPetSize(e.target.value as DogSize)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Pequeno">Pequeno</option>
                    <option value="Médio">Médio</option>
                    <option value="Grande">Grande</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="pet-form-gender" className="text-xs font-bold text-stone-600 block">Gênero</label>
                  <select
                    id="pet-form-gender"
                    value={petGender}
                    onChange={(e) => setPetGender(e.target.value as DogGender)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Macho">Macho</option>
                    <option value="Fêmea">Fêmea</option>
                  </select>
                </div>
              </div>

              {/* Status and Description */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="pet-form-status" className="text-xs font-bold text-stone-600 block">Status de Adoção</label>
                  <select
                    id="pet-form-status"
                    value={petStatus}
                    onChange={(e) => setPetStatus(e.target.value as DogStatus)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Em Processo">Em Processo</option>
                    <option value="Adotado">Adotado</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="pet-form-desc" className="text-xs font-bold text-stone-600 block">Biografia / História do Pet</label>
                  <textarea
                    id="pet-form-desc"
                    rows={4}
                    value={petDescription}
                    onChange={(e) => setPetDescription(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none"
                    placeholder="Conte a história de resgate do animal, carinho especial que ele gosta, se convive bem com crianças..."
                  ></textarea>
                </div>
              </div>

              {/* Vaccines */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-600 block">Carteira de Vacinação / Clínico</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar vacina (ex: Tríplice Felina, Raiva)"
                    value={petVaccineInput}
                    onChange={(e) => setPetVaccineInput(e.target.value)}
                    className="flex-1 px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddVaccine}
                    className="px-4 py-2 bg-stone-800 text-white text-xs font-bold rounded-xl hover:bg-stone-900 cursor-pointer transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {petVaccines.map((v) => (
                    <span key={v} className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 text-xs px-2.5 py-1 rounded-lg border border-stone-200">
                      {v}
                      <button type="button" onClick={() => handleRemoveVaccine(v)} className="text-stone-400 hover:text-stone-600 font-bold">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Behaviors */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-600 block">Traços de Comportamento</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar comportamento (ex: Calmo, Brincalhão, Se dá bem com cães)"
                    value={petBehaviorInput}
                    onChange={(e) => setPetBehaviorInput(e.target.value)}
                    className="flex-1 px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddBehavior}
                    className="px-4 py-2 bg-stone-800 text-white text-xs font-bold rounded-xl hover:bg-stone-900 cursor-pointer transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {petBehavior.map((b) => (
                    <span key={b} className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 text-xs px-2.5 py-1 rounded-lg border border-stone-200">
                      {b}
                      <button type="button" onClick={() => handleRemoveBehavior(b)} className="text-stone-400 hover:text-stone-600 font-bold">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPetModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  {editingPet ? "Salvar Alterações" : "Salvar Pet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          ADD/EDIT BILL MODAL (TIA DANY ONLY)
         ========================================== */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4" id="bill-form-modal">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 rounded-t-3xl">
              <div>
                <h3 className="font-bold text-stone-900 text-lg font-display">
                  {editingBill ? "Editar Despesa" : "Cadastrar Nova Despesa"}
                </h3>
                <p className="text-xs text-stone-500">Adicione as despesas mensais do Aubrigo.</p>
              </div>
              <button
                onClick={() => setIsBillModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBill} className="p-6 space-y-4">
              <div className="space-y-1">
                <label htmlFor="bill-form-desc" className="text-xs font-bold text-stone-600 block">Descrição da Despesa</label>
                <input
                  type="text"
                  id="bill-form-desc"
                  required
                  placeholder="Ex: Conta de Luz, Compra de Ração Cães"
                  value={billDesc}
                  onChange={(e) => setBillDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="bill-form-amount" className="text-xs font-bold text-stone-600 block">Valor (R$)</label>
                  <input
                    type="number"
                    id="bill-form-amount"
                    required
                    min="1"
                    placeholder="Ex: 450"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="bill-form-date" className="text-xs font-bold text-stone-600 block">Vencimento</label>
                  <input
                    type="date"
                    id="bill-form-date"
                    required
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="bill-form-category" className="text-xs font-bold text-stone-600 block">Categoria</label>
                  <select
                    id="bill-form-category"
                    value={billCategory}
                    onChange={(e) => setBillCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Alimentação">Alimentação</option>
                    <option value="Veterinária">Veterinária</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Medicamentos">Medicamentos</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="bill-form-status" className="text-xs font-bold text-stone-600 block">Status de Pagamento</label>
                  <select
                    id="bill-form-status"
                    value={billStatus}
                    onChange={(e) => setBillStatus(e.target.value as any)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBillModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  {editingBill ? "Salvar Alterações" : "Salvar Conta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          USER CREATION MODAL (LEVEL 4 ONLY)
         ========================================== */}
      {isUserModalOpen && currentUserLevel === 4 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 rounded-t-3xl">
              <div>
                <h3 className="font-bold text-stone-900 text-lg font-display">Cadastrar Voluntário / Acesso</h3>
                <p className="text-xs text-stone-500">Crie novos usuários com níveis específicos de permissão.</p>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {userError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-700">
                  {userError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-600 block">Nome do Voluntário</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ana Souza"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-600 block">Nome de Usuário (Login)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: anasouza"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-600 block">Senha</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 4 caracteres"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-600 block">Nível de Permissão</label>
                <select
                  value={newUserLevel}
                  onChange={(e) => setNewUserLevel(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white outline-none cursor-pointer"
                >
                  <option value={1}>Nível 1 - Apenas marcar adotado</option>
                  <option value={2}>Nível 2 - Cadastrar os animais, sinalar adoção</option>
                  <option value={3}>Nível 3 - Cadastrar, sinalar adoção, adicionar/pagar contas</option>
                  <option value={4}>Nível 4 - Administrador (Pode tudo)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          ADOPTION AGREEMENT TERM MODAL
         ========================================== */}
      {selectedAdoptionForTerm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <div>
                <h3 className="font-bold text-stone-900 text-lg font-display flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  Documento Oficial &mdash; Termo de Adoção
                </h3>
                <p className="text-xs text-stone-500">Imprima ou salve este documento para anexar ao dossiê físico de adoção.</p>
              </div>
              <button
                onClick={() => setSelectedAdoptionForTerm(null)}
                className="p-2 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Area */}
            <div className="p-8 overflow-y-auto max-h-[60vh] bg-stone-50" id="adoption-term-print-area">
              <div className="bg-white border border-stone-300 p-8 rounded-2xl shadow-sm space-y-6 text-stone-800 text-xs leading-relaxed font-serif">
                {/* Header */}
                <div className="text-center border-b border-stone-200 pb-4 space-y-1">
                  <h1 className="text-base font-extrabold text-stone-900 tracking-wider uppercase">ASSOCIAÇÃO AUMIGOS &mdash; AUBRIGO</h1>
                  <p className="text-[10px] text-stone-500 tracking-wide">CNPJ: 45.289.102/0001-90 &bull; Registro Civil de Pessoas Jurídicas</p>
                </div>

                <div className="text-center">
                  <h2 className="text-sm font-bold text-stone-900 tracking-wide uppercase">TERMO DE RESPONSABILIDADE E ADOÇÃO DE ANIMAL</h2>
                </div>

                {/* Parties */}
                <div className="space-y-2">
                  <p>
                    Pelo presente instrumento, a <strong>Associação Aubrigo</strong>, representada por sua Diretoria de Voluntariado, doravante denominada simplesmente <strong>DOADORA</strong>, e de outro lado:
                  </p>
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-sans">
                    <div>
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Nome Completo do Adotante:</span>
                      <strong className="text-stone-800">{selectedAdoptionForTerm.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">CPF do Adotante:</span>
                      <strong className="text-stone-800 font-mono">{selectedAdoptionForTerm.cpf}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Idade:</span>
                      <strong className="text-stone-800">{selectedAdoptionForTerm.age} anos</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Residência:</span>
                      <strong className="text-stone-800">{selectedAdoptionForTerm.residence}</strong>
                    </div>
                  </div>
                  <p>
                    doravante denominado(a) simplesmente <strong>ADOTANTE</strong>, resolvem firmar o presente Termo de Responsabilidade mediante as cláusulas e condições seguintes:
                  </p>
                </div>

                {/* Pet Details */}
                <div className="space-y-2">
                  <h3 className="font-bold text-stone-900 border-b border-stone-100 pb-1 uppercase text-[10px]">CLÁUSULA PRIMEIRA &mdash; DO ANIMAL OBJETO DA ADOÇÃO</h3>
                  <p>
                    A DOADORA entrega nesta data, sob regime de adoção responsável, o seguinte animal de seu plantel de resgatados:
                  </p>
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-sans">
                    <div>
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Nome do Pet:</span>
                      <strong className="text-stone-800">{selectedAdoptionForTerm.petName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Espécie:</span>
                      <strong className="text-stone-800">{selectedAdoptionForTerm.petSpecies}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-bold uppercase text-[9px]">Data da Adoção:</span>
                      <strong className="text-stone-800">{new Date(selectedAdoptionForTerm.updatedAt || selectedAdoptionForTerm.createdAt || "").toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Clauses */}
                <div className="space-y-3">
                  <h3 className="font-bold text-stone-900 border-b border-stone-100 pb-1 uppercase text-[10px]">CLÁUSULA SEGUNDA &mdash; DOS COMPROMISSOS DO ADOTANTE</h3>
                  <p>O ADOTANTE declara-se ciente e concorda expressamente em cumprir as obrigações a seguir:</p>
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Garantir abrigo seguro, alimentação de qualidade, vacinação anual e cuidados veterinários sempre que necessários.</li>
                    <li>NUNCA manter o animal acorrentado, confinado em espaços insalubres ou submetido a quaisquer tipos de maus-tratos, sob pena de sanções previstas na Lei Federal nº 9.605/98 (Crimes Ambientais).</li>
                    <li>Permitir o acompanhamento pós-adoção por meio de contatos ou visitas eventuais agendadas pelos voluntários do Aubrigo.</li>
                    <li>Em caso de impossibilidade absoluta de permanência com o animal, devolvê-lo imediatamente ao Aubrigo, comprometendo-se a NUNCA abandoná-lo na rua ou repassá-lo a terceiros sem prévia autorização da DOADORA.</li>
                  </ol>
                </div>

                {/* Signatures */}
                <div className="pt-8 border-t border-stone-200 grid grid-cols-2 gap-12 text-center font-sans">
                  <div className="space-y-2">
                    <div className="border-b border-stone-400 h-8"></div>
                    <p className="text-[10px] font-bold text-stone-700">DANYELLE MARIA (TIA DANY)</p>
                    <p className="text-[8px] text-stone-400 uppercase tracking-wider">DOADORA &bull; AUBRIGO</p>
                  </div>
                  <div className="space-y-2">
                    <div className="border-b border-stone-400 h-8"></div>
                    <p className="text-[10px] font-bold text-stone-700 uppercase">{selectedAdoptionForTerm.fullName}</p>
                    <p className="text-[8px] text-stone-400 uppercase tracking-wider">ADOTANTE</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => setSelectedAdoptionForTerm(null)}
                className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <FileText className="h-4 w-4" />
                Imprimir / Salvar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
