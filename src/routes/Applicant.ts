import { ApplicantSignin, ApplicantSignup } from "../controllers";
import express from "express";
import CheckEmail from "../middlewares/CheckEmail";
import { sendOtp, verifyOtp } from "../utils/Otp";

const router = express.Router();

router.post("/apply/sendotp",sendOtp);
router.post("/signup",verifyOtp, CheckEmail,ApplicantSignup);
router.post("/signin",verifyOtp, ApplicantSignin);

export default router;