<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true" :draggable="true"
    style="width: 1450px">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('Comandes.Informacio reserves') }}</span>
        <ButtonShortcut v-if="potEditar"
          :literal="$t('Comandes.Recalcula reserves')" @click="recaclculaReserva"
        icon="fa-solid fa-retweet"  style="margin-left: 50px;"/>
      </div>
    </template>
    <div class="card" style="margin-top: 10px;">
      <div class="card-header">
          <span>
              <span style="font-size: larger; font-weight: 600;">{{ $t('Comandes.Peces reservades') }}</span>
          </span>
      </div>
      <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)"/>
      <DataTable :value="reserves" dataKey="codiNumeroFormat" class="p-datatable-sm"
              :scrollable="true" scrollHeight="65vh"
              :resizableColumns="true" columnResizeMode="expand"
              :rowClass="() => 'estilRow'"
              showGridlines 
              v-model:selection="liniaReservaSel" selectionMode="single"
              contextMenu v-model:contextMenuSelection="liniaReservaSel" @rowContextmenu="contextMenu.show($event.originalEvent)">
        <template #empty>
          <div style="width:100%; text-align: center;">
              <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Comandes.Cap linia reservada')" />
          </div>
        </template>
        <Column v-if="potEditar"
          :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
          <template #body="{data}">
            <div style="width: 100%;">
              <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="liniaReservaSel = data; contextMenu.show($event)" />
            </div>
          </template>
        </Column>
        <Column :header="$t('Comandes.Linia comanda')" :style="{width:'130px'}" style="max-width: 130px;">
          <template #body="{data}">
            {{ data.codiNumeroFormat }}
          </template>
        </Column>
        <Column :header="$t('Comandes.Servible comanda')" :style="{width:'130px'}" style="max-width: 130px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: center;">  
              <ColumnaServible :reservable="data.servible"/>
            </div>
          </template>
        </Column>
        <Column :header="$t('Comandes.Client')" :style="{width:'200px'}">
          <template #body="{data}">
              {{ data.client }}
          </template>
        </Column>
        <Column :header="$t('Comandes.Data solicitada')" :style="{width:'100px'}" style="max-width: 100px;">
          <template #body="{data}">
              {{ $d(data.dataSolicitada) }}
          </template>
        </Column>
        <Column :header="$t('Comandes.Servible linia')" :style="{width:'150px'}" style="max-width: 150px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: center;">  
              <ColumnaServible :reservable="data.reservable"/>
            </div>
          </template>
        </Column>
        <Column :header="$t('Comandes.Quantitat reservada')" :style="{width:'130px'}" style="max-width: 130px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              {{ $n(data.quantitatReservada) }}
            </div>
          </template>
        </Column>
        <Column :header="$t('Comandes.Quantitat')" :style="{width:'130px'}" style="max-width: 130px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              {{ $n(data.quantitat) }}
            </div>
          </template>
        </Column>
        <Column :header="$t('AjudaReserves.Qtat servida')" :style="{width:'130px'}" style="max-width: 130px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              {{ $n(data.quantitatServida) }}
            </div>
          </template>
        </Column>
        <Column :header="$t('AjudaReserves.Qtat pendent')" :style="{width:'130px'}" style="max-width: 130px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              {{ $n(data.quantitatPendent) }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <div class="card" style="margin-top: 25px;">
      <div class="card-header">
          <span>
              <span style="font-size: larger; font-weight: 600;">{{ $t('Comandes.Cua reserves') }}</span>
          </span>
      </div>
      <ContextMenu ref="contextMenuCuaReserva" :model="menuModelCuaReserva" style="width: auto;" @focus="contextMenuCuaReserva.onArrowDownKey($event)"/>
      <DataTable :value="cuaReserves" dataKey="codiNumeroFormat" class="p-datatable-sm"
              :scrollable="true" scrollHeight="65vh"
              :resizableColumns="true" columnResizeMode="expand"
              :rowClass="() => 'estilRow'"
              showGridlines 
              v-model:selection="liniaCuaReservaSel" selectionMode="single"
              contextMenu v-model:contextMenuSelection="liniaCuaReservaSel" @rowContextmenu="contextMenuCuaReserva.show($event.originalEvent)">
        <template #empty>
          <div style="width:100%; text-align: center;">
            <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Comandes.Cap linia reservada en cua')" />
          </div>
        </template>
        <Column v-if="potEditar"
          :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
          <template #body="{data}">
            <div style="width: 100%;">
              <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="liniaReservaSel = data; contextMenu.show($event)" />
            </div>
          </template>
        </Column>
        <Column :header="$t('Comandes.Linia comanda')" :style="{width:'130px'}" style="max-width: 130px;">
          <template #body="{data}">
            {{ data.codiNumeroFormat }}
          </template>
        </Column>
        <Column :header="$t('Comandes.Servible comanda')" :style="{width:'130px'}" style="max-width: 130px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: center;">  
              <ColumnaServible :reservable="data.servible"/>
            </div>
          </template>
        </Column>
        <Column :header="$t('Comandes.Client')" :style="{width:'200px'}">
          <template #body="{data}">
              {{ data.client }}
          </template>
        </Column>
        <Column :header="$t('Comandes.Data solicitada')" :style="{width:'100px'}" style="max-width: 100px;">
          <template #body="{data}">
              {{ $d(data.dataSolicitada) }}
          </template>
        </Column>
        <Column :header="$t('Comandes.Servible linia')" :style="{width:'150px'}" style="max-width: 150px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: center;">  
              <ColumnaServible :reservable="data.reservable"/>
            </div>
          </template>
        </Column>
        <Column :header="$t('Comandes.Quantitat reservada')" :style="{width:'130px'}" style="max-width: 130px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              {{ $n(data.quantitatReservada) }}
            </div>
          </template>
        </Column>
        <Column :header="$t('Comandes.Quantitat')" :style="{width:'130px'}" style="max-width: 130px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              {{ $n(data.quantitat) }}
            </div>
          </template>
        </Column>
        <Column :header="$t('AjudaReserves.Qtat servida')" :style="{width:'130px'}" style="max-width: 130px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              {{ $n(data.quantitatServida) }}
            </div>
          </template>
        </Column>
        <Column :header="$t('AjudaReserves.Qtat pendent')" :style="{width:'130px'}" style="max-width: 130px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              {{ $n(data.quantitatPendent) }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </Dialog>
