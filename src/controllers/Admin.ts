import express, { Application, Request, response, Response } from 'express';
import zod, { any, number, string } from 'zod'
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


export const AdminSignin = async(req : Request , res : Response)=>{
    const signinBody = req.body
    const response = signinBodySchema.safeParse(signinBody)
    const adminInDatabase = await prisma.admin.findUnique({
        where : {
            email : signinBody.email,
            password : signinBody.password
        }
    })
    if(!adminInDatabase || !response.success){
        res.status(403).json({
            message : "admin does not exists / incorrect inputs"
        }) 
    }else{
        var token = await sign({id : adminInDatabase.id},JWT_SECRET as string)
        return res.status(200).json({
            message : "you are logged in",
            token : token
        })
    }
}


export const AdminSignup = async(req : Request ,res : Response)=>{
    const signupBody = req.body
    const response = signupSchema.safeParse(signupBody)
    try {
        const existingAdmin = await prisma.admin.findFirst({
            where : {
                email : signupBody.email
            }
        })
        if( !response.success || existingAdmin){
            return res.status(403).json({
                "message" : "incorrect credentials/ email already in use"
            })
        }
        const admin = await prisma.admin.create({
            data : {
                email : signupBody.email,
                phone : signupBody.phone,
                password : signupBody.password,
                firstName : signupBody.firstName,
                lastName : signupBody.lastName
            }
        })

        var token = await sign({id : admin.id},JWT_SECRET as string)


        return res.status(200).json({
            message : "user created successfully",
            token : token
        })
    } catch (err) {
        res.status(500).json({
            message : "something is up with the database...please wait for sometime"
        })
    }
}


export const AdminDocumentStatus = async(req : Request ,res : Response)=>{
    const applicantId = parseInt(req.params.id) 
    try {
        const response = await prisma.documents.findFirst({
            where : {
                applicantId : applicantId
            }
        })
        
        if(!response){
            res.status(404).json({
                message : "applicant does not exists"
            })
        }

        return res.status(200).json({
            success  : true,
            incomeCertificateStatus : response?.incomeCertificate,
            casteCertificateStatus : response?.casteCertificate,
            pwdCertificateStatus : response?.pwdCertificate,
            collegeIdStatus : response?.instituteId
        })

    } catch (err) {
        res.status(500).json({
            message : "something is up with the database...please wait for sometime"
        })
    }
}



export const AdminDocumentVerification = async (req : Request ,res : Response)=>{
    const applicantInfo  = req.body
    const applicantId = applicantInfo.id
    
    try {
        const applicant = await prisma.applicant.findFirst({
            where : {
                id : applicantId
            }
        })

        if(!applicant){
            res.status(404).json({
                message : "applicant does not exist"
            })
        }
        
        const applicationUpdate = await prisma.documents.update({
            where : {
                applicantId : applicant?.id 
            },
            data : {
                incomeCertificate : applicantInfo?.incomeCertificateStatus,
                casteCertificate : applicantInfo?.casteCertificateStatus,
                instituteId : applicantInfo?.instituteIdStatus,
                pwdCertificate : applicantInfo?.pwdCertificateStatus, //testing required
            }
        })

        res.status(200).json({
            success : true,
            message : "documents updated"
        })

    } catch (err) {
        res.status(500).json({
            message : "something is up with the database...please wait for sometime"
        })
    }
}


