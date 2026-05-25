import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Dices,
  Users,
  RefreshCw,
  ArrowLeft,
  Shield,
  Trophy,
  CheckCircle,
  Swords,
  ListOrdered,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  XCircle,
  Trash2,
  ClipboardList,
  Printer,
  UserPlus,
  Info,
  Save,
  Plus,
  X,
  Zap,
  Undo2,
  Wand2,
  FileText,
  Globe,
  Eye,
  Cloud,
  CloudOff,
  Lock,
  Unlock,
  Key,
  Pencil,
  ClipboardPaste,
  Loader2,
  Home,
} from "lucide-react";

// --- IMPORTS DO BANCO DE DADOS EM NUVEM (FIREBASE) ---
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// ============================================================================
// ☁️ CONFIGURAÇÃO DO BANCO DE DADOS
// ============================================================================
const getFirebaseConfig = () => {
  return {
    apiKey: "AIzaSyDp5FtHG8zb7EnOaQrRupLSuNglrnlP9rI",
    authDomain: "kings-league-5e65d.firebaseapp.com",
    projectId: "kings-league-5e65d",
    storageBucket: "kings-league-5e65d.firebasestorage.app",
    messagingSenderId: "12033374868",
    appId: "1:12033374868:web:34a7a79d22e9ee0bf5ab81",
  };
};

const firebaseConfig = getFirebaseConfig();
const hasFirebase = Boolean(
  firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5
);

let app: any, auth: any, db: any;
if (hasFirebase) {
  try {
    app =
      getApps().find((a) => a.name === "KINGS") ||
      initializeApp(firebaseConfig, "KINGS");
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Erro ao inicializar Firebase", e);
  }
}
const appId = "kl-brandao-app";
// ============================================================================

// --- ÍCONES PERSONALIZADOS ---
const SoccerIcon = ({ size = 16, className = "" }: any) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11.99 15.4L8.14 12.6L9.61 7.9H14.36L15.83 12.6L11.99 15.4ZM6.64 13.78L4.1 11.95C4.54 8.78 6.42 6.09 9.07 4.67L8.03 9.38L6.64 13.78ZM14.9 4.65C17.56 6.07 19.45 8.76 19.89 11.93L17.34 13.77L15.95 9.37L14.9 4.65ZM5.6 15.11L9.12 17.65L10.37 21.46C7.54 20.65 5.2 18.25 4.3 15.34L5.6 15.11ZM13.62 21.46L14.86 17.65L18.39 15.11L19.69 15.34C18.79 18.25 16.45 20.65 13.62 21.46Z" />
  </svg>
);

// --- CONSTANTES ---
const GROUPS_KEYS = ["A", "B", "C", "D"];
const TOTAL_TEAMS = 12;
const LOCAL_STORAGE_PREFIX = "kl_brandao_v7_";
const defaultTeams = Array.from({ length: TOTAL_TEAMS }, (_, i) => ({
  id: `team-${i}`,
  name: "",
  players: [],
}));
const generateId = () => Math.random().toString(36).slice(2, 11);

const worldCup2026Teams = [
  { name: "Brasil", code: "br" },
  { name: "Argentina", code: "ar" },
  { name: "Uruguai", code: "uy" },
  { name: "Colômbia", code: "co" },
  { name: "Equador", code: "ec" },
  { name: "Paraguai", code: "py" },
  { name: "França", code: "fr" },
  { name: "Inglaterra", code: "gb-eng" },
  { name: "Portugal", code: "pt" },
  { name: "Espanha", code: "es" },
  { name: "Alemanha", code: "de" },
  { name: "Países Baixos", code: "nl", aliases: ["Holanda"] },
  { name: "Bélgica", code: "be" },
  { name: "Croácia", code: "hr" },
  { name: "Suíça", code: "ch" },
  { name: "Áustria", code: "at" },
  { name: "Escócia", code: "gb-sct" },
  { name: "Noruega", code: "no" },
  { name: "Suécia", code: "se" },
  { name: "Turquia", code: "tr" },
  { name: "Rep. Tcheca", code: "cz", aliases: ["República Tcheca", "Tcheca"] },
  {
    name: "Bósnia e Herz.",
    code: "ba",
    aliases: ["Bósnia", "Bosnia e Herzegovina"],
  },
  { name: "Marrocos", code: "ma" },
  { name: "Senegal", code: "sn" },
  { name: "Egito", code: "eg" },
  { name: "Nigéria", code: "ng" },
  { name: "Camarões", code: "cm" },
  { name: "Costa do Marfim", code: "ci" },
  { name: "Tunísia", code: "tn" },
  { name: "África do Sul", code: "za" },
  {
    name: "RD Congo",
    code: "cd",
    aliases: ["Congo", "República Democrática do Congo"],
  },
  { name: "Japão", code: "jp" },
  { name: "Coreia do Sul", code: "kr", aliases: ["Coreia"] },
  { name: "Irã", code: "ir" },
  { name: "Austrália", code: "au" },
  { name: "Uzbequistão", code: "uz" },
  { name: "Jordânia", code: "jo" },
  { name: "Arábia Saudita", code: "sa", aliases: ["Arábia"] },
  { name: "Iraque", code: "iq" },
  { name: "Estados Unidos", code: "us", aliases: ["EUA", "USA"] },
  { name: "México", code: "mx" },
  { name: "Canadá", code: "ca" },
  { name: "Costa Rica", code: "cr" },
  { name: "Panamá", code: "pa" },
  { name: "Jamaica", code: "jm" },
  { name: "Nova Zelândia", code: "nz" },
  { name: "Cabo Verde", code: "cv" },
  { name: "Curaçao", code: "cw" },
];

const normalizeStr = (str: string) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

const normalizedWorldCupTeams = worldCup2026Teams.map((team) => ({
  code: team.code,
  names: [team.name, ...(team.aliases || [])].map(normalizeStr),
}));

const detectTeamCode = (inputName: string) => {
  if (!inputName) return null;
  const normalizedInput = normalizeStr(inputName);
  for (const team of normalizedWorldCupTeams) {
    if (team.names.some((teamName) => normalizedInput.includes(teamName)))
      return team.code;
  }
  return null;
};

const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const usePersistentState = (key: string, defaultValue: any) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  useEffect(() => {
    localStorage.setItem(
      `${LOCAL_STORAGE_PREFIX}${key}`,
      JSON.stringify(state)
    );
  }, [key, state]);
  return [state, setState];
};

const getEventStats = (team: any, goalsM: any, yellowM: any, redM: any) => {
  if (!team?.players?.length) return [];
  return team.players.reduce((acc: any[], p: any) => {
    const goals = goalsM?.[p.id] || 0;
    const yellow = yellowM?.[p.id] || 0;
    const red = redM?.[p.id] || 0;
    if (goals > 0 || yellow > 0 || red > 0) {
      acc.push({ name: p.name, number: p.number, goals, yellow, red });
    }
    return acc;
  }, []);
};

// --- COMPONENTES UI BASE ---
const TeamBadge = ({ name, className = "w-6 h-6 text-[10px]" }: any) => {
  const code = detectTeamCode(name);
  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-zinc-800 border border-zinc-700 text-zinc-300 font-black rounded shadow-inner overflow-hidden ${className}`}
    >
      {code ? (
        <img
          src={`https://flagcdn.com/w160/${code}.png`}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="translate-no">
          {name && typeof name === "string"
            ? name.substring(0, 2).toUpperCase()
            : "??"}
        </span>
      )}
    </div>
  );
};

const TabBtn = ({ id, active, onClick, icon: Icon, label }: any) => {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`shrink-0 px-5 md:px-6 py-3 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-2 border shadow-lg ${
        isActive
          ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-105"
          : "bg-black/50 backdrop-blur-md border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-600"
      }`}
    >
      {Icon && (
        <Icon size={16} className={isActive ? "text-black" : "text-zinc-500"} />
      )}
      <span className="translate-no whitespace-nowrap">{label}</span>
    </button>
  );
};

