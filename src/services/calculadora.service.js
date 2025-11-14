import { COLORES, REGLAS, TIPOS_APUESTA, ESTADOS_APUESTA } from '../config/constants.js';


export const obtenerColorDeNumero = (numero) => {
  if (numero === 0) return null; 
  return numero % 2 === 0 ? COLORES.ROJO : COLORES.NEGRO;
};


export const generarNumeroGanador = () => {
  return Math.floor(Math.random() * 37); 
};


export const esApuestaGanadora = (apuesta, numeroGanador, colorGanador) => {
  if (apuesta.tipo === TIPOS_APUESTA.NUMERO) {
    return apuesta.valor === numeroGanador;
  }
  
  if (apuesta.tipo === TIPOS_APUESTA.COLOR) {
    
    if (numeroGanador === 0) return false;
    return apuesta.valor === colorGanador;
  }
  
  return false;
};


export const calcularGanancia = (apuesta, numeroGanador, colorGanador) => {
  const gano = esApuestaGanadora(apuesta, numeroGanador, colorGanador);
  
  if (!gano) {
    return {
      gano: false,
      ganancia: 0,
      estado: ESTADOS_APUESTA.PERDIDA
    };
  }
  
  let multiplicador = 0;
  
  if (apuesta.tipo === TIPOS_APUESTA.NUMERO) {
    multiplicador = REGLAS.MULTIPLICADOR_NUMERO;
  } else if (apuesta.tipo === TIPOS_APUESTA.COLOR) {
    multiplicador = REGLAS.MULTIPLICADOR_COLOR;
  }
  
  const ganancia = apuesta.monto * multiplicador;
  
  return {
    gano: true,
    ganancia,
    estado: ESTADOS_APUESTA.GANADA
  };
};

export const calcularEstadisticas = (apuestas) => {
  return apuestas.reduce((stats, apuesta) => {
    stats.totalApuestas++;
    stats.montoTotalApostado += apuesta.monto;
    
    if (apuesta.estado === ESTADOS_APUESTA.GANADA) {
      stats.totalGanadores++;
      stats.montoTotalPagado += apuesta.ganancia;
    } else if (apuesta.estado === ESTADOS_APUESTA.PERDIDA) {
      stats.totalPerdedores++;
    }
    
    return stats;
  }, {
    totalApuestas: 0,
    totalGanadores: 0,
    totalPerdedores: 0,
    montoTotalApostado: 0,
    montoTotalPagado: 0
  });
};