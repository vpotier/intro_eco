const CLE_LUES = "eco_du_jour_lues";
const CLE_FICHE_AFFICHEE = "eco_du_jour_fiche_affichee";

let toutesLesFiches = [];

async function init() {
  const reponse = await fetch("data/fiches.json");
  toutesLesFiches = await reponse.json();
  toutesLesFiches.sort((a, b) => a.ordre - b.ordre);

  document.getElementById("nav-jour").addEventListener("click", afficherFicheDuJour);
  document.getElementById("nav-sommaire").addEventListener("click", afficherSommaire);

  afficherFicheDuJour();
}

function getLues() {
  const stocke = localStorage.getItem(CLE_LUES);
  return stocke ? JSON.parse(stocke) : [];
}

function marquerCommeLue(id) {
  const lues = getLues();
  if (!lues.includes(id)) {
    lues.push(id);
    localStorage.setItem(CLE_LUES, JSON.stringify(lues));
  }
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
}

function afficherSommaire() {
  document.getElementById("nav-sommaire").classList.add("actif");
  document.getElementById("nav-jour").classList.remove("actif");

  const lues = getLues();
  const zone = document.getElementById("contenu");

  let html = "<ul class='sommaire'>";
  toutesLesFiches.forEach(f => {
    const lue = lues.includes(f.id);
    html += `
      <li class="ligne-sommaire ${lue ? 'lue' : ''}" data-id="${f.id}">
        <span class="check">${lue ? '✓' : '○'}</span>
        <span class="type-badge">${f.type}</span>
        <span class="titre-sommaire">${f.titre}</span>
      </li>
    `;
  });
  html += "</ul>";
  zone.innerHTML = html;

  document.querySelectorAll(".ligne-sommaire").forEach(ligne => {
    ligne.addEventListener("click", () => afficherFicheParId(parseInt(ligne.dataset.id)));
  });
}

function afficherFicheParId(id) {
  const fiche = toutesLesFiches.find(f => f.id === id);
  const dejaLue = getLues().includes(fiche.id);
  const zone = document.getElementById("contenu");

  zone.innerHTML = `<button id="btn-retour-sommaire">← Retour au sommaire</button>` + construireHTMLFiche(fiche, dejaLue);

  if (fiche.type === "quiz") activerQuiz(fiche);
  document.getElementById("btn-retour-sommaire").addEventListener("click", afficherSommaire);
  brancherBoutonLue(fiche, () => afficherFicheParId(id));
}

function brancherBoutonLue(fiche, callbackRafraichir) {
  const bouton = document.getElementById("btn-marquer-lue");
  if (bouton) {
    bouton.addEventListener("click", () => {
      marquerCommeLue(fiche.id);
      callbackRafraichir();
    });
  }
}

function construireHTMLFiche(fiche, dejaLue) {
  let html = `
    <span class="type">${fiche.type}</span>
    <h2>${fiche.titre}</h2>
    <p>${fiche.contenu}</p>
  `;

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
    ${dejaLue
      ? `<p class="statut-lue">✓ Fiche marquée comme lue</p>`
      : `<button id="btn-marquer-lue">Marquer comme lue</button>`}
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

init();
