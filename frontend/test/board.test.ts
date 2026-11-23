import { describe, expect, it } from "vitest";
import {
  addCard,
  deleteCard,
  initialColumns,
  moveCard,
  renameColumn,
} from "../lib/board";

describe("board state", () => {
  it("renames a column", () => {
    const result = renameColumn(initialColumns, "backlog", "Ideas");
    expect(result[0].title).toBe("Ideas");
  });

  it("adds a card with title and details", () => {
    const result = addCard(initialColumns, "backlog", {
      id: "card-new",
      title: "New task",
      details: "New details",
    });
    expect(result[0].cards.at(-1)).toEqual({
      id: "card-new",
      title: "New task",
      details: "New details",
    });
  });

  it("deletes a card", () => {
    const result = deleteCard(initialColumns, "card-1");
    expect(result[0].cards.map((card) => card.id)).not.toContain("card-1");
  });

  it("moves a card to another column", () => {
    const result = moveCard(initialColumns, "card-1", "done");
    expect(result[0].cards.map((card) => card.id)).not.toContain("card-1");
    expect(result[4].cards.at(-1)?.id).toBe("card-1");
  });

  it("reorders a card within a column", () => {
    const result = moveCard(initialColumns, "card-1", "backlog", 1);
    expect(result[0].cards.map((card) => card.id)).toEqual(["card-2", "card-1"]);
  });
});
