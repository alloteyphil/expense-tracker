import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  categories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.string(),
    isDefault: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_name", ["userId", "name"]),

  expenses: defineTable({
    userId: v.id("users"),
    categoryId: v.optional(v.id("categories")),
    amount: v.number(),
    currency: v.string(),
    note: v.optional(v.string()),
    merchant: v.optional(v.string()),
    spentAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_spent_at", ["userId", "spentAt"])
    .index("by_user_and_category_and_spent_at", ["userId", "categoryId", "spentAt"]),
});
