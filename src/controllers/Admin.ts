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

export const AdminTransaction = async(req : Request ,res : Response)=>{
    const {applicantId,amount} = req.body

    try {
        const prevAmount = await prisma.bankDetails.findFirst({
            where : {
                applicantId : applicantId
            }
        })
        
        const prevFunds = await prisma.funds.findFirst({
            where : {
                id : 1
            }
        })
        
        
        if(prevAmount){
            const add =  prisma.bankDetails.update({
                where : {
                    applicantId : applicantId
                },
                data : {
                        amount : prevAmount?.amount + amount
                }
            })
    
            const subtract =  prisma.funds.update({
                where : {
                    id : 1
                },
                data : {
                    funds : (prevFunds?.funds as bigint - amount)
                }
            })

            const statusUpdate = prisma.applicant.update({
                where : {
                    id : applicantId
                },
                data : {
                    fundsReceived : true
                }
            })
            const response = await prisma.$transaction([add,subtract,statusUpdate])

            if(response){
                return res.status(200).json({
                    message : "transaction successfull"
                })
            }else{
                return res.status(501).json({
                    message : "transaction unsuccessfull"
                })
            }

        }else{
            res.status(404).json({
                message : "bank account not found"
            })
        }

    } catch (err) {
        res.status(500).json({
            message : "something is up with the database....please wait for sometime"
        })
    }    
}


export const AdminApplicants = async(req : Request ,res : Response)=>{
    try {
        const applicants = await prisma.applicant.findMany({})
        return res.status(200).json({
            applicants : applicants
        })
    } catch (err) {
        res.status(500).json({
            message : "something is up with the database...please wait for sometime"
        })
    }
}

export const AdminApplicantSearchBar = async(req : Request ,res : Response)=>{
    //body will consists of applicant id
    try {
        const searchedApplicant = await prisma.applicant.findFirst({
            where : {
                id : req.body.id
            }
        })

        const searchedApplicantbankDetails = await prisma.bankDetails.findFirst({
            where : {
                applicantId : req.body.id
            }
        })
        
        const searchedApplicantdocuments = await prisma.documents.findFirst({
            where : {
                applicantId : req.body.id
            }
        })
        
        if(searchedApplicant){
            return res.status(200).json({
            id : searchedApplicant.id,
            phone : searchedApplicant.phone,
            email : searchedApplicant.email,
            firstName : searchedApplicant.firstName,
            lastName : searchedApplicant.lastName,
            fundsReceived : searchedApplicant.fundsReceived,
            bankDetails : {
                IFSC : searchedApplicantbankDetails?.IFSC,
                BRANCH_NAME : searchedApplicantbankDetails?.BRANCH_NAME,
                ACCOUNT_NAME : searchedApplicantbankDetails?.ACCOUNT_NO
            },
            documents : {
                incomeCertificate : searchedApplicantdocuments?.incomeCertificate,
                pwd : searchedApplicantdocuments?.pwdCertificate,
                casteCertificate : searchedApplicantdocuments?.casteCertificate,
                instituteId : searchedApplicantdocuments?.instituteId,
            }
        })
    }else{
        return res.status(200).json({
            message : "no applicant found"
        })
    }
    } catch (err) {
        res.status(500).json({
            message : "something is up with the database...please wait for sometime"
        })
    }
}