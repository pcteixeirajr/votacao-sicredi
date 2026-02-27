import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Aplicacao from "../../Aplicacao";

describe("Aplicacao - teste automatizado de fluxo", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve permitir criar pauta, abrir sessao e registrar voto", async () => {
    const usuario = userEvent.setup();
    render(<Aplicacao />);

    await usuario.type(screen.getByLabelText("Titulo"), "Pauta automatizada");
    await usuario.click(screen.getByRole("button", { name: "Criar pauta" }));

    await waitFor(() => {
      expect(screen.getByText("Pauta criada com sucesso.")).toBeInTheDocument();
    });

    await usuario.click(screen.getByRole("button", { name: "Abrir sessao" }));
    await waitFor(() => {
      expect(screen.getByText("Sessao aberta com sucesso.")).toBeInTheDocument();
    });

    await usuario.type(screen.getByLabelText("CPF do associado"), "52998224725");
    await usuario.click(screen.getByRole("button", { name: "Enviar voto" }));

    await waitFor(() => {
      expect(screen.getByText("Voto registrado com sucesso.")).toBeInTheDocument();
      expect(screen.getByText("Total de votos: 1")).toBeInTheDocument();
    });
  });
});
