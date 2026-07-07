import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const app = express();
const PORT = 3000;
const isServerlessRuntime = Boolean(
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);
const DB_DIR = isServerlessRuntime
  ? path.join("/tmp", "aubrigo-tia-dany-data")
  : path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Middleware to parse large JSON (since we might send base64 images for the dog profile)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Ensure DB directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial mock data
const initialData = {
  dogs: [
    {
      id: "dog_1",
      name: "Toby",
      breed: "Golden Retriever",
      age: "2 anos",
      size: "Grande",
      gender: "Macho",
      description: "Toby é extremamente brincalhão, dócil e ama crianças. Ele foi resgatado de um local de risco e hoje está pronto para receber muito amor em um lar definitivo.",
      vaccines: ["V10 Polivalente", "Antirrábica", "Gripe Canina"],
      status: "Disponível",
      imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600",
      behavior: ["Muito Ativo", "Amigável", "Se dá bem com crianças", "Carente de atenção"],
      weight: "28 kg",
      createdAt: new Date().toISOString()
    },
    {
      id: "dog_2",
      name: "Luna",
      breed: "Border Collie",
      age: "6 meses",
      size: "Médio",
      gender: "Fêmea",
      description: "Luna é super inteligente e aprende truques muito rápido. Tem muita energia e precisa de uma família ativa que adore correr e brincar ao ar livre.",
      vaccines: ["V10 Polivalente", "Antirrábica"],
      status: "Disponível",
      imageUrl: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&q=80&w=600",
      behavior: ["Inteligente", "Muito Ativa", "Sociável", "Necessita de espaço"],
      weight: "14 kg",
      createdAt: new Date().toISOString()
    },
    {
      id: "dog_3",
      name: "Pipoca",
      breed: "Bulldog Francês",
      age: "3 anos",
      size: "Pequeno",
      gender: "Macho",
      description: "Pipoca é calmo, adora tirar uma soneca no sofá e é muito companheiro. Excelente para apartamentos. É extremamente dócil com outros cães.",
      vaccines: ["V10 Polivalente", "Antirrábica", "Giárdia"],
      status: "Disponível",
      imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600",
      behavior: ["Calmo", "Sociável com cães", "Ideal para apartamento", "Preguiçoso"],
      weight: "11 kg",
      createdAt: new Date().toISOString()
    },
    {
      id: "dog_4",
      name: "Mel",
      breed: "Vira-lata (Sem Raça Definida)",
      age: "1 ano",
      size: "Médio",
      gender: "Fêmea",
      description: "Mel foi resgatada das ruas grávida, todos os seus filhotes foram adotados e agora chegou a vez dela de encontrar um lar. Ela é meiga, dócil e muito protetora.",
      vaccines: ["V10 Polivalente", "Antirrábica", "Gripe Canina"],
      status: "Disponível",
      imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
      behavior: ["Dócil", "Super carinhosa", "Protetora", "Sociável com gatos"],
      weight: "16 kg",
      createdAt: new Date().toISOString()
    }
  ],
  cats: [
    {
      id: "cat_1",
      name: "Mimi",
      breed: "Persa",
      age: "1 ano",
      size: "Pequeno",
      gender: "Fêmea",
      description: "Mimi é uma gatinha persa extremamente dócil, adora carinho e é muito calma.",
      vaccines: ["Tríplice Felina", "Antirrábica"],
      status: "Disponível",
      imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
      behavior: ["Calma", "Amigável", "Dócil"],
      weight: "4 kg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cat_2",
      name: "Mingau",
      breed: "Siamês",
      age: "2 anos",
      size: "Pequeno",
      gender: "Macho",
      description: "Mingau é brincalhão, comunicativo e adora correr atrás de bolinhas de papel.",
      vaccines: ["Quádrupla Felina", "Antirrábica"],
      status: "Disponível",
      imageUrl: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=600",
      behavior: ["Ativo", "Brincalhão", "Comunicativo"],
      weight: "5 kg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cat_3",
      name: "Sombra",
      breed: "Vira-lata (SRD)",
      age: "3 anos",
      size: "Médio",
      gender: "Macho",
      description: "Sombra foi resgatado de um telhado chuvoso. Ele é tímido no início, mas depois se torna um grude.",
      vaccines: ["Tríplice Felina", "Antirrábica"],
      status: "Adotado",
      imageUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600",
      behavior: ["Tímido", "Carinhoso", "Independente"],
      weight: "6 kg",
      createdAt: new Date().toISOString()
    }
  ],
  exotics: [
    {
      id: "exotic_1",
      name: "Pipoca",
      breed: "Mini Coelho",
      age: "8 meses",
      size: "Pequeno",
      gender: "Fêmea",
      description: "Pipoca é uma coelhinha dócil e silenciosa. Ama comer folhas verdes e cenouras fresquinhas.",
      vaccines: ["Vermifugação"],
      status: "Disponível",
      imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600",
      behavior: ["Silenciosa", "Assustada", "Tranquila"],
      weight: "1.5 kg",
      createdAt: new Date().toISOString()
    },
    {
      id: "exotic_2",
      name: "Fred",
      breed: "Furão (Ferret)",
      age: "1 ano",
      size: "Pequeno",
      gender: "Macho",
      description: "Fred é extremamente agitado e engraçado. Adora se esconder em meias e brincar de pega-pega.",
      vaccines: ["Antirrábica", "Cinomose canina"],
      status: "Disponível",
      imageUrl: "https://images.unsplash.com/photo-1615087240969-eeff2fa558f2?auto=format&fit=crop&q=80&w=600",
      behavior: ["Muito Ativo", "Curioso", "Brincalhão"],
      weight: "1.2 kg",
      createdAt: new Date().toISOString()
    },
    {
      id: "exotic_3",
      name: "Buda",
      breed: "Tartaruga de Ouvido Vermelho",
      age: "5 anos",
      size: "Pequeno",
      gender: "Macho",
      description: "Buda é uma tartaruga muito tranquila. Adora tomar banho de sol na sua pedra.",
      vaccines: [],
      status: "Adotado",
      imageUrl: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&q=80&w=600",
      behavior: ["Lento", "Pacífico", "Observador"],
      weight: "800 g",
      createdAt: new Date().toISOString()
    }
  ],
  volunteers: [
    {
      id: "vol_1",
      name: "Carlos Eduardo da Silva",
      email: "carlos.edu@example.com",
      phone: "(11) 98765-4321",
      areas: ["Passeio", "Eventos"],
      availability: "Sábados e Domingos",
      status: "Aprovado",
      createdAt: new Date().toISOString()
    },
    {
      id: "vol_2",
      name: "Mariana Costa",
      email: "mari.costa@example.com",
      phone: "(11) 99123-4567",
      areas: ["Veterinária", "Limpeza"],
      availability: "Terças e Quintas à tarde",
      status: "Pendente",
      createdAt: new Date().toISOString()
    }
  ],
  donations: [
    {
      id: "don_1",
      donorName: "Alice Rezende",
      email: "alice@example.com",
      amount: 150,
      message: "Espero que ajude na compra de medicamentos para os cachorrinhos resgatados. Vocês fazem um trabalho incrível!",
      paymentMethod: "Pix",
      purpose: "Medicamentos",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "don_2",
      donorName: "Anônimo",
      email: "anon@example.com",
      amount: 500,
      message: "Contribuição mensal para a manutenção do espaço do abrigo.",
      paymentMethod: "Pix",
      purpose: "Manutenção do Abrigo",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "don_3",
      donorName: "Roberto Lima",
      email: "roberto@example.com",
      amount: 100,
      message: "Para ajudar com a alimentação e ração especial.",
      paymentMethod: "Cartão",
      purpose: "Geral",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  bills: [
    {
      id: "bill_1",
      description: "Fornecedor de Ração Super Premium (Cães)",
      amount: 1200,
      dueDate: "2026-07-15",
      status: "Pendente",
      category: "Alimentação"
    },
    {
      id: "bill_2",
      description: "Distribuidor de Ração & Patês (Gatos)",
      amount: 450,
      dueDate: "2026-07-05",
      status: "Pago",
      category: "Alimentação"
    },
    {
      id: "bill_3",
      description: "Exames e Consultas Veterinárias Especializadas",
      amount: 850,
      dueDate: "2026-07-20",
      status: "Pendente",
      category: "Veterinária"
    },
    {
      id: "bill_4",
      description: "Conta de Energia Elétrica - Sede Aubrigo",
      amount: 310,
      dueDate: "2026-07-01",
      status: "Pago",
      category: "Manutenção"
    }
  ],
  users: [
    {
      id: "usr_master",
      username: "Administrador",
      password: "aumigos2026",
      name: "Administrador Geral",
      level: 4,
      createdAt: "2026-07-07T03:36:01-07:00"
    }
  ],
  adoptions: [
    {
      id: "adopt_1",
      petId: "dog_1",
      petName: "Toby",
      petSpecies: "Cão",
      fullName: "Sandro Nogueira",
      age: 34,
      cpf: "123.456.789-00",
      residence: "Rua das Flores, 123 - Centro, São Paulo - SP",
      whyAdopt: "Procuro um companheiro ativo para caminhadas e temos uma casa com quintal grande.",
      status: "Pendente",
      createdAt: "2026-07-07T03:36:01-07:00"
    }
  ],
  fosterHomes: [
    {
      id: "foster_1",
      fullName: "Mariana Souza",
      email: "mariana@email.com",
      phone: "(11) 98765-4321",
      city: "São Paulo",
      neighborhood: "Pinheiros",
      residenceType: "Casa",
      hasPet: true,
      petDetails: "Possui um cão idoso dócil",
      spaceDescription: "Quintal plano e fechado, com casinha de cachorro protegida do sol e da chuva.",
      status: "Disponível",
      createdAt: "2026-07-07T03:36:01-07:00"
    },
    {
      id: "foster_2",
      fullName: "Roberto Carlos",
      email: "roberto@email.com",
      phone: "(11) 91234-5678",
      city: "Santo André",
      neighborhood: "Jardim",
      residenceType: "Apartamento",
      hasPet: false,
      petDetails: "",
      spaceDescription: "Apartamento com telas de proteção em todas as janelas e varanda.",
      status: "Ocupado",
      createdAt: "2026-07-07T03:36:01-07:00"
    }
  ]
};

// Database read/write helpers
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(raw);
    let modified = false;
    if (!data.cats) {
      data.cats = initialData.cats;
      modified = true;
    }
    if (!data.exotics) {
      data.exotics = initialData.exotics;
      modified = true;
    }
    if (!data.bills) {
      data.bills = initialData.bills;
      modified = true;
    }
    if (!data.users) {
      data.users = initialData.users;
      modified = true;
    }
    if (!data.adoptions) {
      data.adoptions = initialData.adoptions;
      modified = true;
    }
    if (!data.fosterHomes) {
      data.fosterHomes = initialData.fosterHomes || [];
      modified = true;
    }
    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    }
    return data;
  } catch (error) {
    console.error("Erro ao ler banco de dados JSON:", error);
    return initialData;
  }
}

