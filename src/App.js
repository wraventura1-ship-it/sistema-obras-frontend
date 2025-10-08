import React, { useEffect, useState } from "react";
import axios from "axios";
import InputMask from "react-input-mask";

// URL do backend hospedado no Render
const API_URL = "https://sistema-obras.onrender.com";

// Função para validar CNPJ
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

export default function App() {
  // Estados para empresas
  const [empresas, setEmpresas] = useState([]);
  const [formEmpresa, setFormEmpresa] = useState({ numero: "", nome: "", documento: "" });
  const [editEmpresaId, setEditEmpresaId] = useState(null);
  const [mensagemEmpresa, setMensagemEmpresa] = useState("");

  // Estados para obras
  const [obras, setObras] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [formObra, setFormObra] = useState({ numero: "", nome: "", bloco: "", endereco: "" });
  const [mensagemObra, setMensagemObra] = useState("");

  // Buscar empresas ao carregar
  useEffect(() => {
    carregarEmpresas();
  }, []);

  async function carregarEmpresas() {
    try {
      const res = await axios.get(`${API_URL}/empresas`);
      setEmpresas(res.data);
    } catch (err) {
      console.error("Erro ao carregar empresas", err);
    }
  }

  async function salvarEmpresa(e) {
    e.preventDefault();

    if (!validarCNPJ(formEmpresa.documento)) {
      setMensagemEmpresa("CNPJ inválido!");
      return;
    }

    const dados = {
      numero: formEmpresa.numero.padStart(5, "0"),
      nome: formEmpresa.nome.toUpperCase(),
      documento: formEmpresa.documento.replace(/\D/g, ""),
    };

    try {
      if (editEmpresaId) {
        await axios.put(`${API_URL}/empresas/${editEmpresaId}`, dados);
        setMensagemEmpresa("Empresa atualizada com sucesso!");
      } else {
        await axios.post(`${API_URL}/empresas`, dados);
        setMensagemEmpresa("Empresa cadastrada com sucesso!");
      }
      setFormEmpresa({ numero: "", nome: "", documento: "" });
      setEditEmpresaId(null);
      carregarEmpresas();
    } catch (err) {
      setMensagemEmpresa("Erro: " + (err.response?.data?.detail || "não foi possível salvar."));
    }
  }

  function editarEmpresa(emp) {
    setFormEmpresa({
      numero: emp.numero,
      nome: emp.nome,
      documento: emp.documento,
    });
    setEditEmpresaId(emp.id);
  }

  async function excluirEmpresa(id) {
    if (!window.confirm("Deseja realmente excluir esta empresa?")) return;
    try {
      await axios.delete(`${API_URL}/empresas/${id}`);
      carregarEmpresas();
    } catch (err) {
      alert("Erro ao excluir empresa.");
    }
  }

  // Obras
  async function carregarObras(empresaId) {
    setEmpresaSelecionada(empresaId);
    try {
      const res = await axios.get(`${API_URL}/empresas/${empresaId}/obras`);
      setObras(res.data);
    } catch (err) {
      console.error("Erro ao carregar obras", err);
    }
  }

  async function salvarObra(e) {
    e.preventDefault();
    if (!empresaSelecionada) {
      setMensagemObra("Selecione uma empresa primeiro.");
      return;
    }

    const dados = {
      numero: formObra.numero.padStart(4, "0"),
      nome: formObra.nome,
      bloco: formObra.bloco,
      endereco: formObra.endereco,
    };

    try {
      await axios.post(`${API_URL}/empresas/${empresaSelecionada}/obras`, dados);
      setMensagemObra("Obra cadastrada com sucesso!");
      setFormObra({ numero: "", nome: "", bloco: "", endereco: "" });
      carregarObras(empresaSelecionada);
    } catch (err) {
      setMensagemObra("Erro: " + (err.response?.data?.detail || "não foi possível salvar."));
    }
  }

  return (
    <div style={{ display: "block", padding: "20px" }}>
      <h1>Sistema de Controle</h1>

      {/* Cadastro de Empresas */}
      <h2>Cadastro de Empresas</h2>
      <form onSubmit={salvarEmpresa} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Número (5 dígitos)"
          value={formEmpresa.numero}
          onChange={(e) => setFormEmpresa({ ...formEmpresa, numero: e.target.value })}
        />
        <input
          placeholder="Nome"
          value={formEmpresa.nome}
          onChange={(e) => setFormEmpresa({ ...formEmpresa, nome: e.target.value })}
        />
        <InputMask
          mask="99.999.999/9999-99"
          placeholder="CNPJ"
          value={formEmpresa.documento}
          onChange={(e) => setFormEmpresa({ ...formEmpresa, documento: e.target.value })}
        />
        <button type="submit">{editEmpresaId ? "Atualizar" : "Cadastrar"}</button>
      </form>
      {mensagemEmpresa && <p>{mensagemEmpresa}</p>}

      <h3>Lista de Empresas</h3>
      <ul>
        {empresas.map((emp) => (
          <li key={emp.id}>
            {emp.numero} - {emp.nome} - CNPJ: {emp.documento}
            <button onClick={() => editarEmpresa(emp)}>Editar</button>
            <button onClick={() => excluirEmpresa(emp.id)}>Excluir</button>
            <button onClick={() => carregarObras(emp.id)}>Obras</button>
          </li>
        ))}
      </ul>

      {/* Cadastro de Obras */}
      {empresaSelecionada && (
        <div style={{ marginTop: "40px" }}>
          <h2>Cadastro de Obras</h2>
          <form onSubmit={salvarObra} style={{ marginBottom: "20px" }}>
            <input
              placeholder="Número da Obra (4 dígitos)"
              value={formObra.numero}
              onChange={(e) => setFormObra({ ...formObra, numero: e.target.value })}
            />
            <input
              placeholder="Nome da Obra"
              value={formObra.nome}
              onChange={(e) => setFormObra({ ...formObra, nome: e.target.value })}
            />
            <input
              placeholder="Bloco (até 3 caracteres)"
              value={formObra.bloco}
              onChange={(e) => setFormObra({ ...formObra, bloco: e.target.value })}
            />
            <input
              placeholder="Endereço completo"
              value={formObra.endereco}
              onChange={(e) => setFormObra({ ...formObra, endereco: e.target.value })}
            />
            <button type="submit">Cadastrar Obra</button>
          </form>
          {mensagemObra && <p>{mensagemObra}</p>}

          <h3>Lista de Obras</h3>
          <ul>
            {obras.map((obra) => (
              <li key={obra.id}>
                {obra.numero} - {obra.nome} - Bloco: {obra.bloco} - Endereço: {obra.endereco}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
