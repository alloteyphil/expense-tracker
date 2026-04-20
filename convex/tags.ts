import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const create = mutation({
  args: { name: v.string(), color: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_user_and_name", (q) => q.eq("userId", user._id).eq("name", args.name))
      .unique();
    if (existing) {
      return existing._id;
    }
    return await ctx.db.insert("tags", {
      userId: user._id,
      name: args.name.trim(),
      color: args.color,
      createdAt: Date.now(),
    });
  },
});
