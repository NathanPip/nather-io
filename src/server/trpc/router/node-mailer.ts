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
    try {

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

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      return { success: true };
    } catch (e) {
      console.log(e);
      return { success: false };
    }
  }),
});
