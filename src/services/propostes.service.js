import { apiComercial } from '@/services/index.js';

class PropostesService {

  obtenirPropostes(urlParams) {
    return apiComercial.get('propostes', {
      params: urlParams,
    });
  }

  obtenirPropostesClient(clientCodi, empresa, urlParams) {
    return apiComercial.get(`propostes/client/${clientCodi}/${empresa}`, {
      params: urlParams,
    });
  }

  obtenirPropostesMagatzem(magatzemSortida, urlParams) {
    return apiComercial.get(`propostes/magatzem/${magatzemSortida}`, {
      params: urlParams,
    });
  }

  obtenirLiniesTraspasGrup(artint, clicod, client, empresa, magOrigen, magDesti, dataPrevistaInici, dataPrevistaFi) {
    let params = new URLSearchParams();
    params.append('artint', artint);
    params.append('clicod', clicod);
    params.append('client', client);
    params.append('empresa', empresa);
    params.append('magOrigen', magOrigen);
    params.append('magDesti', magDesti);
    if (dataPrevistaInici) params.append('dataPrevistaInici', dataPrevistaInici);
    if (dataPrevistaFi) params.append('dataPrevistaFi', dataPrevistaFi);
    return apiComercial.get('propostes/traspas/linies', { params });
  }

  recalcularImportPesLinia(request) {
    return apiComercial.post('propostes/linia/recalcul', JSON.stringify(request));
  }

  actualitzarComentarisInterns(comanda, numero, text) {
    let req = { valor: text };
    return apiComercial.put(
      `comanda/${comanda}/linia/${numero}/comentarisinterns`,
      JSON.stringify(req)
    );
  }

  actualitzarComentarisClient(comanda, numero, text) {
    let req = { valor: text };
    return apiComercial.put(
      `comanda/${comanda}/linia/${numero}/comentarisclient`,
      JSON.stringify(req)
    );
  }

  actualitzarNotesEmbalatge(articleClient, text) {
    let req = { valor: text };
    return apiComercial.put(
      `ads/articleclient/${articleClient}/notesembalatge`,
      JSON.stringify(req)
    );
  }

}

export default new PropostesService();