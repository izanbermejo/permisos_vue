import { apiComercial } from '@/services/index.js';
import { CanceledError } from 'axios';
import i18n from '@/i18n/i18n';

class TarifesService {

  async abortingCall(call) {
    try {
      return await call();
    } catch (e) {
        if (e instanceof CanceledError)
          return Promise.resolve([]);
    }
  }


  llistatTarifes(nom,divisa,any,estat) {
    let urlParams = new URLSearchParams();
    urlParams.append('nom', nom);
    urlParams.append('divisa', divisa);
    urlParams.append('any', any);
    urlParams.append('estat', estat);
    return apiComercial.get(`tarifes/list`);
  }

altaTarifa(fitxer) {
  if (fitxer.size > 8388608) {
    let { t } = i18n.global;
    let responseThrow = [];
    responseThrow['response'] = [];
    responseThrow.response['data'] = [];
    responseThrow.response.data['message'] = t('ERROR.MIDA_FITXER');
    return Promise.reject(responseThrow); 
  }

  let formData = new FormData();
    formData.append('file', fitxer);
    return apiComercial.post(`/tarifes/new/`,
      formData,
      {
        errorHandle: false,
        headers: {'Content-Type': 'multipart/form-data'}
      });
}

modificacioTarifa(codi,download, request) {
  return apiComercial.postForm(`tarifes/update/${codi}?download=${download}`, JSON.stringify(request));
}

tancarTarifa(codi) {
  return apiComercial.put(`tarifes/close/${codi}`);
}

borrarTarifa(codi) {
  console.log ("borrar tarifa -->" + codi)
  return apiComercial.delete(`tarifes/delete/${codi}`);
}

descarregaTarifa(codi) {
  return apiComercial.get(`tarifes/download/${codi}`,{responseType: 'blob'});
}

  obtenirTarifesByArtint(artint, clicod) {
    return apiComercial.get(`tarifes/rangs/${artint}/${clicod}`);
  }

// pujarAdjunt(fitxer) {
//   // El fitxer no pot superar els 50MB
//   if (fitxer.size > 52428800) {
//     let { t } = i18n.global;
//     let responseThrow = [];
//     responseThrow['response'] = [];
//     responseThrow.response['data'] = [];
//     responseThrow.response.data['message'] = t('ERROR.MIDA_FITXER');
//     return Promise.reject(responseThrow); 
//   }

// }

  obtenirPermisosFuncio(){
    console.log("obtenirPermisosFuncio");
    return apiComercial.get(`tarifes/permisosFuncio`);
  }

}
export default new TarifesService();