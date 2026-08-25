const CLE_LUES = "eco_du_jour_lues";
const CLE_FICHE_AFFICHEE = "eco_du_jour_fiche_affichee";

const NOMS_PHASES = {
  1: "Fondamentaux",
  2: "Courants classiques",
  3: "Macro & politique économique",
  4: "État vs marché",
  5: "Économie contemporaine",
  6: "Économistes médiatiques"
};

const NOMS_SEMAINES = {
  "1-1": "Les bases",
  "1-2": "Le marché",
  "1-3": "Équilibre et monnaie",
  "1-4": "Monnaie et prix",
  "1-5": "Mesurer l'économie",
  "1-6": "Travail et pouvoir d'achat",
  "2-1": "Adam Smith et les fondateurs",
  "2-2": "Malthus et les limites",
  "2-3": "La révolution marginaliste",
  "2-4": "Walras, Marshall, l'équilibre général",
  "2-5": "Pareto et la bascule vers le 20e siècle",
  "3-1": "Qu'est-ce que la macroéconomie",
  "3-2": "Monnaie et monétarisme",
  "3-3": "Inflation et chômage",
  "3-4": "Dette et budget public",
  "3-5": "Croissance et cycles",
  "3-6": "Commerce international et change",
  "4-1": "Les libéraux et l'État minimal",
  "4-2": "Keynésianisme et interventionnisme",
  "4-3": "L'État-providence",
  "4-4": "Néolibéralisme et critique de l'État",
  "4-5": "Régulation et externalités",
  "4-6": "Synthèse État/marché",
  "5-1": "Mondialisation",
  "5-2": "Inégalités",
  "5-3": "Travail et capitalisme contemporain",
  "5-4": "Économie du développement",
  "5-5": "Économie comportementale",
  "5-6": "Croissance, innovation, limites",
  "6-1": "Voix favorables à l'intervention publique",
  "6-2": "Voix favorables au marché",
  "6-3": "Voix techniques et institutionnelles",
  "6-4": "Cartographie et synthèse électorale"
};

function titreSemaine(phase, semaine) {
  const cle = `${phase}-${semaine}`;
  return NOMS_SEMAINES[cle] ? `Semaine ${semaine} — ${NOMS_SEMAINES[cle]}` : `Semaine ${semaine}`;
}

let toutesLesFiches = [];

async function init() {
  const reponse = await fetch("data/fiches.json");
  toutesLesFiches = await reponse.json();
  toutesLesFiches.sort((a, b) => a.ordre - b.ordre);

  document.getElementById("nav-jour").addEventListener("click", afficherFicheDuJour);
  document.getElementById("nav-sommaire").addEventListener("click", afficherSommaire);
  window.addEventListener("scroll", mettreAJourBarreProgression);

  afficherFicheDuJour();
}

function getLues() {
  const stocke = localStorage.getItem(CLE_LUES);
  return stocke ? JSON.parse(stocke) : [];
}

function toggleLue(id) {
  let lues = getLues();
  if (lues.includes(id)) {
    lues = lues.filter(x => x !== id);
  } else {
    lues.push(id);
  }
  localStorage.setItem(CLE_LUES, JSON.stringify(lues));
}

function getFicheAffichee() {
  const stocke = localStorage.getItem(CLE_FICHE_AFFICHEE);
  return stocke ? JSON.parse(stocke) : null;
}

function definirFicheAffichee(id) {
  const aujourdhui = new Date().toISOString().split("T")[0];
  localStorage.setItem(CLE_FICHE_AFFICHEE, JSON.stringify({ id, date: aujourdhui }));
}

function prochaineFicheNonLue() {
  const lues = getLues();
  return toutesLesFiches.find(f => !lues.includes(f.id)) || toutesLesFiches[toutesLesFiches.length - 1];
}

