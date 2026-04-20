import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireHouseholdAccess } from "./lib/auth";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const memberships = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const result = [];
    for (const membership of memberships) {
      const household = await ctx.db.get(membership.householdId);
      if (!household) continue;
      result.push({
        householdId: household._id,
        name: household.name,
        role: membership.role,
      });
    }
    return result;
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const now = Date.now();
    const householdId = await ctx.db.insert("households", {
      ownerUserId: user._id,
      name: args.name.trim() || "My household",
      createdAt: now,
    });
    await ctx.db.insert("householdMembers", {
      householdId,
      userId: user._id,
      role: "owner",
      joinedAt: now,
    });
    return householdId;
  },
});

export const invite = mutation({
  args: {
    householdId: v.id("households"),
    email: v.string(),
    role: v.union(v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await requireHouseholdAccess(ctx, user._id, args.householdId, ["owner"]);
    return await ctx.db.insert("householdInvites", {
      householdId: args.householdId,
      email: args.email.toLowerCase(),
      role: args.role,
      invitedByUserId: user._id,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const listInvites = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const households = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const byHousehold = new Set(households.map((entry) => entry.householdId));
    const invites = [];
    for (const householdId of byHousehold) {
      const rows = await ctx.db
        .query("householdInvites")
        .withIndex("by_household_and_status", (q) =>
          q.eq("householdId", householdId).eq("status", "pending"),
        )
        .collect();
      invites.push(...rows);
    }
    return invites;
  },
});
