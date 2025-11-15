import mongoose from 'mongoose';

const resultadoSchema = new mongoose.Schema({
  ruletaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ruleta',
    required: true,
    unique: true,
    index: true
  },
  numeroGanador: {
    type: Number,
    required: true,
    min: 0,
    max: 36
  },
  colorGanador: {
    type: String,
    default: null
  },
  totalApuestas: {
    type: Number,
    default: 0,
    min: 0
  },
  totalGanadores: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPerdedores: {
    type: Number,
    default: 0,
    min: 0
  },
  montoTotalApostado: {
    type: Number,
    default: 0,
    min: 0
  },
  montoTotalPagado: {
    type: Number,
    default: 0,
    min: 0
  },
  gananciaCasa: {
    type: Number,
    default: 0
  },
  fechaCierre: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

resultadoSchema.virtual('margenCasa').get(function() {
  if (this.montoTotalApostado === 0) return 0;
  return ((this.gananciaCasa / this.montoTotalApostado) * 100).toFixed(2);
});

resultadoSchema.statics.obtenerEstadisticasGenerales = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalRuletas: { $sum: 1 },
        totalApuestas: { $sum: '$totalApuestas' },
        totalApostado: { $sum: '$montoTotalApostado' },
        totalPagado: { $sum: '$montoTotalPagado' },
        gananciaTotalCasa: { $sum: '$gananciaCasa' }
      }
    }
  ]);

  return stats[0] || {
    totalRuletas: 0,
    totalApuestas: 0,
    totalApostado: 0,
    totalPagado: 0,
    gananciaTotalCasa: 0
  };
};

resultadoSchema.pre('save', function(next) {
  this.gananciaCasa = this.montoTotalApostado - this.montoTotalPagado;
  next();
});

export default mongoose.model('Resultado', resultadoSchema);