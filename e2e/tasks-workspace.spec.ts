import { expect, test } from "@playwright/test";

test("painel operacional persiste CRUD, quadro e exportacoes no navegador", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/app/tarefas");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await expect(page.getByText("Dados neste navegador", { exact: true })).toBeVisible();
  await expect(page.getByTestId("task-total")).toHaveText("0");

  await page.getByRole("button", { name: "Importar checklist do lançamento" }).click();
  await expect(page.getByTestId("task-total")).toHaveText("204");

  await page.getByRole("button", { name: "Adicionar funcionário" }).click();
  await page.getByLabel("Nome do funcionário").fill("QA E2E");
  await page.getByLabel("Função do funcionário").fill("Qualidade");
  await page.getByRole("button", { name: "Salvar funcionário" }).click();
  await expect(page.getByLabel("Estrutura do workspace").getByText("QA E2E", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Adicionar space" }).click();
  await page.getByLabel("Nome do space").fill("Space E2E");
  await page.getByLabel("Emoji do space").fill("🧪");
  await page.getByRole("button", { name: "Salvar space" }).click();
  await expect(page.getByText("Space E2E", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Adicionar lista em Space E2E" }).click();
  await page.getByLabel("Nome da lista").fill("Lista E2E");
  await page.getByRole("button", { name: "Salvar lista" }).click();
  await expect(page.getByRole("button", { name: /^Lista E2E 0$/ })).toBeVisible();

  await page.getByRole("button", { name: "Nova tarefa" }).first().click();
  const newTaskDialog = page.getByRole("dialog");
  await newTaskDialog.getByLabel("Título").fill("Tarefa E2E operacional");
  await newTaskDialog.getByLabel("Descrição").fill("Fluxo completo do painel eDrive Go");
  await newTaskDialog.getByRole("combobox", { name: "Lista", exact: true }).selectOption({ label: "Lista E2E" });
  await newTaskDialog.getByRole("combobox", { name: "Responsável", exact: true }).selectOption({ label: "QA E2E" });
  await newTaskDialog.getByRole("combobox", { name: "Prioridade", exact: true }).selectOption("high");
  await newTaskDialog.getByLabel("Subfrente").fill("Automação");
  await newTaskDialog.getByLabel("Fase").fill("D-1");
  await newTaskDialog.getByLabel("Prazo").fill("2026-07-18T12:00");
  await newTaskDialog.getByRole("button", { name: "Salvar tarefa" }).click();
  await expect(page.getByTestId("task-total")).toHaveText("205");

  await page.getByRole("button", { name: "Editar Tarefa E2E operacional" }).click();
  const editTaskDialog = page.getByRole("dialog");
  await editTaskDialog.getByLabel("Próxima ação").fill("Validar persistência");
  await editTaskDialog.getByLabel("Notas").fill("Criada pelo teste de aceitação");
  await editTaskDialog.getByLabel("Novo item do checklist").fill("Confirmar publicação");
  await editTaskDialog.getByRole("button", { name: "Adicionar item ao checklist" }).click();
  await editTaskDialog.getByLabel("Adicionar dependência").selectOption({ index: 1 });
  await editTaskDialog.getByRole("button", { name: "Salvar tarefa" }).click();

  await page.getByRole("button", { name: "Quadro" }).click();
  await page.getByRole("button", { name: "Mover Tarefa E2E operacional para Em andamento" }).click();
  await expect(page.getByTestId("kanban-in_progress")).toContainText("Tarefa E2E operacional");

  await page.reload();
  await page.getByPlaceholder("Buscar tarefas").fill("Tarefa E2E operacional");
  await expect(page.getByText("Tarefa E2E operacional", { exact: true })).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "Tarefa E2E operacional" }).getByText("Em andamento", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Calendário" }).click();
  await page.getByRole("button", { name: "Mover prazo de Tarefa E2E operacional para o dia seguinte" }).click();
  await page.getByRole("button", { name: "Lista", exact: true }).click();
  await page.getByRole("button", { name: "Editar Tarefa E2E operacional" }).click();
  await expect(page.getByLabel("Prazo")).toHaveValue(/2026-07-19/);
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

  await page.getByRole("button", { name: "Excluir lista Lista E2E" }).click();
  await page.getByLabel("Lista de destino").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Excluir lista definitivamente" }).click();
  await expect(page.getByRole("button", { name: /^Lista E2E/ })).toHaveCount(0);

  await page.getByRole("button", { name: "Excluir space Space E2E" }).click();
  await page.getByLabel("Lista de destino").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Excluir space definitivamente" }).click();
  await expect(page.getByText("Space E2E", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Excluir funcionário QA E2E" }).click();
  await expect(page.getByText("Tarefas atribuídas ficarão sem responsável.")).toBeVisible();
  await page.getByRole("button", { name: "Excluir funcionário definitivamente" }).click();
  await expect(page.getByText("QA E2E", { exact: true })).toHaveCount(0);

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