function writeDB(data: typeof initialData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Erro ao salvar no banco de dados JSON:", error);
  }
}

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
    }
  }
  return geminiClient;
}

// ==================== API ROUTES ====================

// --- DOGS ENDPOINTS ---
app.get("/api/dogs", (req, res) => {
  const db = readDB();
  res.json(db.dogs);
});

app.post("/api/dogs", (req, res) => {
  const db = readDB();
  const newDog = {
    id: "dog_" + Math.random().toString(36).substring(2, 9),
    name: req.body.name || "Cachorro",
    breed: req.body.breed || "Vira-lata",
    age: req.body.age || "Idade não informada",
    size: req.body.size || "Médio",
    gender: req.body.gender || "Macho",
    description: req.body.description || "",
    vaccines: req.body.vaccines || [],
    status: req.body.status || "Disponível",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
    behavior: req.body.behavior || [],
    weight: req.body.weight || "N/A",
    createdAt: new Date().toISOString()
  };

  db.dogs.unshift(newDog);
  writeDB(db);
  res.status(201).json(newDog);
});

app.put("/api/dogs/:id", (req, res) => {
  const db = readDB();
  const index = db.dogs.findIndex((d: any) => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Cachorro não encontrado" });
  }

  db.dogs[index] = {
    ...db.dogs[index],
    ...req.body,
    // prevent changing id
    id: db.dogs[index].id,
  };

  writeDB(db);
  res.json(db.dogs[index]);
});

