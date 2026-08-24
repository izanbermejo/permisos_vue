<template>
<div id="gridComandesNorm">
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
        @row-select="selectedIndex = $event.index; emit('updateFocus', true);">
        <template #empty>
            <div style="width:100%; height: 35vh; text-align: center; padding-top: 30px;">
                <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('Comandes.Cap comanda pendent de servir')" />
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
        <Column field="comandaClient" :header="$t('Comandes.Comanda client')" :style="{width:'130px'}"/>
        <Column :header="$t('Comandes.Servible comanda')" :style="{width:'150px'}" style="max-width: 150px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: center;">  
              <ColumnaServible :reservable="data.servible"/>
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
        <Column field="dataSolicitada" :header="$t('Comandes.Data solicitada')" :style="{width:'130px'}" style="max-width: 130px;">
            <template #body="{data}">
                {{ $d($toDate(data.dataSolicitada), 'short') }}
            </template>
        </Column>
        <Column :style="{width:'120px'}" style="text-align: right; max-width: 120px;" :header="$t('Comandes.Import net')">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;" v-tooltip="`${$n(data.importBrut, 'decimal')} ${data.divisa}`">
                    <span :style="{
                        'background-color': data.importNet > 1000 ? ' #4a6e82' : '', /* Azul marino */
                        'color': data.importNet > 1000 ? 'white' : '', /* Color blanco */
                        'border-radius': data.importNet > 1000 ? '2px' : '', /* Redondear */
                        'padding-left': data.importNet > 1000 ? '3px' : '',
                        }">
                        {{ `${$n(data.importNet, 'decimal')} ${data.divisa}` }}
                    </span>
                </div>
            </template>
        </Column>
        <Column :style="{width:'75px'}" style="text-align: right; max-width: 75px;" :header="$t('Comandes.Pes')">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;">
                {{ `${$n(data.pes, 'decimal')}` }}
                </div>
            </template>
        </Column>
        <Column :style="{width:'100px'}" style="text-align: right; max-width: 100px;" :header="$t('Comandes.Cost tra')">
            <template #body="{data}">
                <div v-if="data.costTransport" style="width: 100%; text-align: right;">
                {{ `${$n(data.costTransport, 'decimal')}` }}
                </div>
            </template>
        </Column>
        <Column field="comentariIntern" :header="$t('Comandes.Com intern')" :style="{width:'190px'}" style="max-width: 190px;">
            <template #body="{data}">
                <div v-if="data.comentariIntern" class="ellipsis" @dblclick.stop="selectedComanda = data; emit('mostrarComentaris', data)">
                    {{ `${data.comentariIntern }`}}
                </div>
                <div v-else style="width: 100%;" @dblclick.stop="selectedComanda = data; emit('mostrarComentaris', data)">
                    &nbsp;
                </div>
            </template>
        </Column>
        <Column field="usuari" :header="$t('Comandes.Usuari')" :style="{width:'190px'}" style="max-width: 190px;">
            <template #body="{data}">
                <div class="ellipsis">
                {{ data.usuari }}
                </div>
            </template>
        </Column>
    </DataTable>
</div>
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import ComandesService from '@/services/comandes.service';
import { home, controlDataTable } from '@/utils/datetableUtils.js';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import ColumnaServible from '@/components/comandes/ColumnaServible.vue';
import { useI18n } from 'vue-i18n';
import { usePermisosStore } from '@/stores/permisos';

