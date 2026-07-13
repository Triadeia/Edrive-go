import { expect, test, type Locator, type Page } from "@playwright/test";

async function dragWithPointer(page: Page, source: Locator, target: Locator) {
  await target.scrollIntoViewIfNeeded();
  await source.scrollIntoViewIfNeeded();
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  if (!sourceBox || !targetBox) throw new Error("Drag source or target is not visible");
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(80);
  await page.mouse.move(sourceBox.x + sourceBox.width / 2 + 12, sourceBox.y + sourceBox.height / 2 + 12, { steps: 3 });
  await page.waitForTimeout(80);
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 12 });
  await page.waitForTimeout(80);
  await page.mouse.up();
}

test("painel operacional persiste CRUD, quadro e exportacoes no navegador", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/app/tarefas");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await expect(page.getByText("Dados neste navegador", { exact: true })).toBeVisible();
  await expect(page.getByTestId("task-total")).toHaveText("0");

  await page.getByRole("button", { name: "Importar checklist do lançamento" }).click();
  await expect(page.getByRole("dialog")).toContainText("Importar as 204 tarefas do lançamento?");
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByTestId("task-total")).toHaveText("0");
  await page.getByRole("button", { name: "Importar checklist do lançamento" }).click();
  await page.getByRole("button", { name: "Confirmar importação" }).click();
  await expect(page.getByTestId("task-total")).toHaveText("204");
  await page.getByRole("button", { name: "Importar checklist do lançamento" }).click();
  await page.getByRole("button", { name: "Confirmar importação" }).click();
  await expect(page.getByTestId("task-total")).toHaveText("204");

  await page.getByLabel("Filtrar por space").selectOption({ label: "Comando & Gestão" });
  await expect(page.getByTestId("filtered-total")).toHaveText("80");
  await page.getByLabel("Filtrar por space").selectOption("all");

  await page.getByRole("button", { name: "Adicionar funcionário" }).click();
  await page.getByLabel("Nome do funcionário").fill("QA E2E");
  await page.getByLabel("Função do funcionário").fill("Qualidade");
  await page.getByRole("button", { name: "Salvar funcionário" }).click();
  await expect(page.getByLabel("Estrutura do workspace").getByText("QA E2E", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Editar funcionário QA E2E" }).click();
  await page.getByLabel("Nome do funcionário").fill("QA E2E Editado");
  await page.getByLabel("Função do funcionário").fill("Qualidade Senior");
  await page.getByRole("button", { name: "Salvar funcionário" }).click();
  await expect(page.getByLabel("Estrutura do workspace").getByText("QA E2E Editado", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Adicionar space" }).click();
  await page.getByLabel("Nome do space").fill("Space E2E");
  await page.getByLabel("Emoji do space").fill("🧪");
  await page.getByRole("button", { name: "Salvar space" }).click();
  await expect(page.getByLabel("Estrutura do workspace").getByText("Space E2E", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Editar space Space E2E" }).click();
  await page.getByLabel("Nome do space").fill("Space E2E Editado");
  await page.getByLabel("Emoji do space").fill("🔬");
  await page.getByRole("button", { name: "Salvar space" }).click();
  await expect(page.getByLabel("Estrutura do workspace").getByText("Space E2E Editado", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Adicionar lista em Space E2E Editado" }).click();
  await page.getByLabel("Nome da lista").fill("Lista E2E");
  await page.getByRole("button", { name: "Salvar lista" }).click();
  await expect(page.getByRole("button", { name: /^Lista E2E 0$/ })).toBeVisible();
  await page.getByRole("button", { name: "Editar lista Lista E2E" }).click();
  await page.getByLabel("Nome da lista").fill("Lista E2E Editada");
  await page.getByRole("button", { name: "Salvar lista" }).click();
  await expect(page.getByRole("button", { name: /^Lista E2E Editada 0$/ })).toBeVisible();

  await page.getByRole("button", { name: "Nova tarefa" }).first().click();
  const newTaskDialog = page.getByRole("dialog");
  await newTaskDialog.getByLabel("Título").fill("Tarefa E2E operacional");
  await newTaskDialog.getByLabel("Descrição").fill("Fluxo completo do painel eDrive Go");
  await newTaskDialog.getByRole("combobox", { name: "Lista", exact: true }).selectOption({ label: "Lista E2E Editada" });
  await newTaskDialog.getByRole("combobox", { name: "Responsável", exact: true }).selectOption({ label: "QA E2E Editado" });
  await newTaskDialog.getByRole("combobox", { name: "Prioridade", exact: true }).selectOption("high");
  await newTaskDialog.getByLabel("Subfrente").fill("Automação");
  await newTaskDialog.getByLabel("Fase").fill("D-1");
  await newTaskDialog.getByLabel("Prazo").fill("2026-07-18T23:00");
  await newTaskDialog.getByRole("button", { name: "Salvar tarefa" }).evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
  await expect(page.getByTestId("task-total")).toHaveText("205");

  await page.getByRole("button", { name: "Excluir funcionário QA E2E Editado" }).click();
  await expect(page.getByRole("dialog")).toContainText("1 tarefa atribuída ficará sem responsável.");
  await page.getByRole("button", { name: "Cancelar" }).click();

  await page.getByRole("button", { name: "Editar Tarefa E2E operacional" }).click();
  const editTaskDialog = page.getByRole("dialog");
  await editTaskDialog.getByLabel("Próxima ação").fill("Validar persistência");
  await editTaskDialog.getByLabel("Notas").fill("Criada pelo teste de aceitação");
  await editTaskDialog.getByLabel("Novo item do checklist").fill("Confirmar publicação");
  await editTaskDialog.getByRole("button", { name: "Adicionar item ao checklist" }).click();
  await editTaskDialog.getByLabel("Adicionar dependência").selectOption({ index: 1 });
  await editTaskDialog.getByRole("button", { name: "Salvar tarefa" }).click();

  await page.getByRole("button", { name: "Quadro" }).click();
  await dragWithPointer(page, page.getByRole("button", { name: "Arrastar Tarefa E2E operacional" }), page.getByTestId("kanban-in_progress"));
  await expect(page.getByTestId("kanban-in_progress")).toContainText("Tarefa E2E operacional");
  const keyboardDragHandle = page.getByRole("button", { name: "Arrastar Tarefa E2E operacional" });
  await keyboardDragHandle.focus();
  await page.keyboard.press("Space");
  const dragAnnouncement = page.locator('[role="status"][aria-live="assertive"]');
  for (let step = 0; step < 12; step += 1) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);
    if ((await dragAnnouncement.textContent())?.includes("status:in_review")) break;
  }
  await expect(dragAnnouncement).toContainText("status:in_review");
  await page.keyboard.press("Space");
  await expect(keyboardDragHandle).not.toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("kanban-in_review")).toContainText("Tarefa E2E operacional");

  await page.reload();
  await page.getByPlaceholder("Buscar tarefas").fill("Tarefa E2E operacional");
  await expect(page.getByText("Tarefa E2E operacional", { exact: true })).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "Tarefa E2E operacional" }).getByText("Em revisão", { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.getByRole("button", { name: "Calendário" }).click();
  await dragWithPointer(page, page.getByRole("button", { name: "Arrastar prazo de Tarefa E2E operacional" }), page.getByTestId("calendar-day-2026-07-20"));
  await expect(page.getByTestId("calendar-day-2026-07-20")).toContainText("Tarefa E2E operacional");
  const calendarKeyboardHandle = page.getByRole("button", { name: "Arrastar prazo de Tarefa E2E operacional" });
  await calendarKeyboardHandle.focus();
  await page.keyboard.press("Space");
  const calendarDragAnnouncement = page.locator('[role="status"][aria-live="assertive"]');
  for (let step = 0; step < 8; step += 1) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);
    if ((await calendarDragAnnouncement.textContent())?.includes("calendar-date:2026-07-21")) break;
  }
  await expect(calendarDragAnnouncement).toContainText("calendar-date:2026-07-21");
  await page.keyboard.press("Space");
  await expect(calendarKeyboardHandle).not.toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("calendar-day-2026-07-21")).toContainText("Tarefa E2E operacional");
  await page.getByRole("button", { name: "Lista", exact: true }).click();
  await page.getByRole("button", { name: "Editar Tarefa E2E operacional" }).click();
  await expect(page.getByLabel("Prazo")).toHaveValue(/2026-07-21/);
  await expect(page.getByLabel("Prazo")).toHaveValue(/T23:00$/);
  await expect(page.getByText("Confirmar publicação", { exact: true })).toBeVisible();
  await expect(page.getByText("T001", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Notas")).toHaveValue("Criada pelo teste de aceitação");
  await page.getByRole("button", { name: "Fechar formulário de tarefa" }).click();

  const csvDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  await expect((await csvDownload).suggestedFilename()).toBe("edrive-go-tarefas.csv");
  const jsonDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar JSON" }).click();
  await expect((await jsonDownload).suggestedFilename()).toBe("edrive-go-workspace.json");

  await page.getByRole("button", { name: "Excluir Tarefa E2E operacional" }).click();
  await expect(page.getByText("Dependências que apontam para esta tarefa serão removidas.")).toBeVisible();
  await page.getByRole("button", { name: "Excluir tarefa definitivamente" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByTestId("task-total")).toHaveText("204");

  await page.getByRole("button", { name: "Excluir lista Lista E2E Editada" }).click();
  await page.getByLabel("Lista de destino").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Excluir lista definitivamente" }).click();
  await expect(page.getByRole("button", { name: /^Lista E2E Editada/ })).toHaveCount(0);

  await page.getByRole("button", { name: "Excluir space Space E2E Editado" }).click();
  await page.getByLabel("Lista de destino").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Excluir space definitivamente" }).click();
  await expect(page.getByText("Space E2E Editado", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Excluir funcionário QA E2E Editado" }).click();
  await expect(page.getByText("0 tarefas atribuídas ficarão sem responsável.")).toBeVisible();
  await page.getByRole("button", { name: "Excluir funcionário definitivamente" }).click();
  await expect(page.getByText("QA E2E Editado", { exact: true })).toHaveCount(0);

  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    const runtimeWindow = window as Window & { restoreStorageSetItem?: () => void };
    runtimeWindow.restoreStorageSetItem = () => { Storage.prototype.setItem = original; };
    Storage.prototype.setItem = () => { throw new DOMException("quota simulada", "QuotaExceededError"); };
  });
  await page.getByRole("button", { name: "Adicionar funcionário" }).click();
  await page.getByLabel("Nome do funcionário").fill("Falha de quota");
  await page.getByLabel("Função do funcionário").fill("Teste");
  await page.getByRole("button", { name: "Salvar funcionário" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Não foi possível salvar os dados neste navegador" })).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.evaluate(() => {
    const runtimeWindow = window as Window & { restoreStorageSetItem?: () => void };
    runtimeWindow.restoreStorageSetItem?.();
    delete runtimeWindow.restoreStorageSetItem;
  });
  await page.getByRole("button", { name: "Cancelar" }).click();
});

test("diálogos contêm foco, fecham com Escape e restauram o acionador", async ({ page }) => {
  await page.goto("/app/tarefas");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  const importButton = page.getByRole("button", { name: "Importar checklist do lançamento" });
  await importButton.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(importButton).toBeFocused();

  const memberButton = page.getByRole("button", { name: "Adicionar funcionário" });
  await memberButton.click();
  await expect(page.getByLabel("Nome do funcionário")).toBeFocused();
  await page.getByRole("button", { name: "Salvar funcionário" }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Fechar diálogo" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(memberButton).toBeFocused();

  await page.evaluate(async () => {
    const runtimeWindow = window as Window & { releasePendingWorkspaceLock?: () => void };
    await new Promise<void>((acquired) => {
      void navigator.locks.request("edrive-go:task-workspace:v1:exclusive", async () => {
        acquired();
        await new Promise<void>((release) => {
          runtimeWindow.releasePendingWorkspaceLock = release;
        });
      });
    });
  });
  await memberButton.click();
  await page.getByLabel("Nome do funcionário").fill("Pendente E2E");
  await page.getByLabel("Função do funcionário").fill("Operações");
  await page.getByRole("button", { name: "Salvar funcionário" }).click();
  await expect(page.getByRole("button", { name: "Processando…" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeVisible();
  const disabledClose = page.getByRole("button", { name: "Fechar diálogo" });
  await expect(disabledClose).toBeDisabled();
  await disabledClose.click({ force: true });
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.evaluate(() => {
    const runtimeWindow = window as Window & { releasePendingWorkspaceLock?: () => void };
    runtimeWindow.releasePendingWorkspaceLock?.();
    delete runtimeWindow.releasePendingWorkspaceLock;
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel("Estrutura do workspace").getByText("Pendente E2E", { exact: true })).toHaveCount(1);

  const newTaskButton = page.getByRole("button", { name: "Nova tarefa" }).first();
  await newTaskButton.click();
  await expect(page.getByLabel("Título")).toBeFocused();
  await page.getByLabel("Título").fill("Rascunho preservado após sincronização");
  await page.evaluate(() => window.dispatchEvent(new StorageEvent("storage", { key: "edrive-go:task-workspace:v1" })));
  await expect(page.getByLabel("Título")).toHaveValue("Rascunho preservado após sincronização");
  await page.keyboard.press("Escape");
  await expect(newTaskButton).toBeFocused();
});

test("sidebar responsiva abre e fecha no viewport móvel", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/tarefas");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  const sidebar = page.getByLabel("Estrutura do workspace");
  await expect(sidebar).toBeHidden();
  await page.getByRole("button", { name: "Abrir navegação do workspace" }).click();
  await expect(sidebar).toBeVisible();
  await page.getByRole("button", { name: "Fechar navegação do workspace" }).click();
  await expect(sidebar).toBeHidden();
});

test("recupera workspace local com JSON malformado", async ({ page }) => {
  await page.goto("/app/tarefas");
  await page.evaluate(() => window.localStorage.setItem("edrive-go:task-workspace:v1", "{json quebrado"));
  await page.reload();

  await expect(page.getByRole("alert").filter({ hasText: "Os dados locais não puderam ser abertos" })).toBeVisible();
  await page.getByRole("button", { name: "Recuperar workspace local" }).click();
  await expect(page.getByText("Dados neste navegador", { exact: true })).toBeVisible();
  await expect(page.getByTestId("task-total")).toHaveText("0");
});

test("sincroniza correções do checklist sem sobrescrever edições locais", async ({ page }) => {
  await page.goto("/app/tarefas");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Importar checklist do lançamento" }).click();
  await page.getByRole("button", { name: "Confirmar importação" }).click();
  await expect(page.getByTestId("task-total")).toHaveText("204");

  await page.evaluate(() => {
    const key = "edrive-go:task-workspace:v1";
    const workspace = JSON.parse(window.localStorage.getItem(key) ?? "null") as {
      tasks: Array<{ externalId: string; status: string; sourceMeta: Record<string, string>; createdAt: string; updatedAt: string }>;
    };
    const untouched = workspace.tasks.find((task) => task.externalId === "T147");
    const edited = workspace.tasks.find((task) => task.externalId === "T167");
    if (!untouched || !edited) throw new Error("Expected launch tasks");
    untouched.status = "todo";
    untouched.sourceMeta.Status = "NAO INICIADO";
    untouched.updatedAt = untouched.createdAt;
    edited.status = "in_progress";
    edited.sourceMeta.Status = "EM ANDAMENTO";
    edited.updatedAt = "2026-07-13T12:00:00.000Z";
    window.localStorage.setItem(key, JSON.stringify(workspace));
  });

  await page.reload();
  await page.getByPlaceholder("Buscar tarefas").fill("T147");
  await expect(page.getByRole("row").filter({ hasText: "T147" }).getByText("Em andamento", { exact: true })).toBeVisible();
  await page.getByPlaceholder("Buscar tarefas").fill("T167");
  await expect(page.getByRole("row").filter({ hasText: "T167" }).getByText("Em andamento", { exact: true })).toBeVisible();
});
