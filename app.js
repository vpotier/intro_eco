/* ===================== Clés localStorage ===================== */
const CLE_LUES = "eco_du_jour_lues";
const CLE_FICHE_AFFICHEE = "eco_du_jour_fiche_affichee";
const CLE_OUVERTE = "eco_du_jour_carte_ouverte";
const CLE_FAVORIS = "eco_du_jour_favoris";
const CLE_STREAK_DATES = "eco_du_jour_streak_dates";
const CLE_QUIZ_STATS = "eco_du_jour_quiz_stats";

const NOMS_TYPES = {
  concept: "Concept",
  auteur: "Auteur",
  actu: "Actu",
  interpellation: "Interpellation",
  quiz: "Quiz"
};

const DESC_TYPES = {
  concept: "Les mécanismes et notions clés de l'économie.",
  auteur: "Les penseurs qui ont façonné la discipline.",
  actu: "La théorie à l'épreuve de l'actualité.",
  interpellation: "Les questions qui divisent, sans trancher.",
  quiz: "De quoi tester ce que tu as retenu."
};

let toutesLesFiches = [];
let ecranActuel = "today";
let ficheLongreadId = null;

/* ===================== Utilitaires stockage ===================== */
function getListe(cle) {
  const stocke = localStorage.getItem(cle);
  return stocke ? JSON.parse(stocke) : [];
}

function getLues() { return getListe(CLE_LUES); }
function getFavoris() { return getListe(CLE_FAVORIS); }
function getStreakDates() { return getListe(CLE_STREAK_DATES); }
function getQuizStats() {
  const s = localStorage.getItem(CLE_QUIZ_STATS);
  return s ? JSON.parse(s) : { correct: 0, total: 0 };
}

function aujourdhui() { return new Date().toISOString().split("T")[0]; }

function marquerLue(id) {
  const lues = getLues();
  if (!lues.includes(id)) {
    lues.push(id);
    localStorage.setItem(CLE_LUES, JSON.stringify(lues));
  }
  enregistrerJourActif();
}

function toggleFavori(id) {
  let favoris = getFavoris();
  if (favoris.includes(id)) {
    favoris = favoris.filter(x => x !== id);
  } else {
    favoris.push(id);
  }
  localStorage.setItem(CLE_FAVORIS, JSON.stringify(favoris));
}

function enregistrerJourActif() {
  const dates = getStreakDates();
  const j = aujourdhui();
  if (!dates.includes(j)) {
    dates.push(j);
    localStorage.setItem(CLE_STREAK_DATES, JSON.stringify(dates));
  }
}

function calculerStreak() {
  const dates = new Set(getStreakDates());
  let streak = 0;
  let curseur = new Date();
  // Autorise que le jour même ne soit pas encore marqué actif
  if (!dates.has(aujourdhui())) {
    curseur.setDate(curseur.getDate() - 1);
  }
  while (true) {
    const iso = curseur.toISOString().split("T")[0];
    if (dates.has(iso)) {
      streak++;
      curseur.setDate(curseur.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function enregistrerReponseQuiz(correct) {
  const s = getQuizStats();
  s.total++;
  if (correct) s.correct++;
  localStorage.setItem(CLE_QUIZ_STATS, JSON.stringify(s));
}

/* ===================== Init & navigation ===================== */
async function init() {
  const reponse = await fetch("data/fiches.json");
  toutesLesFiches = await reponse.json();
  toutesLesFiches.sort((a, b) => a.ordre - b.ordre);

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => allerA(btn.dataset.screen));
  });

  allerA("today");
}

function allerA(ecran) {
  ecranActuel = ecran;
  ficheLongreadId = null;
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.toggle("actif", b.dataset.screen === ecran);
  });
  document.getElementById("bottom-nav").style.display = "flex";
  if (ecran === "today") afficherToday();
  if (ecran === "collection") afficherCollection();
  if (ecran === "threads") afficherThreads();
  window.scrollTo(0, 0);
  mettreAJourBarreProgression();
}

