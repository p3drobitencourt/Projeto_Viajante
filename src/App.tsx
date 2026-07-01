import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgoritmoGeneticoTSP } from './lib/ag';
import { cidadesIniciais } from './data';
import { Individuo } from './types';
import { MapVisualization } from './components/MapVisualization';
import { EvolutionChart } from './components/EvolutionChart';
import { Play, Square, Settings2, RefreshCw } from 'lucide-react';

export default function App() {
  const [ag, setAg] = useState<AlgoritmoGeneticoTSP | null>(null);
  const [populacao, setPopulacao] = useState<Individuo[]>([]);
  const [geracao, setGeracao] = useState(0);
  const [melhorIndividuo, setMelhorIndividuo] = useState<Individuo | null>(null);
  const [historico, setHistorico] = useState<{ geracao: number; melhorDistancia: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Settings
  const [tamanhoPop, setTamanhoPop] = useState(200);
  const [taxaMutacao, setTaxaMutacao] = useState(0.05);
  const [taxaCruzamento, setTaxaCruzamento] = useState(0.9);
  
  const requestRef = useRef<number | null>(null);

  const inicializar = useCallback(() => {
    setIsRunning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    const novoAg = new AlgoritmoGeneticoTSP(
      cidadesIniciais,
      tamanhoPop,
      taxaMutacao,
      taxaCruzamento,
      true
    );
    setAg(novoAg);
    
    const pop = novoAg.inicializarPopulacao();
    const melhor = [...pop].sort((a, b) => b.fitness - a.fitness)[0];
    
    setPopulacao(pop);
    setGeracao(0);
    setMelhorIndividuo(melhor);
    setHistorico([{ geracao: 0, melhorDistancia: melhor.distancia }]);
  }, [tamanhoPop, taxaMutacao, taxaCruzamento]);

  useEffect(() => {
    inicializar();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [inicializar]);

  const evoluirPasso = useCallback(() => {
    if (!ag || populacao.length === 0) return;

    setPopulacao(prevPop => {
      const novaPop = ag.evoluir(prevPop);
      const melhorAtual = [...novaPop].sort((a, b) => b.fitness - a.fitness)[0];
      
      setMelhorIndividuo(melhorAtual);
      setGeracao(prevGeracao => {
        const nextGeracao = prevGeracao + 1;
        setHistorico(prev => [...prev, { geracao: nextGeracao, melhorDistancia: melhorAtual.distancia }]);
        return nextGeracao;
      });
      
      return novaPop;
    });
  }, [ag, populacao]);

  const loop = useCallback(() => {
    evoluirPasso();
    requestRef.current = requestAnimationFrame(loop);
  }, [evoluirPasso]);

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(loop);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, loop]);

  const handleStartStop = () => setIsRunning(!isRunning);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Caixeiro Viajante (TSP)</h1>
            <p className="text-slate-400 mt-1">Otimização de rotas com Algoritmo Genético usando PMX Crossover.</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleStartStop}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-colors ${
                isRunning 
                ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/20'
              }`}
            >
              {isRunning ? (
                <><Square className="w-4 h-4" /> Parar</>
              ) : (
                <><Play className="w-4 h-4" /> Iniciar Evolução</>
              )}
            </button>
            <button
              onClick={inicializar}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" /> Resetar
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Panel */}
          <div className="space-y-6 lg:col-span-1">
            {/* Status Card */}
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-sm">
              <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase mb-4">Status da Execução</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Geração Atual</div>
                  <div className="text-3xl font-mono font-medium text-white">{geracao}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Melhor Distância</div>
                  <div className="text-2xl font-mono font-medium text-indigo-400">
                    {melhorIndividuo ? melhorIndividuo.distancia.toFixed(2) : '---'}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Card */}
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Settings2 className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase">Parâmetros do AG</h2>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-slate-300">Tamanho da População</label>
                    <span className="text-xs text-slate-400 font-mono">{tamanhoPop}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={tamanhoPop}
                    onChange={(e) => setTamanhoPop(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    disabled={isRunning}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-slate-300">Taxa de Mutação</label>
                    <span className="text-xs text-slate-400 font-mono">{(taxaMutacao * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={taxaMutacao}
                    onChange={(e) => setTaxaMutacao(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    disabled={isRunning}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-slate-300">Taxa de Cruzamento</label>
                    <span className="text-xs text-slate-400 font-mono">{(taxaCruzamento * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={taxaCruzamento}
                    onChange={(e) => setTaxaCruzamento(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    disabled={isRunning}
                  />
                </div>
              </div>
              {isRunning && (
                <div className="mt-4 text-xs text-amber-500/80 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  Pare a execução para alterar os parâmetros.
                </div>
              )}
            </div>
            
            {/* Route List snippet */}
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-sm max-h-[250px] overflow-y-auto">
              <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase mb-3">Melhor Rota Encontrada</h2>
              {melhorIndividuo && (
                <div className="flex flex-wrap gap-1.5 text-xs font-mono text-slate-400">
                  {melhorIndividuo.rota.map((c, i) => (
                    <span key={i} className="flex items-center">
                      <span className="text-indigo-400">{c.nome}</span>
                      {i < melhorIndividuo.rota.length - 1 && <span className="mx-1 text-slate-600">→</span>}
                    </span>
                  ))}
                  <span className="mx-1 text-slate-600">→</span>
                  <span className="text-indigo-400">{melhorIndividuo.rota[0].nome}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">
            <div className="flex-1 min-h-[400px]">
              <MapVisualization 
                cidades={cidadesIniciais} 
                melhorRota={melhorIndividuo?.rota || null} 
              />
            </div>
            
            <div className="h-[250px]">
              <EvolutionChart data={historico} />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