app.delete("/api/dogs/:id", (req, res) => {
  const db = readDB();
  const initialLen = db.dogs.length;
  db.dogs = db.dogs.filter((d: any) => d.id !== req.params.id);
  if (db.dogs.length === initialLen) {
    return res.status(404).json({ error: "Cachorro não encontrado" });
  }
  writeDB(db);
  res.json({ success: true, id: req.params.id });
});

// --- CATS ENDPOINTS ---
app.get("/api/cats", (req, res) => {
  const db = readDB();
  res.json(db.cats || []);
});

app.post("/api/cats", (req, res) => {
  const db = readDB();
  const newCat = {
    id: "cat_" + Math.random().toString(36).substring(2, 9),
    name: req.body.name || "Gato",
    breed: req.body.breed || "SRD",
    age: req.body.age || "Idade não informada",
    size: req.body.size || "Pequeno",
    gender: req.body.gender || "Macho",
    description: req.body.description || "",
    vaccines: req.body.vaccines || [],
    status: req.body.status || "Disponível",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
    behavior: req.body.behavior || [],
    weight: req.body.weight || "N/A",
    createdAt: new Date().toISOString()
  };

  if (!db.cats) db.cats = [];
  db.cats.unshift(newCat);
  writeDB(db);
  res.status(201).json(newCat);
});

