<template>
<div :id="uniqueId" style="border: 0.25px solid #dbdbdb;">
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)"/>
    <DataTable :value="linies" class="p-datatable-sm-petita"
        v-model:selection="liniaSeleccionada"
        selectionMode="single"
        dataKey="codiNumeroFormat"
        showGridlines
        :scrollable="true" scrollDirection="both" scrollHeight="50vh"
        :resizableColumns="true" columnResizeMode="expand"
        contextMenu v-model:contextMenuSelection="liniaSeleccionada" @rowContextmenu="showContextMenu($event)"
        :rowClass="() => 'estilRow'"
        @dblclick="window?.getSelection()?.removeAllRanges(); emit('showDetall', liniaSeleccionada.codiNumeroFormat)"
        @row-select="selectedIndex = $event.index;">
        <template #empty>
            <div style="width:100%; height: 35vh; text-align: center; padding-top: 30px;">
                <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('Comandes.Cap comanda coincideix criteris')" />
            </div>
        </template>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
            <template #body="{data}">
                <div style="width: 100%;">
                    <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="liniaSeleccionada = data; contextMenu.show($event)" />
                </div>
            </template>
        </Column>
        <Column :header="$t('Comandes.Linia comanda')" :style="{width:'130px'}" style="max-width: 130px;">
            <template #body="{data}">
                {{ data.codiNumeroFormat }}
            </template>
        </Column>
        <Column :header="$t('Comandes.Tipus')" :style="{width:'45px'}" style="max-width: 45px; text-align: center;">
        <template #body="{data}">
            <div style="width: 100%; text-align: center;">
                <ColumnaTipusComanda :tipus="data.tipus" :servida="!data.quantitatPendent" />
            </div>
        </template>
        </Column>
        <Column field="comandaClient" :header="$t('Comandes.Comanda client')" :style="{width:'250px'}" style="max-width: 400px;"/>
        <Column field="dataSolicitada" :header="$t('Comandes.Data solicitada')" :style="{width:'110px'}" style="max-width: 110px;">
            <template #body="{data}">
                {{ `${$d($toDate(data.dataSolicitada), 'short')}` }}
            </template>
        </Column>
        <Column field="setmana" :style="{width:'30px'}" style="text-align: right; max-width: 30px;" :header="$t('Comandes.Set')">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;">
                    {{ data.setmana }}
                </div>
            </template>
        </Column>
        <Column field="dataPrevistaSortida" :header="$t('Comandes.Data sortida')" :style="{width:'180px'}" style="max-width: 250px;">
            <template #body="{data}">
                {{ $d($toDate(data.dataPrevistaSortida), 'short') }}
                <span v-if="data.dataPrevistaSortidaInterna">
                    {{ '&nbsp;⇐&nbsp; ' + $d($toDate(data.dataPrevistaSortidaInterna), 'short') }}
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
        <Column field="preu" :style="{width:'160px'}" style="text-align: right; max-width: 160px;" :header="$t('Comandes.Preu')">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;">
                    <span v-if="data.comandaBlanca" v-tooltip="`CB: ${$n(data.comandaBlanca)}`">
                        <font-awesome-icon icon="fa-solid fa-copyright" style="font-size: 1.10rem" />
                    </span>
                    <span v-if="data.isPreuFixat" v-tooltip="$t('Comandes.Preu fixat')">
                        <font-awesome-icon icon="fa-solid fa-hand" style="font-size: 1.10rem" />
                    </span>
                    {{ `${$n(data.preu.valor, 'decimalLong')} ${data.preu.divisa}` }} 
                </div>
            </template>
        </Column>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" :header="$t('Comandes.Int')">
            <template #body="{data}">
                <div style="width: 100%;">
                <Button icon="pi pi-comments" @click="clickComentarisInterns(data)"
                    class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.comentarisInterns}" />
                </div>
            </template>
        </Column>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" :header="$t('Comandes.Ext')">
            <template #body="{data}">
                <div style="width: 100%;">
                    <Button icon="pi pi-megaphone" @click="clickComentarisClient(data)"
                        class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.comentarisClient}" />
                </div>
            </template>
        </Column>
    </DataTable>
</div>
<div v-if="linies?.length" style="margin-top: 10px; display: flex; align-items: center; width: 100%;">
    <span style="white-space: nowrap;">{{ $t('App.Resultats', [linies.length]) }}</span>
    <transition name="slide-fade">
        <span v-if="linies?.length >= 100" class="missatgeLimit" style="display: inline-flex; align-items: center; justify-content: center; flex-grow: 1;">
            <font-awesome-icon icon="fa-solid fa-info" style="margin-right: 5px;" />
            {{ $t('App.Nomes es mostren els primers resultats', [linies.length]) }}
      </span>
    </transition>
</div>
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { home, controlDataTable } from '@/utils/datetableUtils.js';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import ColumnaTipusComanda from '@/components/ColumnaTipusComanda.vue';
import { useI18n } from 'vue-i18n';
import { usePermisosStore } from '@/stores/permisos';

