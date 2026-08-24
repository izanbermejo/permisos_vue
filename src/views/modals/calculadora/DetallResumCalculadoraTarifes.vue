<template>
  <div class="flex-container" style="font-size: larger; font-weight: 600; float: left;">
    <span> 
      <font-awesome-icon icon="fa-solid fa-coins" style="margin-right: 10px;" />
      <label class="label-detall"> {{ `${$t('Comandes.Import')}: ` }} </label>
      <span v-if="refResum && refResum.length > 0">
        {{ `${$n(props.importNetTotal, 'decimal')} ${refResum[0].preu.divisa}` }}
        {{ `(${$t('Comandes.Brut')} ${$n(props.importBrutTotal, 'decimal')} ${refResum[0].preu.divisa})` }}
      </span>
      <span v-else>-</span>
    </span>
    <span> 
      <font-awesome-icon icon="fa-solid fa-weight-hanging" style="margin-right: 10px;"/>
      <label class="label-detall"> {{ `${$t('Comandes.Pes')}: ` }} </label>  
      <span v-if="refResum && refResum.length > 0">{{ `${$n(props.pesTotal,'decimal')} Kg.` }}</span>
      <span v-else>-</span>
    </span>
    <span> 
      <font-awesome-icon icon="fa-solid fa-truck" style="margin-right: 10px;"/>
      <label class="label-detall"> {{ `${$t('Comandes.Cost transport')}: ` }} </label>  
      <span v-if="refResum && refResum.length > 0 && props.costTransportTotal">
        {{ `${$n(props.costTransportTotal, 'decimal')} ${refResum[0].preu.divisa}` }}
      </span>
      <span v-else>-</span>
      <span v-if="props.costTransportTotal !== props.costTransportTotalAfegit">
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" color="orange" style="margin-left: 10px;"/>
        {{ `(Pes +15%: ${$n(props.costTransportTotalAfegit, 'decimal')} ${refResum[0].preu.divisa})` }}
      </span>
    </span>
  </div>
</template>

<script>
import { toRef } from 'vue';

export default {
  name : 'DetallResumCalculadoraTarifes',
  props : {
    linies : Array,
    importNetTotal: Number,
    importBrutTotal: Number,
    pesTotal: Number,
    costTransportTotal: Number,
    costTransportTotalAfegit: Number,
  },
  setup(props) {
    const refResum = toRef(props, 'linies');

    return {
      props,
      refResum,
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