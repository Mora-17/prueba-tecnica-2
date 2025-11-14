import mongoose from "mongoose";

export const mongooseContecion = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Conexión a la base de datos exitosa");
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
    }
};