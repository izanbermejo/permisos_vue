<template>
  <KeepAlive include="BuscadorEntrades">
    <component :is="component" 
      :opcio="component" @update:opcio="canviaComponent"
    />
  </KeepAlive>
</template>

<script>
import { ref } from 'vue';
import OpcionsEntrades from '@/components/entrades/OpcionsEntrades.vue';
import MissatgesRebuts from '@/components/entrades/missatgesRebuts/MissatgesEntrades.vue';
import PartComercial from '@/components/entrades/partComercial/EntradesComercial.vue';
import PartMagatzem from '@/components/entrades/partMagatzem/EntradesMagatzem.vue';

export default {
  // eslint-disable-next-line  
  name: 'EntradesView',
  components : {
    OpcionsEntrades,
    MissatgesRebuts,
    PartComercial,
    PartMagatzem
  },
  setup ( ) {
    const component = ref('OpcionsEntrades');

    const canviaComponent = (componentParam) => {
      component.value = componentParam;
    }

    return {
      component,
      canviaComponent,
    }

  }
}
</script>

<style scoped>
</style>
