<template>
<CrearEditarLiniaConfiguracioEDI v-if="visibleCrearEditarLiniaConfiguracioEDI" @update:carregat="visibleCrearEditarLiniaConfiguracioEDI = $event; emit('modalObert', false)"
:codiClient="selectedLinia?.codiClient" :tipusMissatge="selectedLinia?.tipusMissatge" @configuracioGuardada="emit('configuracioGuardada')"/>
<ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)"/>
<div>
    <div :id="uniqueId" style="border: 0.25px solid #dbdbdb;">
        <DataTable :value="liniesEDI" class="p-datatable-sm-petita"
            v-model:selection="selectedLinia"
            selectionMode="single"
            dataKey="_rowKey"
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
            <Column v-if="permisosStore.tePermis('COMANDES_EDI', 'WRITE_CONFIG')" :style="props.aviExp ? 'width: 15px;' : 'width: 40px;'"
                :reorderableColumn="false" >
              <template #body="{ data }">
                <div style="width: 100%; height: 35px; align-content: center;">
                  <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                  @click="registreSeleccionat = data; contextMenu.show($event)" />
                </div>
              </template>
            </Column>
            <Column v-if="!props.aviExp" field="codiClient" :header="$t('ComandesEDI.codi client')" style="width: 6%;">
              <template #body="{data}">
                {{ `${data.codiClient}` }}
              </template>
            </Column>
            <Column v-if="!props.aviExp" field="nomClient" :header="$t('Comandes.Client')" style="width: 9%;">
                <template #body="{data}" >
                    <div class="ellipsis" v-tooltip="data.nomClient">{{ `${data.nomClient}` }}</div>
                </template>
            </Column>
            <Column field="tipusMissatge" :header="$t('Comandes.Tipus')" style="width: 5%;">
                <template #body="{data}">
                    {{ data.tipusMissatge }}
                </template>
            </Column>
            <Column field="fermOrientatiu" :header="$t('ComandesEDI.F O')" style="width: 6%;">
                <template #body="{data}">
                    {{ data.fermOrientatiu }}
                </template>
            </Column>
            <Column field="ediBox" :header="$t('ComandesEDI.Edibox')" style="width: 10%;">
                <template #body="{data}">
                    <div class="ellipsis" v-tooltip="data.ediBox">{{ `${data.ediBox}` }}</div>
                </template>
            </Column>
            <Column field="nad02" :header="$t('ComandesEDI.nad02')" style="width: 4%;">
                <template #body="{data}">
                    <div class="ellipsis" v-tooltip="data.nad02">{{ `${data.nad02}` }}</div>
                </template>
            </Column>
            <Column field="codiProveidor" :header="$t('ModalAjudaArticleClient.Codi proveidor')" style="width: 8%;">
                <template #body="{data}">
                    <div class="ellipsis" v-tooltip="data.codiProveidor">{{ `${data.codiProveidor}` }}</div>
                </template>
            </Column>
            <Column field="estrategiaEdi" :header="$t('ComandesEDI.Estrategia')" style="width: 5%;">
                <template #body="{data}">
                    {{ `${data.estrategiaEdi}` }}
                </template>
            </Column>
            <Column field="diesSortida" :header="$t('ComandesEDI.Dies sortida')" style="width: 8%;">
                <template #body="{data}">
                    {{ `${normalitzarDies(data.informacioSortida.diesSortida)}` }}
                </template>
            </Column>
            <Column field="diesRestar" :header="$t('ComandesEDI.Dies a restar')" style="width: 6%;">
                <template #body="{data}">
                    {{ `${Math.abs(data.informacioSortida.diesRestar)}` }}
                    <i v-if="data.informacioSortida.diesRestar < 0" class="pi pi-calendar-minus" v-tooltip="$t('ComandesEDI.no resta cap setmana')" style="margin-left: 10px;"/>
                </template>
            </Column>
            <Column field="considerarAlbarans" :header="$t('App.Albarans')" style="width: 5%;">
                <template #body="{data}">
                    {{ `${normalitzarSiNo(data.considerarAlbarans)}` }}

                </template>
            </Column>
            <Column field="duesDates" :header="$t('ComandesEDI.Dues dates')" style="width: 5%;">
                <template #body="{data}">
                    {{ `${normalitzarSiNo(data.considerarDuesDates)}` }}
                </template>
            </Column>
            <Column field="diesTall" :header="$t('ComandesEDI.Dies tall')" style="width: 4%;">
                <template #body="{data}">
                    {{ `${data.diesTall}` }}
                </template>
            </Column>
            <Column field="llocEntrega" :header="$t('ComandesEDI.Lloc entrega')" style="width: 8%;">
                <template #body="{data}">
                    <span v-if="data.llocEntrega">
                        {{ `${data.llocEntrega}` }}
                    </span>
                </template>
            </Column>
            <Column v-if="!props.aviExp" field="estatClient" :header="$t('Comandes.Client')" style="width: 4%;">
                <template #body="{data}">
                    <div style="width: 100%; text-align: center;">
                        <Tag :value="$t(`ModalAjudaArticleClient.${data.estat}`)" :severity="getSeverityFlag(data.estat)" />
                    </div>
                </template>
            </Column>
            <Column field="estatConfiguracio" :header="$t('ComandesEDI.Config')" style="width: 5%;">
                <template #body="{data}">
                    <div style="width: 100%; text-align: center;">
                        <Tag v-if="data.isActiu" :value="$t(`ComandesEDI.activa`)" severity="success" />
                        <Tag v-else :value="$t(`ComandesEDI.inactiva`)" severity="warning" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
    <div v-if="liniesEDI?.length && !props.aviExp" style="margin-top: 10px; display: flex; align-items: center; width: 100%;">
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
import CrearEditarLiniaConfiguracioEDI from '@/views/modals/CrearEditarLiniaConfiguracioEDI.vue';
import { usePermisosStore } from '@/stores/permisos';
import { carrega } from '@/services/loader';
import ediService from '@/services/edi.service';

