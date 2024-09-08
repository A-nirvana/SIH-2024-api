import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload, Secret } from 'jsonwebtoken'
import prisma from "../../prisma/prismaClient"

const JWT_SECRET : Secret = process.env.JWT_SECRET as Secret  


export async function AuthMiddleware ( req : Request | any, res : Response, next : NextFunction){
  const token_with_bearer  =  req.header('Authorization') || ""
  const token = token_with_bearer.split(" ")[1]
  if(!token){
    return res.status(401).json({
        message  : "No authorization found"
    })
  }
  try {
    const payload = await jwt.verify(token,JWT_SECRET) as JwtPayload
    const {id} = payload as any;
    
    if(!id){
      return res.status(401).json({
        message : 'token invalid'
      })
    }
    
    try {
      const applicant = await prisma.applicant.findUnique({
        where : {
          id : id
        }
      })
      
      if(applicant){
        req.applicant = applicant
        await next()
      }else{
        return res.status(401).json({
          message : "you are not authorized"
        })
      }

    } catch (err) {
      return res.status(400).json({
        message : "something is up with the database..please try again later"
      })
    }


  } catch (err) {
    return res.status(503).json({
      message  : "something is up....please wait for sometime"
    })
  }
}