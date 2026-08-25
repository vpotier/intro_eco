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

const SVG_FLECHE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`;

const NOMS_PHASES = {
  1: "Fondamentaux",
  2: "Courants classiques",
  3: "Macro & politique économique",
  4: "État vs marché",
  5: "Économie contemporaine",
  6: "Économistes médiatiques"
};

const NOMS_SEMAINES = {
  "1-1": "Les bases", "1-2": "Le marché", "1-3": "Équilibre et monnaie",
  "1-4": "Monnaie et prix", "1-5": "Mesurer l'économie", "1-6": "Travail et pouvoir d'achat",
  "2-1": "Adam Smith et les fondateurs", "2-2": "Malthus et les limites", "2-3": "La révolution marginaliste",
  "2-4": "Walras, Marshall, l'équilibre général", "2-5": "Pareto et la bascule vers le 20e siècle",
  "3-1": "Qu'est-ce que la macroéconomie", "3-2": "Monnaie et monétarisme", "3-3": "Inflation et chômage",
  "3-4": "Dette et budget public", "3-5": "Croissance et cycles", "3-6": "Commerce international et change",
  "4-1": "Les libéraux et l'État minimal", "4-2": "Keynésianisme et interventionnisme", "4-3": "L'État-providence",
  "4-4": "Néolibéralisme et critique de l'État", "4-5": "Régulation et externalités", "4-6": "Synthèse État/marché",
  "5-1": "Mondialisation", "5-2": "Inégalités", "5-3": "Travail et capitalisme contemporain",
  "5-4": "Économie du développement", "5-5": "Économie comportementale", "5-6": "Croissance, innovation, limites",
  "6-1": "Voix favorables à l'intervention publique", "6-2": "Voix favorables au marché",
  "6-3": "Voix techniques et institutionnelles", "6-4": "Cartographie et synthèse électorale"
};

let toutesLesFiches = [];
let vueRacine = "today";       // écran de fond : today / collection / threads
let pileImbriquee = [];        // écrans empilés par-dessus : longread, recherche, sommaire
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

function remplacerContenu(zone, html) {
  zone.innerHTML = html;
  // Relance l'animation d'entrée (une classe déjà présente ne se réanime pas seule)
  zone.classList.remove("contenu-anime");
  void zone.offsetWidth;
  zone.classList.add("contenu-anime");
}

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
  vueRacine = ecran;
  pileImbriquee = [];
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

/* ===================== Navigation imbriquée (longread / recherche / sommaire) ===================== */
function ouvrirLongRead(id) {
  pileImbriquee.push({ type: "longread", id });
  document.getElementById("bottom-nav").style.display = "none";
  rendreVueImbriquee();
}

function ouvrirSommaire() {
  pileImbriquee.push({ type: "sommaire" });
  document.getElementById("bottom-nav").style.display = "none";
  rendreVueImbriquee();
}

function ouvrirRechercheMotCle(mot) {
  pileImbriquee.push({ type: "recherche", mot });
  rendreVueImbriquee();
}

function retourArriere() {
  pileImbriquee.pop();
  if (pileImbriquee.length === 0) {
    document.getElementById("bottom-nav").style.display = "flex";
    allerA(vueRacine);
  } else {
    rendreVueImbriquee();
  }
}

function rendreVueImbriquee() {
  const sommet = pileImbriquee[pileImbriquee.length - 1];
  if (sommet.type === "longread") {
    ficheLongreadId = sommet.id;
    afficherLongRead();
  } else if (sommet.type === "recherche") {
    afficherRechercheContenu(sommet.mot);
  } else if (sommet.type === "sommaire") {
    afficherSommaireContenu();
  }
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
      <div class="header-right">
        <button class="btn-icone" id="btn-sommaire" title="Sommaire">☰</button>
        <div class="streak-badge">🔥 ${streak} jours de suite</div>
      </div>
    </div>
    <div class="date-ligne">${dateCapitalisee}<span class="separateur">·</span>Carte n° ${fiche.ordre}</div>
  `;

  if (!carteEstOuverte(fiche.id)) {
    html += `
      <div class="carte-flip" id="carte-flip">
        <div class="carte-flip-inner" id="carte-flip-inner">
          <div class="carte-face carte-face-avant">
            <div class="carte-verrouillee">
              <div class="anneau a1"></div>
              <div class="anneau a2"></div>
              <div class="anneau a3"></div>
              <h2 class="serif">Ta carte du jour est prête</h2>
              <button class="btn-reveler serif" id="btn-reveler">Toucher pour révéler</button>
            </div>
          </div>
          <div class="carte-face carte-face-arriere">
            ${construireCarteRecto(fiche, false)}
          </div>
        </div>
      </div>
    `;
    remplacerContenu(zone, html);

    document.getElementById("carte-flip").addEventListener("click", () => {
      const inner = document.getElementById("carte-flip-inner");
      inner.classList.add("retournee");
      setTimeout(() => {
        ouvrirCarteDuJour(fiche.id);
        afficherToday();
      }, 650);
    }, { once: true });
  } else {
    html += construireCarteRecto(fiche, true);
    remplacerContenu(zone, html);
    brancherEvenementsRecto(fiche);
  }

  document.getElementById("btn-sommaire").addEventListener("click", ouvrirSommaire);
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
    ? "🔗 Toucher pour le cas concret"
    : (fiche.type === "quiz" ? "📝 Toucher pour commencer le quiz" : "→ Aller plus loin pour en savoir plus");

  let html = `
    <div class="carte-recto" id="carte-recto">
      <span class="carte-numero">N° ${fiche.ordre}</span>
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
        <button class="btn-go-deeper serif" id="btn-go-deeper">Aller plus loin</button>
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
function afficherLongRead() {
  const fiche = toutesLesFiches.find(f => f.id === ficheLongreadId);
  const zone = document.getElementById("contenu");
  const dejaLue = getLues().includes(fiche.id);
  const typeLabel = NOMS_TYPES[fiche.type] || fiche.type;

  let html = `
    <div class="longread-header">
      <button class="btn-retour-rond" id="btn-retour-longread">${SVG_FLECHE}</button>
      <div>
        <div class="longread-eyebrow">POUR ALLER PLUS LOIN</div>
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
      ${dejaLue ? '✓ Dans ta collection' : 'Garder dans ma collection'}
    </button>
  `;

  remplacerContenu(zone, html);

  document.getElementById("btn-retour-longread").addEventListener("click", retourArriere);

  const btnGarder = document.getElementById("btn-garder");
  btnGarder.addEventListener("click", () => {
    marquerLue(fiche.id);
    btnGarder.textContent = "✓ Dans ta collection";
    btnGarder.classList.add("dans-collection");
  });

  document.querySelectorAll(".tag-pill-clic").forEach(el => {
    el.addEventListener("click", () => ouvrirRechercheMotCle(el.dataset.mot));
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
        <div class="longread-section-eyebrow">Repéré dans l'actualité</div>
        <p>${fiche.source.texte}</p>
        ${fiche.source.lien ? `<a href="${fiche.source.lien}" target="_blank" rel="noopener">Lire l'article source</a>` : ""}
        ${fiche.source.date_verification ? `<div class="date-verif">Vérifié le ${fiche.source.date_verification}</div>` : ""}
      </div>
    `;
  }

  return html;
}

function extraireMotsCles(fiche) {
  // Les termes importants sont déjà balisés dans le contenu avec <em class="accent">…</em> :
  // on les réutilise comme mots-clés plutôt que de retagger les 231 fiches à la main.
  if (!fiche.blocs) return [];
  const motsCles = new Set();
  const regex = /<em class="accent">(.*?)<\/em>/g;
  fiche.blocs.forEach(bloc => {
    if (bloc.type !== "texte" || !bloc.html) return;
    regex.lastIndex = 0;
    let m;
    while ((m = regex.exec(bloc.html)) !== null) {
      const mot = m[1].replace(/<[^>]+>/g, "").trim();
      if (mot.length > 1) motsCles.add(mot);
    }
  });
  return Array.from(motsCles).slice(0, 6);
}

function construirePullsOn(fiche) {
  const motsCles = extraireMotsCles(fiche);
  if (motsCles.length === 0) return "";
  const pills = motsCles.map(mot =>
    `<button class="tag-pill tag-pill-clic" data-mot="${mot.replace(/"/g, '&quot;')}">${mot}</button>`
  ).join("");
  return `
    <div class="longread-section-eyebrow">Mots-clés</div>
    <div class="pulls-on">${pills}</div>
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
    <h1 class="ecran-titre serif">Ta collection</h1>
    <div class="ecran-soustitre">${fichesLues.length} carte${fichesLues.length > 1 ? 's' : ''} tirée${fichesLues.length > 1 ? 's' : ''}.</div>
    <div class="stats-row">
      <div class="stat-carte">
        <div class="stat-chiffre serif">${streak}</div>
        <div class="stat-label">jours de suite</div>
      </div>
      <div class="stat-carte">
        <div class="stat-chiffre serif">${accuracy}%</div>
        <div class="stat-label">précision aux quiz</div>
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
            <span class="carte-numero-label">N° ${f.ordre}</span>
            <div class="mini-titre serif">${f.titre}</div>
            <div class="mini-type">${NOMS_TYPES[f.type] || f.type}</div>
          </div>
        `;
      });
      html += `</div>`;
    });
  }

  remplacerContenu(zone, html);

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
    <h1 class="ecran-titre serif">Fils</h1>
    <div class="ecran-soustitre">Une carte par jour, tissée dans ces grands fils.</div>
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
          <span class="thread-compte">${luesType} / ${total}</span>
        </div>
        <div class="thread-barre-fond">
          <div class="thread-barre-fill" style="width:${pourcentage}%;background-color:${couleurs[t]};"></div>
        </div>
        <p class="thread-desc">${DESC_TYPES[t]}</p>
      </div>
    `;
  });

  remplacerContenu(zone, html);
}

/* ===================== Recherche par mot-clé ===================== */
function afficherRechercheContenu(mot) {
  const zone = document.getElementById("contenu");
  const motLower = mot.toLowerCase();
  const lues = getLues();

  const resultats = toutesLesFiches.filter(f =>
    f.blocs && f.blocs.some(b => b.type === "texte" && b.html.toLowerCase().includes(motLower))
  );

  let html = `
    <div class="longread-header">
      <button class="btn-retour-rond" id="btn-retour-imbrique">${SVG_FLECHE}</button>
      <div><div class="longread-eyebrow">MOT-CLÉ</div></div>
    </div>
    <h2 class="longread-titre serif">${mot}</h2>
    <div class="ecran-soustitre">${resultats.length} carte${resultats.length > 1 ? "s" : ""} en parlent</div>
    <div class="grille-collection">
  `;

  resultats.forEach((f, i) => {
    const teinte = i % 2 === 0 ? "teinte-a" : "teinte-b";
    const check = lues.includes(f.id) ? "✓ " : "";
    html += `
      <div class="mini-carte ${teinte}" data-id="${f.id}">
        <span class="carte-numero-label">N° ${f.ordre}</span>
        <div class="mini-titre serif">${check}${f.titre}</div>
        <div class="mini-type">${NOMS_TYPES[f.type] || f.type}</div>
      </div>
    `;
  });

  html += `</div>`;
  remplacerContenu(zone, html);

  document.getElementById("btn-retour-imbrique").addEventListener("click", retourArriere);
  document.querySelectorAll(".mini-carte").forEach(el => {
    el.addEventListener("click", () => ouvrirLongRead(parseInt(el.dataset.id)));
  });
}

/* ===================== Sommaire ===================== */
function afficherSommaireContenu() {
  const zone = document.getElementById("contenu");
  const lues = getLues();

  const groupes = {};
  toutesLesFiches.forEach(f => {
    if (!groupes[f.phase]) groupes[f.phase] = {};
    if (!groupes[f.phase][f.semaine]) groupes[f.phase][f.semaine] = [];
    groupes[f.phase][f.semaine].push(f);
  });

  let html = `
    <div class="longread-header">
      <button class="btn-retour-rond" id="btn-retour-imbrique">${SVG_FLECHE}</button>
      <div><div class="longread-eyebrow">SOMMAIRE</div></div>
    </div>
    <h2 class="longread-titre serif">Toutes les fiches</h2>
  `;

  Object.keys(groupes).sort((a, b) => a - b).forEach(phase => {
    const semaines = groupes[phase];
    const fichesPhase = Object.values(semaines).flat();
    const luesPhase = fichesPhase.filter(f => lues.includes(f.id)).length;

    html += `<details class="groupe-phase" open>
      <summary>
        <span class="numero-phase">${phase}</span>
        <span class="texte-phase serif">${NOMS_PHASES[phase] || ("Phase " + phase)}</span>
        <span class="thread-compte">${luesPhase}/${fichesPhase.length}</span>
      </summary>`;

    Object.keys(semaines).sort((a, b) => a - b).forEach(semaine => {
      const fichesSemaine = semaines[semaine];
      const luesSemaine = fichesSemaine.filter(f => lues.includes(f.id)).length;
      const cle = `${phase}-${semaine}`;
      const titreSemaine = NOMS_SEMAINES[cle] ? `Semaine ${semaine} — ${NOMS_SEMAINES[cle]}` : `Semaine ${semaine}`;

      html += `<details class="groupe-semaine">
        <summary>
          <span class="texte-semaine">${titreSemaine}</span>
          <span class="thread-compte">${luesSemaine}/${fichesSemaine.length}</span>
        </summary>
        <ul class="sommaire-liste">`;

      fichesSemaine.forEach(f => {
        const lu = lues.includes(f.id);
        html += `
          <li class="ligne-sommaire ${lu ? 'lue' : ''}" data-id="${f.id}">
            <span class="check">${lu ? '✓' : '○'}</span>
            <span class="type-tag mini">${NOMS_TYPES[f.type] || f.type}</span>
            <span class="titre-sommaire">${f.titre}</span>
          </li>
        `;
      });

      html += `</ul></details>`;
    });

    html += `</details>`;
  });

  remplacerContenu(zone, html);

  document.getElementById("btn-retour-imbrique").addEventListener("click", retourArriere);
  document.querySelectorAll(".ligne-sommaire").forEach(el => {
    el.addEventListener("click", () => ouvrirLongRead(parseInt(el.dataset.id)));
  });
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
