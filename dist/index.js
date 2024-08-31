"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = __importDefault(require("zod"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = require("jsonwebtoken");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const signupSchema = zod_1.default.object({
    username: zod_1.default.string().email(),
    password: zod_1.default.string().min(6),
    firstName: zod_1.default.string().min(1),
    lastName: zod_1.default.string().min(1)
});
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signupBody = req.body;
    const response = signupSchema.safeParse(signupBody);
    try {
        const existingUser = yield prisma.user.findFirst({
            where: {
                username: signupBody.username
            }
        });
        if (!response.success || existingUser) {
            return res.status(403).json({
                "message": "incorrect credentials/ username already in use"
            });
        }
        const user = yield prisma.user.create({
            data: {
                username: signupBody.username,
                password: signupBody.password,
                firstName: signupBody.firstName,
                lastName: signupBody.lastName
            }
        });
        var token = yield (0, jsonwebtoken_1.sign)({ id: user.id }, JWT_SECRET);
        return res.status(200).json({
            message: "user created successfully",
            token: token
        });
    }
    catch (err) {
        res.json({
            message: "something is up with the database...please wait for sometime"
        });
    }
}));
const signinBodySchema = zod_1.default.object({
    username: zod_1.default.string().email(),
    password: zod_1.default.string().min(6)
});
app.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signinBody = req.body;
    const response = signinBodySchema.safeParse(signinBody);
    const userInDatabase = yield prisma.user.findUnique({
        where: {
            username: signinBody.username,
            password: signinBody.password
        }
    });
    if (!userInDatabase || !response.success) {
        res.json({
            message: "user does not exists / incorrect inputs"
        });
    }
    else {
        var token = yield (0, jsonwebtoken_1.sign)({ id: userInDatabase.id }, JWT_SECRET);
        return res.json({
            message: "you are logged in",
            token: token
        });
    }
}));
app.listen(3000);
