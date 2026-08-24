<template>
<EditorComentaris v-if="visibleModalContingutMissatge" :carregat="visibleModalContingutMissatge" @update:carregat="visibleModalContingutMissatge = $event;"
    :text="contSelectedEntrada" :potEditar="false"/>
<InfoEntradaComercial v-if="visibleModalInfoEntradaComercial" :carregat="visibleModalInfoEntradaComercial" @update:carregat="visibleModalInfoEntradaComercial = $event;"
    :idEntrada="registreSeleccionat.id"/>
<InfoEntradaMagatzem v-if="visibleModalInfoEntradaMagatzem" :carregat="visibleModalInfoEntradaMagatzem" @update:carregat="visibleModalInfoEntradaMagatzem = $event;"
    :idEntrada="registreSeleccionat.id"/>
<ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
<div>
    <div :id="uniqueId" style="border: 0.25px solid #dbdbdb;">
        <DataTable :value="entrades" class="p-datatable-sm-petita"
            v-model:selection="selectedEntrada"
            selectionMode="single"
            dataKey="id"
            showGridlines
            contextMenu
            :scrollable="true" scrollDirection="both" scrollHeight="50vh"
            :resizableColumns="true" columnResizeMode="expand"
            :rowClass="() => 'estilRow'"
            @rowContextmenu="contextMenu.show($event.originalEvent)"
            @dblclick="window?.getSelection()?.removeAllRanges(); showDetall()"
            @row-select="selectedIndex = $event.index;">
            <template #empty>
                <div style="width:100%; height: 35vh; text-align: center; padding-top: 30px;">
                    <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('AjudaArticlesNormalitzats.EmptyArticles')" />
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
            <Column field="id" :header="$t('Entrades.Identificador')" :style="{width:'100px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.id}` }}
              </template>
            </Column>
            <Column field="datareg" :header="$t('Entrades.Data registre')" :style="{width:'110px'}" style="max-width: 25%;">
                <template #body="{data}">
                    {{ $d($toDate(data.datareg), 'long') }}
                </template>
            </Column>
            <Column field="data_processat" :header="$t('Entrades.Data processament')" :style="{width:'110px'}" style="max-width: 25%;">
                <template #body="{data}">
                  <span v-if="data.data_processat">
                    {{ $d($toDate(data.data_processat), 'long') }}
                  </span>
                </template>
            </Column>
            <Column field="tipus" :header="$t('Entrades.Origen')" :style="{width:'350px'}" style="max-width: 25%;">
                <template #body="{data}">
                    {{ `${data.origen}` }}
                </template>
            </Column>
        </DataTable>
    </div>
    <div v-if="entrades?.length" style="margin-top: 10px; display: flex; align-items: center; width: 100%;">
        <span style="white-space: nowrap;">{{ $t('App.Resultats', [entrades.length]) }}</span>
        <transition name="slide-fade">
            <span v-if="entrades?.length >= 100" class="missatgeLimit" style="display: inline-flex; align-items: center; justify-content: center; flex-grow: 1;">
                <font-awesome-icon icon="fa-solid fa-info" style="margin-right: 5px;" />
                {{ $t('App.Nomes es mostren els primers resultats', [entrades.length]) }}
            </span>
        </transition>
    </div>
</div>
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';
import entradesService from "@/services/entrades.service.js";
import { carrega } from '@/services/loader';
import { home, controlDataTable } from '@/utils/datetableUtils.js';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import InfoEntradaComercial from '@/views/modals/InfoEntradaComercial.vue'; 
import InfoEntradaMagatzem from '@/views/modals/InfoEntradaMagatzem.vue'; 
import { useI18n } from 'vue-i18n';

export default {
    name : 'GridMissatgesEntrades',
    components : {
        InfoTaulaBuida,
        EditorComentaris,
        InfoEntradaComercial,
        InfoEntradaMagatzem,
    },
    props : {
        modalParentObert : Boolean,
        focused : Boolean,
        gridEntrades : Object
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const entrades = ref();
        const registreSeleccionat = ref();
        const selectedEntrada = ref();
        const contSelectedEntrada = ref();
        const contextMenu = ref();
        const selectedIndex = ref(-1);
        const visibleModalContingutMissatge = ref(false);
        const visibleModalInfoEntradaComercial = ref(false);
        const visibleModalInfoEntradaMagatzem = ref(false);


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
            selectedEntrada.value = entrades.value[selectedIndex.value];
        });

        const performSearch = (comandesInput) => {
            entrades.value = comandesInput;
            selectedIndex.value = -1;
            home(elementTaula(), selectedIndex, entrades);
        };

        const handler = (ev) => {
            // No processem l'event en cas que es produeixi des d'un ContextMenu
            if (isContextMenuKey(ev))  return;
            // Si no hi ha cap modal obert
            if (props.modalParentObert) return;
            // Si no està el focus al grid
            if (!props.focused) return
            // Controls de la taula
            controlDataTable(ev, elementTaula(), selectedIndex, entrades);
            // Controls
            if (ev.key === 'Enter' && selectedEntrada.value) {
                actionHandler(ev, () => showDetall());
            }
        }

        const showDetall = async () => {
            contSelectedEntrada.value = await carrega(entradesService.carregaContingutMissatge(selectedEntrada.value.id));
            nextTick(() => {
                visibleModalContingutMissatge.value = true;
            })
        }

        const actionHandler = (ev, action) => {
            ev.preventDefault();
            action();
        }

        const callbackLinia = (quantitat, data, dataPrevistaSortida) => {
            props.seleccioCallback(selectedEntrada.value, quantitat, data, dataPrevistaSortida);
        }
        
        const menuModel = computed(() => {
            let result = [];
            result.push({ label: () => `${t('MissatgesEntrades.mostra contingut misstage')}`, class: 'p-button-text', icon: 'pi pi-align-justify', command: () => [selectedEntrada.value.id = registreSeleccionat.value.id, showDetall()] });
            result.push({ label: () => `${t('MissatgesEntrades.mostra entrada comercial')}`, class: 'p-button-text', icon: 'pi pi-chart-bar', command: () => visibleModalInfoEntradaComercial.value = true });
            result.push({ label: () => `${t('MissatgesEntrades.mostra entrada magatzem')}`, class: 'p-button-text', icon: 'pi pi-box', command: () => visibleModalInfoEntradaMagatzem.value = true });
            return result;
        });
        
        return {
            entrades,
            props,
            emit,
            uniqueId,
            registreSeleccionat,
            selectedEntrada,
            selectedIndex,
            callbackLinia,
            performSearch,
            showDetall,
            visibleModalContingutMissatge,
            contSelectedEntrada,
            menuModel,
            contextMenu,
            visibleModalInfoEntradaComercial,
            visibleModalInfoEntradaMagatzem,
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