app.put("/api/cats/:id", (req, res) => {
  const db = readDB();
  if (!db.cats) db.cats = [];
  const index = db.cats.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Gato não encontrado" });
  }

  db.cats[index] = {
    ...db.cats[index],
    ...req.body,
    id: db.cats[index].id,
  };

  writeDB(db);
  res.json(db.cats[index]);
});

app.delete("/api/cats/:id", (req, res) => {
  const db = readDB();
  if (!db.cats) db.cats = [];
  const initialLen = db.cats.length;
  db.cats = db.cats.filter((c: any) => c.id !== req.params.id);
  if (db.cats.length === initialLen) {
    return res.status(404).json({ error: "Gato não encontrado" });
  }
  writeDB(db);
  res.json({ success: true, id: req.params.id });
});

// --- EXOTICS ENDPOINTS ---
app.get("/api/exotics", (req, res) => {
  const db = readDB();
  res.json(db.exotics || []);
});

app.post("/api/exotics", (req, res) => {
  const db = readDB();
  const newExotic = {
    id: "exotic_" + Math.random().toString(36).substring(2, 9),
    name: req.body.name || "Animal Exótico",
    breed: req.body.breed || "Desconhecida",
    age: req.body.age || "Idade não informada",
    size: req.body.size || "Pequeno",
    gender: req.body.gender || "Macho",
    description: req.body.description || "",
    vaccines: req.body.vaccines || [],
    status: req.body.status || "Disponível",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600",
    behavior: req.body.behavior || [],
    weight: req.body.weight || "N/A",
    createdAt: new Date().toISOString()
  };

  if (!db.exotics) db.exotics = [];
  db.exotics.unshift(newExotic);
  writeDB(db);
  res.status(201).json(newExotic);
});

app.put("/api/exotics/:id", (req, res) => {
  const db = readDB();
  if (!db.exotics) db.exotics = [];
  const index = db.exotics.findIndex((e: any) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Animal exótico não encontrado" });
  }

  db.exotics[index] = {
    ...db.exotics[index],
    ...req.body,
    id: db.exotics[index].id,
  };

  writeDB(db);
  res.json(db.exotics[index]);
});

app.delete("/api/exotics/:id", (req, res) => {
  const db = readDB();
  if (!db.exotics) db.exotics = [];
  const initialLen = db.exotics.length;
  db.exotics = db.exotics.filter((e: any) => e.id !== req.params.id);
  if (db.exotics.length === initialLen) {
    return res.status(404).json({ error: "Animal exótico não encontrado" });
  }
  writeDB(db);
  res.json({ success: true, id: req.params.id });
});

// --- VOLUNTEERS ENDPOINTS ---
app.get("/api/volunteers", (req, res) => {
  const db = readDB();
  res.json(db.volunteers);
});

