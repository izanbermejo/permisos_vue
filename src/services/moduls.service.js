import { apiPermisos } from '@/services/index.js';

class ModulsService {
  obtenirModulsByAplicacio(nomAplicacions){
    return apiPermisos.get(`moduls/aplicacions?${nomAplicacions}`);
  }

  obtenirModul(nomAplicacio, nomModul){
    return apiPermisos.get(`moduls/${nomAplicacio}/${nomModul}`);
  }

  eliminarModul(nomAplicacio, nomModul, confirmar = false){
    return apiPermisos.delete(`moduls/delete/${nomAplicacio}/${nomModul}`, { params: { confirmar } });
  }

  crearModul(modul){
    return apiPermisos.post(`moduls`, modul);
  }

  modificarModul(nomAplicacio, nomModul, modul){
    return apiPermisos.put(`moduls/${nomAplicacio}/${nomModul}`, modul);
  }

  obtenirFuncionsByModul(nomAplicacio, nomModul){
    return apiPermisos.get(`moduls/funcions/${nomAplicacio}/${nomModul}`);
  }

  assignarFuncio(nomAplicacio, nomModul, request){
    return apiPermisos.post(`moduls/funcio/${nomAplicacio}/${nomModul}`, request);
  }

  eliminarFuncioDelModul(nomAplicacio, nomModul, request){
    return apiPermisos.delete(`moduls/funcio/delete/${nomAplicacio}/${nomModul}`, { data: request });
  }

  obtenirEmpleatsByModul(nomAplicacio, nomModul){
    return apiPermisos.get(`moduls/empleats/${nomAplicacio}/${nomModul}`);
  }

  assignarEmpleat(nomAplicacio, nomModul, idEmpleat){
    return apiPermisos.post(`moduls/empleat/${nomAplicacio}/${nomModul}/${idEmpleat}`);
  }

  eliminarEmpleatDelModul(nomAplicacio, nomModul, idEmpleat){
    return apiPermisos.delete(`moduls/empleat/delete/${nomAplicacio}/${nomModul}/${idEmpleat}`);
  }

  obtenirTotsElsEmpleatsByModul(nomAplicacio, nomModul){
    return apiPermisos.get(`moduls/empleats/tots/${nomAplicacio}/${nomModul}`);
  }

}
export default new ModulsService();