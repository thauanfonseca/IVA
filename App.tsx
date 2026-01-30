
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, ChevronRight, 
  Map as MapIcon, ArrowUpRight, BarChart3, Info, Sparkles, LayoutDashboard,
  Maximize2, Minimize2, ChevronLeft, Award, Target
} from 'lucide-react';
import { municipalities } from './data';
import { MunicipalityData } from './types';
import { getMunicipalityInsight } from './geminiService';

const App: React.FC = () => {
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityData | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'variacao' | 'repasse'>('variacao');

  const stats = useMemo(() => {
    const totalRepasse = municipalities.reduce((acc, curr) => acc + curr.projecaoRepasse, 0);
    const avgGrowth = municipalities.reduce((acc, curr) => acc + curr.variacaoDefinito2024, 0) / municipalities.length;
    const totalContribuicao = municipalities.reduce((acc, curr) => acc + curr.contribuicaoTotal, 0);
    return { totalRepasse, avgGrowth, totalContribuicao, count: municipalities.length };
  }, []);

  const sortedMunicipalities = useMemo(() => {
    return [...municipalities].sort((a, b) => {
      if (sortBy === 'variacao') return b.variacaoDefinito2024 - a.variacaoDefinito2024;
      if (sortBy === 'repasse') return b.projecaoRepasse - a.projecaoRepasse;
      return a.name.localeCompare(b.name);
    });
  }, [sortBy]);

  const handleMunicipalityClick = async (m: MunicipalityData) => {
    setSelectedMunicipality(m);
    setInsight(null);
    setIsInsightLoading(true);
    const result = await getMunicipalityInsight(m);
    setInsight(result);
    setIsInsightLoading(false);
  };

  const nextMunicipality = () => {
    const idx = sortedMunicipalities.findIndex(m => m.name === selectedMunicipality?.name);
    const next = sortedMunicipalities[(idx + 1) % sortedMunicipalities.length];
    handleMunicipalityClick(next);
  };

  const prevMunicipality = () => {
    const idx = sortedMunicipalities.findIndex(m => m.name === selectedMunicipality?.name);
    const prev = sortedMunicipalities[(idx - 1 + sortedMunicipalities.length) % sortedMunicipalities.length];
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

  if (isPresenting && selectedMunicipality) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col text-white animate-in fade-in duration-500">
        <div className="p-8 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsPresenting(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Minimize2 className="w-6 h-6 text-indigo-400" />
            </button>
            <h1 className="text-3xl font-black tracking-tight text-white">{selectedMunicipality.name}</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={prevMunicipality} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"><ChevronLeft /></button>
            <button onClick={nextMunicipality} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"><ChevronRight /></button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-8 p-12 overflow-y-auto">
          {/* Main Slide Data */}
          <div className="col-span-8 space-y-12">
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-indigo-600/20 border border-indigo-500/30 p-10 rounded-3xl backdrop-blur-sm">
                <p className="text-indigo-300 font-bold uppercase tracking-widest text-sm mb-4">Projeção de Repasse</p>
                <h2 className="text-6xl font-black">R$ {selectedMunicipality.projecaoRepasse.toLocaleString('pt-BR')}</h2>
                <div className="mt-8 flex items-center gap-2 text-emerald-400 font-bold text-xl">
                    <TrendingUp className="w-6 h-6" />
                    <span>{selectedMunicipality.variacaoDefinito2024 > 0 ? '+' : ''}{selectedMunicipality.variacaoDefinito2024.toFixed(2)}% de Variação</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-white/5 p-10 rounded-3xl">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4">Contribuição de VA Detectada</p>
                <h2 className="text-5xl font-black text-amber-400">R$ {selectedMunicipality.contribuicaoTotal.toLocaleString('pt-BR')}</h2>
                <p className="mt-4 text-slate-400">Impacto direto no IPM de 2026</p>
              </div>
            </div>

            <div className="bg-slate-900/50 p-10 rounded-3xl border border-white/5">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    Evolução do Índice de Valor Adicionado (IVA)
                </h3>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="year" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                            <Line type="monotone" dataKey="iva" stroke="#6366f1" strokeWidth={5} dot={{ r: 8, fill: '#6366f1' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>

          {/* Side Slide Data */}
          <div className="col-span-4 space-y-8">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                    <Award className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Desempenho Técnico</h3>
                <p className="text-slate-400 text-sm mb-6">Posição no grupo: {sortedMunicipalities.findIndex(m => m.name === selectedMunicipality.name) + 1}º Lugar</p>
                
                <div className="w-full space-y-4">
                    <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                        <span>Eficiência</span>
                        <span>{Math.abs(selectedMunicipality.variacaoDefinito2024).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                        <div 
                            className="bg-indigo-500 h-full" 
                            style={{ width: `${Math.min(100, Math.abs(selectedMunicipality.variacaoDefinito2024))}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                <Sparkles className="w-12 h-12 text-indigo-400 absolute -top-4 -right-4 opacity-20" />
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    Insight para o Prefeito
                </h3>
                {isInsightLoading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-white/10 rounded w-full"></div>
                        <div className="h-4 bg-white/10 rounded w-5/6"></div>
                    </div>
                ) : (
                    <p className="text-lg leading-relaxed text-indigo-50 italic">
                        "{insight}"
                    </p>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Profissional */}
      <header className="bg-slate-900 text-white shadow-2xl py-6 px-8 sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Cenário Fazendário 2024</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Dados Auditados - Municípios Baianos
            </p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
            <div className="hidden md:flex flex-col text-right mr-4 border-r border-white/10 pr-4">
                <span className="text-xs font-bold text-slate-500 uppercase">Período de Análise</span>
                <span className="text-sm font-black text-indigo-400">2022 — 2024</span>
            </div>
            <div className="bg-white/5 px-5 py-2.5 rounded-xl border border-white/10 flex items-center gap-3">
                <Users className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-black tracking-tight">{stats.count} Prefeituras</span>
            </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">
        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Repasse Total Estimado" 
            value={`R$ ${(stats.totalRepasse / 1000000).toFixed(1)}M`} 
            icon={<DollarSign className="text-white" />}
            subtitle="Volume financeiro circulante"
            theme="dark"
          />
          <StatCard 
            title="Média de Crescimento IVA" 
            value={`${stats.avgGrowth.toFixed(1)}%`} 
            icon={<TrendingUp className="text-emerald-500" />}
            subtitle="Variação positiva consolidada"
            isPositive={stats.avgGrowth > 0}
          />
          <StatCard 
            title="Recuperação Fiscal" 
            value={`R$ ${(stats.totalContribuicao / 1000000).toFixed(2)}M`} 
            icon={<ArrowUpRight className="text-indigo-500" />}
            subtitle="Créditos identificados por revisão"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        Comparativo de Performance Financeira
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">Ranking baseado na variação do IVA 2024</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setSortBy('variacao')} 
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sortBy === 'variacao' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                        Crescimento
                    </button>
                    <button 
                        onClick={() => setSortBy('repasse')} 
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sortBy === 'repasse' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                        Repasse
                    </button>
                </div>
              </div>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedMunicipalities} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fontWeight: '700', fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      formatter={(value: number | undefined) => [value ? `${value.toFixed(2)}%` : '0%', 'Variação']}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    />
                    <Bar dataKey="variacaoDefinito2024" radius={[0, 8, 8, 0]} barSize={24}>
                      {sortedMunicipalities.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={entry.variacaoDefinito2024 > 0 ? '#10b981' : '#ef4444'} 
                            fillOpacity={selectedMunicipality?.name === entry.name ? 1 : 0.7}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* List Table Profissional */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-slate-800">Visão Geral Detalhada</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                        <span>Legenda:</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Alta</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Queda</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 text-slate-400">
                            <tr>
                                <th className="px-8 py-4 font-bold uppercase tracking-wider text-[10px]">Município</th>
                                <th className="px-8 py-4 font-bold uppercase tracking-wider text-[10px]">Var. %</th>
                                <th className="px-8 py-4 font-bold uppercase tracking-wider text-[10px]">Projeção Anual</th>
                                <th className="px-8 py-4 font-bold uppercase tracking-wider text-[10px]">IVA Atual</th>
                                <th className="px-8 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sortedMunicipalities.map((m) => (
                                <tr 
                                    key={m.name} 
                                    className={`group hover:bg-slate-50/50 cursor-pointer transition-all ${selectedMunicipality?.name === m.name ? 'bg-indigo-50/50' : ''}`}
                                    onClick={() => handleMunicipalityClick(m)}
                                >
                                    <td className="px-8 py-4 font-black text-slate-700">{m.name}</td>
                                    <td className="px-8 py-4">
                                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${m.variacaoDefinito2024 > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                            {m.variacaoDefinito2024 > 0 ? '↑' : '↓'} {Math.abs(m.variacaoDefinito2024).toFixed(2)}%
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 font-bold text-slate-600">
                                        R$ {(m.projecaoRepasse / 1000).toFixed(0)}k
                                    </td>
                                    <td className="px-8 py-4 font-mono font-bold text-indigo-600">
                                        {m.iva2024.toFixed(4)}
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button className="p-2 opacity-0 group-hover:opacity-100 bg-white shadow-md rounded-lg transition-all">
                                            <ChevronRight className="w-4 h-4 text-indigo-600" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>

          {/* Sidebar / Detailed Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`bg-white p-8 rounded-[2rem] shadow-xl border-2 transition-all duration-500 overflow-hidden relative ${selectedMunicipality ? 'border-indigo-500' : 'border-slate-100 opacity-60'}`}>
                {!selectedMunicipality ? (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 space-y-6">
                        <div className="bg-slate-50 p-6 rounded-full">
                            <MapIcon className="w-12 h-12 text-slate-300" />
                        </div>
                        <div>
                            <p className="font-black text-slate-800 text-lg">Pronto para Apresentação</p>
                            <p className="text-sm text-slate-400 font-medium">Selecione um município na lista para abrir a análise técnica do Prefeito.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedMunicipality.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Relatório Executivo</p>
                                </div>
                            </div>
                        </div>

                        {/* Visual KPIs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Impacto IPM</p>
                                <p className="text-xl font-black text-indigo-600">+{selectedMunicipality.incrementoIpm.toFixed(4)}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-right">
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Meta 2026</p>
                                <p className="text-xl font-black text-slate-800">{selectedMunicipality.ipm2026.toFixed(4)}</p>
                            </div>
                        </div>

                        {/* Repasse Card Profissional */}
                        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-indigo-300 mb-2 uppercase tracking-widest">Previsão Anual de Receita</p>
                                <p className="text-3xl font-black leading-none mb-6">R$ {selectedMunicipality.projecaoRepasse.toLocaleString('pt-BR')}</p>
                                
                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-medium">Honorários Consultoria</span>
                                        <span className="font-black">R$ {selectedMunicipality.honorariosMensal.toLocaleString('pt-BR')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-medium">Variação Real</span>
                                        <span className={`font-black ${selectedMunicipality.variacaoDefinito2024 > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {selectedMunicipality.variacaoDefinito2024.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <DollarSign className="w-32 h-32" />
                            </div>
                        </div>

                        {/* AI Insight Strategic */}
                        <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-indigo-600" />
                                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">Diretriz Técnica</h4>
                            </div>
                            {isInsightLoading ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-3 bg-indigo-200 rounded w-full"></div>
                                    <div className="h-3 bg-indigo-200 rounded w-5/6"></div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-700 leading-relaxed font-bold italic">
                                    "{insight}"
                                </p>
                            )}
                        </div>

                        <div className="pt-2 flex gap-3">
                             <button 
                                onClick={() => setIsPresenting(true)}
                                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                             >
                                <Maximize2 className="w-4 h-4" />
                                Iniciar Apresentação
                             </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex gap-4">
                <Info className="w-6 h-6 text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-900 font-bold leading-relaxed uppercase tracking-tight">
                    <strong>Alerta de Conformidade:</strong> Os dados de 2024 já contemplam os ajustes definitivos. Mudanças no IPM 2026 dependem de novos levantamentos de VA no próximo trimestre.
                </p>
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-8 px-8 text-center">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
            &copy; 2024 Gestão Fazendária Inteligente &bull; Consultoria Estratégica
        </p>
      </footer>
    </div>
  );
};

// Internal Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle: string;
  isPositive?: boolean;
  theme?: 'light' | 'dark';
}> = ({ title, value, icon, subtitle, isPositive, theme = 'light' }) => (
  <div className={`p-8 rounded-[2rem] shadow-sm border transition-all duration-300 flex items-center gap-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
    <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-50'}`}>
      {icon}
    </div>
    <div>
      <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1 ${theme === 'dark' ? 'text-indigo-300' : 'text-slate-400'}`}>{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black tracking-tight">{value}</h3>
        {isPositive !== undefined && (
          <span className={`text-xs font-black ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? '↑' : '↓'}
          </span>
        )}
      </div>
      <p className={`text-[10px] font-bold mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>
    </div>
  </div>
);

export default App;
