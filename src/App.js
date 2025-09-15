import React, { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [empresas, setEmpresas] = useState([]);
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [docExibicao, setDocExibicao] = useState("");
  const [erroNumero, setErroNumero] = useState("");
  const [erroDocumento, setErroDocumento] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  // utilitário: mantém apenas dígitos
  function onlyDigits(str) {
    return str.replace(/\D/g, "");
  }

  // mantém só dígitos e limita a 5 enquanto digita
  function handleNumeroChange(e) {
    const digits = onlyDigits(e.target.value).slice(0, 5);
    setNumero(digits);
    setErroNumero(digits.length === 5 ? "" : "O número deve ter 5 dígitos.");
  }

  // completa com zeros à esquerda quando sai do campo
  function padNumeroOnBlur() {
    if (!numero) return; // se vazio não faz nada
    const padded = numero.padStart(5, "0");
    if (padded !== numero) {
      setNumero(padded);
    }
  }

  // formata CNPJ (exibição)
  function formatCNPJ(value) {
    const digits = onlyDigits(value).slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  function handleDocumentoChange(e) {
    const digits = onlyDigits(e.target.value).slice(0, 14);
    setDocumento(digits);
    setDocExibicao(formatCNPJ(digits));
    setErroDocumento(digits.length === 14 ? "" : "O CNPJ deve ter 14 dígitos.");
  }

  function resetForm() {
    setNumero("");
    setNome("");
    setDocumento("");
    setDocExibicao("");
    setErroNumero("");
    setErroDocumento("");
    setEditandoId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (erroNumero || erroDocumento) return;

    const empresa = {
      numero,
      nome,
      documento,
    };

    try {
      if (editandoId) {
        await axios.put(`http://localhost:5000/empresas/${editandoId}`, empresa);
      } else {
        await axios.post("http://localhost:5000/empresas", empresa);
      }
      fetchEmpresas();
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
    }
  }

  async function fetchEmpresas() {
    try {
      const res = await axios.get("http://localhost:5000/empresas");
      setEmpresas(res.data);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
    }
  }

  useEffect(() => {
    fetchEmpresas();
  }, []);

  function handleEdit(empresa) {
    setNumero(empresa.numero);
    setNome(empresa.nome);
    setDocumento(empresa.documento);
    setDocExibicao(formatCNPJ(empresa.documento));
    setEditandoId(empresa._id);
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`http://localhost:5000/empresas/${id}`);
      fetchEmpresas();
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Cadastro de Empresas</h1>

      {/* Formulário */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        {/* Número da empresa */}
        <input
          type="text"
          placeholder="Número da empresa (5 dígitos)"
          value={numero}
          onChange={handleNumeroChange}
          onBlur={padNumeroOnBlur}
          inputMode="numeric"
          pattern="\d*"
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        {erroNumero && <div style={{ color: "red" }}>{erroNumero}</div>}

        {/* Nome da empresa */}
        <input
          type="text"
          placeholder="Nome da empresa"
          value={nome}
          onChange={(e) => setNome(e.target.value.toUpperCase())}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        {/* CNPJ */}
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>CNPJ</label>
          <input
            type="text"
            placeholder="Digite o CNPJ"
            value={docExibicao}
            onChange={handleDocumentoChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
          {erroDocumento && (
            <div style={{ color: "red" }}>{erroDocumento}</div>
          )}
        </div>

        {/* Botões */}
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

      {/* Lista */}
      <h2>Empresas cadastradas</h2>
      <ul>
        {empresas.map((empresa) => (
          <li key={empresa._id}>
            {empresa.numero} - {empresa.nome} - {formatCNPJ(empresa.documento)}
            <button onClick={() => handleEdit(empresa)}>Editar</button>
            <button onClick={() => handleDelete(empresa._id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
