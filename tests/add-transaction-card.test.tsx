import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddTransactionCard } from "../components/trackr/add-transaction-card";
import type { Category } from "../lib/types";

const categories: Category[] = [
  {
    id: "food",
    label: "Food",
    color: "var(--chart-1)",
    glyph: "🍲",
    applicableTo: ["expense"],
  },
  {
    id: "salary",
    label: "Salary",
    color: "var(--chart-2)",
    glyph: "💼",
    applicableTo: ["income"],
  },
];

describe("AddTransactionCard", () => {
  it("shows validation when amount is missing", async () => {
    const onAdd = vi.fn();
    render(<AddTransactionCard categories={categories} onAdd={onAdd} />);
    await userEvent.click(screen.getByRole("button", { name: /add transaction/i }));
    expect(
      screen.getByText(/enter an amount greater than 0/i),
    ).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("submits payload and uses initial draft", async () => {
    const onAdd = vi.fn();
    render(
      <AddTransactionCard
        categories={categories}
        onAdd={onAdd}
        initialDraft={{
          amount: 12.5,
          date: "2026-04-20",
          note: "Koala",
        }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /add transaction/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 12.5,
        date: "2026-04-20",
        note: "Koala",
      }),
    );
  });
});
