function nextIndex(currentIndex, listSize) {
  let nextIndex = currentIndex+1;
  if (nextIndex > listSize-1) {
    // En cas que el següent index superi els elements de la llista
    // s'obté l'anterior en cas que hagi més d'un element, sino -1
    if (listSize > 1) {
      nextIndex = currentIndex-1;
    } else {
      nextIndex = -1;
    }
  }
  return nextIndex;
}

function home(elem, selectedIndex, list) {
  if (list?.value?.length) {
    selectedIndex.value = 0;
    elem.getElementsByClassName('p-datatable-wrapper')[0].scrollTop = 0;
  }
}

function end(elem, selectedIndex, list) {
  if (list?.value?.length) {
    selectedIndex.value = list.value.length-1;
    var objDiv = elem.getElementsByClassName('p-datatable-wrapper')[0];
    objDiv.scrollTop = objDiv.scrollHeight;
  }
}

function arrowDown(elem, selectedIndex, list) {
  if (list?.value?.length) {
    if (selectedIndex.value < list.value.length - 1) {
      selectedIndex.value = selectedIndex.value + 1;
      scrollIfNeeded(elem, selectedIndex.value);
    }
  }
}

function arrowUp(elem, selectedIndex, list) {
  if (list?.value?.length) {
    if (selectedIndex.value > 0) {
      selectedIndex.value = selectedIndex.value-1;
      scrollIfNeededUp(elem, selectedIndex.value);
    }
  }
}

function scrollIfNeeded (elem, index) {
  var row = elem.getElementsByClassName('p-selectable-row')[index];
  var wrapper = elem.getElementsByClassName('p-datatable-wrapper')[0];
  var head = wrapper.getElementsByClassName('p-datatable-thead')[0];
  var hHead = head.offsetHeight;
  if (!checkInView(wrapper, hHead, row, true)) {
      row.scrollIntoView(false);
      return true;
  }
  return false;
}

function scrollIfNeededUp (elem, index) {
  var row = elem?.getElementsByClassName('p-selectable-row')[index];
  var wrapper = elem.getElementsByClassName('p-datatable-wrapper')[0];
  var head = wrapper.getElementsByClassName('p-datatable-thead')[0];
  var hHead = head.offsetHeight;
  if (!checkInView(wrapper, -hHead, row, false)) {
      row.scrollIntoView(false);
      return true;
  }
  return false;
}

function hasScrollbar(elem) {
  return elem.scrollHeight > elem.clientHeight;
}

function avPag(elem, selectedIndex, list) {
  var scrollVisible = hasScrollbar(elem.getElementsByClassName('p-datatable-wrapper')[0]);
  if (scrollVisible) {
      var wrapper = elem.getElementsByClassName('p-datatable-wrapper')[0];
      var head = elem.getElementsByClassName('p-datatable-wrapper')[0].getElementsByClassName('p-datatable-thead')[0]
      var hHead = head.offsetHeight;
      var rows = elem.getElementsByClassName('p-datatable-wrapper')[0].getElementsByClassName('p-selectable-row');
      for (let i = selectedIndex.value+1; i < rows.length-1; i++) {
          if (!checkInView(wrapper, hHead, rows[i], true)) {
              selectedIndex.value = i;
              elem.getElementsByClassName('p-selectable-row')[selectedIndex.value].scrollIntoView(true);
              var row = elem.getElementsByClassName('p-datatable-wrapper')[0];
              row.scrollTop = row.scrollTop - hHead;
              break;
          }
      }
      var contUp = 0;
      var contDown = 0;
      for (let i = 0; i < rows.length-1; i++) {
          contUp = i < selectedIndex.value && checkInView(wrapper, hHead, rows[i], false) ? contUp+1 : contUp;
          contDown = i > selectedIndex.value && checkInView(wrapper, hHead, rows[i], true) ? contDown+1 : contDown;
      }
      if (contUp > 0) {
          selectedIndex.value = list.value.length-1;
          var objDiv = elem.getElementsByClassName('p-datatable-wrapper')[0];
          objDiv.scrollTop = objDiv.scrollHeight;
      }
  } else {
    end(elem, selectedIndex, list);
  }
}

