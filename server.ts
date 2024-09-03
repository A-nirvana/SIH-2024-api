import express, { Application, Request, Response } from 'express';
import cors from 'cors'
import { applicantRouter } from './src/routes';


const app  : express.Application = express()

app.use(express.json())
app.use(cors())

app.get("/", async(req:Request, res: Response)=>{
    res.json({
        message : "hello world"
    })
})

app.use("/applicant",applicantRouter)


app.listen(3000)
