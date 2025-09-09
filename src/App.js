import React, { useState, useEffect } from "react";
import InputMask from "react-input-mask";

const API_URL = "http://localhost:8000"; // ajuste se o backend estiver em outra porta/URL

// 🔹 Remove caracteres não numéricos
function onlyDigits(str) {
  return (str || "").replace(/\D/g, "");
}

// 🔹 Formata o CNPJ para exibição (99.999.999/9999-99)
function formatDocumento(cnpj) {
  cnpj = onlyDigits(cnpj);
  if (cnpj.length !== 14) return cnpj;
  return `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(
    5,
    8
  )}/${cnpj.substring(8, 12)}-${cnpj.substring(12, 14)}`;
}

// 🔹 Calcula dígito verificador do CNPJ
const calc = (base) => {
  let len = base.length - 7;
  let sum = 0;
  let pos = len;
  for (let i = base.length; i >= 1; i--) {
    sum += parseInt(base[base.length - i], 10) * pos--;
    if (pos < 2) pos = 9;
  }
  const r = sum % 11;
  return r < 2 ? 0 : 11 - r;
};

// 🔹 Validação de CNPJ
function isValidCNPJ(cnpj) {
  cnpj = (cnpj || "").replace(/\D/g, "");
  if (!cnpj || cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const base = cnpj.substring(0, 12);
  const dig1 = calc(base);
  const dig2 = calc(base + String(dig1));
  return cnpj.endsWith(`${dig1}${dig2}`);
}

// 🔹 Componente principal
export default function App() {
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [docExibicao, setDocExibicao] = useState("");
  const [documento, setDocumento] = useState("");
  const [erroDocumento, setErroDocumento] = useState("");
  const [erroNumero, setErroNumero] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [empresas, setEmpresas] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // Carregar empresas
  useEffect(() => {
    carregarEmpresas();
  }, []);

  async function carregarEmpresas() {
    try {
      const resp = await fetch(`${API_URL}/empresas`);
      const data = await resp.json();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Erro ao listar empresas:", e);
    }
  }

  function handleDocumentoChange(e) {
    const exibicao = e.target.value;
    const digits = onlyDigits(exibicao);
    setDocExibicao(exibicao);
    setDocumento(digits);

    if (digits.length === 0) {
      setErroDocumento("");
      return;
    }
    if (digits.length < 14) {
      setErroDocumento("Digite 14 dígitos para CNPJ.");
    } else {
      setErroDocumento(isValidCNPJ(digits) ? "" : "CNPJ inválido.");
    }
  }

  function handleNumeroChange(e) {
    const digits = onlyDigits(e.target.value).slice(0, 5);
    setNumero(digits);
    setErroNumero(digits.length === 5 ? "" : "O número deve ter 5 dígitos.");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const payload = { numero, nome, documento };
      let response;

      if (editandoId) {
        response = await fetch(`${API_URL}/empresas/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_URL}/empresas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || "Erro ao salvar empresa");
      }

      setMensagem(editandoId ? "✅ Empresa atualizada!" : "✅ Empresa cadastrada!");
      resetForm();
      carregarEmpresas();
      setMostrarLista(true);
    } catch (error) {
      console.error(error);
      setMensagem("❌ " + error.message);
    } finally {
      setTimeout(() => setMensagem(""), 4000);
    }
  }

  function resetForm() {
    setNumero("");
    setNome("");
    setDocExibicao("");
    setDocumento("");
    setErroDocumento("");
    setErroNumero("");
    setEditandoId(null);
  }

  function handleEditar(e) {
    setNumero(e.numero);
    setNome(e.nome);
    setDocExibicao(formatDocumento(e.documento));
    setDocumento(e.documento);
    setEditandoId(e.id);
  }

  async function handleDeletar(id) {
    if (!window.confirm("Tem certeza que deseja excluir esta empresa?")) return;

    try {
      const resp = await fetch(`${API_URL}/empresas/${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Erro ao excluir");
      setMensagem("✅ Empresa excluída com sucesso!");
      carregarEmpresas();
    } catch (err) {
      console.error(err);
      setMensagem("❌ Erro ao excluir empresa.");
    } finally {
      setTimeout(() => setMensagem(""), 4000);
    }
  }

  const mask = "99.999.999/9999-99";

  return (
    <div style={{ maxWidth: 520, margin: "30px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: 16 }}>Cadastro de Empresas</h2>

      {mensagem && (
        <div style={{ marginBottom: 12, padding: 10, borderRadius: 6, background: "#f1f5ff" }}>
          {mensagem}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Número da empresa (5 dígitos)"
          value={numero}
          onChange={handleNumeroChange}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        {erroNumero && <p style={{ color: "red" }}>{erroNumero}</p>}

        <input
          type="text"
          placeholder="Nome da empresa"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>CNPJ</label>
        <InputMask mask={mask} value={docExibicao} onChange={handleDocumentoChange}>
          {(inputProps) => (
            <input
              {...inputProps}
              type="text"
              placeholder="Digite o CNPJ"
              style={{ width: "100%", padding: 8, marginBottom: 6 }}
              required
            />
          )}
        </InputMask>
        {erroDocumento && <p style={{ color: "red" }}>{erroDocumento}</p>}

        <button
          type="submit"
          style={{
            padding: "10px 15px",
            background: editandoId ? "#ffc107" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            marginTop: 6,
          }}
        >
          {editandoId ? "Salvar alterações" : "Cadastrar"}
        </button>

        {editandoId && (
          <button
            type="button"
            onClick={resetForm}
            style={{
              padding: "10px 15px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              marginTop: 6,
              marginLeft: 10,
            }}
          >
            Cancelar edição
          </button>
        )}
      </form>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => setMostrarLista(!mostrarLista)}
          style={{
            padding: "10px 15px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            marginTop: 6,
          }}
        >
          {mostrarLista ? "Ocultar empresas" : "Ver empresas cadastradas"}
        </button>

        {mostrarLista && (
          <div style={{ marginTop: 14 }}>
            <h3 style={{ marginBottom: 10 }}>Empresas Cadastradas</h3>
            {empresas.length === 0 ? (
              <div>Nenhuma empresa cadastrada ainda.</div>
            ) : (
              <ul style={{ paddingLeft: 18 }}>
                {empresas.map((e) => {
                  const docFmt = formatDocumento(e.documento);
                  return (
                    <li key={e.id || `${e.numero}-${e.documento}`} style={{ marginBottom: 6 }}>
                      <strong>{e.numero}</strong> — {e.nome} — {docFmt}
                      <button
                        onClick={() => handleEditar(e)}
                        style={{
                          marginLeft: 10,
                          padding: "4px 8px",
                          background: "#ffc107",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletar(e.id)}
                        style={{
                          marginLeft: 6,
                          padding: "4px 8px",
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        Deletar
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
