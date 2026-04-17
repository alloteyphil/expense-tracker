import { AuthConfig } from "convex/server";

export default {
  providers: [
    // Add your Clerk JWT issuer domain and uncomment:
    // {
    //   domain: "https://your-clerk-domain.clerk.accounts.dev",
    //   applicationID: "convex",
    // },
  ],
} satisfies AuthConfig;
