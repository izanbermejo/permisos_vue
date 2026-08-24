<template>
<DetallEntradaMagatzem v-if="visibleModalDetallEntrada" :carregat="visibleModalDetallEntrada" @update:carregat="visibleModalDetallEntrada = $event;"
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
            <Column field="id_entrada_fabrica" :header="$t('EntradesComercial.Id entrada')" :style="{width:'100px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.idEntradaFabrica}` }}
              </template>
            </Column>
            <Column field="article" :header="$t('EntradesComercial.Article')" :style="{width:'60px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.article}` }}
              </template>
            </Column>
            <Column field="client" :header="$t('EntradesComercial.Client')" :style="{width:'50px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.client}` }}
              </template>
            </Column>
            <Column field="magatzem" :header="$t('EntradesComercial.Magatzem')" :style="{width:'50px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.magatzem}` }}
              </template>
            </Column>
            <Column field="quantitat" :header="$t('Entrades.Quantitat')" :style="{width:'60px'}" style="max-width: 25%; justify-content: end;">
                <template #body="{data}">
                    {{ $n(data.quantitat) }}
                </template>
            </Column>
            <Column field="quantitat_caixa" :header="$t('Entrades.Quantitat caixa')" :style="{width:'130px'}" style="max-width: 25%; justify-content: end;">
                <template #body="{data}">
                    {{ $n(data.quantitatCaixa) }}
                </template>
            </Column>
            <Column field="etiqueta_caixa" :header="$t('EntradesMagatzem.Etiqueta caixa')" :style="{width:'130px'}" style="max-width: 25%; justify-content: end;">
                <template #body="{data}">
                    {{ $n(data.etiquetaCaixa) }}
                </template>
            </Column>
            <Column field="etiqueta_palet" :header="$t('EntradesMagatzem.Etiqueta palet')" :style="{width:'130px'}" style="max-width: 25%; justify-content: end;">
                <template #body="{data}">
                    {{ $n(data.etiquetaPalet) }}
                </template>
            </Column>
            <Column field="quantitat_caixes" :header="$t('EntradesMagatzem.Quantitat de caixes')" :style="{width:'130px'}" style="max-width: 25%; justify-content: end;">
                <template #body="{data}">
                    {{ $n(data.quantitatCaixes) }}
                </template>
            </Column>
            <Column field="data_entrada" :header="$t('Entrades.Data registre')" :style="{width:'130px'}" style="max-width: 25%; justify-content: end;">
                <template #body="{data}">
                    {{ $d($toDate(data.dataAlta), 'long') }}
                </template>
            </Column>
            <Column field="error" :header="$t('EntradesComercial.Error')" :style="{width:'250px'}" style="max-width: 25%;">
                <template #body="{data}">
                    <span v-if="data.msgError">
                        {{ mostrarErrorEntrada(data.msgError, false) }}
                    </span>
                    <span v-else-if="data.msgErrorDetall">
                        {{ mostrarErrorEntrada(data.msgErrorDetall, true) }}
                    </span>
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
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { home, controlDataTable } from '@/utils/datetableUtils.js';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { useI18n } from 'vue-i18n';
import DetallEntradaMagatzem from '@/views/modals/DetallEntradaMagatzem.vue';
import { useToast } from 'primevue/usetoast';
import { ExcelExporter } from '@/utils/ExcelExporter';

export default {
    name : 'GridEntradesMagatzem',
    components : {
        InfoTaulaBuida,
        DetallEntradaMagatzem,
    },
    props : {
        modalParentObert : Boolean,
        focused : Boolean,
        gridEntrades : Object
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const toast = useToast();
        const entrades = ref();
        const selectedEntrada = ref();
        const contSelectedEntrada = ref();
        const contextMenu = ref();
        const registreSeleccionat = ref();
        const selectedIndex = ref(-1);
        const visibleModalDetallEntrada = ref(false);

        const uniqueId = computed(() => {
            const randomPart = Math.random().toString(36).slice(2, 11);
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
            selectedIndex.value = -1;
            entrades.value = comandesInput;
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
        }

        const mostrarErrorEntrada = (msg, isErrorDetall) => {
            switch (msg) {
                case 'ETIQUETA_JA_EXISTEIX':
                    if (isErrorDetall) {
                        return t("Entrades.etiqueta ja existeix caixa")
                    } else {
                        return t("EntradesMagatzem.etiqueta ja existeix")
                    }
                    
                default:
                    return t("Entrades.Error desconegut")
            }
        }

        const showDetall = async () => {
            registreSeleccionat.value = selectedEntrada.value
            visibleModalDetallEntrada.value = true;
        }

        const callbackLinia = (quantitat, data, dataPrevistaSortida) => {
            props.seleccioCallback(selectedEntrada.value, quantitat, data, dataPrevistaSortida);
        }

        const menuModel = computed(() => {
            let result = [];
            result.push({ label: () => `${t('Entrades.detall entrada')}`, class: 'p-button-text', icon: 'pi pi-info-circle', command: () => visibleModalDetallEntrada.value = true });
            return result;
        });

        const exportarTaula = () =>{
            if (entrades.value === null || entrades.value.length === 0) {
                toast.add({severity:'warn', summary: t('Entrades.error exportar taula buida'), life: 5000});
            } else {
                const configuracioExcel = {
                dades: entrades.value,
                columnes: [
                    { titol: t('EntradesComercial.Id entrada'), valor: entrada => entrada.idEntradaFabrica ?? '', width: 15 },
                    { titol: t('EntradesComercial.Article'), valor: entrada => entrada.article ?? '', width: 15 },
                    { titol: t('EntradesComercial.Client'), valor: entrada => entrada.client ?? '', width: 15 },
                    { titol: t('EntradesComercial.Magatzem'), valor: entrada => entrada.magatzem ?? '', width: 15 },
                    { titol: t('Entrades.Quantitat'), valor: entrada => entrada.quantitat ?? '', width: 15 },
                    { titol: t('Entrades.Quantitat caixa'), valor: entrada => entrada.quantitatCaixa ?? '', width: 20 },
                    { titol: t('EntradesMagatzem.Etiqueta caixa'), valor: entrada => entrada.etiquetaCaixa ?? '', width: 15 },
                    { titol: t('EntradesMagatzem.Etiqueta palet'), valor: entrada => entrada.etiquetaPalet ?? '', width: 15 },
                    { titol: t('EntradesMagatzem.Quantitat de caixes'), valor: entrada => entrada.quantitatCaixes ?? '', width: 18 },
                    { titol: t('Entrades.Data registre'), valor: entrada => entrada.dataAlta ?? '', width: 20 },
                    { titol: t('EntradesComercial.Error'), valor: entrada => entrada.msgError ?? entrada.msgErrorDetall ?? '', width: 15 },
                ]
                };

                ExcelExporter.export({
                filename:  t('Entrades.entrades Magatzem arxiu') + '.xlsx',
                configuracioExcel
                });
            }
        };
        
        return {
            entrades,
            props,
            emit,
            uniqueId,
            selectedEntrada,
            selectedIndex,
            callbackLinia,
            performSearch,
            visibleModalDetallEntrada,
            contSelectedEntrada,
            mostrarErrorEntrada,
            showDetall,
            menuModel,
            contextMenu,
            registreSeleccionat,
            exportarTaula,
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