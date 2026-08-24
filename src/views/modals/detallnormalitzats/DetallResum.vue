<template>
  <div class="flex-container" style="font-size: larger; font-weight: 600; float: left;">
    <span> 
      <font-awesome-icon icon="fa-solid fa-coins" style="margin-right: 10px;" />
      <label class="label-detall"> {{ `${$t('Comandes.Import')}:` }} </label>
      <span v-if="refComanda.linies.length">
        {{ `${$n(refComanda.importNet, 'decimal')} ${refComanda.divisa}` }}
        {{ `(${$t('Comandes.Brut')} ${$n(refComanda.importBrut, 'decimal')} ${refComanda.divisa})` }}
      </span>
      <span v-else>-</span>
    </span>
    <span> 
      <font-awesome-icon icon="fa-solid fa-weight-hanging" style="margin-right: 10px;"/>
      <label class="label-detall"> {{ `${$t('Comandes.Pes')}: ` }} </label>  
      <span v-if="refComanda.linies.length">{{ `${$n(refComanda.pes, 'decimal')} Kg.` }}</span>
      <span v-else>-</span>
    </span>
    <span> 
      <font-awesome-icon icon="fa-solid fa-truck" style="margin-right: 10px;"/>
      <label class="label-detall"> {{ `${$t('Comandes.Cost transport')}: ` }} </label>  
      <span v-if="refComanda.linies.length">{{ `${$n(refComanda.costTransport, 'decimal')}` }}</span>
      <span v-else>-</span>
    </span>
  </div>
</template>

<script>
import { toRef } from 'vue';

export default {
  name : 'DetallClient',
  props : {
    comanda : Object,
  },
  emits : ["crearComanda"],
  setup(props, {emit}) {
    const refComanda = toRef(props, 'comanda');

    return {
      props,
      refComanda,
      emit
    }

  }
}
</script>

<style scoped>
  .flex-container {
    padding: 0px 5px; 
    display: flex;
    gap: 75px;
  }

  .label-detall {
    margin-right: 5px;
  }
</style>