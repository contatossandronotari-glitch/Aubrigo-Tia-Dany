/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Header from "./components/Header";
import HomeHero from "./components/HomeHero";
import DogCatalog from "./components/DogCatalog";
import DonationArea from "./components/DonationArea";
import VolunteerForm from "./components/VolunteerForm";
import FosterArea from "./components/FosterArea";
import EventsArea from "./components/EventsArea";
import AdminPanel from "./components/AdminPanel";
import { Heart, Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      {/* Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === "home" && <HomeHero setActiveTab={setActiveTab} />}
        {activeTab === "adopt" && (
          <DogCatalog onAdoptRequest={() => setActiveTab("home")} />
        )}
        {activeTab === "foster" && <FosterArea />}
        {activeTab === "events" && <EventsArea />}
        {activeTab === "donations" && <DonationArea />}
        {activeTab === "volunteer" && <VolunteerForm />}
        {activeTab === "admin" && <AdminPanel />}
      </main>

      {/* Styled Footer */}
      <footer className="bg-stone-900 text-stone-300 border-t border-stone-800" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Branding Column */}
            <div className="space-y-4 col-span-1 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500 rounded-lg text-white">
                  <Heart className="h-5 w-5 fill-current" />
                </div>
                <span className="font-display font-extrabold text-white text-lg tracking-tight">
                  Aubrigo da Tia Dany
                </span>
              </div>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Somos um abrigo independente dedicado ao resgate, reabilitação e encaminhamento para adoção responsável de cães, gatos e outros animais em situação de vulnerabilidade e abandono. Cada contribuição sua ajuda a mudar uma vida!
              </p>
            </div>

            {/* Links Column */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider font-display">Apoie nosso trabalho</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => setActiveTab("adopt")}
                    className="hover:text-amber-400 text-stone-400 hover:underline transition-colors cursor-pointer text-left"
                  >
                    Quero Adotar um Pet 🐶🐱🐰
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("donations")}
                    className="hover:text-amber-400 text-stone-400 hover:underline transition-colors cursor-pointer text-left"
                  >
                    Doar para Alimentação / Contas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("volunteer")}
                    className="hover:text-amber-400 text-stone-400 hover:underline transition-colors cursor-pointer text-left"
                  >
                    Seja um Voluntário 🤝
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("foster")}
                    className="hover:text-amber-400 text-stone-400 hover:underline transition-colors cursor-pointer text-left"
                  >
                    Lar Temporário 🏠❤️
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("admin")}
                    className="hover:text-amber-400 text-stone-400 hover:underline transition-colors cursor-pointer text-left"
                  >
                    Portal do Administrador 🔐
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider font-display">Fale Conosco</h4>
              <ul className="space-y-2.5 text-xs text-stone-400">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                  <a
                    href="https://wa.me/5512988072429"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 hover:underline transition-colors font-mono"
                  >
                    12 98807-2429 (WhatsApp)
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                  <a
                    href="mailto:contato@aubrigodatiadany.org"
                    className="hover:text-amber-400 hover:underline transition-colors"
                  >
                    contato@aubrigodatiadany.org
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Shelter Legend / Educational Caption */}
          <div className="mt-8 p-4 bg-stone-800/40 rounded-2xl border border-stone-800 text-[11px] text-stone-500 leading-relaxed">
            <span className="font-bold text-stone-400 block mb-1">LEGENDA DO ABRIGO:</span>
            O <strong>Aubrigo da Tia Dany</strong> é uma iniciativa comunitária de amparo social animal. Resgatamos cães, gatos e pequenos mamíferos ou exóticos, prestando assistência veterinária de emergência, vacinação, castração obrigatória e socialização. Não recebemos verbas governamentais permanentes; nossa atuação é 100% financiada por doações de pessoas físicas dedicadas e do trabalho incansável de nossos voluntários e ajudantes de tela. Cada animal adotado abre espaço para salvarmos mais uma vida das ruas.
          </div>

          <div className="mt-8 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-stone-500">
              &copy; {new Date().getFullYear()} Aubrigo da Tia Dany. Todos os direitos reservados. Projeto sem fins lucrativos de proteção e bem-estar animal.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/aubrigodatiadany_" target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
