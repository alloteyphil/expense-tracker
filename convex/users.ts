import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUserIdentity } from "./lib/auth";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireUserIdentity(ctx);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email ?? "",
      name: identity.name,
      imageUrl: identity.pictureUrl,
      preferredCurrency: "GHS",
      role: "owner",
    });
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    preferredCurrency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await ctx.db.patch(user._id, {
      name: args.name ?? user.name,
      preferredCurrency: args.preferredCurrency ?? user.preferredCurrency,
    });
    return await ctx.db.get(user._id);
  },
});
