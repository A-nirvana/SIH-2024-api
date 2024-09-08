import express, { Application, Request, Response } from 'express';
import zod, { string } from 'zod'
import prisma from '../../prisma/prismaClient';
import {sign} from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET


const signupSchema = zod.object({
    email : zod.string().email(),
    phone : zod.string().min(9),
    password : zod.string().min(6),
    firstName  : zod.string().min(1),
    lastName : zod.string().min(1)
})

const signinBodySchema = zod.object({
    email : zod.string().email(),
    password : zod.string().min(6)
}) 

export const ApplicantSignin = async(req : Request , res : Response)=>{
    const signinBody = req.body
    const response = signinBodySchema.safeParse(signinBody)
    const applicantInDatabase = await prisma.applicant.findUnique({
        where : {
            email : signinBody.email,
            password : signinBody.password
        }
    })
    if(!applicantInDatabase || !response.success){
        res.json({
            message : "applicant does not exists / incorrect inputs"
        }) 
    }else{
        var token = await sign({id : applicantInDatabase.id},JWT_SECRET as string)
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
        const existingApplicant = await prisma.applicant.findFirst({
            where : {
                email : signupBody.email
            }
        })
 

        if( !response.success || existingApplicant){
            return res.status(403).json({
                "message" : "incorrect credentials/ email already in use"
            })
        }
        const user = await prisma.applicant.create({
            data : {
                email : signupBody.email,
                phone : signupBody.phone,
                password : signupBody.password,
                firstName : signupBody.firstName,
                lastName : signupBody.lastName,
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


