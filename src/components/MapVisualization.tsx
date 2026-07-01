import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Cidade } from '../types';

interface MapVisualizationProps {
  cidades: Cidade[];
  melhorRota: Cidade[] | null;
}

export function MapVisualization({ cidades, melhorRota }: MapVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (svgRef.current) {
      const { clientWidth, clientHeight } = svgRef.current;
      setDimensions({ width: clientWidth, height: clientHeight });
    }
  }, []);

  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (cidades.length === 0) return { minX: 0, maxX: 100, minY: 0, maxY: 100 };
    return {
      minX: Math.min(...cidades.map(c => c.x)),
      maxX: Math.max(...cidades.map(c => c.x)),
      minY: Math.min(...cidades.map(c => c.y)),
      maxY: Math.max(...cidades.map(c => c.y)),
    };
  }, [cidades]);

  // Função para mapear coordenadas originais para o SVG (adicionando margens)
  const mapCoord = (val: number, min: number, max: number, targetSize: number) => {
    const margin = 40; // margem em pixels
    const range = max - min === 0 ? 1 : max - min;
    const scale = (targetSize - margin * 2) / range;
    return margin + (val - min) * scale;
  };

  // SVG drawing
  const renderedPath = useMemo(() => {
    if (!melhorRota || melhorRota.length === 0 || dimensions.width === 0) return null;
    
    let pathString = '';
    melhorRota.forEach((c, index) => {
      const cx = mapCoord(c.x, minX, maxX, dimensions.width);
      // inverte y pois y cresce pra baixo no SVG, mas pra cima nas coordenadas normais
      const cy = mapCoord(maxY - c.y + minY, minY, maxY, dimensions.height);
      
      if (index === 0) {
        pathString += `M ${cx},${cy} `;
      } else {
        pathString += `L ${cx},${cy} `;
      }
    });
    
    // Fechar o ciclo
    const firstC = melhorRota[0];
    const fcx = mapCoord(firstC.x, minX, maxX, dimensions.width);
    const fcy = mapCoord(maxY - firstC.y + minY, minY, maxY, dimensions.height);
    pathString += `L ${fcx},${fcy}`;

    return pathString;
  }, [melhorRota, dimensions, minX, maxX, minY, maxY]);

  return (
    <div className="w-full h-full min-h-[400px] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-inner relative">
      <svg ref={svgRef} className="w-full h-full absolute inset-0">
        {renderedPath && (
          <path
            d={renderedPath}
            fill="none"
            stroke="rgba(99, 102, 241, 0.5)" // indigo-500 com opacidade
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}
        
        {dimensions.width > 0 && cidades.map((c, i) => {
          const cx = mapCoord(c.x, minX, maxX, dimensions.width);
          const cy = mapCoord(maxY - c.y + minY, minY, maxY, dimensions.height);
          
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r="4"
                fill="#ec4899" // pink-500
                className="transition-all duration-300"
              />
              <text
                x={cx + 6}
                y={cy + 4}
                fill="#94a3b8" // slate-400
                fontSize="10"
                className="select-none pointer-events-none"
              >
                {c.nome}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
