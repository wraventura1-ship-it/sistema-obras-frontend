import React, { useState, useEffect } from "react";
import InputMask from "react-input-mask";

const API_URL = "https://sistema-obras.onrender.com"; // ajuste se o backend estiver em outra porta/URL

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
  const [busca, setBusca] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("numero"); // numero ou nome


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

  function handleDocumentoChange(e)   {   
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
  

     function handleNumeroChange(e) {
        const digits = onlyDigits(e.target.value).slice(0, 5);
        setNumero(digits);
        setErroNumero(digits.length === 5 ? "" : "O número deve ter 5 dígitos.");
        console.log("handleNumeroChange -> numero:", digits);
     }
      function padNumeroOnBlur() {
        console.log("padNumeroOnBlur - antes:", numero);
        if (!numero) return;                // nada a fazer se vazio
        const padded = numero.padStart(5, "0");
        if (padded !== numero) {
          setNumero(padded);
          console.log("padNumeroOnBlur - depois:", padded);
        } else {
          console.log("padNumeroOnBlur - já estava preenchido:", numero);
        }
      }
          
    (e) {
  let digits = onlyDigits(e.target.value).slice(0, 5);
  setNumero(digits);
  setErroNumero(digits.length === 5 ? "" : "O número deve ter 5 dígitos.");
  }


  
  
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
    onChange={(e) => setNome(e.target.value.toUpperCase())} // força maiúsculo
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
    {erroDocumento && <div style={{ color: "red" }}>{erroDocumento}</div>}
  </div>

  {/* Botão de submit */}
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

    
            {/* 🔹 Busca + Ordenação */}
            <div style={{ marginBottom: 10 }}>
              <input
                type="text"
                placeholder="🔎 Buscar por nome ou número"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{ padding: 6, width: "60%", marginRight: 10 }}
              />
              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value)}
                style={{ padding: 6 }}
              >
                <option value="numero">Ordenar por Número</option>
                <option value="nome">Ordenar por Nome</option>
              </select>
            </div>

            {empresas.length === 0 ? (
              <div>Nenhuma empresa cadastrada ainda.</div>
            ) : (
              <ul style={{ paddingLeft: 18 }}>
                {empresasFiltradas.map((e) => {
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
