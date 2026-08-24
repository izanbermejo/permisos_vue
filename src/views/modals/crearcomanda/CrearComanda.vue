<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :header="' '"
    style="width: 950px">
    <template #header>
      <div style="font-size: larger; font-weight: 600; float: left;">
        <i class="pi pi-window-maximize"></i>
        <span style="margin-left: 10px;"> {{ `${$t('Comandes.Nova comanda')}: ${refArticleClient} - ${infoArticle?.referencia}` }}</span>
      </div>
    </template>
      <div style="margin: 5px 0px 5px 0px;">
        <label style="font-weight: 600;">
          {{ $t('Comandes.Empresa') }}:
        </label>
        <span style="margin-left: 5px;">
          {{ $empresa(infoArticle?.codiEmpresaClient) }}
        </span>
      </div>
      <div class="form" style="margin-top: 5px;">
        <div class="element-form">
          <div style="display: flex; column-gap: 5px; align-items: center;">
            <label style="font-weight: 600; font-size: 1rem;"> {{ $t('Comandes.Comanda client') }} </label>
            <label style="color: grey; font-size: 0.8rem; vertical-align: bottom">[Ctrl + {{$t('App.Espai')}}]</label>
          </div>
          <InputText ref="inputComanda" v-model="state.comanda" @focus="$event.originalTarget.select()"
            @keypress.enter="guarda"
            style="width: 360px" />
          <small v-if="(v.comanda.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
        </div>
        <div class="element-form">
          <label> {{ $t('Comandes.Programa') }} </label>
          <InputText ref="inputPrograma" tabindex="-1" v-model="state.programa" @focus="$event.originalTarget.select()" style="width: 360px"
            @keypress.enter="guarda" />
        </div>
        <div class="break" />
        <Panel style="width: 100%; margin-top: 10px;">
          <template #header>
            <span class="p-panel-title">
              {{$t('Comandes.Informacio linia')}}
            </span>
          </template>
          <div class="form">
            <div class="element-form">
              <label>{{ $t('Comandes.Data solicitada')}}</label>
                <span>
                  <CalendarInput v-model="state.dataSolicitada"
                    @update:modelValue="actualitzaEstat('dataSolicitada')"  
                    @blur-confirmed="actualitzaEstat('dataSolicitada')"
                    @enter-confirmed="handleEnter('dataSolicitada')"
                    showWeek :invalid="v.dataSolicitada.$errors.length"/>
                    <SetmanaInput v-model="state.setmana"
                      @update:modelValue="actualitzaEstat('setmana')"
                      @blur-confirmed="actualitzaEstat('setmana')"
                      @enter-confirmed="handleEnter('setmana')" inputStyle="margin-left:10px; width: 35px;"/>
                </span>
                <small v-if="(v.dataSolicitada.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
            </div>
            <div class="element-form">
              <label>{{ $t('Comandes.Quantitat')}}</label>
              <InputNumber v-model="state.quantitat" mode="decimal" :maxFractionDigits="0" min="0"
                @input="state.quantitat = $event.value"
                @keypress.enter="guarda" :locale="locale" 
                @focus="$event.originalTarget.select();"/>
              <small v-if="(v.quantitat.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
            </div>
            <div class="break" />
            <div class="element-form">
              <label class="ellipsis" v-tooltip="infoArticle?.magatzemSortidaDesc">
                {{ $t('Comandes.Data sortida mag', [`${infoArticle?.magatzemSortida} - ${infoArticle?.magatzemSortidaDesc}`])}}
              </label>
              <CalendarInput v-model="state.dataPrevistaSortida"
                @update:modelValue="actualitzaEstat('dataPrevistaSortida')" 
                @blur-confirmed="actualitzaEstat('dataPrevistaSortida')"
                @enter-confirmed="handleEnter('dataPrevistaSortida')"
                showWeek :invalid="v.dataPrevistaSortida.$errors.length"/>
              <small v-if="(v.dataPrevistaSortida.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
            </div>
            <div class="element-form" v-show="infoArticle?.necessitaMagatzemIntermig">
              <label class="ellipsis" v-tooltip="infoArticle?.magatzemEntradaDesc">
                {{ $t('Comandes.Data sortida mag', [`${infoArticle?.magatzemEntrada} - ${infoArticle?.magatzemEntradaDesc}`])}}
              </label>
              <CalendarInput v-model="state.dataPrevistaSortidaInterna"
                @keypress.enter="guarda"
                showWeek :invalid="v.dataPrevistaSortidaInterna.$errors.length"/>
              <small v-if="(v.dataPrevistaSortidaInterna.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
            </div>
            <div class="break" />
            <div class="element-form">
              <label>{{ $t('Comandes.Data confirmada')}}</label>
              <CalendarInput v-model="state.dataConfirmadaFabrica" :invalid="v.dataConfirmadaFabrica.$errors.length"
                @keypress.enter="guarda" />
              <small v-if="(v.dataConfirmadaFabrica.$errors.length)" class="p-error text-nowrap">{{$t('App.Data incorrecte')}}</small>
            </div>
            <div class="break" />
            <div class="element-form">
              <label>{{ $t('Comandes.Preu')}}</label>
              <InputNumber v-model="state.preu" mode="decimal" :maxFractionDigits="3"
                @input="state.preu = $event.value"
                @keypress.enter="guarda" :locale="locale"
                @focus="$event.originalTarget.select();" />
              <Dropdown v-model="state.divisa" 
                :options="divisesDisponibles" optionLabel="label" optionValue="value"
                style="width: 95px; margin-left: 10px;"/>
            </div>
            <div class="element-form" style="display: flex; align-items: flex-end; margin-bottom: 6px;">
              <Checkbox v-model="state.isPreuFixat" :binary="true" />
              <label style="display: inline-block; margin-left: 5px;">{{ $t('Comandes.Preu fixat')}}</label>
            </div>
            <div class="break" />
            <div class="element-form">
              <label>{{ $t('Comandes.Tipus')}}</label>
              <SelectButton v-model="state.tipus" :options="opcionsTipus" optionValue="clau" @keypress.enter="guarda">
                <template #option="slotProps">
                  <img :src="require(`@/assets/${slotProps.option.icon}.png`)" height="24"/>
                  <label style="margin-left: 4px">{{ slotProps.option.valor }}</label>
                </template>
              </SelectButton>
              <small v-if="(v.tipus.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
            </div>
            <div class="break" />
            <div class="element-form">
              <label>{{ $t('Comandes.Comanda blanca')}}</label>
              <InputNumber v-model="state.comandaBlanca" mode="decimal" :maxFractionDigits="0" 
                @input="state.comandaBlanca = $event.value"
                @keypress.enter="guarda" :locale="locale"
                @focus="$event.originalTarget.select();" />
            </div>
          </div>
        </Panel>
        <div class="break" />
        <div style="margin-left: auto; margin-right: 0; margin-top:10px">
          <ButtonShortcut tabindex="-1" :literal="$t('App.Cancela')" icon="fa-solid fa-undo" :shortcut="'[Esc]'"  class="p-button-secondary p-button-sm" @click="hide" />
          <ButtonShortcut @click="guarda" :literal="$t('App.Desa')" icon="fa-solid fa-save" :shortcut="'[Enter]'" style="margin-left: 10px;"/>
        </div>
      </div>
  </Dialog>
