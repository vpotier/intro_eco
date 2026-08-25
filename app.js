async function chargerFicheDuJour() {
  const zoneFiche = document.getElementById("fiche");

  try {
    const reponse = await fetch("data/fiches.json");
    const fiches = await reponse.json();

    const aujourdhui = new Date().toISOString().split("T")[0];
    const ficheDuJour = fiches.find(f => f.date === aujourdhui) || fiches[0];

    zoneFiche.innerHTML = construireHTML(ficheDuJour);

    if (ficheDuJour.type === "quiz") {
      activerQuiz(ficheDuJour);
    }
  } catch (erreur) {
    zoneFiche.innerHTML = "<p>Erreur de chargement de la fiche. Vérifie que le fichier data/fiches.json existe bien.</p>";
    console.error(erreur);
  }
}

function construireHTML(fiche) {
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

chargerFicheDuJour();
