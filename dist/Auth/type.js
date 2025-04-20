"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.UserSchema = exports.sleepchallenge = exports.Staketype = exports.challenge = void 0;
const zod_1 = require("zod");
exports.challenge = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    memberqty: zod_1.z
        .number()
        .int()
        .positive("Member quantity must be a positive integer")
        .gt(0, "Daily step count must be greater than 0"),
    Dailystep: zod_1.z
        .number()
        .int()
        .positive("Daily step count must be a positive integer")
        .gt(0, "Daily step count must be greater than 0"),
    Amount: zod_1.z
        .number()
        .positive("Amount must be a positive number")
        .gt(0, "Amount must be greater than 0"),
    Digital_Currency: zod_1.z.string().min(1, "Digital currency is required"),
    days: zod_1.z.number().int().positive("Days must be a positive integer"),
    members: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.Staketype = zod_1.z.object({
    amount: zod_1.z
        .number()
        .positive("Amount must be a positive number")
        .gt(0, "Amount must be greater than 0"),
    days: zod_1.z.number().int().positive("Days must be a positive integer"),
    Hours: zod_1.z.string().min(1, "Hours is required"),
    Startdate: zod_1.z.string().min(1, "Start date is required"),
    enddate: zod_1.z.string().min(1, "End date is required"),
});
exports.sleepchallenge = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    memberqty: zod_1.z
        .number()
        .int()
        .positive("Member quantity must be a positive integer")
        .gt(0, "Daily step count must be greater than 0"),
    Hours: zod_1.z.string(),
    Amount: zod_1.z
        .number()
        .positive("Amount must be a positive number")
        .gt(0, "Amount must be greater than 0"),
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