/* ===================== Fiche du jour ===================== */
function getFicheAffichee() {
  const s = localStorage.getItem(CLE_FICHE_AFFICHEE);
  return s ? JSON.parse(s) : null;
}

function definirFicheAffichee(id) {
  localStorage.setItem(CLE_FICHE_AFFICHEE, JSON.stringify({ id, date: aujourdhui() }));
}

function prochaineFicheNonLue() {
  const lues = getLues();
  return toutesLesFiches.find(f => !lues.includes(f.id)) || toutesLesFiches[toutesLesFiches.length - 1];
}

function ficheDuJourCourante() {
  const affichee = getFicheAffichee();
  if (affichee && affichee.date === aujourdhui()) {
    const f = toutesLesFiches.find(x => x.id === affichee.id);
    if (f) return f;
  }
  const nouvelle = prochaineFicheNonLue();
  definirFicheAffichee(nouvelle.id);
  return nouvelle;
}

function carteEstOuverte(id) {
  const s = localStorage.getItem(CLE_OUVERTE);
  if (!s) return false;
  const o = JSON.parse(s);
  return o.date === aujourdhui() && o.id === id;
}

function ouvrirCarteDuJour(id) {
  localStorage.setItem(CLE_OUVERTE, JSON.stringify({ id, date: aujourdhui() }));
}

/* ===================== Écran Today ===================== */
function afficherToday() {
  const fiche = ficheDuJourCourante();
  const zone = document.getElementById("contenu");
  const streak = calculerStreak();
  const dateAffichee = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const dateCapitalisee = dateAffichee.charAt(0).toUpperCase() + dateAffichee.slice(1);

  let html = `
    <div class="header-row">
      <h1 class="ecran-titre serif">Éco du jour</h1>
      <div class="streak-badge">🔥 ${streak} -day streak</div>
    </div>
    <div class="date-ligne">${dateCapitalisee}<span class="separateur">·</span>Card no. ${fiche.ordre}</div>
  `;

  if (!carteEstOuverte(fiche.id)) {
    html += `
      <div class="carte-verrouillee" id="carte-verrouillee">
        <div class="anneau a1"></div>
        <div class="anneau a2"></div>
        <div class="anneau a3"></div>
        <h2 class="serif">Today's card is ready</h2>
        <button class="btn-reveler serif" id="btn-reveler">Tap to reveal</button>
      </div>
    `;
    zone.innerHTML = html;
    document.getElementById("carte-verrouillee").addEventListener("click", () => {
      ouvrirCarteDuJour(fiche.id);
      afficherToday();
    });
  } else {
    html += construireCarteRecto(fiche, true);
    zone.innerHTML = html;
    brancherEvenementsRecto(fiche);
  }
}

function construireCarteRecto(fiche, avecActions) {
  const favoris = getFavoris();
  const estFavori = favoris.includes(fiche.id);
  const typeLabel = NOMS_TYPES[fiche.type] || fiche.type;

  let teaser = "";
  let visuel = "";
  if (fiche.type === "quiz") {
    teaser = `<p class="teaser">${fiche.contenu || ""} ${fiche.questions ? fiche.questions.length : 0} questions t'attendent.</p>`;
  } else if (fiche.blocs) {
    const premierTexte = fiche.blocs.find(b => b.type === "texte");
    const premiereImage = fiche.blocs.find(b => b.type === "image");
    if (premiereImage) {
      visuel = `<figure class="carte-visuel"><img src="${premiereImage.url}" alt="${premiereImage.legende || ''}" loading="lazy"><figcaption>${premiereImage.legende || ''}</figcaption></figure>`;
    }
    if (premierTexte) {
      const extrait = extraireTexte(premierTexte.html, 220);
      teaser = `<p class="teaser">${extrait}</p>`;
    }
  }

  const hint = fiche.type === "actu"
    ? "🔗 Tap for the real-world case"
    : (fiche.type === "quiz" ? "📝 Tap to start the quiz" : "→ Tap Go deeper for more");

  let html = `
    <div class="carte-recto" id="carte-recto">
      <span class="carte-numero">NO. ${fiche.ordre}</span>
      <span class="type-tag">${typeLabel}</span>
      <h2 class="serif">${fiche.titre}</h2>
      ${teaser}
      ${visuel}
      <div class="tap-hint">${hint}</div>
    </div>
  `;

  if (avecActions) {
    html += `
      <div class="action-row">
        <button class="btn-go-deeper serif" id="btn-go-deeper">Go deeper</button>
        <button class="btn-favori ${estFavori ? 'actif' : ''}" id="btn-favori">🔖</button>
      </div>
    `;
  }

  return html;
}

