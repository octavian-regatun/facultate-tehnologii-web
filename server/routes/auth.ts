import type { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { db } from "../db";
import type { Middleware } from "../router";
import jwt from "jsonwebtoken";

export const isAuthenticated: Middleware = (req, res, next) => {
  const authorization = req.headers["authorization"];

  if (typeof authorization !== "string") {
    res.writeHead(401, { "Content-Type": "text/plain" });
    res.end("Unauthorized");

    return;
  }

  const token = authorization.split(" ")[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch (error) {
    console.error(error);
    res.writeHead(401, { "Content-Type": "text/plain" });
    res.end("Unauthorized");
  }
};

const createJwt = (user: User) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT secret not found");
  }

  // Remove pass - too sensitive
  const payload = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };

  return jwt.sign(payload, secret, {
    expiresIn: "1d",
  });
};

export const signUp = async (user: User) => {
  const { password } = user;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = await db.user.create({
    data: {
      ...user,
      password: hashedPassword,
    },
  });
  console.log(user);

  const token = createJwt(newUser);

  return { token, uid: newUser.id };
};

export const signUpMiddleware: Middleware = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    const user = JSON.parse(body) as User;

    try {
      const newUser = await signUp(user);
      console.log(newUser);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newUser));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  });
};

export const signIn = async (email: string, password: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Wrong e-mail");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    throw new Error("Incorrect password");
  }

  const token = createJwt(user);

  return { token, uid: user.id };
};

export const signInMiddleware: Middleware = async (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    const { email, password } = JSON.parse(body);

    try {
      const user = await signIn(email, password);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
    } catch (error: any) {
      console.error(error);
      res.writeHead(401, { "Content-Type": "text/plain" });
      res.end(error?.message);
    }
  });
};
