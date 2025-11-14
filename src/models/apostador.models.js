import mongoose from "mongoose";

const apostadorSchema = new mongoose.Schema({
  nombre: {
    type: String,
     required:true},

    valor: {
    type: Number,
    required: true},

    monto: {
    type: Number,
    required: true,
    min: 1,
    max: 10000
  }
});
export default mongoose.model('Apostador', apostadorSchema);