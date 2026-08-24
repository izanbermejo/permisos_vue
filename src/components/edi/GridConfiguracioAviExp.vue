<template>
<CrearEditarLiniaConfiguracioAviExp v-if="visibleCrearEditarLiniaConfiguracioAviExp" @update:carregat="visibleCrearEditarLiniaConfiguracioAviExp = $event" 
:codiClient="selectedLinia?.codiClient" :codiProveidor="selectedLinia?.codiProveidor" @configuracioGuardada="emit('configuracioGuardada')"/>
<ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)"/>
<div>
    <div :id="uniqueId" style="border: 0.25px solid #dbdbdb;">
        <DataTable :value="liniesEDI" class="p-datatable-sm-petita"
            v-model:selection="selectedLinia"
            selectionMode="single"
            dataKey="codiProveidor"
            showGridlines
            contextMenu
            :scrollable="true" scrollDirection="both" scrollHeight="50vh"
            :resizableColumns="true" columnResizeMode="expand"
            :rowClass="() => 'estilRow'"
            @rowContextmenu="showContextMenu($event)"
            @dblclick="window?.getSelection()?.removeAllRanges(); editarLinia()"
            @row-select="selectedIndex = $event.index;">
            <template #empty>
                <div style="width:100%; height: 35vh; text-align: center; padding-top: 30px;">
                    <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('ComandesEDI.EmptyEDI')" />
                </div>
            </template>
            <Column v-if="permisosStore.tePermis('COMANDES_EDI', 'WRITE_CONFIG')" :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 100%; height: 35px; align-content: center;">
                  <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                  @click="registreSeleccionat = data; contextMenu.show($event)" />
                </div>
              </template>
            </Column>
            <Column field="codiClient" :header="$t('ComandesEDI.codi client')" :style="{width:'100%'}" style="max-width: 10%;">
              <template #body="{data}">
                {{ `${data.codiClient}` }}
              </template>
            </Column>
            <Column field="nomClient" :header="$t('Comandes.Client')" :style="{width:'100%'}" style="max-width: 35%;">
                <template #body="{data}" >
                    <div class="ellipsis" v-tooltip="data.nomClient">{{ `${data.nomClient}` }}</div>
                </template>
            </Column>
            <Column field="codiProveidor" :header="$t('ModalAjudaArticleClient.Codi proveidor')" :style="{width:'100%'}" style="max-width: 15%;">
                <template #body="{data}">
                    <div class="ellipsis" v-tooltip="data.codiProveidor">{{ `${data.codiProveidor}` }}</div>
                </template>
            </Column>
            <Column field="duesDates" :header="$t('ComandesEDI.volAviExp')" :style="{width:'100%'}" style="max-width: 10%;">
                <template #body="{data}">
                    {{ `${volSiNo(data.volAviExp)}` }}
                </template>
            </Column>
            <Column field="duesDates" :header="$t('ComandesEDI.volEnviarLG')" :style="{width:'100%'}" style="max-width: 15%;">
                <template #body="{data}">
                    {{ `${volSiNo(data.volEnviarLG)}` }}
                </template>
            </Column>
            <Column field="estatClient" :header="$t('Comandes.Client')" :style="{width:'100%'}" style="max-width: 10%;">
                <template #body="{data}">
                    <div style="width: 100%; text-align: center;">
                        <Tag :value="$t(`ModalAjudaArticleClient.${data.estat}`)" :severity="getSeverityFlag(data.estat)" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
    <div v-if="liniesEDI?.length" style="margin-top: 10px; display: flex; align-items: center; width: 100%;">
        <span style="white-space: nowrap;">{{ $t('App.Resultats', [liniesEDI.length]) }}</span>
        <transition name="slide-fade">
            <span v-if="liniesEDI?.length >= 100" class="missatgeLimit" style="display: inline-flex; align-items: center; justify-content: center; flex-grow: 1;">
                <font-awesome-icon icon="fa-solid fa-info" style="margin-right: 5px;" />
                {{ $t('App.Nomes es mostren els primers resultats', [liniesEDI.length]) }}
            </span>
        </transition>
    </div>
</div>
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { home, controlDataTable } from '@/utils/datetableUtils.js';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { useI18n } from 'vue-i18n';
import CrearEditarLiniaConfiguracioAviExp from '@/views/modals/CrearEditarLiniaConfiguracioAviExp.vue';
import { usePermisosStore } from '@/stores/permisos';
/* import { carrega } from '@/services/loader';
import ediService from '@/services/edi.service'; */

