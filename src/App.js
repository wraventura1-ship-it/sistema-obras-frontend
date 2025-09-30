import React, { useEffect, useState } from "react";
import axios from "axios";
import InputMask from "react-input-mask";

const API_URL = "http://localhost:8000"; // ajuste se necessário

// =========================
// Função de validação de CNPJ
// =========================
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

function App() {
  const [empresas, setEmpresas] = useState([]);
  const [obras, setObras] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);

  const [formEmpresa, setFormEmpresa] = useState({ numero: "", nome: "", documento: "" });
  const [formObra, setFormObra] = useState({ numero: "", nome: "", bloco: "", endereco: "" });

  const [editEmpresaId, setEditEmpresaId] = useState(null);
  const [editObraId, setEditObraId] = useState(null);

  const [mensagemEmpresa, setMensagemEmpresa] = useState("");
  const [mensagemObra, setMensagemObra] = useState("");

  // =========================
  // Carregar dados
  // =========================
  useEffect(() => {
    carregarEmpresas();
  }, []);

  const carregarEmpresas = async () => {
    const res = await axios.get(`${API_URL}/empresas`);
    setEmpresas(res.data);
  };

  const carregarObras = async (empresaId) => {
    const res = await axios.get(`${API_URL}/empresas/${empresaId}/obras`);
    setObras(res.data);
  };

  // =========================
  // CRUD EMPRESAS
  // =========================
  const salvarEmpresa = async (e) => {
    e.preventDefault();

    if (!validarCNPJ(formEmpresa.documento)) {
      setMensagemEmpresa("CNPJ inválido.");
      return;
    }

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
    setFormEmpresa(empresa);
    setEditEmpresaId(empresa.id);
  };

  const excluirEmpresa = async (id) => {
    await axios.delete(`${API_URL}/empresas/${id}`);
    carregarEmpresas();
    if (empresaSelecionada === id) {
      setEmpresaSelecionada(null);
      setObras([]);
    }
  };

  // =========================
  // CRUD OBRAS
  // =========================
  const salvarObra = async (e) => {
    e.preventDefault();

    try {
      if (editObraId) {
        await axios.put(`${API_URL}/obras/${editObraId}`, formObra);
        setMensagemObra("Obra atualizada com sucesso!");
      } else {
        await axios.post(`${API_URL}/empresas/${empresaSelecionada}/obras`, formObra);
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
    setFormObra(obra);
    setEditObraId(obra.id);
  };

  const excluirObra = async (id) => {
    await axios.delete(`${API_URL}/obras/${id}`);
    carregarObras(empresaSelecionada);
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div style={{ display: "flex", gap: "50px", padding: "20px" }}>
      {/* ================== EMPRESAS ================== */}
      <div style={{ flex: 1 }}>
        <h2>Empresas</h2>
        <form onSubmit={salvarEmpresa}>
          <div>
            <label>Número: </label>
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
            <InputMask
              mask="99.999.999/9999-99"
              value={formEmpresa.documento}
              onChange={(e) => setFormEmpresa({ ...formEmpresa, documento: e.target.value })}
              required
            >
              {(inputProps) => <input {...inputProps} type="text" />}
            </InputMask>
          </div>
          {mensagemEmpresa && <p style={{ color: "red" }}>{mensagemEmpresa}</p>}
          <button type="submit">{editEmpresaId ? "Atualizar" : "Cadastrar"}</button>
        </form>

        <ul>
          {empresas.map((emp) => (
            <li key={emp.id}>
              {emp.numero} - {emp.nome} ({emp.documento})
              <button onClick={() => editarEmpresa(emp)}>Editar</button>
              <button onClick={() => excluirEmpresa(emp.id)}>Excluir</button>
              <button
                onClick={() => {
                  setEmpresaSelecionada(emp.id);
                  carregarObras(emp.id);
                }}
              >
                Obras
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ================== OBRAS ================== */}
      <div style={{ flex: 1 }}>
        <h2>Obras</h2>
        {empresaSelecionada ? (
          <form onSubmit={salvarObra}>
            <div>
              <label>Número: </label>
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
              <label>Nome: </label>
              <input
                type="text"
                value={formObra.nome}
                onChange={(e) => setFormObra({ ...formObra, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Bloco: </label>
              <input
                type="text"
                value={formObra.bloco}
                onChange={(e) => setFormObra({ ...formObra, bloco: e.target.value })}
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
            {mensagemObra && <p style={{ color: "red" }}>{mensagemObra}</p>}
            <button type="submit">{editObraId ? "Atualizar" : "Cadastrar"}</button>
          </form>
        ) : (
          <p>Selecione uma empresa para ver as obras.</p>
        )}

        <ul>
          {obras.map((obra) => (
            <li key={obra.id}>
              {obra.numero} - {obra.nome} {obra.bloco && `(Bloco ${obra.bloco})`}
              <button onClick={() => editarObra(obra)}>Editar</button>
              <button onClick={() => excluirObra(obra.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
