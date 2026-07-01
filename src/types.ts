export interface Cidade {
  nome: string;
  x: number;
  y: number;
}

export interface Individuo {
  rota: Cidade[];
  distancia: number;
  fitness: number;
}
