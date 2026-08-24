import moment from "moment";
function calculaSeguentDiaLaborable() {
  let data = moment().add(1, "days");
  // Dia de la setmana (moment torna de diumenge=0 a dissabte=6 i es tradueix a dilluns=0 a diumenge=6)
  let diaSetmana = diaMomentDilluns(data.day());
  if (diaSetmana == 5)
    data.add(2, "days");
  if (diaSetmana == 6)
    data.add(1, "days");
  return data.toDate();
}
function diaMomentDilluns (dia) {
  let cal = dia-1;
  return cal >= 0 ? cal : 6;
}

function fixIndexDia (dia) {
  let cal = dia+1;
  return cal > 6 ? 0 : cal;
}

/**
 * Torna el dilluns de la setmana ISO indicada, en format Date.
 * L'any es dedueix de la data de referència: s'agafa l'any que deixa la setmana
 * demanada més a prop de la referència, de manera que sumar o restar setmanes mai
 * canvia d'any si no és per creuar el cap d'any (per exemple de la 50 a la 3).
 * Si la data resultant ja ha passat no es corregeix: es deixa que ho validi qui crida.
 * Tot el càlcul es fa en ISO-8601 (la setmana comença dilluns i la setmana 1 és la que
 * conté el primer dijous de l'any), igual que el que es mostra amb isoWeek().
 * Si la setmana demanada no existeix a l'any resultant (la 53 només existeix en alguns
 * anys) es torna l'última setmana de l'any (la 52).
 * Torna null només si la setmana o la data de referència no són valides.
 */
function dataDeSetmana (setmana, dataReferencia) {
  if (!Number.isInteger(setmana) || setmana < 1 || setmana > 53)
    return null;
  const referencia = moment(dataReferencia);
  if (!referencia.isValid())
    return null;
  // S'agafa l'any que deixa la setmana demanada a menys de mig any de la referència
  const diferencia = setmana - referencia.isoWeek();
  let anyIso = referencia.isoWeekYear();
  if (diferencia > 26)
    anyIso = anyIso - 1;
  else if (diferencia < -26)
    anyIso = anyIso + 1;
  const data = moment().isoWeekYear(anyIso).isoWeekday(1).startOf("day");
  // La setmana 53 no existeix a tots els anys: en aquest cas s'agafa l'última
  return data.isoWeek(Math.min(setmana, data.isoWeeksInYear())).toDate();
}

function isSameDate (dateA, dateB) {
  if (!(dateA instanceof Date))
    return false;
  if (!(dateB instanceof Date))
    return false;
  return dateA.getTime() === dateB.getTime();
}

export { calculaSeguentDiaLaborable, fixIndexDia, diaMomentDilluns, isSameDate, dataDeSetmana }