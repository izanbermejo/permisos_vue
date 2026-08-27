import { apiComercial } from '@/services/index.js';

class AplicacionsService {

  obtenirAplicacions(){
    return apiComercial.get(`aplicacions`);
  }
  
  obtenirAplicacio(nomAplicacio){
    return apiComercial.get(`aplicacions/${nomAplicacio}`);
  }

  eliminarAplicacio(nomAplicacio){
    return apiComercial.delete(`aplicacions/delete/${nomAplicacio}`);
  }

  crearAplicacio(aplicacio){
    return apiComercial.post(`aplicacions`, aplicacio);
  }

  modificarAplicacio(nomAplicacio, aplicacio){
    return apiComercial.put(`aplicacions/${nomAplicacio}`, aplicacio);
  }

}
export default new AplicacionsService();