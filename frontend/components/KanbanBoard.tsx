"use client";

import { FormEvent, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  addCard,
  Card,
  Column,
  deleteCard,
  initialColumns,
  moveCard,
  renameColumn,
} from "@/lib/board";

function CardItem({
  card,
  onDelete,
}: {
  card: Card;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`task-card${isDragging ? " task-card--dragging" : ""}`}
      data-testid={`card-${card.id}`}
    >
      <button
        className="drag-handle"
        type="button"
        aria-label={`Drag ${card.title}`}
        {...attributes}
        {...listeners}
      >
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </button>
      <div className="task-card__content">
        <h3>{card.title}</h3>
        <p>{card.details}</p>
      </div>
      <button
        className="delete-card"
        type="button"
        aria-label={`Delete ${card.title}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onDelete(card.id);
        }}
      >
        <span aria-hidden="true">×</span>
      </button>
    </article>
  );
}

function BoardColumn({
  column,
  onRename,
  onAdd,
  onDelete,
  onMove,
}: {
  column: Column;
  onRename: (id: string, title: string) => void;
  onAdd: (id: string, title: string, details: string) => void;
  onDelete: (id: string) => void;
  onMove: (cardId: string, columnId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(column.title);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  function finishRename() {
    onRename(column.id, name);
    setRenaming(false);
  }

  function submitRename(event: FormEvent) {
    event.preventDefault();
    finishRename();
  }

  function addTask(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    onAdd(column.id, title.trim(), details.trim());
    setTitle("");
    setDetails("");
    setAdding(false);
  }

  return (
    <section
      ref={setNodeRef}
      className={`board-column${isOver ? " board-column--over" : ""}`}
      data-testid={`column-${column.id}`}
    >
      <div className="column-heading">
        {renaming ? (
          <form className="rename-form" onSubmit={submitRename}>
            <input
              aria-label={`Rename ${column.title}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={finishRename}
              autoFocus
            />
          </form>
        ) : (
          <button
            className="column-title"
            type="button"
            aria-label={`Rename ${column.title}`}
            onClick={() => setRenaming(true)}
          >
            {column.title}
          </button>
        )}
        <span className="card-count">{column.cards.length}</span>
      </div>

      <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <div className="card-list">
          {column.cards.map((card) => (
            <CardItem key={card.id} card={card} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>

      {adding ? (
        <form className="add-card-form" onSubmit={addTask}>
          <input
            aria-label="Card title"
            placeholder="Card title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
          <textarea
            aria-label="Card details"
            placeholder="Details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />
          <div className="form-actions">
            <button className="button button--primary" type="submit">Add card</button>
            <button className="button button--ghost" type="button" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="add-card" type="button" onClick={() => setAdding(true)}>
          <span aria-hidden="true">+</span> Add card
        </button>
      )}
    </section>
  );
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const cardId = String(active.id);
    const overId = String(over.id);
    const targetColumn =
      columns.find((column) => column.id === overId) ??
      columns.find((column) => column.cards.some((card) => card.id === overId));
    if (!targetColumn) return;

    const targetIndex = targetColumn.cards.findIndex((card) => card.id === overId);
    setColumns((current) =>
      moveCard(current, cardId, targetColumn.id, targetIndex >= 0 ? targetIndex : undefined),
    );
  }

  function handleAdd(columnId: string, title: string, details: string) {
    setColumns((current) =>
      addCard(current, columnId, {
        id: `card-${Date.now()}`,
        title,
        details,
      }),
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span>Flowboard</span>
        </div>
        <div className="board-name">
          <span className="status-dot" />
          Product launch
        </div>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="board" data-testid="board">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              onRename={(id, title) => setColumns((current) => renameColumn(current, id, title))}
              onAdd={handleAdd}
              onDelete={(id) => setColumns((current) => deleteCard(current, id))}
              onMove={(cardId, columnId) =>
                setColumns((current) => moveCard(current, cardId, columnId))
              }
            />
          ))}
        </div>
      </DndContext>
    </main>
  );
}