function ficheDuJourCourante() {
  const aujourdhui = new Date().toISOString().split("T")[0];
  const affichee = getFicheAffichee();

  if (affichee && affichee.date === aujourdhui) {
    const fiche = toutesLesFiches.find(f => f.id === affichee.id);
    if (fiche) return fiche;
  }

  const nouvelleFiche = prochaineFicheNonLue();
  definirFicheAffichee(nouvelleFiche.id);
  return nouvelleFiche;
}

function afficherFicheDuJour() {
  document.getElementById("nav-jour").classList.add("actif");
  document.getElementById("nav-sommaire").classList.remove("actif");

  const fiche = ficheDuJourCourante();
  const dejaLue = getLues().includes(fiche.id);
  const zone = document.getElementById("contenu");
  zone.innerHTML = construireHTMLFiche(fiche, dejaLue);

  if (fiche.type === "quiz") activerQuiz(fiche);
  brancherBoutonLue(fiche, afficherFicheDuJour);
  window.scrollTo(0, 0);
  mettreAJourBarreProgression();
}

function afficherSommaire() {
  document.getElementById("nav-sommaire").classList.add("actif");
  document.getElementById("nav-jour").classList.remove("actif");

  const lues = getLues();
  const zone = document.getElementById("contenu");

  // Regroupement des fiches par phase puis par semaine
  const groupes = {};
  toutesLesFiches.forEach(f => {
    if (!groupes[f.phase]) groupes[f.phase] = {};
    if (!groupes[f.phase][f.semaine]) groupes[f.phase][f.semaine] = [];
    groupes[f.phase][f.semaine].push(f);
  });

  let html = "";

  Object.keys(groupes).sort((a, b) => a - b).forEach(phase => {
    const semaines = groupes[phase];
    const fichesPhase = Object.values(semaines).flat();
    const luesPhase = fichesPhase.filter(f => lues.includes(f.id)).length;
    const titrePhase = NOMS_PHASES[phase] || `Phase ${phase}`;

    html += `<details class="groupe-phase" open>
      <summary>
        <span class="numero-phase">${phase}</span>
        <span class="texte-phase">${titrePhase}</span>
        <span class="compteur">${luesPhase}/${fichesPhase.length}</span>
      </summary>`;

    Object.keys(semaines).sort((a, b) => a - b).forEach(semaine => {
      const fichesSemaine = semaines[semaine];
      const luesSemaine = fichesSemaine.filter(f => lues.includes(f.id)).length;

      html += `<details class="groupe-semaine">
        <summary>
          <span class="texte-semaine">${titreSemaine(phase, semaine)}</span>
          <span class="compteur">${luesSemaine}/${fichesSemaine.length}</span>
        </summary>
        <ul class="sommaire">`;

      fichesSemaine.forEach(f => {
        const lue = lues.includes(f.id);
        html += `
          <li class="ligne-sommaire ${lue ? 'lue' : ''}" data-id="${f.id}">
            <span class="check">${lue ? '✓' : '○'}</span>
            <span class="type-badge" data-type="${f.type}">${f.type}</span>
            <span class="titre-sommaire">${f.titre}</span>
          </li>
        `;
      });

      html += `</ul></details>`;
    });

    html += `</details>`;
  });

  zone.innerHTML = html;

  document.querySelectorAll(".ligne-sommaire").forEach(ligne => {
    ligne.addEventListener("click", () => afficherFicheParId(parseInt(ligne.dataset.id)));
  });

  window.scrollTo(0, 0);
  mettreAJourBarreProgression();
}

function afficherFicheParId(id) {
  const fiche = toutesLesFiches.find(f => f.id === id);
  const dejaLue = getLues().includes(fiche.id);
  const zone = document.getElementById("contenu");

  zone.innerHTML = `<button id="btn-retour-sommaire">← Retour au sommaire</button>` + construireHTMLFiche(fiche, dejaLue);

  if (fiche.type === "quiz") activerQuiz(fiche);
  document.getElementById("btn-retour-sommaire").addEventListener("click", afficherSommaire);
  brancherBoutonLue(fiche, () => afficherFicheParId(id));
  window.scrollTo(0, 0);
  mettreAJourBarreProgression();
}

