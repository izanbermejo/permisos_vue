<template>
  <div v-if="refClient" style="margin: -10px;">
    <div class="flex-container">
      <span v-if="refTarifes.ibinsa"> 
        <label class="label-detall"> {{ `${$t('Comandes.Tarifa ibinsa')}:` }} </label>  
        {{ `${refTarifes.ibinsa}` }}
      </span>
      <span v-if="refTarifes.coixinets"> 
        <label class="label-detall"> {{ `${$t('Comandes.Tarifa coixinets')}:` }} </label>  
        {{ `${refTarifes.coixinets}` }}
      </span>
      <span v-if="refTarifes.barres"> 
        <label class="label-detall"> {{ `${$t('Comandes.Tarifa barres')}:` }} </label>  
        {{ `${refTarifes.barres}` }}
      </span>
      <span v-if="refTarifes.medical"> 
        <label class="label-detall"> {{ `${$t('Comandes.Tarifa medical')}:` }} </label>  
        {{ `${refTarifes.medical}` }}
      </span>
      <span v-if="refTarifes.filtresBxx"> 
        <label class="label-detall"> {{ `${$t('Comandes.Tarifa filtres bxx')}:` }} </label>  
        {{ `${refTarifes.filtresBxx}` }}
      </span>
      <span v-if="refTarifes.filtresSsu"> 
        <label class="label-detall"> {{ `${$t('Comandes.Tarifa filtres ssu')}:` }} </label>  
        {{ `${refTarifes.filtresSsu}` }}
      </span>
      <span v-if="refTarifes.filtresSxx"> 
        <label class="label-detall"> {{ `${$t('Comandes.Tarifa filres ssx')}:` }} </label>  
        {{ `${refTarifes.filtresSxx}` }}
      </span>
      <span v-if="refTarifes.filtresSsuPlaques"> 
        <label class="label-detall"> {{ `${$t('Comandes.Tarifa filtres ssu')}-P:` }} </label>  
        {{ `${refTarifes.filtresSsuPlaques}` }}
      </span>
      <span> 
        <label class="label-detall"> {{ `${$t('Comandes.Cond envio')}:` }} </label>  
        {{ `${$t(`FormaEnviament.${refClient.formaEnviament}`)} • ${refClient.incoterm} • ${$destiTransport(refClient.desti)}` }}
      </span>
    </div>
  </div>
  <div v-else style="width: 100%; text-align: center;">
    <div>
      <font-awesome-icon icon="fa-solid fa-info" style="font-size: 2.5rem;" />
    </div>
    <div style="margin-top: 5px;">
      <span style="font-size: larger; font-weight: 400;">{{$t('Comandes.Calculadora seleccionar client')}}</span>
    </div>
  </div>
</template>

<script>
import { toRef } from 'vue';

export default {
  name : 'DetallClient',
  props : {
    client : Object,
    tarifes : Object,
  },
  setup(props) {
    const refClient = toRef(props, 'client');
    const refTarifes = toRef(props, 'tarifes');

    return {
      props,
      refClient,
      refTarifes,
    }

  }
}
</script>

<style scoped>
  .flex-container {
    padding: 5px 10px; 
    display: flex;
    gap: 20px;
    row-gap: 5px;
    flex-wrap: wrap;
  }

  .label-detall { 
    font-weight: 600;
    font-size: 1rem;
  }

  .break {
    flex-basis: 100%;
    height: 0;
  }
</style>