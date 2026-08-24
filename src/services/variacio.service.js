import { apiComercial } from '@/services/index.js';
import moment from 'moment';

class VariacioService {

  variacio(fabriques, dataInicial, dataFinal, divisa, dataSolicitadaInici = null, dataSolicitadaFinal = null) {
    let urlParams = new URLSearchParams();
    fabriques.forEach(f => urlParams.append('fabrica',f));
    urlParams.append('dataInici', moment(dataInicial).format('YYYY-MM-DD'));
    urlParams.append('dataFins', moment(dataFinal).format('YYYY-MM-DD'));
    urlParams.append('divisa', divisa);
    // Només en cas que s'informi
    if (dataSolicitadaInici)
      urlParams.append('dataSolicitadaInici', moment(dataSolicitadaInici).format('YYYY-MM-DD'));
    // Només en cas que s'informi
    if (dataSolicitadaFinal)
      urlParams.append('dataSolicitadaFi', moment(dataSolicitadaFinal).format('YYYY-MM-DD'));
    return apiComercial.get('variacio/', {
      params: urlParams,
      responseType: 'blob',
    });
  }

}

export default new VariacioService();