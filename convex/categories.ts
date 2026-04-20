import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

const defaultCategories = [
  { name: "Food", icon: "🍲", color: "var(--chart-1)" },
  { name: "Transport", icon: "🚖", color: "var(--chart-3)" },
  { name: "Bills", icon: "💡", color: "var(--chart-2)" },
  { name: "Entertainment", icon: "🎬", color: "var(--chart-4)" },
  { name: "Health", icon: "🩺", color: "var(--chart-5)" },
  { name: "Shopping", icon: "🛍️", color: "var(--chart-1)" },
  { name: "Other", icon: "•", color: "var(--chart-3)" },
] as const;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const own = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const defaults = await ctx.db
      .query("categories")
      .withIndex("by_default", (q) => q.eq("isDefault", true))
      .collect();
    const merged = [...defaults, ...own];
    const byId = new Map(merged.map((category) => [category._id, category]));
    return Array.from(byId.values());
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_user_and_name", (q) => q.eq("userId", user._id).eq("name", args.name))
      .unique();
    if (existing) {
      throw new Error("Validation error: Category already exists");
    }
    return await ctx.db.insert("categories", {
      userId: user._id,
      name: args.name.trim(),
      icon: args.icon,
      color: args.color,
      isDefault: false,
    });
  },
});

export const remove = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    if (category.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.categoryId);
  },
});

export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    if (existing.length > 0) {
      return existing.map((category) => category._id);
    }
    const ids = [];
    for (const category of defaultCategories) {
      const id = await ctx.db.insert("categories", {
        userId: user._id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        isDefault: true,
      });
      ids.push(id);
    }
    return ids;
  },
});
