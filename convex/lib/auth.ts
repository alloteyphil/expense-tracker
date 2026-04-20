import { MutationCtx, QueryCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

type Ctx = QueryCtx | MutationCtx;
type UserRole = "owner" | "admin" | "member";
type HouseholdRole = "owner" | "member" | "viewer";

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

export async function getUserActiveHousehold(ctx: Ctx, userId: Id<"users">) {
  const membership = await ctx.db
    .query("householdMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  if (!membership) return null;
  const household = await ctx.db.get(membership.householdId);
  if (!household) return null;
  return { household, membership };
}

export async function requireHouseholdAccess(
  ctx: Ctx,
  userId: Id<"users">,
  householdId: Id<"households">,
  allowed: HouseholdRole[] = ["owner", "member", "viewer"],
) {
  const membership = await ctx.db
    .query("householdMembers")
    .withIndex("by_household_and_user", (q) =>
      q.eq("householdId", householdId).eq("userId", userId),
    )
    .unique();
  if (!membership || !allowed.includes(membership.role)) {
    throw new Error("Unauthorized household access");
  }
  return membership;
}