function extraireTexte(html, maxLen) {
  const texte = html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "");
  if (texte.length <= maxLen) return texte;
  return texte.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

function brancherEvenementsRecto(fiche) {
  const recto = document.getElementById("carte-recto");
  if (recto) recto.addEventListener("click", () => ouvrirLongRead(fiche.id));

  const btnDeeper = document.getElementById("btn-go-deeper");
  if (btnDeeper) btnDeeper.addEventListener("click", (e) => {
    e.stopPropagation();
    ouvrirLongRead(fiche.id);
  });

  const btnFav = document.getElementById("btn-favori");
  if (btnFav) btnFav.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavori(fiche.id);
    btnFav.classList.toggle("actif");
  });
}

/* ===================== Long Read ("Go deeper") ===================== */
function ouvrirLongRead(id) {
  ficheLongreadId = id;
  document.getElementById("bottom-nav").style.display = "none";
  afficherLongRead();
  window.scrollTo(0, 0);
}

function fermerLongRead() {
  document.getElementById("bottom-nav").style.display = "flex";
  ficheLongreadId = null;
  allerA(ecranActuel === "longread" ? "today" : ecranActuel);
}

function afficherLongRead() {
  const fiche = toutesLesFiches.find(f => f.id === ficheLongreadId);
  const zone = document.getElementById("contenu");
  const dejaLue = getLues().includes(fiche.id);
  const typeLabel = NOMS_TYPES[fiche.type] || fiche.type;

  let html = `
    <div class="longread-header">
      <button class="btn-retour-rond" id="btn-retour-longread">←</button>
      <div>
        <div class="longread-eyebrow">THE LONG READ</div>
      </div>
    </div>
    <h2 class="longread-titre serif">${fiche.titre}</h2>
  `;

  if (fiche.type === "quiz") {
    html += construireQuizLongRead(fiche);
  } else {
    html += construireBlocsLongRead(fiche);
    html += construirePullsOn(fiche);
  }

  html += `
    <button class="btn-collection serif ${dejaLue ? 'dans-collection' : ''}" id="btn-garder">
      ${dejaLue ? '✓ In your collection' : 'Keep in my collection'}
    </button>
  `;

  zone.innerHTML = html;

  document.getElementById("btn-retour-longread").addEventListener("click", fermerLongRead);

  const btnGarder = document.getElementById("btn-garder");
  btnGarder.addEventListener("click", () => {
    marquerLue(fiche.id);
    btnGarder.textContent = "✓ In your collection";
    btnGarder.classList.add("dans-collection");
  });

  if (fiche.type === "quiz") activerQuizLongRead(fiche);
  mettreAJourBarreProgression();
}

