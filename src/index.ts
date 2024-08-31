import express, { Application, Request, Response } from 'express';
import zod, { string } from 'zod'
import { PrismaClient } from "@prisma/client";
import cors from 'cors'
import { env } from 'process';
import {sign} from 'jsonwebtoken'

const app  : express.Application = express()
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET

app.use(express.json())
app.use(cors())

const signupSchema = zod.object({
    username : zod.string().email(),
    password : zod.string().min(6),
    firstName  : zod.string().min(1),
    lastName : zod.string().min(1)
})

app.post('/signup',async(req : Request ,res : Response)=>{
    const signupBody = req.body
    const response = signupSchema.safeParse(signupBody)
    try {
        const existingUser = await prisma.user.findFirst({
            where : {
                username : signupBody.username
            }
        })
        if( !response.success || existingUser){
            return res.status(403).json({
                "message" : "incorrect credentials/ username already in use"
            })
        }
        const user = await prisma.user.create({
            data : {
                username : signupBody.username,
                password : signupBody.password,
                firstName : signupBody.firstName,
                lastName : signupBody.lastName
            }
        })
        var token = await sign({id : user.id},JWT_SECRET as string)


        return res.status(200).json({
            message : "user created successfully",
            token : token
        })
    } catch (err) {
        res.json({
            message : "something is up with the database...please wait for sometime"
        })
    }
})


const signinBodySchema = zod.object({
    username : zod.string().email(),
    password : zod.string().min(6)
}) 

app.post('/signin',async(req : Request , res : Response)=>{
    const signinBody = req.body
    const response = signinBodySchema.safeParse(signinBody)
    const userInDatabase = await prisma.user.findUnique({
        where : {
            username : signinBody.username,
            password : signinBody.password
        }
    })
    if(!userInDatabase || !response.success){
        res.json({
            message : "user does not exists / incorrect inputs"
        }) 
    }else{
        var token = await sign({id : userInDatabase.id},JWT_SECRET as string)
        return res.json({
            message : "you are logged in",
            token : token
        })
    }
})

app.listen(3000)