app.post("/api/volunteers", (req, res) => {
  const db = readDB();
  const newVolunteer = {
    id: "vol_" + Math.random().toString(36).substring(2, 9),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    areas: req.body.areas || [],
    availability: req.body.availability,
    status: req.body.status || "Pendente",
    createdAt: new Date().toISOString()
  };

  if (!newVolunteer.name || !newVolunteer.email) {
    return res.status(400).json({ error: "Nome e e-mail são obrigatórios" });
  }

  db.volunteers.unshift(newVolunteer);
  writeDB(db);
  res.status(201).json(newVolunteer);
});

app.put("/api/volunteers/:id", (req, res) => {
  const db = readDB();
  const index = db.volunteers.findIndex((v: any) => v.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Voluntário não encontrado" });
  }

  db.volunteers[index] = {
    ...db.volunteers[index],
    ...req.body,
    id: db.volunteers[index].id
  };

  writeDB(db);
  res.json(db.volunteers[index]);
});

app.delete("/api/volunteers/:id", (req, res) => {
  const db = readDB();
  db.volunteers = db.volunteers.filter((v: any) => v.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// --- DONATIONS ENDPOINTS ---
app.get("/api/donations", (req, res) => {
  const db = readDB();
  res.json(db.donations);
});

app.post("/api/donations", (req, res) => {
  const db = readDB();
  const amount = Number(req.body.amount);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Valor de doação inválido" });
  }

  const newDonation = {
    id: "don_" + Math.random().toString(36).substring(2, 9),
    donorName: req.body.donorName || "Anônimo",
    email: req.body.email || "",
    amount,
    message: req.body.message || "",
    paymentMethod: req.body.paymentMethod || "Pix",
    purpose: req.body.purpose || "Geral",
    date: new Date().toISOString()
  };

  db.donations.unshift(newDonation);
  writeDB(db);
  res.status(201).json(newDonation);
});

// --- STATS ENDPOINT ---
app.get("/api/stats", (req, res) => {
  const db = readDB();
  const dogs = db.dogs;
  const cats = db.cats || [];
  const exotics = db.exotics || [];
  const volunteers = db.volunteers;
  const donations = db.donations;
  const bills = db.bills || [];

  const stats = {
    totalDogs: dogs.length,
    availableDogs: dogs.filter((d: any) => d.status === "Disponível").length,
    adoptedDogs: dogs.filter((d: any) => d.status === "Adotado").length,
    totalCats: cats.length,
    availableCats: cats.filter((c: any) => c.status === "Disponível").length,
    adoptedCats: cats.filter((c: any) => c.status === "Adotado").length,
    totalExotics: exotics.length,
    availableExotics: exotics.filter((e: any) => e.status === "Disponível").length,
    adoptedExotics: exotics.filter((e: any) => e.status === "Adotado").length,
    totalVolunteers: volunteers.length,
    pendingVolunteers: volunteers.filter((v: any) => v.status === "Pendente").length,
    totalDonationsAmount: donations.reduce((sum: number, d: any) => sum + d.amount, 0),
    donationsByPurpose: {
      maintenance: donations.filter((d: any) => d.purpose === "Manutenção do Abrigo").reduce((sum: number, d: any) => sum + d.amount, 0),
      medicines: donations.filter((d: any) => d.purpose === "Medicamentos").reduce((sum: number, d: any) => sum + d.amount, 0),
      general: donations.filter((d: any) => d.purpose === "Geral").reduce((sum: number, d: any) => sum + d.amount, 0),
    },
    totalBillsAmount: bills.reduce((sum: number, b: any) => sum + b.amount, 0),
    paidBillsAmount: bills.filter((b: any) => b.status === "Pago").reduce((sum: number, b: any) => sum + b.amount, 0),
    pendingBillsAmount: bills.filter((b: any) => b.status === "Pendente").reduce((sum: number, b: any) => sum + b.amount, 0)
  };

  res.json(stats);
});

// --- BILLS (CONTAS A PAGAR) ENDPOINTS ---
app.get("/api/bills", (req, res) => {
  const db = readDB();
  res.json(db.bills || []);
});

app.post("/api/bills", (req, res) => {
  const db = readDB();
  const amount = Number(req.body.amount);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Valor de conta inválido" });
  }

  const newBill = {
    id: "bill_" + Math.random().toString(36).substring(2, 9),
    description: req.body.description || "Nova Conta",
    amount,
    dueDate: req.body.dueDate || new Date().toISOString().split('T')[0],
    status: req.body.status || "Pendente",
    category: req.body.category || "Geral"
  };

  if (!db.bills) db.bills = [];
  db.bills.unshift(newBill);
  writeDB(db);
  res.status(201).json(newBill);
});

app.put("/api/bills/:id", (req, res) => {
  const db = readDB();
  if (!db.bills) db.bills = [];
  const index = db.bills.findIndex((b: any) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Conta não encontrada" });
  }

  db.bills[index] = {
    ...db.bills[index],
    ...req.body,
    id: db.bills[index].id,
    amount: req.body.amount !== undefined ? Number(req.body.amount) : db.bills[index].amount
  };

  writeDB(db);
  res.json(db.bills[index]);
});

app.delete("/api/bills/:id", (req, res) => {
  const db = readDB();
  if (!db.bills) db.bills = [];
  const initialLen = db.bills.length;
  db.bills = db.bills.filter((b: any) => b.id !== req.params.id);
  if (db.bills.length === initialLen) {
    return res.status(404).json({ error: "Conta não encontrada" });
  }
  writeDB(db);
  res.json({ success: true, id: req.params.id });
});

// --- LOGIN & USER MANAGEMENT ENDPOINTS ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
  }

  const uLower = username.trim().toLowerCase();
  
  // Default master user check
  if (uLower === "administrador" && password === "aumigos2026") {
    return res.json({
      success: true,
      user: {
        id: "usr_master",
        username: "Administrador",
        name: "Administrador Geral",
        level: 4
      }
    });
  }

  const db = readDB();
  const found = (db.users || []).find(
    (u: any) => u.username.toLowerCase() === uLower && u.password === password
  );

  if (found) {
    return res.json({
      success: true,
      user: {
        id: found.id,
        username: found.username,
        name: found.name,
        level: Number(found.level)
      }
    });
  }

  return res.status(401).json({ error: "Credenciais inválidas. Verifique o usuário e senha." });
});

