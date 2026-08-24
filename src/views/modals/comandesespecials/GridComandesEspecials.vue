<template>
<EnviarJustificantComandaEspecial v-if="visibleEnviarJustificant" :carregat="visibleEnviarJustificant"  
    @update:carregat="visibleEnviarJustificant = $event" 
    @justificantEnviat="emit('justificantEnviat')"
    :client="infoClient" :comanda="idComanda" :comandaClient="selectedComanda.comandaClient"/>
<PrevisualitzarJustificantComandaEspecial v-if="visiblePrevisualitzarJustificant" :carregat="visiblePrevisualitzarJustificant"  
    @update:carregat="visiblePrevisualitzarJustificant = $event" 
    @justificantEnviat="justificantEnviat"
    :client="infoClient" :comanda="idComanda" :comandaClient="selectedComanda.comandaClient"/>
<div :id="uniqueId" style="border: 0.25px solid #dbdbdb;">
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)"/>
    <DataTable :value="comandes" class="p-datatable-sm-petita"
        v-model:selection="selectedComanda"
        selectionMode="single"
        dataKey="comanda"
        showGridlines
        :scrollable="true" scrollDirection="both" scrollHeight="50vh"
        :resizableColumns="true" columnResizeMode="expand"
        contextMenu v-model:contextMenuSelection="selectedComanda" @rowContextmenu="showContextMenu($event)"
        :rowClass="() => 'estilRow'"
        @dblclick="window?.getSelection()?.removeAllRanges(); emit('showDetall', selectedComanda.comanda)"
        @row-select="selectedIndex = $event.index;">
        <template #empty>
            <div style="width:100%; height: 35vh; text-align: center; padding-top: 30px;">
                <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('Comandes.Cap comanda coincideix criteris')" />
            </div>
        </template>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
            <template #body="{data}">
                <div style="width: 100%;">
                    <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="selectedComanda = data; contextMenu.show($event)" />
                </div>
            </template>
        </Column>
        <Column field="comanda" :header="$t('Comandes.Comanda')" :style="{width:'90px'}" style="max-width: 90px;"/>
        <Column field="dataAlta" :header="$t('Comandes.Recepcio')" :style="{width:'110px'}" style="max-width: 110px;">
            <template #body="{data}">
                {{ $d($toDate(data.dataAlta), 'short') }}
            </template>
        </Column>
        <Column field="empresa" :header="$t('Comandes.Empresa')" :style="{width:'60px'}" style="max-width: 60px;"/>
        <Column field="comandaClient" :header="$t('Comandes.Comanda client')" :style="{width:'150px'}">
            <template #body="{data}">
                <span v-if="data.isStockSeguretat">
                    {{ `${$t('Comandes.Stock seguretat')}: ` }}
                </span>
                {{ data.comandaClient }}
            </template>
        </Column>
        <Column field="programa" :header="$t('Comandes.Programa')" :style="{width:'150px'}"/>
        <Column field="servida" :header="$t('Comandes.Servida')" :style="{width:'100px'}" style="max-width: 100px;">
            <template #body="{data}">
                <div style="width: 100%; text-align: center;">  
                    <Tag v-if="data.servida" style="background-color: #00939b" icon="pi pi-truck" :value="$t('Comandes.Servit')"></Tag>
                    <Tag v-else style="background-color: #f0bd3c" icon="pi pi-clock" :value="$t('Comandes.Pendent')"></Tag>
                </div>
            </template>
        </Column>
        <Column :header="$t('Comandes.Jus')" :style="{width:'35px'}" style="max-width: 35px;">
            <template #body="{data}">
                <div style="width: 100%; text-align: center;">
                    <span v-if="data.dataJustificant" 
                      v-tooltip="$t('Comandes.Enviat justificant', [$d($toDate(data.dataJustificant), 'long'), data.usuariJustificant])"
                      @click="emit('mostrarDetallEnviamentJustificant', data.comanda)">
                        <font-awesome-icon icon="fa-solid fa-envelope" style="font-size: 1.10rem" />
                    </span>
                </div>
            </template>
        </Column>
        <Column :header="$t('Comandes.Adjunts')" :style="{ width: '65px' }" style="max-width: 65px;" bodyStyle="justify-content: center;">
          <template #body="{ data }">
            <a class="enllas" @click="selectedComanda = data; emit('mostrarAdjunts', data.comanda)">
              {{ data.numAdjunts }}
            </a>
          </template>
        </Column>
        <Column field="usuari" :header="$t('Comandes.Usuari')" :style="{width:'190px'}" style="max-width: 190px;">
            <template #body="{data}">
                <div class="ellipsis" v-tooltip="cccc">
                {{ data.usuari }} 
                </div>
            </template>
        </Column>
    </DataTable>
</div>
<div v-if="comandes?.length" style="margin-top: 10px; display: flex; align-items: center; width: 100%;">
    <span style="white-space: nowrap;">{{ $t('App.Resultats', [comandes.length]) }}</span>
    <transition name="slide-fade">
        <span v-if="comandes?.length >= 100" class="missatgeLimit" style="display: inline-flex; align-items: center; justify-content: center; flex-grow: 1;">
            <font-awesome-icon icon="fa-solid fa-info" style="margin-right: 5px;" />
            {{ $t('App.Nomes es mostren els primers resultats', [comandes.length]) }}
      </span>
    </transition>
