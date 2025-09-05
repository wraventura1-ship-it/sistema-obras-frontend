import React, { useState, useEffect } from "react";

const API_URL = "https://sistema-obras.onrender.com";

function App() {
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [empresas, setEmpresas] = useState([]);
  const [mensagem, setMensagem] = useState("");

  // Buscar empresas cadastradas
  useEffect(() => {
    fetch(`${API_URL}/empresas`)
      .then((res) => res.json())
      .then((data) => setEmpresas(data))
      .catch(() => setMensagem("Erro ao carregar empresas"));
  }, []);

  // Cadastrar empresa
  const handleSubmit = async (e) => {
    e.preventDefault();
    const novaEmpresa = { numero, nome, documento };

    try {
      const res = await fetch(`${API_URL}/empresas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaEmpresa),
      });

      if (res.ok) {
        const data = await res.json();
        setMensagem(data.mensagem);
        setEmpresas([...empresas, data.empresa]);
        setNumero("");
        setNome("");
        setDocumento("");
      } else {
        setMensagem("Erro ao cadastrar empresa");
      }
    } catch {
      setMensagem("Falha na conexão com o servidor");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Cadastro de Empresas</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Número (5 dígitos)"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="Nome da empresa"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="CPF ou CNPJ"
          value={documento}
          onChange={(e) => setDocumento(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 15px",
            background: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Cadastrar
        </button>
      </form>

      {mensagem && <p>{mensagem}</p>}

      <h2>Empresas Cadastradas</h2>
      <ul>
        {empresas.map((e, i) => (
          <li key={i}>
            <b>{e.numero}</b> - {e.nome} ({e.documento})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