function brancherBoutonLue(fiche, callbackRafraichir) {
  const bouton = document.getElementById("btn-marquer-lue");
  if (bouton) {
    bouton.addEventListener("click", () => {
      toggleLue(fiche.id);
      callbackRafraichir();
    });
  }
}

function construireBloc(bloc) {
  switch (bloc.type) {
    case "texte":
      return `<div class="bloc-texte">${bloc.html}</div>`;
    case "image":
      return `<figure class="bloc-image"><img src="${bloc.url}" alt="${bloc.legende || ''}" loading="lazy"><figcaption>${bloc.legende || ''}</figcaption></figure>`;
    case "video":
      return `<div class="bloc-video"><iframe src="${bloc.url}" title="${bloc.titre || ''}" frameborder="0" allowfullscreen loading="lazy"></iframe></div>`;
    case "lien":
      return `<p class="bloc-lien">🔗 <a href="${bloc.url}" target="_blank" rel="noopener">${bloc.texte}</a></p>`;
    case "encadre":
      return `<div class="bloc-encadre"><p class="encadre-titre">${bloc.titre}</p><div>${bloc.html}</div></div>`;
    default:
      return "";
  }
}

function construireHTMLFiche(fiche, dejaLue) {
  let html = `
    <span class="type" data-type="${fiche.type}">${fiche.type}</span>
    <h2>${fiche.titre}</h2>
  `;

  if (fiche.blocs) {
    fiche.blocs.forEach(bloc => {
      html += construireBloc(bloc);
    });
  } else if (fiche.contenu) {
    html += `<p>${fiche.contenu}</p>`;
  }

  if (fiche.type === "actu" && fiche.source) {
    html += `
      <div class="source">
        <p><strong>Source :</strong> ${fiche.source.texte}</p>
        ${fiche.source.lien ? `<a href="${fiche.source.lien}" target="_blank">Lire l'article</a>` : ""}
        ${fiche.source.date_verification ? `<p class="date-verif">Vérifié le ${fiche.source.date_verification}</p>` : ""}
      </div>
    `;
  }

  if (fiche.type === "quiz" && fiche.questions) {
    fiche.questions.forEach((q, i) => {
      html += `<div class="question" data-question="${i}">
        <p><strong>${q.question}</strong></p>
        ${q.options.map((opt, j) => `<button class="option" data-question="${i}" data-option="${j}">${opt}</button>`).join("")}
        <p class="resultat" data-question="${i}"></p>
      </div>`;
    });
  }

  html += `<div class="marquer-lue-zone">
    <button id="btn-marquer-lue" class="${dejaLue ? 'lue' : ''}">${dejaLue ? 'Annuler la lecture' : 'Marquer comme lue'}</button>
  </div>`;

  return html;
}

function activerQuiz(fiche) {
  document.querySelectorAll(".option").forEach(bouton => {
    bouton.addEventListener("click", () => {
      const qIndex = parseInt(bouton.dataset.question);
      const oIndex = parseInt(bouton.dataset.option);
      const bonneReponse = fiche.questions[qIndex].bonne_reponse;
      const resultat = document.querySelector(`.resultat[data-question="${qIndex}"]`);

      if (oIndex === bonneReponse) {
        resultat.textContent = "Bonne réponse !";
        resultat.style.color = "green";
      } else {
        resultat.textContent = "Pas tout à fait — réessaie.";
        resultat.style.color = "#b03a2e";
      }
    });
  });
}

function mettreAJourBarreProgression() {
  const barre = document.getElementById("barre-progression");
  if (!barre) return;
  const hauteurTotale = document.documentElement.scrollHeight - window.innerHeight;
  const scroll = window.scrollY;
  const pourcentage = hauteurTotale > 0 ? Math.min(100, (scroll / hauteurTotale) * 100) : 0;
  barre.style.width = pourcentage + "%";
}

init();
