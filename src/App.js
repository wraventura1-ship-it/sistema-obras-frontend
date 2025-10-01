import React, { useState, useEffect } from "react";
import axios from "axios";
import InputMask from "react-input-mask";

// ===================================
// Função de validação de CNPJ
// ===================================
function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, "");

  if (cnpj.length !== 14) return false;

  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

// ===================================
// Configuração da API (ajuste a URL)
// ===================================
const API_URL = "https://seu-backend-no-render.onrender.com"; // ajuste para o endereço correto

function App() {
  const [empresas, setEmpresas] = useState([]);
  const [formEmpresa, setFormEmpresa] = useState({
    numero: "",
    nome: "",
    documento: "",
  });
  const [editEmpresaId, setEditEmpresaId] = useState(null);
  const [mensagemEmpresa, setMensagemEmpresa] = useState("");

  const [obras, setObras] = useState([]);
  const [formObra, setFormObra] = useState({
    numero: "",
    nome: "",
    bloco: "",
    endereco: "",
  });
  const [editObraId, setEditObraId] = useState(null);
  const [mensagemObra, setMensagemObra] = useState("");
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);

  // ===================================
  // Empresas
  // ===================================
  const carregarEmpresas = async () => {
    const res = await axios.get(`${API_URL}/empresas`);
    setEmpresas(res.data);
  };

  useEffect(() => {
    carregarEmpresas();
  }, []);

  const salvarEmpresa = async (e) => {
    e.preventDefault();

    if (!validarCNPJ(formEmpresa.documento)) {
      setMensagemEmpresa("CNPJ inválido.");
      return;
    }

    const payload = {
      ...formEmpresa,
      documento: formEmpresa.documento.replace(/\D/g, ""), // só números
    };

    try {
      if (editEmpresaId) {
        await axios.put(`${API_URL}/empresas/${editEmpresaId}`, payload);
        setMensagemEmpresa("Empresa atualizada com sucesso!");
      } else {
        await axios.post(`${API_URL}/empresas`, payload);
        setMensagemEmpresa("Empresa cadastrada com sucesso!");
      }
      setFormEmpresa({ numero: "", nome: "", documento: "" });
      setEditEmpresaId(null);
      carregarEmpresas();
    } catch (err) {
      if (err.response) {
        setMensagemEmpresa(err.response.data.detail || "Erro ao salvar empresa.");
      } else {
        setMensagemEmpresa("Erro de conexão com o servidor.");
      }
    }
  };

  const editarEmpresa = (empresa) => {
    setFormEmpresa({
      numero: empresa.numero,
      nome: empresa.nome,
      documento: empresa.documento,
    });
    setEditEmpresaId(empresa.id);
  };

  const excluirEmpresa = async (id) => {
    await axios.delete(`${API_URL}/empresas/${id}`);
    carregarEmpresas();
  };

  // ===================================
  // Obras
  // ===================================
  const carregarObras = async (empresaId) => {
    const res = await axios.get(`${API_URL}/empresas/${empresaId}/obras`);
    setObras(res.data);
    setEmpresaSelecionada(empresaId);
  };

  const salvarObra = async (e) => {
    e.preventDefault();

    try {
      if (editObraId) {
        await axios.put(`${API_URL}/obras/${editObraId}`, formObra);
        setMensagemObra("Obra atualizada com sucesso!");
      } else {
        await axios.post(
          `${API_URL}/empresas/${empresaSelecionada}/obras`,
          formObra
        );
        setMensagemObra("Obra cadastrada com sucesso!");
      }
      setFormObra({ numero: "", nome: "", bloco: "", endereco: "" });
      setEditObraId(null);
      carregarObras(empresaSelecionada);
    } catch (err) {
      if (err.response) {
        setMensagemObra(err.response.data.detail || "Erro ao salvar obra.");
      } else {
        setMensagemObra("Erro de conexão com o servidor.");
      }
    }
  };

  const editarObra = (obra) => {
    setFormObra({
      numero: obra.numero,
      nome: obra.nome,
      bloco: obra.bloco,
      endereco: obra.endereco,
    });
    setEditObraId(obra.id);
  };

  const excluirObra = async (id) => {
    await axios.delete(`${API_URL}/obras/${id}`);
    carregarObras(empresaSelecionada);
  };

  // ===================================
  // Renderização
  // ===================================
  return (
      <div style={{ display: "block", padding: "20px" }}>
      <h1>Sistema de Obras</h1>

      {/* ======================== */}
      {/* Empresas */}
      {/* ======================== */}
      <h2>Empresas</h2>
      <form onSubmit={salvarEmpresa}>
        <label>Número:</label>
        <input
          type="text"
          value={formEmpresa.numero}
          onChange={(e) =>
            setFormEmpresa({ ...formEmpresa, numero: e.target.value })
          }
          required
        />
        <label>Nome:</label>
        <input
          type="text"
          value={formEmpresa.nome}
          onChange={(e) =>
            setFormEmpresa({ ...formEmpresa, nome: e.target.value })
          }
          required
        />
        <label>CNPJ:</label>
        <InputMask
          mask="99.999.999/9999-99"
          value={formEmpresa.documento}
          onChange={(e) =>
            setFormEmpresa({ ...formEmpresa, documento: e.target.value })
          }
          required
        >
          {(inputProps) => <input {...inputProps} type="text" />}
        </InputMask>
        <button type="submit">
          {editEmpresaId ? "Atualizar" : "Cadastrar"}
        </button>
      </form>
      {mensagemEmpresa && <p style={{ color: "red" }}>{mensagemEmpresa}</p>}

      <ul>
        {empresas.map((emp) => (
          <li key={emp.id}>
            {emp.numero} - {emp.nome} - {emp.documento}{" "}
            <button onClick={() => editarEmpresa(emp)}>Editar</button>
            <button onClick={() => excluirEmpresa(emp.id)}>Excluir</button>
            <button onClick={() => carregarObras(emp.id)}>Obras</button>
          </li>
        ))}
      </ul>

      {/* ======================== */}
      {/* Obras */}
      {/* ======================== */}
      {empresaSelecionada && (
        <div>
          <h2>Obras</h2>
          <form onSubmit={salvarObra}>
            <label>Número:</label>
            <input
              type="text"
              value={formObra.numero}
              onChange={(e) =>
                setFormObra({ ...formObra, numero: e.target.value })
              }
              required
            />
            <label>Nome:</label>
            <input
              type="text"
              value={formObra.nome}
              onChange={(e) =>
                setFormObra({ ...formObra, nome: e.target.value })
              }
              required
            />
            <label>Bloco:</label>
            <input
              type="text"
              value={formObra.bloco}
              onChange={(e) =>
                setFormObra({ ...formObra, bloco: e.target.value })
              }
            />
            <label>Endereço:</label>
            <input
              type="text"
              value={formObra.endereco}
              onChange={(e) =>
                setFormObra({ ...formObra, endereco: e.target.value })
              }
              required
            />
            <button type="submit">
              {editObraId ? "Atualizar" : "Cadastrar"}
            </button>
          </form>
          {mensagemObra && <p style={{ color: "red" }}>{mensagemObra}</p>}

          <ul>
            {obras.map((obra) => (
              <li key={obra.id}>
                {obra.numero} - {obra.nome} - {obra.bloco} - {obra.endereco}{" "}
                <button onClick={() => editarObra(obra)}>Editar</button>
                <button onClick={() => excluirObra(obra.id)}>Excluir</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
