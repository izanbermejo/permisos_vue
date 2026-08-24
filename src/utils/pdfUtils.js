/**
 * Obre un PDF en una pestanya nova utilitzant el visor integrat del navegador.
 *
 * S'obre una pàgina HTML pròpia (finestra en blanc) amb el PDF incrustat en un
 * `iframe`, de manera que podem fixar el títol de la pestanya amb `document.title`.
 *
 * Nota: perquè el PDF es mostri en comptes de descarregar-se, el navegador ha
 * d'estar configurat per obrir els PDF amb el visor integrat (a Firefox:
 * Opcions → Aplicacions → PDF → "Obre amb el Firefox").
 *
 * @param {BlobPart} data Contingut del PDF (blob rebut del backend).
 * @param {string} nom Nom que es mostrarà com a títol de la pestanya.
 */
export function obrirPdfNovaPestanya(data, nom) {
  const blob = new Blob([data], { type: 'application/pdf' });
  const fileUrl = URL.createObjectURL(blob);

  const iframe = document.createElement('iframe');
  iframe.src = fileUrl;
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';

  const novaFinestra = window.open('', '_blank');
  novaFinestra.document.body.style.margin = '0';
  novaFinestra.document.body.appendChild(iframe);
  novaFinestra.document.title = nom;

  // Alliberem l'URL en tancar la pestanya per no acumular memòria.
  novaFinestra.addEventListener('beforeunload', () => URL.revokeObjectURL(fileUrl));
}
