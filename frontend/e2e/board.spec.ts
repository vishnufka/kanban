import { expect, test } from "@playwright/test";

test("renders dummy board and required columns", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("board")).toBeVisible();
  await expect(page.locator("[data-testid^='column-']")).toHaveCount(5);
  await expect(page.getByText("Design landing page")).toBeVisible();
});

test("renames a column", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Rename Backlog" }).click();
  const input = page.getByRole("textbox", { name: "Rename Backlog" });
  await input.fill("Ideas");
  await input.press("Enter");
  await expect(page.getByRole("button", { name: "Rename Ideas" })).toBeVisible();
});

test("adds and deletes a card", async ({ page }) => {
  await page.goto("/");
  const backlog = page.getByTestId("column-backlog");
  await backlog.getByRole("button", { name: "Add card" }).click();
  await backlog.getByRole("textbox", { name: "Card title" }).fill("Prepare demo");
  await backlog.getByRole("textbox", { name: "Card details" }).fill("Ready the presentation");
  await backlog.getByRole("button", { name: "Add card" }).click();

  await expect(backlog.getByText("Prepare demo")).toBeVisible();
  await backlog.getByRole("button", { name: "Delete Prepare demo" }).click();
  await expect(backlog.getByText("Prepare demo")).toHaveCount(0);
});

test("moves a card between columns", async ({ page }) => {
  await page.goto("/");
  const grip = page.getByRole("button", { name: "Drag Design landing page" });
  const target = page.getByRole("button", { name: "Drag Project kickoff" });
  const done = page.getByTestId("column-done");
  const sourceBox = await grip.boundingBox();
  const targetBox = await target.boundingBox();
  if (!sourceBox || !targetBox) throw new Error("Drag targets unavailable");
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(sourceBox.x + 50, sourceBox.y, { steps: 8 });
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 30 });
  await page.mouse.up();
  await expect(done.getByText("Design landing page")).toBeVisible();
});