</div>
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { home, controlDataTable } from '@/utils/datetableUtils.js';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { useI18n } from 'vue-i18n';
import { usePermisosStore } from '@/stores/permisos';
import comandesService from '@/services/comandes.service';
import { carrega } from '@/services/loader';
import EnviarJustificantComandaEspecial from '@/views/modals/justificant/EnviarJustificantComandaEspecial.vue';
import PrevisualitzarJustificantComandaEspecial from '@/views/modals/justificant/AjudaPrevisualitzarJustificantComandaEspecial.vue';

export default {
    name : 'GridComandesNormServides',
    components : {
        InfoTaulaBuida,
        EnviarJustificantComandaEspecial,
        PrevisualitzarJustificantComandaEspecial,
    },
    props : {
        client : String,
        modalParentObert : Boolean
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const permisosStore = usePermisosStore();
        // Client
        const comandes = ref();
        const selectedComanda = ref();
        const selectedIndex = ref(-1);
        const contextMenu = ref();

        const infoClient = ref();
        const idComanda = ref();
        const visibleEnviarJustificant = ref(false);
        const visiblePrevisualitzarJustificant = ref(false);

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
            selectedComanda.value = comandes.value[selectedIndex.value];
        });

        const refresh = async(comandesParam) => {
            comandes.value = comandesParam;
            // Selecció d'index
            selectedIndex.value = -1;
            home(elementTaula(), selectedIndex, comandes);
        };

        const handler = (ev) => {
            // No processem l'event en cas que es produeixi des d'un ContextMenu
            if (isContextMenuKey(ev))  return;
            // Si no hi ha cap modal obert
            if (props.modalParentObert) return;
            // Controls de la taula
            controlDataTable(ev, elementTaula(), selectedIndex, comandes);
            // Controls
            if (ev.key === 'Enter') {
              actionHandler(ev, () => emit('showDetall', selectedComanda.value.comanda));
            }
        }

        const actionHandler = (ev, action) => {
            ev.preventDefault();
            if (contextMenu?.value)
                contextMenu.value.visible = false;
            action();
        }

        const callbackLinia = (quantitat, data, dataPrevistaSortida) => {
            props.seleccioCallback(selectedComanda.value, quantitat, data, dataPrevistaSortida);
        }

        const updateAdjunts = (numAdjunts) => {
            selectedComanda.value.numAdjunts = numAdjunts;
        }

        const showContextMenu = (ev) => {
            let selectedOld = selectedIndex.value;
            selectedIndex.value = comandes.value.findIndex(l => l.comanda == selectedComanda.value.comanda);
            if (selectedOld === selectedIndex.value) {
                selectedComanda.value = comandes.value[selectedIndex.value];
            }
            contextMenu.value.show(ev.originalEvent);
        }

        const menuModel = computed(() => {
            let result = [];
            result.push({label: ()=>  `${t('Comandes.Veure comanda')}`, class:'p-button-text', icon: 'pi pi-eye', command: () => emit('showDetall', selectedComanda.value.comanda)});
            result.push({label: ()=>  `${t('Comandes.Veure adjunts')}`, class:'p-button-text', icon: 'pi pi-file', command: () => emit('mostrarAdjunts', selectedComanda.value.comanda)});
            if(permisosStore.tePermis('COMANDES', 'WRITE') && !selectedComanda?.value?.isStockSeguretat) {
                // Enviar justificant de recepció
                result.push({label: ()=>  `${t('Comandes.Enviar justificant')}`, class:'p-button-text', icon: 'pi pi-envelope', command: () => enviarJustificant(selectedComanda.value)});
                // Previsualitzar justificant de recepció
                result.push({label: ()=>  `${t('Comandes.Previsualitzar justificant')}`, class:'p-button-text', icon: 'pi pi-file-pdf', command: () => previsualitzarJustificant(selectedComanda.value)});
            }
            if (selectedComanda.value?.dataJustificant)
                result.push({label: ()=>  `${t('Comandes.Veure detall enviament justificant')}`, class:'p-button-text', icon: 'pi pi-envelope', command: () => emit('mostrarDetallEnviamentJustificant', selectedComanda.value.comanda)});
            return result;
        });

        const enviarJustificant = async (liniaSeleccionada) => {
            infoClient.value = await(carrega(comandesService.obtenirClient(props.client)));
            idComanda.value = liniaSeleccionada.comanda;
            visibleEnviarJustificant.value = true;
        }

        const previsualitzarJustificant = async (liniaSeleccionada) => {
            infoClient.value = await(carrega(comandesService.obtenirClient(props.client)));
            idComanda.value = liniaSeleccionada.comanda;
            visiblePrevisualitzarJustificant.value = true;
        }
        
        return {
            comandes,
            props,
            emit,
            uniqueId,
            selectedComanda,
            selectedIndex,
            contextMenu,
            menuModel,
            showContextMenu,
            callbackLinia,
            refresh,
            updateAdjunts,
            infoClient,
            idComanda,
            visibleEnviarJustificant,
            visiblePrevisualitzarJustificant,
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

    ::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-tbody > tr > td) {
        padding: 0.0rem 0.2rem;
    }

    ::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-thead > tr > th) {
        padding: 0.0rem 0.2rem;
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