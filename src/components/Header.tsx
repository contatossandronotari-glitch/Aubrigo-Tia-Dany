import React, { useState } from "react";
import { Heart, Menu, X, ShieldAlert, HeartHandshake, UserCheck, Search, Home, Calendar } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Início", icon: Heart },
    { id: "adopt", label: "Quero Adotar", icon: Search },
    { id: "foster", label: "Lar Temporário", icon: Home },
    { id: "events", label: "Eventos", icon: Calendar },
    { id: "donations", label: "Apoiar (Doações)", icon: HeartHandshake },
    { id: "volunteer", label: "Ser Voluntário", icon: UserCheck },
    { id: "admin", label: "Painel Admin", icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => { setActiveTab("home"); setIsOpen(false); }}
            id="header-logo"
          >
            <div className="p-2 bg-amber-500 rounded-xl text-white group-hover:scale-110 transition-transform">
              <Heart className="h-6 w-6 fill-current" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-stone-900 block leading-none">Aubrigo da Tia Dany</span>
              <span className="text-[10px] text-stone-500 font-mono tracking-widest block uppercase">Amparo & Adoção</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1" id="desktop-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Contact Highlight Button (Desktop) */}
          <div className="hidden lg:flex items-center" id="header-cta">
            <a
              href="https://wa.me/5512988072429?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20como%20adotar."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Fale Conosco
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              id="mobile-menu-toggle"
              className="p-2 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-stone-200" id="mobile-menu">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-item-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? "bg-amber-500 text-white"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
            <div className="pt-4 pb-2 border-t border-stone-100 px-4">
              <a
                href="https://wa.me/5512988072429?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20como%20adotar."
                target="_blank"
                rel="noreferrer"
                className="w-full flex justify-center py-2.5 px-4 rounded-xl text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 text-center"
              >
                Fale Conosco no WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
