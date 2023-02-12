import type { DefaultSession, DefaultUser } from "@auth/core/types";

declare module "@auth/core/types" {
  export interface Session {
    user?: {
      id?: string;
      role?: string;
    } & DefaultSession["user"];
  }
  export interface User extends DefaultUser {
    role?: string;
  }
}
