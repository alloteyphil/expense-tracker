import { MutationCtx, QueryCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

type Ctx = QueryCtx | MutationCtx;
type UserRole = "owner" | "admin" | "member";

export async function requireUserIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

export async function getCurrentUser(ctx: Ctx): Promise<Doc<"users">> {
  const identity = await requireUserIdentity(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export function assertRole(user: Doc<"users">, allowed: UserRole[]) {
  const role = user.role ?? "owner";
  if (!allowed.includes(role)) {
    throw new Error("Unauthorized");
  }
}

export function assertOwnership(
  userId: Id<"users">,
  resourceUserId: Id<"users">,
  message = "Unauthorized",
) {
  if (userId !== resourceUserId) {
    throw new Error(message);
  }
}
