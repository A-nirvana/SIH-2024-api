import express, { Application, Request, Response } from 'express';
import cors from 'cors'
import { applicantRouter } from './src/routes';
import dotenv from 'dotenv'
import path from 'path';

const app  : express.Application = express()
dotenv.config({ path: path.join(__dirname, `./.env`) });

app.use(express.json())
app.use(cors())

app.get("/", async(req:Request, res: Response)=>{
    res.json({
        message : process.env.EMAIL_MAIN || "undf"
    })
})

app.use("/applicant",applicantRouter)


app.listen(3000)
