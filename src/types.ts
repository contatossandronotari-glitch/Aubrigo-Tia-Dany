export type DogSize = 'Pequeno' | 'Médio' | 'Grande';
export type DogStatus = 'Disponível' | 'Adotado' | 'Em Processo';
export type DogGender = 'Macho' | 'Fêmea';

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: string;
  size: DogSize;
  gender: DogGender;
  description: string;
  vaccines: string[];
  status: DogStatus;
  imageUrl: string;
  behavior: string[];
  weight: string;
  createdAt: string;
}

export type VolunteerStatus = 'Pendente' | 'Aprovado' | 'Rejeitado';

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  areas: string[];
  availability: string;
  status: VolunteerStatus;
  createdAt: string;
}

export type DonationPurpose = 'Manutenção do Abrigo' | 'Medicamentos' | 'Geral';
export type PaymentMethod = 'Pix' | 'Cartão' | 'Boleto';

export interface Donation {
  id: string;
  donorName: string;
  email: string;
  amount: number;
  message: string;
  paymentMethod: PaymentMethod;
  purpose: DonationPurpose;
  date: string;
}

export interface DashboardStats {
  totalDogs: number;
  availableDogs: number;
  adoptedDogs: number;
  totalCats: number;
  availableCats: number;
  adoptedCats: number;
  totalExotics: number;
  availableExotics: number;
  adoptedExotics: number;
  totalVolunteers: number;
  pendingVolunteers: number;
  totalDonationsAmount: number;
  donationsByPurpose: {
    maintenance: number;
    medicines: number;
    general: number;
  };
  totalBillsAmount: number;
  paidBillsAmount: number;
  pendingBillsAmount: number;
}

export interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'Pendente' | 'Pago';
  category: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  level: number;
  createdAt: string;
}

export interface AdoptionRequest {
  id: string;
  petId: string;
  petName: string;
  petSpecies: string;
  fullName: string;
  age: number;
  cpf: string;
  residence: string;
  whyAdopt: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  createdAt: string;
}

export interface FosterHome {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  neighborhood: string;
  residenceType: 'Casa' | 'Apartamento' | 'Sítio/Chácara';
  hasPet: boolean;
  petDetails?: string;
  spaceDescription: string;
  status: 'Disponível' | 'Ocupado' | 'Indisponível';
  createdAt: string;
}


