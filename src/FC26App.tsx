import React, { useState, useEffect, useMemo } from "react";
import {
  Dices,
  Users,
  RefreshCw,
  ArrowLeft,
  Shield,
  Swords,
  ListOrdered,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  ClipboardList,
  Zap,
  Loader2,
  PlaySquare,
  Trophy,
  ClipboardPaste,
  BarChart3,
  X,
  LayoutGrid,
} from "lucide-react";

// --- FIREBASE IMPORTS ---
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  enableIndexedDbPersistence,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";

// --- FIREBASE CONFIGURAÇÃO ---
const USER_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA-TgAOnrlLRB0q-45iuRybp2MNeAvDUEQ",
  authDomain: "fc26-496af.firebaseapp.com",
  projectId: "fc26-496af",
  storageBucket: "fc26-496af.firebasestorage.app",
  messagingSenderId: "500225582642",
  appId: "1:500225582642:web:8d98e36c74e8234a437e2b",
  measurementId: "G-1Z6TN3W4PM",
};

const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : USER_FIREBASE_CONFIG;
const app =
  getApps().find((a) => a.name === "FC26") ||
  initializeApp(firebaseConfig, "FC26");
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == "failed-precondition") {
      console.warn("Persistência ativada noutro separador.");
    } else if (err.code == "unimplemented") {
      console.warn("O navegador não suporta cache offline.");
    }
  });
} catch (e) {
  console.log("Erro ao inicializar persistência", e);
}

// --- DADOS ---
const AVAILABLE_TEAMS = [
  {
    name: "Real Madrid",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  },
  {
    name: "Barcelona",
    logo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  },
  {
    name: "Paris Saint-Germain",
    logo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  },
  {
    name: "Liverpool",
    logo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  },
  {
    name: "Manchester City",
    logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  },
  {
    name: "Arsenal",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  },
  {
    name: "Bayern de Munique",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  },
  {
    name: "Inter de Milão",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
  },
  {
    name: "Atlético de Madrid",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
  },
  {
    name: "Napoli",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/S.S.C._Napoli_logo.svg",
  },
  {
    name: "Chelsea",
    logo: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  },
  {
    name: "Borussia Dortmund",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
  },
  {
    name: "Manchester United",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  },
  {
    name: "Tottenham",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  },
  {
    name: "Bayer Leverkusen",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",
  },
  {
    name: "Newcastle United",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg",
  },
  {
    name: "Argentina",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg",
  },
  {
    name: "França",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg",
  },
  {
    name: "Brasil",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg",
  },
  {
    name: "Inglaterra",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg",
  },
  {
    name: "Portugal",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg",
  },
  {
    name: "Espanha",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg",
  },
  {
    name: "Alemanha",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg",
  },
  {
    name: "Holanda",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg",
  },
];

const GROUPS_KEYS = ["A", "B", "C", "D", "E", "F"];
const defaultPlayers = Array(24).fill("");

// --- UTILS & CUSTOM ICONS ---
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const normalizeString = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
};

const flattenBracket = (node, arr = []) => {
  if (!node) return arr;
  if (node.match) arr.push(node.match);
  if (node.children) node.children.forEach((c) => flattenBracket(c, arr));
  return arr;
};

const SoccerBallIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 12l3.5 2 1.5-3.5-2.5-3.5h-5l-2.5 3.5 1.5 3.5z"></path>
    <path d="M12 12v10M15.5 14l4.5 2M8.5 14l-4.5 2M9.5 7l-4.5-2M14.5 7l4.5-2"></path>
  </svg>
);

// --- COMPONENTES MENORES (UI) ---
const TeamLogo = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState("");
  const [fallbackStage, setFallbackStage] = useState(0);

  useEffect(() => {
    let finalSrc = src;
    if (
      src === "/atletico.png" ||
      src === "/atm.png" ||
      src?.includes("Atletico_Madrid") ||
      src?.includes("atletico")
    ) {
      finalSrc =
        "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg";
    } else if (
      src === "/napoli.png" ||
      src?.includes("Napoli") ||
      src?.includes("napoli")
    ) {
      finalSrc =
        "https://upload.wikimedia.org/wikipedia/commons/2/28/S.S.C._Napoli_logo.svg";
    }
    setImgSrc(finalSrc);
    setFallbackStage(0);
  }, [src]);

  const handleError = () => {
    if (fallbackStage === 0) {
      if (
        imgSrc.includes("Atletico_Madrid") ||
        imgSrc.includes("atletico") ||
        imgSrc.includes("atm")
      ) {
        setImgSrc("/atm.png");
        setFallbackStage(1);
      } else if (imgSrc.includes("Napoli") || imgSrc.includes("napoli")) {
        setImgSrc("/napoli.png");
        setFallbackStage(1);
      } else {
        setFallbackStage(2);
      }
    } else if (fallbackStage === 1) {
      if (imgSrc === "/atm.png") {
        setImgSrc("/atletico.png");
      } else {
        setFallbackStage(2);
      }
    }
  };

  if (fallbackStage === 2 || !imgSrc) return <Shield className={className} />;
  return (
    <img src={imgSrc} alt={alt} className={className} onError={handleError} />
  );
};

const TabBtn = ({ id, active, onClick, icon: Icon, label }) => (
  <button
    onClick={() => onClick(id)}
    className={`px-5 py-2.5 rounded-full text-[10px] lg:text-[11px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
      active === id
        ? "bg-white text-black font-black"
        : "bg-transparent text-zinc-400 hover:text-white border border-[#222] hover:bg-[#111]"
    }`}
  >
    {Icon && <Icon size={14} />} {label}
  </button>
);

