import i18n from "@/i18n/i18n";
import { apiComercial } from "@/services/index.js";

class ClientsService {
  
  obtenirAdjuntsClient(codiClient, urlParams) {
    return apiComercial.get(`client/${codiClient}/adjunts`, {
      params: urlParams,
    });
  }

  pujarAdjunt(codiClient, categoria, fitxer) {
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
    return apiComercial.post(`/client/${codiClient}/adjunts/${categoria}`, formData, {
      errorHandle: false,
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  descarregarAdjunt(codiClient, codi) {
    return apiComercial.get(`client/${codiClient}/adjunts/${codi}`, {
      responseType: "blob",
    });
  }

  renombrarAdjunt(codiClient, codi, text) {
    let req = { valor: text };
    return apiComercial.put(
      `client/${codiClient}/adjunts/${codi}`,
      JSON.stringify(req)
    );
  }

  eliminarAdjunt(codiClient, codi) {
    return apiComercial.delete(`client/${codiClient}/adjunts/${codi}`);
  }
}

export default new ClientsService();
