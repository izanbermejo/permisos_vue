<template>
    <Dialog v-model:visible="visible" @show="focusDialog" :modal="true" :closable="true" @hide="hide" style="width: auto;">
        <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4 style="margin-right: 5px;">{{ $t('OF.Detall OF') }}:</h4>
                <h4>{{ (capsalera?.numero ? $n(capsalera.numero) : 0) + " - " + props.articleClient }}</h4>
                <ButtonShortcut v-if="isPotAnularOf " @click="anularOF()" 
                :literal="$t('OF.Anula')" icon="fa-solid fa-xmark" style="height: 25px; margin-left: 10px; margin-bottom: 5px;"/>
            </div>
        </template>
        <div tabindex="0" ref="dialogRef" class="capsalera">
            <div class="capsalera-item">
                <div class="fila">
                    <div>
                        <span class="label">{{ $t('OF.Fabrica') }}: </span>
                        <span class="valor">{{ capsalera?.fabrica ?? '-' }}</span>
                        <span v-if="!!capsalera?.canviFabrica" v-tooltip="$t('OF.Canvi fabrica tooltip')" style="margin-left: 5px;">
                            <font-awesome-icon icon="fa-solid fa-industry" style="font-size: 1.10rem;"/>
                        </span>
                    </div>
                    <div v-if="capsalera?.ofPosterior">
                        <span class="label">{{ $t('OF.Posterior') }}: </span>
                        <a href="#" @click.prevent="loadOF(capsalera?.ofPosterior)"
                        style="text-decoration: underline; cursor: pointer;">
                        {{ capsalera?.ofPosterior ? $n(capsalera.ofPosterior) : '-' }}
                        </a>
                    </div>
                    <div v-else>
                        <span class="label">{{ $t('OF.Posterior') }}: </span>
                        <span class="valor">{{ capsalera?.ofPosterior ? $n(capsalera.ofPosterior) : '-' }}</span>
                    </div>
                    <div v-if="capsalera?.ofAnterior">
                        <span class="label">{{ $t('OF.Anterior') }}: </span>
                        <a href="#" @click.prevent="loadOF(capsalera?.ofAnterior)"
                            style="text-decoration: underline; cursor: pointer;">
                            {{ capsalera?.ofAnterior ? $n(capsalera.ofAnterior) : '-' }}
                        </a>
                    </div>
                    <div v-else>
                        <span class="label">{{ $t('OF.Anterior') }}: </span>
                        <span class="valor" href="">{{ capsalera?.ofAnterior ? $n(capsalera.ofAnterior) : '-' }}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span class="label">{{ $t('OF.Variacio') }}:</span>

                        <span :style="{ color: colorVariacio }">
                            {{ variacioFormat }}
                        </span>
                    </div>


                </div>
                <div class="fila">
                    <div>
                        <span class="label">{{ $t('OF.Data') }}: </span>
                        <span class="valor">
                            {{ capsalera?.dataEmissio ? $d($toDate(capsalera.dataEmissio), 'short') : '-' }}
                        </span>
                    </div>
                    <div>
                        <span class="label">{{ $t('OF.Data anulacio') }}: </span>
                        <span class="valor">
                            <font-awesome-icon v-if="capsalera?.dataAnulacio" icon="fa-solid fa-triangle-exclamation" style="font-size: 1.10rem; color: red;"/>
                            {{ capsalera?.dataAnulacio ?  $d($toDate(capsalera.dataAnulacio), 'short') : '-' }}
                        </span>
                    </div>
                    <div>
                        <span class="label">{{ $t('OF.Data Ultima Quantitat rebuda') }}: </span>
                        <span class="valor">
                            {{ capsalera?.dataUltimaQuantitatRebuda ? $d($toDate(capsalera.dataUltimaQuantitatRebuda), 'short') : '-'}}
                        </span>
                    </div>
                    <div>
                        <span class="label">{{ $t('OF.Ultima Quantitat rebuda') }}: </span>
                        <span class="valor">
                            {{ capsalera?.ultimaQuantitatRebuda ? $n(capsalera.ultimaQuantitatRebuda) : 0}}
                        </span>
                    </div>
                </div>
                <div class="fila">
                    <div>
                        <span class="label">{{ $t('OF.Quantitat total') }}: </span>
                        <span class="valor">
                            {{ capsalera?.quantitatTotal ? $n(capsalera?.quantitatTotal) : 0 }}
                        </span>
                    </div>
                    <div>
                        <span class="label">{{ $t('OF.Quantitat rebuda') }}: </span>
                        <span class="valor">
                            {{ capsalera?.quantitatRebudaEntrades ? $n(capsalera?.quantitatRebudaEntrades) : 0}}
                        </span>
                    </div>
                    <div>
                        <span class="label">{{ $t('OF.Quantitat pendent') }}: </span>
                        <span class="valor">
                            {{ capsalera?.quantitatPendent ? $n(capsalera?.quantitatPendent) : 0}}
                        </span>
                    </div>
                    <div>
                        <span class="label">{{ $t('OF.Exces') }}: </span>
                        <span class="valor">{{ capsalera?.exces ? $n(capsalera?.exces) : 0 }}</span>
                    </div>
                </div>
            </div>
        </div>

        <span v-if="!isOFActual" class="avisNoDataAvui">
            <i class="pi pi-exclamation-triangle" />
            <span style="margin-left: 5px;">
                {{ $t('OF. Els terminis no son els mes recents') }}
            </span>
            <a href="#" @click.prevent="carregaOFActual(capsalera.articleClient.artint, capsalera.articleClient.clicod)"
                style="margin-left: 10px; text-decoration: underline; cursor: pointer;">
                {{ $t('OF.Carregar OF actual') }}
            </a>
        </span>
        <span v-else>
            <div style="padding: 8px 12px; font-size: 0.85rem; color: #666;">
                <i class="pi pi-info-circle" style="margin-right: 6px;"></i>
                {{ $t('OF.Usa les fletxes del teclat per navegar') }}
            </div>
        </span>

        <Panel>
            <template #header>
                <div style="display: flex; align-items: center; width: 100%; justify-content: space-between;">
                    <span>{{ $t('OF.Terminis') }}</span>

                    <div v-if="capsalera?.increment" style="text-align: center;">
                        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: orange; margin-right: 5px;" />
                        <span>{{ $t('OF.Dies increment', [capsalera?.diesCalculIncrement]) }}</span>
                        <span style="margin-left: 5px;">{{ $t('OF.data limit') }}</span> 
                        <span style="margin-left: 5px;">{{ $d($toDate(capsalera?.dataLimitIncrement), 'short') }}</span>
                    </div>

                    <span>
                        <ButtonShortcut icon="fa-solid fa-file-excel" :literal="$t('Comandes.Descarregar taula')" @click="exportarTaula(props.articleClient)" />
                    </span>
                </div>
            </template>

            <div style="margin: -18px -16px -13px -17px">
                <DataTable :value="terminis" :rowClass="estilRow" class="p-datatable-sm" :showGridlines="true" :scrollable="true"
                    scrollHeight="50vh" style="min-height: 400px; min-width: 1100px; max-width: 1200px;">
                    <template #empty>
                        <div style="width:100%; text-align: center; padding-top: 30px;">
                            <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Comandes.Cap termini')" />
                        </div>
                    </template>

                   <Column field="data" :header="$t('OF.Data')" style="max-width: 115px;">
                        <template #body="{ data: row }">
                            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                <span>{{ $d($toDate(row.data), 'short') }}</span>
                                <i v-if="$toDate(row.data).getTime() !== $toDate(row.dataSortida).getTime()"
                                    class="pi pi-check" style="margin-left: 6px; color: var(--green-600);"
                                    v-tooltip="$t('OF.Data confirmada') + ': ' + $d($toDate(row.dataSortida), 'short')"/>
                            </div>
                        </template>
                    </Column>
                    <Column field="setmana" :style="{width:'30px'}" style="text-align: right; max-width: 30px;" :header="$t('Comandes.Set')">
                        <template #body="{data}">
                            <div style="width: 100%; text-align: right;">
                                {{ data.setmana }}
                            </div>
                        </template>
                    </Column>
                    <Column field="quantitatAnterior" :header="$t('OF.Quantitat anterior')">
                        <template #body="{ data }">
                            <div style="width: 100%; text-align: right;">
                                {{ $n(data.quantitatAnterior) }}
                            </div>
                        </template>
                    </Column>

                    <Column field="quantitat" :header="$t('OF.Quantitat')">
                        <template #body="{ data }">
                            <div style="width: 100%; text-align: right; display: flex; justify-content: flex-end; align-items: center;">
                                <span v-if="data.quantitat !== data.quantitatAnterior"
                                    :style="{
                                        color: data.quantitat > data.quantitatAnterior ? 'green' : 'red',
                                        fontWeight: 600,
                                        marginRight: '10px'
                                    }"> {{ data.quantitat > data.quantitatAnterior ? '+' : '-' }}{{ $n(Math.abs(data.quantitat - data.quantitatAnterior)) }}
                                </span>

                                <!-- Valor principal -->
                                <span>{{ $n(data.quantitat) }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column field="quantitatPendent" :header="$t('OF.Quantitat pendent')">
                        <template #body="{ data }">
                            <div style="width: 100%; text-align: right;">
                                {{ $n(data.quantitatPendent) }}
                            </div>
                        </template>
                    </Column>

                    <Column field="quantitatRebuda" :header="$t('OF.Quantitat rebuda')">
                        <template #body="{ data }">
                            <div style="width: 100%; text-align: right;">
                                {{ $n(data.quantitatRebuda) }}
                            </div>
                        </template>
                    </Column>

                    
                    <Column field="acumulatAnterior" :header="$t('OF.Acumulat anterior')">
                        <template #body="{ data }">
                            <div style="width: 100%; text-align: right;">
                                {{ $n(data.acumulatAnterior) }}
                            </div>
                        </template>
                    </Column>

                    <Column field="acumulatActual" :header="$t('OF.Acumulat actual')">
                        <template #body="{ data }">
                            <div style="width: 100%; text-align: right;">
                                {{ $n(data.acumulatActual) }}
                            </div>
                        </template>
                    </Column>
                    
                    <Column field="isStockSeguretat" :header="$t('OF.Stock seguretat')" style="max-width: 125px;">
                        <template #body="{ data }">
                            <span v-if="data.isStockSeguretat">{{ $t('App.Si') }}</span>
                            <span v-else>{{ $t('App.No') }}</span>
                        </template>
                    </Column>
                    
                </DataTable>
            </div>
        </Panel>

    </Dialog>
</template>

<script>
import { carrega } from '@/services/loader';
import ofService from '@/services/of.service';
import { onMounted, onBeforeUnmount, ref, watch, nextTick, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ExcelExporter } from '@/utils/ExcelExporter';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import ButtonShortcut from '../ButtonShortcut.vue';
import { usePermisosStore } from '@/stores/permisos';

export default {
    name: 'DetallOrdreFabricacio',
    props: {
        artInt: String,
        cliCod: String,
        numOF: Number,
        articleClient: String,
        fabrica: String,
        recarrega: Function,
    },
    setup(props, { emit }) {
        const { t, d, n } = useI18n();
        const permisosStore = usePermisosStore();
        const terminis = ref([]);
        const capsalera = ref();
        const visible = ref(true);
        const isOFActual = ref(true);
        const visibleDialogDetallOF = ref(false);
        const dialogRef = ref(null);
        const toast = useToast();
        const confirm = useConfirm();
        const dateLimit = computed(() => {
        const raw = capsalera?.value?.dataLimitIncrement;
            const date = new Date(raw);
            if (isNaN(date.getTime())) return '';
            return d(date, 'short');
        });

        const isPotAnularOf = computed(() => {
            if (!capsalera.value) return false;
            if (capsalera.value.isAnulada) return false;
            const esNormalitzat = capsalera.value.articleClient.normalitzat === true;
            const noTePosterior = !capsalera.value.ofPosterior;
            const tePermis = permisosStore.tePermis('OFS', 'ANULAR');
            return esNormalitzat && noTePosterior && tePermis;
        });
        
        const variacio = computed(() => {
            if (!terminis.value || terminis.value.length === 0) return 0;

            const ultim = terminis.value[terminis.value.length - 1];
            const diff = ultim.acumulatActual - ultim.acumulatAnterior;

            return n(diff);
        });

        const variacioFormat = computed(() => {
            const v = variacio.value;
            if (v > 0) return `+${v}`;
            if (v < 0) return `${v}`; // ya lleva el -
            return '0';
        });

        const colorVariacio = computed(() => {
            if (variacio.value > 0) return 'green';
            if (variacio.value < 0) return 'red';
            return 'black';
        });


        const focusDialog = async () => {
            await nextTick();
            if (document.activeElement && document.activeElement !== document.body) {
                document.activeElement.blur();
            }
            dialogRef.value?.focus();
        };

        const loadOF = async (numOF) => {
            const of = await carrega(ofService.obtenirOFByNumOF(numOF));
            terminis.value = of.terminis;
            capsalera.value = of;
        };

        onMounted(async () => {
            carregaOF();
            window.addEventListener('keydown', keyHandler);
        });

        const carregaOF = async () => {
            if (props.numOF === undefined) {
                const of = await carrega(ofService.obtenirOFByArtCli(props.artInt, props.cliCod));
                terminis.value = of.terminis;
                capsalera.value = of;
            } else {
                await loadOF(props.numOF);
            }
        }

        onBeforeUnmount(() => {
            window.removeEventListener('keydown', keyHandler);
        });

        const keyHandler = async (ev) => {
            if (!visible.value || !capsalera.value) return;

            if (ev.key === 'ArrowRight' && capsalera.value.ofPosterior) {
                ev.preventDefault();
                await loadOF(capsalera.value.ofPosterior);
            } else if (ev.key === 'ArrowLeft' && capsalera.value.ofAnterior) {
                ev.preventDefault();
                await loadOF(capsalera.value.ofAnterior);
            }
        };

        watch(() => capsalera.value, (novaCapsalera) => {
                if (!novaCapsalera) {
                    isOFActual.value = true;
                    return;
                }

                const anterior = novaCapsalera.ofAnterior ?? 0;
                const posterior = novaCapsalera.ofPosterior ?? 0;

                if ((anterior === 0 || anterior == null) && (posterior === 0 || posterior == null)) {
                    isOFActual.value = true;
                }
                else if (posterior === 0 || posterior == null) {
                    isOFActual.value = true;
                }
                else {
                    isOFActual.value = false;
                }
            },
            { immediate: true }
        );

        const carregaOFActual = async (artInt, cliCod) => {
            const of = await carrega(ofService.obtenirOFByArtCli(artInt, cliCod));
            terminis.value = of.terminis;
            capsalera.value = of;
        };

        const hide = () => {
            emit('update:carregat', false);
        };

        const exportarTaula = (artCli) => {
            const configuracioExcel = {
                dades: terminis.value,
                columnes: [
                    { titol: t('OF.Data'), valor: linia => linia.data ? d(new Date(linia.data), 'short') : '', width: 15 },
                    { titol: t('OF.Quantitat'), valor: linia => n(linia.quantitat), format: 'numeric', decimals: 0, width: 15 },
                    { titol: t('OF.Quantitat anterior'), valor: linia => n(linia.quantitatAnterior), format: 'numeric', decimals: 0, width: 15 },
                    { titol: t('OF.Quantitat pendent'), valor: linia => n(linia.quantitatPendent), format: 'numeric', decimals: 0, width: 15 },
                    { titol: t('OF.Quantitat rebuda'), valor: linia => n(linia.quantitatRebuda), format: 'numeric', decimals: 0, width: 15 },
                    { titol: t('OF.Pendent'), valor: linia => linia.isPendent ? t('App.Si') : t('App.No'), width: 10 },
                    { titol: t('OF.Stock seguretat'), valor: linia => linia.isStockSeguretat ? t('App.Si') : t('App.No'), width: 15 }
                ]
            };

            ExcelExporter.export({
                filename: artCli + '_' + t('OF.OrdresFabricacioExcel') + '.xlsx',
                configuracioExcel
            });
        };

        const estilRow = (data) => {
            return [{ estilRow: true, stockseguretat: data.isStockSeguretat, liniaservida: data.quantitatPendent === 0 }];
        };

        const anularOF = () => {
            carregaOFActual(props.artInt, props.cliCod);
            confirm.require({
                header: t("App.Confirmacio"),
                message: t("OF.Confirm Anula OF"),
                icon: "pi pi-exclamation-triangle",
                accept: async () => {
                    await carrega(ofService.anularOF(capsalera.value.numero))
                        .then(() => {
                            toast.add({
                                severity: "success",
                                summary: t("OF.AnuladaCorrectament"),
                                life: 4000
                            });
                            carregaOF();
                            props.recarrega();
                        });
                }
            });
        };

        return {
            t,
            d,
            terminis,
            capsalera,
            visible,
            hide,
            isOFActual,
            props,
            isPotAnularOf,
            carregaOFActual,
            exportarTaula,
            visibleDialogDetallOF,
            focusDialog,
            estilRow,
            anularOF,
            ButtonShortcut,
            loadOF,
            colorVariacio,
            variacio,
            variacioFormat,
            dateLimit
        };
    }
};
</script>

<style scoped>
::v-deep(.p-panel-header) {
    padding: 0.5rem;
}

.capsalera {
    display: flex;
    flex-direction: column;
    gap: 12px;
    /* margin-bottom: 10px; */
}

.capsalera-item {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    border: 1px solid #ccc;
    padding: 12px;
    border-radius: 6px;
    background-color: #fafafa;
}


.fila {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-left: 5px;
    margin-right: 5px;
}

.avisNoDataAvui {
    margin: 10px 25px 10px 25px;
    border: 1px solid #ffb515;
    background-color: #f5c55e;
    padding: 4px;
    border-radius: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.label {
    font-weight: bold;
}

::v-deep(.liniaservida) {
    background-color:#ebf7f7 !important;
}

::v-deep(.p-highlight.liniaservida) {
    background-color: #c0e2e4!important;
}

::v-deep(.stockseguretat) {
    background-color:#ffd093 !important;
}

::v-deep(.p-highlight.stockseguretat) {
    background-color: rgb(247, 174, 80)!important;
}

</style>