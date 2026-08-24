import { apiComercial } from '@/services/index.js';
import { CanceledError } from 'axios';


class EDIService {

  async abortingCall(call) {
    try {
      return await call();
    } catch (e) {
        if (e instanceof CanceledError)
          return Promise.resolve([]);
    }
  }


  llistatComandes() {
    /*let urlParams = new URLSearchParams();
    urlParams.append('nom', nom);
    urlParams.append('divisa', divisa);
    urlParams.append('any', any);
    urlParams.append('estat', estat);*/
    return apiComercial.get(`comandes/EDI`);
  }

  llistatComandesUsuari(usuari) {
    /*let urlParams = new URLSearchParams();
    urlParams.append('nom', nom);
    urlParams.append('divisa', divisa);
    urlParams.append('any', any);
    urlParams.append('estat', estat);*/
    return apiComercial.get(`comandes/EDI/usuari/${usuari}`);
  }


  llistaLinies(codiComanda) {
    return apiComercial.get(`comandes/EDI/linies/${codiComanda}?first_article`)
  }

  llistaLiniesArticles(codiComanda,codiArticle) {
    return apiComercial.get(`comandes/EDI/linies/${codiComanda}/${codiArticle}`)
  }

  opcionsArticlesLinies (codiComanda) {
    return apiComercial.get(`comandes/EDI/linies/articles/${codiComanda}`)
  }

  opcionsUsuaris () {
    return apiComercial.get(`comandes/EDI/usuaris/`)
  }


  descarregaComanda(codi) {
    return apiComercial.get(`comandes/EDI/pdf/${codi}`,{responseType: 'blob'});
  }

  descarregaFormatPdfAmes(pathEdi) {
    let urlParams = new URLSearchParams();
    urlParams.append("pathEdi", pathEdi);
    return apiComercial.get(`comandes/EDI/pdf/generar/`, {
      params: urlParams,
      responseType: 'blob'}
    );
  }  

  borraComanda(codi) {
    return apiComercial.delete(`comandes/EDI/${codi}`);
  }

  borraLiniaComanda(codi) {
    return apiComercial.delete(`comandes/EDI/linia/${codi}`);
  }

  borraArticleComanda(codiComanda,codiArticle) {
    return apiComercial.delete(`comandes/EDI/delete/article/${codiComanda}/${codiArticle}`);
  }

  borraLiniaComandaPong(codi,comanda) {
    return apiComercial.post(`comandes/EDI/delete/linia/${codi}`,JSON.stringify(comanda));
  }

  assignaArticleClientPong(codi,comanda) {
    return apiComercial.post(`comandes/EDI/edit/article/${codi}`,JSON.stringify(comanda));
  }

  editaLiniaComanda(codi,codiLiniaProcessat,comanda,request) {
    console.log("#####codi: " + codi);
    console.log("#####codiLiniaProcessat: " + codiLiniaProcessat);
    console.log("#####comanda: " + comanda);
    let requestEdit = {
      comanda: comanda,
      dataClient: request.dataClient,
      dataAmes: request.dataAmes,
      dataMagatzem: request.dataMagatzem,
      quantitat: request.quantitat,
      tipus: request.tipus
    }

    if (codi===null)
      codi=0;

    if (codiLiniaProcessat===null)
      codiLiniaProcessat=0;

    console.log("#####requestEdit(Comanda): " + requestEdit.comanda);
    console.log("#####requestEdit(Quantitat): " + requestEdit.quantitat);
    return apiComercial.post(`comandes/EDI/edit/linia/${codi}/${codiLiniaProcessat}/`,JSON.stringify(requestEdit));
  }