const CustomLogo = ({ size = "large" }: any) => {
  const [error, setError] = useState(false);
  if (size === "small") {
    return !error ? (
      <img
        src="/kl.png"
        alt="Logo"
        className="w-16 h-16 md:w-20 md:h-20 object-contain"
        onError={() => setError(true)}
      />
    ) : (
      <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900 border border-zinc-700 flex items-center justify-center rounded-2xl text-zinc-400">
        <SoccerIcon size={28} />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-2 mb-10 print:hidden relative z-10 translate-no">
      <div className="relative">
        {!error ? (
          <img
            src="/kl.png"
            alt="Logo"
            className="w-56 h-56 md:w-72 md:h-72 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            onError={() => setError(true)}
          />
        ) : (
          <div className="w-48 h-48 md:w-64 md:h-64 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-full text-zinc-600">
            <SoccerIcon size={80} />
          </div>
        )}
      </div>
      <h1 className="text-3xl md:text-5xl uppercase text-white mt-6 text-center font-oswald tracking-[0.1em]">
        Kings League Brandão
      </h1>
      <div className="flex items-center gap-3 mt-1 opacity-60">
        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-zinc-500"></div>
        <p className="text-zinc-400 tracking-[0.3em] text-[10px] md:text-xs font-bold uppercase">
          Gestor de Torneios
        </p>
        <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-zinc-500"></div>
      </div>
    </div>
  );
};

// --- MODAIS ---
const AdminLoginModal = ({ onClose, onSuccess }: any) => {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (pwd === "6508") {
      onSuccess();
    } else {
      setError("Senha incorreta!");
      setPwd("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] p-4 backdrop-blur-sm translate-no">
      <div className="bg-[#0a0a0a] border border-zinc-700/50 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6 border-b border-zinc-800/80 pb-4">
          <h3 className="font-oswald text-xl uppercase tracking-wider flex items-center gap-2 text-white">
            <Lock size={20} className="text-yellow-500" /> Acesso Restrito
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white bg-white/5 p-1.5 rounded-full"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <p className="text-zinc-400 text-xs uppercase font-bold tracking-widest text-center mb-4">
            Insira a senha de administrador.
          </p>
          <div className="relative">
            <Key
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoFocus
              className="w-full bg-black border border-zinc-700 rounded-xl px-10 py-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 outline-none transition-all text-center tracking-[0.2em]"
              placeholder="••••"
            />
          </div>
          {error && (
            <p className="text-red-500 text-xs font-bold text-center animate-pulse">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
          >
            <Unlock size={18} />{" "}
            <span className="translate-no">Desbloquear</span>
          </button>
        </form>
      </div>
    </div>
  );
};

const ImportDataModal = ({ onClose, onImport }: any) => {
  const [text, setText] = useState("");
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4 backdrop-blur-sm translate-no">
      <div className="bg-[#0a0a0a] border border-zinc-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-black p-5 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-oswald uppercase tracking-wider text-lg text-white flex items-center gap-2">
            <ClipboardPaste size={20} className="text-zinc-400" /> Importar
            Dados Rápidos
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Cole os dados das equipes no formato exato abaixo. Separe as equipes
            pulando uma linha em branco. A primeira linha será o nome do time,
            as seguintes os jogadores.
          </p>
          <pre className="bg-black border border-zinc-800 p-4 rounded-lg text-xs text-zinc-500 mb-4 font-mono leading-loose">
            2F - Portugal
            <br />
            Mateus 2<br />
            Gabriel 8<br />
          </pre>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-48 bg-[#050505] border border-zinc-700 rounded-xl p-4 text-white text-sm outline-none focus:border-yellow-500 focus:bg-black transition-all custom-scrollbar"
            placeholder="Cole os dados aqui..."
          />
        </div>
        <div className="p-5 bg-black border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase text-zinc-500 hover:text-white hover:bg-zinc-900"
          >
            Cancelar
          </button>
          <button
            onClick={() => onImport(text)}
            className="px-6 py-2.5 rounded-lg text-xs font-black uppercase bg-white text-black hover:bg-zinc-200 flex items-center gap-2"
          >
            <CheckCircle size={16} /> Importar
          </button>
        </div>
      </div>
    </div>
  );
};

const WorldCupTeamsModal = ({ onClose }: any) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4 backdrop-blur-md translate-no">
    <div className="bg-[#0a0a0a] rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-zinc-800">
      <div className="bg-black p-5 border-b border-zinc-800 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h3 className="font-oswald uppercase tracking-wider text-xl text-white flex items-center gap-3">
            <Globe className="text-zinc-400" /> Seleções da Copa do Mundo 2026
          </h3>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">
            Lista com as 48 Participantes Classificadas
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white bg-white/5 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-6 bg-[#050505] overflow-y-auto flex-1 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {worldCup2026Teams.map((team, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-zinc-800 hover:border-zinc-600 transition-colors shadow-sm group"
            >
              <div className="w-16 h-11 relative shadow-[0_4px_10px_rgba(0,0,0,0.5)] rounded overflow-hidden">
                <img
                  src={`https://flagcdn.com/w80/${team.code}.png`}
                  alt={team.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-[11px] font-black text-zinc-300 uppercase text-center tracking-wide">
                {team.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ConfirmModal = ({ title, message, onConfirm, onCancel }: any) => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm translate-no">
    <div className="bg-[#0a0a0a] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-zinc-700">
      <div className="p-8 text-center">
        <Shield
          size={48}
          className="mx-auto text-zinc-500 mb-5 drop-shadow-md"
        />
        <h3 className="font-oswald text-xl uppercase tracking-wider text-white mb-3">
          {title}
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{message}</p>
      </div>
      <div className="flex border-t border-zinc-800 bg-black">
        <button
          onClick={onCancel}
          className="flex-1 py-4 text-xs font-bold uppercase text-zinc-500 hover:text-white hover:bg-zinc-900 border-r border-zinc-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-4 text-xs font-black uppercase text-red-500 hover:text-red-400 hover:bg-red-950 transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
);

const AlertModal = ({ title, message, onClose }: any) => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm translate-no">
    <div className="bg-[#0a0a0a] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-zinc-700">
      <div className="p-8 text-center">
        <Info size={48} className="mx-auto text-zinc-500 mb-5 drop-shadow-md" />
        <h3 className="font-oswald text-xl uppercase tracking-wider text-white mb-3">
          {title}
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="w-full py-4 text-xs font-black uppercase text-black bg-white hover:bg-zinc-200 transition-colors"
      >
        Entendi
      </button>
    </div>
  </div>
);

const TeamEditorModal = ({ team, onClose, onSave }: any) => {
  const [players, setPlayers] = useState(
    team.players?.length
      ? team.players
      : [{ id: generateId(), name: "", number: "" }]
  );
  const updatePlayer = (id: any, f: any, v: any) =>
    setPlayers(players.map((p: any) => (p.id === id ? { ...p, [f]: v } : p)));
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm translate-no">
      <div className="bg-[#0a0a0a] border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-black p-5 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <TeamBadge
              name={team.name}
              className="w-10 h-10 text-sm shadow-lg"
            />
            <div>
              <h3 className="font-oswald uppercase tracking-wider text-xl text-white">
                {team.name || "Time"}
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                Gestão de Elenco
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 bg-[#050505] overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-sm text-left border-separate border-spacing-y-2">
            <thead className="text-[10px] text-zinc-600 uppercase tracking-widest">
              <tr>
                <th className="px-2 pb-2 w-20 text-center">Nº</th>
                <th className="px-2 pb-2">Nome do Jogador</th>
                <th className="px-2 pb-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {players.map((p: any, idx: any) => (
                <tr key={p.id} className="group">
                  <td className="px-1">
                    <input
                      type="number"
                      value={p.number}
                      onChange={(e) =>
                        updatePlayer(p.id, "number", e.target.value)
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2.5 text-center text-white font-bold outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50"
                      placeholder="00"
                    />
                  </td>
                  <td className="px-1">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) =>
                        updatePlayer(p.id, "name", e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && idx === players.length - 1)
                          setPlayers([
                            ...players,
                            { id: generateId(), name: "", number: "" },
                          ]);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white font-bold uppercase outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50"
                      placeholder="NOME DO JOGADOR"
                    />
                  </td>
                  <td className="px-1 text-center">
                    <button
                      onClick={() =>
                        setPlayers(players.filter((x: any) => x.id !== p.id))
                      }
                      className="text-zinc-600 hover:text-red-500 hover:bg-red-950 p-2 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() =>
              setPlayers([
                ...players,
                { id: generateId(), name: "", number: "" },
              ])
            }
            className="mt-4 w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-400 uppercase flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={16} /> Adicionar Linha
          </button>
        </div>
        <div className="p-5 bg-black border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase text-zinc-500 hover:text-white hover:bg-zinc-900"
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onSave({
                ...team,
                players: players.filter((p: any) => p.name.trim() !== ""),
              })
            }
            className="px-6 py-2.5 rounded-lg text-xs font-black uppercase bg-white text-black hover:bg-zinc-200 hover:scale-105 flex items-center gap-2 transition-all"
          >
            <Save size={16} /> Salvar Elenco
          </button>
        </div>
      </div>
    </div>
  );
};

const MatchStatsModal = ({ match, onClose, onSave }: any) => {
  const [stats1, setStats1] = useState({
    goals: match.scorers1 || {},
    yellow: match.yellow1 || {},
    red: match.red1 || {},
  });
  const [stats2, setStats2] = useState({
    goals: match.scorers2 || {},
    yellow: match.yellow2 || {},
    red: match.red2 || {},
  });

  const updateStat = (teamId: any, playerId: any, type: any, delta: any) => {
    const setState = teamId === 1 ? setStats1 : setStats2;
    setState((prev: any) => {
      const next = (prev[type][playerId] || 0) + delta;
      if (type === "yellow" && (next < 0 || next > 2)) return prev;
      if (type === "red" && (next < 0 || next > 1)) return prev;
      if (type === "goals" && next < 0) return prev;
      return { ...prev, [type]: { ...prev[type], [playerId]: next } };
    });
  };

  const renderTeamStats = (team: any, teamId: any, score: any, stats: any) => {
    const tGoals = Object.values(stats.goals).reduce(
      (a: any, b: any) => a + b,
      0
    );
    return (
      <div className="flex-1 bg-black p-4 rounded-xl border border-zinc-800 flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <TeamBadge name={team.name} />
            <span className="font-black uppercase text-sm truncate text-zinc-200">
              {team.name}
            </span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded ${
              tGoals === score
                ? "bg-green-950 text-green-400 border border-green-900"
                : tGoals > score
                ? "bg-red-950 text-red-400 border border-red-900"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800"
            }`}
          >
            {tGoals} / {score} GOLS
          </span>
        </div>
        <div className="flex justify-end pr-2 pb-1 gap-[22px] text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          <span>
            <SoccerIcon size={12} />
          </span>
          <span>🟨</span>
          <span className="mr-4">🟥</span>
        </div>
        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-72">
          {team.players?.length === 0 && (
            <p className="text-zinc-600 text-xs italic">
              Nenhum jogador cadastrado.
            </p>
          )}
          {team.players?.map((p: any) => {
            const [g, y, r] = [
              stats.goals[p.id] || 0,
              stats.yellow[p.id] || 0,
              stats.red[p.id] || 0,
            ];
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  g > 0 || y > 0 || r > 0
                    ? "bg-zinc-900 border-zinc-700"
                    : "bg-zinc-950 border-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-[10px] text-zinc-500 font-black w-5 shrink-0 bg-black px-1 py-0.5 rounded text-center border border-zinc-800">
                    {p.number}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-300 uppercase truncate">
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex items-center bg-black rounded border border-zinc-800 h-6 px-1">
                    <button
                      onClick={() => updateStat(teamId, p.id, "goals", -1)}
                      className="px-1 text-zinc-500 hover:text-white"
                    >
                      -
                    </button>
                    <span className="w-4 text-center text-[10px] font-black text-zinc-300">
                      {g}
                    </span>
                    <button
                      onClick={() => updateStat(teamId, p.id, "goals", 1)}
                      disabled={tGoals >= score}
                      className="px-1 text-zinc-500 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center bg-black rounded border border-zinc-800 h-6 px-1">
                    <button
                      onClick={() => updateStat(teamId, p.id, "yellow", -1)}
                      className="px-1 text-yellow-800 hover:text-yellow-500"
                    >
                      -
                    </button>
                    <span className="w-4 text-center text-[10px] font-black text-yellow-600">
                      {y}
                    </span>
                    <button
                      onClick={() => updateStat(teamId, p.id, "yellow", 1)}
                      disabled={y >= 2}
                      className="px-1 text-yellow-800 hover:text-yellow-500"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center bg-black rounded border border-zinc-800 h-6 px-1">
                    <button
                      onClick={() => updateStat(teamId, p.id, "red", -1)}
                      className="px-1 text-red-900 hover:text-red-500"
                    >
                      -
                    </button>
                    <span className="w-4 text-center text-[10px] font-black text-red-600">
                      {r}
                    </span>
                    <button
                      onClick={() => updateStat(teamId, p.id, "red", 1)}
                      disabled={r >= 1}
                      className="px-1 text-red-900 hover:text-red-500"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm translate-no">
      <div className="bg-[#0a0a0a] border border-zinc-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-black p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-oswald text-zinc-200 uppercase tracking-wider text-xl flex items-center gap-2">
            <ListOrdered size={20} className="text-zinc-500" /> Lançar
            Estatísticas
          </h3>
          <button onClick={onClose} className="text-zinc-600 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 flex flex-col lg:flex-row gap-5">
          {renderTeamStats(match.t1, 1, match.score1 || 0, stats1)}
          {renderTeamStats(match.t2, 2, match.score2 || 0, stats2)}
        </div>
        <div className="p-4 bg-black border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase text-zinc-500 hover:text-white hover:bg-zinc-900"
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onSave({
                scorers1: stats1.goals,
                yellow1: stats1.yellow,
                red1: stats1.red,
                scorers2: stats2.goals,
                yellow2: stats2.yellow,
                red2: stats2.red,
              })
            }
            className="px-6 py-2.5 rounded-lg text-xs font-black uppercase bg-white text-black hover:bg-zinc-200 flex items-center gap-2"
          >
            <Save size={14} /> Salvar Dados
          </button>
        </div>
      </div>
    </div>
  );
};

const MatchDetailsViewModal = ({ match, onClose }: any) => {
  const t1Stats = getEventStats(
    match.t1,
    match.scorers1,
    match.yellow1,
    match.red1
  );
  const t2Stats = getEventStats(
    match.t2,
    match.scorers2,
    match.yellow2,
    match.red2
  );

  const renderCol = (stats: any, isLeft: boolean) => (
    <div
      className={`space-y-4 w-1/2 ${
        isLeft ? "pr-2 md:pr-6 border-r border-zinc-800" : "pl-2 md:pl-6"
      }`}
    >
      {stats.length === 0 ? (
        <p className="text-xs text-zinc-700 italic text-center mt-4">
          Sem eventos
        </p>
      ) : (
        stats.map((s: any, i: any) => (
          <div
            key={i}
            className={`flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase text-zinc-400 ${
              isLeft ? "justify-end flex-row-reverse" : "justify-start"
            } flex-wrap`}
          >
            <div className="flex items-center gap-1 shrink-0">
              {s.goals > 0 &&
                Array.from({ length: s.goals }).map((_, idx) => (
                  <SoccerIcon
                    key={`g${idx}`}
                    size={10}
                    className="text-zinc-400"
                  />
                ))}
              {s.yellow > 0 &&
                Array.from({ length: s.yellow }).map((_, idx) => (
                  <div
                    key={`y${idx}`}
                    className="w-2 h-3 bg-yellow-600 rounded-sm shadow-sm"
                  />
                ))}
              {s.red > 0 && (
                <div className="w-2 h-3 bg-red-600 rounded-sm shadow-sm" />
              )}
            </div>
            <span className="truncate max-w-[80px] md:max-w-[150px] leading-tight">
              {s.name}
            </span>
            <span className="text-[8px] bg-black border border-zinc-800 px-1 py-0.5 rounded text-zinc-500 shrink-0">
              {s.number}
            </span>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm translate-no">
      <div className="bg-[#0a0a0a] border border-zinc-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-black p-4 border-b border-zinc-800 relative flex justify-center">
          <h3 className="font-oswald uppercase tracking-wider text-lg text-zinc-300">
            {match.tag || "Detalhes da Partida"}
          </h3>
          <button
            onClick={onClose}
            className="absolute right-4 text-zinc-600 hover:text-white"
          >
            <XCircle size={24} />
          </button>
        </div>
        <div className="p-4 md:p-8 bg-[#050505] flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-center gap-2 md:gap-6 mb-6 md:mb-10 border-b border-zinc-800 pb-6 md:pb-10">
            <div className="flex-1 flex flex-col items-center gap-2 md:gap-3">
              <TeamBadge
                name={typeof match.t1 === "string" ? "" : match.t1.name}
                className="w-12 h-12 md:w-20 md:h-20 text-xl md:text-2xl shadow-xl"
              />
              <span className="font-black uppercase text-[10px] md:text-sm text-zinc-300 text-center">
                {typeof match.t1 === "string" ? match.t1 : match.t1.name}
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <span className="text-3xl md:text-5xl font-black text-white">
                {match.score1 ?? "-"}
              </span>
              <span className="text-zinc-600 text-sm md:text-lg font-black">
                X
              </span>
              <span className="text-3xl md:text-5xl font-black text-white">
                {match.score2 ?? "-"}
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 md:gap-3">
              <TeamBadge
                name={typeof match.t2 === "string" ? "" : match.t2.name}
                className="w-12 h-12 md:w-20 md:h-20 text-xl md:text-2xl shadow-xl"
              />
              <span className="font-black uppercase text-[10px] md:text-sm text-zinc-300 text-center">
                {typeof match.t2 === "string" ? match.t2 : match.t2.name}
              </span>
            </div>
          </div>
          <div className="flex w-full">
            {renderCol(t1Stats, true)}
            {renderCol(t2Stats, false)}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChampionBanner = ({ winner }: any) => {
  if (!winner) return null;
  const code = detectTeamCode(winner.name);
  const matchedTeam = worldCup2026Teams.find((t: any) => t.code === code);
  const countryName = matchedTeam ? matchedTeam.name : "Seleção";
  const displayTeamName = winner.name.replace(/^[0-9][A-Z]\s*-\s*/, "");

  return (
    <div className="w-full max-w-4xl mx-auto mb-10 bg-[#050505] border border-zinc-800 border-t-[3px] border-t-yellow-500 rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center animate-fade-in shadow-2xl relative">
      <Trophy size={28} className="text-yellow-500 mb-3" />
      <h2 className="text-zinc-500 tracking-[0.3em] text-[10px] md:text-xs uppercase font-bold mb-8 md:mb-10">
        O Grande Campeão
      </h2>

      <div className="flex items-center gap-6 md:gap-10">
        {code ? (
          <img
            src={`https://flagcdn.com/w160/${code}.png`}
            alt={countryName}
            className="w-24 md:w-36 shadow-2xl rounded object-cover"
          />
        ) : (
          <div className="w-24 h-16 md:w-36 md:h-24 bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl rounded text-zinc-700">
            <SoccerIcon size={36} />
          </div>
        )}

        <div className="flex flex-col">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider leading-tight">
            {displayTeamName}
          </h1>
          <h3 className="text-yellow-500 tracking-[0.2em] uppercase font-bold text-xs md:text-sm mt-1">
            {countryName}
          </h3>
        </div>
      </div>
    </div>
  );
};

// --- APLICAÇÃO PRINCIPAL ---
// --- APLICAÇÃO PRINCIPAL ---
export default function KingsLeagueApp({
  onBack,
  isAdmin,
  onAccessDenied,
}: any) {
  const [user, setUser] = useState<any>(null);
  const [cloudReady, setCloudReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineFallback, setOfflineFallback] = useState(!hasFirebase);
  const [showGuide, setShowGuide] = useState(false);
  const [showTimeoutButton, setShowTimeoutButton] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [swappingTeam, setSwappingTeam] = useState<any>(null);
  const [expandedGroups, setExpandedGroups] = useState<any>({});

  const toggleGroup = (g: any) =>
    setExpandedGroups((prev: any) => ({ ...prev, [g]: !prev[g] }));
  const isIncomingSync = useRef(false);

  const [phase, setPhase] = usePersistentState("phase", "setup");
  const [teams, setTeams] = usePersistentState("teams", defaultTeams);
  const [groups, setGroups] = usePersistentState("groups", {});
  const [matches, setMatches] = usePersistentState("matches", []);
  const [activeTab, setActiveTab] = usePersistentState("activeTab", "groups");
  const [knockoutStarted, setKnockoutStarted] = usePersistentState(
    "knockoutStarted",
    false
  );
  const [knockoutTeams, setKnockoutTeams] = usePersistentState(
    "knockoutTeams",
    {}
  );
  const [knockoutScores, setKnockoutScores] = usePersistentState(
    "knockoutScores",
    {}
  );

  const [summaryPhase, setSummaryPhase] = useState("groups");
  const [confirmDialog, setConfirmDialog] = useState<any>(null);
  const [alertDialog, setAlertDialog] = useState<any>(null);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [editingScorersMatch, setEditingScorersMatch] = useState<any>(null);
  const [viewingMatchDetails, setViewingMatchDetails] = useState<any>(null);
  const [showWorldCupTeams, setShowWorldCupTeams] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const isTournamentEnded =
    knockoutScores["F1"]?.s1 !== "" &&
    knockoutScores["F1"]?.s1 !== undefined &&
    knockoutScores["F1"]?.s2 !== "" &&
    knockoutScores["F1"]?.s2 !== undefined;

  // --- LÓGICA NOVA DE BLOQUEIO DE ACESSO ---
  useEffect(() => {
    const isReady = cloudReady || offlineFallback || !hasFirebase;
    // Se estiver pronto, não for admin e ainda estiver no setup: expulsa!
    if (isReady && !isAdmin && phase === "setup") {
      if (onAccessDenied) onAccessDenied();
    }
  }, [
    cloudReady,
    offlineFallback,
    hasFirebase,
    isAdmin,
    phase,
    onAccessDenied,
  ]);
  // ----------------------------------------

  useEffect(() => {
    if (!hasFirebase || offlineFallback) return;
    const timer = setTimeout(() => {
      if (!cloudReady) {
        setShowTimeoutButton(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [cloudReady, offlineFallback]);

  useEffect(() => {
    if (!hasFirebase || offlineFallback) return;
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Erro auth:", e);
        setFirebaseError("auth-error");
        setShowGuide(true);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u: any) => setUser(u));
    return () => unsubscribe();
  }, [offlineFallback]);

  useEffect(() => {
    if (!hasFirebase || !user || offlineFallback) return;
    const docRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "tournament",
      "shared_state"
    );
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          isIncomingSync.current = true;
          const d = docSnap.data();
          if (d.phase) setPhase(d.phase);
          if (d.teams) setTeams(d.teams);
          if (d.groups) setGroups(d.groups);
          if (d.matches) setMatches(d.matches);
          if (d.knockoutStarted !== undefined)
            setKnockoutStarted(d.knockoutStarted);
          if (d.knockoutTeams) setKnockoutTeams(d.knockoutTeams);
          if (d.knockoutScores) setKnockoutScores(d.knockoutScores);
          setTimeout(() => {
            isIncomingSync.current = false;
          }, 500);
        }
        setCloudReady(true);
      },
      (error) => {
        console.error("Erro sync:", error);
        if (error.code === "permission-denied") {
          setFirebaseError("permission-error");
          setShowGuide(true);
        }
      }
    );
    return () => unsubscribe();
  }, [user, offlineFallback]);

  useEffect(() => {
    if (
      !hasFirebase ||
      !user ||
      !cloudReady ||
      isIncomingSync.current ||
      offlineFallback ||
      !isAdmin
    )
      return;
    const saveToCloud = async () => {
      setIsSyncing(true);
      const docRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "tournament",
        "shared_state"
      );
      await setDoc(docRef, {
        phase,
        teams,
        groups,
        matches,
        knockoutStarted,
        knockoutTeams,
        knockoutScores,
      });
      setTimeout(() => setIsSyncing(false), 800);
    };
    const timeoutId = setTimeout(saveToCloud, 600);
    return () => clearTimeout(timeoutId);
  }, [
    phase,
    teams,
    groups,
    matches,
    knockoutStarted,
    knockoutTeams,
    knockoutScores,
    user,
    cloudReady,
    offlineFallback,
    isAdmin,
  ]);

  // Confetti Effect for Winner
  useEffect(() => {
    if (isTournamentEnded) {
      const w = window as any;
      if (w.confetti) {
        w.confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      } else {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
        script.onload = () => {
          w.confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
        };
        document.head.appendChild(script);
      }
    }
  }, [isTournamentEnded]);

  const safePushHistory = useCallback(() => {
    if (!isAdmin) return;
    setHistory((prev) => {
      const currentState = {
        matches: JSON.stringify(matches),
        knockoutScores: JSON.stringify(knockoutScores),
      };
      if (
        prev.length > 0 &&
        prev[prev.length - 1].matches === currentState.matches &&
        prev[prev.length - 1].knockoutScores === currentState.knockoutScores
      )
        return prev;
      return [...prev, currentState].slice(-20);
    });
  }, [matches, knockoutScores, isAdmin]);

  const handleUndo = () => {
    if (history.length === 0 || !isAdmin) return;
    const last = history[history.length - 1];
    setMatches(JSON.parse(last.matches));
    setKnockoutScores(JSON.parse(last.knockoutScores));
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleImportText = (text: string) => {
    if (!isAdmin) return;
    const blocks = text.split(/\n\s*\n/);
    const newTeams = [...teams];
    let currentIdx = newTeams.findIndex((t) => t.name.trim() === "");
    if (currentIdx === -1) currentIdx = 0;

    blocks.forEach((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length > 0 && currentIdx < TOTAL_TEAMS) {
        const teamName = lines[0];
        const parsedPlayers = lines.slice(1).map((l) => {
          const match = l.match(/^(.*?)\s+(\d+)$/);
          if (match)
            return { id: generateId(), name: match[1], number: match[2] };
          return { id: generateId(), name: l, number: "" };
        });
        newTeams[currentIdx] = {
          ...newTeams[currentIdx],
          name: teamName,
          players:
            parsedPlayers.length > 0
              ? parsedPlayers
              : newTeams[currentIdx].players,
        };
        currentIdx++;
      }
    });
    setTeams(newTeams);
    setShowImportModal(false);
  };

  const fillTestData = () => {
    if (!isAdmin) return;
    const firstNames = [
      "João",
      "Pedro",
      "Lucas",
      "Mateus",
      "Marcos",
      "Gabriel",
      "Rafael",
      "Thiago",
      "Felipe",
      "Carlos",
      "Luis",
      "Diego",
    ];
    const lastNames = [
      "Silva",
      "Santos",
      "Oliveira",
      "Souza",
      "Rodrigues",
      "Ferreira",
      "Alves",
      "Pereira",
      "Lima",
      "Gomes",
      "Costa",
      "Ribeiro",
    ];
    setTeams(
      worldCup2026Teams.slice(0, 12).map((team, i) => ({
        id: `team-${i}`,
        name: team.name,
        players: Array.from({ length: 5 }, (_, pI) => ({
          id: generateId(),
          name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
            lastNames[Math.floor(Math.random() * lastNames.length)]
          }`,
          number: (pI + 1).toString(),
        })),
      }))
    );
  };

  const clearTeamsInputs = () => {
    if (!isAdmin) return;
    setConfirmDialog({
      title: "Limpar Campos",
      message:
        "Deseja limpar os nomes de todos os times e jogadores inseridos?",
      onConfirm: () => {
        setTeams(defaultTeams);
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const performDraw = () => {
    if (!isAdmin) return;
    const validTeams = teams.filter((t: any) => t.name.trim() !== "");
    if (validTeams.length !== TOTAL_TEAMS)
      return setAlertDialog({
        title: "Erro",
        message: `Preencha os ${TOTAL_TEAMS} times.`,
      });
    const shuffled = shuffleArray(validTeams);
    setGroups({
      A: shuffled.slice(0, 3),
      B: shuffled.slice(3, 6),
      C: shuffled.slice(6, 9),
      D: shuffled.slice(9, 12),
    });
    setPhase("draw");
  };

  const generateTournament = () => {
    if (!isAdmin) return;
    let newMatches: any[] = [];
    Object.entries(groups).forEach(([g, t]: [string, any]) => {
      [
        [0, 1],
        [0, 2],
        [1, 2],
      ].forEach((m, idx) => {
        newMatches.push({
          id: `${g}-m${idx}`,
          group: g,
          t1: t[m[0]],
          t2: t[m[1]],
          score1: "",
          score2: "",
          scorers1: {},
          yellow1: {},
          red1: {},
          scorers2: {},
          yellow2: {},
          red2: {},
        });
      });
    });
    setMatches(newMatches);
    setPhase("tournament");
    setActiveTab("groups");
    setHistory([]);
  };

  const handleSwapClick = (team: any, groupKey: string) => {
    if (!isAdmin) return;
    if (!swappingTeam) {
      setSwappingTeam({ team, groupKey });
    } else {
      if (swappingTeam.team.id === team.id) {
        setSwappingTeam(null);
        return;
      }
      safePushHistory();
      const t1 = swappingTeam.team;
      const g1 = swappingTeam.groupKey;
      const t2 = team;
      const g2 = groupKey;
      const newGroups: any = { ...groups };
      newGroups[g1] = newGroups[g1].map((t: any) => (t.id === t1.id ? t2 : t));
      newGroups[g2] = newGroups[g2].map((t: any) => (t.id === t2.id ? t1 : t));
      setGroups(newGroups);
      const newMatches = matches.map((m: any) => {
        let newT1 = m.t1;
        let newT2 = m.t2;
        if (m.t1.id === t1.id) newT1 = t2;
        else if (m.t1.id === t2.id) newT1 = t1;
        if (m.t2.id === t1.id) newT2 = t2;
        else if (m.t2.id === t2.id) newT2 = t1;
        return { ...m, t1: newT1, t2: newT2 };
      });
      setMatches(newMatches);
      const newKoTeams: any = { ...knockoutTeams };
      Object.keys(newKoTeams).forEach((k) => {
        if (newKoTeams[k]?.id === t1.id) newKoTeams[k] = t2;
        else if (newKoTeams[k]?.id === t2.id) newKoTeams[k] = t1;
      });
      setKnockoutTeams(newKoTeams);
      setSwappingTeam(null);
    }
  };

  const handleSimulatePhase = () => {
    if (!isAdmin) return;
    safePushHistory();
    const simulateTeamStats = (team: any, score: number) => {
      const stats: any = { goals: {}, yellow: {}, red: {} };
      if (!team.players?.length) return stats;
      for (let i = 0; i < score; i++) {
        const pid =
          team.players[Math.floor(Math.random() * team.players.length)].id;
        stats.goals[pid] = (stats.goals[pid] || 0) + 1;
      }
      const numYellows = Math.floor(Math.random() * 3);
      for (let i = 0; i < numYellows; i++) {
        const pid =
          team.players[Math.floor(Math.random() * team.players.length)].id;
        stats.yellow[pid] = Math.min((stats.yellow[pid] || 0) + 1, 2);
        if (stats.yellow[pid] === 2) stats.red[pid] = 1;
      }
      if (Math.random() > 0.85) {
        const pid =
          team.players[Math.floor(Math.random() * team.players.length)].id;
        stats.red[pid] = 1;
      }
      return stats;
    };

    if (activeTab === "groups") {
      setMatches(
        matches.map((m: any) => {
          if (m.score1 !== "" && m.score2 !== "") return m;
          const s1 = Math.floor(Math.random() * 4);
          const s2 = Math.floor(Math.random() * 4);
          const st1 = simulateTeamStats(m.t1, s1);
          const st2 = simulateTeamStats(m.t2, s2);
          return {
            ...m,
            score1: s1,
            score2: s2,
            scorers1: st1.goals,
            yellow1: st1.yellow,
            red1: st1.red,
            scorers2: st2.goals,
            yellow2: st2.yellow,
            red2: st2.red,
          };
        })
      );
    } else if (activeTab === "knockout") {
      const readyMatches: any[] = [];
      const traverse = (node: any) => {
        if (!node) return;
        if (
          typeof node.match.t1 === "object" &&
          typeof node.match.t2 === "object"
        ) {
          const score = knockoutScores[node.match.id] || {};
          if (score.s1 === undefined || score.s1 === "")
            readyMatches.push(node.match);
        }
        if (node.children) node.children.forEach(traverse);
      };
      traverse(bracketTree?.tree);
      if (readyMatches.length === 0)
        return setAlertDialog({
          title: "Aviso",
          message: "Não há jogos prontos para simular no Mata-Mata.",
        });

      const newKoScores: any = { ...knockoutScores };
      readyMatches.forEach((m) => {
        let s1 = Math.floor(Math.random() * 4);
        let s2 = Math.floor(Math.random() * 4);
        if (s1 === s2) s1 += 1;
        const st1 = simulateTeamStats(m.t1, s1);
        const st2 = simulateTeamStats(m.t2, s2);
        newKoScores[m.id] = {
          ...newKoScores[m.id],
          s1,
          s2,
          scorers1: st1.goals,
          yellow1: st1.yellow,
          red1: st1.red,
          scorers2: st2.goals,
          yellow2: st2.yellow,
          red2: st2.red,
        };
      });
      setKnockoutScores(newKoScores);
    } else {
      setAlertDialog({
        title: "Informação",
        message: "Acesse a aba de Grupos ou Mata-Mata para usar a simulação.",
      });
    }
  };

  const updateMatchScore = (matchId: string, field: string, value: string) => {
    if (isAdmin)
      setMatches((prev: any) =>
        prev.map((m: any) =>
          m.id === matchId
            ? { ...m, [field]: value === "" ? "" : parseInt(value, 10) }
            : m
        )
      );
  };
  const saveMatchStats = (matchId: string, stats: any) => {
    if (!isAdmin) return;
    safePushHistory();
    setMatches((prev: any) =>
      prev.map((m: any) => (m.id === matchId ? { ...m, ...stats } : m))
    );
    setEditingScorersMatch(null);
  };
  const updateKoScore = (mId: string, f: string, v: string) => {
    if (isAdmin)
      setKnockoutScores((p: any) => ({
        ...p,
        [mId]: { ...p[mId], [f]: v === "" ? "" : parseInt(v, 10) },
      }));
  };
  const saveKoStats = (matchId: string, stats: any) => {
    if (!isAdmin) return;
    safePushHistory();
    setKnockoutScores((p: any) => ({
      ...p,
      [matchId]: { ...p[matchId], ...stats },
    }));
    setEditingScorersMatch(null);
  };

  const groupStandings = useMemo(() => {
    if (phase !== "tournament") return {};
    const calc: any = {};
    GROUPS_KEYS.forEach((g) => {
      if (!groups[g]) return;
      let stats = groups[g].map((team: any) => ({
        team,
        group: g,
        pts: 0,
        v: 0,
        e: 0,
        d: 0,
        gf: 0,
        gc: 0,
        sg: 0,
      }));
      matches
        .filter((m: any) => m.group === g)
        .forEach((m: any) => {
          if (m.score1 !== "" && m.score2 !== "") {
            let t1 = stats.find((s: any) => s.team.id === m.t1.id);
            let t2 = stats.find((s: any) => s.team.id === m.t2.id);
            if (t1 && t2) {
              t1.gf += m.score1;
              t1.gc += m.score2;
              t1.sg = t1.gf - t1.gc;
              t2.gf += m.score2;
              t2.gc += m.score1;
              t2.sg = t2.gf - t2.gc;
              if (m.score1 > m.score2) {
                t1.pts += 3;
                t1.v += 1;
                t2.d += 1;
              } else if (m.score1 < m.score2) {
                t2.pts += 3;
                t2.v += 1;
                t1.d += 1;
              } else {
                t1.pts += 1;
                t2.pts += 1;
                t1.e += 1;
                t2.e += 1;
              }
            }
          }
        });
      calc[g] = stats.sort((a: any, b: any) =>
        b.pts !== a.pts
          ? b.pts - a.pts
          : b.sg !== a.sg
          ? b.sg - a.sg
          : b.v !== a.v
          ? b.v - a.v
          : b.gf - a.gf
      );
    });
    return calc;
  }, [matches, groups, phase]);

  const generalStandings = useMemo(
    () =>
      phase === "tournament"
        ? Object.values(groupStandings)
            .flat()
            .sort((a: any, b: any) =>
              b.pts !== a.pts
                ? b.pts - a.pts
                : b.sg !== a.sg
                ? b.sg - a.sg
                : b.v !== a.v
                ? b.v - a.v
                : b.gf - a.gf
            )
        : [],
    [groupStandings, phase]
  );

  const generateKnockout = () => {
    if (!isAdmin) return;
    safePushHistory();
    const st: any = groupStandings;
    setKnockoutTeams({
      Q1_1: st.A[0]?.team,
      Q1_2: st.B[1]?.team,
      Q2_1: st.C[0]?.team,
      Q2_2: st.D[1]?.team,
      Q3_1: st.B[0]?.team,
      Q3_2: st.A[1]?.team,
      Q4_1: st.D[0]?.team,
      Q4_2: st.C[1]?.team,
    });
    setKnockoutStarted(true);
    setActiveTab("knockout");
  };

  const bracketTree = useMemo(() => {
    if (!knockoutStarted) return null;
    const getP = (key: string) => knockoutTeams[key] || `TBD`;
    const buildM = (
      id: string,
      p1: any,
      p2: any,
      tag: string,
      isFinal = false
    ) => {
      const s = knockoutScores[id] || {};
      return {
        id,
        t1: p1,
        t2: p2,
        score1: s.s1,
        score2: s.s2,
        scorers1: s.scorers1,
        scorers2: s.scorers2,
        yellow1: s.yellow1,
        red1: s.red1,
        yellow2: s.yellow2,
        red2: s.red2,
        tag,
        isFinal,
      };
    };
    const getWinner = (m: any) => {
      if (
        m.score1 === undefined ||
        m.score1 === "" ||
        m.score2 === undefined ||
        m.score2 === ""
      )
        return null;
      if (m.score1 > m.score2) return m.t1;
      if (m.score2 > m.score1) return m.t2;
      return null;
    };
    const Q = [
      buildM("Q1", getP("Q1_1"), getP("Q1_2"), "1º A x 2º B"),
      buildM("Q2", getP("Q2_1"), getP("Q2_2"), "1º C x 2º D"),
      buildM("Q3", getP("Q3_1"), getP("Q3_2"), "1º B x 2º A"),
      buildM("Q4", getP("Q4_1"), getP("Q4_2"), "1º D x 2º C"),
    ];
    const S = [
      buildM(
        "S1",
        getWinner(Q[0]) || "Venc. Q1",
        getWinner(Q[1]) || "Venc. Q2",
        "Semifinal 1"
      ),
      buildM(
        "S2",
        getWinner(Q[2]) || "Venc. Q3",
        getWinner(Q[3]) || "Venc. Q4",
        "Semifinal 2"
      ),
    ];
    const F = buildM(
      "F1",
      getWinner(S[0]) || "Venc. S1",
      getWinner(S[1]) || "Venc. S2",
      "Grande Final",
      true
    );
    return {
      Q,
      S,
      F,
      tree: {
        match: F,
        children: [
          { match: S[0], children: [{ match: Q[0] }, { match: Q[1] }] },
          { match: S[1], children: [{ match: Q[2] }, { match: Q[3] }] },
        ],
      },
    };
  }, [knockoutStarted, knockoutTeams, knockoutScores]);

  const topScorers = useMemo(() => {
    if (phase !== "tournament") return [];
    const playerGoals: any = {};
    const addGoals = (scorersMap: any) => {
      if (scorersMap)
        Object.entries(scorersMap).forEach(([pId, goals]: any) => {
          playerGoals[pId] = (playerGoals[pId] || 0) + goals;
        });
    };
    matches.forEach((m: any) => {
      addGoals(m.scorers1);
      addGoals(m.scorers2);
    });
    Object.values(knockoutScores).forEach((m: any) => {
      addGoals(m.scorers1);
      addGoals(m.scorers2);
    });
    const result: any[] = [];
    Object.entries(playerGoals).forEach(([pId, goals]: any) => {
      if (goals > 0) {
        for (const t of teams) {
          const player = t.players?.find((pl: any) => pl.id === pId);
          if (player) {
            result.push({
              id: pId,
              name: player.name,
              number: player.number,
              team: t,
              goals: goals,
            });
            break;
          }
        }
      }
    });
    return result.sort((a: any, b: any) => b.goals - a.goals);
  }, [matches, knockoutScores, phase, teams]);

  const clearAll = () =>
    setConfirmDialog({
      title: "Encerrar Campeonato",
      message: "Esta ação apagará todos os resultados e histórico. Continuar?",
      onConfirm: () => {
        setPhase("setup");
        setTeams(defaultTeams);
        setGroups({});
        setMatches([]);
        setKnockoutStarted(false);
        setKnockoutTeams({});
        setKnockoutScores({});
        setHistory([]);
        localStorage.clear();
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });

  const GlobalStyles = () => (
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap'); .font-oswald { font-family: 'Oswald', sans-serif; } .custom-scrollbar::-webkit-scrollbar { width: 0px; height: 0px; display: none; } .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } @media print { @page { margin: 0; } body { padding: 1.5cm; background: white !important; } .avoid-page-break { page-break-inside: avoid; } }`}</style>
  );

  // MODAIS E CARREGAMENTO
  if (hasFirebase && !cloudReady && !offlineFallback) {
    return (
      <div className="min-h-screen bg-[#000] text-white flex flex-col items-center justify-center p-6 text-center font-sans translate-no">
        <GlobalStyles />
        <div className="flex flex-col items-center animate-pulse">
          <RefreshCw size={32} className="text-zinc-500 animate-spin mb-4" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Carregando...
          </h2>
        </div>
      </div>
    );
  }

  const getWinner = () => {
    if (!isTournamentEnded || !bracketTree?.F) return null;
    const m = bracketTree.F;
    const s1 = parseInt(knockoutScores[m.id].s1);
    const s2 = parseInt(knockoutScores[m.id].s2);
    if (s1 > s2) return m.t1;
    if (s2 > s1) return m.t2;
    return m.t1;
  };

  const bgApp = "bg-[#000]";
  const textMain = "text-white";

  // TELA PRINCIPAL (APP)
  return (
    <div
      className={`min-h-screen ${bgApp} ${textMain} p-2 md:p-8 font-sans translate-no print:bg-white print:text-black print:p-0 w-full overflow-x-hidden`}
    >
      <GlobalStyles />
      {confirmDialog && <ConfirmModal {...confirmDialog} />}
      {confirmDialog && <ConfirmModal {...confirmDialog} />}
      {alertDialog && (
        <AlertModal {...alertDialog} onClose={() => setAlertDialog(null)} />
      )}
      {showImportModal && (
        <ImportDataModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportText}
        />
      )}
      {editingTeam && (
        <TeamEditorModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onSave={(u: any) => {
            setTeams(teams.map((t: any) => (t.id === u.id ? u : t)));
            setEditingTeam(null);
          }}
        />
      )}
      {showWorldCupTeams && (
        <WorldCupTeamsModal onClose={() => setShowWorldCupTeams(false)} />
      )}

      {editingScorersMatch && isAdmin && (
        <MatchStatsModal
          match={editingScorersMatch}
          onClose={() => setEditingScorersMatch(null)}
          onSave={(stats: any) => {
            if (editingScorersMatch.group)
              saveMatchStats(editingScorersMatch.id, stats);
            else saveKoStats(editingScorersMatch.id, stats);
          }}
        />
      )}
      {viewingMatchDetails && (
        <MatchDetailsViewModal
          match={viewingMatchDetails}
          onClose={() => setViewingMatchDetails(null)}
        />
      )}

      {/* HEADER PRINCIPAL OTIMIZADO */}
      <div className="max-w-7xl mx-auto relative z-10 w-full">
        {phase === "tournament" ? (
          <div className="flex flex-col items-center gap-4 mb-6 md:mb-8 border-b border-zinc-900 pb-6 print:hidden w-full relative">
            <div className="absolute top-0 right-2 md:right-4 flex items-center gap-3 md:gap-4 z-20"></div>

            <div className="flex items-center justify-center gap-3 md:gap-4 mt-6 md:mt-2 px-8 w-full max-w-xl mx-auto">
              <CustomLogo size="small" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-oswald uppercase tracking-wider text-zinc-100">
                    Kings League Brandão
                  </h1>
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isTournamentEnded
                        ? "bg-zinc-600"
                        : "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                    }`}
                  ></div>
                </div>
                {isTournamentEnded && (
                  <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">
                    Competição Encerrada
                  </p>
                )}

                {isAdmin && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={handleUndo}
                      disabled={history.length === 0}
                      className={`px-3 py-1.5 rounded-full border text-[8px] md:text-[9px] uppercase font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg backdrop-blur-md ${
                        history.length > 0
                          ? "bg-black/50 border-zinc-700/50 text-zinc-300 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-600"
                          : "bg-black/20 border-zinc-800/50 text-zinc-700 cursor-not-allowed"
                      }`}
                    >
                      <Undo2 size={10} /> Desfazer
                    </button>
                    {(activeTab === "groups" || activeTab === "knockout") && (
                      <button
                        onClick={handleSimulatePhase}
                        className="px-3 py-1.5 rounded-full border border-zinc-700/50 bg-black/50 backdrop-blur-md text-zinc-300 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-600 text-[8px] md:text-[9px] uppercase font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg"
                      >
                        <Wand2 size={10} /> Simular Resultados
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ABAS COM GLASS EFFECT */}
            <div className="w-full overflow-x-auto custom-scrollbar mt-4 md:mt-6 pb-4">
              <div className="flex items-center gap-3 min-w-max px-4 mx-auto w-fit">
                <TabBtn
                  id="groups"
                  active={activeTab}
                  onClick={setActiveTab}
                  label="Grupos"
                />
                <TabBtn
                  id="general"
                  active={activeTab}
                  onClick={setActiveTab}
                  icon={ListOrdered}
                  label="Classificação Geral"
                />
                <TabBtn
                  id="knockout"
                  active={activeTab}
                  onClick={setActiveTab}
                  icon={Swords}
                  label="Mata-Mata"
                />
                <TabBtn
                  id="scorers"
                  active={activeTab}
                  onClick={setActiveTab}
                  icon={SoccerIcon}
                  label="Artilharia"
                />
                <TabBtn
                  id="summary"
                  active={activeTab}
                  onClick={setActiveTab}
                  icon={ClipboardList}
                  label="Súmula"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full relative z-10 mb-8 mt-4 flex justify-end px-4 gap-4">
            {hasFirebase && !offlineFallback && cloudReady ? (
              <Cloud size={18} className="text-green-500" />
            ) : (
              <CloudOff size={18} className="text-zinc-600" />
            )}
          </div>
        )}

        {/* CAMPEÃO FIXO NO TOPO */}
        {isTournamentEnded && phase === "tournament" && (
          <ChampionBanner winner={getWinner()} />
        )}

        {swappingTeam && activeTab === "groups" && isAdmin && (
          <div className="w-full mb-6 bg-yellow-500/10 text-yellow-500 p-3 text-center text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl border border-yellow-500/30 animate-pulse flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
            <span className="flex items-center gap-2">
              <RefreshCw size={14} /> Selecione outro time no lápis para trocar
              com:{" "}
            </span>
            <div className="flex items-center gap-2">
              <TeamBadge name={swappingTeam.team.name} className="w-4 h-4" />{" "}
              {swappingTeam.team.name}
            </div>
            <button
              onClick={() => setSwappingTeam(null)}
              className="md:ml-2 bg-yellow-500 text-black px-4 py-1 rounded hover:bg-yellow-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* --- SETUP (PARA TODOS) --- */}
        {phase === "setup" && (
          <div className="max-w-6xl mx-auto w-full relative z-10 px-2 md:px-0">
            <div className="mb-10 text-center">
              <CustomLogo />
            </div>
            <div
              onClick={() => setShowWorldCupTeams(true)}
              className="w-full max-w-2xl mx-auto mb-10 bg-[#0a0a0a] border border-zinc-800 rounded-xl p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Globe size={24} className="text-zinc-400" />
                <div className="font-bold tracking-widest text-base uppercase font-oswald flex items-center gap-1.5">
                  <span className="text-zinc-100">VER AS</span>
                  <span className="text-orange-500">48 SELEÇÕES</span>
                </div>
              </div>
              <Eye size={22} className="text-zinc-500" />
            </div>
            <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-4 md:p-10 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-zinc-800 pb-4 md:pb-6 gap-4">
                <h2 className="text-xl md:text-2xl font-oswald uppercase tracking-wider flex items-center gap-3 text-white">
                  <Users size={24} className="text-zinc-400" /> Participantes{" "}
                  <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs md:text-sm ml-2">
                    ({teams.filter((t: any) => t.name.trim() !== "").length}/
                    {TOTAL_TEAMS})
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {teams.map((t: any, i: any) => (
                  <div
                    key={t.id}
                    className="flex flex-col bg-[#050505] border border-zinc-800 rounded-xl p-4 md:p-5 relative"
                  >
                    <span className="absolute -top-3 left-4 bg-zinc-900 px-3 py-0.5 text-[10px] text-zinc-400 font-black uppercase tracking-widest border border-zinc-700/50 rounded-md">
                      Time {i + 1}
                    </span>
                    <div className="absolute top-4 right-4 pointer-events-none">
                      <TeamBadge
                        name={t.name}
                        className="w-8 h-6 text-[10px]"
                      />
                    </div>
                    <input
                      type="text"
                      value={t.name}
                      readOnly={!isAdmin}
                      onChange={(e) => {
                        const n = [...teams];
                        n[i].name = e.target.value;
                        setTeams(n);
                      }}
                      className={`bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 md:py-3 text-xs md:text-sm font-bold text-white outline-none w-full uppercase mb-4 md:mb-5 mt-3 transition-all ${
                        isAdmin
                          ? "focus:border-white cursor-text"
                          : "cursor-default select-none"
                      }`}
                      placeholder="NOME DO TIME"
                    />
                    {isAdmin && (
                      <button
                        onClick={() => setEditingTeam(t)}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-[10px] md:text-xs uppercase py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                      >
                        <UserPlus size={14} /> Editar Elenco{" "}
                        <span className="bg-black px-2 py-0.5 rounded ml-1">
                          {t.players?.length || 0}
                        </span>
                      </button>
                    )}
                    {!isAdmin && t.players?.length > 0 && (
                      <div className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-500 font-bold text-[10px] md:text-xs uppercase py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2">
                        <Users size={14} /> {t.players.length} Jogadores
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isAdmin ? (
                <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full md:w-auto">
                    <button
                      onClick={clearTeamsInputs}
                      className="text-zinc-400 hover:text-white text-[10px] md:text-xs font-bold uppercase py-3 md:py-3.5 px-4 md:px-5 border border-zinc-800 hover:bg-zinc-900 rounded-xl transition-all w-full md:w-auto flex items-center justify-center gap-2"
                    >
                      Limpar
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] md:text-xs font-bold uppercase py-3 md:py-3.5 px-4 md:px-5 border border-zinc-700 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <ClipboardPaste size={14} className="text-zinc-300" />{" "}
                      Colar Dados
                    </button>
                    <button
                      onClick={fillTestData}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] md:text-xs font-bold uppercase py-3 md:py-3.5 px-4 md:px-5 border border-zinc-700 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <Zap size={14} className="text-zinc-300" /> Auto-Preencher
                    </button>
                  </div>
                  <button
                    onClick={performDraw}
                    className="bg-white text-black hover:bg-zinc-200 font-black uppercase py-3 md:py-4 px-8 md:px-12 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all text-sm w-full md:w-auto"
                  >
                    <Dices size={20} /> Sortear Grupos
                  </button>
                </div>
              ) : (
                <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-zinc-800 flex justify-center items-center">
                  <div className="flex items-center gap-3 bg-zinc-900 px-6 py-3 rounded-full border border-zinc-800">
                    <Loader2 size={16} className="text-zinc-500 animate-spin" />
                    <span className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                      Aguardando o administrador sortear os grupos...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- FASE DE SORTEIO (PARA TODOS) --- */}
        {phase === "draw" && (
          <div className="max-w-5xl mx-auto relative z-10 px-2 md:px-0">
            <div className="mb-10 text-center">
              <CustomLogo />
            </div>
            <div className="bg-[#09090b] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-zinc-900 p-4 md:p-6 border-b border-zinc-800 text-center">
                <h2 className="font-oswald text-xl md:text-2xl uppercase tracking-[0.15em] text-white">
                  Sorteio dos Grupos
                </h2>
              </div>
              <div className="p-4 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 bg-[#050505]">
                {GROUPS_KEYS.map((g) => (
                  <div
                    key={g}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg"
                  >
                    <div className="bg-white text-black text-center py-2 md:py-3 font-oswald uppercase tracking-widest text-sm md:text-lg">
                      Grupo {g}
                    </div>
                    <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                      {groups[g]?.map((t: any) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-2 md:gap-3 bg-black p-2 md:p-3 rounded-xl border border-zinc-800"
                        >
                          <TeamBadge
                            name={t.name}
                            className="w-6 h-6 md:w-8 md:h-8 text-[10px] md:text-xs rounded shadow-sm"
                          />
                          <span className="font-bold text-sm uppercase truncate text-zinc-200">
                            {t.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {isAdmin ? (
                <div className="p-4 md:p-8 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    onClick={() => setPhase("setup")}
                    className="w-full sm:w-auto text-zinc-400 hover:text-white font-bold uppercase py-2 px-6 rounded-full border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center gap-2 text-[10px] md:text-xs transition-all"
                  >
                    <ArrowLeft size={14} /> Voltar
                  </button>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={performDraw}
                      className="w-full sm:w-auto text-zinc-300 hover:text-white font-black uppercase py-2 px-6 rounded-full border border-zinc-700/50 bg-black/50 backdrop-blur-md hover:bg-zinc-800/80 hover:border-zinc-600 flex items-center justify-center gap-2 text-[10px] md:text-xs transition-all duration-300 shadow-lg"
                    >
                      <RefreshCw size={14} /> Refazer
                    </button>
                    <button
                      onClick={generateTournament}
                      className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-black uppercase py-3 px-8 rounded-xl flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm transition-all"
                    >
                      <Trophy size={18} /> Iniciar Torneio
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 md:p-8 bg-zinc-900 border-t border-zinc-800 flex justify-center items-center">
                  <div className="flex items-center gap-3 bg-black px-6 py-3 rounded-full border border-zinc-800">
                    <Loader2 size={16} className="text-zinc-500 animate-spin" />
                    <span className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                      Aguardando a geração dos grupos...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TORNEIO: GRUPOS --- */}
        {phase === "tournament" && activeTab === "groups" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {GROUPS_KEYS.map((g) => {
              if (!groups[g]) return null;
              return (
                <div
                  key={g}
                  className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-zinc-800 avoid-page-break"
                >
                  <div className="p-3 md:p-4 border-b border-zinc-800 flex items-center gap-3">
                    <span className="bg-white text-black w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-sm text-[10px] md:text-xs font-sans font-black">
                      {g}
                    </span>
                    <h2 className="font-oswald text-base md:text-lg uppercase tracking-widest text-white">
                      GRUPO {g}
                    </h2>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-xs text-left min-w-[280px]">
                      <thead className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800 bg-[#050505]">
                        <tr>
                          <th className="px-2 md:px-3 py-2 font-bold">Pos</th>
                          <th className="px-2 md:px-3 py-2 font-bold">Time</th>
                          <th className="px-1 md:px-2 py-2 text-center font-black">
                            PTS
                          </th>
                          <th className="px-1 md:px-2 py-2 text-center">SG</th>
                          {isAdmin && (
                            <th className="px-1 py-2 text-center print:hidden"></th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-[#0a0a0a]">
                        {groupStandings[g]?.map((st: any, idx: any) => {
                          const isTop2 = idx < 2;
                          const isLast = idx >= 2;
                          return (
                            <tr
                              key={st.team.id}
                              className={`border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors ${
                                isTop2 ? "border-l-4 border-l-green-500" : ""
                              } ${
                                isLast
                                  ? "border-l-4 border-l-red-500/70 bg-zinc-950/80 opacity-40 grayscale"
                                  : ""
                              }`}
                            >
                              <td className="px-2 md:px-3 py-2 md:py-3 font-bold text-zinc-500 text-[9px] md:text-[10px]">
                                {idx + 1}º
                              </td>
                              <td className="px-2 md:px-3 py-2 md:py-3">
                                <div className="flex items-center gap-2">
                                  <TeamBadge
                                    name={st.team.name}
                                    className="w-4 h-4 md:w-5 md:h-5 text-[8px]"
                                  />
                                  <span className="font-bold truncate max-w-[80px] md:max-w-[100px] uppercase text-[10px] md:text-xs text-white">
                                    {st.team.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-1 md:px-2 py-2 md:py-3 text-center font-black text-[10px] md:text-sm text-white">
                                {st.pts}
                              </td>
                              <td className="px-1 md:px-2 py-2 md:py-3 text-center font-bold text-zinc-500 text-[10px] md:text-xs">
                                {st.sg}
                              </td>
                              {isAdmin && (
                                <td className="px-1 py-2 md:py-3 text-center print:hidden">
                                  <div className="flex items-center justify-end gap-1.5 md:gap-2 pr-1 md:pr-2">
                                    <button
                                      onClick={() =>
                                        handleSwapClick(st.team, g)
                                      }
                                      className={`${
                                        swappingTeam?.team.id === st.team.id
                                          ? "text-yellow-500 animate-pulse scale-110"
                                          : "text-zinc-600 hover:text-yellow-400"
                                      }`}
                                      title="Trocar Time de Grupo"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {!isAdmin && (
                    <button
                      onClick={() => toggleGroup(g)}
                      className="w-full py-2.5 md:py-3 flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white border-b border-zinc-800"
                    >
                      {expandedGroups[g] ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )}{" "}
                      {expandedGroups[g]
                        ? "Ocultar Resultados"
                        : "Ver Resultados"}
                    </button>
                  )}

                  <div
                    className={`transition-all duration-500 overflow-hidden ${
                      !isAdmin && !expandedGroups[g]
                        ? "max-h-0 opacity-0"
                        : "max-h-[1000px] opacity-100"
                    }`}
                  >
                    <div className="p-3 md:p-4 bg-[#0a0a0a]">
                      <div className="space-y-2 md:space-y-3">
                        {matches
                          .filter((m: any) => m.group === g)
                          .map((match: any) => {
                            const isPlayed =
                              match.score1 !== "" && match.score2 !== "";
                            return (
                              <div
                                key={match.id}
                                className="flex flex-col bg-black border border-zinc-800 rounded-xl overflow-hidden"
                              >
                                <div className="flex items-center justify-between p-2 md:p-3">
                                  <span className="flex-1 text-[8px] md:text-[9px] font-black uppercase text-zinc-300 truncate text-right pr-1.5 md:pr-2">
                                    {match.t1.name}
                                  </span>
                                  <div className="flex items-center justify-center shrink-0 gap-1 md:gap-1.5">
                                    {isAdmin ? (
                                      <>
                                        <input
                                          type="number"
                                          min="0"
                                          value={match.score1}
                                          onFocus={safePushHistory}
                                          onChange={(e) =>
                                            updateMatchScore(
                                              match.id,
                                              "score1",
                                              e.target.value
                                            )
                                          }
                                          className="w-7 py-1 text-center bg-zinc-800 rounded-sm text-sm font-black text-white outline-none focus:border-white"
                                        />
                                        <span className="text-zinc-600 text-[8px] md:text-[10px] font-black px-0.5 md:px-1">
                                          X
                                        </span>
                                        <input
                                          type="number"
                                          min="0"
                                          value={match.score2}
                                          onFocus={safePushHistory}
                                          onChange={(e) =>
                                            updateMatchScore(
                                              match.id,
                                              "score2",
                                              e.target.value
                                            )
                                          }
                                          className="w-7 py-1 text-center bg-zinc-800 rounded-sm text-sm font-black text-white outline-none focus:border-white"
                                        />
                                      </>
                                    ) : (
                                      <>
                                        <span className="w-6 py-0.5 md:w-7 md:py-1 text-center bg-zinc-800 rounded-sm text-xs md:text-sm font-black text-white">
                                          {match.score1 !== ""
                                            ? match.score1
                                            : "-"}
                                        </span>
                                        <span className="text-zinc-600 text-[8px] md:text-[10px] font-black px-0.5 md:px-1">
                                          X
                                        </span>
                                        <span className="w-6 py-0.5 md:w-7 md:py-1 text-center bg-zinc-800 rounded-sm text-xs md:text-sm font-black text-white">
                                          {match.score2 !== ""
                                            ? match.score2
                                            : "-"}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <span className="flex-1 text-[8px] md:text-[9px] font-black uppercase text-zinc-300 truncate text-left pl-1.5 md:pl-2">
                                    {match.t2.name}
                                  </span>
                                </div>
                                {isPlayed &&
                                  (isAdmin ? (
                                    <button
                                      onClick={() =>
                                        setEditingScorersMatch(match)
                                      }
                                      className="w-full py-1.5 md:py-2 bg-zinc-900/30 hover:bg-zinc-800 border-t border-zinc-800 text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                      <ListOrdered
                                        size={10}
                                        className="md:w-3 md:h-3"
                                      />{" "}
                                      Gols e Cartões
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        setViewingMatchDetails({
                                          ...match,
                                          tag: `Grupo ${g}`,
                                        })
                                      }
                                      className="w-full py-1.5 md:py-2 bg-zinc-900/30 hover:bg-zinc-800 border-t border-zinc-800 text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                      <FileText
                                        size={10}
                                        className="md:w-3 md:h-3"
                                      />{" "}
                                      Ver Detalhes
                                    </button>
                                  ))}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- TORNEIO: CLASSIFICAÇÃO GERAL --- */}
        {phase === "tournament" && activeTab === "general" && (
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden max-w-5xl mx-auto">
            <div className="p-4 md:p-6 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900">
              <div>
                <h2 className="font-oswald text-lg md:text-xl uppercase flex items-center gap-2 tracking-wider text-white">
                  <ListOrdered size={18} className="text-zinc-400" />{" "}
                  Classificação Geral
                </h2>
                <p className="text-zinc-400 text-[10px] md:text-xs mt-1 uppercase">
                  Top 2 de cada grupo avança.
                </p>
              </div>
              {!knockoutStarted && isAdmin && (
                <button
                  onClick={generateKnockout}
                  className="bg-white text-black font-black uppercase py-2 md:py-3 px-4 md:px-6 rounded-xl flex items-center gap-2 text-[10px] md:text-xs hover:scale-105 transition-transform"
                >
                  <Swords size={14} /> Gerar Mata-Mata
                </button>
              )}
            </div>
            <div className="overflow-x-auto p-2 md:p-4 bg-[#050505] custom-scrollbar">
              <table className="w-full text-xs md:text-sm text-left border-separate border-spacing-y-1 min-w-[500px]">
                <thead className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500">
                  <tr>
                    <th className="px-2 md:px-4 pb-2">Pos</th>
                    <th className="px-2 md:px-4 pb-2">Grp</th>
                    <th className="px-2 md:px-4 pb-2">Time</th>
                    <th className="px-2 md:px-3 pb-2 text-center text-white">
                      PTS
                    </th>
                    <th className="px-2 md:px-3 pb-2 text-center">SG</th>
                    <th className="px-2 md:px-3 pb-2 text-center">V</th>
                    <th className="px-2 md:px-3 pb-2 text-center">GF</th>
                  </tr>
                </thead>
                <tbody>
                  {generalStandings.map((st: any, idx: any) => {
                    const isCl =
                      groupStandings[st.group].findIndex(
                        (s: any) => s.team.id === st.team.id
                      ) < 2;
                    return (
                      <tr
                        key={st.team.id}
                        className={`avoid-page-break ${
                          isCl ? "bg-zinc-900" : "bg-black opacity-50"
                        }`}
                      >
                        <td className="px-2 md:px-4 py-2 md:py-3 font-bold flex items-center gap-1.5 md:gap-2 rounded-l-lg">
                          <span
                            className={`w-4 md:w-5 text-center text-[10px] md:text-sm ${
                              isCl ? "text-white" : "text-zinc-600"
                            }`}
                          >
                            {idx + 1}º
                          </span>
                          {isCl ? (
                            <CheckCircle
                              size={12}
                              className="text-green-500 md:w-3.5 md:h-3.5"
                            />
                          ) : (
                            <XCircle
                              size={12}
                              className="text-zinc-600 md:w-3.5 md:h-3.5"
                            />
                          )}
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3 font-bold text-zinc-400 text-[10px] md:text-sm">
                          {st.group}
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3 font-black uppercase text-white">
                          <TeamBadge
                            name={st.team.name}
                            className="w-4 h-4 md:w-6 md:h-6 text-[8px] md:text-[10px]"
                          />{" "}
                          <span className="text-[10px] md:text-sm">
                            {st.team.name}
                          </span>
                        </td>
                        <td className="px-2 md:px-3 py-2 md:py-3 text-center font-black bg-zinc-800 text-white text-[10px] md:text-sm">
                          {st.pts}
                        </td>
                        <td className="px-2 md:px-3 py-2 md:py-3 text-center font-bold text-zinc-400 text-[10px] md:text-sm">
                          {st.sg}
                        </td>
                        <td className="px-2 md:px-3 py-2 md:py-3 text-center text-zinc-400 text-[10px] md:text-sm">
                          {st.v}
                        </td>
                        <td className="px-2 md:px-3 py-2 md:py-3 text-center rounded-r-lg text-zinc-400 text-[10px] md:text-sm">
                          {st.gf}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TORNEIO: MATA-MATA --- */}
        {phase === "tournament" && activeTab === "knockout" && (
          <div className="w-full">
            {!knockoutStarted ? (
              <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-8 md:p-12 text-center max-w-xl mx-auto">
                <Shield className="text-zinc-600 mx-auto mb-4 md:mb-6 w-10 h-10 md:w-14 md:h-14" />
                <h2 className="font-oswald text-lg md:text-2xl mb-2 uppercase tracking-widest text-white">
                  Mata-Mata Indisponível
                </h2>
                <p className="text-zinc-400 mb-6 md:mb-8 text-xs md:text-sm">
                  Acesse a aba Geral para gerar a chave de torneio.
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab("general")}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 md:py-3 px-6 md:px-8 rounded-xl text-[10px] md:text-xs font-bold uppercase inline-flex items-center gap-2 transition-colors"
                  >
                    Ir para Classificação <ChevronRight size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto pb-8 pt-4 flex justify-start md:justify-center custom-scrollbar w-full">
                <div className="min-w-max px-4">
                  <div className="flex mb-6 md:mb-8 border-b border-zinc-800 pb-2 md:pb-3 justify-end">
                    {["Quartas de Final", "Meias-Finais"].map((t) => (
                      <div
                        key={t}
                        className="w-48 md:w-64 pr-6 md:pr-10 box-content text-center font-oswald text-zinc-500 uppercase text-[9px] md:text-xs tracking-[0.2em]"
                      >
                        {t}
                      </div>
                    ))}
                    <div className="w-48 md:w-64 text-center font-oswald uppercase text-[9px] md:text-xs tracking-[0.2em] text-white font-black">
                      Grande Final
                    </div>
                  </div>
                  <div className="pb-8 md:pb-12">
                    {(() => {
                      const KnockoutMatchCard = ({ match }: any) => {
                        if (!match) return null;
                        const isT1TBD = typeof match.t1 === "string";
                        const isT2TBD = typeof match.t2 === "string";
                        const isTBD = isT1TBD || isT2TBD;
                        const score = knockoutScores[match.id] || {
                          s1: "",
                          s2: "",
                        };

                        const isPlayed =
                          score.s1 !== "" &&
                          score.s2 !== "" &&
                          score.s1 !== undefined &&
                          score.s2 !== undefined;
                        const s1Num = parseInt(score.s1);
                        const s2Num = parseInt(score.s2);
                        const t1Lost = isPlayed && s1Num < s2Num;
                        const t2Lost = isPlayed && s2Num < s1Num;

                        return (
                          <div
                            className={`bg-[#000] border-2 ${
                              match.isFinal
                                ? "border-zinc-400 bg-zinc-900 shadow-xl"
                                : "border-zinc-800"
                            } rounded-xl flex flex-col w-48 md:w-64 relative z-10 avoid-page-break`}
                          >
                            <div className="p-3 md:p-4">
                              <span className="absolute -top-2.5 md:-top-3 left-3 md:left-4 bg-zinc-900 border-zinc-600 text-[8px] md:text-[9px] px-1.5 md:px-2 py-0.5 border rounded shadow-sm font-bold uppercase tracking-widest text-zinc-300">
                                {match.tag}
                              </span>
                              <div className="mt-3 space-y-3">
                                <div
                                  className={`flex items-center justify-between gap-1 md:gap-2 transition-all ${
                                    t1Lost ? "opacity-40 grayscale" : ""
                                  }`}
                                >
                                  {isT1TBD ? (
                                    <span className="text-[10px] md:text-xs font-bold truncate text-zinc-500">
                                      {match.t1}
                                    </span>
                                  ) : (
                                    <div className="flex items-center gap-1.5 md:gap-2">
                                      <TeamBadge
                                        name={match.t1.name}
                                        className="w-4 h-4 md:w-5 md:h-5 text-[7px] md:text-[9px]"
                                      />
                                      <span className="text-[10px] md:text-xs font-black truncate uppercase text-white">
                                        {match.t1.name}
                                      </span>
                                    </div>
                                  )}
                                  {!isT1TBD &&
                                    (isAdmin ? (
                                      <input
                                        type="number"
                                        min="0"
                                        onFocus={safePushHistory}
                                        value={score.s1}
                                        onChange={(e) =>
                                          updateKoScore(
                                            match.id,
                                            "s1",
                                            e.target.value
                                          )
                                        }
                                        className="w-7 md:w-9 py-0.5 md:py-1 text-center bg-zinc-800 border border-zinc-700 rounded-sm text-[10px] md:text-sm font-black text-white outline-none focus:border-white"
                                      />
                                    ) : (
                                      <span className="w-7 md:w-9 py-0.5 md:py-1 text-center bg-zinc-800 rounded-sm text-[10px] md:text-sm font-black text-white">
                                        {score.s1 !== "" &&
                                        score.s1 !== undefined
                                          ? score.s1
                                          : "-"}
                                      </span>
                                    ))}
                                </div>
                                <div
                                  className={`flex items-center justify-between gap-1 md:gap-2 transition-all ${
                                    t2Lost ? "opacity-40 grayscale" : ""
                                  }`}
                                >
                                  {isT2TBD ? (
                                    <span className="text-[10px] md:text-xs font-bold truncate text-zinc-500">
                                      {match.t2}
                                    </span>
                                  ) : (
                                    <div className="flex items-center gap-1.5 md:gap-2">
                                      <TeamBadge
                                        name={match.t2.name}
                                        className="w-4 h-4 md:w-5 md:h-5 text-[7px] md:text-[9px]"
                                      />
                                      <span className="text-[10px] md:text-xs font-black truncate uppercase text-white">
                                        {match.t2.name}
                                      </span>
                                    </div>
                                  )}
                                  {!isT2TBD &&
                                    (isAdmin ? (
                                      <input
                                        type="number"
                                        min="0"
                                        onFocus={safePushHistory}
                                        value={score.s2}
                                        onChange={(e) =>
                                          updateKoScore(
                                            match.id,
                                            "s2",
                                            e.target.value
                                          )
                                        }
                                        className="w-7 md:w-9 py-0.5 md:py-1 text-center bg-zinc-800 border border-zinc-700 rounded-sm text-[10px] md:text-sm font-black text-white outline-none focus:border-white"
                                      />
                                    ) : (
                                      <span className="w-7 md:w-9 py-0.5 md:py-1 text-center bg-zinc-800 rounded-sm text-[10px] md:text-sm font-black text-white">
                                        {score.s2 !== "" &&
                                        score.s2 !== undefined
                                          ? score.s2
                                          : "-"}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            </div>
                            {isPlayed &&
                              !isTBD &&
                              (isAdmin ? (
                                <button
                                  onClick={() =>
                                    setEditingScorersMatch({
                                      ...match,
                                      score1: score.s1,
                                      score2: score.s2,
                                      scorers1: score.scorers1,
                                      scorers2: score.scorers2,
                                      yellow1: score.yellow1,
                                      red1: score.red1,
                                      yellow2: score.yellow2,
                                      red2: score.red2,
                                    })
                                  }
                                  className="w-full py-1.5 md:py-2 bg-zinc-900/30 hover:bg-zinc-800 border-t border-zinc-800 text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors rounded-b-xl"
                                >
                                  <ListOrdered
                                    size={10}
                                    className="md:w-3 md:h-3"
                                  />{" "}
                                  Gols
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    setViewingMatchDetails({
                                      ...match,
                                      score1: score.s1,
                                      score2: score.s2,
                                      scorers1: score.scorers1,
                                      scorers2: score.scorers2,
                                      yellow1: score.yellow1,
                                      red1: score.red1,
                                      yellow2: score.yellow2,
                                      red2: score.red2,
                                    })
                                  }
                                  className="w-full py-1.5 md:py-2 bg-zinc-900/30 hover:bg-zinc-800 border-t border-zinc-800 text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors rounded-b-xl"
                                >
                                  <FileText
                                    size={10}
                                    className="md:w-3 md:h-3"
                                  />{" "}
                                  Detalhes
                                </button>
                              ))}
                          </div>
                        );
                      };

                      const RenderNode = ({ node }: any) => {
                        if (!node) return null;
                        return (
                          <div className="flex items-stretch avoid-page-break">
                            {node.children && (
                              <div className="flex flex-col justify-center">
                                <div className="relative flex-1 flex items-center pr-6 md:pr-10 py-2 md:py-3">
                                  <div className="absolute right-0 top-1/2 bottom-0 w-4 md:w-6 border-r-2 border-t-2 border-zinc-600 rounded-tr-lg"></div>
                                  <RenderNode node={node.children[0]} />
                                </div>
                                <div className="relative flex-1 flex items-center pr-6 md:pr-10 py-2 md:py-3">
                                  <div className="absolute right-0 top-0 bottom-1/2 w-4 md:w-6 border-r-2 border-b-2 border-zinc-600 rounded-br-lg"></div>
                                  <RenderNode node={node.children[1]} />
                                </div>
                              </div>
                            )}
                            <div className="relative flex items-center w-48 md:w-64 shrink-0">
                              {node.children && (
                                <div className="absolute -left-6 md:-left-10 w-6 md:w-10 border-b-2 border-zinc-600"></div>
                              )}
                              <KnockoutMatchCard match={node.match} />
                            </div>
                          </div>
                        );
                      };
                      return <RenderNode node={bracketTree.tree} />;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TORNEIO: ARTILHARIA --- */}
        {phase === "tournament" && activeTab === "scorers" && (
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden max-w-4xl mx-auto">
            <div className="p-4 md:p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <div>
                <h2 className="font-oswald text-lg md:text-xl uppercase flex items-center gap-3 tracking-wider text-white">
                  <SoccerIcon
                    size={20}
                    className="text-zinc-400 md:w-6 md:h-6"
                  />{" "}
                  Artilharia Oficial
                </h2>
              </div>
            </div>
            <div className="p-4 md:p-6 bg-[#050505]">
              {topScorers.length === 0 ? (
                <div className="text-center py-12 md:py-16 flex flex-col items-center opacity-50">
                  <SoccerIcon
                    size={48}
                    className="text-zinc-600 mb-4 md:w-16 md:h-16"
                  />
                  <p className="uppercase font-bold tracking-widest text-[10px] md:text-sm text-white">
                    Nenhum gol registrado
                  </p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {topScorers.map((scorer: any, idx: any) => {
                    const isFirst = idx === 0;
                    return (
                      <div
                        key={scorer.id}
                        className={`flex items-center justify-between p-3 md:p-4 rounded-xl border ${
                          isFirst
                            ? "bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                            : "bg-black border-zinc-800"
                        }`}
                      >
                        <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
                          <div
                            className={`w-5 md:w-8 text-center font-oswald text-base md:text-xl shrink-0 ${
                              isFirst
                                ? "text-yellow-500 font-black"
                                : "text-zinc-500"
                            }`}
                          >
                            {idx + 1}º
                          </div>
                          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                            <TeamBadge
                              name={scorer.team.name}
                              className="w-8 h-8 md:w-12 md:h-12 text-[10px] md:text-sm rounded shadow-md shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`font-black uppercase tracking-wider text-[11px] md:text-sm truncate ${
                                    isFirst ? "text-yellow-500" : "text-white"
                                  }`}
                                >
                                  {scorer.name}
                                </div>
                                {isFirst && (
                                  <span className="bg-yellow-500 text-black text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                                    <Trophy
                                      size={10}
                                      className="hidden md:block"
                                    />{" "}
                                    MVP
                                  </span>
                                )}
                              </div>
                              <div className="text-[8px] md:text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1 truncate">
                                <span className="truncate max-w-[80px] md:max-w-none">
                                  {scorer.team.name}
                                </span>
                                <span className="bg-zinc-900 border border-zinc-700 px-1 md:px-1.5 py-0.5 rounded shrink-0">
                                  Nº {scorer.number || "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border shrink-0 ${
                            isFirst
                              ? "bg-yellow-500 text-black border-yellow-400 shadow-md"
                              : "bg-zinc-900 border-zinc-700"
                          }`}
                        >
                          <span
                            className={`text-lg md:text-2xl font-oswald leading-none ${
                              isFirst ? "text-black" : "text-white"
                            }`}
                          >
                            {scorer.goals}
                          </span>
                          <span
                            className={`text-[8px] md:text-[10px] font-bold uppercase mt-0.5 md:mt-1 ${
                              isFirst ? "text-yellow-900" : "text-zinc-400"
                            }`}
                          >
                            Gols
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TORNEIO: SÚMULA --- */}
        {phase === "tournament" && activeTab === "summary" && (
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden max-w-6xl mx-auto print:border-none print:shadow-none print:bg-white print:p-0">
            <div className="p-4 md:p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 print:hidden">
              <div>
                <h2 className="font-oswald text-lg md:text-xl uppercase flex items-center gap-2 md:gap-3 tracking-wider text-white">
                  <ClipboardList
                    size={18}
                    className="text-zinc-400 md:w-5 md:h-5"
                  />{" "}
                  Súmula Oficial
                </h2>
                <p className="text-zinc-400 text-[10px] md:text-xs mt-1 uppercase">
                  Relatório das partidas.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="bg-white hover:bg-zinc-200 text-black py-2 md:py-2.5 px-3 md:px-5 rounded-xl text-[10px] md:text-xs font-black uppercase inline-flex items-center gap-1.5 md:gap-2 shadow-md transition-colors"
              >
                <Printer size={14} className="md:w-4 md:h-4" />{" "}
                <span className="translate-no hidden sm:inline">
                  Imprimir PDF
                </span>
              </button>
            </div>
            <div className="p-3 md:p-4 border-b border-zinc-800 flex flex-wrap gap-2 md:gap-3 print:hidden justify-center bg-[#050505]">
              <button
                onClick={() => setSummaryPhase("groups")}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-xs font-bold uppercase transition-all border ${
                  summaryPhase === "groups"
                    ? "bg-white text-black"
                    : "border-transparent text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                <span className="translate-no">Grupos</span>
              </button>
              {knockoutStarted && (
                <>
                  <button
                    onClick={() => setSummaryPhase("quartas")}
                    className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-xs font-bold uppercase transition-all border ${
                      summaryPhase === "quartas"
                        ? "bg-white text-black"
                        : "border-transparent text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    <span className="translate-no">Quartas</span>
                  </button>
                  <button
                    onClick={() => setSummaryPhase("semis")}
                    className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-xs font-bold uppercase transition-all border ${
                      summaryPhase === "semis"
                        ? "bg-white text-black"
                        : "border-transparent text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    <span className="translate-no">Semis</span>
                  </button>
                  <button
                    onClick={() => setSummaryPhase("final")}
                    className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-xs font-black uppercase transition-all border ${
                      summaryPhase === "final"
                        ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        : "border-transparent text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    <span className="translate-no">Final</span>
                  </button>
                </>
              )}
            </div>
            <div className="p-4 md:p-8 bg-[#050505]">
              {summaryPhase === "groups" && (
                <div className="grid md:grid-cols-2 gap-6 md:gap-8 print:grid-cols-2">
                  {GROUPS_KEYS.map((g) => (
                    <div
                      key={g}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 avoid-page-break print:border-black print:bg-white"
                    >
                      <h3 className="font-oswald text-lg uppercase tracking-widest mb-4 md:mb-5 flex items-center gap-3 border-b border-zinc-800 pb-2 md:pb-3 print:text-black print:border-black text-white">
                        <span className="bg-white text-black w-7 h-7 flex items-center justify-center rounded font-sans font-black text-[10px] md:text-sm print:border-black">
                          {g}
                        </span>{" "}
                        Grupo {g}
                      </h3>
                      <div className="space-y-3 md:space-y-4">
                        {matches
                          .filter((m: any) => m.group === g)
                          .map((match: any) => {
                            const isPlayed =
                              match.score1 !== "" && match.score2 !== "";
                            return (
                              <div
                                key={match.id}
                                className={`flex flex-col rounded-xl overflow-hidden transition-all avoid-page-break border ${
                                  isPlayed
                                    ? "bg-black border-zinc-600 print:bg-gray-100 print:border-black"
                                    : "bg-zinc-950 border-zinc-800 opacity-60 print:bg-white print:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center justify-between p-3 md:p-4">
                                  <div className="flex-1 flex items-center justify-end gap-1.5 md:gap-2 overflow-hidden">
                                    <span className="text-[10px] md:text-xs font-bold uppercase truncate text-right w-full print:text-black text-white">
                                      {match.t1.name}
                                    </span>
                                    <TeamBadge
                                      name={match.t1.name}
                                      className="w-4 h-4 md:w-5 md:h-5 text-[7px] md:text-[8px] shrink-0"
                                    />
                                  </div>
                                  <div className="px-3 md:px-5 flex items-center gap-2 md:gap-3 font-black py-1 md:py-1.5 rounded-lg border mx-2 md:mx-3 print:bg-white print:text-black print:border-black bg-zinc-900 text-white border-zinc-700 shrink-0">
                                    <span className="text-sm md:text-base">
                                      {isPlayed ? match.score1 : "-"}
                                    </span>
                                    <span className="text-zinc-500 text-[9px] md:text-[10px] print:text-black">
                                      X
                                    </span>
                                    <span className="text-sm md:text-base">
                                      {isPlayed ? match.score2 : "-"}
                                    </span>
                                  </div>
                                  <div className="flex-1 flex items-center justify-start gap-1.5 md:gap-2 overflow-hidden">
                                    <TeamBadge
                                      name={match.t2.name}
                                      className="w-4 h-4 md:w-5 md:h-5 text-[7px] md:text-[8px] shrink-0"
                                    />
                                    <span className="text-[10px] md:text-xs font-bold uppercase truncate text-left w-full print:text-black text-white">
                                      {match.t2.name}
                                    </span>
                                  </div>
                                </div>

                                {/* Golos na Súmula */}
                                {isPlayed && (
                                  <div className="flex w-full mt-1 border-t border-zinc-800/50 pt-2 pb-2 px-2 text-[8px] md:text-[10px] text-zinc-500 bg-zinc-950/30">
                                    <div className="w-1/2 pr-2 text-right">
                                      {getEventStats(
                                        match.t1,
                                        match.scorers1,
                                        match.yellow1,
                                        match.red1
                                      ).map((s: any) => (
                                        <div
                                          key={s.name}
                                          className="flex justify-end items-center gap-1 mt-1"
                                        >
                                          {s.name}{" "}
                                          {s.goals > 0 && (
                                            <SoccerIcon size={8} />
                                          )}{" "}
                                          {s.yellow > 0 && (
                                            <div className="w-1.5 h-2.5 bg-yellow-600 rounded-sm"></div>
                                          )}{" "}
                                          {s.red > 0 && (
                                            <div className="w-1.5 h-2.5 bg-red-600 rounded-sm"></div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="w-1/2 pl-2 text-left border-l border-zinc-800/50">
                                      {getEventStats(
                                        match.t2,
                                        match.scorers2,
                                        match.yellow2,
                                        match.red2
                                      ).map((s: any) => (
                                        <div
                                          key={s.name}
                                          className="flex justify-start items-center gap-1 mt-1"
                                        >
                                          {s.goals > 0 && (
                                            <SoccerIcon size={8} />
                                          )}{" "}
                                          {s.yellow > 0 && (
                                            <div className="w-1.5 h-2.5 bg-yellow-600 rounded-sm"></div>
                                          )}{" "}
                                          {s.red > 0 && (
                                            <div className="w-1.5 h-2.5 bg-red-600 rounded-sm"></div>
                                          )}{" "}
                                          {s.name}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {["quartas", "semis", "final"].includes(summaryPhase) &&
                knockoutStarted && (
                  <div className="grid md:grid-cols-2 gap-6 md:gap-8 print:grid-cols-2">
                    {bracketTree &&
                      (summaryPhase === "quartas"
                        ? bracketTree.Q
                        : summaryPhase === "semis"
                        ? bracketTree.S
                        : [bracketTree.F]
                      ).map((match: any) => {
                        const isPlayed =
                          match.score1 !== "" &&
                          match.score2 !== "" &&
                          match.score1 !== undefined;
                        const isT1TBD = typeof match.t1 === "string";
                        const isT2TBD = typeof match.t2 === "string";
                        const isTBD = isT1TBD || isT2TBD;
                        const score = knockoutScores[match.id] || {
                          s1: "",
                          s2: "",
                        };
                        return (
                          <div
                            key={match.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 avoid-page-break print:border-black print:bg-white"
                          >
                            <h3 className="font-oswald text-base uppercase tracking-widest mb-4 md:mb-5 flex items-center gap-2 border-b border-zinc-800 pb-2 md:pb-3 print:text-black print:border-black text-white">
                              {match.tag}
                            </h3>
                            <div
                              className={`flex flex-col rounded-xl overflow-hidden transition-all avoid-page-break border ${
                                isPlayed
                                  ? "bg-black border-zinc-600 print:bg-gray-100 print:border-black"
                                  : "bg-zinc-950 border-zinc-800 opacity-60 print:bg-white print:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center justify-between p-3 md:p-4">
                                <div className="flex-1 flex items-center justify-end gap-1.5 md:gap-2 overflow-hidden">
                                  <span className="text-[10px] md:text-xs font-bold uppercase truncate text-right w-full print:text-black text-white">
                                    {isT1TBD ? match.t1 : match.t1.name}
                                  </span>
                                  {!isT1TBD && (
                                    <TeamBadge
                                      name={match.t1.name}
                                      className="w-4 h-4 md:w-5 md:h-5 text-[7px] md:text-[8px] shrink-0"
                                    />
                                  )}
                                </div>
                                <div className="px-3 md:px-5 flex items-center gap-2 md:gap-3 font-black py-1 md:py-1.5 rounded-lg border mx-2 md:mx-3 print:bg-white print:text-black print:border-black bg-zinc-900 text-white border-zinc-700 shrink-0">
                                  <span className="text-sm md:text-base">
                                    {isPlayed ? score.s1 : "-"}
                                  </span>
                                  <span className="text-zinc-500 text-[9px] md:text-[10px] print:text-black">
                                    X
                                  </span>
                                  <span className="text-sm md:text-base">
                                    {isPlayed ? score.s2 : "-"}
                                  </span>
                                </div>
                                <div className="flex-1 flex items-center justify-start gap-1.5 md:gap-2 overflow-hidden">
                                  {!isT2TBD && (
                                    <TeamBadge
                                      name={match.t2.name}
                                      className="w-4 h-4 md:w-5 md:h-5 text-[7px] md:text-[8px] shrink-0"
                                    />
                                  )}
                                  <span className="text-[10px] md:text-xs font-bold uppercase truncate text-left w-full print:text-black text-white">
                                    {isTBD ? match.t2 : match.t2.name}
                                  </span>
                                </div>
                              </div>

                              {/* Golos na Súmula (Mata-Mata) */}
                              {isPlayed && !isTBD && (
                                <div className="flex w-full mt-1 border-t border-zinc-800/50 pt-2 pb-2 px-2 text-[8px] md:text-[10px] text-zinc-500 bg-zinc-950/30">
                                  <div className="w-1/2 pr-2 text-right">
                                    {getEventStats(
                                      match.t1,
                                      score.scorers1,
                                      score.yellow1,
                                      score.red1
                                    ).map((s: any) => (
                                      <div
                                        key={s.name}
                                        className="flex justify-end items-center gap-1 mt-1"
                                      >
                                        {s.name}{" "}
                                        {s.goals > 0 && <SoccerIcon size={8} />}{" "}
                                        {s.yellow > 0 && (
                                          <div className="w-1.5 h-2.5 bg-yellow-600 rounded-sm"></div>
                                        )}{" "}
                                        {s.red > 0 && (
                                          <div className="w-1.5 h-2.5 bg-red-600 rounded-sm"></div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="w-1/2 pl-2 text-left border-l border-zinc-800/50">
                                    {getEventStats(
                                      match.t2,
                                      score.scorers2,
                                      score.yellow2,
                                      score.red2
                                    ).map((s: any) => (
                                      <div
                                        key={s.name}
                                        className="flex justify-start items-center gap-1 mt-1"
                                      >
                                        {s.goals > 0 && <SoccerIcon size={8} />}{" "}
                                        {s.yellow > 0 && (
                                          <div className="w-1.5 h-2.5 bg-yellow-600 rounded-sm"></div>
                                        )}{" "}
                                        {s.red > 0 && (
                                          <div className="w-1.5 h-2.5 bg-red-600 rounded-sm"></div>
                                        )}{" "}
                                        {s.name}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="mt-12 md:mt-16 pt-6 md:pt-8 text-center pb-8 md:pb-12 print:hidden relative z-10 px-4">
            <button
              onClick={clearAll}
              className="text-zinc-500 hover:text-red-500 bg-black/40 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 text-[9px] md:text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 mx-auto px-4 md:px-6 py-2.5 md:py-3 rounded-full transition-all w-full sm:w-auto"
            >
              <Trash2 size={12} className="md:w-3.5 md:h-3.5" /> Encerrar e
              Apagar Tudo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
