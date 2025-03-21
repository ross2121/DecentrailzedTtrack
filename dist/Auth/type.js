"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.UserSchema = exports.challenge = void 0;
const zod_1 = require("zod");
exports.challenge = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    memberqty: zod_1.z.number().int().positive("Member quantity must be a positive integer"),
    Dailystep: zod_1.z.number().int().positive("Daily step count must be a positive integer"),
    Amount: zod_1.z.number().positive("Amount must be a positive number"),
    Digital_Currency: zod_1.z.string().min(1, "Digital currency is required"),
    days: zod_1.z.number().int().positive("Days must be a positive integer"),
    // userid: z.string(),
    members: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.UserSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters long"),
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
});
