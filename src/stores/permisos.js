import { defineStore } from 'pinia'

export const usePermisosStore = defineStore('permisos', {
  state: () => ({
    moduls: new Map(),
    parametres: new Map()
  }),

  actions: {
    setPermisos(data) {
      this.moduls = new Map(Object.entries(data.moduls));
      this.parametres = new Map(Object.entries(data.parametres));
    },

    teAccesAlgunModul() {
      return this.moduls.size;
    },

    teModul(modul) {
      return this.moduls.has(modul);
    },

    tePermis(modul, permis) {
        return this.moduls.has(modul) &&
             this.moduls.get(modul).includes(permis)
    },
  }

})