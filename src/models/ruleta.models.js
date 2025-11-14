import mongoose from 'mongoose';
import { ESTADOS, COLORES } from '../config/constants.js';

const ruletaSchema = new mongoose.Schema({
  estado: {
    type: String,
    enum: Object.values(ESTADOS),
    default: ESTADOS.CERRADA,
    required: true
  },
  numeroGanador: {
    type: Number,
    min: 0,
    max: 36,
    default: null
  },
  colorGanador: {
    type: String,
    enum: [...Object.values(COLORES), null],
    default: null
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaApertura: {
    type: Date,
    default: null
  },
  fechaCierre: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});


ruletaSchema.methods.estaAbierta = function() {
  return this.estado === ESTADOS.ABIERTA;
};


ruletaSchema.methods.estaCerrada = function() {
  return this.estado === ESTADOS.CERRADA;
};

export default mongoose.model('Ruleta', ruletaSchema);