export default {
    name : 'GridConfiguracioEDI',
    components : {
        InfoTaulaBuida,
        CrearEditarLiniaConfiguracioEDI,
    },
    props : {
        modalParentObert : Boolean,
        gridEntrades : Object,
        aviExp : Boolean
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
        const visibleCrearEditarLiniaConfiguracioEDI = ref(false);

        const uniqueId = computed(() => {
            const randomPart = Math.random().toString(36).substr(2, 9);
            const timeStamp = Date.now();
            return `grid-${randomPart}-${timeStamp}`;
        });

        const diesSortida = [
            { valor: 1, clau: t("App.dilluns curt") },
            { valor: 2, clau: t("App.dimarts curt") },
            { valor: 3, clau: t("App.dimecres curt") },
            { valor: 4, clau: t("App.dijous curt") },
            { valor: 5, clau: t("App.divendres curt") },
        ];

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
            liniesEDI.value = (linies ?? []).map((item, index) => ({ ...item, _rowKey: index }));
            selectedIndex.value = -1;
            home(elementTaula(), selectedIndex, liniesEDI);
        };

        const modalVisible = computed(() => {
            return visibleCrearEditarLiniaConfiguracioEDI.value;
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
            emit('modalObert', true); // ja ho fas
            nextTick(() => {
            visibleCrearEditarLiniaConfiguracioEDI.value = true;
            });
        }

        const callbackLinia = (quantitat, data, dataPrevistaSortida) => {
            props.seleccioCallback(selectedLinia.value, quantitat, data, dataPrevistaSortida);
        }

        const canviarEstatConfiguracio = async (estat) => {
            selectedLinia.value.isActiu = estat;
            await carrega(ediService.guardaConfiguracionsEntrades(selectedLinia.value));
            emit('configuracioGuardada');
        }
        
        const menuModel = computed(() => {
            if (!permisosStore.tePermis('COMANDES_EDI', 'WRITE_CONFIG')) return
            let result = [];
            result.push({ label: () => `${t('ComandesEDI.editar configuracio')}`, class: 'p-button-text', icon: 'pi pi-pencil', command: () => [selectedLinia.value = registreSeleccionat.value, editarLinia()] });
            if (selectedLinia.value?.isActiu) {
                result.push({ label: () => `${t('ComandesEDI.inactivar')}`, class: 'p-button-text', icon: 'pi pi-times', command: () => canviarEstatConfiguracio(false) });
            } else {
                result.push({ label: () => `${t('ComandesEDI.activar')}`, class: 'p-button-text', icon: 'pi pi-check', command: () => [selectedLinia.value = registreSeleccionat.value, canviarEstatConfiguracio(true)] });
            }
            return result;
        });

        const showContextMenu = (ev) => {
            registreSeleccionat.value = ev.data;
            const newIndex = liniesEDI.value.findIndex(l => l.clauConfiguracio == ev.data.clauConfiguracio);
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

        const normalitzarDies = (dies) => {
            return dies.map(dia => diesSortida.find(d => d.valor === dia)?.clau)
        }

        const normalitzarSiNo = (valor) => {
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
            visibleCrearEditarLiniaConfiguracioEDI,
            contSelectedLinia,
            menuModel,
            contextMenu,
            showContextMenu,
            getSeverityFlag,
            normalitzarDies,
            normalitzarSiNo,
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