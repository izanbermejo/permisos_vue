import { apiComercial } from "@/services/index.js";
import moment from "moment";

class InventariService {

  obtenirStocks(artint, clicod) {
    return apiComercial.get(`/inventari/stocks/${artint}/${clicod}`);
  }

  obtenirHistoric(artint, clicod, dataInici, dataFi, empresa = null, magatzem = null, filtresMoviment = []) {
    return apiComercial.get(`/inventari/historic/${artint}/${clicod}`, {
      params: {
        dataInici: moment(dataInici).format('YYYY-MM-DD'),
        dataFi:    moment(dataFi).format('YYYY-MM-DD'),
        ...(empresa  ? { empresa }  : {}),
        ...(magatzem ? { magatzem } : {}),
        ...(filtresMoviment && filtresMoviment.length > 0 ? { filtresMoviment: filtresMoviment.join(',') } : {}),
      }
    });
  }

  facturesLiniesMoviment(albara, empresa, clicod, artint) {
    return apiComercial.get('/ads/facturesliniesmoviment', { params: { albara, empresa, clicod, artint } });
  }

  obtenirMoviments(artint, clicod, empresa, magatzem, dataInici, dataFi, filtresMoviment = []) {
    return apiComercial.get('/inventari', {
      params: {
        artint, clicod, empresa, magatzem,
        dataInici: moment(dataInici).format('YYYY-MM-DD'),
        dataFi:    moment(dataFi).format('YYYY-MM-DD'),
        ...(filtresMoviment && filtresMoviment.length > 0 ? { filtresMoviment: filtresMoviment.join(',') } : {}),
      }
    });
  }

  afegirFerralla(artint, clicod, empresa, magatzem, data, quantitat, observacions) {
    return apiComercial.post('/inventari/ferralla', {
      artint, clicod, empresa, magatzem,
      data: moment(data).format('YYYY-MM-DD'),
      quantitat,
      observacions,
    });
  }

  modificarFerralla(id, data, quantitat, observacions) {
    return apiComercial.put(`/inventari/ferralla/${id}`, {
      data: moment(data).format('YYYY-MM-DD'),
      quantitat,
      observacions,
    });
  }

  eliminarFerralla(id) {
    return apiComercial.delete(`/inventari/ferralla/${id}`);
  }

  afegirRegularitzacio(artint, clicod, empresa, magatzem, data, quantitat, observacions) {
    return apiComercial.post('/inventari/regularitzacio', {
      artint, clicod, empresa, magatzem,
      data: moment(data).format('YYYY-MM-DD'),
      quantitat,
      observacions,
    });
  }

  modificarRegularitzacio(id, data, quantitat, observacions) {
    return apiComercial.put(`/inventari/regularitzacio/${id}`, {
      data: moment(data).format('YYYY-MM-DD'),
      quantitat,
      observacions,
    });
  }

  eliminarRegularitzacio(id) {
    return apiComercial.delete(`/inventari/regularitzacio/${id}`);
  }

}

export default new InventariService();