function rePag(elem, selectedIndex, list) {
  var scrollVisible = hasScrollbar(elem.getElementsByClassName('p-datatable-wrapper')[0]);
  if (scrollVisible) {
      var wrapper = elem.getElementsByClassName('p-datatable-wrapper')[0];
      // var hWrapper = wrapper.offsetHeight;
      var head = elem.getElementsByClassName('p-datatable-wrapper')[0].getElementsByClassName('p-datatable-thead')[0]
      var hHead = head.offsetHeight;
      // var hRow = elem.getElementsByClassName('p-datatable-wrapper')[0].getElementsByClassName('p-selectable-row')[0].offsetHeight;
      var rows = elem.getElementsByClassName('p-datatable-wrapper')[0].getElementsByClassName('p-selectable-row');
      for (let i = selectedIndex.value-1; i > 0; i--) {
          if (!checkInViewUp(wrapper, hHead, rows[i], false)) {
              selectedIndex.value = i;
              elem.getElementsByClassName('p-selectable-row')[selectedIndex.value].scrollIntoView(false);
              break;
          }
      }
      var contUp = 0;
      var contDown = 0;
      for (let i = 0; i < rows.length-1; i++) {
          contUp = i < selectedIndex.value && checkInView(wrapper, hHead, rows[i], false) ? contUp+1 : contUp;
          contDown = i > selectedIndex.value && checkInView(wrapper, hHead, rows[i], true) ? contDown+1 : contDown;
      }
      if (contDown > 0) {
          selectedIndex.value = 0;
          elem.getElementsByClassName('p-datatable-wrapper')[0].scrollTop = 0;
      }
  } else {
    home(elem, selectedIndex, list);
  }
}

function checkInView (container, headHeight, element, partial) {
  //Get container properties
  let cTop = container.scrollTop;
  let cBottom = cTop + container.clientHeight - headHeight;

  //Get element properties
  let eTop = element.offsetTop - container.offsetTop -5; // -5 marge d'error
  let eBottom = eTop + element.clientHeight +5; // +5 marge d'error

  //Check if in view    
  let isTotal = (eTop >= cTop && eBottom <= cBottom);
  let isPartial = partial && (
  (eTop < cTop && eBottom > cTop) ||
  (eBottom > cBottom && eTop < cBottom)
  );

  //Return outcome
  return  (isTotal  || isPartial);
}

function checkInViewUp (container, headHeight, element, partial) {
  //Get container properties
  let cTop = container.scrollTop;
  let cBottom = cTop + container.clientHeight - headHeight;

  //Get element properties
  let eTop = element.offsetTop - container.offsetTop +5; // +5 marge d'error
  let eBottom = eTop + element.clientHeight -5; // -5 marge d'error

  //Check if in view    
  let isTotal = (eTop >= cTop && eBottom <= cBottom);
  let isPartial = partial && (
  (eTop < cTop && eBottom > cTop) ||
  (eBottom > cBottom && eTop < cBottom)
  );

  //Return outcome
  return  (isTotal  || isPartial);
}

function scrollCenter(elem, index) {
  if (index?.value > 0 && scrollIfNeeded(elem, index.value)) {
    var row = elem.getElementsByClassName('p-selectable-row')[index.value];
    row.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'center'
    });
  }
}

function showMenu(elem, index) {
  if (index?.value >= 0) {
    var row = elem.getElementsByClassName('p-selectable-row')[index.value];
    var btn = row.getElementsByTagName('button')[0];
    var tdBtn = row.getElementsByTagName('td')[0];
    var pos = tdBtn.getBoundingClientRect();
    btn.dispatchEvent(new MouseEvent(
      "click", 
      {
          clientX: pos.left+5,
          clientY: pos.top+5,
          bubbles: true
      }
    ));
  }
}

