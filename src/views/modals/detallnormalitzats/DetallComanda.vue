<template>
  <div class="card" style="margin-top: 10px;">
  <h6 class="card-header" style="font-weight: 600;">
    {{ `${refComanda.codiClient} - ${refComanda.nomClient}`}}
    <ButtonShortcut v-if="permisosStore.tePermis('COMANDES', 'WRITE')"
      :literal="$t('Comandes.Canviar adresa')" @click="canviarAdresa"
      icon="fa-solid fa-location-dot" style="margin-left: 50px;"/>
  </h6>
  <div class="card-body">
    <div style="min-width: 100px; overflow-x: auto; white-space: nowrap; margin: -10px;">
      <div class="flex-container">
        <span> 
          <label class="label-detall"> {{ `${$t('Comandes.Comanda client')}:` }} </label>  
          {{ `${refComanda.comandaClient}` }}
        </span>
        <span v-if="refComanda.tarifaCoixinets"> 
          <label class="label-detall"> {{ `${$t('Comandes.Tarifa coixinets')}:` }} </label>  
          {{ `${refComanda.tarifaCoixinets}` }}
        </span>
        <span v-if="refComanda.tarifaBarres"> 
          <label class="label-detall"> {{ `${$t('Comandes.Tarifa barres')}:` }} </label>  
          {{ `${refComanda.tarifaBarres}` }}
        </span>
        <span v-if="refComanda.tarifaMedical"> 
          <label class="label-detall"> {{ `${$t('Comandes.Tarifa medical')}:` }} </label>  
          {{ `${refComanda.tarifaMedical}` }}
        </span>
        <span v-if="refComanda.tarifaFiltresBxx"> 
          <label class="label-detall"> {{ `${$t('Comandes.Tarifa filtres bxx')}:` }} </label>  
          {{ `${refComanda.tarifaFiltresBxx}` }}
        </span>
        <span v-if="refComanda.tarifaFiltresSsu"> 
          <label class="label-detall"> {{ `${$t('Comandes.Tarifa filtres ssu')}:` }} </label>  
          {{ `${refComanda.tarifaFiltresSsu}` }}
        </span>
        <span v-if="refComanda.tarifaFiltresSxx"> 
          <label class="label-detall"> {{ `${$t('Comandes.Tarifa filres ssx')}:` }} </label>  
          {{ `${refComanda.tarifaFiltresSxx}` }}
        </span>
        <span v-if="refComanda.tarifaFiltresSsuPlaques"> 
          <label class="label-detall"> {{ `${$t('Comandes.Tarifa filtres ssu')}-P:` }} </label>  
          {{ `${refComanda.tarifaFiltresSsuPlaques}` }}
        </span>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { toRef } from 'vue';
import { usePermisosStore } from '@/stores/permisos';

export default {
name : 'DetallClient',
props : {
  comanda : Object,
},
setup(props, {emit}) {
  const refComanda = toRef(props, 'comanda');
  const permisosStore = usePermisosStore();

  const canviarAdresa = () => {
    emit('canviarAdresa');
  }

  return {
    props,
    permisosStore,
    refComanda,
    canviarAdresa,
  }

}
}
</script>

<style scoped>
.flex-container {
  padding: 5px 10px; 
  display: flex;
  gap: 25px;
}

.label-detall { 
  font-weight: 600;
  font-size: 1rem;
}
</style>