</template>

<script>
import { carrega } from '@/services/loader';
import { ref, onMounted, computed } from 'vue';
import ComandesService from '@/services/comandes.service';
import ColumnaServible from '@/components/comandes/ColumnaServible.vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'AjudaStocks',
  components: {
    ColumnaServible,
  },
  props: {
    artint: String,
    empresa : String,
    potEditar: {
      type: Boolean,
      default: false
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const visible = ref(true);
    const contextMenu = ref();
    const contextMenuCuaReserva = ref();
    const reserves = ref();
    const cuaReserves = ref();
    const liniaReservaSel = ref();
    const liniaCuaReservaSel = ref();

    const hide = () => {
      emit('update:carregat', false);
    }

    onMounted(async () => {
      try {
        refresh();
      } catch {
        hide();
      }      
    });

    const refresh = async() => {
      let resp = await carrega(ComandesService.queryReserves(props.artint, props.empresa));
      reserves.value = resp.reserves;
      cuaReserves.value = resp.cua;
    }

    const menuModel = computed(() => {
        let result = [];
        if (props.potEditar) {
            result.push({label: ()=>  `${t('Comandes.Solicitar reserva')}`, class:'p-button-text', icon: 'pi pi-ticket', command: () => solicitarReserva(liniaReservaSel.value)});
        }
        return result;
    });

    const menuModelCuaReserva = computed(() => {
        let result = [];
        if (props.potEditar) {
            result.push({label: ()=>  `${t('Comandes.Solicitar reserva')}`, class:'p-button-text', icon: 'pi pi-ticket', command: () => solicitarReserva(liniaCuaReservaSel.value)});
        }
        return result;
    });

    const solicitarReserva = async (linia) => {
      // Sol·licitud de reserva
      await carrega(ComandesService.solicitarReserva(linia.comanda, linia.numero));
      // Actualització de resultats
      refresh();
    }

    const recaclculaReserva = async () => {
      await carrega(ComandesService.recalcularReserves(props.artint, props.empresa));
      refresh();
    }

    return {
      visible,
      props,
      hide,
      reserves,
      cuaReserves,
      liniaReservaSel,
      liniaCuaReservaSel,
      contextMenu,
      contextMenuCuaReserva,
      menuModel,
      menuModelCuaReserva,
      recaclculaReserva
    }
  },
}
</script>
<style scoped>
  ::v-deep(.estilRow) {
        cursor: pointer;
        user-select: none;
    }

  ::v-deep(.estilRow .ocultable) {
      height: 1.5rem !important;
      width: 1.5rem !important;
      margin-left: auto;
      margin-right: auto;
      display: none;
  }

  ::v-deep(.estilRow:hover .ocultable) {
      display: flex;
  }
</style>