app.get("/api/users", (req, res) => {
  const db = readDB();
  res.json(db.users || []);
});

app.post("/api/users", (req, res) => {
  const db = readDB();
  const { username, password, name, level } = req.body;
  if (!username || !password || !name || !level) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const uLower = username.trim().toLowerCase();
  const exists = (db.users || []).some((u: any) => u.username.toLowerCase() === uLower) || uLower === "administrador";
  if (exists) {
    return res.status(400).json({ error: "Este nome de usuário já está em uso" });
  }

  const newUser = {
    id: "usr_" + Math.random().toString(36).substring(2, 9),
    username: username.trim(),
    password: password,
    name: name.trim(),
    level: Number(level),
    createdAt: new Date().toISOString()
  };

  if (!db.users) db.users = [];
  db.users.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

app.delete("/api/users/:id", (req, res) => {
  const db = readDB();
  if (req.params.id === "usr_master") {
    return res.status(400).json({ error: "Não é possível remover o Administrador Geral master" });
  }
  const initialLen = (db.users || []).length;
  db.users = (db.users || []).filter((u: any) => u.id !== req.params.id);
  if (db.users.length === initialLen) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  writeDB(db);
  res.json({ success: true, id: req.params.id });
});

// --- ADOPTIONS ENDPOINTS ---
app.get("/api/adoptions", (req, res) => {
  const db = readDB();
  res.json(db.adoptions || []);
});

app.post("/api/adoptions", (req, res) => {
  const db = readDB();
  const { petId, petName, petSpecies, fullName, age, cpf, residence, whyAdopt } = req.body;

  if (!petId || !fullName || !age || !cpf || !residence || !whyAdopt) {
    return res.status(400).json({ error: "Todos os campos do cadastro são obrigatórios" });
  }

  const newAdoption = {
    id: "adopt_" + Math.random().toString(36).substring(2, 9),
    petId,
    petName,
    petSpecies,
    fullName,
    age: Number(age),
    cpf,
    residence,
    whyAdopt,
    status: "Pendente",
    createdAt: new Date().toISOString()
  };

  if (!db.adoptions) db.adoptions = [];
  db.adoptions.unshift(newAdoption);

  // Update pet status to "Em Processo"
  const petIdStr = String(petId);
  if (petIdStr.startsWith("cat_")) {
    const idx = (db.cats || []).findIndex((c: any) => c.id === petId);
    if (idx !== -1) db.cats[idx].status = "Em Processo";
  } else if (petIdStr.startsWith("exotic_")) {
    const idx = (db.exotics || []).findIndex((e: any) => e.id === petId);
    if (idx !== -1) db.exotics[idx].status = "Em Processo";
  } else {
    const idx = (db.dogs || []).findIndex((d: any) => d.id === petId);
    if (idx !== -1) db.dogs[idx].status = "Em Processo";
  }

  writeDB(db);
  res.status(201).json(newAdoption);
});

app.put("/api/adoptions/:id", (req, res) => {
  const db = readDB();
  if (!db.adoptions) db.adoptions = [];
  const index = db.adoptions.findIndex((a: any) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Solicitação de adoção não encontrada" });
  }

  db.adoptions[index] = {
    ...db.adoptions[index],
    ...req.body,
    id: db.adoptions[index].id
  };

  const newStatus = req.body.status;
  const petId = db.adoptions[index].petId;
  const petIdStr = String(petId);

  if (newStatus === "Aprovado") {
    if (petIdStr.startsWith("cat_")) {
      const idx = (db.cats || []).findIndex((c: any) => c.id === petId);
      if (idx !== -1) db.cats[idx].status = "Adotado";
    } else if (petIdStr.startsWith("exotic_")) {
      const idx = (db.exotics || []).findIndex((e: any) => e.id === petId);
      if (idx !== -1) db.exotics[idx].status = "Adotado";
    } else {
      const idx = (db.dogs || []).findIndex((d: any) => d.id === petId);
      if (idx !== -1) db.dogs[idx].status = "Adotado";
    }
  } else if (newStatus === "Rejeitado" || newStatus === "Pendente") {
    const activeAdoptionsForPet = db.adoptions.filter((a: any) => a.petId === petId && a.status === "Aprovado" && a.id !== req.params.id);
    const targetStatus = activeAdoptionsForPet.length > 0 ? "Adotado" : (newStatus === "Pendente" ? "Em Processo" : "Disponível");
    
    if (petIdStr.startsWith("cat_")) {
      const idx = (db.cats || []).findIndex((c: any) => c.id === petId);
      if (idx !== -1) db.cats[idx].status = targetStatus;
    } else if (petIdStr.startsWith("exotic_")) {
      const idx = (db.exotics || []).findIndex((e: any) => e.id === petId);
      if (idx !== -1) db.exotics[idx].status = targetStatus;
    } else {
      const idx = (db.dogs || []).findIndex((d: any) => d.id === petId);
      if (idx !== -1) db.dogs[idx].status = targetStatus;
    }
  }

  writeDB(db);
  res.json(db.adoptions[index]);
});

app.delete("/api/adoptions/:id", (req, res) => {
  const db = readDB();
  if (!db.adoptions) db.adoptions = [];
  const initialLen = db.adoptions.length;
  db.adoptions = db.adoptions.filter((a: any) => a.id !== req.params.id);
  if (db.adoptions.length === initialLen) {
    return res.status(404).json({ error: "Solicitação não encontrada" });
  }
  writeDB(db);
  res.json({ success: true, id: req.params.id });
});

// --- FOSTER HOMES (LAR TEMPORÁRIO) ENDPOINTS ---
app.get("/api/foster-homes", (req, res) => {
  const db = readDB();
  res.json(db.fosterHomes || []);
});

app.post("/api/foster-homes", (req, res) => {
  const db = readDB();
  const { fullName, email, phone, city, neighborhood, residenceType, hasPet, petDetails, spaceDescription } = req.body;

  if (!fullName || !email || !phone || !city || !neighborhood || !residenceType || !spaceDescription) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos" });
  }

  const newFosterHome = {
    id: "foster_" + Math.random().toString(36).substring(2, 9),
    fullName,
    email,
    phone,
    city,
    neighborhood,
    residenceType,
    hasPet: !!hasPet,
    petDetails: petDetails || "",
    spaceDescription,
    status: "Disponível",
    createdAt: new Date().toISOString()
  };

  if (!db.fosterHomes) db.fosterHomes = [];
  db.fosterHomes.unshift(newFosterHome);
  writeDB(db);

  res.status(201).json(newFosterHome);
});

app.put("/api/foster-homes/:id", (req, res) => {
  const db = readDB();
  if (!db.fosterHomes) db.fosterHomes = [];
  const index = db.fosterHomes.findIndex((f: any) => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Lar temporário não encontrado" });
  }

  db.fosterHomes[index] = {
    ...db.fosterHomes[index],
    ...req.body,
    id: db.fosterHomes[index].id
  };

  writeDB(db);
  res.json(db.fosterHomes[index]);
});

app.delete("/api/foster-homes/:id", (req, res) => {
  const db = readDB();
  if (!db.fosterHomes) db.fosterHomes = [];
  const initialLen = db.fosterHomes.length;
  db.fosterHomes = db.fosterHomes.filter((f: any) => f.id !== req.params.id);
  if (db.fosterHomes.length === initialLen) {
    return res.status(404).json({ error: "Lar temporário não encontrado" });
  }
  writeDB(db);
  res.json({ success: true, id: req.params.id });
});


// --- AI GENERATION WITH GEMINI ---
app.post("/api/gemini/analyze-dog", async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Chave de API do Gemini não configurada no servidor. Por favor, configure a variável GEMINI_API_KEY."
      });
    }

    const { imageBase64, name, breedInput, sizeInput, genderInput, species } = req.body;
    const petSpecies = species || "Cão";

    let prompt = `Você é um especialista em comportamento animal e marketing para adoção de pets em um abrigo de resgate de animais de estimação.
Sua tarefa é criar um perfil de adoção atraente e emocionante para um(a) ${petSpecies.toLowerCase()} de estimação.
Siga estritamente o esquema JSON de resposta abaixo. Responda APENAS com o objeto JSON estruturado, sem explicações em markdown.

Dado as seguintes informações do animal:
- Espécie: ${petSpecies}
- Nome: ${name || "Desconhecido"}
- Raça sugerida ou presumida: ${breedInput || "Desconhecido/Misto"}
- Porte: ${sizeInput || "Médio"}
- Gênero: ${genderInput || "Desconhecido"}`;

    if (imageBase64) {
      prompt += `\nTambém analise a imagem fornecida deste animal (${petSpecies}) para identificar se a raça ou pelagem aparenta ser outra, cor de pelagem, traços amigáveis e inclua no perfil gerado de maneira coerente para a espécie.`;
    }

    const imageParts = imageBase64 ? [
      {
        inlineData: {
          mimeType: imageBase64.split(";")[0].split(":")[1] || "image/jpeg",
          data: imageBase64.split(",")[1] || imageBase64
        }
      }
    ] : [];

    const textPart = { text: prompt };

    const contents = imageParts.length > 0 ? { parts: [...imageParts, textPart] } : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            breed: { type: Type.STRING, description: "A raça identificada ou confirmada do cachorro." },
            age: { type: Type.STRING, description: "Sugestão de idade estimada, ex: '1 ano', '5 meses', '3 anos'." },
            weight: { type: Type.STRING, description: "Sugestão de peso estimado, ex: '8 kg', '15 kg', '25 kg'." },
            description: { type: Type.STRING, description: "Um texto descritivo e carinhoso de 3 a 5 linhas que apele para o coração de potenciais adotantes e conte uma breve história sobre o comportamento dele." },
            vaccines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de vacinas recomendadas ou já aplicadas para a idade dele (ex: V10 Polivalente, Antirrábica, Giárdia, Gripe Canina)."
            },
            behavior: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 a 5 palavras ou frases curtas sobre o comportamento dele (ex: 'Dócil', 'Ativo', 'Sociável com gatos', 'Silencioso', 'Brincalhão')."
            }
          },
          required: ["breed", "age", "weight", "description", "vaccines", "behavior"]
        }
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Erro ao chamar o Gemini API:", error);
    res.status(500).json({ error: error.message || "Erro ao processar com inteligência artificial" });
  }
});


// ==================== VITE & STATIC FILES ====================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const importDevDependency = new Function(
      "specifier",
      "return import(specifier)"
    ) as (specifier: string) => Promise<typeof import("vite")>;
    const { createServer: createViteServer } = await importDevDependency("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!isServerlessRuntime) {
  startServer();
}
