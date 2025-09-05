import React, { useEffect, useState } from "react";
import InputMask from "react-input-mask";

// URL do backend (Render)
const API_URL = "https://sistema-obras.onrender.com";

// Utilidade: manter só números
const onlyDigits = (v) => (v || "").replace(/\D/g, "");

// Validação CPF
function isValidCPF(cpf) {
  cpf = onlyDigits(cpf);
  if (!cpf || cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(cpf[10]);
}

// Validação CNPJ
function isValidCNPJ(cnpj) {
  cnpj = onlyDigits(cnpj);
  if (!cnpj || cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calc = (base) => {
    let len = base.length - 7;
    let sum = 0;
    let pos = len;
    for (let i = base.length; i >= 1; i--) {
      sum += parseInt(base[base.length - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };

  const base = cnpj.substring(0, 12);
  const dig1 = calc(base);
  const dig2 = calc(base + String(dig1));
  return cnpj.endsWith(`${dig1}${dig2}`);
}

// Formata para exibição
function formatDocumento(digits) {
  const v = onlyDigits(digits);
  if (v.length === 11) {
    // CPF: 999.999.999-99
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (v.length === 14) {
    // CNPJ: 99.999.999/9999-99
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return v; // parcial
}

export default function App() {
  // Estados do formulário
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [docExibicao, setDocExibicao] = useState(""); // com máscara
  const [documento, setDocumento] = useState(""); // só números
  const [erroDocumento, setErroDocumento] = useState("");
  const [erroNumero, setErroNumero] = useState("");

  // Lista
  const [empresas, setEmpresas] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // Carregar lista ao abrir
  useEffect(() => {
    carregarEmpresas();
  }, []);

  async function carregarEmpresas() {
    try {
      const resp = await fetch(`${API_URL}/empresas`);
      const data = await resp.json();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Falha ao listar empresas:", e);
    }
  }

  // Ao digitar documento
  function handleDocumentoChange(e) {
    const exibicao = e.target.value;
    const digits = onlyDigits(exibicao);
    setDocExibicao(exibicao);
    setDocumento(digits);

    // Validação em tempo real
    if (digits.length === 0) {
      setErroDocumento("");
      return;
    }
    if (digits.length <= 11) {
      // CPF parcial/cheio
      if (digits.length < 11) {
        setErroDocumento("Digite 11 dígitos para CPF ou continue para CNPJ.");
      } else {
        setErroDocumento(isValidCPF(digits) ? "" : "CPF inválido.");
      }
    } else {
      // CNPJ parcial/cheio
      if (digits.length < 14) {
        setErroDocumento("Digite 14 dígitos para CNPJ.");
      } else {
        setErroDocumento(isValidCNPJ(digits) ? "" : "CNPJ inválido.");
      }
    }
  }

  function handleNumeroChange(e) {
    const digits = onlyDigits(e.target.value).slice(0, 5);
    setNumero(digits);
    setErroNumero(digits.length === 5 ? "" : "O número deve ter 5 dígitos.");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validações finais
    if (numero.length !== 5) {
      setErroNumero("O número deve ter 5 dígitos.");
      return;
    }
    if (!(documento.length === 11 || documento.length === 14)) {
      setErroDocumento("Informe CPF (11) ou CNPJ (14) dígitos.");
      return;
    }
    if (documento.length === 11 && !isValidCPF(documento)) {
      setErroDocumento("CPF inválido.");
      return;
    }
    if (documento.length === 14 && !isValidCNPJ(documento)) {
      setErroDocumento("CNPJ inválido.");

      // >>> ADICIONE ESTE BLOCO ACIMA DO "return ("
async function handleConsultar() {
  try {
    const resp = await fetch(`${API_URL}/empresas`);
    if (!resp.ok) throw new Error("Erro ao buscar empresas");
    const data = await resp.json();
    setEmpresas(Array.isArray(data) ? data : []);
    setMostrarLista(true); // mostra a lista assim que carregar
  } catch (e) {
    console.error("Erro ao buscar empresas:", e);
    alert("Erro ao buscar empresas");
  }
}

      return;
    }

    try {
      const nova = { numero, nome, documento }; // envia só dígitos
      const resp = await fetch(`${API_URL}/empresas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nova),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.detail || "Erro ao cadastrar");

      setMensagem("✅ Empresa cadastrada com sucesso!");
      setNumero("");
      setNome("");
      setDocExibicao("");
      setDocumento("");
      setErroDocumento("");
      setErroNumero("");

      // Recarrega lista
      carregarEmpresas();
      setMostrarLista(true);
    } catch (err) {
      console.error(err);
      setMensagem("❌ Erro ao cadastrar empresa.");
    } finally {
      setTimeout(() => setMensagem(""), 4000);
    }
  }

  // Máscara dinâmica: CPF enquanto <=11 dígitos, depois CNPJ
  const mask = onlyDigits(docExibicao).length <= 11 ? "999.999.999-99" : "99.999.999/9999-99";

  return (
    <div style={{ maxWidth: 520, margin: "30px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: 16 }}>Cadastro de Empresas</h2>

      {mensagem && (
        <div style={{ marginBottom: 12, padding: 10, borderRadius: 6, background: "#f1f5ff" }}>
          {mensagem}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
          Número da empresa (5 dígitos)
        </label>
        <input
          type="text"
          value={numero}
          onChange={handleNumeroChange}
          placeholder="Ex: 00001"
          maxLength={5}
          style={{ width: "100%", padding: 8, marginBottom: 6 }}
          required
        />
        {erroNumero && <div style={{ color: "crimson", marginBottom: 8 }}>{erroNumero}</div>}

        <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
          Nome da empresa
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Construtora Alfa Ltda"
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
          required
        />

        <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
          CPF ou CNPJ
        </label>
        <InputMask
          mask={mask}
          value={docExibicao}
          onChange={handleDocumentoChange}
        >
          {(inputProps) => (
            <input
              {...inputProps}
              type="text"
              placeholder="Digite CPF ou CNPJ"
              style={{ width: "100%", padding: 8, marginBottom: 6 }}
              required
            />
          )}
        </InputMask>
        {erroDocumento && <div style={{ color: "crimson", marginBottom: 8 }}>{erroDocumento}</div>}

        <button
          type="submit"
          style={{
            padding: "10px 15px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            marginTop: 6,
          }}
          disabled={
            numero.length !== 5 ||
            !nome ||
            !documento ||
            !!erroDocumento
          }
        >
          Cadastrar
        </button>
        
            
            
            
            <button
              type="button"
              onClick={fetchEmpresas}
              style={{
                padding: "10px 15px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                marginTop: 6,
                marginLeft: 10,
              }}
            >
              Consultar Empresas
            </button>



    
      </form>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => setMostrarLista(!mostrarLista)}
          style={{
            padding: "8px 12px",
            background: "#e9ecef",
            border: "1px solid #ced4da",
            borderRadius: 6,
            cursor: "pointer",
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
                    <li key={e.id || `${e.numero}-${e.documento}`}>
                      <strong>{e.numero}</strong> — {e.nome} — {docFmt}
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
