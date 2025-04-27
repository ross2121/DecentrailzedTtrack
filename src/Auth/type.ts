import { z } from "zod";

export const challenge = z.object({
  name: z.string().min(1, "Name is required"),
  memberqty: z
    .number()
    .int()
    .positive("Member quantity must be a positive integer")
    .gt(0, "Daily step count must be greater than 0"),
  Dailystep: z
    .number()
    .int()
    .positive("Daily step count must be a positive integer")
    .gt(0, "Daily step count must be greater than 0"),
  Amount: z
    .number()
    .positive("Amount must be a positive number")
    .gt(0, "Amount must be greater than 0"),
  Digital_Currency: z.string().min(1, "Digital currency is required"),
  days: z.number().int().positive("Days must be a positive integer"),
  members: z.array(z.string()).default([]),
});
export const Staketype = z.object({
  amount: z
    .number()
    .positive("Amount must be a positive number")
    .gt(0, "Amount must be greater than 0"),
  // days: z.number().int().positive("Days must be a positive integer"),
  Hours: z.string().min(1, "Hours is required"),
  Startdate: z.string().min(1, "Start date is required"),
  // enddate: z.string().min(1, "End date is required"),
});
export const sleepchallenge = z.object({
  name: z.string().min(1, "Name is required"),
  memberqty: z
    .number()
    .int()
    .positive("Member quantity must be a positive integer")
    .gt(0, "Daily step count must be greater than 0"),
  Hours: z.string(),
  Amount: z
    .number()
    .positive("Amount must be a positive number")
    .gt(0, "Amount must be greater than 0"),
  Digital_Currency: z.string().min(1, "Digital currency is required"),
  days: z.number().int().positive("Days must be a positive integer"),
  // userid: z.string(),
  members: z.array(z.string()).default([]),
});
export const UserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
