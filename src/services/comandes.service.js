import { apiComercial } from "@/services/index.js";
import { CanceledError } from "axios";
import moment from "moment";
import i18n from "@/i18n/i18n";

class ComandesService {
  async abortingCall(call) {
    try {
      return await call();
    } catch (e) {
      if (e instanceof CanceledError) return Promise.resolve([]);
    }
  }

  liniesComanda(
    articleClient,
    dataInicial,
    dataFinal,
    ocultarServides,
    mostrarOrdreAscendent
  ) {
    let urlParams = new URLSearchParams();
    urlParams.append("articleClient", articleClient);
    urlParams.append("dataInicial", moment(dataInicial).format("YYYY-MM-DD"));
    urlParams.append("dataFinal", moment(dataFinal).format("YYYY-MM-DD"));
    urlParams.append("ocultarServides", ocultarServides);
    urlParams.append("mostrarOrdreAscendent", mostrarOrdreAscendent);
    return apiComercial.get("comanda/linia", {
      params: urlParams,
    });
  }

  liniesComandaAnulades(articleClient, comanda, dataInicial, dataFinal) {
    let urlParams = new URLSearchParams();
    urlParams.append("articleClient", articleClient);
    urlParams.append("comanda", comanda);
    urlParams.append("dataInicial", moment(dataInicial).format("YYYY-MM-DD"));
    urlParams.append("dataFinal", moment(dataFinal).format("YYYY-MM-DD"));
    return apiComercial.get("comanda/linia/anulades", {
      params: urlParams,
    });
  }

  crearComanda(request) {
    return apiComercial.post(`comanda/`, JSON.stringify(request));
  }

  crearStockSeguretat(request) {
    return apiComercial.post(`comanda/${request.articleClient}/stockseguretat`, JSON.stringify(request));
  }

  obtenirStockSeguretat(articleClient) {
    return apiComercial.get(`comanda/${articleClient}/stockseguretat`);
  }

  obtenirComandaEspecial(comanda) {
    return apiComercial.get(`comanda/${comanda}`);
  }

  obtenirComandaEspecialPercomandaClient(client, comandaClient) {
    let urlParams = new URLSearchParams();
    urlParams.append("client", client);
    urlParams.append("comanda", comandaClient);
    return apiComercial.get("comanda/perComandaClient", {
      params: urlParams,
    });
  }

  traspassarComanda(comanda, request) {
    return apiComercial.post(`comanda/${comanda}/traspas`, JSON.stringify(request));
  }

  kanbanitzarLiniaComanda(comanda, linia, request, versio) {
    return apiComercial.put(
      `comanda/${comanda}/linia/${linia}/kanban`,
      JSON.stringify(request),
      {
        headers: { etag: JSON.stringify({ LINIA_COMANDA: versio }) },
      }
    );
  }

  canviarFermOrientatiuLinia(comanda, linia, versio) {
    return apiComercial.put(`comanda/${comanda}/linia/${linia}/fermorientatiu`, {
      headers: { etag: JSON.stringify({ LINIA_COMANDA: versio }) },
    });
  }

  anularLiniaComanda(comanda, linia, versio) {
    return apiComercial.delete(`comanda/${comanda}/linia/${linia}`, {
      headers: { etag: JSON.stringify({ LINIA_COMANDA: versio }) },
    });
  }

  crearLiniaComanda(comanda, request) {
    return apiComercial.post(`comanda/${comanda}/linia`, JSON.stringify(request));
  }

  modificarLiniaComanda(comanda, linia, request, versio) {
    return apiComercial.put(
      `comanda/${comanda}/linia/${linia}`,
      JSON.stringify(request),
      {
        headers: { etag: JSON.stringify({ LINIA_COMANDA: versio }) },
      }
    );
  }

  obtenirHistoricLinia(comanda, linia) {
    return apiComercial.get(`comanda/${comanda}/linia/${linia}`);
  }

  albaransFacturesLiniaComanda(comanda, linia) {
    let urlParams = new URLSearchParams();
    urlParams.append("comanda", comanda);
    urlParams.append("linia", linia);
    return apiComercial.get("ads/albaransfactures", {
      params: urlParams,
    });
  }

