async function chargerFicheDuJour() {
  const zoneFiche = document.getElementById("fiche");

  try {
    const reponse = await fetch("data/fiches.json");
    const fiches = await reponse.json();

    const aujourdhui = new Date().toISOString().split("T")[0];
    const ficheDuJour = fiches.find(f => f.date === aujourdhui) || fiches[0];

    zoneFiche.innerHTML = `
      <span class="type">${ficheDuJour.type}</span>
      <h2>${ficheDuJour.titre}</h2>
      <p>${ficheDuJour.contenu}</p>
    `;
  } catch (erreur) {
    zoneFiche.innerHTML = "<p>Erreur de chargement de la fiche. Vérifie que le fichier data/fiches.json existe bien.</p>";
    console.error(erreur);
  }
}

chargerFicheDuJour();
