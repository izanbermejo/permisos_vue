import { apiOrganigrama, apiPermisos } from "@/services/index.js";

class PermisosService {

  static APLICACIO = 'COMERCIAL';

  obtenirPermisos(idEmpleat) {
    return apiOrganigrama.get(`permisos/empleat/${idEmpleat}/aplicacio/${PermisosService.APLICACIO}/permisos`);
  }


  //=========================================================================================================//

  obtenirPermisosByModul(nomModuls, nomAplicacio){
    return apiPermisos.get(`permisos/${nomAplicacio}/moduls?${nomModuls}`);
  }

  obtenirPermis(nomAplicacio, nomModul, nomPermis){
    return apiPermisos.get(`permisos/${nomAplicacio}/${nomModul}/${nomPermis}`);
  }

  crearPermis(permis){
    return apiPermisos.post(`permisos`, permis);
  }

  modificarPermis(permis){
    return apiPermisos.put(`permisos`, permis);
  }

  eliminarPermis(nomAplicacio, nomModul, nomPermis, confirmar = false){
    return apiPermisos.delete(`permisos/delete/${nomAplicacio}/${nomModul}/${nomPermis}`, { params: { confirmar } });
  }

  obtenirFuncionsByPermis(nomAplicacio, nomModul, nomPermis){
    return apiPermisos.get(`permisos/${nomAplicacio}/${nomModul}/${nomPermis}/funcions`);
  }

  eliminarFuncioDelPermis(nomAplicacio, nomModul, nomPermis, request){
    return apiPermisos.delete(`permisos/funcio/delete/${nomAplicacio}/${nomModul}/${nomPermis}`, { data: request });
  }

  assignarFuncio(nomAplicacio, nomModul, nomPermis, request){
    return apiPermisos.post(`permisos/funcio/${nomAplicacio}/${nomModul}/${nomPermis}`, request);
  }

  obtenirEmpleatsByPermis(nomAplicacio, nomModul, nomPermis){
    return apiPermisos.get(`permisos/${nomAplicacio}/${nomModul}/${nomPermis}/empleats`);
  }

  assignarEmpleat(nomAplicacio, nomModul, nomPermis, idEmpleat){
    return apiPermisos.post(`permisos/empleat/${nomAplicacio}/${nomModul}/${nomPermis}/${idEmpleat}`);
  }

  eliminarEmpleatDelPermis(nomAplicacio, nomModul, nomPermis, idEmpleat){
    return apiPermisos.delete(`permisos/empleat/delete/${nomAplicacio}/${nomModul}/${nomPermis}/${idEmpleat}`);
  }

  obtenirTotsElsEmpleatsByPermis(nomAplicacio, nomModul, nomPermis){
    return apiPermisos.get(`permisos/${nomAplicacio}/${nomModul}/${nomPermis}/empleats/tots`);
  }

}

export default new PermisosService();
