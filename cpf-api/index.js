import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

function validarCPF(cpf) {
  if (!cpf) return false;

  const cpfNumerico = cpf.replace(/\D/g, "");

  if (cpfNumerico.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpfNumerico)) return false;

  for (let t = 9; t < 11; t += 1) {
    let soma = 0;
    for (let i = 0; i < t; i += 1) {
      soma += Number(cpfNumerico[i]) * (t + 1 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== Number(cpfNumerico[t])) return false;
  }

  return true;
}

app.get("/user/:cpf", (req, res) => {
  const { cpf } = req.params;
  const valido = validarCPF(cpf);

  res.status(valido ? 200 : 400).json({
    cpf: cpf.replace(/\D/g, ""),
    valido
  });
});

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`API de CPF rodando na porta ${PORTA}`);
});