function controlDataTable(evKey, elem, index, list) {
  var ctrlData = true;
  // En cas que el focus estigui en un camp de text no es tindrà en compte algunes tecles
  if (document.activeElement?.type === "text") {
    if (!evKey.ctrlKey && (evKey.key=='Home' || evKey.key=='End'))
      ctrlData = false;
  }
  // Controls de tecles del datatable
  if (ctrlData) {
    if (evKey.ctrlKey && evKey.which==79) { // Ctrl + O
      evKey.preventDefault();
      showMenu(elem, index);
    } else if (evKey.key === 'ArrowDown') {
      evKey.preventDefault();
      arrowDown(elem, index, list);
    } else if (evKey.key === 'ArrowUp') {
      evKey.preventDefault();
      arrowUp(elem, index, list);
    } else if (evKey.key == 'PageDown') {
      evKey.preventDefault();
      avPag(elem, index, list);
    } else if (evKey.key == 'PageUp') {
      evKey.preventDefault();
      rePag(elem, index, list);
    } else if (evKey.key=='Home') {
      evKey.preventDefault();
      home(elem, index, list);
    } else if (evKey.key=='End') {
      evKey.preventDefault();
      end(elem, index, list);
    }
  }
}

// ── Ordenació genèrica de graelles ──────────────────────────────────────────
// Reutilitzable per qualsevol grid amb navegació per teclat (selectedIndex).
// Requereix que el DataTable estigui en mode :lazy, perquè PrimeVue NO reordeni
// la vista pel seu compte: així el nostre array i el que es mostra sempre
// coincideixen i el selectedIndex/moviment per teclat segueix sent vàlid.

// Comparador de cadenes equivalent al de PrimeVue: ordena de manera natural els
// números dins del text ("codi9" < "codi10").
const collator = new Intl.Collator(undefined, { numeric: true });

// Resol un camp amb notació de punt: resolveField(obj, 'id.codi').
function resolveField(obj, field) {
  if (!field) return obj;
  return field.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

// Converteix el valor cru al valor real amb què s'ha de comparar segons el tipus
// de columna. Per a 'date' accepta un Date, una cadena ISO ("2026-07-23" o amb
// hora) o un timestamp i retorna un número (timestamp) perquè l'ordre sigui
// cronològic i no alfabètic. Per a formats no ISO (p. ex. dd/mm/yyyy) cal passar
// un `sortValue` propi a ordenarLlista/ordenarGrid.
function valorComparable(valor, tipus) {
  if (valor == null || valor === '') return null;
  if (tipus === 'date') {
    if (valor instanceof Date) return valor.getTime();
    const t = new Date(valor).getTime();
    return isNaN(t) ? null : t;
  }
  if (tipus === 'number') {
    const n = Number(valor);
    return isNaN(n) ? null : n;
  }
  return valor;
}

// Compara dos valors ja normalitzats. Els nuls van al principi (com PrimeVue).
function compara(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'string' && typeof b === 'string') return collator.compare(a, b);
  return a < b ? -1 : a > b ? 1 : 0;
}

// Ordena una llista d'objectes i en retorna una de NOVA (no muta l'original).
// És l'única funció d'ordenació: qui la crida s'encarrega, si cal, de recol·locar
// el selectedIndex (normalment retrobant la fila seleccionada per la seva clau).
// opts:
//  - field:     camp a ordenar (admet notació de punt, p. ex. 'id.codi')
//  - order:     1 ascendent / -1 descendent
//  - tipus:     'string' (per defecte) | 'number' | 'date'
//  - sortValue: (row) => valor  → accessor propi per a casos especials
//               (p. ex. dates en format no ISO)
function ordenarLlista(llista, { field, order, tipus, sortValue } = {}) {
  const items = [...(llista || [])];
  if ((!field && !sortValue) || !order) return items;
  const valor = sortValue
    ? (row) => sortValue(row)
    : (row) => valorComparable(resolveField(row, field), tipus);
  return items.sort((a, b) => compara(valor(a), valor(b)) * order);
}

export { avPag, arrowDown, home, rePag, arrowUp, end, scrollCenter, controlDataTable, showMenu, nextIndex,
  resolveField, ordenarLlista }
