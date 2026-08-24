<template>
    <UltimsAlbarans v-if="visibleUltimsAlbarans" :carregat="visibleUltimsAlbarans"
        @update:carregat="visibleUltimsAlbarans = $event;" :teEdi="true" :albarans="infoEDI.ultimsAlbarans"
        :artint="props.artInt" :clicod="props.cliCod" :albaraReferenciaClient="infoEDI.albaraReferenciaClient"
        @canviatUltimAlbara="carregaLinies($event)" />
    <EditorComentaris v-if="visibleModalComentarisInterns" :carregat="visibleModalComentarisInterns" @update:carregat="visibleModalComentarisInterns = $event;"
      :text="registreSeleccionat.comentarisInterns" :callback="updateComentarisInterns" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
    <EditorComentaris v-if="visibleModalComentarisClient" :carregat="visibleModalComentarisClient" @update:carregat="visibleModalComentarisClient = $event;"
      :text="registreSeleccionat.comentarisClient" :callback="updateComentarisClient" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
    <CrearEditarLiniaComanda v-if="visibleCrearEditarLiniaComanda" :carregat="visibleCrearEditarLiniaComanda" 
      @update:carregat="visibleCrearEditarLiniaComanda = $event" :dataSolicitada="registreSeleccionat?.dataSolicitada" :tipus="registreSeleccionat?.tipus"
      :linia="registreSeleccionat" :callbackGuardarOk="carregaLinies" :comanda="registreSeleccionat.codi" :comandaClient="registreSeleccionat.comandaClient"
      :programa="registreSeleccionat.programa" :infoArticle="infoArticle" 
      :teclaObrirModal="teclaObrirModal" v-model:teclaObrirModal="teclaObrirModal" />
      <div>
        <div class="info-grid-header">

            <div class="info-cell">
                <label class="label-detall">{{ $t('ComandesEDI.linies.taula_liniesEDI.acumulat') }}:</label>
                <span class="texttitol">{{ $n(infoEDI?.acumulatNou ?? 0) }}</span>
            </div>

            <div class="info-cell">
                <label class="label-detall">{{ $t('ComandesEDI.linies.taula_liniesEDI.acumulatActual') }}:</label>
                <span class="texttitol">{{ $n(infoEDI?.acumulatActual ?? 0) }}</span>
            </div>

            <div class="info-cell">
                <label class="label-detall">{{ $t('ComandesEDI.percent') }}:</label>
                <span class="texttitol" :style="{ color: colorVariacio }">
                    {{ $n(infoEDI?.percent ?? 0) + '%' + ' (' + $n(infoEDI?.diferencia ?? 0) + ') ' ?? '' }}
                </span>
            </div>

            <!--
                De moment ho treiem, ja que aporta informació de més i ara mateix no es necessariaria. Si més endavant veiem que és útil, la podem tornar a posar.
                <div class="info-cell">
                    <Button v-if="liniesTransit.length > 0" :label="`${$t('ComandesEDI.liniesTransit')} (${liniesTransit.length})`" icon="pi pi-truck" @click="visibleTransit = true" style="height: 37px; background-color: ;"/>
                    <Button v-if="liniesDeute.length > 0" :label="`${$t('ComandesEDI.liniesDeute')} (${liniesDeute.length})`" icon="pi pi-exclamation-circle" @click="visibleDeute = true" style="height: 37px;"/>
                </div> 
            -->

        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; height: 35px;">
            <Button :label="'PDF Ames'" icon="pi pi-file-pdf" class="p-button-sm" @click="clickDescarregaFormatPdf()" />
            <Button @click="visibleUltimsAlbarans = true" icon="pi pi-eye" :label="$t('Comandes.Ultims albarans') + ' [ctrl+5]'"
                style="height: 37px;" />
            <Button @click="processarComandaEdi()" icon="pi pi-check-circle" :label="$t('Comandes.ProcessarComanda') + ' [ctrl+g]'"
                style="background-color: green; border-color: green; height: 37px;" />
            <Button @click="esborrarLiniaEDI()" icon="pi pi-trash" :label="$t('ComandesEDI.menuregistre.esborrar') + ' [ctrl+x]'"
                style="background-color: red; border-color: red; height: 37px;" />
            <Checkbox v-model="ocultarNeutres" :binary="true" inputId="ocultarNeutres" />
            <label for="ocultarNeutres" style="cursor: pointer; font-size: 0.875rem;">
                {{ $t('ComandesEDI.ocultarNeutres') }}
            </label>
        </div>

        <DataTable v-model:expandedRows="expandedRows" :value="liniesComandaFiltrades" class="p-datatable-sm"
            dataKey="key" :scrollable="true" scrollHeight="50vh" :resizableColumns="true" columnResizeMode="expand"
            showGridlines :rowClass="(row) => row.isNeutre ? 'estilRow estilNeutre' : 'estilRow'" :paginator="false"
            @dblclick="window?.getSelection()?.removeAllRanges(); !isLiniaEDI(registreSeleccionat) && clickEditarLiniaComanda()"
            :rows="15" :rowsPerPageOptions="[15, 30, 50]" :sortField="sortField" :sortOrder="sortOrder" @sort="onSort"
            v-model:selection="registreSeleccionat" selectionMode="single" @row-select="selectedIndex = $event.index">
            <template #empty>
                <div style="width: 100%; height: 20vh; text-align: center; padding-top: 30px;">
                    <InfoTaulaBuida class="info-taula-buida" :icon="'fa-solid fa-info'" :literal="$t('EDI.Cap comanda')" />
                </div>
            </template>

            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.codiComandaLiniaClientEDI')"
                style="max-width: 130px;">
                <template #body="{ data }">{{ data.comandaClient }}</template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.codiComandaLiniaClient')" style="max-width: 130px;">
                <template #body="{ data }">{{ data.comandaClientActual }}</template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.tipus')" style="max-width: 45px;">
                <template #body="{ data }">
                    <div style="text-align: center;">
                        <ColumnaTipusComanda :tipus="data.tipusLiniaComanda" />
                    </div>
                </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.quantitat')" style="max-width: 125px;">
                <template #body="{ data }">
                    <div style="width: 100%; text-align: right;">
                        {{ $n(data.quantitatNova) }}
                    </div>
                </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.quantitatactual')" style="max-width: 130px;">
                <template #body="{ data }">
                    <div style="width: 100%; text-align: right;" v-tooltip="$n(data.quantitatNova)">
                        {{ $n(data.quantitatActual) }}
                    </div>
                </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.dataclient')" style="max-width: 155px;"
                field="dataSolicitada">
                <template #body="{ data }">
                    {{ data.dataSolicitada ? $d(data.dataSolicitada, 'short') : '-' }}
                </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.dataames')" style="max-width: 350px;">
                <template #body="{ data }">
                    {{ $d($toDate(data.dataSortida), 'short') }}
                    <span v-if="data.dataPrevistaSortidaInterna">
                        {{ '&nbsp;⇐&nbsp; ' + $d($toDate(data.dataPrevistaSortidaInterna), 'short') }}
                    </span>
                </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.dataConfirmada')"
                style="width: 140px; max-width: 130px;">
                <template #body="{ data }">
                    {{ data.dataConfirmada ? $d(data.dataConfirmada, 'short') : '-' }}
                </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.acumulat')" style="max-width: 115px;">
                <template #body="{ data }">
                    <div style="width: 100%; text-align: right;">
                        {{ data.isNeutre ? "-" : $n(data.acumulatNova) }}
                    </div>
                </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.acumulatActual')"
                style="width: 120px; max-width: 130px;">
                <template #body="{ data }">
                    <div style="width: 100%; text-align: right;" v-tooltip="$n(data.acumulatNova)">
                        {{ data.isNeutre ? "-" : $n(data.acumulatActual) }}
                    </div>
                </template>
            </Column>
            <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" :header="$t('Comandes.Int')">
                <template #body="{data}">
                    <div style="width: 100%;">
                    <Button icon="pi pi-comments" @click="registreSeleccionat = data; visibleModalComentarisInterns = true"
                        class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.comentarisInterns}" />
                    </div>
                </template>
            </Column>
            <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" :header="$t('Comandes.Ext')">
                <template #body="{data}">
                    <div style="width: 100%;">
                    <Button icon="pi pi-megaphone" @click="registreSeleccionat = data; visibleModalComentarisClient = true"
                        class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.comentarisClient}" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="visibleTransit" modal :closable="true" :header="$t('ComandesEDI.linies transit')"
            style="width: 400px;">
            <DataTable :value="liniesTransit" class="p-datatable-sm" showGridlines>
                <template #empty>
                    <div style="text-align: center; padding: 20px;">
                        <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('EDI.Cap comanda')" />
                    </div>
                </template>
                <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.dataclient')" style="width: 160px;">
                    <template #body="{ data }">
                        {{ data.dataSolicitada ? $d(data.dataSolicitada, 'short') : '-' }}
                    </template>
                </Column>
                <Column :header="$t('ComandesEDI.quantitat')" style="width: 120px;">
                    <template #body="{ data }">
                        <div style="text-align: right;">{{ $n(data.quantitat) }}</div>
                    </template>
                </Column>
                <Column :header="$t('ComandesEDI.ratio')" style="width: 120px;">
                    <template #body="{ data }">
                        <div style="text-align: right;">{{ $t(data.ratio) }}</div>
                    </template>
                </Column>
            </DataTable>
        </Dialog>

        <Dialog v-model:visible="visibleDeute" modal :closable="true" :header="$t('ComandesEDI.linies deute')"
            style="width: 500px;">
            <DataTable :value="liniesDeute" class="p-datatable-sm" showGridlines>
                <template #empty>
                    <div style="text-align: center; padding: 20px;">
                        <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('EDI.Cap comanda')" />
                    </div>
                </template>
                <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.dataclient')" style="width: 160px;">
                    <template #body="{ data }">
                        {{ data.dataSolicitada ? $d(data.dataSolicitada, 'short') : '-' }}
                    </template>
                </Column>
                <Column :header="$t('ComandesEDI.quantitat')" style="width: 120px;">
                    <template #body="{ data }">
                        <div style="text-align: right;">{{ $n(data.quantitat ?? 0) }}</div>
                    </template>
                </Column>
                <Column :header="$t('ComandesEDI.ratio')" style="width: 120px;">
                    <template #body="{ data }">
                        <div style="text-align: right;">{{ $t(data.ratio ?? '-') }}</div>
                    </template>
                </Column>
            </DataTable>
        </Dialog>
    </div>
