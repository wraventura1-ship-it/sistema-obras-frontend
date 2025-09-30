import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000";
// 👉 se publicar no Render, troque por: https://seu-backend.onrender.com

function App() {
  const [empresas, setEmpresas] = useState([]);
  const [formEmpresa, setFormEmpresa] = useState({ numero: "", nome: "", documento: "" });
  const [editEmpresaId, setEditEmpresaId] = useState(null);
  const [mensagemEmpresa, setMensagemEmpresa] = useState("");

  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [obras, setObras] = useState([]);
  const [formObra, setFormObra] = useState({ numero: "", nome: "", bloco: "", endereco: "" });
  const [editObraId, setEditObraId] = useState(null);
  const [mensagemObra, setMensagemObra] = useState("");

  // ==============================
  // EMPRESAS
  // ==============================
  const carregarEmpresas = async () => {
    try {
      const res = await axios.get(`${API_URL}/empresas`);
      setEmpresas(res.data);
    } catch (err) {
      setMensagemEmpresa("Erro ao carregar empresas.");
    }
  };

  const salvarEmpresa = async (e) => {
    e.preventDefault();
    try {
      if (editEmpresaId) {
        await axios.put(`${API_URL}/empresas/${editEmpresaId}`, formEmpresa);
        setMensagemEmpresa("Empresa atualizada com sucesso!");
      } else {
        await axios.post(`${API_URL}/empresas`, formEmpresa);
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
    setMensagemEmpresa("");
  };

  const excluirEmpresa = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    try {
      await axios.delete(`${API_URL}/empresas/${id}`);
      setMensagemEmpresa("Empresa excluída com sucesso!");
      carregarEmpresas();
    } catch (err) {
      setMensagemEmpresa("Erro ao excluir empresa.");
    }
  };

  // ==============================
  // OBRAS
  // ==============================
  const carregarObras = async (empresaId) => {
    try {
      const res = await axios.get(`${API_URL}/empresas/${empresaId}/obras`);
      setObras(res.data);
    } catch (err) {
      setMensagemObra("Erro ao carregar obras.");
    }
  };

  const abrirObras = (empresa) => {
    setEmpresaSelecionada(empresa);
    carregarObras(empresa.id);
    setMensagemObra("");
  };

  const salvarObra = async (e) => {
    e.preventDefault();
    if (!empresaSelecionada) return;

    try {
      if (editObraId) {
        await axios.put(`${API_URL}/obras/${editObraId}`, formObra);
        setMensagemObra("Obra atualizada com sucesso!");
      } else {
        await axios.post(`${API_URL}/empresas/${empresaSelecionada.id}/obras`, formObra);
        setMensagemObra("Obra cadastrada com sucesso!");
      }
      setFormObra({ numero: "", nome: "", bloco: "", endereco: "" });
      setEditObraId(null);
      carregarObras(empresaSelecionada.id);
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
    setMensagemObra("");
  };

  const excluirObra = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir a obra?")) return;
    try {
      await axios.delete(`${API_URL}/obras/${id}`);
      setMensagemObra("Obra excluída com sucesso!");
      carregarObras(empresaSelecionada.id);
    } catch (err) {
      setMensagemObra("Erro ao excluir obra.");
    }
  };

  // ==============================
  // HOOK INICIAL
  // ==============================
  useEffect(() => {
    carregarEmpresas();
  }, []);

  // ==============================
  // RENDER
  // ==============================
  return (
    <div style={{ margin: "40px" }}>
      <h1>Sistema de Empresas e Obras</h1>

      {/* Cadastro de Empresas */}
      <h2>Cadastro de Empresas</h2>
      <form onSubmit={salvarEmpresa} style={{ marginBottom: "10px" }}>
        <div>
          <label>Número (5 dígitos): </label>
          <input
            type="text"
            value={formEmpresa.numero}
            onChange={(e) => {
              const valor = e.target.value.replace(/\D/g, "");
              const formatado = valor ? valor.padStart(5, "0") : "";
              setFormEmpresa({ ...formEmpresa, numero: formatado });
            }}
            maxLength={5}
            required
          />
        </div>
        <div>
          <label>Nome: </label>
          <input
            type="text"
            value={formEmpresa.nome}
            onChange={(e) => setFormEmpresa({ ...formEmpresa, nome: e.target.value })}
            required
          />
        </div>
        <div>
          <label>CNPJ: </label>
          <input
            type="text"
            value={formEmpresa.documento}
            onChange={(e) =>
              setFormEmpresa({ ...formEmpresa, documento: e.target.value.replace(/\D/g, "") })
            }
            required
          />
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>
          {editEmpresaId ? "Atualizar" : "Cadastrar"}
        </button>
        {editEmpresaId && (
          <button
            type="button"
            onClick={() => {
              setFormEmpresa({ numero: "", nome: "", documento: "" });
              setEditEmpresaId(null);
            }}
            style={{ marginLeft: "10px" }}
          >
            Cancelar
          </button>
        )}
      </form>
      {mensagemEmpresa && (
        <div style={{ marginBottom: "20px", color: mensagemEmpresa.includes("sucesso") ? "green" : "red" }}>
          {mensagemEmpresa}
        </div>
      )}

      {/* Lista de Empresas */}
      <h2>Empresas</h2>
      <table border="1" cellPadding="8" style={{ marginBottom: "40px" }}>
        <thead>
          <tr>
            <th>Número</th>
            <th>Nome</th>
            <th>CNPJ</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.numero}</td>
              <td>{emp.nome}</td>
              <td>{emp.documento}</td>
              <td>
                <button onClick={() => editarEmpresa(emp)}>Editar</button>
                <button
                  onClick={() => excluirEmpresa(emp.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Excluir
                </button>
                <button
                  onClick={() => abrirObras(emp)}
                  style={{ marginLeft: "10px" }}
                >
                  Ver Obras
                </button>
              </td>
            </tr>
          ))}
          {empresas.length === 0 && (
            <tr>
              <td colSpan="4">Nenhuma empresa cadastrada.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Cadastro de Obras */}
      {empresaSelecionada && (
        <div>
          <h2>Cadastro de Obras - {empresaSelecionada.nome}</h2>
          <form onSubmit={salvarObra} style={{ marginBottom: "10px" }}>
            <div>
              <label>Número da Obra (4 dígitos): </label>
              <input
                type="text"
                value={formObra.numero}
                onChange={(e) => {
                  const valor = e.target.value.replace(/\D/g, "");
                  const formatado = valor ? valor.padStart(4, "0") : "";
                  setFormObra({ ...formObra, numero: formatado });
                }}
                maxLength={4}
                required
              />
            </div>
            <div>
              <label>Nome da Obra: </label>
              <input
                type="text"
                value={formObra.nome}
                onChange={(e) => setFormObra({ ...formObra, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Bloco (até 3 caracteres): </label>
              <input
                type="text"
                value={formObra.bloco}
                onChange={(e) =>
                  setFormObra({ ...formObra, bloco: e.target.value.slice(0, 3) })
                }
                required
              />
            </div>
            <div>
              <label>Endereço: </label>
              <input
                type="text"
                value={formObra.endereco}
                onChange={(e) => setFormObra({ ...formObra, endereco: e.target.value })}
                required
              />
            </div>
            <button type="submit" style={{ marginTop: "10px" }}>
              {editObraId ? "Atualizar Obra" : "Cadastrar Obra"}
            </button>
            {editObraId && (
              <button
                type="button"
                onClick={() => {
                  setFormObra({ numero: "", nome: "", bloco: "", endereco: "" });
                  setEditObraId(null);
                }}
                style={{ marginLeft: "10px" }}
              >
                Cancelar
              </button>
            )}
          </form>
          {mensagemObra && (
            <div style={{ marginBottom: "20px", color: mensagemObra.includes("sucesso") ? "green" : "red" }}>
              {mensagemObra}
            </div>
          )}

          {/* Lista de Obras */}
          <h3>Obras da empresa {empresaSelecionada.nome}</h3>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Número</th>
                <th>Nome</th>
                <th>Bloco</th>
                <th>Endereço</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {obras.map((obra) => (
                <tr key={obra.id}>
                  <td>{obra.numero}</td>
                  <td>{obra.nome}</td>
                  <td>{obra.bloco}</td>
                  <td>{obra.endereco}</td>
                  <td>
                    <button onClick={() => editarObra(obra)}>Editar</button>
                    <button
                      onClick={() => excluirObra(obra.id)}
                      style={{ marginLeft: "10px" }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {obras.length === 0 && (
                <tr>
                  <td colSpan="5">Nenhuma obra cadastrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
