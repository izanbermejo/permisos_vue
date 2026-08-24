<template>
  <KeepAlive include="BuscadorComandes">
    <component :is="component" 
      :opcio="component" @update:opcio="canviaComponent"
      :articleClient="articleClient"
    />
  </KeepAlive>
</template>

<script>
import { ref } from 'vue';
import ButtonShortcut from '@/components/ButtonShortcut.vue';
import ComandesEsp from '@/components/comandes/ComandesEsp.vue';
import ComandesNorm from '@/components/comandes/norm/ComandesNorm.vue'
import BuscadorComandes from '@/components/comandes/buscador/BuscadorComandes.vue'
import OpcionsComandes from '@/components/comandes/OpcionsComandes.vue'
import EstadisticaComandes from '@/components/comandes/EstadisticaComandes.vue'
import StockSeguretat from '@/components/comandes/stockseguretat/StockSeguretat.vue';

export default {
  // eslint-disable-next-line  
  name: 'ComandesView',
  components : {
    ButtonShortcut,
    ComandesEsp,
    ComandesNorm,
    BuscadorComandes,
    OpcionsComandes,
    EstadisticaComandes,
    StockSeguretat
  },
  setup ( ) {
    const component = ref('OpcionsComandes');
    const articleClient = ref();

    const canviaComponent = (componentParam, articleClientParam) => {
      component.value = componentParam;
      articleClient.value = articleClientParam;
    }

    return {
      component,
      canviaComponent,
      articleClient
    }

  }
}
</script>

<style scoped>
</style>
