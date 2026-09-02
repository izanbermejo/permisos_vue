import { apiOrganigrama, apiPermisos } from '@/services/index.js';

class OrganigramaService {

  obtenirCentres() {
    return apiOrganigrama.get('centres');
  }

  obtenirDepartaments() {
    return apiOrganigrama.get('departaments');
  }

  obtenirFuncions() {
    return apiOrganigrama.get('funcions');
  }

  obtenirDepartamentsPerCentre(codiCentre) {
    return apiOrganigrama.get(`departaments/centre/${codiCentre}`);
  }

  obtenirFuncionsPerDepartament(codiDepartament) {
    return apiOrganigrama.get(`funcions/${codiDepartament}`);
  }

  obtenirEmpleats() {
    return apiOrganigrama.get('empleats');
  }

  obtenirEmpleatsCentreDepartamentFuncio(codiCentre, codiDepartament, codiFuncio) {
    return apiPermisos.get('organigrama/empleats', {
      params: {
        codiCentre,
        codiDepartament,
        codiFuncio
      }
    });
  }

  obtenirFuncionsEmpleat(idEmpleat) {
    return apiPermisos.get(`organigrama/funcions/empleat/${idEmpleat}`);
  }

}
export default new OrganigramaService();