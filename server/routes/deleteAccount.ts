import nodemailer from 'nodemailer';
import crypto from 'crypto';
import type { Middleware } from '../router';
import { db } from '../db';


export const deleteConfirmationMiddleware: Middleware = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk;
    });

    req.on("end", async () => {
        const { id } = JSON.parse(body);

        try {
            const user = await db.user.findUnique({
                where: { id },
            });

            if (!user) {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "User not found" }));
                return;
            }

            const deleteToken = crypto.randomBytes(32).toString("hex");
            const deleteAccountExpires = new Date(Date.now() + 3600000); // 1 hour

            await db.user.update({
                where: { id },
                data: {
                    deleteAccountToken: deleteToken,
                    deleteAccountExpires,
                },
            });

            const transportOptions = {
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.APP_PASSWORD,
                },
            };

            const transporter = nodemailer.createTransport(transportOptions);

            const mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
                subject: 'M-PIC: Delete Account',
                html: `
                    <div style="background-color: #66ccaf; padding: 20px; text-align: center; font-family: Arial, sans-serif; color: #260020;">
                        <h2>Account removal</h2>
                        <br>
                        <p>You requested to delete your personal account from M-PIC. Kindly use the link below to do so:</p>
                        <p><a href="https://127.0.0.1:5500/client/pages/delete-account.html?token=${deleteToken}&id=${user.id}" style="background-color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirm delete</a></p>
                        <p>If you did not request this, please ignore this email.</p>
                        <br>
                        <img src="https://s.abcnews.com/images/US/minions-3-ht-er-220630_1656610344347_hpMain_2_16x9_1600.jpg" alt="Delete account Image" style="margin-top: 20px; width:100%; max-width:600px; border-radius: 10px;">
                    </div>
                `,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Failed to send email" }));
                } else {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Delete account email sent" }));
                }
            });

        } catch (error) {
            console.error(error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal Server Error" }));
        }
    });
};




export const deleteAccountMiddleware: Middleware = (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk;
    });

    req.on("end", async () => {
        const { token, id } = JSON.parse(body);

        try {
            const user = await db.user.findUnique({
                where: { id },
            });

            if (!user || user.deleteAccountToken !== token || !user.deleteAccountExpires || user.deleteAccountExpires.getTime() < Date.now()) {
                throw new Error("Invalid/expired email");
            }

            const result = await db.user.delete({
                where: { id }
            });

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));

        } catch (error) {
            console.error(error);
            res.writeHead(401, { "Content-Type": "text/plain" });
            res.end((error as Error).message);
        }
    });
};

