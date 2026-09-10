import { apiPermisos } from "@/services/index.js";

class PermisosService {

  obtenirPermisosEmpleat(idEmpleat, aplicacio) {
    return apiPermisos.get(`organigrama/permisos/empleat/${idEmpleat}/aplicacio/${aplicacio}/permisos`);
  }

}

export default new PermisosService();