</template>

<script>
import ColumnaTipusComanda from '@/components/ColumnaTipusComanda.vue';
import EDIService from '@/services/edi.service';
import { carrega } from '@/services/loader';
import { ref, watch, onMounted, computed, onUnmounted } from 'vue';
import UltimsAlbarans from '@/views/modals/AjudaUltimsAlbarans.vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import { usePermisosStore } from '@/stores/permisos';
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import ComandesService from '@/services/comandes.service';
import CrearEditarLiniaComanda from '@/views/modals/CrearEditarLiniaComanda.vue';
import { saveAs } from 'file-saver';

export default {
    name: 'GridProcessarComandaEdi',

    components: {
        ColumnaTipusComanda,
        UltimsAlbarans,
        EditorComentaris,
        CrearEditarLiniaComanda
    },

    props: {
        idMissatge: Number,
        idComanda: Number,
        artInt: String,
        cliCod: String,
        info: Object,
        codiMissatge: String
    },

    /* data() {
        return {
            sortField: localStorage.getItem('sortField') || 'dataSolicitada',
            sortOrder: parseInt(localStorage.getItem('sortOrder')) || 1,
        };
    }, */

    methods: {
        onSort(event) {
            this.sortField = event.sortField;
            this.sortOrder = event.sortOrder;
            localStorage.setItem('sortField', event.sortField);
            localStorage.setItem('sortOrder', event.sortOrder);
        }
    },

    setup(props, { emit }) {
        const { t } = useI18n();
        const liniesComanda = ref([]);
        const liniesTransit = ref([]);
        const liniesDeute = ref([]);
        const expandedRows = ref([]);
        const registreSeleccionat = ref();
        const selectedIndex = ref(-1);
        const visibleTransit = ref(false);
        const visibleDeute = ref(false);
        const infoEDI = ref([]);
        const ocultarNeutres = ref(false);
        const visibleUltimsAlbarans = ref(false);
        const toast = useToast();
        const visibleModalComentarisInterns = ref(false);
        const visibleModalComentarisClient = ref(false);
        const permisosStore = usePermisosStore();
        const visibleCrearEditarLiniaComanda = ref(false);
        const infoArticle = ref(null);
        watch(visibleUltimsAlbarans, (newValue) => {
            emit('modalObert', newValue);
        });

        watch(infoEDI, (nuevo) => {
            if (infoEDI.value.isConsiderarAcumulats) {
                if (!nuevo.ultimsAlbarans.isAcumulatClientMateixReferencia) {
                    Swal.fire({
                        allowOutsideClick: false,
                        didOpen: () => Swal.getConfirmButton().focus(),
                        icon: 'warning',
                        title: t('App.Atencio'),
                        text: t('ModalAjudaLlitatAlabarans.EDI.error.acumulat')
                    });
                }
            }
        }, { immediate: true });

        watch(infoEDI, (nuevo) => {
            if (infoEDI.value.isConsiderarUltimsAlbarans) {
                if (nuevo.ultimsAlbarans.albaraEnTransit === 0) {
                    Swal.fire({
                        allowOutsideClick: false,
                        didOpen: () => Swal.getConfirmButton().focus(),
                        icon: 'warning',
                        title: t('App.Atencio'),
                        text: t('ModalAjudaLlistatAlbarans.EDI.error.albara_transit')
                    });
                }
            }
        }, { immediate: true });

        const clickDescarregaFormatPdf = async () => {
            let resp = await (carrega(EDIService.descarregaFormatPdfAmesEdi2(props.idMissatge)));
            saveAs(new Blob([resp]), props.codiMissatge + '.pdf');
        }

        const colorVariacio = computed(() => {
            if (infoEDI?.value.diferencia > 0) return 'green';
            if (infoEDI?.value.diferencia < 0) return 'red';
            return 'black';
        });

        const liniesComandaFiltrades = computed(() =>
            ocultarNeutres.value
                ? liniesComanda.value.filter(l => !l.isNeutre)
                : liniesComanda.value
        );

        const carregaLinies = async (nouUltimAlbara) => {
            const resposta = await carrega(
                EDIService.obtenirComandaPerProcessar(props.idMissatge, props.idComanda, nouUltimAlbara)
            );
            liniesComanda.value = (resposta.liniesComanda ?? []).map((row, index) => ({
                ...row,
                key: row.clauLinia
                    ? `${row.clauLinia.comanda}_${row.clauLinia.numero}`
                    : `nou_${index}`, 
                }));
            liniesTransit.value = await resposta.liniesTransit ?? [];
            liniesDeute.value = await resposta.liniesDeute ?? [];
            infoEDI.value = await resposta ?? [];
            console.log('infoEDI.value:', infoEDI.value);
        };

        watch(() => [props.idMissatge, props.idComanda], ([newMissatge, newComanda]) => {
            if (newMissatge && newComanda) carregaLinies();
        });

        const isLiniaEDI = (line) => !line?.comandaClientActual;

        const processarComandaEdi = async () => {
            const request = {
                idMissatge: props.idMissatge,
                idComanda: props.idComanda,
                artInt: props.artInt,
                cliCod: props.cliCod,
                linies: liniesComanda.value.map(l => ({
                    clauLinia: l.clauLinia,
                    comandaClient: l.comandaClient,
                    quantitat: l.quantitatNova,
                    tipus: l.tipusLiniaComanda,
                    dataSolicitada: l.dataSolicitada,
                    dataPrevistaSortida: l.dataSortida,
                    dataPrevistaSortidaInterna: l.dataPrevistaSortidaInterna,
                    comentarisInterns: l.comentarisInterns,
                    comentarisClient: l.comentarisClient
                }))
            };
            await carrega(EDIService.processarComandaEdi(request));
            toast.add({
                severity: "success",
                summary: t("OF.AnuladaCorrectament"),
                life: 4000
            });
            emit('comandaProcessada', true);
        };

        const updateComentarisInterns = async (text) => {
            if (isLiniaEDI(registreSeleccionat.value)) {
                await carrega(EDIService.actualitzarComentarisInterns(props.idMissatge, registreSeleccionat.value.idLinia, props.idComanda, text));
            } else {
                await carrega(ComandesService.actualitzarComentarisInterns(registreSeleccionat.value.clauLinia.comanda, registreSeleccionat.value.clauLinia.numero, text));
            }
            registreSeleccionat.value.comentarisInterns = text;
        }

        const updateComentarisClient = async (text) => {
            if (isLiniaEDI(registreSeleccionat.value)) {
                await carrega(EDIService.actualitzarComentarisClient(props.idMissatge, registreSeleccionat.value.idLinia, props.idComanda, text));
            } else {
                await carrega(ComandesService.actualitzarComentarisClient(registreSeleccionat.value.clauLinia.comanda, registreSeleccionat.value.clauLinia.numero, text));
            }
            registreSeleccionat.value.comentarisClient = text;
        }

        const esborrarLiniaEDI = () => {
            Swal.fire({
                allowOutsideClick: false,
                didOpen: () => Swal.getConfirmButton().focus(),
                icon: 'warning',
                title: t('App.Atencio'),
                text: t('ComandaEDI.AvisEsborrarEDI'),
                showDenyButton: true,
                reverseButtons: true,
                confirmButtonText: t('App.Si'),
                denyButtonText: t('App.No')
            }).then((result) => {
                if (result.isConfirmed) {
                    EDIService.esborrarLiniaEDI(props.idMissatge, props.idComanda)
                        .then(() => {
                            toast.add({ severity: 'success', summary: t('ComandesEDI.linia esborrada correctament'), life: 3000 });
                            emit('comandaProcessada', true);
                        })
                }
            });

        }

        const clickEditarLiniaComanda = () => {
            if (registreSeleccionat.value && !isLiniaEDI(registreSeleccionat.value)) {
                infoArticle.value = {
                    ...props.info,
                    preu: registreSeleccionat.value.preu.valor,
                    divisa: registreSeleccionat.value.preu.divisa,
                    codiEmpresaClient: registreSeleccionat.value.codiEmpresaClient,
                    codiClient: props.cliCod,
                    magatzemSortidaDesc: props.info.magatzem.substring(7),
                    magatzemSortida: props.info.magatzem.substring(0, 4),
                    diesTransitClient: props.info.diesTransit,
                    diesSortida: props.info.diesSortida,
                    artint: props.artInt,
                    isPreuFixat: registreSeleccionat.value.isPreuFixat,
                    referencia: registreSeleccionat.value.referencia,
                    necessitaMagatzemIntermig: registreSeleccionat.value.necessitaMagatzemIntermig,
                    magatzemEntrada: registreSeleccionat.value.magatzemEntrada,
                    magatzemEntradaDesc: registreSeleccionat.value.magatzemEntradaDesc,
                    diesTransitEntreMagatzems: registreSeleccionat.value.diesTransitEntreMagatzems,
                };
                visibleCrearEditarLiniaComanda.value = true;
            }
        }

        onMounted(() => {
            document.addEventListener("keydown", handler);
            emit('comandaProcessada', false);
            carregaLinies();
        });

        onUnmounted(() => {
            document.removeEventListener("keydown", handler);
        });

        const handler = (event) => {
            if (event.ctrlKey && event.key === "x") {
                event.preventDefault();
                esborrarLiniaEDI();
            }
            if (event.ctrlKey && event.key === "5") {
                event.preventDefault();
                visibleUltimsAlbarans.value = true;
            }
            if (event.ctrlKey && event.key === "g") {
                event.preventDefault();
                processarComandaEdi();
            }
        };

        return {
            liniesComanda,
            liniesComandaFiltrades,
            liniesTransit,
            liniesDeute,
            expandedRows,
            registreSeleccionat,
            selectedIndex,
            visibleTransit,
            visibleDeute,
            carregaLinies,
            infoEDI,
            colorVariacio,
            ocultarNeutres,
            visibleUltimsAlbarans,
            props,
            processarComandaEdi,
            esborrarLiniaEDI,
            visibleModalComentarisClient,
            visibleModalComentarisInterns,
            permisosStore,
            updateComentarisInterns,
            updateComentarisClient,
            visibleCrearEditarLiniaComanda,
            clickEditarLiniaComanda,
            infoArticle,
            isLiniaEDI,
            clickDescarregaFormatPdf
        };
    },
};
</script>

<style scoped>
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

::v-deep(.estilNeutre td) {
    background-color: #acacacb9 !important;
}

.info-grid-header {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: auto;
    gap: 5px;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #fafafa;
    padding: 5px 0 10px 10px;
    margin-bottom: 10px;
}

.info-cell {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: fit-content;
}

.label-detall {
    font-weight: 600;
    font-size: 1rem;
}

.label-detall::after {
  content: "\00a0";
}

.info-taula-buida {
    white-space: break-spaces;
}

::v-deep(.estilRow .buttoicondisabled) {
    background-color: rgb(102, 102, 102);
    border-color: rgb(102, 102, 102);
}
</style>