// lib/nodemailer.ts
import nodemailer from 'nodemailer';

const email = process.env.EMAIL_SERVER_USER;
const pass = process.env.EMAIL_SERVER_PASSWORD;
const host = process.env.EMAIL_SERVER_HOST;
const port = Number(process.env.EMAIL_SERVER_PORT);
const from = process.env.EMAIL_FROM;

export const transporter = nodemailer.createTransport({
  host: host,
  port: port,
  secure: port === 465, // true for 465, false for other ports
  auth: {
    user: email,
    pass: pass,
  },
});

export const mailOptions = {
  from: from,
};