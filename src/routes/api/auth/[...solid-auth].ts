import { SolidAuth, type SolidAuthConfig } from "@auth/solid-start"
import GitHub from "@auth/core/providers/github"
import { serverEnv } from "~/env/server"

export const authOpts: SolidAuthConfig = {
  providers: [
    // @ts-expect-error Types Issue
    GitHub({
      clientId: serverEnv.GITHUB_CLIENT_ID,
      clientSecret: serverEnv.GITHUB_SECRET,
    }),
  ],
  debug: false,
}

export const { GET, POST } = SolidAuth(authOpts)