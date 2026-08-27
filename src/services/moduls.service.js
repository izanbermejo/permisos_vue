import { apiComercial } from '@/services/index.js';

class ModulsService {
  obtenirModulsByAplicacio(nomAplicacions){
    return apiComercial.get(`moduls/aplicacions?${nomAplicacions}`);
  }

  obtenirModul(nomAplicacio, nomModul){
    return apiComercial.get(`moduls/${nomAplicacio}/${nomModul}`);
  }

  eliminarModul(nomAplicacio, nomModul){
    return apiComercial.delete(`moduls/delete/${nomAplicacio}/${nomModul}`);
  }

  crearModul(modul){
    return apiComercial.post(`moduls`, modul);
  }

  modificarModul(nomAplicacio, nomModul, modul){
    return apiComercial.put(`moduls/${nomAplicacio}/${nomModul}`, modul);
  }

}
export default new ModulsService();