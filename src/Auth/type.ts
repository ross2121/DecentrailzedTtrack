import { z } from "zod";

export const challenge = z.object({
  name: z.string().min(1, "Name is required"),
  memberqty: z.number().int().positive("Member quantity must be a positive integer"),
  Dailystep: z.number().int().positive("Daily step count must be a positive integer"),
  Amount: z.number().positive("Amount must be a positive number"),
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
