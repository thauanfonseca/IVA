
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line
} from 'recharts';
import {
  TrendingUp, Users, DollarSign, ChevronRight,
  BarChart3, Info, Sparkles, LayoutDashboard,
  Maximize2, Minimize2, ChevronLeft, Award, Target, Search, ArrowRight
} from 'lucide-react';
import { municipalities } from './data';
import { MunicipalityData } from './types';
import { getMunicipalityInsight } from './geminiService';

const App: React.FC = () => {
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityData | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Stats for the "State Overview" (when nothing is selected)
  const stats = useMemo(() => {
    const totalRepasse = municipalities.reduce((acc, curr) => acc + curr.projecaoRepasse, 0);
    const avgGrowth = municipalities.reduce((acc, curr) => acc + curr.variacaoDefinito2024, 0) / municipalities.length;
    const totalContribuicao = municipalities.reduce((acc, curr) => acc + curr.contribuicaoTotal, 0);
    return { totalRepasse, avgGrowth, totalContribuicao, count: municipalities.length };
  }, []);

  // Filter and Sort for Sidebar
  const filteredMunicipalities = useMemo(() => {
    return municipalities
      .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.variacaoDefinito2024 - a.variacaoDefinito2024);
  }, [searchTerm]);

  const handleMunicipalityClick = async (m: MunicipalityData) => {
    setSelectedMunicipality(m);
    setInsight(null);
    setIsInsightLoading(true);
    // Silent fetch - doesn't block UI
    try {
      const result = await getMunicipalityInsight(m);
      setInsight(result);
    } catch (e) {
      console.error(e);
      setInsight("Não foi possível carregar o insight.");
    } finally {
      setIsInsightLoading(false);
    }
  };

  const nextMunicipality = () => {
    if (!selectedMunicipality) return;
    const idx = filteredMunicipalities.findIndex(m => m.name === selectedMunicipality.name);
    const next = filteredMunicipalities[(idx + 1) % filteredMunicipalities.length];
    handleMunicipalityClick(next);
  };

  const prevMunicipality = () => {
    if (!selectedMunicipality) return;
    const idx = filteredMunicipalities.findIndex(m => m.name === selectedMunicipality.name);
    const prev = filteredMunicipalities[(idx - 1 + filteredMunicipalities.length) % filteredMunicipalities.length];
    handleMunicipalityClick(prev);
  };

  const historicalData = useMemo(() => {
    if (!selectedMunicipality) return [];
    return [
      { year: '2022', iva: selectedMunicipality.iva2022 },
      { year: '2023', iva: selectedMunicipality.iva2023 },
      { year: '2024', iva: selectedMunicipality.iva2024 },
    ];
  }, [selectedMunicipality]);

  // --- Presentation Mode View ---
  if (isPresenting && selectedMunicipality) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col text-white animate-in fade-in duration-500 overflow-hidden">
        {/* Presentation Header */}
        <div className="p-6 flex justify-between items-center border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsPresenting(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
              <Minimize2 className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white leading-none">{selectedMunicipality.name}</h1>
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">Modo Apresentação Executiva</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMunicipality} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"><ChevronLeft /></button>
            <button onClick={nextMunicipality} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"><ChevronRight /></button>
          </div>
        </div>

        {/* Presentation Grid */}
        <div className="flex-1 grid grid-cols-12 gap-8 p-10 overflow-y-auto">
          {/* Left Column: Big Numbers */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-8 flex-1">
              <div className="bg-indigo-600/20 border border-indigo-500/30 p-10 rounded-[2rem] backdrop-blur-sm flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <DollarSign className="w-32 h-32" />
                </div>
                <p className="text-indigo-300 font-bold uppercase tracking-widest text-sm mb-2">Projeção de Repasse 25/26</p>
                <h2 className="text-5xl xl:text-7xl font-black tracking-tighter">R$ {selectedMunicipality.projecaoRepasse.toLocaleString('pt-BR')}</h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2rem] flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-full ${selectedMunicipality.variacaoDefinito2024 > 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    <TrendingUp className={`w-8 h-8 ${selectedMunicipality.variacaoDefinito2024 > 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                  </div>
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Performance</span>
                </div>
                <h2 className={`text-5xl font-black tracking-tighter ${selectedMunicipality.variacaoDefinito2024 > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedMunicipality.variacaoDefinito2024 > 0 ? '+' : ''}{selectedMunicipality.variacaoDefinito2024.toFixed(2)}%
                </h2>
              </div>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 flex-1 min-h-[400px]">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-200">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Trajetória do IVA (2022-2024)
              </h3>
              <div className="h-[300px] xl:h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 14 }} tickMargin={15} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }} />
                    <Line type="monotone" dataKey="iva" stroke="#6366f1" strokeWidth={6} dot={{ r: 8, fill: '#6366f1', strokeWidth: 4, stroke: '#0f172a' }} activeDot={{ r: 12 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: Insights & Details */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <div className="bg-gradient-to-br from-indigo-900/80 to-slate-900 p-8 rounded-[2rem] border border-indigo-500/30 flex-1 relative overflow-hidden">
              <Sparkles className="w-32 h-32 text-indigo-400 absolute -top-10 -right-10 opacity-10 blur-xl" />
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-white">
                <span className="p-2 bg-indigo-500 rounded-lg"><Target className="w-5 h-5 text-white" /></span>
                Estratégia do Gestor
              </h3>

              {isInsightLoading ? (
                <div className="space-y-4 animate-pulse mt-10">
                  <div className="h-4 bg-indigo-400/20 rounded w-full"></div>
                  <div className="h-4 bg-indigo-400/20 rounded w-5/6"></div>
                  <div className="h-4 bg-indigo-400/20 rounded w-4/6"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-transparent opacity-50"></div>
                  <p className="text-xl lg:text-2xl leading-relaxed text-indigo-100 font-medium italic">
                    "{insight}"
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Ranking Estadual</p>
                  <p className="text-xl font-black text-white">{filteredMunicipalities.findIndex(m => m.name === selectedMunicipality.name) + 1}º Posição</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm py-3 border-b border-white/5">
                  <span className="text-slate-400">Total Incremento IPM</span>
                  <span className="font-mono font-bold text-white">{selectedMunicipality.incrementoIpm.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm py-3 border-b border-white/5">
                  <span className="text-slate-400">Contribuição VA</span>
                  <span className="font-mono font-bold text-emerald-400">R$ {(selectedMunicipality.contribuicaoTotal / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Dashboard Layout ---
  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-200 flex overflow-hidden font-sans selection:bg-indigo-500/30">

      {/* Sidebar */}
      <div className="w-96 flex flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl z-20 shadow-2xl">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-6 text-indigo-400">
            <LayoutDashboard className="w-6 h-6" />
            <span className="font-black tracking-tight text-white text-lg">GESTÃO FAZENDÁRIA</span>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Buscar município..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">
            {filteredMunicipalities.length} Municípios
          </div>
          {filteredMunicipalities.map(m => (
            <button
              key={m.name}
              onClick={() => handleMunicipalityClick(m)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${selectedMunicipality?.name === m.name
                ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/20'
                : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-800 hover:border-slate-700'
                }`}
            >
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <h4 className={`font-bold ${selectedMunicipality?.name === m.name ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{m.name}</h4>
                  <p className={`text-xs mt-1 ${selectedMunicipality?.name === m.name ? 'text-indigo-200' : 'text-slate-500'}`}>
                    Projeção: R$ {(m.projecaoRepasse / 1000).toFixed(0)}k
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black px-2 py-1 rounded-lg ${m.variacaoDefinito2024 > 0
                    ? (selectedMunicipality?.name === m.name ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-400')
                    : (selectedMunicipality?.name === m.name ? 'bg-white/20 text-white' : 'bg-red-500/10 text-red-400')
                    }`}>
                    {m.variacaoDefinito2024 > 0 ? '↑' : '↓'} {Math.abs(m.variacaoDefinito2024).toFixed(1)}%
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {selectedMunicipality ? (
          // --- Detail View ---
          <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative z-10">
            <header className="flex justify-between items-start mb-12">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setSelectedMunicipality(null)} className="md:hidden p-2 bg-slate-800 rounded-lg text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                    Dados Auditados 2024
                  </span>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                    IVA: {selectedMunicipality.iva2024.toFixed(4)}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">{selectedMunicipality.name}</h1>
                <p className="text-slate-400">Relatório técnico consolidado para o exercício 2025/2026.</p>
              </div>
              <button
                onClick={() => setIsPresenting(true)}
                className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white pl-6 pr-4 py-3 rounded-full font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
              >
                INICIAR APRESENTAÇÃO
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Card Projeção */}
              <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600/20 to-indigo-900/10 border border-indigo-500/20 rounded-[2rem] p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs mb-2">Estimativa de Receita (Anual)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-6xl font-black text-white">R$ {selectedMunicipality.projecaoRepasse.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="mt-6 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      <span className="text-slate-300">Cenário Conservador</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span className="text-slate-300">Base: IPM {selectedMunicipality.ipm2026.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
                <DollarSign className="absolute -right-8 -bottom-8 w-48 h-48 text-indigo-500/10 rotate-12" />
              </div>

              {/* Card Variação */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 flex flex-col justify-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Crescimento Real</p>
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${selectedMunicipality.variacaoDefinito2024 > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    {selectedMunicipality.variacaoDefinito2024 > 0
                      ? <TrendingUp className="w-8 h-8 text-emerald-500" />
                      : <TrendingUp className="w-8 h-8 text-red-500" />
                    }
                  </div>
                  <div>
                    <span className={`text-3xl font-black ${selectedMunicipality.variacaoDefinito2024 > 0 ? 'text-white' : 'text-red-400'}`}>
                      {selectedMunicipality.variacaoDefinito2024 > 0 ? '+' : ''}{selectedMunicipality.variacaoDefinito2024.toFixed(2)}%
                    </span>
                    <p className="text-xs text-slate-500 mt-1">vs. exercício anterior</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart Area */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Histórico do Índice (3 Anos)
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="year" stroke="#475569" tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" tickLine={false} axisLine={false} width={80} tickFormatter={(val) => val.toFixed(4)} />
                      <Tooltip
                        cursor={{ fill: '#ffffff05' }}
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                      />
                      <Bar dataKey="iva" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={60}>
                        {historicalData.map((entry, index) => (
                          <Cell key={index} fill={index === 2 ? '#6366f1' : '#334155'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Insight Area */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 relative">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Análise Inteligente
                </h3>
                {isInsightLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                  </div>
                ) : (
                  <blockquote className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-400 to-transparent"></div>
                    <p className="pl-6 text-slate-300 leading-relaxed italic text-lg">
                      "{insight || "Carregando a análise do consultor virtual..."}"
                    </p>
                    <footer className="pl-6 mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      — Assistente Fazendário
                    </footer>
                  </blockquote>
                )}
              </div>
            </div>

          </main>
        ) : (
          // --- Empty State / Dashboard Overview ---
          <main className="flex-1 overflow-y-auto p-12 flex flex-col items-center justify-center text-center relative z-10">
            <div className="max-w-3xl w-full">
              <div className="mb-12">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 rotate-3">
                  <LayoutDashboard className="w-10 h-10 text-indigo-400" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">Visão Global do Estado</h1>
                <p className="text-xl text-slate-400">Selecione um município na barra lateral para acessar o relatório detalhado.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/50 transition-colors cursor-default">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Repasses</p>
                  <p className="text-2xl font-black text-white">R$ {(stats.totalRepasse / 1000000).toFixed(0)}M</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/50 transition-colors cursor-default">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Crescimento Médio</p>
                  <p className="text-2xl font-black text-emerald-400">+{stats.avgGrowth.toFixed(2)}%</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/50 transition-colors cursor-default">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Municípios</p>
                  <p className="text-2xl font-black text-indigo-400">{stats.count}</p>
                </div>
              </div>

              <div className="mt-12 opacity-50 flex items-center justify-center gap-2 text-sm text-slate-600">
                <ArrowRight className="w-4 h-4 animate-bounce-x" />
                Use a busca lateral para encontrar cidades
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default App;
