<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true" :draggable="false">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('Comandes.Informacio tarifes article') }} ({{ props.matriu }}, {{ props.referencia }})</span>
      </div>
    </template>
    <DataTable :value="filesTaula" class="p-datatable-sm" showGridlines>
      <!-- selecciona el tipus de l'objecte i després itera l'array dels preus -->
      <Column field="tipus" header="" style="width:100px; font-weight: bold;" />
      <Column v-for="(tarifa, i) in tarifes" :key="i" :header="tarifa.tram" style="width:120px">
        <template #body="{ data }">
          {{ data.valors[i] }}
        </template>
      </Column>
    </DataTable>
  </Dialog>
</template>

<script>
import { carrega } from '@/services/loader';
import { ref, onMounted, computed } from 'vue';
import TarifesService from '@/services/tarifes.service.js';

export default {
  name: 'AjudaStocks',
  components: {
  },
  props: {
    referencia: String,
    matriu: String,
    clicod: String,
    artint: String,
  },
  setup(props, { emit }) {
    const visible = ref(true);
    const tarifes = ref();

    // transforma l'array de tots els trams en un array de dos objectes, un de tots els preus bruts y un dels nets
    const filesTaula = computed(() => {
      if (!tarifes.value) return [];

      return [
        {
          tipus: 'Brut',
          valors: tarifes.value.map(t => `${t.preuBrut.valor} ${t.preuBrut.divisa}`)
        },
        {
          tipus: 'Net',
          valors: tarifes.value.map(t => `${t.preuNet.valor} ${t.preuNet.divisa}`)
        }
      ];
    });
    
    const hide = () => {
      emit('update:carregat', false);
    }

    onMounted(async () => {
      carregaTarifes()
    });

    const carregaTarifes = async () => {
      try {
        tarifes.value = await carrega(TarifesService.obtenirTarifesByArtint(props.artint, props.clicod));
      } catch (error) {
        hide();
      }
    }


    return {
      visible,
      props,
      hide,
      tarifes,
      filesTaula,
    }
  },
}
</script>

<style scoped>
  
</style>