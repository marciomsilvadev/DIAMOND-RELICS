'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RelayBar } from '@/components/RelayBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImageModal } from '@/components/ImageModal';
import { RELIC_IMAGES } from '@/lib/relics-data';
import { addStoredOrder, OrderItem } from '@/lib/products-store';

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'ted'>('pix');
  const [installments, setInstallments] = useState('12');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Form State
  const [buyerName, setBuyerName] = useState('Marcio da Silva');
  const [buyerDoc, setBuyerDoc] = useState('321.654.987-00');
  const [buyerEmail, setBuyerEmail] = useState('marcio.silva@colecionadores.com.br');
  const [buyerPhone, setBuyerPhone] = useState('(11) 98765-4321');

  // Address
  const [cep, setCep] = useState('01419-000');
  const [street, setStreet] = useState('Alameda Santos');
  const [number, setNumber] = useState('1800');
  const [complement, setComplement] = useState('Cobertura');
  const [neighborhood, setNeighborhood] = useState('Cerqueira César');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');

  // Card Form
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 8842');
  const [cardHolder, setCardHolder] = useState('MARCIO SILVA');
  const [cardExpiry, setCardExpiry] = useState('11/29');
  const [cardCvv, setCardCvv] = useState('884');

  // Confirmation Modal
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
    subtitle: '',
  });

  const basePrice = 4850000;
  const pixDiscount = 242500; // 5%
  const finalPrice = paymentMethod === 'pix' ? basePrice - pixDiscount : basePrice;

  const handleFinishOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      alert('Por favor, aceite os Termos de Venda e Garantia de Entrega para prosseguir.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const newOrder: OrderItem = {
        id: `PED-${Math.floor(10000 + Math.random() * 90000)}`,
        productTitle: 'Camisa Oficial Final Copa 1970 Usada em Jogo por Pelé',
        productId: 'pel-1970',
        sku: 'PROD-1970-MEX-10',
        buyerName: buyerName.trim() || 'Comprador Particular',
        buyerDoc: buyerDoc.trim() || 'Não informado',
        buyerEmail: buyerEmail.trim() || 'contato@cliente.com',
        buyerPhone: buyerPhone.trim() || '(11) 99999-9999',
        city: city.trim() || 'São Paulo',
        state: state.trim() || 'SP',
        date: new Date().toLocaleDateString('pt-BR'),
        totalBRL: finalPrice,
        paymentMethod:
          paymentMethod === 'pix'
            ? 'PIX (5% OFF)'
            : paymentMethod === 'cartao'
            ? `Cartão (${installments}x)`
            : 'TED / Transferência',
        status:
          paymentMethod === 'pix'
            ? 'Aguardando Pagamento PIX'
            : 'Pagamento Aprovado • Em Transporte Blindado',
        statusColor:
          paymentMethod === 'pix'
            ? 'text-[#f2ca50] bg-[#f2ca50]/10 border-[#f2ca50]/30'
            : 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30',
      };

      addStoredOrder(newOrder);
      setIsProcessing(false);
      setOrderConfirmed(true);
    }, 1200);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(
      '00020126580014br.gov.bcb.pix01364891284000019252040000530398654074607500.005802BR5925DIAMOND RELICS BRASIL LTDA6009SAO PAULO62070503***630489A1'
    );
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const openImage = (imageUrl: string, title: string, subtitle?: string) => {
    setModalData({
      isOpen: true,
      imageUrl,
      title,
      subtitle,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B] text-[#e2e2e6] selection:bg-[#d4af37] selection:text-[#08090B]">
      {/* 1. Global Navigation Relay Bar */}
      <RelayBar />

      {/* Main Top Institutional Nav Bar */}
      <Navbar cartCount={1} />

      {/* Header do Checkout */}
      <section className="w-full bg-[#12151B] border-b border-[#282E3A] py-6 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#08090B] border border-[#f2ca50] flex items-center justify-center text-[#f2ca50] shrink-0">
              <span className="material-symbols-outlined text-2xl">lock</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
                Finalização de Compra Segura
              </h1>
              <p className="text-xs font-['Space_Grotesk'] text-[#10B981] flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Ambiente Criptografado SSL 256-bit • Pagamento Seguro em Reais (R$)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
            <span className="bg-[#08090B] px-3 py-1 rounded border border-[#282E3A]">
              PEDIDO #DRB-98402
            </span>
          </div>
        </div>
      </section>

      {/* Main Checkout Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <form onSubmit={handleFinishOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Forms */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Dados do Comprador */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#282E3A]">
                <span className="w-6 h-6 rounded-full bg-[#f2ca50] text-[#08090B] flex items-center justify-center text-xs font-bold font-['Space_Grotesk']">
                  1
                </span>
                <h2 className="text-sm font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wide">
                  Dados do Titular da Compra
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                    CPF ou CNPJ (para Nota Fiscal)
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerDoc}
                    onChange={(e) => setBuyerDoc(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                    E-mail para Recebimento da NFe
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                    Telefone / WhatsApp para Confirmação
                  </label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Endereço de Entrega */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#282E3A]">
                <span className="w-6 h-6 rounded-full bg-[#f2ca50] text-[#08090B] flex items-center justify-center text-xs font-bold font-['Space_Grotesk']">
                  2
                </span>
                <h2 className="text-sm font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wide">
                  Endereço de Entrega Segura (Escolta Blindada)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    required
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                    Logradouro (Rua / Avenida)
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div className="sm:col-span-3 bg-[#08090B] p-3 rounded border border-[#282E3A] flex items-center gap-2 text-xs font-['Space_Grotesk'] text-[#10B981]">
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>Frete Grátis com Transporte Blindado Brink&apos;s e Seguro Lloyd&apos;s até R$ 50.000.000,00</span>
                </div>
              </div>
            </div>

            {/* 3. Forma de Pagamento */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#282E3A]">
                <span className="w-6 h-6 rounded-full bg-[#f2ca50] text-[#08090B] flex items-center justify-center text-xs font-bold font-['Space_Grotesk']">
                  3
                </span>
                <h2 className="text-sm font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wide">
                  Forma de Pagamento em Reais (R$)
                </h2>
              </div>

              {/* Seletor de Método */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: 'pix',
                    label: 'PIX',
                    badge: '5% OFF',
                    desc: 'Aprovação Imediata',
                    icon: 'qr_code_2',
                  },
                  {
                    id: 'cartao',
                    label: 'Cartão',
                    badge: 'Até 12x',
                    desc: 'Crédito Alta Renda',
                    icon: 'credit_card',
                  },
                  {
                    id: 'ted',
                    label: 'TED / Boleto',
                    badge: 'Express',
                    desc: 'Grandes Contas',
                    icon: 'account_balance',
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      paymentMethod === m.id
                        ? 'bg-[#1A1E26] border-[#f2ca50] shadow-[0_0_15px_rgba(242,202,80,0.15)] ring-1 ring-[#f2ca50]'
                        : 'bg-[#08090B] border-[#282E3A] hover:border-[#9CA3AF]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="material-symbols-outlined text-xl text-[#f2ca50]">
                        {m.icon}
                      </span>
                      <span className="text-[10px] font-bold font-['Space_Grotesk'] text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.5 rounded">
                        {m.badge}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] block">
                      {m.label}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF] block">{m.desc}</span>
                  </button>
                ))}
              </div>

              {/* Painel PIX */}
              {paymentMethod === 'pix' && (
                <div className="bg-[#08090B] border border-[#10B981]/40 rounded-lg p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#10B981] font-['Space_Grotesk'] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Desconto de 5% Aplicado no PIX
                    </span>
                    <span className="text-xs font-bold text-[#f2ca50] font-['Space_Grotesk']">
                      Economia de R$ 242.500,00
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] font-['Manrope']">
                    Ao confirmar o pedido, o QR Code de liquidação imediata e a chave Copia-e-Cola serão gerados na tela. O processamento é instantâneo via Banco Central.
                  </p>
                </div>
              )}

              {/* Painel Cartão de Crédito */}
              {paymentMethod === 'cartao' && (
                <div className="bg-[#08090B] border border-[#282E3A] rounded-lg p-4 space-y-4 animate-fadeIn">
                  <div>
                    <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                      Parcelamento no Cartão
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                      className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    >
                      <option value="1">1x de R$ 4.850.000,00 sem juros</option>
                      <option value="3">3x de R$ 1.616.666,66 sem juros</option>
                      <option value="6">6x de R$ 808.333,33 sem juros</option>
                      <option value="12">12x de R$ 404.166,66 sem juros (Recomendado)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                        Número do Cartão
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                        Nome no Cartão
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                          Validade
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] block mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Painel TED */}
              {paymentMethod === 'ted' && (
                <div className="bg-[#08090B] border border-[#282E3A] rounded-lg p-4 space-y-2 animate-fadeIn text-xs font-['Space_Grotesk']">
                  <span className="text-[#F4F1EA] font-bold block">
                    Dados Bancários Oficiais para Transferência / TED:
                  </span>
                  <p className="text-[#9CA3AF]">Banco: 001 - Banco do Brasil S.A. | Agência: 1840-2</p>
                  <p className="text-[#9CA3AF]">Conta Corrente: 98402-1 | Favorecido: Diamond Relics Brasil Ltda.</p>
                  <p className="text-[#9CA3AF]">CNPJ: 48.912.840/0001-92</p>
                  <p className="text-[#10B981]">Compensação no mesmo dia útil com emissão imediata da NFe.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-6 space-y-5 sticky top-24">
              <h3 className="text-sm font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider pb-3 border-b border-[#282E3A]">
                Resumo do Pedido
              </h3>

              {/* Item Card */}
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded border border-[#282E3A] overflow-hidden bg-[#08090B] shrink-0">
                  <img
                    src={RELIC_IMAGES.pele1970Catalog}
                    alt="Camisa Oficial Pelé 1970"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-['Space_Grotesk'] text-[#C59B27] block font-semibold uppercase">
                    PROD-1970-MEX-10
                  </span>
                  <h4 className="text-xs font-bold text-[#F4F1EA] font-['Playfair_Display'] truncate">
                    Camisa Oficial Pelé Final Copa 1970
                  </h4>
                  <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                    Qtd: 1 un. • Com Laudo e Moldura Anti-UV
                  </span>
                </div>
              </div>

              {/* Valores em Reais */}
              <div className="space-y-2 pt-3 border-t border-[#282E3A] text-xs font-['Space_Grotesk']">
                <div className="flex justify-between text-[#9CA3AF]">
                  <span>Subtotal do Produto:</span>
                  <span>R$ {basePrice.toLocaleString('pt-BR')},00</span>
                </div>

                {paymentMethod === 'pix' && (
                  <div className="flex justify-between text-[#10B981]">
                    <span>Desconto PIX (5%):</span>
                    <span>- R$ {pixDiscount.toLocaleString('pt-BR')},00</span>
                  </div>
                )}

                <div className="flex justify-between text-[#9CA3AF]">
                  <span>Frete com Escolta Armada:</span>
                  <span className="text-[#10B981] font-semibold">Grátis (Cortesia)</span>
                </div>

                <div className="flex justify-between text-[#9CA3AF]">
                  <span>Seguro Lloyd&apos;s (100%):</span>
                  <span className="text-[#10B981] font-semibold">Incluso</span>
                </div>

                <div className="pt-3 border-t border-[#282E3A] flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#F4F1EA]">Total em Reais:</span>
                  <div className="text-right">
                    <span className="text-2xl font-['Playfair_Display'] font-bold text-[#f2ca50]">
                      R$ {finalPrice.toLocaleString('pt-BR')},00
                    </span>
                    {paymentMethod === 'cartao' && (
                      <span className="text-[10px] text-[#9CA3AF] block">
                        ou em 12x de R$ 404.166,66 sem juros
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Termos de Garantia e CDC */}
              <label className="flex items-start gap-2 text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="rounded border-[#282E3A] bg-[#08090B] text-[#f2ca50] focus:ring-0 mt-0.5"
                />
                <span>
                  Declaro estar ciente dos termos de compra, certificado de autenticidade vitalício e entrega blindada com emissão de NF-e.
                </span>
              </label>

              {/* Botão de Finalizar */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider rounded-lg transition-all shadow-[0_0_20px_rgba(242,202,80,0.25)] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">
                  {isProcessing ? 'autorenew' : 'check_circle'}
                </span>
                <span>
                  {isProcessing ? 'Processando Pedido...' : 'Finalizar Pedido e Pagar'}
                </span>
              </button>

              <div className="text-center">
                <Link
                  href="/catalog"
                  className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] hover:text-[#f2ca50] transition-colors"
                >
                  ← Continuar Comprando no Catálogo
                </Link>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Modal de Pedido Concluído com Sucesso */}
      {orderConfirmed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08090B]/95 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#12151B] border border-[#f2ca50] rounded-lg max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#10B981]/15 border border-[#10B981] rounded-full flex items-center justify-center text-[#10B981] mx-auto">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h2 className="text-2xl font-bold font-['Playfair_Display'] text-[#F4F1EA]">
                Pedido Realizado com Sucesso!
              </h2>
              <p className="text-xs font-['Space_Grotesk'] text-[#E5C875]">
                Número do Pedido: <strong>#DRB-98402</strong> • Protocolo Registrado
              </p>
            </div>

            {paymentMethod === 'pix' ? (
              <div className="bg-[#08090B] border border-[#282E3A] p-5 rounded-lg space-y-4 text-center">
                <span className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase block">
                  Pague com PIX para Confirmação Imediata
                </span>
                <div className="w-44 h-44 bg-white p-2.5 rounded mx-auto flex items-center justify-center">
                  {/* QR Code Simulado com SVG nítido */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,10 h20 v10 h-20 z M40,40 h20 v20 h-20 z M70,40 h10 v10 h-10 z M70,70 h20 v10 h-20 z M40,70 h10 v20 h-10 z M60,70 h10 v10 h-10 z M80,80 h20 v20 h-20 z"
                      fill="#08090B"
                    />
                  </svg>
                </div>
                <div className="text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                  Total a pagar: <strong className="text-[#f2ca50] text-sm">R$ 4.607.500,00</strong>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="00020126580014br.gov.bcb.pix01364891284000019252040000530398654074607500.005802BR"
                    className="flex-1 bg-[#12151B] border border-[#282E3A] rounded px-3 py-1.5 text-xs text-[#9CA3AF] font-mono"
                  />
                  <button
                    onClick={handleCopyPix}
                    className="px-4 py-1.5 bg-[#f2ca50] text-[#08090B] font-bold text-xs rounded font-['Space_Grotesk'] hover:bg-[#E5C875] transition-colors shrink-0"
                  >
                    {pixCopied ? 'Copiado!' : 'Copiar PIX'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#08090B] border border-[#282E3A] p-4 rounded-lg text-xs font-['Space_Grotesk'] space-y-2">
                <span className="text-[#10B981] font-bold block">
                  Pagamento Aprovado com Sucesso!
                </span>
                <p className="text-[#9CA3AF]">
                  O comprovante e a Nota Fiscal Eletrônica foram enviados para <strong>{buyerEmail}</strong>.
                </p>
              </div>
            )}

            <div className="space-y-2 text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
              <div className="flex justify-between py-1 border-b border-[#282E3A]">
                <span>Previsão de Entrega Blindada:</span>
                <span className="text-[#F4F1EA]">3 dias úteis</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#282E3A]">
                <span>Transportadora de Valores:</span>
                <span className="text-[#F4F1EA]">Brink&apos;s Global Especial</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#282E3A]">
                <span>Certificado de Autenticidade:</span>
                <span className="text-[#10B981]">Emitido e Lacre Físico #COA-9801</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link
                href="/catalog"
                className="px-5 py-2.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-bold text-xs uppercase font-['Space_Grotesk'] rounded transition-colors"
              >
                Voltar à Loja
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Foto */}
      <ImageModal
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ ...modalData, isOpen: false })}
        imageUrl={modalData.imageUrl}
        title={modalData.title}
        subtitle={modalData.subtitle}
      />

      {/* Rodapé Oficial */}
      <Footer />
    </div>
  );
}
