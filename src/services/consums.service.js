import { apiComercial } from '@/services/index.js';

class ConsumsService {

  // Llista dels magatzems plataforma
  llistarPlataformes() {
    return apiComercial.get(`albara/consum/plataformes`);
  }

  // Cerca d'albarans de consum (reutilitza el buscador d'albarans amb tipus=CONSUM)
  buscarConsums(urlParams) {
    urlParams.append('tipus', 'CONSUM');
    return apiComercial.get('albara', { params: urlParams });
  }

  // Clients (amb la seva empresa) que tenen stock a un magatzem plataforma
  obtenirClientsPlataforma(magatzem) {
    return apiComercial.get(`albara/consum/clients/${magatzem}`);
  }

  // Peces amb stock i pendent de consumir d'un magatzem plataforma
  obtenirStock(magatzem) {
    return apiComercial.get(`albara/consum/stock/${magatzem}`);
  }

  // Albarans de traspàs a plataforma amb pendent de consumir d'una peça, ordenats FIFO
  obtenirAlbaransPendent(empresa, magatzem, artint, clicod) {
    return apiComercial.get(`albara/consum/pendent/${empresa}/${magatzem}/${artint}/${clicod}`);
  }

  // Albarans de traspàs dels quals s'ha consumit una línia d'albarà de consum (segments FIFO)
  obtenirTraspassosConsumits(empresa, codi, linia) {
    return apiComercial.get(`albara/consum/${empresa}/${codi}/${linia}/traspassos`);
  }

  // Crea la capçalera d'un albarà de consum buida (client, data i albarà especial) i en retorna l'id
  crearCapsaleraConsum(request) {
    return apiComercial.post(`albara/consum/capsalera`, JSON.stringify(request));
  }

  // Afegeix una línia de consum a un albarà de consum existent i obert
  afegirLiniaConsum(empresa, codi, peca) {
    return apiComercial.post(`albara/consum/${empresa}/${codi}/linia`, JSON.stringify(peca));
  }

}

export default new ConsumsService();