  obtenirArticleClientPerNorm(client, artint, clicod) {
    return apiComercial.get(`ads/articleclientnorm/${client}/${artint}/${clicod}`);
  }

  obtenirArticleClient(artintOrArticleClient, clicod) {
    if (clicod !== undefined) {
      // Si clicod es definido, entonces es el primer caso (dos parámetros)
      return apiComercial.get(
        `ads/articleclient/${artintOrArticleClient}/${clicod}`
      );
    } else {
      // Si clicod no está definido, es el segundo caso (un solo parámetro)
      return apiComercial.get(`ads/articleclient/${artintOrArticleClient}`);
    }
  }

  queryReserves(artint, empresa) {
    let urlParams = new URLSearchParams();
    urlParams.append("empresa", empresa);
    return apiComercial.get(`comanda/reserva/${artint}`, {
      params: urlParams,
    });
  }

  solicitarReserva(comanda, linia) {
    return apiComercial.put(`comanda/${comanda}/linia/${linia}/reserva/solicitar`);
  }

  recalcularReserves(artint, empresa) {
    let urlParams = new URLSearchParams();
    urlParams.append("empresa", empresa);
    return apiComercial.get(`comanda/reserva/${artint}/recalcula`, {
      params: urlParams,
    });
  }

  obtenirClient(client, handleError = true) {
    return apiComercial.get(`ads/client/${client}`, {
      errorHandle: handleError
    });
  }

  obtenirTarifesActual(client) {
    return apiComercial.get(`comanda/tarifaactual/${client}`);
  }

  buscarComandes(urlParams) {
    return apiComercial.get("comanda", {
      params: urlParams,
    });
  }

  queryClients(valor, responsables, mostrarInactius, colOrder, orderAsc, abortController) {
    let urlParams = new URLSearchParams();
    urlParams.append("filtre", valor);
    urlParams.append("responsables", responsables);
    urlParams.append("inactius", mostrarInactius);
    urlParams.append("colOrder", colOrder);
    urlParams.append("orderAsc", orderAsc);
    return this.abortingCall(() =>
      apiComercial.get("ads/client", {
        params: urlParams,
        signal: abortController?.signal,
      })
    );
  }

  queryNormalitzats(empresa, valor, tipus, abortController) {
    let urlParams = new URLSearchParams();
    urlParams.append("empresa", empresa);
    urlParams.append("filtre", valor);
    urlParams.append("tipus", tipus);
    return this.abortingCall(() =>
      apiComercial.get("ajuda/articlesnormalitzats", {
        params: urlParams,
        signal: abortController?.signal,
      })
    );
  }

  queryArticles(client, tipus, valor, abortController) {
    let urlParams = new URLSearchParams();
    urlParams.append("client", client);
    urlParams.append("filtre", valor);
    urlParams.append("tipus", tipus);
    return this.abortingCall(() =>
      apiComercial.get("ajuda/articles", {
        params: urlParams,
        signal: abortController?.signal,
      })
    );
  }

  obtenirComandesEspecials(
    client,
    dataInici,
    dataFi,
    comanda,
    includeServides
  ) {
    let urlParams = new URLSearchParams();
    urlParams.append("dataInici", moment(dataInici).format("YYYY-MM-DD"));
    urlParams.append("dataFi", moment(dataFi).format("YYYY-MM-DD"));
    urlParams.append("comanda", comanda);
    urlParams.append("includeServides", includeServides);
    return apiComercial.get(`comanda/programa/${client}`, {
      params: urlParams,
    });
  }

  obtenirComandesNormalitzat(client) {
    return apiComercial.get(`comanda/normalitzat/client/${client}`);
  }

  obtenirComandesNormalitzatServides(client, dataInici, dataFi, comanda) {
    let urlParams = new URLSearchParams();
    urlParams.append("client", client);
    urlParams.append("dataInici", moment(dataInici).format("YYYY-MM-DD"));
    urlParams.append("dataFi", moment(dataFi).format("YYYY-MM-DD"));
    urlParams.append("comanda", comanda);
    return apiComercial.get(`comanda/normalitzat/client/${client}/servides`, {
      params: urlParams,
    });
  }

