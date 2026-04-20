import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getCurrentUser,
  getUserActiveHousehold,
  requireHouseholdAccess,
} from "./lib/auth";

export const list = query({
  args: { includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const householdCtx = await getUserActiveHousehold(ctx, user._id);
    const ownGoals = await ctx.db
      .query("goals")
      .withIndex("by_user_and_updated_at", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const householdGoals =
      householdCtx?.household._id === undefined
        ? []
        : await ctx.db
            .query("goals")
            .withIndex("by_household_and_status", (q) =>
              q.eq("householdId", householdCtx.household._id).eq("status", "active"),
            )
            .collect();

    const merged = [...ownGoals, ...householdGoals].filter((goal) =>
      args.includeArchived ? true : goal.status === "active",
    );
    return merged;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    targetAmountMinor: v.number(),
    targetDate: v.optional(v.string()),
    monthlyContributionMinor: v.optional(v.number()),
    householdId: v.optional(v.id("households")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (args.targetAmountMinor <= 0) {
      throw new Error("Validation error: targetAmountMinor must be greater than 0");
    }
    if (args.householdId) {
      await requireHouseholdAccess(ctx, user._id, args.householdId, ["owner", "member"]);
    }
    const now = Date.now();
    return await ctx.db.insert("goals", {
      userId: user._id,
      householdId: args.householdId,
      name: args.name.trim(),
      targetAmountMinor: args.targetAmountMinor,
      currentAmountMinor: 0,
      targetDate: args.targetDate,
      monthlyContributionMinor: args.monthlyContributionMinor,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProgress = mutation({
  args: {
    goalId: v.id("goals"),
    amountMinorDelta: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const goal = await ctx.db.get(args.goalId);
    if (!goal) {
      throw new Error("Goal not found");
    }
    if (goal.householdId) {
      await requireHouseholdAccess(ctx, user._id, goal.householdId, ["owner", "member"]);
    } else if (goal.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    const next = Math.max(0, goal.currentAmountMinor + args.amountMinorDelta);
    const status = next >= goal.targetAmountMinor ? "completed" : goal.status;
    await ctx.db.patch(goal._id, {
      currentAmountMinor: next,
      status,
      updatedAt: Date.now(),
    });
    if (goal.targetDate && goal.monthlyContributionMinor && status !== "completed") {
      const due = new Date(`${goal.targetDate}T00:00:00.000Z`).getTime();
      const monthsLeft = Math.max(
        1,
        Math.ceil((due - Date.now()) / (1000 * 60 * 60 * 24 * 30)),
      );
      const requiredPerMonth = Math.max(
        0,
        (goal.targetAmountMinor - next) / monthsLeft,
      );
      if (requiredPerMonth > goal.monthlyContributionMinor) {
        await ctx.db.insert("notifications", {
          userId: user._id,
          householdId: goal.householdId,
          title: "Goal may slip",
          message: `Increase monthly contribution for "${goal.name}" to stay on track.`,
          type: "goal_slip",
          severity: "medium",
          createdAt: Date.now(),
          metadata: { goalId: goal._id },
        });
      }
    }
  },
});

export const archive = mutation({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const goal = await ctx.db.get(args.goalId);
    if (!goal) throw new Error("Goal not found");
    if (goal.householdId) {
      await requireHouseholdAccess(ctx, user._id, goal.householdId, ["owner"]);
    } else if (goal.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.goalId, { status: "archived", updatedAt: Date.now() });
  },
});
