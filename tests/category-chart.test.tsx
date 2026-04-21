import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryChart } from "../components/trackr/category-chart";
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
    id: "rent",
    label: "Rent",
    color: "var(--chart-2)",
    glyph: "🏠",
    applicableTo: ["expense"],
  },
];

describe("CategoryChart", () => {
  it("shows empty state when no category breakdown exists", () => {
    render(<CategoryChart categories={categories} breakdown={[]} monthLabel="April 2026" />);
    expect(screen.getByText(/no expenses yet/i)).toBeInTheDocument();
  });

  it("renders category labels from breakdown rows", () => {
    render(
      <CategoryChart
        categories={categories}
        breakdown={[
          { categoryId: "food", amount: 120, count: 2 },
          { categoryId: "rent", amount: 300, count: 1 },
        ]}
        monthLabel="April 2026"
      />,
    );

    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
  });
});
