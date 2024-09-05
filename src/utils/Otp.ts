import { Request, Response,NextFunction } from "express";
import sendEmail from "./SendEmail";
import prisma from "../../prisma/prismaClient";

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`OTP for ${email} is ${otp}`);
    const otpPrev= await prisma.otp.deleteMany({
      where:{
        email
      }
    });
    console.log(otpPrev);
    const otpSent = await prisma.otp.create({
      data: {
        email,
        otp,
      },
    });
    if (!otpSent) {
      res.status(400).json({ message: "OTP not sent" });
      return;
    }
    sendEmail(email, "OTP for verification", `Your OTP is ${otp}. It will expire in 5 minutes.`,"");
    res.status(200).json({ message: "OTP sent successfully" });
    setTimeout(async () => {
      const otpData = await prisma.otp.findFirst({
        where: {
          email,
        },
      });
      if (!otpData) {
        return;
      }
      await prisma.otp.delete({
        where: {
          id: otpSent.id,
        },
      });
    }, 60000*5);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response,next:NextFunction) => {
  const { email, otp } = req.body;
  try {
    console.log(`OTP for ${email} is ${otp}`);
    
    const otpData = await prisma.otp.findFirst({
      where: {
        email,
      },
    });
    if (!otpData) {
      res.status(400).json({ message: "OTP not found" });
      return;
    }
    if (otpData.otp !== otp) {
      res.status(400).json({ message: "OTP not matched" });
      return;
    }
    if (otpData.otp === otp) {
      await prisma.otp.delete({
        where: {
          id: otpData.id,
        },
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};