  obtenirComandaNormalitzat(idComanda) {
    return apiComercial.get(`comanda/normalitzat/${idComanda}`);
  }

  obtenirComandaNormalitzatPerComandaClient(client, comandaClient, empresa) {
    let urlParams = new URLSearchParams();
    urlParams.append("client", client);
    urlParams.append("comanda", comandaClient);
    urlParams.append("empresa", empresa);
    return apiComercial.get("comanda/normalitzat/perComandaClient", {
      params: urlParams,
    });
  }

  afegirLiniaComandaNormalitzat(idComanda, linia) {
    return apiComercial.post(
      `comanda/normalitzat/${idComanda}/linia`,
      JSON.stringify(linia)
    );
  }

  canviarNomComandaNormalitzat(idComanda, nomNou) {
    apiComercial.put(
      `comanda/normalitzat/${idComanda}/nom`,
      nomNou,
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    );
  }

  modificarLiniaComandaNormalitzat(idComanda, linia, req, versio) {
    return apiComercial.put(
      `comanda/normalitzat/${idComanda}/linia/${linia}`,
      JSON.stringify(req),
      {
        headers: {
          etag: JSON.stringify({
            LINIA_COMANDA: `${idComanda}#${linia}#${versio}`,
          }),
        },
      }
    );
  }

  eliminarLiniaComandaNormalitzat(idComanda, linia) {
    return apiComercial.delete(`comanda/normalitzat/${idComanda}/linia/${linia}`);
  }

  calculadoraNormalitzats(request) {
    return apiComercial.get("comanda/calculadora", {
      headers: {
        params: JSON.stringify(request),
      },
    });
  }

  calculadoraTarifes(request) {
    return apiComercial.get("comanda/calculadora/tarifa", {
      headers: {
        params: JSON.stringify(request),
      },
    });
  }

  calcularCostTransport(request) {
    return apiComercial.get("comanda/calculadora/transport", {
      headers: {
        params: JSON.stringify(request),
      },
    });
  }

