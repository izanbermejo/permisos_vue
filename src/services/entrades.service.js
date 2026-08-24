import { apiComercial } from "@/services/index.js";

class EntradesService {

  buscarMissatges(urlParams) {
    return apiComercial.get("entrada", {
      params: urlParams,
    });
  } 

  carregaContingutMissatge(id) {
    return apiComercial.get(`entrada/${id}/contingut`, {
      responseType: 'text'
    });
  }

  mostrarEntradesComercial(urlParams) {
    return apiComercial.get("entrada/comercial", {
      params: urlParams,
    });
  } 

  mostrarEntradaComercialById(idEntradaFabrica) {
    return apiComercial.get(`entrada/comercial/${idEntradaFabrica}`);
  }
  
  buscarEntradesMagatzem(urlParams) {
    return apiComercial.get(`entrada/magatzem`, {
      params: urlParams,
    });
  }

  mostrarEntradaMagatzemById(idEntradaMagatzem) {
    return apiComercial.get(`entrada/magatzem/${idEntradaMagatzem}`);
  }

  obtenirDetallEntradaMagatzemById(idEntradaMagatzem) {
    return apiComercial.get(`entrada/magatzem/detall/${idEntradaMagatzem}`);
  }

  reprocessarEntradaComercial(id) {
    return apiComercial.put(`entrada/comercial/reprocessarEntrada/${id}`)
  }

  canviArticleClient(id, request) {
    return apiComercial.put(`entrada/comercial/canviArticleClient/${id}`, JSON.stringify(request))
  }

  canviOf(id, request) {
    return apiComercial.put(`entrada/comercial/canviOf/${id}`, JSON.stringify(request))
  }

  exportarDadesComercial(urlParams) {
    return apiComercial.get("entrada/comercial/exportarDades", {
      params: urlParams,
      responseType: 'blob',
    });
  } 

  obtenirEmailsEnviament() {
    return apiComercial.get("entrada/emailsEnviament");
  }

  guardarEmailsEnviament(request) {
    return apiComercial.put("entrada/emailsEnviament", JSON.stringify(request));
  }
}

export default new EntradesService();