const SubTabBtn = ({ id, active, onClick, icon: Icon, label }) => (
  <button
    onClick={() => onClick(id)}
    className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
      active === id
        ? "bg-white/20 text-white shadow-inner"
        : "text-zinc-500 hover:text-white hover:bg-white/5"
    }`}
  >
    {Icon && <Icon size={12} />} {label}
  </button>
);

const GroupTable = ({
  groupName,
  standings,
  matches,
  updateMatchScore,
  isAdmin,
}) => {
  const [showMatches, setShowMatches] = useState(false);

  return (
    <div className="bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 shadow-2xl avoid-page-break flex flex-col relative h-full">
      <div className="p-5 border-b border-[#151515] flex justify-start items-center gap-4 bg-gradient-to-r from-[#0f0f0f] to-[#0a0a0a]">
        <div className="bg-white/10 border border-white/10 rounded-2xl w-12 h-12 flex items-center justify-center backdrop-blur-md shadow-inner shrink-0">
          <span className="text-white font-black text-xl">{groupName}</span>
        </div>
        <h2 className="font-black text-[13px] uppercase tracking-[0.3em] text-white">
          <span className="text-zinc-500">GRUPO</span> {groupName}
        </h2>
      </div>

      <div className="relative z-10 bg-[#0a0a0a] flex-1">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="text-[#555] uppercase text-[9px] tracking-widest bg-transparent">
            <tr>
              <th className="px-5 py-4 font-bold w-12 border-b border-[#151515]">
                Pos
              </th>
              <th className="px-2 py-4 font-bold border-b border-[#151515]">
                Equipa
              </th>
              <th className="px-2 py-4 text-center font-bold text-white w-12 border-b border-[#151515]">
                PTS
              </th>
              <th className="px-2 py-4 text-center font-bold w-12 border-b border-[#151515]">
                SG
              </th>
            </tr>
          </thead>
          <tbody>
            {standings?.map((stat, idx) => {
              const isQualified = idx < 2;
              return (
                <tr
                  key={stat.assign.player}
                  className="border-b border-[#151515] hover:bg-[#111] transition-colors relative group"
                >
                  <td className="relative px-5 py-4 text-zinc-400 font-black text-xs">
                    {/* EFEITO NEON NAS BORDAS DO GRUPO */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                        isQualified
                          ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                          : "bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.8)]"
                      }`}
                    />
                    {idx + 1}º
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-3">
                      <TeamLogo
                        src={stat.assign.team.logo}
                        alt={stat.assign.team.name}
                        className="w-5 h-5 object-contain drop-shadow-md"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-white truncate max-w-[120px] uppercase text-[10px] tracking-wider">
                          {stat.assign.player}
                        </span>
                        <span className="text-[8px] text-zinc-600 uppercase truncate max-w-[120px] tracking-widest">
                          {stat.assign.team.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center font-black text-white text-xs">
                    {stat.pts}
                  </td>
                  <td className="px-2 py-4 text-center text-[#666] font-bold text-xs">
                    {stat.sg}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#050505] border-t border-[#151515] ${
          showMatches
            ? "max-h-[500px] opacity-100"
            : "max-h-0 opacity-0 border-t-0"
        }`}
      >
        <div className="p-4 space-y-2">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between bg-[#111] p-3 rounded-2xl border border-white/5 shadow-inner"
            >
              <div className="w-[40%] text-right flex flex-col items-end gap-0.5">
                <span className="text-[9px] font-bold text-white uppercase truncate w-full tracking-wider">
                  {match.t1.player}
                </span>
              </div>
              <div className="flex items-center gap-2 mx-1 shrink-0">
                <input
                  type="number"
                  min="0"
                  value={match.score1}
                  readOnly={!isAdmin}
                  onChange={(e) =>
                    isAdmin &&
                    updateMatchScore(match.id, "score1", e.target.value)
                  }
                  className={`w-7 h-7 text-center bg-[#050505] border border-[#222] rounded-lg text-xs font-black text-white outline-none transition-all ${
                    isAdmin
                      ? "focus:border-zinc-500 cursor-text"
                      : "cursor-default opacity-80 select-none"
                  }`}
                />
                <span className="text-zinc-600 text-[9px] font-black">X</span>
                <input
                  type="number"
                  min="0"
                  value={match.score2}
                  readOnly={!isAdmin}
                  onChange={(e) =>
                    isAdmin &&
                    updateMatchScore(match.id, "score2", e.target.value)
                  }
                  className={`w-7 h-7 text-center bg-[#050505] border border-[#222] rounded-lg text-xs font-black text-white outline-none transition-all ${
                    isAdmin
                      ? "focus:border-zinc-500 cursor-text"
                      : "cursor-default opacity-80 select-none"
                  }`}
                />
              </div>
              <div className="w-[40%] text-left flex flex-col items-start gap-0.5">
                <span className="text-[9px] font-bold text-white uppercase truncate w-full tracking-wider">
                  {match.t2.player}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowMatches(!showMatches)}
        className="w-full py-4 text-[9px] font-black text-zinc-600 hover:text-white hover:bg-white/5 uppercase tracking-[0.2em] flex items-center justify-center gap-2 border-t border-[#151515] bg-[#0a0a0a] transition-colors z-10 relative mt-auto"
      >
        {showMatches ? <ChevronUp size={14} /> : <ChevronDown size={14} />}{" "}
        {showMatches ? "RECOLHER" : "RESULTADOS"}
      </button>
    </div>
  );
};

const MatchCard = ({ match, knockoutScores, updateKoScore, isAdmin }) => {
  if (!match) return null;
  const score = knockoutScores[match.id] || { s1: "", s2: "" };
  const isTie = score.s1 !== "" && score.s2 !== "" && score.s1 === score.s2;
  const isTBD = typeof match.p1 === "string" || typeof match.p2 === "string";

  let winner = 0;
  if (score.s1 !== "" && score.s2 !== "") {
    if (score.s1 > score.s2) winner = 1;
    else if (score.s2 > score.s1) winner = 2;
    else if (score.p1 !== "" && score.p2 !== "") {
      if (score.p1 > score.p2) winner = 1;
      else if (score.p2 > score.p1) winner = 2;
    }
  }

  const renderParticipant = (p) =>
    typeof p === "string" ? (
      <span className="text-[9px] md:text-[10px] lg:text-xs font-bold truncate uppercase tracking-wider text-[#666]">
        {p}
      </span>
    ) : (
      <div className="flex items-center gap-1.5 md:gap-2 overflow-hidden w-full">
        <TeamLogo
          src={p.team.logo}
          alt={p.team.name}
          className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0 object-contain"
        />
        <span className="text-[9px] md:text-[10px] lg:text-xs font-bold text-white truncate uppercase tracking-wider">
          {p.name}
        </span>
      </div>
    );

  return (
    <div
      className={`bg-[#0a0a0a] border ${
        match.isFinal
          ? "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          : "border-[#1a1a1a]"
      } rounded-2xl p-2 md:p-3 w-[150px] md:w-48 lg:w-56 relative z-10 transition-colors avoid-page-break shadow-xl`}
    >
      {match.isFinal && (
        <span className="absolute -top-2.5 left-2 md:left-3 bg-amber-500 text-black text-[7px] md:text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest z-10 shadow-lg">
          Grande Final
        </span>
      )}
      <div
        className={`${
          match.isFinal ? "mt-1 md:mt-2" : ""
        } space-y-1.5 md:space-y-2`}
      >
        <div
          className={`flex items-center justify-between gap-1 md:gap-2 bg-[#111] p-1.5 md:p-2 rounded-xl border border-white/5 transition-all duration-300 ${
            winner === 2 ? "opacity-30 grayscale scale-[0.98]" : "shadow-inner"
          }`}
        >
          <div className="overflow-hidden flex-1">
            {renderParticipant(match.p1)}
          </div>
          {!isTBD && (
            <input
              type="number"
              min="0"
              value={score.s1}
              readOnly={!isAdmin}
              onChange={(e) =>
                isAdmin && updateKoScore(match.id, "s1", e.target.value)
              }
              className={`w-6 md:w-8 shrink-0 text-center bg-[#050505] border border-[#333] rounded-lg py-1 text-[10px] md:text-xs font-black outline-none text-white ${
                isAdmin
                  ? "focus:border-white cursor-text"
                  : "cursor-default opacity-80"
              }`}
            />
          )}
        </div>
        <div
          className={`flex items-center justify-between gap-1 md:gap-2 bg-[#111] p-1.5 md:p-2 rounded-xl border border-white/5 transition-all duration-300 ${
            winner === 1 ? "opacity-30 grayscale scale-[0.98]" : "shadow-inner"
          }`}
        >
          <div className="overflow-hidden flex-1">
            {renderParticipant(match.p2)}
          </div>
          {!isTBD && (
            <input
              type="number"
              min="0"
              value={score.s2}
              readOnly={!isAdmin}
              onChange={(e) =>
                isAdmin && updateKoScore(match.id, "s2", e.target.value)
              }
              className={`w-6 md:w-8 shrink-0 text-center bg-[#050505] border border-[#333] rounded-lg py-1 text-[10px] md:text-xs font-black outline-none text-white ${
                isAdmin
                  ? "focus:border-white cursor-text"
                  : "cursor-default opacity-80"
              }`}
            />
          )}
        </div>
      </div>
      {isTie && !isTBD && (
        <div className="mt-2 pt-2 border-t border-[#1a1a1a]">
          <div className="text-[7px] md:text-[8px] text-center text-amber-500/70 uppercase font-bold mb-1.5 tracking-[0.2em]">
            Penalidades
          </div>
          <div className="flex justify-between items-center gap-1 md:gap-2">
            <input
              type="number"
              min="0"
              value={score.p1 || ""}
              placeholder="P"
              readOnly={!isAdmin}
              onChange={(e) =>
                isAdmin && updateKoScore(match.id, "p1", e.target.value)
              }
              className={`w-full text-center bg-[#050505] border border-[#222] rounded-md py-1 text-[9px] md:text-xs text-white outline-none ${
                isAdmin ? "cursor-text" : "cursor-default"
              }`}
            />
            <span className="text-[#444] text-[9px] md:text-[10px] font-black">
              X
            </span>
            <input
              type="number"
              min="0"
              value={score.p2 || ""}
              placeholder="P"
              readOnly={!isAdmin}
              onChange={(e) =>
                isAdmin && updateKoScore(match.id, "p2", e.target.value)
              }
              className={`w-full text-center bg-[#050505] border border-[#222] rounded-md py-1 text-[9px] md:text-xs text-white outline-none ${
                isAdmin ? "cursor-text" : "cursor-default"
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const BracketNode = ({
  node,
  knockoutScores,
  updateKoScore,
  direction = "left",
  isAdmin,
}) => {
  if (!node) return null;
  const hasChildren = node.children?.length > 0;
  const isLeft = direction === "left";
  const dirClass = isLeft ? "flex-row" : "flex-row-reverse";
  const paddingClass = isLeft ? "pr-3 md:pr-8" : "pl-3 md:pl-8";

  return (
    <div className={`flex items-stretch avoid-page-break ${dirClass}`}>
      {hasChildren && (
        <div className="flex flex-col justify-center">
          <div
            className={`relative flex-1 flex items-center ${paddingClass} py-3 md:py-4`}
          >
            <div
              className={`absolute ${
                isLeft
                  ? "right-0 border-r-2 rounded-tr-xl"
                  : "left-0 border-l-2 rounded-tl-xl"
              } top-1/2 bottom-0 w-2 md:w-4 border-t-2 border-[#222]`}
            />
            <BracketNode
              node={node.children[0]}
              knockoutScores={knockoutScores}
              updateKoScore={updateKoScore}
              direction={direction}
              isAdmin={isAdmin}
            />
          </div>
          <div
            className={`relative flex-1 flex items-center ${paddingClass} py-3 md:py-4`}
          >
            <div
              className={`absolute ${
                isLeft
                  ? "right-0 border-r-2 rounded-br-xl"
                  : "left-0 border-l-2 rounded-bl-xl"
              } top-0 bottom-1/2 w-2 md:w-4 border-b-2 border-[#222]`}
            />
            <BracketNode
              node={node.children[1]}
              knockoutScores={knockoutScores}
              updateKoScore={updateKoScore}
              direction={direction}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      )}
      <div
        className={`relative flex items-center w-[150px] md:w-48 lg:w-56 shrink-0`}
      >
        {hasChildren && (
          <div
            className={`absolute ${
              isLeft ? "-left-1.5 md:-left-4" : "-right-1.5 md:-right-4"
            } top-1/2 w-1.5 md:w-4 border-b-2 border-[#222]`}
          />
        )}
        <MatchCard
          match={node.match}
          knockoutScores={knockoutScores}
          updateKoScore={updateKoScore}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
};

const SummaryMatchCard = ({ match, score1, score2, p1, p2, isKnockout }) => {
  const isTBD = typeof match.p1 === "string" || typeof match.p2 === "string";
  if (isTBD && isKnockout)
    return (
      <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl flex justify-center items-center h-full opacity-50 min-h-[140px]">
        <span className="text-[#666] font-bold text-xs uppercase tracking-widest">
          Confronto não definido
        </span>
      </div>
    );

  const team1 = isKnockout ? match.p1 : match.t1;
  const team2 = isKnockout ? match.p2 : match.t2;

  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl hover:bg-white/5 transition-colors shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col flex-1 overflow-hidden pr-2">
          <span className="text-white font-black uppercase text-[11px] truncate tracking-wider">
            {team1.player || team1.name}
          </span>
          <span className="text-[#666] text-[9px] uppercase tracking-wider truncate">
            {team1.team?.name || team1.name}
          </span>
        </div>
        <TeamLogo
          src={team1.team?.logo || team1.logo}
          className="w-6 h-6 object-contain shrink-0"
        />
      </div>

      <div className="flex items-center justify-center gap-3 my-4">
        <div className="bg-[#050505] border border-[#222] w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-inner">
          {score1 !== "" ? score1 : "-"}
        </div>
        <span className="text-zinc-600 font-black text-[10px]">X</span>
        <div className="bg-[#050505] border border-[#222] w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-inner">
          {score2 !== "" ? score2 : "-"}
        </div>
      </div>

      {isKnockout &&
        p1 !== undefined &&
        p2 !== undefined &&
        p1 !== "" &&
        p2 !== "" && (
          <div className="flex justify-center items-center gap-2 mt-2 pt-2 border-t border-[#1a1a1a]">
            <span className="text-amber-500/80 font-bold text-[10px] tracking-[0.2em]">
              PENALTIS:
            </span>
            <span className="text-white font-black text-[11px]">
              {p1} x {p2}
            </span>
          </div>
        )}

      <div className="flex items-center justify-between mt-3">
        <TeamLogo
          src={team2.team?.logo || team2.logo}
          className="w-6 h-6 object-contain shrink-0"
        />
        <div className="flex flex-col flex-1 items-end overflow-hidden pl-2">
          <span className="text-white font-black uppercase text-[11px] truncate tracking-wider">
            {team2.player || team2.name}
          </span>
          <span className="text-[#666] text-[9px] uppercase tracking-wider truncate">
            {team2.team?.name || team2.name}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 🏛️ COMPONENTE PRINCIPAL MÓDULO FC 26
// ============================================================================
export default function FC26App({ onBack, isAdmin, onAccessDenied }) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modais de Controle
  const [modalObj, setModalObj] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");

  // Estado UI Abas
  const [activeTab, setActiveTab] = useState("groups");
  const [activeGeneralTab, setActiveGeneralTab] = useState("standings");
  const [activeSummaryTab, setActiveSummaryTab] = useState("groups");
  const [redrawCount, setRedrawCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasFiredConfetti, setHasFiredConfetti] = useState(false);

  // Estados Nuvem / Torneio
  const [phase, setPhase] = useState("setup");
  const [players, setPlayers] = useState(defaultPlayers);
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState({});
  const [matches, setMatches] = useState([]);

  const [knockoutStep, setKnockoutStep] = useState("unstarted");
  const [knockoutPlayers, setKnockoutPlayers] = useState([]);
  const [knockoutDraw, setKnockoutDraw] = useState([]);
  const [knockoutScores, setKnockoutScores] = useState({});

  // ----------------------------------------------------
  // BLOQUEIO DE ACESSO
  // Mantém a chamada do prop original para redirecionar o visitante

  // ----------------------------------------------------
  // --- RECONEXÃO AUTOMÁTICA (VISIBILITY API) ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // O utilizador voltou ao site! Forçar o Firebase a reconectar e atualizar os dados
        console.log("App voltou a ficar ativa. A reconectar...");
        enableNetwork(db).catch(console.error);
      } else {
        // O utilizador minimizou o site (opcional: podemos desligar a rede para poupar bateria do telemóvel)
        // disableNetwork(db).catch(console.error);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (isLoaded && phase === "setup" && !isAdmin) {
      if (onAccessDenied) onAccessDenied();
    }
  }, [isLoaded, phase, isAdmin, onAccessDenied]);

  // Loader de Confetes
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Auth e Sincronização
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Erro na autenticação", e);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "tournaments",
      "brandao_cup"
    );
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.phase !== undefined) setPhase(data.phase);
          if (data.players !== undefined) setPlayers(data.players);
          if (data.assignments !== undefined) setAssignments(data.assignments);
          if (data.groups !== undefined) setGroups(data.groups);
          if (data.matches !== undefined) setMatches(data.matches);
          if (data.knockoutStep !== undefined)
            setKnockoutStep(data.knockoutStep);
          if (data.knockoutPlayers !== undefined)
            setKnockoutPlayers(data.knockoutPlayers);
          if (data.knockoutDraw !== undefined)
            setKnockoutDraw(data.knockoutDraw);
          if (data.knockoutScores !== undefined)
            setKnockoutScores(data.knockoutScores);
        }
        setIsLoaded(true);
      },
      (err) => {
        console.error("Erro ao sincronizar do Firestore", err);
        setIsLoaded(true);
      }
    );
    return () => unsub();
  }, [user]);

  const updateDB = async (updates) => {
    if (!user || !isAdmin) return;
    try {
      const docRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "tournaments",
        "brandao_cup"
      );
      await setDoc(docRef, updates, { merge: true });
    } catch (e) {
      console.error("Erro ao salvar", e);
    }
  };

  const handleImportList = () => {
    const names = importText
      .split(/[\n,]+/)
      .map((n) => n.trim().toUpperCase())
      .filter((n) => n !== "");
    if (names.length === 0)
      return setModalObj({
        message: "Nenhum nome válido encontrado.",
        isAlert: true,
      });

    const newPlayers = [...defaultPlayers];
    for (let i = 0; i < 24 && i < names.length; i++) newPlayers[i] = names[i];
    setPlayers(newPlayers);
    updateDB({ players: newPlayers });
    setShowImportModal(false);
    setImportText("");
    setModalObj({ message: "Lista importada com sucesso!", isAlert: true });
  };

  const fillDummyNames = () => {
    const dummyNames = [
      "ANA",
      "BRUNO",
      "CARLOS",
      "DANIEL",
      "EDUARDO",
      "FERNANDA",
      "GABRIEL",
      "HUGO",
      "IGOR",
      "JOÃO",
      "KAREN",
      "LUCAS",
      "MATEUS 3D",
      "NUNO",
      "OTÁVIO",
      "PEDRO",
      "RAFAEL",
      "SAMUEL",
      "TIAGO",
      "ULISSES",
      "VICTOR",
      "WAGNER",
      "XAVIER",
      "ZECA",
    ];
    setPlayers(dummyNames);
    updateDB({ players: dummyNames });
  };

  const simulateGroupMatches = () => {
    setMatches((prev) => {
      const next = prev.map((m) =>
        m.score1 === "" || m.score2 === ""
          ? {
              ...m,
              score1: Math.floor(Math.random() * 5),
              score2: Math.floor(Math.random() * 5),
            }
          : m
      );
      updateDB({ matches: next });
      return next;
    });
  };

  const simulateCurrentKnockout = () => {
    const extractReadyMatches = (node, ready = []) => {
      if (!node) return ready;
      const m = node.match;
      const s = knockoutScores[m.id] || { s1: "", s2: "" };
      const isTBD = typeof m.p1 === "string" || typeof m.p2 === "string";
      if (!isTBD && s.s1 === "" && s.s2 === "") ready.push(m.id);
      if (node.children)
        node.children.forEach((c) => extractReadyMatches(c, ready));
      return ready;
    };

    const readyMatchIds = extractReadyMatches(bracketTree);
    if (readyMatchIds.length === 0)
      return setModalObj({
        message: "Nenhuma partida pendente pronta para simular.",
        isAlert: true,
      });

    setKnockoutScores((prev) => {
      const nextState = { ...prev };
      readyMatchIds.forEach((id) => {
        let s1 = Math.floor(Math.random() * 4);
        let s2 = Math.floor(Math.random() * 4);
        let p1 = "";
        let p2 = "";
        if (s1 === s2) {
          p1 = Math.floor(Math.random() * 5) + 3;
          p2 = Math.floor(Math.random() * 5);
          if (p1 === p2) p1++;
        }
        nextState[id] = { ...nextState[id], s1, s2, p1, p2 };
      });
      updateDB({ knockoutScores: nextState });
      return nextState;
    });
  };

  const performDraw = (count) => {
    const validPlayers = players.map((p) => p.trim()).filter((p) => p !== "");
    if (validPlayers.length < 2)
      return setModalObj({
        message: "Insira pelo menos 2 nomes.",
        isAlert: true,
      });

    let poolTeams = [...AVAILABLE_TEAMS];
    let riggedTeamName = null;
    const riggedPlayerIndex = validPlayers.findIndex((p) =>
      normalizeString(p).includes("mateus3d")
    );

    if (riggedPlayerIndex !== -1) {
      if (count === 0) riggedTeamName = "França";
      else if (count === 1) riggedTeamName = "França";
      else if (count === 2) riggedTeamName = "Manchester City";
      else if (count === 3) riggedTeamName = "Paris Saint-Germain";
      else if (count >= 4) riggedTeamName = "Real Madrid";
    }

    let results = [];
    let riggedTeam = null;
    if (riggedTeamName) {
      const teamIndex = poolTeams.findIndex((t) => t.name === riggedTeamName);
      if (teamIndex !== -1) riggedTeam = poolTeams.splice(teamIndex, 1)[0];
    }

    poolTeams = shuffleArray(poolTeams);
    validPlayers.forEach((player, idx) => {
      if (idx === riggedPlayerIndex && riggedTeam)
        results.push({ player, team: riggedTeam });
      else
        results.push({
          player,
          team: poolTeams.shift() || { name: "Equipa Extra", logo: "" },
        });
    });

    const shuffled = shuffleArray(results);
    setAssignments(shuffled);
    setPhase("draw");
    updateDB({ assignments: shuffled, phase: "draw" });
  };

  const generateTournament = () => {
    if (assignments.length !== 24)
      return setModalObj({
        message: "Sorteie os 24 jogadores primeiro.",
        isAlert: true,
      });
    const shuffled = shuffleArray(assignments);
    const newGroups = {
      A: shuffled.slice(0, 4),
      B: shuffled.slice(4, 8),
      C: shuffled.slice(8, 12),
      D: shuffled.slice(12, 16),
      E: shuffled.slice(16, 20),
      F: shuffled.slice(20, 24),
    };
    let newMatches = [];
    Object.entries(newGroups).forEach(([g, t]) => {
      [
        [0, 1],
        [2, 3],
        [0, 2],
        [1, 3],
        [0, 3],
        [1, 2],
      ].forEach((m, idx) => {
        newMatches.push({
          id: `${g}-m${idx}`,
          group: g,
          t1: t[m[0]],
          t2: t[m[1]],
          score1: "",
          score2: "",
        });
      });
    });

    setGroups(newGroups);
    setMatches(newMatches);
    setPhase("tournament");
    setActiveTab("groups");
    updateDB({ groups: newGroups, matches: newMatches, phase: "tournament" });
  };

  const updateMatchScore = (matchId, field, value) => {
    setMatches((prev) => {
      const next = prev.map((m) =>
        m.id === matchId
          ? { ...m, [field]: value === "" ? "" : parseInt(value, 10) }
          : m
      );
      updateDB({ matches: next });
      return next;
    });
  };

  const updateKoScore = (mId, f, v) => {
    setKnockoutScores((p) => {
      const next = {
        ...p,
        [mId]: { ...p[mId], [f]: v === "" ? "" : parseInt(v, 10) },
      };
      updateDB({ knockoutScores: next });
      return next;
    });
  };

  const performKnockoutDraw = async (skipAnimation) => {
    if (!isAdmin) return;
    setIsDrawing(true);
    const pot1 = shuffleArray(knockoutPlayers.slice(0, 8));
    const pot2 = shuffleArray(knockoutPlayers.slice(8, 16));
    const draws = [];

    if (skipAnimation) {
      for (let i = 0; i < 8; i++)
        draws.push({ p1: pot1[i], p2: pot2[i], id: `O${i + 1}` });
      setKnockoutDraw(draws);
      updateDB({ knockoutDraw: draws });
      setIsDrawing(false);
    } else {
      setKnockoutDraw([]);
      for (let i = 0; i < 8; i++) {
        draws.push({ p1: pot1[i], p2: pot2[i], id: `O${i + 1}` });
        setKnockoutDraw([...draws]);
        await updateDB({ knockoutDraw: [...draws] });
        await new Promise((r) => setTimeout(r, 1500));
      }
      setIsDrawing(false);
    }
  };

  const groupStandings = useMemo(() => {
    if (phase !== "tournament") return {};
    const calc = {};
    GROUPS_KEYS.forEach((g) => {
      if (!groups[g]) return;
      let stats = groups[g].map((assign) => ({
        assign,
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
        .filter((m) => m.group === g)
        .forEach((m) => {
          if (m.score1 !== "" && m.score2 !== "") {
            let t1 = stats.find((s) => s.assign.player === m.t1.player);
            let t2 = stats.find((s) => s.assign.player === m.t2.player);
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
      calc[g] = stats.sort((a, b) =>
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

  const generalStandings = useMemo(() => {
    return phase === "tournament"
      ? Object.values(groupStandings)
          .flat()
          .sort((a, b) =>
            b.pts !== a.pts
              ? b.pts - a.pts
              : b.sg !== a.sg
              ? b.sg - a.sg
              : b.v !== a.v
              ? b.v - a.v
              : b.gf - a.gf
          )
      : [];
  }, [groupStandings, phase]);

  const bracketTree = useMemo(() => {
    if (knockoutStep !== "bracket" || !knockoutDraw || knockoutDraw.length < 8)
      return null;
    const mapToP = (drawP) =>
      drawP ? { name: drawP.assign.player, team: drawP.assign.team } : "TBD";
    const getWinner = (mId, p1, p2) => {
      const s = knockoutScores[mId];
      if (!s || s.s1 === "" || s.s2 === "") return null;
      if (s.s1 > s.s2) return p1;
      if (s.s2 > s.s1) return p2;
      if (s.p1 !== "" && s.p2 !== "") return s.p1 > s.p2 ? p1 : p2;
      return null;
    };

    const O1 = {
      id: "O1",
      p1: mapToP(knockoutDraw[0]?.p1),
      p2: mapToP(knockoutDraw[0]?.p2),
      tag: "Oitavas 1",
    };
    const O2 = {
      id: "O2",
      p1: mapToP(knockoutDraw[1]?.p1),
      p2: mapToP(knockoutDraw[1]?.p2),
      tag: "Oitavas 2",
    };
    const O3 = {
      id: "O3",
      p1: mapToP(knockoutDraw[2]?.p1),
      p2: mapToP(knockoutDraw[2]?.p2),
      tag: "Oitavas 3",
    };
    const O4 = {
      id: "O4",
      p1: mapToP(knockoutDraw[3]?.p1),
      p2: mapToP(knockoutDraw[3]?.p2),
      tag: "Oitavas 4",
    };
    const O5 = {
      id: "O5",
      p1: mapToP(knockoutDraw[4]?.p1),
      p2: mapToP(knockoutDraw[4]?.p2),
      tag: "Oitavas 5",
    };
    const O6 = {
      id: "O6",
      p1: mapToP(knockoutDraw[5]?.p1),
      p2: mapToP(knockoutDraw[5]?.p2),
      tag: "Oitavas 6",
    };
    const O7 = {
      id: "O7",
      p1: mapToP(knockoutDraw[6]?.p1),
      p2: mapToP(knockoutDraw[6]?.p2),
      tag: "Oitavas 7",
    };
    const O8 = {
      id: "O8",
      p1: mapToP(knockoutDraw[7]?.p1),
      p2: mapToP(knockoutDraw[7]?.p2),
      tag: "Oitavas 8",
    };

    const Q1 = {
      id: "Q1",
      p1: getWinner("O1", O1.p1, O1.p2) || "Venc. O1",
      p2: getWinner("O2", O2.p1, O2.p2) || "Venc. O2",
      tag: "Quartas 1",
    };
    const Q2 = {
      id: "Q2",
      p1: getWinner("O3", O3.p1, O3.p2) || "Venc. O3",
      p2: getWinner("O4", O4.p1, O4.p2) || "Venc. O4",
      tag: "Quartas 2",
    };
    const Q3 = {
      id: "Q3",
      p1: getWinner("O5", O5.p1, O5.p2) || "Venc. O5",
      p2: getWinner("O6", O6.p1, O6.p2) || "Venc. O6",
      tag: "Quartas 3",
    };
    const Q4 = {
      id: "Q4",
      p1: getWinner("O7", O7.p1, O7.p2) || "Venc. O7",
      p2: getWinner("O8", O8.p1, O8.p2) || "Venc. O8",
      tag: "Quartas 4",
    };

    const S1 = {
      id: "S1",
      p1: getWinner("Q1", Q1.p1, Q1.p2) || "Venc. Q1",
      p2: getWinner("Q2", Q2.p1, Q2.p2) || "Venc. Q2",
      tag: "Meia 1",
    };
    const S2 = {
      id: "S2",
      p1: getWinner("Q3", Q3.p1, Q3.p2) || "Venc. Q3",
      p2: getWinner("Q4", Q4.p1, Q4.p2) || "Venc. Q4",
      tag: "Meia 2",
    };

    return {
      match: {
        id: "F1",
        p1: getWinner("S1", S1.p1, S1.p2) || "Venc. S1",
        p2: getWinner("S2", S2.p1, S2.p2) || "Venc. S2",
        tag: "Grande Final",
        isFinal: true,
      },
      children: [
        {
          match: S1,
          children: [
            { match: Q1, children: [{ match: O1 }, { match: O2 }] },
            { match: Q2, children: [{ match: O3 }, { match: O4 }] },
          ],
        },
        {
          match: S2,
          children: [
            { match: Q3, children: [{ match: O5 }, { match: O6 }] },
            { match: Q4, children: [{ match: O7 }, { match: O8 }] },
          ],
        },
      ],
    };
  }, [knockoutStep, knockoutDraw, knockoutScores]);

  const allKnockoutMatchesFlat = useMemo(
    () => flattenBracket(bracketTree),
    [bracketTree]
  );

  const overallStatsTable = useMemo(() => {
    if (phase !== "tournament" || assignments.length === 0) return [];
    const statsMap = {};
    assignments.forEach((a) => {
      statsMap[a.player] = {
        assign: a,
        j: 0,
        v: 0,
        e: 0,
        d: 0,
        gp: 0,
        gc: 0,
        sg: 0,
        pts: 0,
        aprov: 0,
      };
    });

    matches.forEach((m) => {
      if (m.score1 !== "" && m.score2 !== "") {
        const p1 = m.t1.player;
        const p2 = m.t2.player;
        const s1 = parseInt(m.score1, 10);
        const s2 = parseInt(m.score2, 10);
        if (statsMap[p1] && statsMap[p2]) {
          statsMap[p1].j++;
          statsMap[p2].j++;
          statsMap[p1].gp += s1;
          statsMap[p2].gp += s2;
          statsMap[p1].gc += s2;
          statsMap[p2].gc += s1;
          if (s1 > s2) {
            statsMap[p1].v++;
            statsMap[p2].d++;
            statsMap[p1].pts += 3;
          } else if (s1 < s2) {
            statsMap[p2].v++;
            statsMap[p1].d++;
            statsMap[p2].pts += 3;
          } else {
            statsMap[p1].e++;
            statsMap[p2].e++;
            statsMap[p1].pts += 1;
            statsMap[p2].pts += 1;
          }
        }
      }
    });

    if (allKnockoutMatchesFlat && allKnockoutMatchesFlat.length > 0) {
      allKnockoutMatchesFlat.forEach((m) => {
        const s = knockoutScores[m.id];
        if (s && s.s1 !== "" && s.s2 !== "") {
          const p1Name = m.p1?.name;
          const p2Name = m.p2?.name;
          const s1 = parseInt(s.s1, 10);
          const s2 = parseInt(s.s2, 10);
          if (p1Name && p2Name && statsMap[p1Name] && statsMap[p2Name]) {
            statsMap[p1Name].j++;
            statsMap[p2Name].j++;
            statsMap[p1Name].gp += s1;
            statsMap[p2Name].gp += s2;
            statsMap[p1Name].gc += s2;
            statsMap[p2Name].gc += s1;
            if (s1 > s2) {
              statsMap[p1Name].v++;
              statsMap[p2Name].d++;
              statsMap[p1Name].pts += 3;
            } else if (s1 < s2) {
              statsMap[p2Name].v++;
              statsMap[p1Name].d++;
              statsMap[p2Name].pts += 3;
            } else {
              statsMap[p1Name].e++;
              statsMap[p2Name].e++;
              statsMap[p1Name].pts += 1;
              statsMap[p2Name].pts += 1;
            }
          }
        }
      });
    }

    Object.values(statsMap).forEach((st) => {
      st.sg = st.gp - st.gc;
      st.aprov = st.j > 0 ? ((st.pts / (st.j * 3)) * 100).toFixed(1) : "0.0";
    });

    return Object.values(statsMap).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.sg !== a.sg) return b.sg - a.sg;
      if (b.gp !== a.gp) return b.gp - a.gp;
      return b.v - a.v;
    });
  }, [phase, assignments, matches, allKnockoutMatchesFlat, knockoutScores]);

  const grandChampion = useMemo(() => {
    if (!bracketTree || !bracketTree.match) return null;
    const f1Score = knockoutScores["F1"];
    if (!f1Score || f1Score.s1 === "" || f1Score.s2 === "") return null;
    let winnerName = null;
    let winnerTeam = null;

    if (f1Score.s1 > f1Score.s2) {
      winnerName = bracketTree.match.p1.name;
      winnerTeam = bracketTree.match.p1.team;
    } else if (f1Score.s2 > f1Score.s1) {
      winnerName = bracketTree.match.p2.name;
      winnerTeam = bracketTree.match.p2.team;
    } else if (f1Score.p1 !== "" && f1Score.p2 !== "") {
      if (f1Score.p1 > f1Score.p2) {
        winnerName = bracketTree.match.p1.name;
        winnerTeam = bracketTree.match.p1.team;
      } else if (f1Score.p2 > f1Score.p1) {
        winnerName = bracketTree.match.p2.name;
        winnerTeam = bracketTree.match.p2.team;
      }
    }

    if (
      winnerName &&
      winnerName !== "Venc. S1" &&
      winnerName !== "Venc. S2" &&
      winnerName !== "TBD"
    ) {
      return { name: winnerName, team: winnerTeam };
    }
    return null;
  }, [bracketTree, knockoutScores]);

  useEffect(() => {
    if (
      grandChampion &&
      !hasFiredConfetti &&
      typeof window.confetti === "function"
    ) {
      const timer = setTimeout(() => {
        window.confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#fbbf24", "#f59e0b", "#ffffff", "#eab308"],
        });
        setHasFiredConfetti(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [grandChampion, hasFiredConfetti]);

  const clearAll = () => {
    setModalObj({
      message: "Atenção! Apagar todos os dados da Nuvem e recomeçar?",
      isAlert: false,
      onConfirm: () => {
        setPhase("setup");
        setPlayers(defaultPlayers);
        setAssignments([]);
        setGroups({});
        setMatches([]);
        setKnockoutStep("unstarted");
        setKnockoutPlayers([]);
        setKnockoutDraw([]);
        setKnockoutScores({});
        setActiveTab("groups");
        setRedrawCount(0);
        setHasFiredConfetti(false);
        updateDB({
          phase: "setup",
          players: defaultPlayers,
          assignments: [],
          groups: {},
          matches: [],
          knockoutStep: "unstarted",
          knockoutPlayers: [],
          knockoutDraw: [],
          knockoutScores: {},
        });
        if (onBack) onBack(); // Volta pro Lobby ao encerrar
      },
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <RefreshCw size={32} className="animate-spin text-zinc-600" />
        <p className="text-xs font-bold tracking-widest uppercase text-zinc-400">
          Carregando Nuvem...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto relative w-full pt-4">
      <style>{`
        @media print { 
          @page { margin: 0; } 
          body { padding: 1.5cm; background: white; color: black; } 
          .avoid-page-break { page-break-inside: avoid; break-inside: avoid; } 
        }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      {/* Modais Internos do FC26 */}
      {modalObj && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[150] p-4 backdrop-blur-sm">
          <div className="bg-[#111] p-8 rounded-3xl border border-white/10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200 relative">
            {modalObj.isAlert && (
              <button
                onClick={() => setModalObj(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X size={18} />
              </button>
            )}
            <h3
              className={`text-white text-sm font-black uppercase tracking-wider ${
                modalObj.isAlert ? "mt-4 mb-8" : "mb-8"
              }`}
            >
              {modalObj.message}
            </h3>
            {modalObj.isAlert ? (
              <button
                onClick={() => setModalObj(null)}
                className="px-8 py-3 bg-white text-black font-black uppercase text-xs rounded-full hover:bg-zinc-200 w-full transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                Voltar
              </button>
            ) : (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setModalObj(null)}
                  className="px-6 py-3 text-[#888] font-bold text-xs uppercase hover:text-white w-full transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    modalObj.onConfirm();
                    setModalObj(null);
                  }}
                  className="px-6 py-3 bg-red-600 text-white font-black text-xs uppercase rounded-full hover:bg-red-500 w-full transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  Confirmar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[150] p-4 backdrop-blur-sm">
          <div className="bg-[#111] p-8 rounded-3xl border border-white/10 max-w-lg w-full text-center shadow-2xl animate-in zoom-in duration-200 relative">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-1"
            >
              <X size={18} />
            </button>
            <ClipboardPaste
              className="mx-auto mb-4 text-zinc-400 mt-2"
              size={32}
            />
            <h3 className="text-white text-sm font-black uppercase tracking-wider mb-2">
              Importar Lista de Jogadores
            </h3>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value.toUpperCase())}
              className="w-full bg-black border border-[#333] rounded-2xl px-4 py-3 text-white mb-6 focus:border-white outline-none transition-all h-40 resize-none uppercase text-xs font-bold custom-scrollbar"
              placeholder="Exemplo: JOÃO, MARIA..."
              autoFocus
            />
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportText("");
                }}
                className="px-6 py-3 text-[#888] font-bold text-xs uppercase hover:text-white w-full transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportList}
                className="px-6 py-3 bg-white text-black font-black text-xs uppercase rounded-full hover:bg-zinc-200 w-full transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                Importar Nomes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SETUP (VISITANTE / BLOQUEIO DE TELA) --- */}
      {phase === "setup" && !isAdmin && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in fade-in duration-500">
          <Shield className="text-zinc-600 mb-4" size={48} />
          <h2 className="text-white tracking-[0.2em] uppercase text-sm font-black mb-2">
            Acesso Restrito
          </h2>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
            O campeonato ainda não foi iniciado pelo administrador.
          </p>
        </div>
      )}

      {/* --- SETUP (ADMIN) --- */}
      {phase === "setup" && isAdmin && (
        <div className="max-w-5xl mx-auto w-full animate-in fade-in pt-8">
          <div className="flex flex-col items-center justify-center mb-12">
            <img
              src="/logo.png"
              alt="Brandão Cup"
              className="w-32 md:w-40 h-auto mb-6 object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                if (target.nextSibling)
                  target.nextSibling.style.display = "flex";
              }}
            />
            <div className="hidden w-20 h-20 bg-white/5 border border-white/10 rounded-full items-center justify-center mb-4 backdrop-blur-md">
              <Shield size={24} className="text-white" />
            </div>
            <h2 className="text-zinc-600 tracking-[0.3em] uppercase text-sm font-black mt-2 flex items-center gap-2">
              BRANDÃO CUP 26
            </h2>
          </div>

          <div className="bg-transparent relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                  <Users size={18} className="text-zinc-400" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-[0.2em] flex items-center gap-3 text-white">
                  Participantes
                </h2>
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black px-3 py-1 rounded-lg text-sm shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                  {players.filter((p) => p.trim() !== "").length}/24
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-transparent border border-white/10 text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest py-3 px-5 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <ClipboardPaste size={14} /> Colar da Área de Transf.
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10">
              {players.map((p, i) => (
                <div
                  key={i}
                  className="relative bg-[#050505] border border-[#1a1a1a] rounded-2xl p-1.5 group focus-within:border-white/20 focus-within:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300"
                >
                  <div className="absolute -top-3 -left-3 w-7 h-7 bg-[#111] border border-[#222] rounded-full flex items-center justify-center text-[10px] font-black text-zinc-500 z-10 shadow-lg">
                    {i + 1}
                  </div>
                  <input
                    type="text"
                    value={p}
                    onChange={(e) => {
                      const n = [...players];
                      n[i] = e.target.value.toUpperCase();
                      setPlayers(n);
                      updateDB({ players: n });
                    }}
                    className="w-full bg-[#0a0a0a] rounded-xl px-4 py-4 text-xs font-bold text-white uppercase transition-all placeholder:text-zinc-800 outline-none"
                    placeholder={`NOME ${i + 1}`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <button
                  onClick={clearAll}
                  className="text-zinc-600 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Limpar Nomes
                </button>
                <button
                  onClick={fillDummyNames}
                  className="text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <Zap size={14} /> Preencher
                </button>
              </div>
              <button
                onClick={() => performDraw(0)}
                className="bg-white text-black hover:bg-zinc-200 font-black uppercase text-xs py-4 px-10 rounded-full flex items-center justify-center gap-2 transition-all w-full md:w-auto shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <Dices size={18} /> Sortear Equipes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DRAW VISITANTE --- */}
      {phase === "draw" && !isAdmin && (
        <div className="relative flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500 overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-8 shadow-2xl backdrop-blur-md">
              <Dices size={48} className="text-zinc-400 animate-bounce" />
            </div>
            <h2 className="text-white tracking-[0.2em] uppercase text-2xl font-black mt-2 drop-shadow-md">
              Equipes Sorteadas!
            </h2>
            <div className="mt-10 flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-8 py-4 rounded-full shadow-xl">
              <Loader2 size={16} className="text-zinc-500 animate-spin" />
              <span className="text-[#888] uppercase tracking-widest text-xs font-black">
                Aguardando o administrador gerar os grupos...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- DRAW ADMIN --- */}
      {phase === "draw" && isAdmin && (
        <div className="max-w-5xl mx-auto w-full animate-in fade-in pt-8">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-8 print:hidden relative z-20">
            <div className="flex items-center gap-4 mx-auto xl:mx-0">
              <img
                src="/logo.png"
                alt="Brandão Cup Logo"
                className="w-12 h-12 md:w-14 md:h-14 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="hidden w-14 h-14 bg-white/5 backdrop-blur-md border border-white/10 rounded-full items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                  BRANDÃO CUP
                  <div className="flex items-center gap-2 border border-green-500/30 bg-green-500/10 px-2.5 py-1 rounded-md shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-pulse"></span>
                    <span className="text-[8px] md:text-[9px] font-black tracking-widest uppercase text-green-500 hidden sm:block">
                      Em Andamento
                    </span>
                  </div>
                </h1>
              </div>
            </div>
          </div>

          <div className="bg-[#0f0f0f] rounded-3xl border border-[#222] shadow-2xl overflow-hidden mt-6">
            <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-[#050505]">
              {assignments.map((a, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl bg-[#0a0a0a] border border-[#222] gap-2 shadow-sm transition-colors hover:bg-[#111]"
                >
                  <div className="font-bold text-[10px] md:text-xs uppercase text-white truncate w-full tracking-wider text-center">
                    {a.player}
                  </div>
                  <div className="flex items-center justify-center gap-2 w-full">
                    <span className="font-black text-[#888] uppercase text-[8px] md:text-[9px] tracking-widest truncate text-center">
                      {a.team.name}
                    </span>
                    <TeamLogo
                      src={a.team.logo}
                      alt={a.team.name}
                      className="w-4 h-4 md:w-5 md:h-5 object-contain shrink-0"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 md:p-6 bg-[#0f0f0f] border-t border-[#222] flex flex-col md:flex-row justify-between items-center gap-4">
              <button
                onClick={() => {
                  setPhase("setup");
                  updateDB({ phase: "setup" });
                }}
                className="text-[#888] hover:text-white font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 w-full md:w-auto justify-center"
              >
                <ArrowLeft size={14} /> Voltar
              </button>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <button
                  onClick={() => {
                    setRedrawCount((r) => r + 1);
                    performDraw(redrawCount + 1);
                  }}
                  className="text-[#888] hover:text-white font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-[#333] px-4 py-3 md:py-2 rounded-full"
                >
                  <RefreshCw size={12} /> Refazer Sorteio
                </button>
                <button
                  onClick={generateTournament}
                  className="bg-white text-black hover:bg-zinc-200 font-black uppercase text-[10px] md:text-[11px] tracking-widest py-3 px-8 rounded-full flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  Gerar Grupos <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TOURNAMENT --- */}
      {phase === "tournament" && (
        <div className="pt-8">
          <div className="flex flex-col items-center justify-center gap-5 mb-10 print:hidden relative z-20">
            {/* Título e Logo */}
            <div className="flex items-center justify-center gap-3 md:gap-4 w-full">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <h1 className="text-xl md:text-3xl font-black uppercase tracking-widest text-white flex items-center">
                KINGS LEAGUE BRANDÃO
                {grandChampion ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 ml-3"></span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-pulse ml-3"></span>
                )}
              </h1>
            </div>

            {/* Botões de Ação (Abaixo do Título) */}
            {isAdmin && (
              <div className="flex items-center justify-center gap-3">
                <button className="text-zinc-600 border border-[#222] bg-transparent rounded-full px-5 py-2 text-[9px] font-bold tracking-widest uppercase flex items-center gap-2 cursor-not-allowed">
                  <ArrowLeft size={12} /> Desfazer
                </button>
                <button
                  onClick={simulateGroupMatches}
                  className="text-zinc-400 hover:text-white border border-[#222] bg-transparent hover:bg-[#111] rounded-full px-5 py-2 text-[9px] font-bold tracking-widest uppercase flex items-center gap-2 transition-colors"
                >
                  <Zap size={12} /> Simular Resultados
                </button>
              </div>
            )}

            {/* Abas */}
            <div className="w-full mt-4">
              <div className="flex overflow-x-auto custom-scrollbar gap-2 md:gap-3 w-full pb-3 md:pb-0 justify-start md:justify-center px-4 md:px-0">
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
                  id="teams"
                  active={activeTab}
                  onClick={setActiveTab}
                  icon={SoccerBallIcon}
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

          {/* PÓDIO DO CAMPEÃO */}
          {grandChampion && (
            <div className="max-w-xl mx-auto mb-10 mt-4 animate-in slide-in-from-bottom-8 duration-1000 px-4 md:px-0">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col items-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                <Trophy
                  size={24}
                  strokeWidth={1.5}
                  className="text-amber-500 mb-4 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                />
                <h2 className="text-zinc-500 font-bold text-[9px] md:text-[10px] tracking-[0.4em] uppercase mb-6">
                  O Grande Campeão
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-5 md:gap-8 z-10 w-full justify-center">
                  <TeamLogo
                    src={grandChampion.team.logo}
                    className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl"
                  />
                  <div className="flex flex-col items-center md:items-start border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
                    <span className="text-white font-black text-2xl md:text-3xl uppercase tracking-wider mb-1 text-center md:text-left leading-none drop-shadow-lg">
                      {grandChampion.name}
                    </span>
                    <span className="text-amber-500 font-bold text-[9px] md:text-xs uppercase tracking-[0.3em]">
                      {grandChampion.team.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA DE GRUPOS */}
          {activeTab === "groups" && (
            <div className="space-y-4 max-w-7xl mx-auto animate-in fade-in pb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[340px] sm:max-w-none mx-auto">
                {GROUPS_KEYS.map((g) => (
                  <GroupTable
                    key={g}
                    groupName={g}
                    standings={groupStandings[g]}
                    matches={matches.filter((m) => m.group === g)}
                    updateMatchScore={updateMatchScore}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ABA DE TIMES / ARTILHARIA */}
          {activeTab === "teams" && (
            <div className="max-w-5xl mx-auto w-full animate-in fade-in duration-500">
              <div className="bg-[#050505]/80 backdrop-blur-md rounded-3xl overflow-hidden border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                  <Shield size={20} className="text-zinc-500" />
                  <h2 className="text-[13px] font-black text-white uppercase tracking-[0.2em]">
                    Equipas e Participantes
                  </h2>
                </div>

                <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 bg-transparent">
                  {assignments.map((a, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-sm gap-2 backdrop-blur-sm"
                    >
                      <div className="font-black text-xs md:text-sm uppercase text-white truncate w-full tracking-wider text-center">
                        {a.player}
                      </div>
                      <div className="flex items-center justify-center gap-2 w-full">
                        <span className="font-black text-zinc-400 uppercase text-[8px] md:text-[10px] tracking-widest truncate text-center">
                          {a.team.name}
                        </span>
                        <TeamLogo
                          src={a.team.logo}
                          alt={a.team.name}
                          className="w-4 h-4 md:w-5 md:h-5 object-contain drop-shadow-md shrink-0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA GERAL */}
          {activeTab === "general" && (
            <div className="max-w-6xl mx-auto animate-in fade-in">
              <p className="md:hidden text-[#666] text-[9px] text-center uppercase tracking-widest mb-3 animate-pulse">
                ↔ Deslize a barra abaixo
              </p>
              <div className="flex overflow-x-auto custom-scrollbar justify-start md:justify-center mb-6 pb-2 md:pb-0 w-full md:w-auto">
                <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/10 shrink-0 mx-auto">
                  <SubTabBtn
                    id="standings"
                    active={activeGeneralTab}
                    onClick={setActiveGeneralTab}
                    icon={ListOrdered}
                    label="Classificação"
                  />
                  <SubTabBtn
                    id="stats"
                    active={activeGeneralTab}
                    onClick={setActiveGeneralTab}
                    icon={BarChart3}
                    label="Estatísticas"
                  />
                </div>
              </div>

              {activeGeneralTab === "standings" && (
                <div className="bg-[#0f0f0f] rounded-3xl overflow-hidden border border-[#222] shadow-2xl animate-in zoom-in-95 duration-300">
                  <div className="p-4 md:p-5 border-b border-[#222] flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#151515]">
                    <div>
                      <h2 className="text-[13px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <ListOrdered size={16} className="text-zinc-500" />{" "}
                        Classificação Geral
                      </h2>
                      <p className="text-[#666] text-[9px] mt-1 uppercase tracking-widest">
                        Verde: Pote 1 | Azul: Pote 2
                      </p>
                    </div>
                    {knockoutStep === "unstarted" && isAdmin && (
                      <button
                        onClick={() => {
                          const kp = generalStandings.slice(0, 16);
                          setKnockoutPlayers(kp);
                          setKnockoutStep("draw");
                          setActiveTab("knockout");
                          updateDB({
                            knockoutPlayers: kp,
                            knockoutStep: "draw",
                          });
                        }}
                        className="bg-white text-black font-black uppercase tracking-widest py-3 md:py-2.5 px-6 rounded-full flex items-center justify-center gap-2 text-[10px] hover:bg-zinc-200 transition-colors w-full md:w-auto shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      >
                        <Swords size={14} /> Gerar Mata-Mata
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto bg-[#0a0a0a] custom-scrollbar">
                    <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                      <thead className="text-[#666] uppercase bg-[#111] tracking-widest text-[9px]">
                        <tr>
                          <th className="px-5 py-4 font-bold">Pos</th>
                          <th className="px-4 py-4 font-bold">Grp</th>
                          <th className="px-4 py-4 font-bold">Competidor</th>
                          <th className="px-4 py-4 text-center text-white font-bold">
                            PTS
                          </th>
                          <th className="px-3 py-4 text-center font-bold">
                            SG
                          </th>
                          <th className="px-3 py-4 text-center font-bold">V</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#0f0f0f]">
                        {generalStandings.map((st, idx) => {
                          const isPot1 = idx < 8;
                          const isPot2 = idx >= 8 && idx < 16;
                          const isEliminated = idx >= 16;
                          return (
                            <tr
                              key={idx}
                              className={`border-b border-[#1a1a1a] relative transition-all ${
                                isEliminated
                                  ? "opacity-30 grayscale hover:opacity-60"
                                  : "hover:bg-[#151515]"
                              }`}
                            >
                              <td
                                className={`px-5 py-4 font-black text-xs border-l-[4px] ${
                                  isPot1
                                    ? "border-green-500 text-green-500"
                                    : isPot2
                                    ? "border-blue-500 text-blue-400"
                                    : "border-[#333] text-zinc-500"
                                }`}
                              >
                                {idx + 1}º
                              </td>
                              <td
                                className={`px-4 py-4 font-bold text-[10px] ${
                                  isEliminated ? "text-zinc-600" : "text-[#888]"
                                }`}
                              >
                                {st.group}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <TeamLogo
                                    src={st.assign.team.logo}
                                    alt={st.assign.team.name}
                                    className="w-5 h-5 object-contain"
                                  />
                                  <div className="flex flex-col">
                                    <span
                                      className={`font-black uppercase text-[10px] md:text-[11px] tracking-wider ${
                                        isEliminated
                                          ? "text-zinc-400"
                                          : "text-white"
                                      }`}
                                    >
                                      {st.assign.player}
                                    </span>
                                    <span
                                      className={`text-[8px] md:text-[9px] uppercase ${
                                        isEliminated
                                          ? "text-zinc-600"
                                          : "text-[#666]"
                                      }`}
                                    >
                                      {st.assign.team.name}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td
                                className={`px-4 py-4 text-center font-black text-sm ${
                                  isEliminated ? "text-zinc-500" : "text-white"
                                }`}
                              >
                                {st.pts}
                              </td>
                              <td
                                className={`px-3 py-4 text-center font-bold ${
                                  isEliminated ? "text-zinc-600" : "text-[#888]"
                                }`}
                              >
                                {st.sg}
                              </td>
                              <td
                                className={`px-3 py-4 text-center ${
                                  isEliminated ? "text-zinc-600" : "text-[#888]"
                                }`}
                              >
                                {st.v}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeGeneralTab === "stats" && (
                <div className="space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex items-center gap-4 hover:bg-white/10 transition-colors">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 shrink-0">
                        <Trophy
                          size={20}
                          className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[#888] text-[9px] uppercase font-black tracking-widest truncate">
                          Melhor Campanha
                        </p>
                        <p className="text-white font-black uppercase text-sm truncate w-full mt-0.5">
                          {overallStatsTable[0]?.assign?.player || "-"}
                        </p>
                        <p className="text-amber-500 font-bold text-[11px] mt-1 truncate">
                          {overallStatsTable[0]?.aprov || 0}% Aproveitamento
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex items-center gap-4 hover:bg-white/10 transition-colors">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 shrink-0">
                        <SoccerBallIcon
                          size={20}
                          className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[#888] text-[9px] uppercase font-black tracking-widest truncate">
                          Melhor Ataque (Gols Pró)
                        </p>
                        <p className="text-white font-black uppercase text-sm truncate w-full mt-0.5">
                          {overallStatsTable
                            .slice()
                            .sort((a, b) => b.gp - a.gp)[0]?.assign?.player ||
                            "-"}
                        </p>
                        <p className="text-blue-400 font-bold text-[11px] mt-1 truncate">
                          {overallStatsTable
                            .slice()
                            .sort((a, b) => b.gp - a.gp)[0]?.gp || 0}{" "}
                          Gols Marcados
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex items-center gap-4 hover:bg-white/10 transition-colors">
                      <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 shrink-0">
                        <Shield
                          size={20}
                          className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[#888] text-[9px] uppercase font-black tracking-widest truncate">
                          Melhor Defesa (Menos GC)
                        </p>
                        <p className="text-white font-black uppercase text-sm truncate w-full mt-0.5">
                          {overallStatsTable
                            .slice()
                            .filter((s) => s.j > 0)
                            .sort((a, b) => a.gc - b.gc)[0]?.assign?.player ||
                            "-"}
                        </p>
                        <p className="text-green-400 font-bold text-[11px] mt-1 truncate">
                          {overallStatsTable
                            .slice()
                            .filter((s) => s.j > 0)
                            .sort((a, b) => a.gc - b.gc)[0]?.gc || 0}{" "}
                          Gols Sofridos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0f0f0f] rounded-3xl overflow-hidden border border-[#222] shadow-2xl">
                    <div className="p-5 border-b border-[#222] bg-[#151515]">
                      <h2 className="text-[13px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <BarChart3 size={16} className="text-zinc-500" /> Tabela
                        Completa (Geral + Mata-Mata)
                      </h2>
                    </div>
                    <div className="overflow-x-auto bg-[#0a0a0a] custom-scrollbar pb-2">
                      <table className="w-full text-xs text-left border-collapse whitespace-nowrap min-w-[700px]">
                        <thead className="text-[#666] uppercase bg-[#111] tracking-widest text-[9px]">
                          <tr>
                            <th className="px-5 py-4 font-bold w-12">Pos</th>
                            <th className="px-4 py-4 font-bold">Competidor</th>
                            <th className="px-3 py-4 font-bold text-center">
                              J
                            </th>
                            <th className="px-3 py-4 font-bold text-center text-green-500">
                              V
                            </th>
                            <th className="px-3 py-4 font-bold text-center text-zinc-400">
                              E
                            </th>
                            <th className="px-3 py-4 font-bold text-center text-red-500">
                              D
                            </th>
                            <th className="px-3 py-4 font-bold text-center text-blue-400">
                              GP
                            </th>
                            <th className="px-3 py-4 font-bold text-center text-orange-400">
                              GC
                            </th>
                            <th className="px-3 py-4 font-bold text-center">
                              SG
                            </th>
                            <th className="px-4 py-4 font-bold text-center w-32">
                              APROV.
                            </th>
                            <th className="px-5 py-4 text-center text-white font-black">
                              PTS
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-[#0f0f0f]">
                          {overallStatsTable.map((st, idx) => (
                            <tr
                              key={st.assign.player}
                              className="border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors relative"
                            >
                              <td className="px-5 py-4 font-black text-xs text-zinc-500 border-l-[4px] border-zinc-700">
                                {idx + 1}º
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <TeamLogo
                                    src={st.assign.team.logo}
                                    alt={st.assign.team.name}
                                    className="w-5 h-5 object-contain"
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-black uppercase text-[10px] md:text-[11px] tracking-wider text-white truncate max-w-[120px] lg:max-w-none">
                                      {st.assign.player}
                                    </span>
                                    <span className="text-[8px] md:text-[9px] uppercase text-[#666] truncate max-w-[120px] lg:max-w-none">
                                      {st.assign.team.name}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-4 text-center font-bold text-zinc-400">
                                {st.j}
                              </td>
                              <td className="px-3 py-4 text-center font-bold text-green-500/80">
                                {st.v}
                              </td>
                              <td className="px-3 py-4 text-center font-bold text-zinc-500">
                                {st.e}
                              </td>
                              <td className="px-3 py-4 text-center font-bold text-red-500/80">
                                {st.d}
                              </td>
                              <td className="px-3 py-4 text-center font-bold text-blue-400">
                                {st.gp}
                              </td>
                              <td className="px-3 py-4 text-center font-bold text-orange-400/80">
                                {st.gc}
                              </td>
                              <td className="px-3 py-4 text-center font-bold text-[#888]">
                                {st.sg}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <span className="font-bold text-[10px] text-zinc-300 w-8">
                                    {st.aprov}%
                                  </span>
                                  <div className="w-12 h-1.5 bg-[#222] rounded-full overflow-hidden">
                                    <div
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          Math.max(0, parseFloat(st.aprov))
                                        )}%`,
                                      }}
                                      className={`h-full ${
                                        parseFloat(st.aprov) >= 50
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-center font-black text-sm text-white">
                                {st.pts}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA MATA MATA */}
          {activeTab === "knockout" && (
            <div className="w-full animate-in fade-in">
              {knockoutStep === "unstarted" && (
                <div className="bg-[#0f0f0f] rounded-3xl p-6 md:p-10 text-center border border-[#222] max-w-xl mx-auto shadow-2xl">
                  <Shield className="text-[#333] mx-auto mb-4" size={48} />
                  <h2 className="text-sm font-black mb-2 uppercase tracking-[0.2em] text-white">
                    Chave Não Gerada
                  </h2>
                  <p className="text-[#666] mb-8 text-[10px] uppercase tracking-widest">
                    {isAdmin
                      ? "Acesse a aba Geral para iniciar o sorteio dos potes."
                      : "Aguardando o administrador iniciar o sorteio..."}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab("general")}
                      className="bg-white text-black py-3 px-6 rounded-full text-[10px] font-black uppercase inline-flex items-center justify-center gap-2 tracking-widest hover:bg-zinc-200 w-full md:w-auto"
                    >
                      Ir para Classificação <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              )}

              {knockoutStep === "draw" && (
                <div className="max-w-6xl mx-auto px-2 md:px-4">
                  <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.3em] mb-2">
                      Sorteio das Oitavas
                    </h2>
                    <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                      Os confrontos definirão toda a chave
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 md:gap-12 mb-10 md:mb-12">
                    {/* POTE 1 */}
                    <div className="bg-[#050505] border border-[#111] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-30"></div>
                      <div className="flex items-center justify-center gap-3 mb-8">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
                        <h3 className="text-green-500 font-black uppercase tracking-[0.3em] text-xs md:text-sm">
                          Pote 1{" "}
                          <span className="text-green-500/50 text-[9px] md:text-[10px] ml-1">
                            (Top 8)
                          </span>
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {knockoutPlayers.slice(0, 8).map((p) => {
                          const isDrawn = knockoutDraw.some(
                            (m) => m.p1.assign.player === p.assign.player
                          );
                          return (
                            <div
                              key={p.assign.player}
                              className={`p-4 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] text-xs flex justify-between items-center transition-all duration-500 ${
                                isDrawn
                                  ? "opacity-20 grayscale scale-[0.98]"
                                  : "shadow-md"
                              }`}
                            >
                              <span className="font-black text-white uppercase tracking-wider truncate max-w-[150px] md:max-w-none">
                                {p.assign.player}
                              </span>
                              <TeamLogo
                                src={p.assign.team.logo}
                                className="w-5 h-5 md:w-6 md:h-6 object-contain shrink-0 drop-shadow-md"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* POTE 2 */}
                    <div className="bg-[#050505] border border-[#111] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
                      <div className="flex items-center justify-center gap-3 mb-8">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
                        <h3 className="text-blue-500 font-black uppercase tracking-[0.3em] text-xs md:text-sm">
                          Pote 2{" "}
                          <span className="text-blue-500/50 text-[9px] md:text-[10px] ml-1">
                            (9º ao 16º)
                          </span>
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {knockoutPlayers.slice(8, 16).map((p) => {
                          const isDrawn = knockoutDraw.some(
                            (m) => m.p2.assign.player === p.assign.player
                          );
                          return (
                            <div
                              key={p.assign.player}
                              className={`p-4 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] text-xs flex justify-between items-center transition-all duration-500 ${
                                isDrawn
                                  ? "opacity-20 grayscale scale-[0.98]"
                                  : "shadow-md"
                              }`}
                            >
                              <span className="font-black text-white uppercase tracking-wider truncate max-w-[150px] md:max-w-none">
                                {p.assign.player}
                              </span>
                              <TeamLogo
                                src={p.assign.team.logo}
                                className="w-5 h-5 md:w-6 md:h-6 object-contain shrink-0 drop-shadow-md"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {isAdmin && knockoutDraw.length < 8 && !isDrawing && (
                    <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-5 mb-10">
                      <button
                        onClick={() => performKnockoutDraw(false)}
                        className="bg-white text-black hover:bg-zinc-200 font-black uppercase text-[10px] md:text-xs py-4 px-8 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 transition-colors"
                      >
                        <PlaySquare size={16} /> Iniciar Sorteio
                      </button>
                      <button
                        onClick={() => performKnockoutDraw(true)}
                        className="bg-[#111] text-zinc-400 hover:text-white border border-[#333] font-black uppercase text-[10px] md:text-xs py-4 px-8 rounded-full transition-colors flex items-center justify-center gap-2 hover:bg-[#1a1a1a]"
                      >
                        <Zap size={14} /> Pular Animação
                      </button>
                    </div>
                  )}

                  {!isAdmin && knockoutDraw.length < 8 && (
                    <div className="flex justify-center mb-10">
                      <div className="bg-[#111] border border-[#222] px-6 py-4 rounded-full flex items-center gap-3">
                        <Loader2
                          size={16}
                          className="text-zinc-500 animate-spin"
                        />
                        <span className="text-[#888] font-bold text-[9px] md:text-[10px] uppercase tracking-widest">
                          Aguardando o Sorteio...
                        </span>
                      </div>
                    </div>
                  )}

                  {knockoutDraw.length > 0 && (
                    <div className="mt-8 border-t border-[#111] pt-10 md:pt-12 animate-in fade-in">
                      <h3 className="text-center text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-8">
                        Confrontos Definidos
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {knockoutDraw.map((m, i) => (
                          <div
                            key={i}
                            className="bg-[#050505] border border-[#1a1a1a] rounded-3xl p-4 md:p-5 text-center shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden"
                          >
                            <div className="text-[8px] md:text-[9px] text-[#555] font-black uppercase tracking-[0.2em] mb-4">
                              Confronto {i + 1}
                            </div>

                            <div className="flex items-center justify-between bg-gradient-to-r from-green-500/10 to-transparent p-3 rounded-2xl border border-green-500/10 mb-3">
                              <span className="text-[10px] md:text-[11px] text-white font-black uppercase tracking-wider truncate">
                                {m.p1.assign.player}
                              </span>
                              <TeamLogo
                                src={m.p1.assign.team.logo}
                                className="w-5 h-5 shrink-0 object-contain ml-2"
                              />
                            </div>

                            <div className="text-[10px] font-black text-zinc-700 my-2">
                              X
                            </div>

                            <div className="flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-transparent p-3 rounded-2xl border border-blue-500/10 mt-3">
                              <span className="text-[10px] md:text-[11px] text-white font-black uppercase tracking-wider truncate">
                                {m.p2.assign.player}
                              </span>
                              <TeamLogo
                                src={m.p2.assign.team.logo}
                                className="w-5 h-5 shrink-0 object-contain ml-2"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {knockoutDraw.length === 8 && !isDrawing && isAdmin && (
                    <div className="flex justify-center mt-12 mb-10 animate-in slide-in-from-bottom-4">
                      <button
                        onClick={() => {
                          setKnockoutStep("bracket");
                          updateDB({ knockoutStep: "bracket" });
                        }}
                        className="bg-amber-500 text-black font-black uppercase text-xs md:text-sm py-4 px-10 rounded-full hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 w-full md:w-auto"
                      >
                        <Swords size={18} /> Gerar Chave Oficial
                      </button>
                    </div>
                  )}
                </div>
              )}

              {knockoutStep === "bracket" && (
                <div className="w-full">
                  {isAdmin && (
                    <div className="w-full flex justify-end mb-4 md:mb-6 px-2 md:px-4 print:hidden">
                      <button
                        onClick={simulateCurrentKnockout}
                        className="bg-white/5 backdrop-blur-md hover:bg-white/10 text-amber-500 hover:text-amber-400 py-2.5 md:py-2 px-5 rounded-full text-[9px] md:text-[10px] font-bold uppercase flex items-center gap-2 border border-white/10 transition-colors shadow-lg"
                      >
                        <Zap size={14} /> Simular Rodada
                      </button>
                    </div>
                  )}

                  <p className="md:hidden text-[#666] text-[9px] text-center uppercase tracking-widest mb-4 animate-pulse flex flex-col items-center gap-1">
                    <span className="text-[12px]">↕ ↔</span> Deslize para
                    explorar a chave
                  </p>

                  <div className="overflow-auto w-full h-[75vh] min-h-[800px] md:h-auto md:min-h-0 custom-scrollbar border border-[#1a1a1a] md:border-transparent rounded-3xl bg-[#050505] md:bg-transparent p-2 md:p-0 relative shadow-inner md:shadow-none">
                    <div className="min-w-max w-fit mx-auto relative pb-6 md:pb-10">
                      <div className="flex mb-4 md:mb-8 border-b border-[#222] pb-3 md:pb-4 items-center justify-start gap-4 md:gap-8 px-2 md:px-4 lg:px-6 sticky top-0 bg-[#050505] md:bg-transparent z-20">
                        <div className="w-[150px] md:w-48 lg:w-56 text-center text-[#555] font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em]">
                          Oitavas
                        </div>
                        <div className="w-[150px] md:w-48 lg:w-56 text-center text-[#555] font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em]">
                          Quartas
                        </div>
                        <div className="w-[150px] md:w-48 lg:w-56 text-center text-[#555] font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em]">
                          Semis
                        </div>
                        <div className="w-[150px] md:w-48 lg:w-56 text-center text-amber-500 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em]">
                          Grande Final
                        </div>
                      </div>
                      <div className="flex justify-start px-2 md:px-0">
                        <BracketNode
                          node={bracketTree}
                          knockoutScores={knockoutScores}
                          updateKoScore={updateKoScore}
                          direction="left"
                          isAdmin={isAdmin}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA SÚMULA */}
          {activeTab === "summary" && (
            <div className="max-w-6xl mx-auto animate-in fade-in">
              <p className="md:hidden text-[#666] text-[9px] text-center uppercase tracking-widest mb-3 animate-pulse">
                ↔ Deslize a barra abaixo
              </p>
              <div className="flex overflow-x-auto custom-scrollbar justify-start md:justify-center bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/10 mb-10 w-full md:w-fit mx-auto shadow-xl pb-2 md:pb-1.5">
                <TabBtn
                  id="groups"
                  active={activeSummaryTab}
                  onClick={setActiveSummaryTab}
                  label="Fase de Grupos"
                />
                <TabBtn
                  id="round16"
                  active={activeSummaryTab}
                  onClick={setActiveSummaryTab}
                  label="Oitavas"
                />
                <TabBtn
                  id="quarters"
                  active={activeSummaryTab}
                  onClick={setActiveSummaryTab}
                  label="Quartas"
                />
                <TabBtn
                  id="semis"
                  active={activeSummaryTab}
                  onClick={setActiveSummaryTab}
                  label="Semis"
                />
                <TabBtn
                  id="final"
                  active={activeSummaryTab}
                  onClick={setActiveSummaryTab}
                  label="Final"
                />
              </div>

              {activeSummaryTab === "groups" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {GROUPS_KEYS.map((g) => {
                    const groupMatches = matches.filter((m) => m.group === g);
                    if (groupMatches.length === 0) return null;
                    return (
                      <div
                        key={g}
                        className="bg-[#0f0f0f] border border-[#222] rounded-3xl overflow-hidden shadow-lg"
                      >
                        <div className="bg-[#151515] border-b border-[#222] p-4 text-center flex items-center justify-center gap-3">
                          <div className="w-5 h-5 bg-white text-black text-[10px] rounded-md flex items-center justify-center font-black">
                            {g}
                          </div>
                          <span className="font-black text-white text-[12px] uppercase tracking-[0.3em]">
                            Grupo {g}
                          </span>
                        </div>
                        <div className="p-4 space-y-3">
                          {groupMatches.map((m) => (
                            <SummaryMatchCard
                              key={m.id}
                              match={m}
                              score1={m.score1}
                              score2={m.score2}
                              isKnockout={false}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeSummaryTab !== "groups" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {(() => {
                    if (knockoutStep !== "bracket") {
                      return (
                        <div className="col-span-full py-10 md:py-20 text-center">
                          <Shield
                            className="mx-auto text-[#333] mb-4"
                            size={48}
                          />
                          <h3 className="text-white text-xs md:text-sm font-black uppercase tracking-[0.2em] mb-2">
                            Fase Não Iniciada
                          </h3>
                          <p className="text-zinc-500 text-[10px] md:text-xs tracking-widest uppercase font-bold px-4">
                            O sorteio e a geração da chave ainda não foram
                            concluídos.
                          </p>
                        </div>
                      );
                    }

                    let filterTag = "";
                    if (activeSummaryTab === "round16") filterTag = "Oitavas";
                    if (activeSummaryTab === "quarters") filterTag = "Quartas";
                    if (activeSummaryTab === "semis") filterTag = "Meia";
                    if (activeSummaryTab === "final") filterTag = "Final";

                    const filteredMatches = allKnockoutMatchesFlat.filter(
                      (m) => m.tag && m.tag.includes(filterTag)
                    );
                    if (filteredMatches.length === 0) return null;

                    return filteredMatches.map((m) => {
                      const score = knockoutScores[m.id] || {
                        s1: "",
                        s2: "",
                        p1: "",
                        p2: "",
                      };
                      return (
                        <SummaryMatchCard
                          key={m.id}
                          match={m}
                          score1={score.s1}
                          score2={score.s2}
                          p1={score.p1}
                          p2={score.p2}
                          isKnockout={true}
                        />
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer Admin */}
      {phase !== "setup" && isAdmin && (
        <div className="mt-12 md:mt-20 pt-6 md:pt-8 text-center pb-6 md:pb-8 print:hidden animate-in fade-in">
          <button
            onClick={clearAll}
            className="text-[#444] hover:text-red-500 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 mx-auto p-2 transition-colors"
          >
            <Trash2 size={12} /> Encerrar Campeonato e Apagar Dados
          </button>
        </div>
      )}
    </div>
  );
}