  calculadoraNormalitzatsFitxer(request, fitxer) {
    let formData = new FormData();
    formData.append("file", fitxer);
    return apiComercial.post("comanda/calculadora/fitxer", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        params: JSON.stringify(request),
      },
    });
  }

  canviarAdresaComanda(idComanda, request, versio) {
    return apiComercial.put(
      `comanda/${idComanda}/adresa`,
      JSON.stringify(request),
      {
        headers: {
          etag: JSON.stringify({ COMANDA: `${idComanda}#${versio}` }),
        },
      }
    );
  }

  crearComandaNormalitzat(request) {
    return apiComercial.post(`comanda/normalitzat`, JSON.stringify(request));
  }

  cancelarComandaNormalitzat(numComanda) {
    return apiComercial.delete(`comanda/normalitzat/${numComanda}/`);
  }

  fixarPreuLiniaNormalitzat(idComanda, linia, req, versio) {
    return apiComercial.put(
      `comanda/normalitzat/${idComanda}/linia/${linia}/fixar`,
      JSON.stringify(req),
      {
        headers: {
          etag: JSON.stringify({
            LINIA_COMANDA: `${idComanda}#${linia}#${versio}`,
          }),
        },
      }
    );
  }

  desfixarPreuLiniaNormalitzat(idComanda, linia, versio) {
    return apiComercial.put(
      `comanda/normalitzat/${idComanda}/linia/${linia}/desfixar`,
      {
        headers: {
          etag: JSON.stringify({
            LINIA_COMANDA: `${idComanda}#${linia}#${versio}`,
          }),
        },
      }
    );
  }

  generarJustificantNormalitzat(
    idComanda,
    idioma,
    formatNumeric,
    isDistribuidor
  ) {
    let urlParams = new URLSearchParams();
    urlParams.append("idioma", idioma);
    urlParams.append("format_decimal", formatNumeric);
    urlParams.append("is_distribuidor", isDistribuidor);
    return apiComercial.get(`comanda/normalitzat/${idComanda}/justificant/`, {
      params: urlParams,
      responseType: "blob",
    });
  }

  obtenirJustificantEnviat(idComanda) {
    return apiComercial.get(`comanda/normalitzat/${idComanda}/justificant/enviat`, {
      responseType: "blob",
    });
  }

  enviarJustificantNormalitzat(idComanda, request, fitxers) {
    let formData = new FormData();

    //Afegir el request al formData, ja que per al header de multipart/form-data no es poden envar caracters especials
    //Així que el convertim a string i el passem com un camp del formData juntament amb els fitxers
    formData.append("request", JSON.stringify(request));

    for (let i = 0; i < fitxers.length; i++) {
      formData.append("files", fitxers[i]);
    }

    return apiComercial.post(
      `comanda/normalitzat/${idComanda}/justificant/enviar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  generarJustificantEspecial(
    idComanda,
    idioma,
    formatNumeric,
    tipus
  ) {
    let urlParams = new URLSearchParams();
    urlParams.append("idComanda", idComanda);
    urlParams.append("idioma", idioma);
    urlParams.append("format_decimal", formatNumeric);
    if (tipus) urlParams.append("tipus", tipus);
    return apiComercial.get(`comanda/especials/${idComanda}/justificant/`, {
      params: urlParams,
      responseType: "blob",
    });
  }

  enviarJustificantEspecial(idComanda, request, fitxers) {
    let formData = new FormData();

    //Afegir el request al formData, ja que per al header de multipart/form-data no es poden envar caracters especials
    //Així que el convertim a string i el passem com un camp del formData juntament amb els fitxers
    formData.append("request", JSON.stringify(request));

    for (let i = 0; i < fitxers.length; i++) {
      formData.append("files", fitxers[i]);
    }

    return apiComercial.post(
      `comanda/especials/${idComanda}/justificant/enviar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  articlesClient(valor, responsables, mostrarInactius, colOrder, orderAsc, abortController) {
    let urlParams = new URLSearchParams();
    urlParams.append("filtre", valor);
    urlParams.append("responsables", responsables);
    urlParams.append("inactius", mostrarInactius);
    urlParams.append("colOrder", colOrder);
    urlParams.append("orderAsc", orderAsc);
    return this.abortingCall(() =>
      apiComercial.get(`ajuda/articleclient`, {
        params: urlParams,
        signal: abortController?.signal,
      })
    );
  }

  articlesClientByArticle(
    artint,
    valor,
    mostrarInactius,
    colOrder,
    orderAsc,
    abortController
  ) {
    let urlParams = new URLSearchParams();
    urlParams.append("filtre", valor);
    urlParams.append("inactius", mostrarInactius);
    urlParams.append("colOrder", colOrder);
    urlParams.append("orderAsc", orderAsc);
    return this.abortingCall(() =>
      apiComercial.get(`ajuda/articleclientperarticle/${artint}`, {
        params: urlParams,
        signal: abortController?.signal,
      })
    );
  }

  articlesClientByClient(
    client,
    valor,
    mostrarInactius,
    colOrder,
    orderAsc,
    abortController
  ) {
    let urlParams = new URLSearchParams();
    urlParams.append("filtre", valor);
    urlParams.append("inactius", mostrarInactius);
    urlParams.append("colOrder", colOrder);
    urlParams.append("orderAsc", orderAsc);
    return this.abortingCall(() =>
      apiComercial.get(`ajuda/client/${client}/articleclient`, {
        params: urlParams,
        signal: abortController?.signal,
      })
    );
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

  actualitzarComentarisComanda(comanda, text) {
    let req = { valor: text };
    return apiComercial.put(`comanda/${comanda}/comentaris`, JSON.stringify(req));
  }

  zonesTransport(codiTransportista, codiPais) {
    let urlParams = new URLSearchParams();
    urlParams.append("codiTransportista", codiTransportista);
    urlParams.append("codiPais", codiPais);
    return apiComercial.get(`ads/zonestransport/`, {
      params: urlParams,
    });
  }

  actualitzarNotesClient(clicod, text) {
    let req = { valor: text };
    return apiComercial.put(
      `ads/client/${clicod}/notesclient`,
      JSON.stringify(req)
    );
  }

  actualitzarNotesLogistica(clicod, text) {
    let req = { valor: text };
    return apiComercial.put(
      `ads/client/${clicod}/noteslogistica`,
      JSON.stringify(req)
    );
  }

  actualitzarNotesMorositat(clicod, text) {
    let req = { valor: text };
    return apiComercial.put(
      `ads/client/${clicod}/notesmorositat`,
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

  metadata() {
    return apiComercial.get(`metadata`);
  }

  pujarAdjunt(comanda, fitxer) {
    // El fitxer no pot superar els 8MB
    if (fitxer.size > 8388608) {
      let { t } = i18n.global;
      let responseTrhow = [];
      responseTrhow["response"] = [];
      responseTrhow.response["data"] = [];
      responseTrhow.response.data["message"] = t("ERROR.MIDA_FITXER");
      return Promise.reject(responseTrhow);
    }

    let formData = new FormData();
    formData.append("file", fitxer);
    return apiComercial.post(`/comanda/${comanda}/adjunts`, formData, {
      errorHandle: false,
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  renombrarAdjunt(comanda, codi, text) {
    let req = { valor: text };
    return apiComercial.put(
      `comanda/${comanda}/adjunts/${codi}`,
      JSON.stringify(req)
    );
  }

  eliminarAdjunt(comanda, codi) {
    return apiComercial.delete(`comanda/${comanda}/adjunts/${codi}`);
  }

  obtenirAdjunts(comanda) {
    return apiComercial.get(`comanda/${comanda}/adjunts`);
  }

  descarregarAdjunt(comanda, codi) {
    return apiComercial.get(`comanda/${comanda}/adjunts/${codi}`, {
      responseType: "blob",
    });
  }

  getInfoArticleClient(articleClient) {
    return apiComercial.get(`ads/articleclient/${articleClient}/altreInformacio`);
    
  }

  getInfoGeneralClient(clicod) {
    return apiComercial.get(`ads/client/${clicod}/altreInformacio`);
  }

  descarregaStockSeguretat(){
    return apiComercial.get(`/ext/comanda/stockseguretat`, {
      responseType: "blob",
    });
  }

  carregaStockSeguretat(fitxer) {
     if (fitxer.size > 52428800) {
      let { t } = i18n.global;
      let responseTrhow = [];
      responseTrhow['response'] = [];
      responseTrhow.response['data'] = [];
      responseTrhow.response.data['message'] = t('ERROR.MIDA_FITXER');
      return Promise.reject(responseTrhow);
    }

    let formData = new FormData();
    formData.append('file', fitxer);
    return apiComercial.post(`/ext/comanda/stockseguretat`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  }

  actualitzarComentariInternClient(clicod, text) {
    let req = { valor: text };
    return apiComercial.put(`ads/client/${clicod}/comentariintern`,JSON.stringify(req));
  }

  actualitzarComentariInternArticle(clicod, artint, text) {
    let req = { valor: text };
    return apiComercial.put(`ads/client/${clicod}/articleclient/${artint}/comentariintern`,JSON.stringify(req));
  }

  exportarDetallComanda(comanda, urlParams) {
    return apiComercial.get(`comanda/especials/${comanda}/exportarDetall`, {
      params: urlParams,
      responseType: "blob",
    });
  }

  exportarDetallComandesClient(client, urlParams) {
    return apiComercial.get(`comanda/especials/${client}/exportarDetallsClient`, {
      params: urlParams,
      responseType: "blob",
    });
  }

  exportarDetallComandesArticle(article, urlParams) {
    return apiComercial.get(`comanda/especials/${article}/exportarDetallsArticle`, {
      params: urlParams,
      responseType: "blob",
    });
  }
 
}

export default new ComandesService();
