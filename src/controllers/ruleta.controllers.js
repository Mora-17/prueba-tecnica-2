import Ruleta from '../models/ruleta.models.js';
import Apuesta from '../models/apostador.models.js';
import Resultado from '../models/resultado.models.js';
import { ESTADOS } from '../config/constants.js';
import { 
  generarNumeroGanador, 
  obtenerColorDeNumero, 
  calcularGanancia,
  calcularEstadisticas 
} from '../services/calculadora.service.js';

export const crearRuleta = async (req, res) => {
  try {
    const nuevaRuleta = new Ruleta({
      estado: ESTADOS.CERRADA
    });

    await nuevaRuleta.save();

    res.status(201).json({
      success: true,
      mensaje: 'Ruleta creada exitosamente',
      id: nuevaRuleta._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear la ruleta',
      error: error.message
    });
  }
};


export const abrirRuleta = async (req, res) => {
  try {
    const { id } = req.params;

    const ruleta = await Ruleta.findById(id);

    if (!ruleta) {
      return res.status(404).json({
        success: false,
        mensaje: 'Ruleta no encontrada'
      });
    }

    if (ruleta.estaAbierta()) {
      return res.status(400).json({
        success: false,
        mensaje: 'La ruleta ya está abierta'
      });
    }

    ruleta.estado = ESTADOS.ABIERTA;
    ruleta.fechaApertura = new Date();
    await ruleta.save();

    res.json({
      success: true,
      mensaje: 'Ruleta abierta exitosamente',
      estado: ruleta.estado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al abrir la ruleta',
      error: error.message
    });
  }
};


export const cerrarRuleta = async (req, res) => {
  try {
    const { id } = req.params;

    const ruleta = await Ruleta.findById(id);

    if (!ruleta) {
      return res.status(404).json({
        success: false,
        mensaje: 'Ruleta no encontrada'
      });
    }

    if (ruleta.estaCerrada()) {
      return res.status(400).json({
        success: false,
        mensaje: 'La ruleta ya está cerrada'
      });
    }

    
    const numeroGanador = generarNumeroGanador();
    const colorGanador = obtenerColorDeNumero(numeroGanador);

    ruleta.estado = ESTADOS.CERRADA;
    ruleta.numeroGanador = numeroGanador;
    ruleta.colorGanador = colorGanador;
    ruleta.fechaCierre = new Date();
    await ruleta.save();

    const apuestas = await Apuesta.find({ ruletaId: id });

    const resultadosApuestas = [];
    for (const apuesta of apuestas) {
      const resultado = calcularGanancia(apuesta, numeroGanador, colorGanador);
      
      apuesta.estado = resultado.estado;
      apuesta.ganancia = resultado.ganancia;
      await apuesta.save();

      resultadosApuestas.push({
        id: apuesta._id,
        jugador: apuesta.jugador,
        tipo: apuesta.tipo,
        valor: apuesta.valor,
        monto: apuesta.monto,
        gano: resultado.gano,
        ganancia: resultado.ganancia,
        perdida: resultado.gano ? 0 : apuesta.monto
      });
    }

    const stats = calcularEstadisticas(apuestas);

    const resultadoGeneral = new Resultado({
      ruletaId: id,
      numeroGanador,
      colorGanador,
      ...stats
    });
    await resultadoGeneral.save();

    res.json({
      success: true,
      mensaje: 'Ruleta cerrada exitosamente',
      resultado: {
        numeroGanador,
        colorGanador: colorGanador || 'ninguno (0)',
        totalApuestas: stats.totalApuestas,
        ganadores: stats.totalGanadores,
        perdedores: stats.totalPerdedores,
        apuestas: resultadosApuestas
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al cerrar la ruleta',
      error: error.message
    });
  }
};


export const listarRuletas = async (req, res) => {
  try {
    const ruletas = await Ruleta.find().sort({ fechaCreacion: -1 });

    const ruletasConInfo = await Promise.all(
      ruletas.map(async (ruleta) => {
        const totalApuestas = await Apuesta.countDocuments({ ruletaId: ruleta._id });
        
        return {
          id: ruleta._id,
          estado: ruleta.estado,
          fechaCreacion: ruleta.fechaCreacion,
          fechaApertura: ruleta.fechaApertura,
          fechaCierre: ruleta.fechaCierre,
          numeroGanador: ruleta.numeroGanador,
          colorGanador: ruleta.colorGanador,
          totalApuestas
        };
      })
    );

    res.json({
      success: true,
      total: ruletasConInfo.length,
      ruletas: ruletasConInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al listar las ruletas',
      error: error.message
    });
  }
};


export const obtenerRuleta = async (req, res) => {
  try {
    const { id } = req.params;

    const ruleta = await Ruleta.findById(id);

    if (!ruleta) {
      return res.status(404).json({
        success: false,
        mensaje: 'Ruleta no encontrada'
      });
    }

    const apuestas = await Apuesta.find({ ruletaId: id });

    res.json({
      success: true,
      ruleta: {
        ...ruleta.toObject(),
        apuestas
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener la ruleta',
      error: error.message
    });
  }
};