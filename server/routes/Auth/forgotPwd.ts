import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import type { Middleware } from "../../router";
import { db } from "../../db";
import { signIn } from './auth';


// const oAuth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     process.env.REDIRECT_URL
// );

// oAuth2Client.setCredentials({
//     refresh_token: process.env.REFRESH_TOKEN
// });


// export const forgotPasswordMiddleware: Middleware = async (req, res) => {
//     let body = "";

//     req.on("data", (chunk) => {
//         body += chunk;
//     });

//     req.on("end", async () => {
//         const { email } = JSON.parse(body);

//         try {
//             const user = await db.user.findUnique({
//                 where: { email },
//             });

//             if (!user) {
//                 res.writeHead(404, { "Content-Type": "application/json" });
//                 res.end(JSON.stringify({ error: "User not found" }));
//                 return;
//             }

//             const resetToken = crypto.randomBytes(32).toString("hex");
//             const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

//             await db.user.update({
//                 where: { email },
//                 data: {
//                     resetPasswordToken: resetToken,
//                     resetPasswordExpires,
//                 },
//             });

//             const accessToken = await oAuth2Client.getAccessToken();

//             if (!accessToken.token) {
//                 res.writeHead(500, { "Content-Type": "application/json" });
//                 res.end(JSON.stringify({ error: "Failed to retrieve access token" }));
//                 return;
//             }

//             console.log(accessToken);

//             const transportOptions: SMTPTransport.Options = {
//                 service: 'gmail',
//                 auth: {
//                     type: 'OAuth2',
//                     user: process.env.EMAIL,
//                     clientId: process.env.CLIENT_ID,
//                     clientSecret: process.env.CLIENT_SECRET,
//                     refreshToken: process.env.REFRESH_TOKEN,
//                     accessToken: accessToken.token,
//                 },
//             };

//             const transporter = nodemailer.createTransport(transportOptions);

//             const mailOptions = {
//                 from: process.env.EMAIL,
//                 to: user.email,
//                 subject: 'Password Reset',
//                 text: `You requested for a password reset, kindly use this token to reset your password: ${resetToken}`,
//             };


//             transporter.sendMail(mailOptions, (error, info) => {
//                 if (error) {
//                     console.error(error);
//                     res.writeHead(500, { "Content-Type": "application/json" });
//                     res.end(JSON.stringify({ error: "Failed to send email" }));
//                 } else {
//                     res.writeHead(200, { "Content-Type": "application/json" });
//                     res.end(JSON.stringify({ message: "Password reset email sent" }));
//                 }
//             });

//         } catch (error) {
//             console.error(error);
//             res.writeHead(500, { "Content-Type": "application/json" });
//             res.end(JSON.stringify({ error: "Internal Server Error" }));
//         }
//     });
// };


export const forgotPasswordMiddleware: Middleware = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk;
    });

    req.on("end", async () => {
        const { email } = JSON.parse(body);

        try {
            const user = await db.user.findUnique({
                where: { email },
            });

            if (!user) {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "User not found" }));
                return;
            }

            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

            await db.user.update({
                where: { email },
                data: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpires,
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
                subject: 'M-PIC: Password Reset',
                html: `
                    <div style="background-color: #66ccaf; padding: 20px; text-align: center; font-family: Arial, sans-serif; color: #260020;">
                        <h2>Password Reset</h2>
                        <br>
                        <p>You requested a password reset. Kindly use the link below to reset your password:</p>
                        <p><a href="https://127.0.0.1:5500/client/pages/reset-pwd.html?token=${resetToken}&email=${user.email}" style="background-color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
                        <p>If you did not request this, please ignore this email.</p>
                        <br>
                        <img src="https://i.pinimg.com/736x/ca/69/bf/ca69bf6fc66dd0bedd6c3a7fef82fffb.jpg" alt="Reset Password Image" style="margin-top: 20px; width:100%; max-width:600px; border-radius: 10px;">
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
                    res.end(JSON.stringify({ message: "Password reset email sent" }));
                }
            });

        } catch (error) {
            console.error(error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal Server Error" }));
        }
    });
};




export const resetPasswordMiddleware: Middleware = (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk;
    });

    req.on("end", async () => {
        const { pwd, pwd2, token, email } = JSON.parse(body);

        try {
            const user = await db.user.findUnique({
                where: { email },
            });

            if (!user || user.resetPasswordToken !== token || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
                throw new Error("Invalid/expired email");
            }

            if (!pwd || !pwd2) {
                throw new Error("Fill both fields");
            }

            if (pwd !== pwd2) {
                throw new Error("Passwords do not match");
            }

            const hashedPassword = bcrypt.hashSync(pwd, 10);

            await db.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                },
            });

            const logIn = await signIn(email, pwd);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(logIn));

        } catch (error) {
            console.error(error);
            res.writeHead(401, { "Content-Type": "text/plain" });
            res.end((error as Error).message);
        }
    });
};

