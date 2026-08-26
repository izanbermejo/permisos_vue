import { apiComercial } from '@/services/index.js';

class AplicacionsService {

  obtenirAplicacions(){
    return apiComercial.get(`aplicacions`);
  }
  
  obtenirAplicacio(nomAplicacio){
    console.log('obtenirAplicacio', nomAplicacio);
    return apiComercial.get(`aplicacions/${nomAplicacio}`);
  }

  eliminarAplicacio(nomAplicacio){
    return apiComercial.delete(`aplicacions/delete/${nomAplicacio}`);
  }

  guardarAplicacio(aplicacio){
    return apiComercial.post(`aplicacions`, aplicacio);
  }

  actualitzarAplicacio(nomAplicacio, aplicacio){
    return apiComercial.put(`aplicacions/${nomAplicacio}`, aplicacio);
  }

}
export default new AplicacionsService();