import { apiOrganigrama } from "@/services/index.js";

class PermisosService {

  static APLICACIO = 'COMERCIAL';

  obtenirPermisos(idEmpleat) {
    return apiOrganigrama.get(`permisos/empleat/${idEmpleat}/aplicacio/${PermisosService.APLICACIO}/permisos`);
  }

}

export default new PermisosService();