export default {
    name : 'GridComandesNormServides',
    components : {
        InfoTaulaBuida,
        ColumnaTipusComanda,
    },
    props : {
        client : String,
        modalParentObert : Boolean
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        // Client
        const linies = ref();
        const liniaSeleccionada = ref();
        const selectedIndex = ref(-1);
        const contextMenu = ref();
        const permisosStore = usePermisosStore();

        watch(liniaSeleccionada, () => {
            emit('liniaSeleccionada', liniaSeleccionada.value);
        });

        const uniqueId = computed(() => {
            const randomPart = Math.random().toString(36).substr(2, 9);
            const timeStamp = Date.now();
            return `grid-${randomPart}-${timeStamp}`;
        });

        const elementTaula = () => document.getElementById(uniqueId.value);

        onMounted(() => {
            document.addEventListener("keydown", handler);
        });

        onUnmounted(() => {
            document.removeEventListener("keydown", handler);
        });

        watch(selectedIndex, () => {
            liniaSeleccionada.value = linies.value[selectedIndex.value];
        });

        const refresh = async(liniesParam) => {
            linies.value = liniesParam;
            // Selecció d'index
            selectedIndex.value = -1;
            home(elementTaula(), selectedIndex, linies);
        };

        const handler = (ev) => {
            // No processem l'event en cas que es produeixi des d'un ContextMenu
            if (isContextMenuKey(ev))  return;
            // Si no hi ha cap modal obert
            if (props.modalParentObert) return;

            if(!permisosStore.tePermis('COMANDES', 'WRITE')) return;
            // Controls de la taula
            controlDataTable(ev, elementTaula(), selectedIndex, linies);
            // Controls
            if (ev.key === 'Enter') {
              actionHandler(ev, () => emit('showDetall', liniaSeleccionada.value.codiNumeroFormat));
            }
        }

        const actionHandler = (ev, action) => {
            ev.preventDefault();
            if (contextMenu?.value)
                contextMenu.value.visible = false;
            action();
        }

        const showContextMenu = (ev) => {
            let selectedOld = selectedIndex.value;
            selectedIndex.value = linies.value.findIndex(l => l.codiNumeroFormat == liniaSeleccionada.value.codiNumeroFormat);
            if (selectedOld === selectedIndex.value) {
                liniaSeleccionada.value = linies.value[selectedIndex.value];
            }
            contextMenu.value.show(ev.originalEvent);
        }

        const clickComentarisInterns = (data) => {
            liniaSeleccionada.value = data;
            nextTick(() => emit('comentarisInterns'));
        }

        const clickComentarisClient = (data) => {
            liniaSeleccionada.value = data;
            nextTick(() => emit('comentarisClient'));
        }

        const menuModel = computed(() => {
            let result = [];
            //result.push({label: ()=>  `${t('Comandes.Edita linia')} [Enter]`, class:'p-button-text', icon: 'pi pi-pencil', command: () => clickEditarLiniaComanda()});
            result.push({label: ()=>  `${t('Comandes.Historic linia')} [Ctrl+h]`, class:'p-button-text', icon: 'pi pi-history', 
                command: () => emit('showHistoria') });
            if (permisosStore.tePermis('COMANDES', 'WRITE')){
                result.push({label: ()=>  `${t('Comandes.Edita comentari intern')} [Ctrl+i]`, class:'p-button-text', icon: 'pi pi-comments',
                    command: () => emit('comentarisInterns') });
                result.push({label: ()=>  `${t('Comandes.Edita comentari client')} [Ctrl+e]`, class:'p-button-text', icon: 'pi pi-megaphone',
                    command: () => emit('comentarisClient') });
            }
            return result;
        });
        
        return {
            linies,
            props,
            emit,
            uniqueId,
            liniaSeleccionada,
            selectedIndex,
            contextMenu,
            menuModel,
            showContextMenu,
            clickComentarisInterns,
            clickComentarisClient,
            refresh,
            permisosStore
        }
    },
}
</script>
<style scoped >
    ::v-deep(.estilRow) {
      cursor: pointer;
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
  
    ::v-deep(.estilRow .buttoicon) {
      height: 1.5rem !important;
      width: 1.5rem !important;
      margin-left: auto;
      margin-right: auto;
    }

    ::v-deep(.estilRow .buttoicondisabled) {
      background-color: rgb(102, 102, 102);
      border-color: rgb(102, 102, 102);
    }

    ::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-tbody > tr > td) {
        padding: 0.0rem 0.3rem;
    }

    ::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-thead > tr > th) {
        padding: 0.0rem 0.3rem;
    }

    .missatgeLimit {
      background-color: rgb(201, 227, 189);
      border: 1px solid rgb(52, 136, 68);
      border-radius: 10px;
      padding: 2px;
      display: inline-block;
      margin-left: 20px;
      width: 100%;
    }
   
    .slide-fade-enter-active, .slide-fade-leave-active {
      transition: opacity 1s ease;
    }

    .slide-fade-enter-from, .slide-fade-leave-to {
      opacity: 0;
    }

    .ellipsis {
        white-space: nowrap;      /* Impide que el texto se divida en varias líneas */
        overflow: hidden;         /* Oculta el texto que no cabe */
        text-overflow: ellipsis;  /* Muestra los puntos suspensivos cuando el texto se corta */
        width: 100%;              /* Asegura que el texto ocupe todo el ancho disponible */
    }
</style>