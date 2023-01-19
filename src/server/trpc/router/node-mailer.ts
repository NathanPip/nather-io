import { procedure, router } from "../utils";
import nodemailer from "nodemailer";
import { string, z } from "zod";
import { serverEnv } from "~/env/server";

type EmailInput = {
  name: string;
  email: string;
  message: string;
};

const inputParser = z.object({
  name: z.string(),
  email: z.string(),
  message: z.string(),
});

export default router({
  sendEmail: procedure.input(inputParser).mutation(async ({ input }) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: serverEnv.EMAIL,
        pass: serverEnv.EMAIL_AUTH,
      },
    });

    const mailOptions = {
      to: serverEnv.EMAIL,
      from: serverEnv.EMAIL,
      name: input.name,
      subject: `New Message from ${input.name} at ${input.email}`,
      text: input.message,
    };

    await (async () =>
      new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      }))();

    return { success: true };
  }),
});
