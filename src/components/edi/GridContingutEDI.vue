<template>
<EditorComentaris v-if="visibleModalContingutTXT" :carregat="visibleModalContingutTXT" @update:carregat="visibleModalContingutTXT = $event;"
    :text="contSelectedLinia" :potEditar="false"/>
<ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)"/>
<div>
    <div :id="uniqueId" style="border: 0.25px solid #dbdbdb;">
        <DataTable :value="liniesEDI" class="p-datatable-sm-petita"
            v-model:selection="selectedLinia"
            selectionMode="single"
            dataKey="id"
            showGridlines
            contextMenu
            :scrollable="true" scrollDirection="both" scrollHeight="50vh"
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
            <Column field="id" :header="$t('Entrades.Identificador')" :style="{width:'100%'}" style="max-width: 10%;">
              <template #body="{data}">
                {{ `${data.id}` }}
              </template>
            </Column>
            <Column field="nom_txt" :header="$t('ComandesEDI.Nom txt')" :style="{width:'100%'}" style="max-width: 22%;">
                <template #body="{data}">
                    {{ `${data.missatge}` }}
                </template>
            </Column>
            <Column field="ruta_pdf" :header="$t('ComandesEDI.Nom pdf')" :style="{width:'100%'}" style="max-width: 35%;">
                <template #body="{data}">
                <span v-if="data.path_pdf">
                    {{ `${data.path_pdf.split("/").pop()}` }}
                </span> <!-- Es mostra només el nom del fitxer, no la ruta completa -->
                </template>
            </Column>
            <Column field="datareg" :header="$t('Entrades.Data registre')" :style="{width:'100%'}" style="max-width: 12%;">
                <template #body="{data}">
                    {{ $d($toDate(data.datareg), 'long') }}
                </template>
            </Column>
            <Column field="data_processat" :header="$t('Entrades.Data processament')">
                <template #body="{data}">
                  <span v-if="data.data_processat">
                    {{ $d($toDate(data.data_processat), 'long') }}
                  </span>
                </template>
            </Column>
            <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 100%; height: 100%; align-items: center; display: flex; justify-content: center;">
                    <span v-if="data.error" style="width: 100%; height: 100%; border: none; align-items: center; display: flex; justify-content: center;"
                        v-tooltip="$t('ComandesEDI.Error contacta it')">
                        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" style="font-size: 1.10rem" color="orange" />
                    </span>
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
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import { useI18n } from 'vue-i18n';
import { carrega } from '@/services/loader';
import ediService from '@/services/edi.service';

export default {
    name : 'GridMissatgesEntrades',
    components : {
        InfoTaulaBuida,
        EditorComentaris,
    },
    props : {
        modalParentObert : Boolean,
        gridEntrades : Object
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const liniesEDI = ref();
        const registreSeleccionat = ref();
        const selectedLinia = ref();
        const contSelectedLinia = ref();
        const contextMenu = ref();
        const selectedIndex = ref(-1);
        const visibleModalContingutTXT = ref(false);

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
            return visibleModalContingutTXT.value;
        });

        const handler = (ev) => {
            // No processem l'event en cas que es produeixi des d'un ContextMenu
            if (isContextMenuKey(ev))  return;
            // Si no hi ha cap modal obert
            if (modalVisible.value) return;
            // Controls de la taula
            controlDataTable(ev, elementTaula(), selectedIndex, liniesEDI);
            // Controls
            if (ev.key === 'Enter' && selectedLinia.value) {
                actionHandler(ev, () => showDetall());
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

        const showDetall = async () => {
            contSelectedLinia.value = selectedLinia.value.contingut;
            nextTick(() => {
                visibleModalContingutTXT.value = true;
            })
        }

        // const actionHandler = (ev, action) => {
        //     ev.preventDefault();
        //     action();
        // }

        const callbackLinia = (quantitat, data, dataPrevistaSortida) => {
            props.seleccioCallback(selectedLinia.value, quantitat, data, dataPrevistaSortida);
        }
        
        const menuModel = computed(() => {
            let result = [];
            result.push({ label: () => `${t('ComandesEDI.mostra contingut txt')}`, class: 'p-button-text', icon: 'pi pi-file', command: () => [selectedLinia.value = registreSeleccionat.value, showDetall()] });
            result.push({ label: () => `${t('ComandesEDI.mostrar pdf')}`, class: 'p-button-text', icon: 'pi pi-file-pdf', command: () => [selectedLinia.value = registreSeleccionat.value, descarregarPDF()] });
            return result;
        });

        const descarregarPDF = async () => {
            let params = new URLSearchParams();
            params.append('pathPDF', selectedLinia.value.path_pdf ? selectedLinia.value.path_pdf : '');

            let response = await(carrega(ediService.descarregaPDF(selectedLinia.value.id, params)));
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            URL.revokeObjectURL(url);
        }

        const showContextMenu = (ev) => {
            registreSeleccionat.value = ev.data;
            const newIndex = liniesEDI.value.findIndex(l => l.id == ev.data.id);
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
            showDetall,
            visibleModalContingutTXT,
            contSelectedLinia,
            menuModel,
            contextMenu,
            showContextMenu,
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