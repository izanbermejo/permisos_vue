<template>
<ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
<div>
    <div :id="uniqueId" style="border: 0.25px solid #dbdbdb;">
        <DataTable :value="liniesEDI" class="p-datatable-sm-petita"
            v-model:selection="selectedLinia"
            selectionMode="single"
            dataKey="clauComanda"
            showGridlines
            contextMenu
            :scrollable="true" scrollDirection="both" scrollHeight="70vh"
            :resizableColumns="true" columnResizeMode="expand"
            :rowClass="() => 'estilRow'"
            @rowContextmenu="showContextMenu($event)"
            @dblclick="window?.getSelection()?.removeAllRanges(); showDetall()"
            @row-select="selectedIndex = $event.index;">
            <template #empty>
                <div style="width:100%; height: 35vh; text-align: center; padding-top: 30px;">
                    <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('ComandesEDI.EmptyEDI')" />
                </div>
            </template>
            <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 100%; height: 35px; align-content: center;">
                  <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                  @click="registreSeleccionat = data; contextMenu.show($event)" />
                </div>
              </template>
            </Column>
            <Column field="tipus" :header="$t('ComandesEDI.taula_comandesEDI.tipus')" :style="{width:'100%'}" style="max-width: 8%;">
              <template #body="{data}">
                {{ `${data.tipus}` }}
              </template>
            </Column>
            <Column field="datareg" :header="$t('ComandesEDI.taula_comandesEDI.data')" :style="{width:'100%'}" style="max-width: 13%;">
                <template #body="{data}">
                    {{ $d($toDate(data.dataArribada), 'long') }}
                </template>
            </Column>
            <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 100%; height: 100%; align-items: center; display: flex; justify-content: center;">
                    <span v-if="data.error" style="width: 100%; height: 100%; border: none; align-items: center; display: flex; justify-content: center;"
                        v-tooltip="errors[data.error]">
                        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" style="font-size: 1.10rem" color="orange" />
                    </span>
                </div>
              </template>
            </Column>
            <Column field="responsable" :header="$t('ComandesEDI.taula_comandesEDI.usuari')" :style="{width:'100%'}" style="max-width: 10%;">
                <template #body="{data}">
                    <span v-if="data.responsable">
                        {{ `${data.responsable}` }}
                    </span>
                    <span v-else>-</span>
                </template>
            </Column>
            <Column field="client" :header="$t('Comandes.Client')" :style="{width:'100%'}" style="max-width: 35%;">
                <template #body="{data}">
                    <span v-if="data.client">
                        {{ `${data.codiClient} - ${data.client}` }}
                    </span>
                    <span v-else>-</span>
                </template>
            </Column>
            <Column field="missatge" :header="$t('Comandes.Missatge')" :style="{width:'100%'}" style="max-width: 13%;">
                <template #body="{data}">
                  {{ data.numeroDocument }}
                </template>
            </Column>
            <Column field="referenciaClient" :header="$t('ComandesEDI.taula_comandesEDI.article')" >
                <template #body="{data}">
                    <span v-if="data.referenciaClient">
                        {{ `${data.referenciaClient}` }}
                    </span>
                    <span v-else>-</span>
                </template>
            </Column>
            <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 100%; height: 35px; align-items: center; display: flex; justify-content: center;">
                    <span v-if="data.tePdf" 
                        v-tooltip="$t('ComandesEDI.mostrar pdf')"
                        @click="registreSeleccionat = data, emit('mostraPDF', registreSeleccionat)">
                        <font-awesome-icon icon="fa-solid fa-file-pdf" style="font-size: 1.10rem"/>
                    </span>
                </div>
              </template>
            </Column>
        </DataTable>
    </div>
</div>
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { ref, watch, computed } from 'vue';
import { controlDataTable, home } from '@/utils/datetableUtils.js';
import { useI18n } from 'vue-i18n';
import { isContextMenuKey } from '@/utils/contextmenuUtils';
import { carrega } from '@/services/loader';
import ediService from '@/services/edi.service';

