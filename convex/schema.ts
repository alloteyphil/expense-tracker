import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    preferredCurrency: v.string(),
    role: v.optional(v.union(v.literal("owner"), v.literal("admin"), v.literal("member"))),
  }).index("by_token", ["tokenIdentifier"]),

  categories: defineTable({
    userId: v.union(v.id("users"), v.null()),
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    isDefault: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_name", ["userId", "name"])
    .index("by_default", ["isDefault"]),

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

  transactions: defineTable({
    userId: v.id("users"),
    amountMinor: v.number(),
    type: v.union(v.literal("income"), v.literal("expense")),
    categoryId: v.id("categories"),
    note: v.optional(v.string()),
    merchant: v.optional(v.string()),
    date: v.number(),
    month: v.string(),
    isRecurring: v.boolean(),
    recurringInterval: v.union(v.literal("weekly"), v.literal("monthly"), v.null()),
    nextRecurringAt: v.optional(v.number()),
    sourceExpenseId: v.optional(v.id("expenses")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_type_and_date", ["userId", "type", "date"])
    .index("by_user_and_category_and_date", ["userId", "categoryId", "date"])
    .index("by_user_and_month", ["userId", "month"])
    .index("by_user_and_is_recurring_and_date", ["userId", "isRecurring", "date"])
    .index("by_user_and_next_recurring_at", ["userId", "nextRecurringAt"])
    .index("by_next_recurring_at", ["nextRecurringAt"]),

  budgets: defineTable({
    userId: v.id("users"),
    categoryId: v.id("categories"),
    limitMinor: v.number(),
    month: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_and_month", ["userId", "month"])
    .index("by_user_and_category_and_month", ["userId", "categoryId", "month"]),

  tags: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_name", ["userId", "name"]),

  transactionTags: defineTable({
    userId: v.id("users"),
    transactionId: v.id("transactions"),
    tagId: v.id("tags"),
  })
    .index("by_user_and_transaction", ["userId", "transactionId"])
    .index("by_user_and_tag", ["userId", "tagId"]),

  notifications: defineTable({
    userId: v.id("users"),
    householdId: v.optional(v.id("households")),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("budget"),
      v.literal("recurring"),
      v.literal("system"),
      v.literal("budget_risk"),
      v.literal("spend_spike"),
      v.literal("goal_slip"),
      v.literal("receipt_failed"),
    ),
    severity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
    metadata: v.optional(
      v.object({
        month: v.optional(v.string()),
        categoryId: v.optional(v.id("categories")),
        goalId: v.optional(v.id("goals")),
        receiptId: v.optional(v.id("receipts")),
      }),
    ),
  })
    .index("by_user_and_created_at", ["userId", "createdAt"])
    .index("by_user_and_read_at", ["userId", "readAt"]),

  goals: defineTable({
    userId: v.id("users"),
    householdId: v.optional(v.id("households")),
    name: v.string(),
    targetAmountMinor: v.number(),
    currentAmountMinor: v.number(),
    targetDate: v.optional(v.string()),
    monthlyContributionMinor: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("completed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_and_updated_at", ["userId", "updatedAt"])
    .index("by_household_and_status", ["householdId", "status"]),

  receipts: defineTable({
    userId: v.id("users"),
    householdId: v.optional(v.id("households")),
    storageId: v.optional(v.id("_storage")),
    fileName: v.string(),
    contentType: v.optional(v.string()),
    status: v.union(v.literal("uploaded"), v.literal("parsed"), v.literal("needs_review"), v.literal("failed")),
    extractedAmountMinor: v.optional(v.number()),
    extractedMerchant: v.optional(v.string()),
    extractedDate: v.optional(v.number()),
    parserNotes: v.optional(v.string()),
    linkedTransactionId: v.optional(v.id("transactions")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_and_created_at", ["userId", "createdAt"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_household_and_created_at", ["householdId", "createdAt"]),

  households: defineTable({
    ownerUserId: v.id("users"),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_owner", ["ownerUserId"]),

  householdMembers: defineTable({
    householdId: v.id("households"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("member"), v.literal("viewer")),
    joinedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_user", ["userId"])
    .index("by_household_and_user", ["householdId", "userId"]),

  householdInvites: defineTable({
    householdId: v.id("households"),
    email: v.string(),
    role: v.union(v.literal("member"), v.literal("viewer")),
    invitedByUserId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("revoked")),
    createdAt: v.number(),
  })
    .index("by_household_and_status", ["householdId", "status"])
    .index("by_email_and_status", ["email", "status"]),
});
