import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";

const supabase = createClient(
  "https://ysbkacbiezmpzlfmlmix.supabase.co",
  "sb_publishable_pouKFZC07R6I6qL1uLESJg_ABjLkBOf"
);

const STATUTS = ["Reçue", "En diagnostic", "En réparation", "En attente de pièce", "Prête", "Rendue"];
const STATUTS_BOUTONS = ["En diagnostic", "En réparation", "En attente de pièce", "Prête", "Rendue"];
const REPARATIONS = ["Changement de pile", "Révision complète", "Changement de verre", "Réglage de bracelet", "Remise en marche", "Nettoyage & graissage", "Changement de couronne", "Étanchéité", "Aiguillage", "Collage index", "Autre (écrire)"];

const STATUT_COLORS = {
  "Reçue": { accent: "#1A5FA8", bgLight: "#B8D9F5", rowBg: "#C8E4FF" },
  "En diagnostic": { accent: "#6B1E9E", bgLight: "#DFB0F7", rowBg: "#EAC8FF" },
  "En réparation": { accent: "#B84A00", bgLight: "#FAC898", rowBg: "#FFD9B0" },
  "En attente de pièce": { accent: "#A07800", bgLight: "#F5DC60", rowBg: "#FFE870" },
  "Prête": { accent: "#1A6E35", bgLight: "#90DCA8", rowBg: "#A8EFC0" },
  "Rendue": { accent: "#8B1A1A", bgLight: "#F0A0A0", rowBg: "#FFB8B8" },
};

function isOld(dateStr, statut) {
  if (!dateStr || statut === "Rendue") return false;
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24)) >= 30;
}

