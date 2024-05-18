import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        console.log("MongoDB connected DB HOST.");
    } catch (error) {
        console.error(error);   
    }
}

export default connectDB;

