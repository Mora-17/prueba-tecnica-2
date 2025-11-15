import Resultado from '../models/resultado.models.js';
import Ruleta from '../models/ruleta.models.js';

export const listarResultados = async (req, res) => {
  try {
    const resultados = await Resultado.find()
      .populate('ruletaId', 'estado fechaCreacion fechaCierre')
      .sort({ fechaCierre: -1 });

    res.json({
      success: true,
      total: resultados.length,
      resultados: resultados.map(resultado => ({
        id: resultado._id,
        ruletaId: resultado.ruletaId._id,
        numeroGanador: resultado.numeroGanador,
        colorGanador: resultado.colorGanador || 'ninguno (0)',
        totalApuestas: resultado.totalApuestas,
        totalGanadores: resultado.totalGanadores,
        totalPerdedores: resultado.totalPerdedores,
        montoTotalApostado: resultado.montoTotalApostado,
        montoTotalPagado: resultado.montoTotalPagado,
        gananciaCasa: resultado.gananciaCasa,
        margenCasa: `${resultado.margenCasa}%`,
        fechaCierre: resultado.fechaCierre
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al listar los resultados',
      error: error.message
    });
  }
};


export const obtenerResultadoPorRuleta = async (req, res) => {
  try {
    const { ruletaId } = req.params;

    const ruleta = await Ruleta.findById(ruletaId);
    
    if (!ruleta) {
      return res.status(404).json({
        success: false,
        mensaje: 'Ruleta no encontrada'
      });
    }

    if (ruleta.estaAbierta()) {
      return res.status(400).json({
        success: false,
        mensaje: 'La ruleta aún está abierta, no hay resultados disponibles'
      });
    }

    const resultado = await Resultado.findOne({ ruletaId })
      .populate('ruletaId');

    if (!resultado) {
      return res.status(404).json({
        success: false,
        mensaje: 'No se encontró resultado para esta ruleta'
      });
    }

    res.json({
      success: true,
      resultado: {
        id: resultado._id,
        ruletaId: resultado.ruletaId._id,
        numeroGanador: resultado.numeroGanador,
        colorGanador: resultado.colorGanador || 'ninguno (0)',
        totalApuestas: resultado.totalApuestas,
        totalGanadores: resultado.totalGanadores,
        totalPerdedores: resultado.totalPerdedores,
        montoTotalApostado: resultado.montoTotalApostado,
        montoTotalPagado: resultado.montoTotalPagado,
        gananciaCasa: resultado.gananciaCasa,
        margenCasa: `${resultado.margenCasa}%`,
        fechaCierre: resultado.fechaCierre,
        ruleta: {
          fechaCreacion: resultado.ruletaId.fechaCreacion,
          fechaApertura: resultado.ruletaId.fechaApertura,
          fechaCierre: resultado.ruletaId.fechaCierre
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el resultado',
      error: error.message
    });
  }
};


export const obtenerEstadisticasGenerales = async (req, res) => {
  try {
    const stats = await Resultado.obtenerEstadisticasGenerales();

    const tasaRetencion = stats.totalApostado > 0 
      ? ((stats.gananciaTotalCasa / stats.totalApostado) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      estadisticas: {
        totalRuletasCerradas: stats.totalRuletas,
        totalApuestas: stats.totalApuestas,
        montoTotalApostado: stats.totalApostado,
        montoTotalPagado: stats.totalPagado,
        gananciaTotalCasa: stats.gananciaTotalCasa,
        tasaRetencionCasa: `${tasaRetencion}%`,
        promedioApostadoPorRuleta: stats.totalRuletas > 0 
          ? (stats.totalApostado / stats.totalRuletas).toFixed(2)
          : 0,
        promedioApuestasPorRuleta: stats.totalRuletas > 0
          ? Math.round(stats.totalApuestas / stats.totalRuletas)
          : 0
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener estadísticas generales',
      error: error.message
    });
  }
};