function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    setError(""); setLoading(true);
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      if (data?.user) {
        await supabase.from("subscriptions").insert([{ user_id: data.user.id, status: "trial", trial_start: new Date().toISOString() }]);
        setError("✅ Compte créé ! 15 jours d'essai gratuit !");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("❌ Email ou mot de passe incorrect !");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4f0 0%, #e8f0e8 50%, #f5f5f7 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 28, padding: 48, maxWidth: 420, width: "90%", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, background: "linear-gradient(135deg, #34C759, #2E8B4A)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 16px" }}>⌚</div>
          <h1 style={{ fontSize: 24, fontWeight: "800", color: "#1d1d1f", marginBottom: 4 }}>WatchTrack MontrePro</h1>
          <p style={{ color: "#86868b", fontSize: 14 }}>{isSignUp ? "Créer un compte — 15 jours gratuits !" : "Connectez-vous à votre atelier"}</p>
        </div>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: "14px 16px", background: "rgba(118,118,128,0.08)", border: "none", borderRadius: 12, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAuth()}
          style={{ width: "100%", padding: "14px 16px", background: "rgba(118,118,128,0.08)", border: "none", borderRadius: 12, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
        {error && <p style={{ color: error.includes("✅") ? "#2E8B4A" : "#FF3B30", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{error}</p>}
        <button onClick={handleAuth} disabled={loading}
          style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #34C759, #2E8B4A)", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: "700", fontFamily: "inherit", cursor: "pointer", marginBottom: 16 }}>
          {loading ? "⏳" : isSignUp ? "Créer mon compte — Gratuit 15 jours" : "Se connecter"}
        </button>
        <p style={{ textAlign: "center", fontSize: 13, color: "#86868b" }}>
          {isSignUp ? "Déjà un compte ? " : "Pas encore de compte ? "}
          <span onClick={() => { setIsSignUp(!isSignUp); setError(""); }} style={{ color: "#2E8B4A", cursor: "pointer", fontWeight: "600" }}>
            {isSignUp ? "Se connecter" : "Créer un compte gratuit"}
          </span>
        </p>
        {isSignUp && (
          <div style={{ marginTop: 20, padding: 16, background: "rgba(52,199,89,0.08)", borderRadius: 12, border: "1px solid rgba(52,199,89,0.2)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#2E8B4A", fontWeight: "600", margin: 0 }}>🎁 15 jours gratuits — Aucune carte bancaire requise !</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TrialExpiredPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background: "rgba(255,255,255,0.97)", borderRadius: 28, padding: 48, maxWidth: 560, width: "90%", textAlign: "center", boxShadow: "0 40px 100px rgba(0,0,0,0.4)" }}>
        <div style={{ width: 70, height: 70, background: "linear-gradient(135deg, #34C759, #2E8B4A)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>⌚</div>
        <h2 style={{ color: "#1d1d1f", fontSize: 22, marginBottom: 8, fontWeight: "700" }}>WatchTrack MontrePro</h2>
        <p style={{ color: "#86868b", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Votre période d'essai de 15 jours est terminée.<br />Choisissez une formule pour continuer !
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          <a href="https://buy.stripe.com/00w14ncT29W28fD8o26g804" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <div style={{ background: "linear-gradient(135deg, #f0f9f4, #e0f2e9)", borderRadius: 18, padding: 20, cursor: "pointer", border: "1.5px solid rgba(52,199,89,0.3)" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔄</div>
              <div style={{ fontWeight: "700", fontSize: 22, color: "#1d1d1f" }}>19,90€</div>
              <div style={{ fontSize: 12, color: "#2E8B4A", fontWeight: "600" }}>par mois</div>
              <div style={{ fontSize: 11, color: "#86868b", marginTop: 4 }}>Résiliable à tout moment</div>
            </div>
          </a>
          <a href="https://buy.stripe.com/7sY5kD06gb06eE1fQu6g807" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <div style={{ background: "linear-gradient(135deg, #2E8B4A, #1a5c30)", borderRadius: 18, padding: 20, cursor: "pointer" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>💎</div>
              <div style={{ fontWeight: "700", fontSize: 22, color: "white" }}>169€</div>
              <div style={{ fontSize: 12, color: "#a8e6b8", fontWeight: "600" }}>à vie</div>
              <div style={{ fontSize: 11, color: "#6fba82", marginTop: 4 }}>Paiement unique ✨</div>
            </div>
          </a>
        </div>
        <p style={{ color: "#86868b", fontSize: 13, marginBottom: 16 }}>
          Vous avez déjà payé ? Contactez-nous :<br />
          <a href="mailto:watchtrack-pro@outlook.com" style={{ color: "#2E8B4A", fontWeight: "600" }}>watchtrack-pro@outlook.com</a>
        </p>
        <button onClick={() => supabase.auth.signOut()} style={{ padding: "10px 24px", background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: "600", fontFamily: "inherit", color: "#86868b" }}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

function MainApp({ session, subscription }) {
  const [repairs, setRepairs] = useState([]);
  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [zoomTable, setZoomTable] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextFactureId, setNextFactureId] = useState(1);
  const [atelier, setAtelier] = useState({ nom: "", adresse: "", codePostal: "", ville: "", siret: "", email: "", tel: "" });
  const [form, setForm] = useState({
    ticket: "", client: "", tel: "", marque: "", modele: "",
    reparation: REPARATIONS[0], statut: "Reçue", prix: "", acompte: "", date: "", date_returned: "", notes: "",
  });

  const userId = session.user.id;
  const daysLeft = subscription ? Math.max(0, 15 - Math.floor((new Date() - new Date(subscription.trial_start)) / (1000 * 60 * 60 * 24))) : 0;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadRepairs(); loadAtelier(); }, []);

  async function loadRepairs() {
    setLoading(true);
    const { data, error } = await supabase.from("repairs").select("*").eq("user_id", userId).order("id", { ascending: false });
    if (error) console.error("Erreur:", error);
    if (!error) setRepairs(data || []);
    setLoading(false);
  }

  async function loadAtelier() {
    const saved = localStorage.getItem(`atelier_${userId}`);
    if (saved) setAtelier(JSON.parse(saved));
  }

  async function handleSubmit() {
    if (!form.client || !form.marque) { alert("Remplissez le nom et la marque !"); return; }
    const finalReparation = form.reparation === "Autre (écrire)" ? "Autre" : form.reparation;
    const newRepair = {
      user_id: userId, ticket: form.ticket, client: form.client, tel: form.tel,
      marque: form.marque, modele: form.modele, reparation: finalReparation,
      statut: form.statut, prix: form.prix, acompte: form.acompte,
      date: form.date || new Date().toISOString().split("T")[0],
      date_returned: form.date_returned, notes: form.notes,
    };
    const { error } = await supabase.from("repairs").insert([newRepair]);
    if (error) { alert("Erreur: " + error.message); return; }
    await loadRepairs();
    setView("list");
    setForm({ ticket: "", client: "", tel: "", marque: "", modele: "", reparation: REPARATIONS[0], statut: "Reçue", prix: "", acompte: "", date: "", date_returned: "", notes: "" });
  }

  async function updateField(id, field, value) {
    await supabase.from("repairs").update({ [field]: value }).eq("id", id);
    setRepairs(repairs.map(r => r.id === id ? { ...r, [field]: value } : r));
    if (selected?.id === id) setSelected({ ...selected, [field]: value });
  }

  async function deleteRepair(id) {
    await supabase.from("repairs").delete().eq("id", id);
    setRepairs(repairs.filter(r => r.id !== id));
    setConfirmDelete(null);
    setView("list");
  }

  function saveAtelier(newAtelier) {
    setAtelier(newAtelier);
    localStorage.setItem(`atelier_${userId}`, JSON.stringify(newAtelier));
  }

  function downloadExcel() {
    let csv = "N° Ticket,Nom Client,Téléphone,Marque,Modèle,Réparation,Statut,Prix,Acompte,Reste dû,Date dépôt,Date rendu,Notes\n";
    repairs.forEach(r => {
      const resteDu = (parseFloat(r.prix) || 0) - (parseFloat(r.acompte) || 0);
      csv += `"${r.ticket||''}","${r.client}","${r.tel}","${r.marque}","${r.modele}","${r.reparation}","${r.statut}","${r.prix}","${r.acompte||''}","${resteDu.toFixed(2)}","${formatDate(r.date)}","${formatDate(r.date_returned)}","${r.notes||''}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `WatchTrack-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  function imprimerBonDepot(r) {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const resteDu = (parseFloat(r.prix) || 0) - (parseFloat(r.acompte) || 0);
    function drawTicket(startY, titre) {
      doc.setFillColor(74,124,89); doc.rect(0,startY,pageW,12,'F');
      doc.setTextColor(255,255,255); doc.setFontSize(13); doc.setFont("helvetica","bold");
      doc.text("BON DE DEPOT — WatchTrack MontrePro", pageW/2, startY+8, {align:"center"});
      doc.setFillColor(244,228,166); doc.rect(0,startY+12,pageW,8,'F');
      doc.setTextColor(45,62,45); doc.setFontSize(9);
      doc.text(titre, pageW/2, startY+18, {align:"center"});
      doc.setFont("helvetica","bold"); doc.setTextColor(74,124,89);
      doc.text("TICKET", 10, startY+28); doc.text("CLIENT", pageW/2, startY+28);
      doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0);
      doc.text(`N° : ${r.ticket||"—"}`, 10, startY+34);
      doc.text(`${r.client}`, pageW/2, startY+34);
      doc.text(`Tél : ${r.tel||"—"}`, pageW/2, startY+40);
      doc.setDrawColor(200,200,200); doc.line(10,startY+44,pageW-10,startY+44);
      doc.setFont("helvetica","bold"); doc.setTextColor(74,124,89);
      doc.text("MONTRE", 10, startY+50); doc.text("DATES & PRIX", pageW/2, startY+50);
      doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0);
      doc.text(`${r.marque} ${r.modele||""}`, 10, startY+56);
      doc.text(`Réparation : ${r.reparation}`, 10, startY+62);
      doc.text(`Dépôt : ${formatDate(r.date)}`, pageW/2, startY+56);
      doc.text(`Rendu : ${formatDate(r.date_returned)}`, pageW/2, startY+62);
      doc.text(`Prix total : ${r.prix||"À définir"}`, pageW/2, startY+68);
      if (r.acompte && parseFloat(r.acompte) > 0) {
        doc.setTextColor(26,110,53);
        doc.text(`Acompte reçu : ${r.acompte}€`, pageW/2, startY+74);
        doc.setFont("helvetica","bold");
        doc.text(`Reste dû : ${resteDu.toFixed(2)}€`, pageW/2, startY+80);
        doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0);
      }
      if (r.notes) {
        doc.line(10,startY+85,pageW-10,startY+85);
        doc.setFont("helvetica","bold"); doc.setTextColor(74,124,89); doc.text("NOTES :", 10, startY+91);
        doc.setFont("helvetica","italic"); doc.setTextColor(0,0,0);
        doc.text(doc.splitTextToSize(r.notes, pageW-20), 10, startY+97);
      }
      doc.setDrawColor(200,200,200); doc.setLineDash([2,2]); doc.rect(10,startY+102,80,25); doc.setLineDash([]);
      doc.setFontSize(7); doc.setTextColor(150,150,150); doc.text("Tampon atelier", 50, startY+117, {align:"center"});
      doc.setFontSize(8); doc.setTextColor(100,100,100); doc.text("Signature client :", pageW/2+5, startY+107);
      doc.setDrawColor(100,100,100); doc.line(pageW/2+5,startY+122,pageW-10,startY+122);
    }
    drawTicket(5, "✂  EXEMPLAIRE CLIENT");
    doc.setDrawColor(150,150,150); doc.setLineDash([4,3]); doc.line(5,pageH/2,pageW-5,pageH/2); doc.setLineDash([]);
    doc.setFontSize(8); doc.setTextColor(150,150,150); doc.text("✂  Découper ici", pageW/2, pageH/2-2, {align:"center"});
    drawTicket(pageH/2+5, "✂  EXEMPLAIRE ATELIER");
    doc.save(`BonDepot-${r.ticket||r.id}-${r.client.replace(/ /g,"_")}.pdf`);
  }

  function genererFacture(r) {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const year = new Date().getFullYear();
    const numFacture = `FAC-${year}-${String(nextFactureId).padStart(3,"0")}`;
    const prixTTC = parseFloat(r.prix)||0;
    const acompte = parseFloat(r.acompte)||0;
    const resteDu = prixTTC - acompte;
    const prixHT = (prixTTC/1.2).toFixed(2);
    const tva = (prixTTC-parseFloat(prixHT)).toFixed(2);
    doc.setFillColor(74,124,89); doc.rect(0,0,pageW,35,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(24); doc.setFont("helvetica","bold");
    doc.text("FACTURE", pageW/2, 15, {align:"center"});
    doc.setFontSize(11); doc.setFont("helvetica","normal");
    doc.text(`N° ${numFacture}`, pageW/2, 26, {align:"center"});
    doc.setTextColor(0,0,0); doc.setFontSize(11); doc.setFont("helvetica","bold");
    doc.text("PRESTATAIRE", 15, 48); doc.setFont("helvetica","normal"); doc.setFontSize(10);
    doc.text(atelier.nom||"Votre atelier", 15, 57);
    if (atelier.adresse) doc.text(atelier.adresse, 15, 64);
    doc.text(`${atelier.codePostal||""} ${atelier.ville||""}`, 15, 71);
    if (atelier.siret) doc.text(`SIRET : ${atelier.siret}`, 15, 78);
    if (atelier.tel) doc.text(`Tél : ${atelier.tel}`, 15, 85);
    if (atelier.email) doc.text(`Email : ${atelier.email}`, 15, 92);
    doc.setFillColor(244,228,166); doc.rect(110,43,pageW-120,55,'F');
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.text("CLIENT", 115, 52);
    doc.setFont("helvetica","normal"); doc.setFontSize(10);
    doc.text(r.client, 115, 61); doc.text(`Tél : ${r.tel||"—"}`, 115, 68);
    doc.text(`Date : ${new Date().toLocaleDateString("fr-FR")}`, 115, 82);
    doc.text(`Ticket N° : ${r.ticket||"—"}`, 115, 89);
    doc.setFillColor(74,124,89); doc.rect(10,108,pageW-20,10,'F');
    doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(10);
    doc.text("Description", 15, 115); doc.text("HT", 130, 115); doc.text("TVA", 155, 115); doc.text("TTC", 175, 115);
    doc.setTextColor(0,0,0); doc.setFont("helvetica","normal");
    doc.setFillColor(249,251,247); doc.rect(10,118,pageW-20,14,'F');
    doc.text(doc.splitTextToSize(`${r.marque} ${r.modele} — ${r.reparation}`, 110), 15, 126);
    doc.text(`${prixHT}€`, 130, 126); doc.text(`${tva}€`, 155, 126); doc.text(`${prixTTC.toFixed(2)}€`, 175, 126);
    doc.setDrawColor(74,124,89); doc.line(10,140,pageW-10,140);
    if (acompte > 0) {
      doc.setFillColor(240,248,244); doc.rect(130,143,pageW-140,8,'F');
      doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0);
      doc.text("Acompte reçu :", 133, 149); doc.text(`- ${acompte.toFixed(2)}€`, 175, 149);
      doc.setFillColor(74,124,89); doc.rect(130,153,pageW-140,8,'F');
      doc.setTextColor(255,255,255); doc.setFont("helvetica","bold");
      doc.text("RESTE DÛ :", 133, 159); doc.text(`${resteDu.toFixed(2)}€`, 175, 159);
    } else {
      doc.setFillColor(74,124,89); doc.rect(130,143,pageW-140,8,'F');
      doc.setTextColor(255,255,255); doc.setFont("helvetica","bold");
      doc.text("TOTAL TTC :", 133, 149); doc.text(`${prixTTC.toFixed(2)}€`, 175, 149);
    }
    doc.setFillColor(74,124,89); doc.rect(0,285,pageW,12,'F');
    doc.setFontSize(8); doc.setTextColor(255,255,255);
    doc.text("WatchTrack MontrePro — watchtrack-pro.fr", pageW/2, 293, {align:"center"});
    doc.save(`Facture-${numFacture}-${r.client.replace(/ /g,"_")}.pdf`);
    setNextFactureId(nextFactureId+1);
  }

  const filtered = repairs.filter(r => {
    const matchSearch = r.client?.toLowerCase().includes(search.toLowerCase()) ||
      r.marque?.toLowerCase().includes(search.toLowerCase()) ||
      r.modele?.toLowerCase().includes(search.toLowerCase()) ||
      (r.ticket && r.ticket.toLowerCase().includes(search.toLowerCase()));
    return matchSearch && (filterStatut === "Tous" || r.statut === filterStatut);
  });

  const oldRepairs = repairs.filter(r => isOld(r.date, r.statut));
  const stats = {
    total: repairs.length,
    enCours: repairs.filter(r => r.statut !== "Rendue").length,
    pretes: repairs.filter(r => r.statut === "Prête").length,
    attente: repairs.filter(r => r.statut === "En attente de pièce").length,
    ca: repairs.filter(r => r.statut === "Rendue").reduce((s,r) => s+Number(r.prix||0), 0),
    acomptes: repairs.filter(r => r.acompte && parseFloat(r.acompte) > 0).reduce((s,r) => s+Number(r.acompte||0), 0),
  };

  const clientsMap = repairs.reduce((acc, r) => {
    const key = r.client?.toLowerCase().trim();
    if (!key) return acc;
    if (!acc[key]) acc[key] = { nom: r.client, tel: r.tel, montres: [], totalDepense: 0, totalAcompte: 0, derniereVisite: r.date, marquesCount: {} };
    acc[key].montres.push(r);
    acc[key].totalDepense += parseFloat(r.prix)||0;
    acc[key].totalAcompte += parseFloat(r.acompte)||0;
    if (r.date > acc[key].derniereVisite) acc[key].derniereVisite = r.date;
    if (r.marque) acc[key].marquesCount[r.marque] = (acc[key].marquesCount[r.marque]||0)+1;
    return acc;
  }, {});

  const clientsList = Object.values(clientsMap).sort((a,b) => b.montres.length-a.montres.length);
  const filteredClients = clientsList.filter(c => c.nom?.toLowerCase().includes(clientSearch.toLowerCase()) || c.tel?.includes(clientSearch));

  const S = {
    app: { minHeight: "100vh", background: "linear-gradient(160deg, #f0f4f0 0%, #e8f0e8 50%, #f5f5f7 100%)", color: "#1d1d1f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" },
    header: { padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 20px rgba(0,0,0,0.08)" },
    logo: { display: "flex", alignItems: "center", gap: 12 },
    logoIcon: { width: 40, height: 40, background: "linear-gradient(135deg, #34C759 0%, #2E8B4A 100%)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 12px rgba(46,139,74,0.4)" },
    nav: { display: "flex", gap: 4, alignItems: "center" },
    navBtn: (active, hovered) => ({ padding: "8px 16px", background: active ? "linear-gradient(135deg, #34C759 0%, #2E8B4A 100%)" : hovered ? "rgba(0,0,0,0.05)" : "transparent", color: active ? "white" : "#1d1d1f", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: active ? "600" : "500", fontFamily: "inherit", transition: "all 0.2s ease", boxShadow: active ? "0 4px 12px rgba(46,139,74,0.35)" : "none" }),
    main: { padding: "32px", maxWidth: 1400, margin: "0 auto" },
    card: { background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" },
    cardHeader: { padding: "18px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.6)" },
    cardTitle: { fontSize: 13, color: "#86868b", fontWeight: "600", letterSpacing: "0.02em", textTransform: "uppercase" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "12px 20px", textAlign: "left", fontSize: 11, color: "#86868b", borderBottom: "1px solid rgba(0,0,0,0.06)", fontWeight: "600", background: "rgba(248,248,248,0.8)", letterSpacing: "0.05em", textTransform: "uppercase" },
    td: (zoom) => ({ padding: zoom ? "12px 20px" : "8px 20px", borderBottom: "1px solid rgba(0,0,0,0.08)", fontSize: zoom ? 14 : 12, color: "#1d1d1f", verticalAlign: "middle" }),
    badge: (statut) => ({ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: "700", background: STATUT_COLORS[statut]?.bgLight, color: STATUT_COLORS[statut]?.accent||"#666", border: `2px solid ${STATUT_COLORS[statut]?.accent}` }),
    btn: (variant="primary") => ({ padding: "10px 20px", background: variant==="primary" ? "linear-gradient(135deg, #34C759 0%, #2E8B4A 100%)" : variant==="danger" ? "linear-gradient(135deg, #FF3B30 0%, #C0392B 100%)" : variant==="blue" ? "linear-gradient(135deg, #007AFF 0%, #0051D5 100%)" : variant==="purple" ? "linear-gradient(135deg, #AF52DE 0%, #8B3DB8 100%)" : "rgba(0,0,0,0.06)", color: variant==="secondary" ? "#1d1d1f" : "white", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: "600", fontFamily: "inherit", transition: "all 0.2s ease", boxShadow: variant!=="secondary" ? "0 4px 12px rgba(0,0,0,0.15)" : "none" }),
    input: { width: "100%", background: "rgba(118,118,128,0.08)", border: "1.5px solid transparent", borderRadius: 12, padding: "12px 16px", color: "#1d1d1f", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
    label: { fontSize: 12, color: "#86868b", marginBottom: 8, display: "block", fontWeight: "600" },
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
    statCard: { background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: 20, padding: "24px", position: "relative", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" },
    rowColored: (statut) => ({ background: STATUT_COLORS[statut]?.rowBg||"white" }),
    alertBadge: { display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 8, fontSize: 10, fontWeight: "700", background: "#FF3B3015", color: "#FF3B30", marginLeft: 8 },
    acompteBadge: { display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 8, fontSize: 10, fontWeight: "700", background: "rgba(26,110,53,0.1)", color: "#1A6E35", marginLeft: 6 },
    sectionTitle: { fontSize: 22, fontWeight: "700", color: "#1d1d1f", marginBottom: 4, letterSpacing: "-0.5px" },
    sectionSub: { fontSize: 13, color: "#86868b", marginBottom: 24 },
    divider: { height: 1, background: "rgba(0,0,0,0.06)", margin: "24px 0" },
    inlineInput: { background: "rgba(118,118,128,0.06)", border: "1px solid transparent", borderRadius: 8, padding: "5px 10px", color: "#1d1d1f", fontSize: 12, fontFamily: "inherit", outline: "none", width: "100%" },
    dateInput: { background: "rgba(118,118,128,0.08)", border: "none", borderRadius: 8, padding: "5px 10px", color: "#1d1d1f", fontSize: 12, fontFamily: "inherit", outline: "none", cursor: "pointer" },
    noteDisplay: { fontSize: 11, color: "#555", fontStyle: "italic", padding: "6px 8px", background: "rgba(0,0,0,0.04)", borderRadius: 6, minHeight: 28 },
    deleteBtn: { padding: "6px 12px", background: "rgba(255,59,48,0.1)", color: "#FF3B30", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: "700", fontFamily: "inherit" },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
    modal: { background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)", borderRadius: 24, padding: 36, maxWidth: 420, width: "90%", textAlign: "center", boxShadow: "0 32px 80px rgba(0,0,0,0.2)" },
    statusBtn: (active, s) => ({ padding: "8px 16px", borderRadius: 20, fontSize: 12, fontWeight: "600", cursor: "pointer", fontFamily: "inherit", background: active ? STATUT_COLORS[s]?.accent : `${STATUT_COLORS[s]?.accent}15`, color: active ? "white" : STATUT_COLORS[s]?.accent, border: "none", transition: "all 0.2s", boxShadow: active ? `0 4px 12px ${STATUT_COLORS[s]?.accent}50` : "none" }),
    detailRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" },
    detailLabel: { fontSize: 12, color: "#86868b", fontWeight: "600" },
    detailVal: { fontSize: 14, color: "#1d1d1f", fontWeight: "500" },
    zoomBtn: { padding: "10px 18px", background: zoomTable ? "linear-gradient(135deg, #34C759, #2E8B4A)" : "rgba(0,0,0,0.06)", color: zoomTable ? "white" : "#1d1d1f", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: "600", fontFamily: "inherit" },
  };

  const navItems = [
    { key: "dashboard", label: "Tableau de bord" },
    { key: "clients", label: "👤 Clients" },
    { key: "list", label: "Réparations" },
    { key: "form", label: "+ Nouvelle" },
    { key: "atelier", label: "⚙️ Mon Atelier" },
  ];

  return (
    <div style={S.app}>
      {confirmDelete && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{ width: 60, height: 60, background: "rgba(255,59,48,0.1)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🗑️</div>
            <h2 style={{ color: "#1d1d1f", marginBottom: 8, fontSize: 20, fontWeight: "700" }}>Supprimer cette fiche ?</h2>
            <p style={{ color: "#86868b", fontSize: 14, marginBottom: 28 }}><strong>{confirmDelete.client}</strong> — {confirmDelete.marque} {confirmDelete.modele}</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button style={S.btn("secondary")} onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button style={S.btn("danger")} onClick={() => deleteRepair(confirmDelete.id)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.logoIcon}>⌚</div>
          <div>
            <div style={{ fontSize: 18, color: "#1d1d1f", fontWeight: "700" }}>WatchTrack</div>
            <div style={{ fontSize: 11, color: "#86868b" }}>MontrePro Web</div>
          </div>
        </div>
        <nav style={S.nav}>
          {navItems.map(item => (
            <button key={item.key}
              style={S.navBtn(view === item.key, hoveredNav === item.key)}
              onMouseEnter={() => setHoveredNav(item.key)}
              onMouseLeave={() => setHoveredNav(null)}
              onClick={() => {
                if (item.key === "form") setForm({ ticket: "", client: "", tel: "", marque: "", modele: "", reparation: REPARATIONS[0], statut: "Reçue", prix: "", acompte: "", date: "", date_returned: "", notes: "" });
                if (item.key === "clients") setSelectedClient(null);
                setView(item.key);
              }}>
              {item.label}
            </button>
          ))}
          <button style={{ ...S.btn("primary"), padding: "8px 16px", fontSize: 12 }} onClick={downloadExcel}>📥 Export</button>
          {subscription?.status === "trial" && (
            <div style={{ padding: "8px 14px", background: daysLeft <= 5 ? "rgba(255,59,48,0.1)" : "rgba(52,199,89,0.1)", borderRadius: 10, fontSize: 12, fontWeight: "700", color: daysLeft <= 5 ? "#FF3B30" : "#2E8B4A" }}>
              ⏱ {daysLeft}j d'essai
            </div>
          )}
          {subscription?.status === "paid" && (
            <div style={{ padding: "8px 14px", background: "rgba(52,199,89,0.1)", borderRadius: 10, fontSize: 12, fontWeight: "700", color: "#2E8B4A" }}>✅ Licence active</div>
          )}
          <div style={{ fontSize: 12, color: "#86868b", padding: "8px 12px", background: "rgba(0,0,0,0.04)", borderRadius: 10 }}>{session.user.email}</div>
          <button style={{ ...S.btn("danger"), padding: "8px 16px", fontSize: 12 }} onClick={() => supabase.auth.signOut()}>Déconnexion</button>
        </nav>
      </header>

      <main style={S.main}>
        {loading && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⌚</div>
            <p style={{ color: "#86868b" }}>Chargement...</p>
          </div>
        )}

        {!loading && view === "atelier" && (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={S.sectionTitle}>⚙️ Mon Atelier</div>
              <div style={S.sectionSub}>Ces informations apparaîtront sur vos factures</div>
            </div>
            <div style={{ ...S.card, padding: 32, maxWidth: 700 }}>
              <div style={S.formGrid}>
                {[
                  { label: "Nom / Raison sociale", key: "nom", placeholder: "Horlogerie Dupont" },
                  { label: "Téléphone", key: "tel", placeholder: "06 00 00 00 00" },
                  { label: "Adresse", key: "adresse", placeholder: "123 rue de la Montre" },
                  { label: "Code postal", key: "codePostal", placeholder: "75001" },
                  { label: "Ville", key: "ville", placeholder: "Paris" },
                  { label: "SIRET", key: "siret", placeholder: "123 456 789 00012" },
                  { label: "Email", key: "email", placeholder: "contact@atelier.fr" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={S.label}>{f.label}</label>
                    <input style={S.input} placeholder={f.placeholder} value={atelier[f.key]||""} onChange={e => saveAtelier({ ...atelier, [f.key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, padding: 16, background: "rgba(52,199,89,0.1)", borderRadius: 12 }}>
                <p style={{ color: "#2E8B4A", fontSize: 13, fontWeight: "600", margin: 0 }}>✅ Sauvegardé automatiquement !</p>
              </div>
              <div style={{ marginTop: 20, padding: 24, background: "rgba(0,122,255,0.06)", borderRadius: 16, border: "1px solid rgba(0,122,255,0.2)" }}>
                <p style={{ color: "#007AFF", fontSize: 15, fontWeight: "700", marginBottom: 16 }}>💳 Mon abonnement</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a href="https://buy.stripe.com/00w14ncT29W28fD8o26g804" target="_blank" rel="noreferrer"
                    style={{ padding: "12px 24px", background: "linear-gradient(135deg, #34C759, #2E8B4A)", color: "white", borderRadius: 12, fontSize: 13, fontWeight: "700", textDecoration: "none" }}>
                    🔄 19,90€/mois
                  </a>
                  <a href="https://buy.stripe.com/7sY5kD06gb06eE1fQu6g807" target="_blank" rel="noreferrer"
                    style={{ padding: "12px 24px", background: "linear-gradient(135deg, #2E8B4A, #1a5c30)", color: "white", borderRadius: 12, fontSize: 13, fontWeight: "700", textDecoration: "none" }}>
                    💎 169€ à vie
                  </a>
                </div>
                <p style={{ fontSize: 12, color: "#86868b", marginTop: 12 }}>
                  Après paiement : <a href="mailto:watchtrack-pro@outlook.com" style={{ color: "#007AFF" }}>watchtrack-pro@outlook.com</a>
                </p>
              </div>
            </div>
          </>
        )}

        {!loading && view === "clients" && !selectedClient && (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={S.sectionTitle}>👤 Clients</div>
              <div style={S.sectionSub}>{clientsList.length} client(s)</div>
            </div>
            <input style={{ ...S.input, maxWidth: 350, marginBottom: 20 }} placeholder="🔍 Rechercher..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {filteredClients.map((c, i) => (
                <div key={i} style={{ ...S.card, cursor: "pointer", padding: 20 }} onClick={() => setSelectedClient(c)}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: "700" }}>{c.nom}{c.montres.length >= 3 && <span style={{ marginLeft: 8, fontSize: 11, background: "linear-gradient(135deg, #FFD700, #FFA500)", color: "white", padding: "2px 8px", borderRadius: 8 }}>🏆</span>}</div>
                      <div style={{ fontSize: 13, color: "#86868b" }}>📞 {c.tel||"—"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: "700", color: "#1A6E35" }}>{c.totalDepense.toFixed(0)}€</div>
                      <div style={{ fontSize: 11, color: "#86868b" }}>total</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ padding: "4px 10px", background: "rgba(26,95,168,0.1)", borderRadius: 8, fontSize: 11, fontWeight: "600", color: "#1A5FA8" }}>⌚ {c.montres.length}</div>
                    {c.montres.filter(m => m.statut !== "Rendue").length > 0 && <div style={{ padding: "4px 10px", background: "rgba(184,74,0,0.1)", borderRadius: 8, fontSize: 11, fontWeight: "600", color: "#B84A00" }}>🔧 {c.montres.filter(m => m.statut !== "Rendue").length} en cours</div>}
                    {c.totalAcompte > 0 && <div style={{ padding: "4px 10px", background: "rgba(26,110,53,0.1)", borderRadius: 8, fontSize: 11, fontWeight: "600", color: "#1A6E35" }}>💰 {c.totalAcompte.toFixed(0)}€ acompte</div>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && view === "clients" && selectedClient && (
          <>
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
              <button style={{ background: "rgba(0,0,0,0.06)", border: "none", width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 16 }} onClick={() => setSelectedClient(null)}>←</button>
              <div style={S.sectionTitle}>{selectedClient.nom}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Montres", val: selectedClient.montres.length, icon: "⌚", accent: "#1A5FA8" },
                { label: "Total dépensé", val: selectedClient.totalDepense.toFixed(0)+"€", icon: "💶", accent: "#1A6E35" },
                { label: "Acomptes reçus", val: selectedClient.totalAcompte.toFixed(0)+"€", icon: "💰", accent: "#A07800" },
                { label: "Reste dû", val: (selectedClient.totalDepense-selectedClient.totalAcompte).toFixed(0)+"€", icon: "📋", accent: "#B84A00" },
              ].map((s, i) => (
                <div key={i} style={S.statCard}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.accent, borderRadius: "20px 20px 0 0" }} />
                  <div style={{ width: 44, height: 44, background: `${s.accent}18`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontSize: 24, color: "#1d1d1f", marginBottom: 4, fontWeight: "700" }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: "#86868b" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={S.cardHeader}><span style={S.cardTitle}>Historique</span></div>
              <table style={S.table}>
                <thead><tr>{["Ticket","Montre","Réparation","Date","Statut","Prix","Acompte","Reste dû"].map((h,i) => <th key={i} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {selectedClient.montres.map(r => {
                    const resteDu = (parseFloat(r.prix)||0) - (parseFloat(r.acompte)||0);
                    return (
                      <tr key={r.id} style={{ ...S.rowColored(r.statut), cursor: "pointer" }} onClick={() => { setSelected(r); setView("detail"); }}>
                        <td style={S.td(false)}><span style={{ color: "#B84A00", fontWeight: "700" }}>{r.ticket||"—"}</span></td>
                        <td style={{ ...S.td(false), fontWeight: "600" }}>{r.marque} {r.modele}</td>
                        <td style={{ ...S.td(false), color: "#555" }}>{r.reparation}</td>
                        <td style={{ ...S.td(false), color: "#86868b" }}>{formatDate(r.date)}</td>
                        <td style={S.td(false)}><span style={S.badge(r.statut)}>{r.statut}</span></td>
                        <td style={{ ...S.td(false), fontWeight: "700", color: "#1A6E35" }}>{r.prix ? r.prix+"€" : "—"}</td>
                        <td style={{ ...S.td(false), fontWeight: "700", color: "#A07800" }}>{r.acompte ? r.acompte+"€" : "—"}</td>
                        <td style={{ ...S.td(false), fontWeight: "700", color: resteDu > 0 ? "#B84A00" : "#1A6E35" }}>{r.prix ? resteDu.toFixed(2)+"€" : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && view === "dashboard" && (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={S.sectionTitle}>Tableau de bord</div>
              <div style={S.sectionSub}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
            {subscription?.status === "trial" && daysLeft <= 7 && (
              <div style={{ marginBottom: 20, padding: 20, background: daysLeft <= 3 ? "rgba(255,59,48,0.08)" : "rgba(255,149,0,0.08)", borderRadius: 16, border: `1px solid ${daysLeft <= 3 ? "rgba(255,59,48,0.2)" : "rgba(255,149,0,0.2)"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: "700", color: daysLeft <= 3 ? "#FF3B30" : "#FF9500" }}>⏱ Plus que {daysLeft} jour(s) d'essai !</div>
                  <div style={{ fontSize: 13, color: "#86868b" }}>Passez à la version complète</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <a href="https://buy.stripe.com/00w14ncT29W28fD8o26g804" target="_blank" rel="noreferrer" style={{ padding: "10px 20px", background: "linear-gradient(135deg, #34C759, #2E8B4A)", color: "white", borderRadius: 12, fontSize: 13, fontWeight: "700", textDecoration: "none" }}>19,90€/mois</a>
                  <a href="https://buy.stripe.com/7sY5kD06gb06eE1fQu6g807" target="_blank" rel="noreferrer" style={{ padding: "10px 20px", background: "linear-gradient(135deg, #2E8B4A, #1a5c30)", color: "white", borderRadius: 12, fontSize: 13, fontWeight: "700", textDecoration: "none" }}>💎 169€ à vie</a>
                </div>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "En atelier", val: stats.enCours, accent: "#1A5FA8", icon: "⌚" },
                { label: "Prêtes", val: stats.pretes, accent: "#1A6E35", icon: "✅" },
                { label: "Attente pièce", val: stats.attente, accent: "#A07800", icon: "⏳" },
                { label: "Total fiches", val: stats.total, accent: "#6B1E9E", icon: "📋" },
                { label: "CA encaissé", val: stats.ca+"€", accent: "#B84A00", icon: "💰" },
                { label: "Acomptes", val: stats.acomptes+"€", accent: "#1A6E35", icon: "💵" },
              ].map((s,i) => (
                <div key={i} style={S.statCard}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.accent, borderRadius: "20px 20px 0 0" }} />
                  <div style={{ width: 44, height: 44, background: `${s.accent}18`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, color: "#1d1d1f", marginBottom: 4, fontWeight: "700" }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: "#86868b" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {oldRepairs.length > 0 && (
              <div style={{ ...S.card, marginBottom: 20, border: "1px solid rgba(255,59,48,0.2)" }}>
                <div style={{ ...S.cardHeader, background: "rgba(255,59,48,0.05)" }}>
                  <span style={{ ...S.cardTitle, color: "#FF3B30" }}>⚠️ Plus d'1 mois en atelier</span>
                  <span style={{ fontSize: 12, color: "#FF3B30", fontWeight: "700", background: "rgba(255,59,48,0.1)", padding: "4px 10px", borderRadius: 8 }}>{oldRepairs.length}</span>
                </div>
                {oldRepairs.map(r => (
                  <div key={r.id} style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.04)", cursor: "pointer" }} onClick={() => { setSelected(r); setView("detail"); }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: "600" }}>{r.client}<span style={S.alertBadge}>⏱ {daysSince(r.date)}j</span></div>
                      <div style={{ fontSize: 12, color: "#86868b" }}>{r.marque} {r.modele}</div>
                    </div>
                    <span style={S.badge(r.statut)}>{r.statut}</span>
                  </div>
                ))}
              </div>
            )}
            {repairs.filter(r => r.acompte && parseFloat(r.acompte) > 0 && r.statut !== "Rendue").length > 0 && (
              <div style={{ ...S.card, marginBottom: 20, border: "1px solid rgba(26,110,53,0.2)" }}>
                <div style={{ ...S.cardHeader, background: "rgba(26,110,53,0.05)" }}>
                  <span style={{ ...S.cardTitle, color: "#1A6E35" }}>💰 Acomptes reçus — En cours</span>
                </div>
                {repairs.filter(r => r.acompte && parseFloat(r.acompte) > 0 && r.statut !== "Rendue").map(r => {
                  const resteDu = (parseFloat(r.prix)||0) - (parseFloat(r.acompte)||0);
                  return (
                    <div key={r.id} style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.04)", cursor: "pointer" }} onClick={() => { setSelected(r); setView("detail"); }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: "600" }}>{r.client}</div>
                        <div style={{ fontSize: 12, color: "#86868b" }}>{r.marque} {r.modele}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: "#1A6E35", fontWeight: "600" }}>Acompte : {r.acompte}€</div>
                        <div style={{ fontSize: 12, color: "#B84A00", fontWeight: "700" }}>Reste : {resteDu.toFixed(2)}€</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <span style={S.cardTitle}>Réparations récentes</span>
                <button style={S.btn("secondary")} onClick={() => setView("list")}>Voir tout →</button>
              </div>
              <table style={S.table}>
                <thead><tr>{["Ticket","Client","Montre","Statut","Prix","Acompte","Reste dû"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {repairs.slice(0,5).map(r => {
                    const resteDu = (parseFloat(r.prix)||0) - (parseFloat(r.acompte)||0);
                    return (
                      <tr key={r.id} style={{ cursor: "pointer", ...S.rowColored(r.statut) }} onClick={() => { setSelected(r); setView("detail"); }}>
                        <td style={S.td(false)}><span style={{ color: "#B84A00", fontWeight: "700" }}>{r.ticket||"—"}</span></td>
                        <td style={S.td(false)}><div style={{ fontWeight: "600" }}>{r.client}</div><div style={{ fontSize: 11, color: "#86868b" }}>{r.tel}</div></td>
                        <td style={{ ...S.td(false), fontWeight: "600" }}>{r.marque} {r.modele}</td>
                        <td style={S.td(false)}><span style={S.badge(r.statut)}>{r.statut}</span></td>
                        <td style={{ ...S.td(false), fontWeight: "700", color: "#1A6E35" }}>{r.prix ? r.prix+"€" : "—"}</td>
                        <td style={{ ...S.td(false), fontWeight: "600", color: "#A07800" }}>{r.acompte ? r.acompte+"€" : "—"}</td>
                        <td style={{ ...S.td(false), fontWeight: "700", color: r.acompte ? "#B84A00" : "#86868b" }}>{r.prix ? resteDu.toFixed(2)+"€" : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && view === "list" && (
          <>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={S.sectionTitle}>Réparations</div>
                <div style={S.sectionSub}>{filtered.length} résultat(s)</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={S.zoomBtn} onClick={() => setZoomTable(!zoomTable)}>{zoomTable ? "🔍 Compact" : "🔎 Agrandi"}</button>
                <button style={S.btn()} onClick={() => setView("form")}>+ Nouvelle réparation</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
              <input style={{ ...S.input, maxWidth: 300 }} placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Tous", ...STATUTS].map(s => (
                  <button key={s} style={{ padding: "7px 14px", borderRadius: 10, fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: "700", border: `2px solid ${filterStatut===s ? (STATUT_COLORS[s]?.accent||"#2E8B4A") : "rgba(0,0,0,0.1)"}`, background: filterStatut===s ? (STATUT_COLORS[s]?.rowBg||"#EDF8F1") : "rgba(255,255,255,0.8)", color: filterStatut===s ? (STATUT_COLORS[s]?.accent||"#2E8B4A") : "#86868b" }}
                    onClick={() => setFilterStatut(s)}>{s}</button>
                ))}
              </div>
            </div>
            <div style={S.card}>
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead>
                    <tr>{["Ticket","Client","Montre","Réparation","Notes","Date","Rendu","Statut","Prix","Acompte","Reste dû",""].map((h,i) => <th key={i} style={S.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={12} style={{ textAlign: "center", color: "#86868b", padding: "60px" }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>Aucune réparation
                      </td></tr>
                    )}
                    {filtered.map(r => {
                      const resteDu = (parseFloat(r.prix)||0) - (parseFloat(r.acompte)||0);
                      return (
                        <tr key={r.id} style={S.rowColored(r.statut)}>
                          <td style={S.td(zoomTable)}><input type="text" style={{ ...S.inlineInput, color: "#B84A00", fontWeight: "700", width: "65px" }} value={r.ticket||""} onChange={e => updateField(r.id, "ticket", e.target.value)} /></td>
                          <td style={{ ...S.td(zoomTable), cursor: "pointer" }} onClick={() => { setSelected(r); setView("detail"); }}>
                            <div style={{ fontWeight: "600" }}>{r.client}{isOld(r.date, r.statut) && <span style={S.alertBadge}>⏱</span>}</div>
                            <div style={{ fontSize: 11, color: "#86868b" }}>{r.tel}</div>
                          </td>
                          <td style={{ ...S.td(zoomTable), cursor: "pointer" }} onClick={() => { setSelected(r); setView("detail"); }}>{r.marque} {r.modele}</td>
                          <td style={{ ...S.td(zoomTable), color: "#555", cursor: "pointer" }} onClick={() => { setSelected(r); setView("detail"); }}>{r.reparation}</td>
                          <td style={{ ...S.td(zoomTable), cursor: "pointer" }} onClick={() => { setSelected(r); setView("detail"); }}>
                            <div style={S.noteDisplay}>{r.notes||<span style={{ color: "#ccc" }}>—</span>}</div>
                          </td>
                          <td style={{ ...S.td(zoomTable), color: "#86868b" }}>{formatDate(r.date)}</td>
                          <td style={S.td(zoomTable)}><input type="date" style={S.dateInput} value={r.date_returned||""} onChange={e => updateField(r.id, "date_returned", e.target.value)} /></td>
                          <td style={{ ...S.td(zoomTable), cursor: "pointer" }} onClick={() => { setSelected(r); setView("detail"); }}><span style={S.badge(r.statut)}>{r.statut}</span></td>
                          <td style={S.td(zoomTable)}><input type="text" style={{ ...S.inlineInput, color: "#1A6E35", fontWeight: "700", width: "65px" }} value={r.prix||""} onChange={e => updateField(r.id, "prix", e.target.value)} /></td>
                          <td style={S.td(zoomTable)}><input type="text" style={{ ...S.inlineInput, color: "#A07800", fontWeight: "700", width: "65px" }} value={r.acompte||""} onChange={e => updateField(r.id, "acompte", e.target.value)} /></td>
                          <td style={{ ...S.td(zoomTable), fontWeight: "700", color: r.acompte && parseFloat(r.acompte) > 0 ? "#B84A00" : "#86868b", fontSize: 11 }}>{r.prix ? resteDu.toFixed(2)+"€" : "—"}</td>
                          <td style={S.td(zoomTable)}><button style={S.deleteBtn} onClick={() => setConfirmDelete(r)}>🗑️</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!loading && view === "form" && (
          <>
            <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
              <button style={{ background: "rgba(0,0,0,0.06)", border: "none", width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 16 }} onClick={() => setView("list")}>←</button>
              <div>
                <div style={S.sectionTitle}>Nouvelle réparation</div>
                <div style={S.sectionSub}>Enregistrer une montre en atelier</div>
              </div>
            </div>
            <div style={{ ...S.card, padding: 32 }}>
              <div style={{ marginBottom: 24 }}>
                <label style={S.label}>N° Ticket</label>
                <input style={{ ...S.input, maxWidth: 250, color: "#B84A00", fontWeight: "700" }} placeholder="001..." value={form.ticket} onChange={e => setForm({ ...form, ticket: e.target.value })} />
              </div>
              <div style={S.divider} />
              <div style={{ marginBottom: 24 }}>
                <div style={S.formGrid}>
                  <div><label style={S.label}>Nom *</label><input style={S.input} placeholder="Jean Dupont" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} /></div>
                  <div><label style={S.label}>Téléphone</label><input style={S.input} placeholder="06 00 00 00 00" value={form.tel} onChange={e => setForm({ ...form, tel: e.target.value })} /></div>
                </div>
              </div>
              <div style={S.divider} />
              <div style={{ marginBottom: 24 }}>
                <div style={S.formGrid}>
                  <div><label style={S.label}>Marque *</label><input style={S.input} placeholder="Rolex, Seiko..." value={form.marque} onChange={e => setForm({ ...form, marque: e.target.value })} /></div>
                  <div><label style={S.label}>Modèle</label><input style={S.input} placeholder="Submariner..." value={form.modele} onChange={e => setForm({ ...form, modele: e.target.value })} /></div>
                </div>
              </div>
              <div style={S.divider} />
              <div style={{ marginBottom: 24 }}>
                <div style={S.formGrid}>
                  <div>
                    <label style={S.label}>Type de réparation</label>
                    <select style={{ ...S.input, cursor: "pointer" }} value={form.reparation} onChange={e => setForm({ ...form, reparation: e.target.value })}>
                      {REPARATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div><label style={S.label}>Prix estimé</label><input style={S.input} placeholder="45€" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} /></div>
                  <div>
                    <label style={{ ...S.label, color: "#A07800" }}>💰 Acompte reçu</label>
                    <input style={{ ...S.input, borderColor: form.acompte ? "rgba(160,120,0,0.3)" : "transparent" }} placeholder="0€" value={form.acompte} onChange={e => setForm({ ...form, acompte: e.target.value })} />
                    {form.acompte && form.prix && (
                      <div style={{ fontSize: 12, color: "#B84A00", marginTop: 6, fontWeight: "600" }}>
                        Reste dû : {((parseFloat(form.prix)||0) - (parseFloat(form.acompte)||0)).toFixed(2)}€
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={S.label}>Statut</label>
                    <select style={{ ...S.input, cursor: "pointer" }} value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                      {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ ...S.formGrid, marginTop: 16 }}>
                  <div><label style={S.label}>Date de dépôt</label><input style={S.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                  <div><label style={S.label}>Date de rendu</label><input style={S.input} type="date" value={form.date_returned} onChange={e => setForm({ ...form, date_returned: e.target.value })} /></div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={S.label}>Notes</label>
                  <textarea style={{ ...S.input, minHeight: 80, resize: "vertical" }} placeholder="État de la montre..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button style={S.btn("secondary")} onClick={() => setView("list")}>Annuler</button>
                <button style={S.btn()} onClick={handleSubmit}>✓ Enregistrer</button>
              </div>
            </div>
          </>
        )}

        {!loading && view === "detail" && selected && (
          <>
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button style={{ background: "rgba(0,0,0,0.06)", border: "none", width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 16 }} onClick={() => setView("list")}>←</button>
                <div>
                  <div style={S.sectionTitle}>{selected.marque} {selected.modele}</div>
                  <div style={S.sectionSub}>{selected.client} — {selected.reparation}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={S.badge(selected.statut)}>{selected.statut}</span>
                <button style={S.btn("blue")} onClick={() => imprimerBonDepot(selected)}>🖨️ Bon de dépôt</button>
                <button style={S.btn("purple")} onClick={() => genererFacture(selected)}>📄 Facture</button>
                <button style={S.btn("danger")} onClick={() => setConfirmDelete(selected)}>🗑️</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={S.card}>
                <div style={S.cardHeader}><span style={S.cardTitle}>Informations</span></div>
                <div style={{ padding: "0 24px" }}>
                  {[
                    { label: "N° Ticket", content: <input type="text" style={{ ...S.inlineInput, color: "#B84A00", fontWeight: "700", width: "150px" }} value={selected.ticket||""} onChange={e => updateField(selected.id, "ticket", e.target.value)} /> },
                    { label: "Client", content: <span style={S.detailVal}>{selected.client}</span> },
                    { label: "Téléphone", content: <span style={S.detailVal}>{selected.tel||"—"}</span> },
                    { label: "Date de dépôt", content: <span style={S.detailVal}>{formatDate(selected.date)}</span> },
                    { label: "Prix total", content: <input type="text" style={{ ...S.inlineInput, color: "#1A6E35", fontWeight: "700", width: "150px" }} value={selected.prix||""} onChange={e => updateField(selected.id, "prix", e.target.value)} /> },
                    {
                      label: "💰 Acompte reçu", content: (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input type="text" style={{ ...S.inlineInput, color: "#A07800", fontWeight: "700", width: "100px" }} value={selected.acompte||""} onChange={e => updateField(selected.id, "acompte", e.target.value)} />
                          {selected.acompte && parseFloat(selected.acompte) > 0 && (
                            <span style={{ fontSize: 12, color: "#B84A00", fontWeight: "700" }}>
                              Reste : {((parseFloat(selected.prix)||0) - (parseFloat(selected.acompte)||0)).toFixed(2)}€
                            </span>
                          )}
                        </div>
                      )
                    },
                    { label: "Date de rendu", content: <input type="date" style={S.dateInput} value={selected.date_returned||""} onChange={e => updateField(selected.id, "date_returned", e.target.value)} /> },
                  ].map((row, i) => (
                    <div key={i} style={S.detailRow}>
                      <span style={S.detailLabel}>{row.label}</span>
                      {row.content}
                    </div>
                  ))}
                  <div style={{ padding: "14px 0" }}>
                    <div style={{ ...S.detailLabel, marginBottom: 8 }}>Notes</div>
                    <textarea style={{ ...S.input, minHeight: 80, resize: "vertical", fontStyle: "italic" }} value={selected.notes||""} onChange={e => updateField(selected.id, "notes", e.target.value)} />
                  </div>
                </div>
              </div>
              <div style={S.card}>
                <div style={S.cardHeader}><span style={S.cardTitle}>Statut</span></div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                    {STATUTS_BOUTONS.map(s => (
                      <button key={s} style={S.statusBtn(selected.statut===s, s)} onClick={() => updateField(selected.id, "statut", s)}>{s}</button>
                    ))}
                  </div>
                  {selected.acompte && parseFloat(selected.acompte) > 0 && (
                    <div style={{ padding: 16, background: "rgba(160,120,0,0.08)", border: "1px solid rgba(160,120,0,0.2)", borderRadius: 14, marginBottom: 16 }}>
                      <div style={{ color: "#A07800", fontWeight: "700", fontSize: 14, marginBottom: 4 }}>💰 Acompte reçu : {selected.acompte}€</div>
                      <div style={{ color: "#B84A00", fontWeight: "700", fontSize: 15 }}>Reste dû : {((parseFloat(selected.prix)||0) - (parseFloat(selected.acompte)||0)).toFixed(2)}€</div>
                    </div>
                  )}
                  {selected.statut === "Prête" && (
                    <div style={{ padding: 16, background: "#A8EFC0", border: "2px solid #1A6E35", borderRadius: 14 }}>
                      <div style={{ color: "#1A6E35", fontWeight: "700" }}>✅ Prête à rendre !</div>
                      <div style={{ fontSize: 12, color: "#1A6E35" }}>Appelez : {selected.tel}</div>
                      {selected.prix && (
                        <div style={{ fontSize: 15, color: "#1A6E35", marginTop: 8, fontWeight: "700" }}>
                          💰 {selected.acompte && parseFloat(selected.acompte) > 0
                            ? `Reste dû : ${((parseFloat(selected.prix)||0) - (parseFloat(selected.acompte)||0)).toFixed(2)}€`
                            : `${selected.prix}€ à encaisser`}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadSubscription(session.user.id);
      else setLoading(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadSubscription(session.user.id);
      else { setSubscription(null); setLoading(false); }
    });
  }, []);

  async function loadSubscription(userId) {
    const { data } = await supabase.from("subscriptions").select("*").eq("user_id", userId).single();
    if (!data) {
      const { data: newSub } = await supabase.from("subscriptions").insert([{ user_id: userId, status: "trial", trial_start: new Date().toISOString() }]).select().single();
      setSubscription(newSub);
    } else {
      setSubscription(data);
    }
    setLoading(false);
  }

  function isTrialExpired(sub) {
    if (!sub) return false;
    if (sub.status === "paid") return false;
    return Math.floor((new Date() - new Date(sub.trial_start)) / (1000 * 60 * 60 * 24)) >= 15;
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(160deg, #f0f4f0 0%, #e8f0e8 50%, #f5f5f7 100%)" }}>
      <div style={{ fontSize: 40 }}>⌚</div>
    </div>
  );

  if (!session) return <LoginPage />;
  if (isTrialExpired(subscription)) return <TrialExpiredPage />;
  return <MainApp session={session} subscription={subscription} />;
}