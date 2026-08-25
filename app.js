// ---- Réglages du programme ----
const START_DATE = "2026-08-25"; // jour 1 du programme
const TOTAL_DAYS = 236; // dernière fiche prévue le 18 avril 2027

// Libellés affichés pour chaque type de fiche
const TYPE_LABELS = {
  concept: "Concept",
  auteur: "Portrait d'auteur",
  actu: "Actualité",
  interpellation: "Question",
  quiz: "Quiz"
};

// ---- Calcule quel numéro de jour du programme on est aujourd'hui ----
function getDayNumber() {
  const start = new Date(START_DATE + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = today - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1; // jour 1 = jour de lancement
}

// ---- Affiche la date du jour en français, en toutes lettres ----
function renderDate() {
  const el = document.getElementById("date");
  const formatted = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  el.textContent = formatted;
}

// ---- Construit le HTML d'une fiche ----
function renderFiche(fiche) {
  const container = document.getElementById("fiche-content");

  const badgeLabel = TYPE_LABELS[fiche.type] || fiche.type;

  let exampleHtml = "";
  if (fiche.exemple) {
    exampleHtml = `
      <div class="example-box">
        <span class="label">Exemple d'actualité</span>
        <p>${fiche.exemple}</p>
        ${fiche.source ? `<a class="source-link" href="${fiche.source}" target="_blank" rel="noopener">Voir la source →</a>` : ""}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="card">
      <span class="badge ${fiche.type}">${badgeLabel}</span>
      <h1 class="fiche-title">${fiche.titre}</h1>
      <div class="fiche-body">
        ${fiche.contenu.map(p => `<p>${p}</p>`).join("")}
      </div>
      ${exampleHtml}
    </div>
  `;
}

// ---- Affiche un message si aucune fiche n'existe pour aujourd'hui ----
function renderEmpty(dayNumber) {
  const container = document.getElementById("fiche-content");
  if (dayNumber < 1) {
    container.innerHTML = `<p class="empty">Le programme n'a pas encore commencé.</p>`;
  } else if (dayNumber > TOTAL_DAYS) {
    container.innerHTML = `<p class="empty">Le programme est terminé. Merci d'avoir suivi ces 236 fiches !</p>`;
  } else {
    container.innerHTML = `<p class="empty">Aucune fiche trouvée pour aujourd'hui (jour ${dayNumber}). Vérifie data/fiches.json.</p>`;
  }
}

// ---- Point d'entrée ----
async function init() {
  renderDate();
  const dayNumber = getDayNumber();

  document.getElementById("progress").textContent =
    dayNumber >= 1 && dayNumber <= TOTAL_DAYS
      ? `Jour ${dayNumber} sur ${TOTAL_DAYS}`
      : "";

  try {
    const response = await fetch("data/fiches.json");
    const fiches = await response.json();
    const todayFiche = fiches.find(f => f.jour === dayNumber);

    if (todayFiche) {
      renderFiche(todayFiche);
    } else {
      renderEmpty(dayNumber);
    }
  } catch (err) {
    document.getElementById("fiche-content").innerHTML =
      `<p class="empty">Erreur de chargement des données.</p>`;
    console.error(err);
  }
}

init();
