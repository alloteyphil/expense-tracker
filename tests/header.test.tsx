import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Header } from "../components/trackr/header";

describe("Header", () => {
  it("moves month backward and forward", async () => {
    const onMonthChange = vi.fn();
    const base = new Date("2026-04-15T00:00:00.000Z");

    render(
      <Header
        month={base}
        onMonthChange={onMonthChange}
        search=""
        onSearchChange={vi.fn()}
        onAddTransaction={vi.fn()}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getAllByRole("button", { name: /previous month/i })[0]);
    await user.click(screen.getAllByRole("button", { name: /next month/i })[0]);

    expect(onMonthChange).toHaveBeenCalledTimes(2);
    expect(onMonthChange.mock.calls[0][0]).toBeInstanceOf(Date);
    expect(onMonthChange.mock.calls[1][0]).toBeInstanceOf(Date);
  });

  it("emits search updates and add action", async () => {
    const onSearchChange = vi.fn();
    const onAddTransaction = vi.fn();

    render(
      <Header
        month={new Date("2026-04-15T00:00:00.000Z")}
        onMonthChange={vi.fn()}
        search=""
        onSearchChange={onSearchChange}
        onAddTransaction={onAddTransaction}
      />,
    );

    const user = userEvent.setup();
    const searchInputs = screen.getAllByRole("searchbox", { name: /search transactions/i });
    await user.type(searchInputs[0], "food");
    await user.click(screen.getByRole("button", { name: /add transaction/i }));

    expect(onSearchChange).toHaveBeenCalled();
    expect(onAddTransaction).toHaveBeenCalledTimes(1);
  });
});
