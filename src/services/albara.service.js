import { apiComercial } from "@/services/index.js";
import i18n from "@/i18n/i18n";

// Extreu només els camps d'una Adresa (backend shared.Adresa) de l'state del modal CanviarAdresa
function toAdresa(state) {
  return {
    destinatari: state.destinatari,
    adresa: state.adresa,
    poblacio: state.poblacio,
    codiPostal: state.codiPostal,
    pais: state.pais,
  };
}

class AlbaraService {

  buscarAlbarans(urlParams) {
    return apiComercial.get("albara", {
      params: urlParams,
    });
  }

  obtenirDetallAlbara(idAlbara) {
    return apiComercial.get(`albara/${idAlbara.codi}/${idAlbara.empresa}/detall`);
  }

  obtenirUltimsAlbarans(clicod, artint, urlParams) {
    return apiComercial.get(`albara/${clicod}/${artint}/ultims`, {
      params: urlParams,
    });
  }

  calcularAlbara(request) {
    return apiComercial.post(`albara/calcular/`, JSON.stringify(request));
  }

  crearAlbara(request) {
    return apiComercial.post(`albara/`, JSON.stringify(request));
  }

  calcularAlbaraTraspas(request) {
    return apiComercial.post(`albara/traspas/calcular/`, JSON.stringify(request));
  }

  calcularAlbaraTraspasPlataforma(request) {
    return apiComercial.post(`albara/plataforma/calcular/`, JSON.stringify(request));
  }

  crearAlbaraTraspasPlataforma(request) {
    return apiComercial.post(`albara/plataforma/`, JSON.stringify(request));
  }

  crearAlbaraTraspas(request) {
    return apiComercial.post(`albara/traspas/`, JSON.stringify(request));
  }

  // --- Alta manual d'albarans de traspàs ---

  // Crea la capçalera d'un albarà de traspàs buit. Retorna l'id de l'albarà i, si n'hi ha,
  // el magatzem intermig (relleu) pel qual hi passarà físicament la mercaderia.
  crearAlbaraTraspasManual(request) {
    return apiComercial.post(`albara/traspas/manual`, JSON.stringify(request));
  }

  // Dades de la peça, preu proposat i stock al magatzem d'origen, en seleccionar l'article-client
  prepararLiniaTraspas(idAlbara, articleClient) {
    return apiComercial.get(`albara/${idAlbara.codi}/${idAlbara.empresa}/linia/traspas/preparar`, {
      params: { artint: articleClient.artint, clicod: articleClient.clicod },
    });
  }

  // Avisos (embalatge i stock negatiu) que l'usuari ha de confirmar abans d'afegir la línia
  validarLiniaTraspas(idAlbara, articleClient, quantitat) {
    return apiComercial.get(`albara/${idAlbara.codi}/${idAlbara.empresa}/linia/traspas/validar`, {
      params: { artint: articleClient.artint, clicod: articleClient.clicod, quantitat },
    });
  }

  // Marca o desmarca el traspàs com a abonable. Mou el pendent de facturar de les línies i els
  // pendents d'abonar; només es pot mentre no s'hagi començat a facturar ni abonar.
  canviarTraspasAbonable(idAlbara, isTraspasAbonable) {
    return apiComercial.put(`albara/${idAlbara.codi}/${idAlbara.empresa}/traspas-abonable`,
      JSON.stringify({ isTraspasAbonable }));
  }

  afegirLiniaTraspas(idAlbara, request) {
    return apiComercial.post(`albara/${idAlbara.codi}/${idAlbara.empresa}/linia/traspas`, JSON.stringify(request));
  }

  tancarAlbara(idAlbara) {
    return apiComercial.put(`albara/${idAlbara.codi}/${idAlbara.empresa}/tancar/`);
  }

  reobrirAlbara(idAlbara) {
    return apiComercial.put(`albara/${idAlbara.codi}/${idAlbara.empresa}/reobrir/`);
  }

  eliminarAlbara(idAlbara) {
    return apiComercial.delete(`albara/${idAlbara.codi}/${idAlbara.empresa}`);
  }

  eliminarLiniaAlbara(idLiniaAlbara) {
    const { idAlbara, linia } = idLiniaAlbara;
    return apiComercial.delete(`albara/${idAlbara.codi}/${idAlbara.empresa}/linia/${linia}`);
  }

  guardarNotaAlbara(idAlbara, request) {
    return apiComercial.put(`albara/${idAlbara.codi}/${idAlbara.empresa}/nota/`, JSON.stringify(request));
  }

  // Albarans del client (de qualsevol tipus, dins l'empresa) que ja tenen aquest número d'albarà
  // especial. Llista buida = cap coincidència. codiExclos és l'albarà que s'està editant, si n'hi ha.
  comprovarAlbaraEspecial(empresa, client, valor, codiExclos = null) {
    return apiComercial.get(`albara/albara-especial/coincidencies`, {
      params: { empresa, client, valor, codiExclos },
    });
  }

