<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="' '" style="width: 1400px">
    <DataTable :value="linies" class="p-datatable-sm" style="margin-top: 10px;" showGridlines >
      <Column :header="$t('Comandes.Tipus')" :style="{width:'50px'}" style="max-width: 50px; text-align: center;">
        <template #body="{data}">
          <ColumnaTipusComanda :tipus="data.tipus" />
        </template>
      </Column>
      <Column field="dataSolicitada" :header="$t('Comandes.Data solicitada')" :style="{width:'150px'}" style="max-width: 150px;">
        <template #body="{data}">
          {{ `${$d($toDate(data.dataSolicitada), 'short')} (${data.setmana})` }}
        </template>
      </Column>
      <Column field="dataPrevistaSortida" :header="$t('Comandes.Data sortida')" :style="{width:'240px'}" style="max-width: 240px;">
        <template #body="{data}">
          {{ $d($toDate(data.dataPrevistaSortida), 'short') }}
          <span v-if="data.dataPrevistaSortidaInterna">
            {{ `&nbsp;&nbsp;||&nbsp;&nbsp;${$d($toDate(data.dataPrevistaSortidaInterna), 'short')}` }}
          </span>
        </template>
      </Column>
      <Column field="dataPrevistaSortida" :header="$t('Comandes.Data confirmada')" :style="{width:'110px'}" style="max-width: 110px;">
        <template #body="{data}">
          <span v-if="data.dataConfirmadaFabrica">
            {{ $d($toDate(data.dataConfirmadaFabrica), 'short') }}
          </span>
        </template>
      </Column>
      <Column field="quantitat" :style="{width:'100px'}" style="text-align: right; max-width: 100px;" :header="$t('Comandes.Quantitat')">
        <template #body="{data}">
          <span>
            {{ $n(data.quantitat) }}
          </span>
        </template>
      </Column>
      <Column :header="$t('Comandes.Quantitat servida')" :style="{width:'125px'}" style="text-align: right; max-width: 125px;" >
        <template #body="{data}">
          {{ $n(data.quantitatServida) }}
        </template>
      </Column>
      <Column field="quantitatPendent" :header="$t('Comandes.Quantitat pendent')" :style="{width:'125px'}" style="text-align: right; max-width: 125px;">
        <template #body="{data}">
          {{ $n(data.quantitatPendent) }}
        </template>
      </Column>
      <Column field="preu" :style="{width:'160px'}" style="text-align: right; max-width: 160px;" :header="$t('Comandes.Preu')">
        <template #body="{data}">
          <div style="width: 100%; text-align: right;">
            <span v-if="data.comandaBlanca" v-tooltip="`CB: ${$n(data.comandaBlanca)}`">
              <font-awesome-icon icon="fa-solid fa-copyright" style="font-size: 1.10rem" />
            </span>
            <span v-if="data.isPreuFixat" v-tooltip="$t('Comandes.Preu fixat')">
              <font-awesome-icon icon="fa-solid fa-hand" style="font-size: 1.10rem" />
            </span>
            {{ `${$n(data.preu)} ${data.divisa}` }}
          </div>
        </template>
      </Column>
      <Column :header="$t('App.Usuari')" :style="{width:'175px'}" style="max-width: 175px;">
          <template #body="{data}">
              <div class="ellipsis" v-tooltip="data.usuari">
                  {{ data.usuari }}
              </div>
          </template>
      </Column>
      <Column :style="{width:'150px'}" style="max-width: 150px;" :header="$t('App.Data registre')">
        <template #body="{data}">
          <label> {{ $d(data.datareg, 'short') }} </label>
          <!-- <label> {{ $d(data.datareg, 'long') }} </label> -->
        </template>
      </Column>
    </DataTable>
  </Dialog>
</template>

<script>
import ComandesService from '@/services/comandes.service';
import { carrega } from "@/services/loader";
import ColumnaTipusComanda from '@/components/ColumnaTipusComanda.vue';
import { ref, onMounted, onUnmounted } from "vue";

export default {
  name: "HistoricLiniaComanda",
  components: {
    ColumnaTipusComanda,
  },
  props: {
    comanda: Number,
    linia: Number,
  },
  setup(props, { emit }) {
    const visible = ref(true);
    const linies = ref();

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      linies.value = await carrega(ComandesService.obtenirHistoricLinia(props.comanda, props.linia));
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const handler = (key) => {
      if (key.key === 'Escape')
        hide();
    }

    const hide = () => {
      emit("update:carregat", false);
    };

    return {
      visible,
      hide,
      linies,
    };

  },
};
</script>

<style scoped>
    .ellipsis {
        white-space: nowrap;      /* Impide que el texto se divida en varias líneas */
        overflow: hidden;         /* Oculta el texto que no cabe */
        text-overflow: ellipsis;  /* Muestra los puntos suspensivos cuando el texto se corta */
        width: 100%;              /* Asegura que el texto ocupe todo el ancho disponible */
    }
</style>
