body {
  font-family: Georgia, serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #faf8f5;
  color: #2b2b2b;
  line-height: 1.6;
}

#barre-progression {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  width: 0%;
  background-color: #9c6b3f;
  z-index: 1000;
  transition: width 0.1s ease-out;
}

header h1 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  margin-top: 10px;
}

nav {
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #2b2b2b;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

nav button {
  background: none;
  border: 1px solid #2b2b2b;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-family: Georgia, serif;
}

nav button.actif {
  background-color: #2b2b2b;
  color: #faf8f5;
}

#contenu h2 {
  font-size: 1.3rem;
  margin-top: 20px;
}

#contenu .type {
  display: inline-block;
  background-color: #d9c9a3;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.accent {
  font-style: italic;
  color: #9c6b3f;
}

.bloc-texte {
  margin-bottom: 12px;
}

.bloc-image img {
  width: 100%;
  border-radius: 6px;
  display: block;
}

.bloc-image figcaption {
  font-size: 0.8rem;
  color: #777;
  margin-top: 4px;
  text-align: center;
}

.bloc-video iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 6px;
  border: none;
}

.bloc-lien a {
  color: #9c6b3f;
}

.bloc-encadre {
  background-color: #eee8dd;
  border-left: 3px solid #b0946a;
  padding: 12px 14px;
  margin: 18px 0;
  border-radius: 0 6px 6px 0;
}

.encadre-titre {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  margin: 0 0 6px 0;
  color: #7a5a35;
}

.source {
  margin-top: 15px;
  padding: 10px;
  background-color: #eee8dd;
  border-left: 3px solid #b0946a;
  font-size: 0.9rem;
}

.date-verif {
  font-size: 0.8rem;
  color: #777;
}

.question {
  margin-top: 20px;
  padding: 12px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.option {
  display: block;
  width: 100%;
  text-align: left;
  margin: 6px 0;
  padding: 8px;
  background-color: #f0ece3;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.option:hover {
  background-color: #e2d9c5;
}

.resultat {
  font-weight: bold;
  margin-top: 8px;
}

.marquer-lue-zone {
  margin-top: 25px;
}

#btn-marquer-lue {
  background-color: #2b2b2b;
  color: #faf8f5;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-family: Georgia, serif;
}

#btn-marquer-lue.lue {
  background-color: #8a8a8a;
}

.groupe-phase {
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.groupe-phase > summary {
  background-color: #2b2b2b;
  color: #faf8f5;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: bold;
  list-style: none;
}

.groupe-phase > summary::-webkit-details-marker {
  display: none;
}

.groupe-semaine {
  border-top: 1px solid #eee;
}

.groupe-semaine > summary {
  padding: 8px 14px;
  cursor: pointer;
  background-color: #f0ece3;
  font-size: 0.9rem;
  list-style: none;
}

.groupe-semaine > summary::-webkit-details-marker {
  display: none;
}

.compteur {
  float: right;
  font-size: 0.8rem;
  opacity: 0.8;
  font-weight: normal;
}

.sommaire {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ligne-sommaire {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.ligne-sommaire:hover {
  background-color: #f0ece3;
}

.ligne-sommaire.lue {
  opacity: 0.6;
}

.check {
  font-size: 1.1rem;
  width: 20px;
}

.type-badge {
  font-size: 0.75rem;
  text-transform: uppercase;
  background-color: #d9c9a3;
  padding: 2px 6px;
  border-radius: 3px;
}

.titre-sommaire {
  flex: 1;
}

#btn-retour-sommaire {
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  margin-bottom: 10px;
  font-family: Georgia, serif;
  text-decoration: underline;
}
