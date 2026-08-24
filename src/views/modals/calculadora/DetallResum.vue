<template>
  <div class="flex-container" style="font-size: larger; font-weight: 600; float: left;">
    <span> 
      <font-awesome-icon icon="fa-solid fa-coins" style="margin-right: 10px;" />
      <label class="label-detall"> {{ `${$t('Comandes.Import')}:` }} </label>
      <span v-if="refResum.numLinies > 0">
        {{ `${$n(refResum.importNet, 'decimal')} ${refResum.divisa}` }}
        {{ `(${$t('Comandes.Brut')} ${$n(refResum.importBrut, 'decimal')} ${refResum.divisa})` }}
      </span>
      <span v-else>-</span>
    </span>
    <span> 
      <font-awesome-icon icon="fa-solid fa-weight-hanging" style="margin-right: 10px;"/>
      <label class="label-detall"> {{ `${$t('Comandes.Pes')}: ` }} </label>  
      <span v-if="refResum.numLinies > 0">{{ `${$n(refResum.pes,'decimal')} Kg.` }}</span>
      <span v-else>-</span>
    </span>
    <span> 
      <font-awesome-icon icon="fa-solid fa-truck" style="margin-right: 10px;"/>
      <label class="label-detall"> {{ `${$t('Comandes.Cost transport')}: ` }} </label>  
      <span v-if="refResum.numLinies > 0 && refResum.costTransport">{{ `${$n(refResum.costTransport, 'decimal')}` }}</span>
      <span v-else>-</span>
    </span>
    <ButtonShortcut v-if="refResum.numLinies > 0" :literal="$t('App.Desa')" @click="emit('crearComanda')"
      icon="fa-solid fa-floppy-disk" :shortcut="'[Ctrl + S]'"/>
  </div>
</template>

<script>
import { toRef } from 'vue';

export default {
  name : 'DetallClient',
  props : {
    resum : Object,
  },
  emits : ["crearComanda"],
  setup(props, {emit}) {
    const refResum = toRef(props, 'resum');

    return {
      props,
      refResum,
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