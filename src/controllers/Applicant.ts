import express, { Application, Request, Response } from 'express';
import zod, { string } from 'zod'
import prisma from '../../prisma/prismaClient';
import {sign} from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET


const signupSchema = zod.object({
    username : zod.string().email(),
    password : zod.string().min(6),
    firstName  : zod.string().min(1),
    lastName : zod.string().min(1)
})

const signinBodySchema = zod.object({
    username : zod.string().email(),
    password : zod.string().min(6)
}) 

export const ApplicantSignin = async(req : Request , res : Response)=>{
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
}

export const ApplicantSignup = async(req : Request ,res : Response)=>{
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
}


// how to upload on cloudinary

// app.post('/upload', upload.single('image'), (req,res)=>{
//     cloudinary.v2.uploader.upload(req.file.path , (err , result)=>{
//         if(err){
//             console.log(err)
//             return res.status(500).json({
//                 success : false,
//                 message : "error"
//             })
//         }
//         res.status(200).json({
//             success : true,
//             message : "uploaded" ,
//             data : result
//         })
//     })
// })