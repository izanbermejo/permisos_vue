import { apiPermisos } from '@/services/index.js';

class ParametresService {
  
  obtenirParametresByAplicacio(nomAplicacions){
    return apiPermisos.get(`parametres/aplicacions?${nomAplicacions}`);
  }
  
  obtenirParametre(nomAplicacio, nomParametre){
    return apiPermisos.get(`parametres/${nomAplicacio}/${nomParametre}`);
  }

  crearParametre(parametre){
    return apiPermisos.post(`parametres`, parametre);
  }

  modificarParametre(nomAplicacio, nomParametre, parametre){
    return apiPermisos.put(`parametres/${nomAplicacio}/${nomParametre}`, parametre);
  }

  eliminarParametre(nomAplicacio, nomParametre, confirmar = false){
    return apiPermisos.delete(`parametres/delete/${nomAplicacio}/${nomParametre}`, { params: { confirmar } });
  }

  obtenirFuncionsByParametre(nomAplicacio, nomParametre){
    return apiPermisos.get(`parametres/funcions/${nomAplicacio}/${nomParametre}`);
  }

  assignarFuncio(nomAplicacio, nomParametre, request){
    return apiPermisos.post(`parametres/funcio/${nomAplicacio}/${nomParametre}`, request);
  }

  eliminarFuncioDelParametre(nomAplicacio, nomParametre, request){
    return apiPermisos.delete(`parametres/funcio/delete/${nomAplicacio}/${nomParametre}`, { data: request });
  }

  obtenirEmpleatsByParametre(nomAplicacio, nomParametre){
    return apiPermisos.get(`parametres/empleats/${nomAplicacio}/${nomParametre}`);
  }

  assignarEmpleat(nomAplicacio, nomParametre, idEmpleat, valor){
    return apiPermisos.post(`parametres/empleat/${nomAplicacio}/${nomParametre}/${idEmpleat}?valor=${valor}`);
  }

  eliminarEmpleatDelParametre(nomAplicacio, nomParametre, idEmpleat){
    return apiPermisos.delete(`parametres/empleat/delete/${nomAplicacio}/${nomParametre}/${idEmpleat}`);
  }

  obtenirTotsElsEmpleatsByParametre(nomAplicacio, nomParametre){
    return apiPermisos.get(`parametres/empleats/tots/${nomAplicacio}/${nomParametre}`);
  }

}
export default new ParametresService();