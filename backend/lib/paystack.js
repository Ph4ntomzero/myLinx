import Paystack from "paystack";
import dotenv from "dotenv";

dotenv.config();

export const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);