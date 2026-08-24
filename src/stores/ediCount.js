import { defineStore } from 'pinia'
import moment from 'moment'
import ediService from '@/services/edi.service.js'

export const useEdiStore = defineStore('edi', {
  state: () => ({
    count: 0
  }),

  actions: {
    async refreshCount(permisosStore, getEdi2User) {
      if (!permisosStore.teModul('COMANDES_EDI')) {
        this.count = 0
        return
      }

      const user = getEdi2User
      if (!user) {
        this.count = 0
        return
      }

      const params = new URLSearchParams()
      params.append('usuarisEDI', user)
      params.append('dataInici', moment().subtract(1, 'month').format('YYYY-MM-DD'))
      params.append('dataFi', moment().format('YYYY-MM-DD'))

      try {
        const resp = await ediService.obtenirComandesEdi(params)
        const items = resp?.data ?? resp
        this.count = Array.isArray(items) ? items.length : 0
      } catch (e) {
        this.count = 0
      }
    }
  }
})