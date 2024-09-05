import { Request, Response,NextFunction } from "express";

const CheckEmail = async (req: Request, res: Response,next:NextFunction) => {
  const { email } = req.body;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(email);
  if (!isValid) {
    res.status(400).json({ message: "Invalid email" });
  }else
  next();
};

export default CheckEmail;