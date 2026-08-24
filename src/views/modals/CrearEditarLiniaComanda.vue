<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="titol()" style="width: 700px">
    <div style="margin: 5px 0px 5px 0px;">
      <label style="font-weight: 600;">
        {{ $t('Comandes.Empresa') }}:
      </label>
      <span style="margin-left: 5px;">
        {{ $empresa(infoArticle.codiEmpresaClient) }}
      </span>
    </div>
    <div class="form">
      <div class="element-form" v-if="props.programa">
        <label>{{ $t('Comandes.Programa')}}</label>
        <InputText v-model="props.programa" 
          class="input-lectura"
          readonly/>
      </div>
      <div class="break" v-if="props.programa"/>
      <div class="element-form">
        <label>{{ $t('Comandes.Data solicitada')}}</label>
          <span>
            <CalendarInput ref="inputDataSolicitada" v-model="state.dataSolicitada"
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
        <InputNumber v-model="state.quantitat" ref="inputQuantitat" mode="decimal" :maxFractionDigits="0" min="0"
          @input="state.quantitat = $event.value"
          @keypress.enter="guarda" :locale="locale"
          @focus="$event.originalTarget.select();" />
        <small v-if="(v.quantitat.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
      </div>
      <div class="break" />
      <div class="element-form">
        <label class="ellipsis" v-tooltip="infoArticle.magatzemSortidaDesc">
          {{ $t('Comandes.Data sortida mag', [`${infoArticle.magatzemSortida} - ${infoArticle.magatzemSortidaDesc}`])}}
        </label>
        <CalendarInput v-model="state.dataPrevistaSortida"
          @update:modelValue="actualitzaEstat('dataPrevistaSortida')" 
          @blur-confirmed="actualitzaEstat('dataPrevistaSortida')"
          @enter-confirmed="handleEnter('dataPrevistaSortida')"
          showWeek :invalid="v.dataPrevistaSortida.$errors.length"/>
        <small v-if="(v.dataPrevistaSortida.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>
      <div class="element-form" v-if="props.infoArticle.necessitaMagatzemIntermig">
        <label class="ellipsis" v-tooltip="infoArticle.magatzemEntradaDesc">
            {{ $t('Comandes.Data sortida mag', [`${infoArticle.magatzemEntrada} - ${infoArticle.magatzemEntradaDesc}`])}}
        </label>
        <CalendarInput v-model="state.dataPrevistaSortidaInterna"
          @keypress.enter="guarda"
          showWeek :invalid="v.dataPrevistaSortidaInterna.$errors.length"/>
        <small v-if="(v.dataPrevistaSortidaInterna.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>
      <div class="break" />
      <div class="element-form">
        <label>{{ $t('Comandes.Data confirmada')}}</label>
        <CalendarInput @keypress.enter="guarda" v-model="state.dataConfirmadaFabrica" :invalid="v.dataConfirmadaFabrica.$errors.length" />
        <small v-if="(v.dataConfirmadaFabrica.$errors.length)" class="p-error text-nowrap">{{$t('App.Data incorrecte')}}</small>
      </div>
      <div class="break" />
      <div class="element-form">
        <label>{{ $t('Comandes.Preu')}}</label>
        <InputNumber v-model="state.preu" mode="decimal" :maxFractionDigits="3"
          @input="state.preu = $event.value"
          :class="{ 'p-invalid' : v.preu.$errors.length }"
          @keypress.enter="guarda" :locale="locale"
          @focus="$event.originalTarget.select();" />
        <Dropdown v-model="state.divisa" 
          :options="divisesDisponibles" optionLabel="label" optionValue="value"
          style="width: 95px; margin-left: 10px;"/>
        <small v-if="(v.preu.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
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
      <div class="break" />
      <div style="margin-left: auto; margin-right: 0; margin-top:10px">
        <ButtonShortcut tabindex="-1" :literal="$t('App.Cancela')" icon="fa-solid fa-undo" :shortcut="'[Esc]'"  class="p-button-secondary p-button-sm" @click="hide" />
        <ButtonShortcut @click="guarda" :literal="$t('App.Desa')" icon="fa-solid fa-save" :shortcut="'[Enter]'" style="margin-left: 10px;"/>
      </div>
    </div>
  </Dialog>
</template>