export default {
    name : 'GridNormalitzats',
    components : {
        InfoTaulaBuida,
        ColumnaServible,
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

        const elementTaula = () => document.getElementById('gridComandesNorm');

        onMounted(() => {
            document.addEventListener("keydown", handler);
            performSearch();
        });

        onUnmounted(() => {
            document.removeEventListener("keydown", handler);
        });

        watch(selectedIndex, () => {
            selectedComanda.value = comandes.value[selectedIndex.value];
        });

        const performSearch = async(comanda = 0) => {
            comandes.value = await ComandesService.obtenirComandesNormalitzat(props.client);
            emit('update:totalDadesResum', { 
                numLinies : comandes.value.length,
                pes: totalPes.value,
                importNet: totalImportNet.value,
                importBrut: totalImportBrut.value,
                divisa: divisasUnicas.value,
                costTransport: null 
            });
            if (!comanda) {
                selectedIndex.value = -1;
                home(elementTaula(), selectedIndex, comandes);
            }
        };
        // Devuelve todas las divisas únicas presentes en las comandes
        const divisasUnicas = computed(() => {
            if (!comandes.value || !Array.isArray(comandes.value)) return [];
            const set = new Set();
            for (const c of comandes.value) {
                if (c.divisa) set.add(c.divisa);
            }
            return Array.from(set);
        });

        const totalPes = computed(() => {
            if (!comandes.value || !Array.isArray(comandes.value)) return 0;
            return comandes.value.reduce((sum, c) => sum + (Number(c.pes) || 0), 0);
        });

        const totalImportNet = computed(() => {
            if (!comandes.value || !Array.isArray(comandes.value)) return 0;
            return comandes.value.reduce((sum, c) => sum + (Number(c.importNet) || 0), 0);
        });

        const totalImportBrut = computed(() => {
            if (!comandes.value || !Array.isArray(comandes.value)) return 0;
            return comandes.value.reduce((sum, c) => sum + (Number(c.importBrut) || 0), 0);
        });

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
            // Canvi nom
            if (permisosStore.tePermis('COMANDES', 'WRITE'))
                result.push({label: ()=>  `${t('Comandes.Canviar nom')}`, class:'p-button-text', icon: 'pi pi-pencil', command: () => emit('canviarNom', selectedComanda.value.comanda)});
            // Canvi adreça
            if (permisosStore.tePermis('COMANDES', 'WRITE'))
                result.push({label: ()=>  `${t('Comandes.Canviar adresa')}`, class:'p-button-text', icon: 'pi pi-map-marker', command: () => emit('canviarAdresa', selectedComanda.value.comanda)});
            // Enviar justificant de recepció
            if (permisosStore.tePermis('COMANDES', 'WRITE'))
                result.push({label: ()=>  `${t('Comandes.Enviar justificant')}`, class:'p-button-text', icon: 'pi pi-envelope', command: () => emit('enviarJustificant', selectedComanda.value.comanda)});
            // Previsualitzar justificant de recepció
            result.push({label: ()=>  `${t('Comandes.Previsualitzar justificant')}`, class:'p-button-text', icon: 'pi pi-file-pdf', command: () => emit('previsualitzarJustificant', selectedComanda.value.comanda)});
            // Veure detall enviament justificant (només si s'ha enviat previament)
            if (selectedComanda.value?.dataJustificant)
                result.push({label: ()=>  `${t('Comandes.Veure detall enviament justificant')}`, class:'p-button-text', icon: 'pi pi-envelope', command: () => emit('mostrarDetallEnviamentJustificant', selectedComanda.value.comanda)});
            // Veure adjunts
            result.push({label: ()=>  `${t('Comandes.Veure adjunts')}`, class:'p-button-text', icon: 'pi pi-file', command: () => emit('mostrarAdjunts', selectedComanda.value.comanda)});
            // Cancel·lar comanda
            if (permisosStore.tePermis('COMANDES', 'WRITE'))
                result.push({label: ()=>  `${t('Comandes.Cancelar comanda')}`, icon: 'pi pi-times', command: () => emit('cancelarComanda', selectedComanda.value.comanda)});
            return result;
        });

        const updateAdjunts = (numAdjunts) => {
            selectedComanda.value.numAdjunts = numAdjunts;
        }

        const updateComentaris = (comentaris) => {
            selectedComanda.value.comentariIntern = comentaris;
        }
        
        return {
            comandes,
            props,
            emit,
            selectedComanda,
            selectedIndex,
            contextMenu,
            menuModel,
            showContextMenu,
            callbackLinia,
            performSearch,
            totalImportNet,
            totalPes,
            divisasUnicas,
            totalImportBrut,
            updateAdjunts,
            updateComentaris
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

    .enllas {
        cursor: pointer;
    }

    .ellipsis {
        white-space: nowrap;      /* Impide que el texto se divida en varias líneas */
        overflow: hidden;         /* Oculta el texto que no cabe */
        text-overflow: ellipsis;  /* Muestra los puntos suspensivos cuando el texto se corta */
        width: 100%;              /* Asegura que el texto ocupe todo el ancho disponible */
    }
   
</style>