import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000"; 
// 👉 Se publicar no Render, troque por: https://seu-backend.onrender.com

function App() {
  const [empresas, setEmpresas] = useState([]);
  const [form, setForm] = useState({ numero: "", nome: "", documento: "" });
  const [editId, setEditId] = useState(null);
  const [mensagem, setMensagem] = useState("");

  // ==============================
  // FUNÇÕES DE API
  // ==============================
  const carregarEmpresas = async () => {
    try {
      const res = await axios.get(`${API_URL}/empresas`);
      setEmpresas(res.data);
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao carregar empresas.");
    }
  };

  const salvarEmpresa = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/empresas/${editId}`, form);
        setMensagem("Empresa atualizada com sucesso!");
      } else {
        await axios.post(`${API_URL}/empresas`, form);
        setMensagem("Empresa cadastrada com sucesso!");
      }
      setForm({ numero: "", nome: "", documento: "" });
      setEditId(null);
      carregarEmpresas();
    } catch (err) {
      if (err.response) {
        setMensagem(err.response.data.detail || "Erro ao salvar empresa.");
      } else {
        setMensagem("Erro de conexão com o servidor.");
      }
    }
  };

  const editarEmpresa = (empresa) => {
    setForm({
      numero: empresa.numero,
      nome: empresa.nome,
      documento: empresa.documento,
    });
    setEditId(empresa.id);
  };

  const excluirEmpresa = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    try {
      await axios.delete(`${API_URL}/empresas/${id}`);
      setMensagem("Empresa excluída com sucesso!");
      carregarEmpresas();
    } catch (err) {
      setMensagem("Erro ao excluir empresa.");
    }
  };

  // ==============================
  // HOOK DE INICIALIZAÇÃO
  // ==============================
  useEffect(() => {
    carregarEmpresas();
  }, []);

  // ==============================
  // RENDER
  // ==============================
  return (
    <div style={{ margin: "40px" }}>
      <h1>Cadastro de Empresas</h1>

      {mensagem && (
        <div style={{ marginBottom: "15px", color: "blue" }}>
          {mensagem}
        </div>
      )}

      <form onSubmit={salvarEmpresa} style={{ marginBottom: "30px" }}>
        <div>
          <label>Número (até 5 dígitos): </label>
          <input
            type="text"
            value={form.numero}
            onChange={(e) =>
              setForm({ ...form, numero: e.target.value.replace(/\D/g, "") })
            }
            required
          />
        </div>
        <div>
          <label>Nome: </label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
        </div>
        <div>
          <label>CNPJ (14 dígitos): </label>
          <input
            type="text"
            value={form.documento}
            onChange={(e) =>
              setForm({ ...form, documento: e.target.value.replace(/\D/g, "") })
            }
            required
          />
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>
          {editId ? "Atualizar" : "Cadastrar"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setForm({ numero: "", nome: "", documento: "" });
              setEditId(null);
            }}
            style={{ marginLeft: "10px" }}
          >
            Cancelar
          </button>
        )}
      </form>

      <h2>Lista de Empresas</h2>
      <table border="1" cellPadding="8">
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
    </div>
  );
}

export default App;

