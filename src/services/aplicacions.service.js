import { apiPermisos } from '@/services/index.js';

class AplicacionsService {

  obtenirAplicacions(){
    return apiPermisos.get(`aplicacions`);
  }
  
  obtenirAplicacio(nomAplicacio){
    return apiPermisos.get(`aplicacions/${nomAplicacio}`);
  }

  eliminarAplicacio(nomAplicacio){
    return apiPermisos.delete(`aplicacions/delete/${nomAplicacio}`);
  }

  crearAplicacio(aplicacio){
    return apiPermisos.post(`aplicacions`, aplicacio);
  }

  modificarAplicacio(nomAplicacio, aplicacio){
    return apiPermisos.put(`aplicacions/${nomAplicacio}`, aplicacio);
  }

}
export default new AplicacionsService();