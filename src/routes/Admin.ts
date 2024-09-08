import { AdminSignin,AdminSignup,AdminDocumentStatus,AdminDocumentVerification,AdminTransaction,AdminApplicantSearchBar  } from "../controllers";
import express from "express";
import CheckEmail from "../middlewares/CheckEmail";
import { sendOtp, verifyOtp } from "../utils/Otp";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

const router = express.Router();

router.post("/sendotp",sendOtp);
router.post("/signup" ,verifyOtp, CheckEmail, AdminSignup);
router.post("/signin", AdminSignin);
router.post('/document_status',AuthMiddleware,AdminDocumentStatus)
router.get('/document_verification',AuthMiddleware,AdminDocumentVerification)
router.post('/transaction',AuthMiddleware,AdminTransaction)
router.get('/applicants',AuthMiddleware,AdminApplicantSearchBar)
export default router;