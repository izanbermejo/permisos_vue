<template>
    <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :header="' '"
        style="width: 560px">
        <template #header>
            <div style="font-size: larger; font-weight: 600; float: left;">
                <i class="pi pi-window-maximize"></i>
                <span style="margin-left: 10px;">
                    {{
                        isEdicio ? $t("Comandes.Modifica Stock Seguretat")+ `: ${refArticleClient}` 
                        : $t("Comandes.Crea Stock Seguretat") + `: ${refArticleClient}`
                    }}
                </span>
            </div>
        </template>
        <div class="form" style="margin-top: 10px;">
            <Panel style="width: 100%; margin-top: 10px;">
                <template #header>
                    <span class="p-panel-title">
                        {{ $t('Comandes.Informacio linia') }}
                    </span>
                </template>
                <div class="form">
                    <div class="element-form">
                        <label>{{ $t('Comandes.Data solicitada') }}</label>
                        <span>
                            <CalendarInput v-model="state.dataSolicitada"
                                @update:modelValue="actualitzaEstat('dataSolicitada')" showWeek
                                :invalid="v.dataSolicitada.$errors.length" ref="inputDataSolicitada"
                                @keypress.enter="handleEnter('dataSolicitada')" />
                            <SetmanaInput v-model="state.setmana"
                                @update:modelValue="actualitzaEstat('setmana')"
                                @keypress.enter="handleEnter('setmana')" inputStyle="margin-left:10px; width: 35px;"/>
                        </span>
                        <small v-if="(v.dataSolicitada.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit')}}</small>
                    </div>
                    <div class="element-form">
                        <label>{{ $t('Comandes.Quantitat') }}</label>
                        <InputNumber v-model="state.quantitat" ref="inputQuantitat" mode="decimal" :maxFractionDigits="0" :min=minQuantitat
                            @input="state.quantitat = $event.value" @keypress.enter="guarda"
                            :locale="locale" @focus="$event.originalTarget.select();" />
                        <small v-if="(v.quantitat.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit')}}</small>
                    </div>
                    <div class="break" />
                    <div class="element-form">
                        <label>{{ $t('Comandes.Tipus') }}</label>
                        <SelectButton v-model="state.stockSeguretatClient" :options="opcionsstockSeguretatClient"
                            optionValue="clau" @keypress.enter="guarda">
                            <template #option="slotProps">
                                <!--<img :src="require(`@/assets/${slotProps.option.icon}.png`)" height="24" />-->
                                <label style="margin-left: 4px">{{ slotProps.option.valor }}</label>
                            </template>
                        </SelectButton>
                        <small v-if="(v.stockSeguretatClient.$errors.length)"
                            class="p-error text-nowrap">{{ $t('App.Valor requerit')}}</small>
                    </div>
                </div>
            </Panel>
            <div class="break" />
            <div style="margin-left: auto; margin-right: 0; margin-top:10px">
                <ButtonShortcut tabindex="-1" :literal="$t('App.Cancela')" icon="fa-solid fa-undo" :shortcut="'[Esc]'"
                    class="p-button-secondary p-button-sm" @click="hide" />
                <ButtonShortcut @click="guarda" :literal="$t('App.Desa')" icon="fa-solid fa-save" :shortcut="'[Enter]'"
                    style="margin-left: 10px;" />
            </div>
        </div>
    </Dialog>
</template>

<script>
import { onMounted, ref, computed, reactive, nextTick, toRef } from "vue";
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import useVuelidate from "@vuelidate/core";
import { required, minValue } from '@vuelidate/validators';
import moment from "moment";
import { useI18n } from "vue-i18n";
import comandesService from "@/services/comandes.service";
import { carrega } from "@/services/loader";
import { equals } from "@/utils/objectUtils";
import { calcularDiaSortida } from "@/utils/CalcularDiaSortida";
import { dataDeSetmana } from "@/utils/dateUtils";