export default {
    name : 'GridConfiguracioAviExp',
    components : {
        InfoTaulaBuida,
        CrearEditarLiniaConfiguracioAviExp,
    },
    props : {
        modalParentObert : Boolean,
        gridEntrades : Object
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const permisosStore = usePermisosStore();
        const liniesEDI = ref();
        const registreSeleccionat = ref();
        const selectedLinia = ref();
        const contSelectedLinia = ref();
        const contextMenu = ref();
        const selectedIndex = ref(-1);
        const visibleCrearEditarLiniaConfiguracioAviExp = ref(false);

        const uniqueId = computed(() => {
            const randomPart = Math.random().toString(36).substr(2, 9);
            const timeStamp = Date.now();
            return `grid-${randomPart}-${timeStamp}`;
        });

        const opcionsSiNo = [
            { valor: true, clau: t("App.Si") },
            { valor: false, clau: t("App.No") },
        ];

        const elementTaula = () => document.getElementById(uniqueId.value);

        onMounted(() => {
            document.addEventListener("keydown", handler);
        });

        onUnmounted(() => {
            document.removeEventListener("keydown", handler);
        });

        watch(selectedIndex, () => {
            selectedLinia.value = liniesEDI.value[selectedIndex.value];
        });

        watch(registreSeleccionat, () => {
            selectedLinia.value = registreSeleccionat.value;
        });

        const performSearch = (linies) => {
            liniesEDI.value = linies;
            selectedIndex.value = -1;
            home(elementTaula(), selectedIndex, liniesEDI);
        };

        const modalVisible = computed(() => {
            return visibleCrearEditarLiniaConfiguracioAviExp.value;
        });

        const handler = (ev) => {
            // No processem l'event en cas que es produeixi des d'un ContextMenu
            if (isContextMenuKey(ev))  return;
            // Si no hi ha cap modal obert
            if (props.modalParentObert) return;
             // Si està obert el nostre modal de detall
            if (modalVisible.value) return;
            // Controls de la taula
            controlDataTable(ev, elementTaula(), selectedIndex, liniesEDI);
            // Controls
            if (ev.key === 'Enter' && selectedLinia.value) {
                if(permisosStore.tePermis('COMANDES_EDI', 'WRITE_CONFIG'))
                    actionHandler(ev, () => editarLinia());
            } else if (ev.key === 'Escape') {
                actionHandler(ev, () => emit('update:close', true));
            }
        }

        const actionHandler = (ev, action) => {
            ev.preventDefault();
            if (contextMenu?.value)
                contextMenu.value.visible = false;
            action();
        }

        const editarLinia = async () => {
            emit('modalObert', true);
            if(permisosStore.tePermis('COMANDES_EDI', 'WRITE_CONFIG')) {
                contSelectedLinia.value = selectedLinia.value.contingut;
                nextTick(() => {
                    visibleCrearEditarLiniaConfiguracioAviExp.value = true;
                })
            }
        }

        const callbackLinia = (quantitat, data, dataPrevistaSortida) => {
            props.seleccioCallback(selectedLinia.value, quantitat, data, dataPrevistaSortida);
        }

        /* const canviarEstatConfiguracio = async (estat) => {
            selectedLinia.value.isActiu = estat;
            await carrega(ediService.guardaConfiguracionsEntrades(selectedLinia.value));
            emit('configuracioGuardada');
        } */
        
        const menuModel = computed(() => {
            if (!permisosStore.tePermis('COMANDES_EDI', 'WRITE_CONFIG')) return
            let result = [];
            result.push({ label: () => `${t('ComandesEDI.editar configuracio')}`, class: 'p-button-text', icon: 'pi pi-pencil', command: () => [selectedLinia.value = registreSeleccionat.value, editarLinia()] });
            /* if (selectedLinia.value?.isActiu) {
                result.push({ label: () => `${t('ComandesEDI.inactivar')}`, class: 'p-button-text', icon: 'pi pi-times', command: () => canviarEstatConfiguracio(false) });
            } else {
                result.push({ label: () => `${t('ComandesEDI.activar')}`, class: 'p-button-text', icon: 'pi pi-check', command: () => [selectedLinia.value = registreSeleccionat.value, canviarEstatConfiguracio(true)] });
            } */
            return result;
        });

        const showContextMenu = (ev) => {
            registreSeleccionat.value = ev.data;
            const newIndex = liniesEDI.value.findIndex(l => l.codiProveidor == ev.data.codiProveidor);
            if (newIndex !== selectedIndex.value) {
                selectedIndex.value = newIndex;
            } else {
                selectedLinia.value = liniesEDI.value[newIndex];
            }
            contextMenu.value.show(ev.originalEvent);
        }

        const getSeverityFlag = (flag) => {
            if (flag === 'A') return 'success';
            if (flag === 'E') return 'danger';
            if (flag === 'I') return 'warning';
        }

        const volSiNo = (valor) => {
            return opcionsSiNo.find(o => o.valor === valor)?.clau;
        };

        return {
            permisosStore,
            liniesEDI,
            props,
            emit,
            uniqueId,
            registreSeleccionat,
            selectedLinia,
            selectedIndex,
            callbackLinia,
            performSearch,
            editarLinia,
            visibleCrearEditarLiniaConfiguracioAviExp,
            contSelectedLinia,
            menuModel,
            contextMenu,
            showContextMenu,
            getSeverityFlag,
            volSiNo,
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

    .ellipsis {
        white-space: nowrap;      /* Impide que el texto se divida en varias líneas */
        overflow: hidden;         /* Oculta el texto que no cabe */
        text-overflow: ellipsis;  /* Muestra los puntos suspensivos cuando el texto se corta */
        width: 100%;              /* Asegura que el texto ocupe todo el ancho disponible */
    }

   
</style>