<script>
import comandesService from "@/services/comandes.service";
import { carrega } from "@/services/loader";
import useVuelidate from "@vuelidate/core";
import { minValue, required, requiredIf } from '@vuelidate/validators';
import moment from "moment";
import { ref, onMounted, onUnmounted, reactive, computed, nextTick, inject } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { equals } from "@/utils/objectUtils";
import { calcularDiaSortida } from "@/utils/CalcularDiaSortida";
import { dataDeSetmana } from "@/utils/dateUtils";

export default {
  name: "CrearEditarLiniaComanda",
  props: {
    callbackGuardarOk: Function,
    comanda: Number,
    comandaClient: String,
    programa: String,
    infoArticle : Object,
    linia : Object,
    dataSolicitada: Date,
    tipus: String,
    teclaObrirModal: String,
  },
  setup(props, { emit }) {
    const { t, d, locale } = useI18n();
    const confirm = useConfirm();
    const confirmVisible = ref(false);
    const toast = useToast();
    const toDate = inject('toDate');
    const visible = ref(true);
    const inputDataSolicitada = ref();
    const inputQuantitat = ref();
    const teclaObrirModal = computed(() => props?.teclaObrirModal);
    const diesTransitClient = computed(() => props.infoArticle.diesTransitClient);
    const diesSortida = computed(() => props.infoArticle.diesSortida);
    const diesTransitEntreMagatzems = computed(() => props.infoArticle.diesTransitEntreMagatzems);
    const divisesDisponibles = computed(() => {
      const d = props.infoArticle.divisa;
      const base = d.endsWith("%") ? d.replace("%", "") : d;
      return [
        { label: base, value: base },
        { label: base + "%", value: base + "%" }
      ];
    });

    let isInicialitzacio = true;
    const canviIntern = ref(false); // per evitar loops a l'actualitzarEstat

    const prevValues = reactive({
      dataSolicitada: null,
      setmana: 0,
      dataPrevistaSortida: null,
    });
    const state = reactive({
      dataSolicitada: null,
      setmana: 0,
      dataPrevistaSortida: null,
      dataPrevistaSortidaInterna: null,
      dataConfirmadaFabrica : null,
      quantitat: 0,
      preu: props.infoArticle.preu,
      divisa: props.infoArticle.divisa,
      isPreuFixat: false,
      tipus: 'FERM',
      comandaBlanca: null,
    });
    const validDate = (value) => {
      if (value)
        return (value instanceof Date);
      return true;
    }
    const rules = {
      dataSolicitada: { required, valid : validDate },
      dataPrevistaSortida: { required, valid : validDate },
      dataPrevistaSortidaInterna : {
        requiredIfIntermig : requiredIf(() => props.infoArticle.necessitaMagatzemIntermig),
        valid : validDate
      },
      dataConfirmadaFabrica : { valid : validDate },
      quantitat : { required, min: minValue(1)},
      preu : { required },
      tipus: { required }
    }
    const v = useVuelidate(rules, state);

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      nextTick(() => {
         if (teclaObrirModal.value === 'space') {
          setTimeout(() => inputQuantitat.value.$el.firstChild.focus(), 200);
        } else {
          setTimeout(() => inputDataSolicitada.value.$el.firstChild.focus(), 200);
        }
        inicialitzaLinia(props.linia);
      });
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const handler = (key) => {
      if (modalVisible.value) return;
      if (key.key === 'Escape')
        hide();
    }

    const inicialitzaLinia = async (linia) => {
      if (linia) {
        state.dataSolicitada = toDate(linia.dataSolicitada);
        state.setmana = moment(linia.dataSolicitada).isoWeek();
        state.dataPrevistaSortida = toDate(linia.dataPrevistaSortida);
        state.dataPrevistaSortidaInterna = props.infoArticle.necessitaMagatzemIntermig ? toDate(linia.dataPrevistaSortidaInterna) : null;
        state.dataConfirmadaFabrica = linia.dataConfirmadaFabrica ? toDate(linia.dataConfirmadaFabrica) : null;
        state.quantitat = linia.quantitat;
        state.preu = linia.preu.valor;
        state.divisa = linia.preu.divisa;
        state.isPreuFixat = linia.isPreuFixat;
        state.tipus = linia.tipus;
        state.comandaBlanca = linia.comandaBlanca ? linia.comandaBlanca : null;
      } else {
        // Usa la prop dataSolicitada si existe, si no, usa la fecha actual
        state.dataSolicitada = props.dataSolicitada ? toDate(props.dataSolicitada) : new Date();
        state.setmana = moment(state.dataSolicitada).isoWeek();
        state.dataPrevistaSortida = new Date(calcularDiaSortida(state.dataSolicitada, diesTransitClient.value, diesSortida.value));
        state.tipus = props.tipus ? props.tipus : 'FERM';
        if (props.infoArticle.necessitaMagatzemIntermig)
          state.dataPrevistaSortidaInterna = new Date(calcularDiaSortida(state.dataPrevistaSortida, diesTransitEntreMagatzems.value));
      }
      prevValues.dataSolicitada = state.dataSolicitada;
      prevValues.setmana = state.setmana;
      prevValues.dataPrevistaSortida = state.dataPrevistaSortida;
      nextTick(() => {
        isInicialitzacio = false;
      });
    }

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
          if (props.infoArticle.necessitaMagatzemIntermig) {
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
            state.dataPrevistaSortida = new Date(calcularDiaSortida(state.dataSolicitada, diesTransitClient.value, diesSortida.value))
            if (props.infoArticle.necessitaMagatzemIntermig) {
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
        if ((state.dataPrevistaSortida instanceof Date) && props.infoArticle.necessitaMagatzemIntermig) {
          state.dataPrevistaSortidaInterna = new Date(calcularDiaSortida(state.dataPrevistaSortida, diesTransitEntreMagatzems.value));
        }
        canviIntern.value = false;
      }
      prevValues.dataSolicitada = state.dataSolicitada;
      prevValues.setmana = state.setmana;
      prevValues.dataPrevistaSortida = state.dataPrevistaSortida;
    }

    const titol = () => {
      if (props.linia) {
        return `${t('Comandes.Edicio linia', [props.comandaClient, props.infoArticle.referencia])}`
      } else {
        return `${t('Comandes.Nova linia', [props.comandaClient, props.infoArticle.referencia])}`
      }
    }

    const hide = () => {
      emit('update:teclaObrirModal', '');
      emit("update:carregat", false);
    };

    const guarda = async () => {
      // Validació
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        let request = {
          ...state,
          articleClient : {
           artint : props.infoArticle.artint,
           clicod : props.infoArticle.codiClient
          }
        };
        confirmVisible.value = true;
        if (await confDataAnteriorAvui() && await confDataSuperiorSisMesos())
          accioGuardar(request);
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

    const confDataSuperiorSisMesos = async() => {
      // En cas que la data sigui superior a 6 mesos es mostra una confirmació
      if (moment(state.dataSolicitada).diff(moment(), 'months') < 6)
        return new Promise((resolve) => { resolve(true); });
      return new Promise((resolve) => {
        confirm.require({
          message: t('Comandes.Confirma data sis mesos'),
          header: t('App.Confirmacio'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => resolve(true),
          reject: () => resolve(false),
          onHide: () => resolve(false),
        })
      });
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

    const accioGuardar = async(request) => {
      // Acció de guardar
      let codiNumeroComanda;
      if (props.linia) {
        codiNumeroComanda = await carrega(comandesService.modificarLiniaComanda(props.comanda, props.linia.numero, request, props.linia.versio));
      } else {
        codiNumeroComanda = await carrega(comandesService.crearLiniaComanda(props.comanda, request));
        toast.add({
          severity: "success",
          summary: t("Comandes.Comanda creada OK", [codiNumeroComanda]),
          life: 5000,
        });
      }
      if (codiNumeroComanda)
        await props.callbackGuardarOk(codiNumeroComanda);
      hide();
    }

    const modalVisible = computed(() => {
        return confirmVisible.value;
      });

    return {
      locale,
      visible,
      props,
      state,
      v,
      inputDataSolicitada,
      titol,
      guarda,
      hide,
      actualitzaEstat,
      handleEnter,
      opcionsTipus: [
        { clau: "FERM", valor: t("Comandes.Ferm"), icon: 'okcheck' },
        { clau: "ORIENTATIU", valor: t("Comandes.Orientatiu"), icon: 'bruixola' },
        { clau: "INVENT", valor: t("Comandes.Invent"), icon: 'bombeta' },
      ],
      divisesDisponibles,
      inputQuantitat
    };

  },
};
</script>

<style scoped>
  .form {
    margin-top: 2px;
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px 30px;
  }

  .element-form > label {
    display: block;
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

  .input-lectura {
    background-color: #f0f0f0 !important;
    color: #6c6c6c;
    cursor: text; /* sigue mostrando que se puede seleccionar */
  }
</style>