export default {
    name: "CreaStockSeguretat",
    components: {
    },
    props: {
        callbackOk: Function,
        articleClient: String,
        teclaObrirModal: String,
    },
    setup(props, { emit }) {
        const { t, locale } = useI18n();
        const visible = ref(true);
        const confirmVisible = ref(false);
        const refArticleClient = toRef(props, 'articleClient');
        const infoArticle = ref();
        const textMostrar = ref('');
        const inputDataSolicitada = ref();
        let isInicialitzacio = true;
        const canviIntern = ref(false); // per evitar loops a l'actualitzarEstat
        const titol = ref('');
        const isEdicio = ref(false)
        const inputQuantitat = ref();
        const prevValues = reactive({
            dataSolicitada: null,
            setmana: 0,
        });
        const diesTransitClient = computed(() => infoArticle.value?.diesTransitClient);
        const diesSortida = computed(() => infoArticle.value?.diesSortida);
        const diesTransitEntreMagatzems = computed(() => infoArticle.value?.diesTransitEntreMagatzems);
        const teclaObrirModal = computed(() => props?.teclaObrirModal);

        const state = reactive({
            quantitat: 0,
            dataSolicitada: null,
            setmana: 0,
            stockSeguretatClient: true,
        });

        const validDate = (value) => {
            if (value)
                return (value instanceof Date);
            return true;
        }

        const minQuantitat = computed(() => isEdicio.value ? 0 : 1);

        const rules = computed(() => ({
            quantitat: { required, min: minValue(minQuantitat.value) },
            dataSolicitada: { required, valid: validDate },
            stockSeguretatClient: { required },
        }));

        const v = useVuelidate(rules, state);

        onMounted(async () => {
            document.addEventListener("keydown", handler);
            infoArticle.value = await carrega(comandesService.obtenirArticleClient(refArticleClient.value));
            await checkStockSeguretat();
            nextTick(() => {
                if (teclaObrirModal.value === 'space') {
                inputQuantitat.value.$el.firstChild.focus();
                } else {
                inputDataSolicitada.value.$el.firstChild.focus();
                }
            });
        });

        const inicialitza = async () => {
            state.quantitat = 0;
            state.dataSolicitada = new Date();
            state.setmana = moment(state.dataSolicitada).isoWeek();
            state.stockSeguretatClient = true;
            prevValues.dataSolicitada = state.dataSolicitada;
            prevValues.setmana = state.setmana;
            isInicialitzacio = false;
        }

        const hide = () => {
            emit('update:teclaObrirModal', '');
            emit("update:carregat", false);
        };

        const modalVisible = computed(() => {
            return confirmVisible.value;
        });

        const checkStockSeguretat = async () => {
            let stockSeguretat = await carrega(comandesService.obtenirStockSeguretat(refArticleClient.value));

            if (stockSeguretat) {
                isEdicio.value = true;
                state.quantitat = stockSeguretat.quantitat;
                state.dataSolicitada = new Date(stockSeguretat.dataSolicitada);
                state.setmana = moment(state.dataSolicitada).isoWeek();
                state.stockSeguretatClient = stockSeguretat.stockSeguretatClient;
                isInicialitzacio = false;
            } else {
                isEdicio.value = false;
                inicialitza();
            }
        };

        const actualitzaEstat = async (elementModificat) => {
            if (isInicialitzacio || canviIntern.value)
                return;
            if (elementModificat === 'dataSolicitada') {
                // Cal comprovar que la data sol·licitada és una data valida
                if (state.dataSolicitada instanceof Date) {
                    canviIntern.value = true;
                    // Si es canvia la data sol·licitada canvia la data prevista de sortida, la setmana i la data de magatzem intermig si cal
                    state.dataPrevistaSortida = new Date(calcularDiaSortida(state.dataSolicitada, diesTransitClient.value, diesSortida.value));
                    state.setmana = moment(state.dataSolicitada).isoWeek();
                    if (infoArticle.value?.necessitaMagatzemIntermig) {
                        state.dataPrevistaSortidaInterna = new Date(calcularDiaSortida(state.dataPrevistaSortida, diesTransitEntreMagatzems.value));
                    }
                    canviIntern.value = false;
                }
            }
            if (elementModificat === 'setmana') {
                if (state.dataSolicitada == null || !(state.dataSolicitada instanceof Date)) {
                    state.dataSolicitada = new Date();
                }
                // Comprovar si ha canviat la setmana (per no fer el recàlcul de la data)
                const semanaDeDataSolicitada = moment(state.dataSolicitada).isoWeek();
                // Només canviem la data en casa que la setmana hagi canviat
                if (semanaDeDataSolicitada !== state.setmana) {
                    canviIntern.value = true;
                    // La setmana s'entén dins l'any de la data sol·licitada; només es canvia d'any si cal
                    const novaData = dataDeSetmana(state.setmana, state.dataSolicitada);
                    if (novaData) {
                        state.dataSolicitada = novaData;
                        // Si s'ha demanat la 53 en un any que no en té, s'ha agafat l'última setmana
                        state.setmana = moment(state.dataSolicitada).isoWeek();
                        state.dataPrevistaSortida = new Date(calcularDiaSortida(state.dataSolicitada, diesTransitClient.value, diesSortida.value));
                        if (infoArticle.value.necessitaMagatzemIntermig) {
                            state.dataPrevistaSortidaInterna = new Date(calcularDiaSortida(state.dataPrevistaSortida, diesTransitEntreMagatzems.value));
                        }
                    } else {
                        // Setmana no valida: es manté la data i es restaura la setmana que li correspon
                        state.setmana = semanaDeDataSolicitada;
                    }
                    canviIntern.value = false;
                }
            }
            prevValues.dataSolicitada = state.dataSolicitada;
            prevValues.setmana = state.setmana;
        }

        const guarda = async () => {
            // Validació
            v.value.$reset();
            await v.value.$validate();
            if (!v.value.$error) {
                props.callbackOk(state);
            }
        }

        const handler = (ev) => {
            // No processem l'event en cas que es produeixi des d'un ContextMenu
            if (isContextMenuKey(ev)) return;
            // Si no hi ha cap modal obert
            if (modalVisible.value) return;
            // Controls
            if (ev.key === 'Escape') {
                actionHandler(ev, () => hide());
            }
        }


        const actionHandler = (ev, action) => {
            ev.preventDefault();
            action();
        }

        const handleEnter = async (elementModificat) => {
            const actualValue = state[elementModificat];
            const prevValue = prevValues[elementModificat];
            if (!equals(actualValue, prevValue)) {
                await actualitzaEstat(elementModificat);
            }
            await guarda();
        }

        return {
            props,
            locale,
            visible,
            hide,
            state,
            rules,
            v,
            guarda,
            textMostrar,
            refArticleClient,
            infoArticle,
            actualitzaEstat,
            handleEnter,
            inputDataSolicitada,
            opcionsstockSeguretatClient: [
                { clau: true, valor: t("Comandes.Client") },
                { clau: false, valor: t("Comandes.Ames") }
            ],
            titol,
            isEdicio,
            minQuantitat,
            inputQuantitat
        }
    },
}
</script>


<style scoped>
::v-deep(.p-panel-header) {
    padding: 0.5rem;
}

::v-deep(.p-panel .p-panel-content) {
    padding: 0rem 0.5rem 0.5rem 0.5rem;
}

.form {
    margin-top: 2px;
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px 30px;
}

.element-form>label {
    display: block;
    font-weight: 600;
    font-size: 1rem;
}

.element-form>small {
    display: block;
}

.break {
    flex-basis: 100%;
    height: 0;
}

.ellipsis {
    display: inline-block;
    max-width: 270px;
    /* ajusta según necesidad */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>