import mongoose from "mongoose";
import { TIPOS_APUESTA, COLORES, REGLAS, ESTADOS_APUESTA } from '../config/constants.js';

const apostadorSchema = new mongoose.Schema({
  ruletaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ruleta',
    required: [true, 'El ID de la ruleta es requerido'],
    index: true
  },
  jugador: {
    type: String,
    required: [true, 'El nombre del jugador es requerido']
   
  },
  tipo: {
    type: String,
    enum: {
      values: Object.values(TIPOS_APUESTA),
      message: 'El tipo debe ser "numero" o "color"'
    },
    required: [true, 'El tipo de apuesta es requerido']
  },
  valor: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'El valor de la apuesta es requerido'],
    validate: {
      validator: function(valor) {
        if (this.tipo === TIPOS_APUESTA.NUMERO) {
          return Number.isInteger(valor) && 
                 valor >= REGLAS.MIN_NUMERO && 
                 valor <= REGLAS.MAX_NUMERO;
        }
        if (this.tipo === TIPOS_APUESTA.COLOR) {
          return Object.values(COLORES).includes(valor);
        }
        return false;
      },
      message: props => {
        if (props.instance.tipo === TIPOS_APUESTA.NUMERO) {
          return `El número debe estar entre ${REGLAS.MIN_NUMERO} y ${REGLAS.MAX_NUMERO}`;
        }
        return `El color debe ser "${COLORES.ROJO}" o "${COLORES.NEGRO}"`;
      }
    }
  },
  monto: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: [REGLAS.MIN_APUESTA, `El monto mínimo es ${REGLAS.MIN_APUESTA}`],
    max: [REGLAS.MAX_APUESTA, `El monto máximo es ${REGLAS.MAX_APUESTA}`],
    validate: {
      validator: function(monto) {
        return monto > 0 && Number.isFinite(monto);
      },
      message: 'El monto debe ser un número positivo válido'
    }
  },
  estado: {
    type: String,
    enum: Object.values(ESTADOS_APUESTA),
    default: ESTADOS_APUESTA.PENDIENTE
  },
  ganancia: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

apostadorSchema.index({ ruletaId: 1, estado: 1 });
apostadorSchema.index({ jugador: 1, createdAt: -1 });

apostadorSchema.virtual('gano').get(function() {
  return this.estado === ESTADOS_APUESTA.GANADA;
});

apostadorSchema.methods.calcularGananciaPotencial = function() {
  if (this.tipo === TIPOS_APUESTA.NUMERO) {
    return this.monto * REGLAS.MULTIPLICADOR_NUMERO;
  }
  if (this.tipo === TIPOS_APUESTA.COLOR) {
    return this.monto * REGLAS.MULTIPLICADOR_COLOR;
  }
  return 0;
};

export default mongoose.model('Apuesta', apostadorSchema);