  // Canvia el número d'albarà especial (només si l'albarà està obert). Un valor buit l'esborra.
  canviarAlbaraEspecial(idAlbara, valor) {
    return apiComercial.put(`albara/${idAlbara.codi}/${idAlbara.empresa}/albara-especial`,
      JSON.stringify({ numeroAlbaraEspecial: valor || null }));
  }

  // Canvia el flag d'autofacturable. Només als albarans de client i mentre no s'hagi començat a facturar.
  canviarFacturacioAutomatica(idAlbara, isFacturacioAutomatica) {
    return apiComercial.put(`albara/${idAlbara.codi}/${idAlbara.empresa}/facturacio-automatica`,
      JSON.stringify({ isFacturacioAutomatica }));
  }

  // Rectifica manualment la quantitat pendent de facturar d'una línia. No pot superar la quantitat de la línia.
  canviarQuantitatPendentFacturar(idLiniaAlbara, quantitatPendentFacturar) {
    const { idAlbara, linia } = idLiniaAlbara;
    return apiComercial.put(`albara/${idAlbara.codi}/${idAlbara.empresa}/linia/${linia}/pendent-facturar`,
      JSON.stringify({ quantitatPendentFacturar }));
  }

  // Rectifica la data d'un albarà obert ('YYYY-MM-DD'). La data es propaga als moviments de magatzem
  // i, si l'albarà intervé en un consum de plataforma, a la traçabilitat.
  canviarDataAlbara(idAlbara, data) {
    return apiComercial.put(`albara/${idAlbara.codi}/${idAlbara.empresa}/data`, JSON.stringify({ data }));
  }

  canviarAdresaAlbara(idAlbara, request) {
    return apiComercial.put(`albara/${idAlbara.codi}/${idAlbara.empresa}/adresa`, JSON.stringify(request));
  }

  canviarAdresaBrokerAlbara(idAlbara, state) {
    return apiComercial.put(`albara/${idAlbara.codi}/${idAlbara.empresa}/adresa-broker`, JSON.stringify(toAdresa(state)));
  }

  canviarAdresaProformaAlbara(idAlbara, state) {
    return apiComercial.put(`albara/${idAlbara.codi}/${idAlbara.empresa}/adresa-proforma`, JSON.stringify(toAdresa(state)));
  }

  exportarAlbarans(clicod, artint, urlParams) {
    return apiComercial.get(`albara/${clicod}/${artint}/exportar`, {
      params: urlParams,
      responseType: 'blob'
    });
  }

  generarAlbara(codi, empresa, idioma, formatDecimal, incloureEtiquetes, isCopia) {
    return apiComercial.get(`albara/${codi}/${empresa}/justificant`, {
      params: {
        idioma,
        format_decimal: formatDecimal,
        incloure_etiquetes: incloureEtiquetes,
        is_copia: isCopia,
      },
      responseType: 'blob',
    });
  }

  generarCertificatAlbara(codi, empresa, tipus, idioma) {
    return apiComercial.get(`albara/${codi}/${empresa}/certificat/${tipus}`, {
      params: { idioma },
      responseType: 'blob',
    });
  }

  pujarAdjunt(albara, fitxer) {
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
    return apiComercial.post(`/albara/${albara}/adjunts`, formData, {
      errorHandle: false,
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  renombrarAdjunt(albara, codi, text) {
    let req = { valor: text };
    return apiComercial.put(
      `albara/${albara}/adjunts/${codi}`,
      JSON.stringify(req)
    );
  }

  eliminarAdjunt(albara, codi) {
    return apiComercial.delete(`albara/${albara}/adjunts/${codi}`);
  }

  obtenirAdjunts(albara) {
    return apiComercial.get(`albara/${albara}/adjunts`);
  }

  descarregarAdjunt(albara, codi) {
    return apiComercial.get(`albara/${albara}/adjunts/${codi}`, {
      responseType: "blob",
    });
  }

  marcarAlbaraUrgent(albara, costEnviamentExpress, isUrgent, versio) {
    let req = { costEnviamentExpress, isUrgent };
    return apiComercial.put(`albara/${albara.codi}/${albara.empresa}/urgent`, 
      JSON.stringify(req),
      {
        headers: { etag: JSON.stringify({ ALBARA: versio }) }
      });
  }

  desmarcarAlbaraUrgent(albara, versio) {
    return apiComercial.put(`albara/${albara.codi}/${albara.empresa}/nourgent`,
      {
        headers: { etag: JSON.stringify({ ALBARA: versio }) }
      }
    );
  }

  marcarLiniaUrgent(albara, idLinia, isUrgent, versio) {
    let req = { valor: isUrgent };
    return apiComercial.put(`albara/${albara.codi}/${albara.empresa}/linies/${idLinia}/urgent`, 
      JSON.stringify(req),
    {
      headers: { etag: JSON.stringify({ ALBARA: versio }) }
    });
  }

  obtenirAlbaraUrgent(idAlbara) {
    return apiComercial.get(`albara/${idAlbara.codi}/${idAlbara.empresa}/urgent`);
  }

}

export default new AlbaraService();
