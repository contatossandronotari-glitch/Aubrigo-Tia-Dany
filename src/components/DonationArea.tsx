import React, { useState, useEffect } from "react";
import { HeartHandshake, ShieldCheck, Heart, Copy, Check, QrCode, CreditCard, Sparkles, TrendingUp, Coins, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { DonationPurpose, PaymentMethod, Bill } from "../types";

export default function DonationArea() {
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [purpose, setPurpose] = useState<DonationPurpose>("Geral");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Pix");
  const [message, setMessage] = useState("");
  
  // Simulation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  // Transparency board state
  const [stats, setStats] = useState<any>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loadingTransparency, setLoadingTransparency] = useState(true);

  const fetchTransparencyData = async () => {
    try {
      setLoadingTransparency(true);
      const [resStats, resBills] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/bills")
      ]);
      if (resStats.ok) {
        setStats(await resStats.json());
      }
      if (resBills.ok) {
        setBills(await resBills.json());
      }
    } catch (err) {
      console.error("Erro ao buscar dados de transparência:", err);
    } finally {
      setLoadingTransparency(false);
    }
  };

  useEffect(() => {
    fetchTransparencyData();
  }, []);

  const donationTiers = [
    { value: 20, desc: "Saco de ração ou sachês nutritivos", title: "R$ 20" },
    { value: 50, desc: "Tratamento antipulgas e carrapatos para um cão", title: "R$ 50" },
    { value: 100, desc: "Medicamentos e consulta veterinária de rotina", title: "R$ 100" },
    { value: 200, desc: "Manutenção completa de um box e vacinas anuais", title: "R$ 200" },
  ];

  const handleTierSelect = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    } else {
      setAmount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donorName: donorName || "Doador Anônimo",
          email: email || "anonimo@abrigo.com",
          amount,
          message,
          paymentMethod,
          purpose,
        }),
      });

      if (response.ok) {
        setDonationSuccess(true);
        fetchTransparencyData();
      }
    } catch (error) {
      console.error("Erro ao registrar doação:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText("12988072429");
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleReset = () => {
    setDonationSuccess(false);
    setDonorName("");
    setEmail("");
    setAmount(50);
    setCustomAmount("");
    setMessage("");
  };

  return (
    <div className="space-y-12 py-4" id="donation-view">
      {/* Introduction */}
      <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wide">
            <Heart className="h-3.5 w-3.5 fill-current text-rose-500" />
            Amparo Financeiro & Transparência
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 font-display">
            Sua Doação Salva Vidas
          </h2>
          <p className="text-stone-600 leading-relaxed text-base">
            O <strong>Aubrigo da Tia Dany</strong> sobrevive exclusivamente de doações de pessoas generosas como você. O valor arrecadado é integralmente direcionado para suprir as despesas com ração super premium, exames laboratoriais, medicamentos de uso contínuo, veterinários e manutenção da estrutura dos nossos boxes.
          </p>
        </div>
      </section>

      {/* Donation Flow */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column - Select Value */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6">
          {!donationSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6" id="donation-form">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-stone-900 font-display">1. Escolha o valor da sua contribuição</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {donationTiers.map((tier) => (
                    <button
                      key={tier.value}
                      type="button"
                      onClick={() => handleTierSelect(tier.value)}
                      className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-between h-24 ${
                        amount === tier.value && !customAmount
                          ? "border-amber-500 bg-amber-50/50 text-amber-900 shadow-sm"
                          : "border-stone-200 hover:border-stone-300 bg-stone-50"
                      }`}
                    >
                      <span className="text-xl font-extrabold font-display">{tier.title}</span>
                      <span className="text-[9px] text-stone-500 leading-tight block">{tier.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="relative pt-2">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">R$</div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Outro valor personalizado"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Step 2: Purpose and Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label htmlFor="donation-purpose" className="text-sm font-bold text-stone-800 font-display">2. Destinar contribuição para</label>
                  <select
                    id="donation-purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as DonationPurpose)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="Geral">Fundo Geral (Urgente / Ração)</option>
                    <option value="Medicamentos">Medicamentos e Consultas</option>
                    <option value="Manutenção do Abrigo">Manutenção do Abrigo e Obras</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="donation-method" className="text-sm font-bold text-stone-800 font-display">3. Forma de Pagamento</label>
                  <select
                    id="donation-method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="Pix">Pix (Aprovação Instantânea)</option>
                    <option value="Boleto">Boleto Bancário</option>
                  </select>
                </div>
              </div>

              {/* Step 3: Donor Info */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-stone-900 font-display border-t border-stone-100 pt-4">4. Informações do Doador</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="donor-name" className="text-xs font-bold text-stone-600 block">Nome (Deixe vazio para Anônimo)</label>
                    <input
                      type="text"
                      id="donor-name"
                      placeholder="Ex: Roberto Carlos"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="donor-email" className="text-xs font-bold text-stone-600 block">Seu E-mail (Para comprovante)</label>
                    <input
                      type="email"
                      id="donor-email"
                      placeholder="seu-email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="donor-msg" className="text-xs font-bold text-stone-600 block">Deixe uma mensagem de apoio (Opcional)</label>
                  <textarea
                    id="donor-msg"
                    rows={2}
                    placeholder="Vocês são anjos! Continuem com esse lindo trabalho..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isSubmitting || amount <= 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all text-base shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HeartHandshake className="h-5 w-5" />
                {isSubmitting ? "Processando..." : `Doar R$ ${amount.toLocaleString()} Agora`}
              </button>
            </form>
          ) : (
            /* Successful Donation/Simulation state */
            <div className="text-center py-8 space-y-6" id="donation-success-panel">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-2xl text-stone-900 font-display">Muito Obrigado pela sua generosidade!</h3>
                <p className="text-stone-600 text-sm max-w-md mx-auto">
                  Sua intenção de doação no valor de <strong className="text-emerald-700">R$ {amount.toLocaleString()}</strong> para <strong>{purpose}</strong> foi recebida com sucesso no nosso sistema!
                </p>
              </div>

              {paymentMethod === "Pix" && (
                <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 max-w-sm mx-auto space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-white p-3 border border-stone-200 rounded-2xl shadow-sm">
                      <QrCode className="h-44 w-44 text-stone-800" />
                    </div>
                  </div>
                  <p className="text-xs text-stone-500">
                    Escaneie o QR Code Pix acima pelo app do seu banco ou copie e cole a chave Pix no seu aplicativo de preferência.
                  </p>
                  <div className="p-3 bg-stone-100 rounded-xl text-center border border-stone-200">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Chave Pix (Celular)</p>
                    <p className="text-sm font-extrabold text-stone-800 tracking-tight mt-0.5">12 98807-2429</p>
                  </div>
                  <button
                    onClick={handleCopyPix}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {copiedPix ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        Copiado para a área de transferência!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-stone-400" />
                        Copiar chave Pix "Copia e Cola"
                      </>
                    )}
                  </button>
                </div>
              )}

              {paymentMethod === "Cartão" && (
                <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 max-w-sm mx-auto space-y-3 text-left">
                  <div className="flex gap-2 text-amber-600 items-center">
                    <CreditCard className="h-5 w-5" />
                    <span className="font-bold text-xs uppercase tracking-wider">Simulação de Cartão</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    O pagamento fictício com cartão foi aprovado com sucesso! Nenhuma cobrança real foi efetuada, pois este é um ambiente de demonstração e homologação.
                  </p>
                </div>
              )}

              {paymentMethod === "Boleto" && (
                <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 max-w-sm mx-auto space-y-3">
                  <p className="text-xs text-stone-600">
                    Seu boleto fictício foi gerado com sucesso! Um e-mail de confirmação de registro de doação foi disparado.
                  </p>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
                >
                  Fazer outra doação
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Transparent Destines & Badges */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-stone-800 text-lg font-display">Prestação de Contas</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Mensalmente, o <strong>Aubrigo da Tia Dany</strong> publica de forma transparente o extrato bancário do abrigo e as notas fiscais de medicamentos e rações compradas. Cada centavo é contabilizado.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-700">100% Seguro</h4>
                  <p className="text-[11px] text-stone-400">Ambiente blindado e conexão criptografada.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-700">Comprovante de Doação</h4>
                  <p className="text-[11px] text-stone-400">Você recebe o recibo dedutível direto no seu e-mail cadastrado.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-3xl p-6 space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Sparkles className="h-40 w-40 text-white fill-current" />
            </div>
            <h3 className="font-bold text-lg font-display text-white">Outros jeitos de ajudar</h3>
            <p className="text-xs text-amber-50 leading-relaxed">
              Você também pode doar ração física, sachês, cobertores, cobertores térmicos, coleiras, caminhas ou medicamentos de uso veterinário. Entre em contato pelo nosso WhatsApp para coordenar a entrega!
            </p>
          </div>
        </div>
      </section>

      {/* Transparency Panel: Donations vs Accounts Payable */}
      <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-8" id="financial-transparency-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wider">
              <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
              Transparência em Tempo Real
            </div>
            <h3 className="text-xl font-extrabold text-stone-900 tracking-tight font-display">Para Onde Vai os Recursos?</h3>
            <p className="text-xs text-stone-500">
              Abaixo você pode auditar todas as contas que o Aubrigo precisa pagar neste mês e o progresso da nossa arrecadação.
            </p>
          </div>
          <button
            onClick={fetchTransparencyData}
            className="px-4 py-2 text-xs font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl transition-all cursor-pointer border border-stone-200"
          >
            Atualizar Dados
          </button>
        </div>

        {loadingTransparency ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
            <p className="text-xs text-stone-400 mt-3">Carregando demonstrativo financeiro...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Overview / Graph simulation */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-4">
                <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">Resumo do Mês</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-stone-500">
                    <span>Total de Doações:</span>
                    <span className="font-bold text-stone-800">R$ {stats?.totalDonationsAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-500">
                    <span>Total de Contas:</span>
                    <span className="font-bold text-stone-800">R$ {stats?.totalBillsAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-500 border-t border-stone-200 pt-2">
                    <span>Contas Pagas:</span>
                    <span className="font-semibold text-emerald-600">R$ {stats?.paidBillsAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-500">
                    <span>Contas Pendentes:</span>
                    <span className="font-semibold text-amber-600">R$ {stats?.pendingBillsAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</span>
                  </div>
                </div>

                {/* Health indicator */}
                <div className="pt-2 border-t border-stone-200 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-600">Meta de Cobertura</span>
                    <span className="text-emerald-700">
                      {stats?.totalBillsAmount > 0
                        ? Math.min(100, Math.round((stats.totalDonationsAmount / stats.totalBillsAmount) * 100))
                        : 100}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${stats?.totalBillsAmount > 0
                          ? Math.min(100, (stats.totalDonationsAmount / stats.totalBillsAmount) * 100)
                          : 100}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-stone-400 leading-tight">
                    Cada doação reduz a fila de contas pendentes, garantindo ração no prato e saúde para os animais.
                  </p>
                </div>
              </div>
            </div>

            {/* Bills List / Contas a pagar */}
            <div className="lg:col-span-8 space-y-4">
              <p className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-stone-400" />
                Quadro Detalhado de Contas a Pagar
              </p>

              {bills.length === 0 ? (
                <div className="text-center py-10 bg-stone-50 border border-stone-100 rounded-2xl text-stone-400 text-xs italic">
                  Nenhuma conta pendente ou paga registrada neste mês.
                </div>
              ) : (
                <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100 bg-white">
                  <div className="grid grid-cols-12 gap-2 bg-stone-50 p-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                    <div className="col-span-5 sm:col-span-6">Descrição / Categoria</div>
                    <div className="col-span-3 text-right">Valor</div>
                    <div className="col-span-4 sm:col-span-3 text-right">Status / Vencimento</div>
                  </div>
                  {bills.map((bill) => (
                    <div key={bill.id} className="grid grid-cols-12 gap-2 p-3.5 text-xs items-center hover:bg-stone-50/50 transition-colors">
                      <div className="col-span-5 sm:col-span-6 space-y-1">
                        <span className="font-semibold text-stone-800 block">{bill.description}</span>
                        <span className="inline-block px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded text-[9px] font-semibold uppercase tracking-wider">
                          {bill.category}
                        </span>
                      </div>
                      <div className="col-span-3 text-right font-bold text-stone-800">
                        R$ {bill.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="col-span-4 sm:col-span-3 text-right space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          bill.status === "Pago"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          {bill.status}
                        </span>
                        <span className="text-[10px] text-stone-400 block font-mono">
                          {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