function construireBlocsLongRead(fiche) {
  if (!fiche.blocs) return `<div class="longread-bloc"><p>${fiche.contenu || ''}</p></div>`;

  // Le premier bloc texte et la première image sont déjà montrés au recto : on ne les répète pas.
  let premierTexteSaute = false;
  let premiereImageSautee = false;
  let html = "";

  fiche.blocs.forEach(bloc => {
    if (bloc.type === "texte" && !premierTexteSaute) {
      premierTexteSaute = true;
      return;
    }
    if (bloc.type === "image" && !premiereImageSautee) {
      premiereImageSautee = true;
      return;
    }
    if (bloc.type === "texte") {
      html += `<div class="longread-bloc"><p>${bloc.html}</p></div>`;
    } else if (bloc.type === "image") {
      html += `<figure class="carte-visuel"><img src="${bloc.url}" alt="${bloc.legende || ''}" loading="lazy"><figcaption>${bloc.legende || ''}</figcaption></figure>`;
    } else if (bloc.type === "encadre") {
      html += `
        <div class="encadre-vert">
          <div class="longread-section-eyebrow">${bloc.titre}</div>
          <p>${bloc.html}</p>
        </div>
      `;
    } else if (bloc.type === "lien") {
      html += `<a class="longread-lien" href="${bloc.url}" target="_blank" rel="noopener">🔗 ${bloc.texte}</a>`;
    } else if (bloc.type === "video") {
      html += `<div class="carte-visuel"><iframe src="${bloc.url}" title="${bloc.titre || ''}" style="width:100%;aspect-ratio:16/9;border:none;" allowfullscreen loading="lazy"></iframe></div>`;
    }
  });

  if (fiche.source) {
    html += `
      <div class="encadre-source">
        <div class="longread-section-eyebrow">Spot it in the wild</div>
        <p>${fiche.source.texte}</p>
        ${fiche.source.lien ? `<a href="${fiche.source.lien}" target="_blank" rel="noopener">Lire l'article source</a>` : ""}
        ${fiche.source.date_verification ? `<div class="date-verif">Vérifié le ${fiche.source.date_verification}</div>` : ""}
      </div>
    `;
  }

  return html;
}

function construirePullsOn(fiche) {
  const semaineLabel = `Semaine ${fiche.semaine}`;
  const phaseLabel = `Phase ${fiche.phase}`;
  return `
    <div class="longread-section-eyebrow">Pulls on</div>
    <div class="pulls-on">
      <span class="tag-pill">${phaseLabel}</span>
      <span class="tag-pill">${semaineLabel}</span>
      <span class="tag-pill">${NOMS_TYPES[fiche.type] || fiche.type}</span>
    </div>
  `;
}

function construireQuizLongRead(fiche) {
  if (!fiche.questions) return "";
  let html = `<div class="longread-bloc"><p>${fiche.contenu || ''}</p></div>`;
  fiche.questions.forEach((q, i) => {
    html += `
      <div class="check-yourself" data-question="${i}">
        <p><strong>${q.question}</strong></p>
        ${q.options.map((opt, j) => `<button class="option" data-question="${i}" data-option="${j}">${opt}</button>`).join("")}
        <p class="resultat" data-question="${i}"></p>
      </div>
    `;
  });
  return html;
}

function activerQuizLongRead(fiche) {
  document.querySelectorAll(".option").forEach(bouton => {
    bouton.addEventListener("click", () => {
      const qIndex = parseInt(bouton.dataset.question);
      const oIndex = parseInt(bouton.dataset.option);
      const conteneur = document.querySelector(`.check-yourself[data-question="${qIndex}"]`);
      if (conteneur.dataset.repondu === "1") return; // une seule tentative comptabilisée
      conteneur.dataset.repondu = "1";

      const bonneReponse = fiche.questions[qIndex].bonne_reponse;
      const resultat = document.querySelector(`.resultat[data-question="${qIndex}"]`);
      const correct = oIndex === bonneReponse;
      enregistrerReponseQuiz(correct);

      if (correct) {
        resultat.textContent = "Bonne réponse !";
        resultat.style.color = "#4a7a3a";
      } else {
        resultat.textContent = "Pas tout à fait — réessaie la prochaine fois.";
        resultat.style.color = "#b03a2e";
      }
    });
  });
}

/* ===================== Écran Collection ===================== */
function afficherCollection() {
  const zone = document.getElementById("contenu");
  const lues = getLues();
  const streak = calculerStreak();
  const quizStats = getQuizStats();
  const accuracy = quizStats.total > 0 ? Math.round((quizStats.correct / quizStats.total) * 100) : 0;

  const fichesLues = toutesLesFiches.filter(f => lues.includes(f.id)).sort((a, b) => b.ordre - a.ordre);

  let html = `
    <h1 class="ecran-titre serif">Your collection</h1>
    <div class="ecran-soustitre">${fichesLues.length} cards drawn.</div>
    <div class="stats-row">
      <div class="stat-carte">
        <div class="stat-chiffre serif">${streak}</div>
        <div class="stat-label">day streak</div>
      </div>
      <div class="stat-carte">
        <div class="stat-chiffre serif">${accuracy}%</div>
        <div class="stat-label">quiz accuracy</div>
      </div>
    </div>
  `;

  if (fichesLues.length === 0) {
    html += `<div class="collection-vide">Tes fiches lues apparaîtront ici au fil des jours.</div>`;
  } else {
    // Regroupement par phase, plus lisible que par mois vu notre structure
    const groupes = {};
    fichesLues.forEach(f => {
      const cle = `Phase ${f.phase}`;
      if (!groupes[cle]) groupes[cle] = [];
      groupes[cle].push(f);
    });

    Object.keys(groupes).forEach(cle => {
      html += `<div class="groupe-mois">${cle}</div><div class="grille-collection">`;
      groupes[cle].forEach((f, i) => {
        const teinte = i % 2 === 0 ? "teinte-a" : "teinte-b";
        html += `
          <div class="mini-carte ${teinte}" data-id="${f.id}">
            <span class="carte-numero-label">NO. ${f.ordre}</span>
            <div class="mini-titre serif">${f.titre}</div>
            <div class="mini-type">${NOMS_TYPES[f.type] || f.type}</div>
          </div>
        `;
      });
      html += `</div>`;
    });
  }

  zone.innerHTML = html;

  document.querySelectorAll(".mini-carte").forEach(el => {
    el.addEventListener("click", () => ouvrirLongRead(parseInt(el.dataset.id)));
  });
}

/* ===================== Écran Threads ===================== */
function afficherThreads() {
  const zone = document.getElementById("contenu");
  const lues = getLues();
  const types = ["concept", "auteur", "actu", "interpellation", "quiz"];
  const couleurs = { concept: "var(--terracotta)", auteur: "var(--olive)", actu: "var(--terracotta)", interpellation: "var(--olive)", quiz: "var(--terracotta)" };

  let html = `
    <h1 class="ecran-titre serif">Threads</h1>
    <div class="ecran-soustitre">Cards arrive daily, but they're stitched into these.</div>
  `;

  types.forEach(t => {
    const fichesType = toutesLesFiches.filter(f => f.type === t);
    const luesType = fichesType.filter(f => lues.includes(f.id)).length;
    const total = fichesType.length;
    const pourcentage = total > 0 ? Math.round((luesType / total) * 100) : 0;

    html += `
      <div class="thread-carte">
        <div class="thread-titre-row">
          <span class="thread-titre serif">${NOMS_TYPES[t]}</span>
          <span class="thread-compte">${luesType} of ${total}</span>
        </div>
        <div class="thread-barre-fond">
          <div class="thread-barre-fill" style="width:${pourcentage}%;background-color:${couleurs[t]};"></div>
        </div>
        <p class="thread-desc">${DESC_TYPES[t]}</p>
      </div>
    `;
  });

  zone.innerHTML = html;
}

/* ===================== Barre de progression de lecture ===================== */
function mettreAJourBarreProgression() {
  const barre = document.getElementById("barre-progression");
  if (!barre) return;
  const hauteurTotale = document.documentElement.scrollHeight - window.innerHeight;
  const scroll = window.scrollY;
  const pourcentage = hauteurTotale > 0 ? Math.min(100, (scroll / hauteurTotale) * 100) : 0;
  barre.style.width = pourcentage + "%";
}
window.addEventListener("scroll", mettreAJourBarreProgression);

init();
