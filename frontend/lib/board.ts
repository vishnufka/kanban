export type Card = {
  id: string;
  title: string;
  details: string;
};

export type Column = {
  id: string;
  title: string;
  cards: Card[];
};

export const initialColumns: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    cards: [
      { id: "card-1", title: "Design landing page", details: "Create the first-pass visual direction." },
      { id: "card-2", title: "Write launch notes", details: "Outline key product updates and benefits." },
    ],
  },
  {
    id: "planned",
    title: "Planned",
    cards: [
      { id: "card-3", title: "Customer interviews", details: "Schedule three product discovery calls." },
      { id: "card-4", title: "Analytics review", details: "Audit the highest-value conversion events." },
    ],
  },
  {
    id: "progress",
    title: "In progress",
    cards: [{ id: "card-5", title: "Build onboarding", details: "Complete the core new-user flow." }],
  },
  {
    id: "review",
    title: "Review",
    cards: [{ id: "card-6", title: "Mobile polish", details: "Check spacing and responsive behavior." }],
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "card-7", title: "Project kickoff", details: "Align goals and responsibilities." }],
  },
];

export function renameColumn(columns: Column[], columnId: string, title: string): Column[] {
  return columns.map((column) => (column.id === columnId ? { ...column, title: title.trim() || column.title } : column));
}

export function addCard(columns: Column[], columnId: string, card: Card): Column[] {
  return columns.map((column) =>
    column.id === columnId ? { ...column, cards: [...column.cards, card] } : column,
  );
}

export function deleteCard(columns: Column[], cardId: string): Column[] {
  return columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) => card.id !== cardId),
  }));
}

export function moveCard(columns: Column[], cardId: string, targetColumnId: string, targetIndex?: number): Column[] {
  const sourceColumn = columns.find((column) => column.cards.some((card) => card.id === cardId));
  const targetColumn = columns.find((column) => column.id === targetColumnId);
  if (!sourceColumn || !targetColumn) return columns;

  const card = sourceColumn.cards.find((item) => item.id === cardId);
  if (!card) return columns;

  if (sourceColumn.id === targetColumnId) {
    const cards = [...sourceColumn.cards];
    const oldIndex = cards.findIndex((item) => item.id === cardId);
    cards.splice(oldIndex, 1);
    const insertAt = targetIndex === undefined ? cards.length : Math.max(0, Math.min(targetIndex, cards.length));
    cards.splice(insertAt, 0, card);
    return columns.map((column) => (column.id === sourceColumn.id ? { ...column, cards } : column));
  }

  return columns.map((column) => {
    if (column.id === sourceColumn.id) {
      return { ...column, cards: column.cards.filter((item) => item.id !== cardId) };
    }
    if (column.id === targetColumnId) {
      const cards = [...column.cards];
      const insertAt =
        targetIndex === undefined ? cards.length : Math.max(0, Math.min(targetIndex, cards.length));
      cards.splice(insertAt, 0, card);
      return { ...column, cards };
    }
    return column;
  });
}