export default {
    name : 'GridComandesEDIByArticleClient',
    components : {
        InfoTaulaBuida,
    },
    props : {
        modalParentObert : Boolean,
        focused : Boolean,
        gridEntrades : Object
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const liniesEDI = ref();
        const registreSeleccionat = ref();
        const selectedLinia = ref();
        const contextMenu = ref();
        const selectedIndex = ref(-1);

        const uniqueId = computed(() => {
            const randomPart = Math.random().toString(36).substr(2, 9);
            const timeStamp = Date.now();
            return `grid-${randomPart}-${timeStamp}`;
        });

        const elementTaula = () => document.getElementById(uniqueId.value);

        const errors = {
            'CONFIGURACIOEDI_NO_TROBADA': t('ComandesEDI.CONFIGURACIOEDI_NO_TROBADA'),
            'ARTICLE_NO_TROBAT': t('ComandesEDI.ARTICLE_NO_TROBAT'),
            'VARIS_ARTICLES_TROBATS': t('ComandesEDI.VARIS_ARTICLES_TROBATS'),
        }

        watch(selectedIndex, () => {
            selectedLinia.value = liniesEDI.value[selectedIndex.value];
        });

        const performSearch = (linies) => {
            document.addEventListener("keydown", handler);
            liniesEDI.value = linies;
            selectedIndex.value = -1;
            home(elementTaula(), selectedIndex, liniesEDI);
        };

        const handler = (ev) => {
            // No processem l'event en cas que es produeixi des d'un ContextMenu
            if (isContextMenuKey(ev))  return;
            // Si no hi ha cap modal obert
            if (props.modalParentObert) return;
            // Si no està el focus al grid
            controlDataTable(ev, elementTaula(), selectedIndex, liniesEDI);
            // Controls
            if (ev.key === 'Enter' && selectedLinia.value) {
                actionHandler(ev, () => emit('mostraTXT', selectedLinia.value));
            } else if (ev.key === 'Escape') {
                actionHandler(ev, () => emit('update:close', true));
            }
        }

        const actionHandler = (ev, action) => {
            ev.preventDefault();
            action();
        }

        const callbackLinia = (quantitat, data, dataPrevistaSortida) => {
            props.seleccioCallback(selectedLinia.value, quantitat, data, dataPrevistaSortida);
        }

        const reprocessarComanda = async () => {
            await carrega(ediService.reprocessarComandaEdi(selectedLinia.value.idMissatge, selectedLinia.value.idComanda));
            emit('update:carrega', true);
        }
        
        const menuModel = computed(() => {
            let result = [];
            result.push({ label: () => `${t('ComandesEDI.mostra contingut txt')}`, class: 'p-button-text', icon: 'pi pi-file', command: () => emit('mostraTXT', registreSeleccionat.value) });
            result.push({ label: () => `${t('ComandesEDI.mostrar pdf')}`, class: 'p-button-text', icon: 'pi pi-file-pdf', command: () => emit('mostraPDF', registreSeleccionat.value) });
            result.push({ label: () => `${t('ComandesEDI.pujar pdf')}`, class: 'p-button-text', icon: 'pi pi-file-import', command: () => emit('pujaPDF', registreSeleccionat.value) });
            if (registreSeleccionat.value?.error)
                result.push({ label: () => `${t('ComandesEDI.reprocessar comanda')}`, class: 'p-button-text', icon: 'pi pi-refresh', command: () => [selectedLinia.value = registreSeleccionat.value, reprocessarComanda()] });
            return result;
        });

        const showContextMenu = (ev) => {
            registreSeleccionat.value = ev.data;
            const newIndex = liniesEDI.value.findIndex(l => l.clauComanda == ev.data.clauComanda);
            if (newIndex !== selectedIndex.value) {
                selectedIndex.value = newIndex;
            } else {
                selectedLinia.value = liniesEDI.value[newIndex];
            }
            contextMenu.value.show(ev.originalEvent);
        }
        
        return {
            liniesEDI,
            props,
            emit,
            uniqueId,
            registreSeleccionat,
            selectedLinia,
            selectedIndex,
            callbackLinia,
            performSearch,
            menuModel,
            contextMenu,
            showContextMenu,
            errors,
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

    .slide-fade-enter, .slide-fade-leave-to /* .slide-fade-leave-to es para la salida */ {
        opacity: 0;
    }
   
</style>