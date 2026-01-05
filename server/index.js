import express from "express"
import dotenv from "dotenv"
dotenv.config({ path: "./server/.env" })
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"


const app=express()
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}))
const port=process.env.PORT 
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send("Server is Ready!");
});

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)


app.listen(port,()=>{
    connectDb()
    console.log("server started")
})