  canviaUltimAlbara(codiComanda,codiArticle,ultimAlbaraRebut) {
    console.log("#####codiComanda: " + codiComanda);
    console.log("#####codiArticle: " + codiArticle);
    // const data ={ultimAlbaraRebut};

    return apiComercial.post(`comandes/EDI/albarans/${codiComanda}/${codiArticle}`,ultimAlbaraRebut, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }

  llistaUltimsAlbarans(codiArticle,codiClient,ultimAlbaraRebut,tipusClient) {
    console.log("llistaUltimsAlbarans>tipusClient=" + tipusClient);
    
    return apiComercial.get(`comandes/EDI/albarans/${codiArticle}/${codiClient}?ultimalbararebut=${ultimAlbaraRebut}&tipusClient=${tipusClient}`)
  }

  processaLiniesArticleComanda(codiComanda,codiArticle,comanda) {
    // return apiComercial.post(`comandes/EDI/process/${codiComanda}/${codiArticle}`,JSON.stringify(comanda));
    console.log("~~~~~~~~~~~comanda: " + comanda);
    
    return apiComercial.post(`comandes/EDI/process/${codiComanda}/${codiArticle}`,JSON.stringify(comanda));
  }

  obteComandaJSON(codiComanda) {
    // return apiComercial.post(`comandes/EDI/process/${codiComanda}/${codiArticle}`,JSON.stringify(comanda));
    console.log("~~~~~~~~~~~comanda: " + codiComanda);

    return apiComercial.get(`comandes/EDI/json/${codiComanda}`);
  }

  llistatMissatgesEDIPerArticleClient(cliCod, artInt, dataInici, dataFi) {
    let urlParams = new URLSearchParams();
    urlParams.append('dataInici', dataInici);
    urlParams.append('dataFi', dataFi);
    return apiComercial.get(`comandes/EDI/missatgesPerArticleClient/${cliCod}/${artInt}`, { params: urlParams });
  }

  //==================================================================================//

  buscarArxius(urlParams) {
    return apiComercial.get(`edi/buscarArxius`, {
      params: urlParams,
    });
  }

  obtenirComandesEdi(urlParams) {
    return apiComercial.get(`edi/comandes`, {
      params: urlParams,
    });
  }

  obtenirComandesEdiByClient(codiClient) {
    return apiComercial.get(`edi/comandes/client/${codiClient}`);
  }

  obtenirComandesEdiByArticleClient(articleClient) {
    return apiComercial.get(`edi/comandes/articleclient/${articleClient}`);
  }

  obtenirComandesEdiByMissatge(codiMissatge) {
    return apiComercial.get(`edi/comandes/missatge/${codiMissatge}`);
  }

  obtenirContingutTXT(idMissatge) {
    return apiComercial.get(`edi/comandes/txt/${idMissatge}`);
  }

  descarregaPDF(idMissatge, urlParams) {
    return apiComercial.get(`edi/comandes/pdf/${idMissatge}`, { 
      params: urlParams,
      responseType: 'blob'
    });
  }

  pujarPDF(idMissatge, file) {
    const formData = new FormData();
    formData.append('file', file);
    return apiComercial.post(`edi/comandes/pdf/${idMissatge}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  obtenirConfiguracionsEntrades(urlParams) {
    return apiComercial.get(`edi/entrada/configuracions`, {
      params: urlParams,
    });
  }

  carregaConfiguracionsEntrades(urlParams) {
    return apiComercial.get(`edi/entrada/configuracio`, {
      params: urlParams,
    });
  }

  guardaConfiguracionsEntrades(req) {
    return apiComercial.put(`edi/entrada/configuracio`, JSON.stringify(req));
  }

  exportarConfiguracionsEntrades() {
    return apiComercial.get(`edi/configuracions/exportar`, {
      responseType: 'blob'
    });
  }

  exportarConfiguracionsAviExp(){
        return apiComercial.get(`edi/configuracions/exportar/aviexp`, {
      responseType: 'blob'
    });
  }

  reprocessarComandaEdi(idMissatge, idComanda) {
    return apiComercial.post(`edi/comandes/reprocessar/${idMissatge}/${idComanda}`);
  }

  canviArticleClient(request) {
    return apiComercial.post(`edi/comandes/assignar`, JSON.stringify(request));
  }

  obtenirComandaPerProcessar(idMissatge, idComanda, ultimAlbaraReferencia) {
    return apiComercial.get('edi/comandes/processar', {
      params: { idMissatge, idComanda, ultimAlbaraReferencia }
    });
  }

  ObtenirArtCliPerMissatge(codiMissatge){
    return apiComercial.get(`edi/comandes/capsalera/artcli/${codiMissatge}`);
  }

  ObtenirCapsaleraEDI(articleClient){
    return apiComercial.get('edi/comandes/processar/capsalera/', {
      params: { articleClient }
    });
  }

  processarComandaEdi(request){
    return apiComercial.post(`edi/comandes/processar`, JSON.stringify(request));
  }

  actualitzarComentarisInterns(idMissatge, idLinia, idComanda, text) {
    const req = { valor: text };

    return apiComercial.put(`edi/${idMissatge}/${idComanda}/comentarisinterns`, JSON.stringify(req) , {
      params: {
          idLinia,
      },
    });
  }

  actualitzarComentarisClient(idMissatge, idLinia, idComanda, text) {
    const req = { valor: text };

    return apiComercial.put(`edi/${idMissatge}/${idComanda}/comentarisclient`,JSON.stringify(req) , {
      params: {
          idLinia,
      },
    });
  }
  

  carregaEmbalatgeExpedicio(artInt, cliCod){
    return apiComercial.get(`edi/embalatge/${artInt}/${cliCod}`);
  }

  guardarEmbalatgeExpedicio(artInt, cliCod, request){
    return apiComercial.put(`edi/embalatge/${artInt}/${cliCod}`, JSON.stringify(request));
  }

  esborrarLiniaEDI(idMissatge, idComanda){
    return apiComercial.post(`edi/comandes/eliminar/${idMissatge}/${idComanda}`);
  }

  obtenirConfiguracionsAviExp(urlParams) {
    return apiComercial.get(`edi/sortida/configuracio`, {
      params: urlParams,
    });
  }

  carregaConfiguracioAviExp(urlParams) {
    return apiComercial.get(`edi/carrega/configuracio`, {
      params: urlParams,
    });
  }

  guardaConfiguracioAviExp(req) {
    return apiComercial.put(`edi/guarda/configuracio`, JSON.stringify(req));
  }

  carregaConfiguracioEDI(codiClient){
    return apiComercial.get(`edi/configuracio/${codiClient}`);
  }

  descarregaFormatPdfAmesEdi2(idMissatge) {
    return apiComercial.get(`edi/comandes/pdf/generar/${idMissatge}`, {
      responseType: 'blob'
    });
  }

}
export default new EDIService();