</template>

<script>
import { onMounted, ref, computed, reactive, nextTick, toRef, inject } from "vue";
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import useVuelidate from "@vuelidate/core";
import { required, minValue, requiredIf } from '@vuelidate/validators';
import moment from "moment";
import { useI18n } from "vue-i18n";
import comandesService from "@/services/comandes.service";
import { carrega } from "@/services/loader";
import { useConfirm } from "primevue/useconfirm";
import { equals } from "@/utils/objectUtils";
import { calcularDiaSortida } from "@/utils/CalcularDiaSortida";
import { dataDeSetmana } from "@/utils/dateUtils";

export default {
  name: "CrearComanda",
  components: {
  },
  props: {
    callbackOk: Function,
    articleClient: String,
    obtenirComandaExistent: Function,
  },
  setup(props, { emit }) {
    const { t, d, locale } = useI18n();
    const toDate = inject('toDate');
    const visible = ref(true);
    const confirm = useConfirm();
    const confirmVisible = ref(false);
    const refArticleClient = toRef(props, 'articleClient');
    const infoArticle = ref();
    const diesTransitClient = computed(() => infoArticle.value.diesTransitClient);
    const diesSortida = computed(() => infoArticle.value.diesSortida);
    const diesTransitEntreMagatzems = computed(() => infoArticle.value.diesTransitEntreMagatzems);
    const textMostrar = ref('');
    const inputComanda = ref();
    const inputPrograma = ref();
    let isInicialitzacio = true;
    const canviIntern = ref(false); // per evitar loops a l'actualitzarEstat
    const divisesDisponibles = computed(() => {
      const d = state.divisa;
      if (!d) return [];
      const base = d.endsWith("%") ? d.replace("%", "") : d;
      return [
        { label: base, value: base },
        { label: base + "%", value: base + "%" }
      ];
    });

    const prevValues = reactive({
      dataSolicitada: null,
      setmana: 0,
      dataPrevistaSortida: null,
    });
    const state = reactive({
      comanda: '',
      programa: '',
      quantitat: 0,
      dataSolicitada: null,
      setmana: 0,
      dataPrevistaSortida: null,
      dataPrevistaSortidaInterna: null,
      dataConfirmadaFabrica : null,
      preu: null,
      divisa: null,
      isPreuFixat: false,
      tipus: 'FERM',
      comandaBlanca : null,
    });
    const validDate = (value) => {
      if (value)
        return (value instanceof Date);
      return true;
    }
    const rules = {
      comanda: { required },
      quantitat : { required, min: minValue(1) },
      dataSolicitada: { required, valid: validDate },
      dataPrevistaSortida: { required, valid: validDate },
      dataConfirmadaFabrica : { valid : validDate },
      dataPrevistaSortidaInterna: {
        requiredIfIntermig: requiredIf(() => infoArticle.value.necessitaMagatzemIntermig),
        valid: (value) => {
          return infoArticle.value.necessitaMagatzemIntermig ? validDate(value) : true;
        },
      },
      tipus: { required }
    };
    const v = useVuelidate(rules, state);

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      inicialitza();
      nextTick(() => {
        inputComanda.value.$el.focus();
      });
    });

    const inicialitza = async () => {
      // Càrrega de l'informació de l'article-client
      infoArticle.value = await carrega(comandesService.obtenirArticleClient(refArticleClient.value));
      // Preu i divisa
      state.preu = infoArticle.value.preu;
      state.divisa = infoArticle.value.divisa;
      // Dates
      state.dataSolicitada = new Date();
      state.setmana = moment(state.dataSolicitada).isoWeek();
      state.dataPrevistaSortida = new Date(calcularDiaSortida(new Date(), diesTransitClient.value, diesSortida.value));
      if (infoArticle.value.necessitaMagatzemIntermig) {
        state.dataPrevistaSortidaInterna = new Date(calcularDiaSortida(state.dataPrevistaSortida, diesTransitEntreMagatzems.value));
      }

      prevValues.dataSolicitada = state.dataSolicitada;
      prevValues.setmana = state.setmana;
      prevValues.dataPrevistaSortida = state.dataPrevistaSortida;
      nextTick(() => {
        isInicialitzacio = false;
      });
    }

    const hide = () => {
      emit("update:carregat", false);
    };

    const modalVisible = computed(() => {
      return confirmVisible.value;
    });

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
          if (infoArticle.value.necessitaMagatzemIntermig) {
            state.dataPrevistaSortidaInterna = new Date(calcularDiaSortida(state.dataPrevistaSortida, diesTransitEntreMagatzems.value));
          }
          canviIntern.value = false;
        }
      }
      if (elementModificat === 'setmana') {
        if (state.dataSolicitada==null || !(state.dataSolicitada instanceof Date)) {
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
      if (elementModificat === 'dataPrevistaSortida') {
        canviIntern.value = true;
        if ((state.dataPrevistaSortida instanceof Date) && infoArticle.value.necessitaMagatzemIntermig) {
          state.dataPrevistaSortidaInterna = new Date(calcularDiaSortida(state.dataPrevistaSortida, diesTransitEntreMagatzems.value));
        }
        canviIntern.value = false;
      }
      prevValues.dataSolicitada = state.dataSolicitada;
      prevValues.setmana = state.setmana;
      prevValues.dataPrevistaSortida = state.dataPrevistaSortida;
    }

    const guarda = async () => {
      // Validació
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        confirmVisible.value = true;
        if (await confDataAnteriorAvui())
          comprovarExisteixComandaClient();
        confirmVisible.value = false;
      }
    }

    const confDataAnteriorAvui = async() => {
      if (!moment(state.dataSolicitada).isBefore(moment(), 'day'))
        return new Promise((resolve) => { resolve(true); });
      return new Promise((resolve) => {
        confirm.require({
          message: t('Comandes.Confirma data anterior avui', [d(state.dataSolicitada, 'short')]),
          header: t('App.Confirmacio'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => resolve(true),
          reject: () => resolve(false),
          onHide: () => resolve(false),
        })
      });
    }

    const comprovarExisteixComandaClient = async() => {
      // Comprovació si existeix la comanda de client
      let comanda = await props.obtenirComandaExistent(state.comanda);
      if (comanda) {
        // En cas que existeixi una comanda amb el mateix nom s'ha de preguntar per la confirmació
        confirmVisible.value = true;
        if (await(confirmacioComandaExistent(comanda)))
          props.callbackOk(state);
        confirmVisible.value = false;
      } else {
        props.callbackOk(state);
      }
    }

    const confirmacioComandaExistent = async(comanda) => {
      let missatge = comanda.servida
        ? t('Comanda.Confirmacio existeix comanda servida amb confirmacio', [comanda.comanda, d(toDate(comanda.data), 'short')])
        : t('Comanda.Confirmacio existeix comanda amb confirmacio', [comanda.comanda, d(toDate(comanda.data), 'short')]);
      return new Promise((resolve) => {
        confirm.require({
          message: missatge,
          header: t('App.Confirmacio'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => resolve(true),
          reject: () => resolve(false),
          onHide: () => resolve(false),
        })
      });
    }

    const handler = (ev) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu
      if (isContextMenuKey(ev))  return;
      // Si no hi ha cap modal obert
      if (modalVisible.value) return;
      // Controls
      if (ev.key === 'Escape') {
          actionHandler(ev, () => hide());
      } else if (ev.ctrlKey && ev.code === "Space") { // Ctrl + Espai (per saltaar al programa)
        actionHandler(ev, () => inputPrograma.value.$el.focus());
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
      // Abans de guardar cal esperar que s'hagin recalculat totes les dates/setmana
      await nextTick();
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
      inputComanda,
      inputPrograma,
      actualitzaEstat,
      handleEnter,
      opcionsTipus: [
        { clau: "FERM", valor: t("Comandes.Ferm"), icon: 'okcheck' },
        { clau: "ORIENTATIU", valor: t("Comandes.Orientatiu"), icon: 'bruixola' },
        { clau: "INVENT", valor: t("Comandes.Invent"), icon: 'bombeta' },
      ],
      divisesDisponibles,
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

  .element-form > label {
    display: block;
    font-weight: 600;
    font-size: 1rem;
  }

  .element-form > small {
    display: block;
  }

  .break {
    flex-basis: 100%;
    height: 0;
  }

  .ellipsis {
    display: inline-block;
    max-width: 270px; /* ajusta según necesidad */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>