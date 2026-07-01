import { Cidade, Individuo } from '../types';

export class AlgoritmoGeneticoTSP {
  tamanhoPopulacao: number;
  taxaMutacao: number;
  taxaCruzamento: number;
  elitismo: boolean;
  cidades: Cidade[];

  constructor(
    cidades: Cidade[],
    tamanhoPopulacao: number = 100,
    taxaMutacao: number = 0.05,
    taxaCruzamento: number = 0.9,
    elitismo: boolean = true
  ) {
    this.cidades = cidades;
    this.tamanhoPopulacao = tamanhoPopulacao;
    this.taxaMutacao = taxaMutacao;
    this.taxaCruzamento = taxaCruzamento;
    this.elitismo = elitismo;
  }

  static calcularDistancia(c1: Cidade, c2: Cidade): number {
    return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
  }

  static calcularDistanciaTotal(rota: Cidade[]): number {
    let dist = 0;
    for (let i = 0; i < rota.length - 1; i++) {
      dist += this.calcularDistancia(rota[i], rota[i + 1]);
    }
    dist += this.calcularDistancia(rota[rota.length - 1], rota[0]);
    return dist;
  }

  gerarIndividuoAleatorio(): Individuo {
    let rota = [...this.cidades];
    for (let i = rota.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rota[i], rota[j]] = [rota[j], rota[i]];
    }
    const distancia = AlgoritmoGeneticoTSP.calcularDistanciaTotal(rota);
    return { rota, distancia, fitness: 1 / distancia };
  }

  inicializarPopulacao(): Individuo[] {
    const pop: Individuo[] = [];
    for (let i = 0; i < this.tamanhoPopulacao; i++) {
      pop.push(this.gerarIndividuoAleatorio());
    }
    return pop;
  }

  selecaoTorneio(populacao: Individuo[], tamanhoTorneio: number = 5): Individuo {
    let melhor = populacao[Math.floor(Math.random() * populacao.length)];
    for (let i = 1; i < tamanhoTorneio; i++) {
      const candidato = populacao[Math.floor(Math.random() * populacao.length)];
      if (candidato.fitness > melhor.fitness) {
        melhor = candidato;
      }
    }
    return melhor;
  }

  pmx(pai1: Individuo, pai2: Individuo): Individuo {
    if (Math.random() > this.taxaCruzamento) {
      return { ...pai1 }; 
    }

    const size = pai1.rota.length;
    let filhoRota: (Cidade | null)[] = new Array(size).fill(null);

    let corte1 = Math.floor(Math.random() * size);
    let corte2 = Math.floor(Math.random() * size);

    if (corte1 > corte2) {
      [corte1, corte2] = [corte2, corte1];
    }

    // Copia o trecho do pai1 para o filho
    for (let i = corte1; i <= corte2; i++) {
      filhoRota[i] = pai1.rota[i];
    }

    // Preenche o resto com o pai2 usando o mapeamento do PMX
    for (let i = corte1; i <= corte2; i++) {
      let cidadePai2 = pai2.rota[i];
      
      // Se a cidade já não estiver no trecho copiado (filhoRota)
      if (!filhoRota.some(c => c && c.nome === cidadePai2.nome)) {
        let currentElementFromPai1 = pai1.rota[i];
        let targetIndexInPai2 = pai2.rota.findIndex(c => c.nome === currentElementFromPai1.nome);
        
        while (targetIndexInPai2 >= corte1 && targetIndexInPai2 <= corte2) {
            currentElementFromPai1 = pai1.rota[targetIndexInPai2];
            targetIndexInPai2 = pai2.rota.findIndex(c => c.nome === currentElementFromPai1.nome);
        }
        filhoRota[targetIndexInPai2] = cidadePai2;
      }
    }

    // Preenche as posicoes vazias do filho com as cidades do pai2 que sobraram
    for (let i = 0; i < size; i++) {
      if (filhoRota[i] === null) {
        filhoRota[i] = pai2.rota[i];
      }
    }

    const rota = filhoRota as Cidade[];
    const distancia = AlgoritmoGeneticoTSP.calcularDistanciaTotal(rota);
    return { rota, distancia, fitness: 1 / distancia };
  }

  mutacao(individuo: Individuo): Individuo {
    if (Math.random() <= this.taxaMutacao) {
      const rota = [...individuo.rota];
      const pos1 = Math.floor(Math.random() * rota.length);
      const pos2 = Math.floor(Math.random() * rota.length);
      [rota[pos1], rota[pos2]] = [rota[pos2], rota[pos1]];
      
      const distancia = AlgoritmoGeneticoTSP.calcularDistanciaTotal(rota);
      return { rota, distancia, fitness: 1 / distancia };
    }
    return individuo;
  }

  evoluir(populacao: Individuo[]): Individuo[] {
    const novaPopulacao: Individuo[] = [];
    
    // O sort usa a função mutável, então criamos uma cópia antes de ordenar, 
    // ou apenas ordenamos a pop atual e tá tudo bem.
    const popOrdenada = [...populacao].sort((a, b) => b.fitness - a.fitness);

    if (this.elitismo) {
      novaPopulacao.push(popOrdenada[0]); // Mantém o melhor
    }

    while (novaPopulacao.length < this.tamanhoPopulacao) {
      const pai1 = this.selecaoTorneio(populacao);
      const pai2 = this.selecaoTorneio(populacao);
      
      let filho = this.pmx(pai1, pai2);
      filho = this.mutacao(filho);
      
      novaPopulacao.push(filho);
    }

    return novaPopulacao;
  }
}
