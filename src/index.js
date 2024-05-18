import { app } from "./app.js";
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config();

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port ${process.env.PORT}`);
    });
})
.catch((err)=>{
    console.log("Connect DB failed",err);
})

/*
(async()=>{
    try {
        await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
        app.listen(process.env.PORT,()=>{
            console.log("App is successfully listening on port",process.env.PORT);
        });
    } catch (error) {
        console.error(error);   
    }
})() */