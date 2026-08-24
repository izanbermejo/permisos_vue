<template>
  <AjudaStocks v-if="visibleAjudaStocks"  @update:carregat="visibleAjudaStocks = $event"
        :artint="props.artint" :clicod="props.clicod" />
  <AjudaReserves v-if="visibleAjudaReserves"  @update:carregat="visibleAjudaReserves = $event"
      :artint="props.artint" :empresa="props.client.empresa" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')" />
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="isEdicio ? $t('Comandes.Editar linia') : $t('Comandes.Afegir nova linia')" style="width: 600px">
    <div class="form" style="margin-top: 10px;">
      <div class="alerta-articleespecial" v-if="articleClientEspecial">
        {{ $t('Comandes.Client te article especial', [articleClient.article, articleClientEspecial.referencia, articleClientEspecial.denominacio]) }}
      </div>
      <div>
        <label style="font-weight: 600;font-size: 1rem;">{{ `${$t('Comandes.Referencia')}:` }}</label>
        {{ articleClient?.referencia }}
      </div>
      <div>
        <label style="font-weight: 600;font-size: 1rem;">{{ `${$t('Comandes.Embalatge')}:` }}</label>
        <span v-if="isArticleEspecial">
          {{ $t('Comandes.Quantitat amb info peces palet', [articleClient?.unitatsEmbalatge, articleClient?.caixesPalet, 
            articleClient ? $n(articleClient.unitatsEmbalatge * articleClient.caixesPalet) : '-'])}}
        </span>
        <span v-else>
          {{ $t('Comandes.Quantitat amb info peces bossa', [articleClient?.unitatsEmbalatge, articleClient?.bossesCaixa, 
            articleClient ? $n(articleClient.unitatsEmbalatge * articleClient.bossesCaixa) : '-'])}}
        </span>
      </div>
      <div v-if="!isEdicio" class="element-form">
        <label>{{ $t('Comandes.Stock disponible') }}</label>
        <span style="display:flex;">
          <InputText
            :value="$n((props.stockLocal ?? 0) - (props.reservaLocal ?? 0))" readonly
            class="p-inputtext-sm" style="width: 80px; background-color:#f0f0f0; cursor: default; text-align:right;"/>
        </span>
      </div>
      <div v-if="!isEdicio" class="element-form">
        <label>{{ $t('Comandes.Stock local') }}</label>
        <span style="display:flex;">
          <InputText :value="props?.stockLocal ? $n(props.stockLocal) : 0" readonly class="p-inputtext-sm"
            style="width: 60px; background-color:#f0f0f0; cursor: default; text-align: right;"/>
          <Button icon="pi pi-box" class="p-button-sm" @click="visibleAjudaStocks = true"/>
        </span>
      </div>
      <div v-if="!isEdicio" class="element-form">
        <label>{{ $t('Comandes.Reservat local') }}</label>
        <span style="display:flex;">
          <InputText :value="props?.reservaLocal ? $n(props.reservaLocal) : 0" readonly class="p-inputtext-sm" 
          style="width: 60px; background-color: #f0f0f0; cursor: default; text-align: right;"/>
          <Button icon='pi pi-book' class="p-button-sm" @click="visibleAjudaReserves = true" />
        </span>
      </div>
      <div class="break" />
      <div class="element-form">
        <label>
          {{ $t('Comandes.Quantitat')}}
        </label>
        <InputNumber ref="inputQuantitat" v-model="state.quantitat" mode="decimal" :maxFractionDigits="0" 
          :min="1" :step="articleClient?.unitatsEmbalatge"
          inputStyle="width: 80px;"
          :class="{ 'p-invalid' : v.quantitat.$errors.length }"
          @input="state.quantitat = $event.value"
          @focus="$event.originalTarget.select();"
          @keypress.enter="guarda" :locale="locale" />
          <small v-if="(v.quantitat.$errors.length)" class="p-error text-nowrap">{{ missatgeQuantitat }}</small>
      </div>
      <div class="break" />
      <div class="element-form">
        <label>{{ $t('Comandes.Data solicitada')}}</label>
          <span>
            <CalendarInput v-model="state.dataSolicitada"
              @update:modelValue="actualitzaEstat('dataSolicitada')" 
              @enter-confirmed="handleEnter('dataSolicitada')"
              showWeek
              :invalid="v.dataSolicitada.$errors.length" />
          </span>
          <small v-if="(v.dataSolicitada.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>
      <div class="element-form">
        <label>{{ $t('Comandes.Data sortida')}}</label>
        <CalendarInput v-model="state.dataPrevistaSortida" :invalid="v.dataPrevistaSortida.$errors.length" showWeek
          @keypress.enter="guarda" />
        <small v-if="(v.dataPrevistaSortida.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>
      <div class="element-form">
        <label>{{ $t('Comandes.Setmana')}}</label>
        <SetmanaInput v-model="state.setmana"
          @update:modelValue="actualitzaEstat('setmana')"
          @blur-confirmed="actualitzaEstat('setmana')"
          @enter-confirmed="handleEnter('setmana')" />
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
import useVuelidate from "@vuelidate/core";
import comandesService from "@/services/comandes.service";
import { carrega } from "@/services/loader";
import { required } from '@vuelidate/validators';
import moment from "moment";
import { ref, onMounted, onUnmounted, reactive, nextTick, computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import { useConfirm } from "primevue/useconfirm";
import Swal from "sweetalert2";
import { calculaSeguentDiaLaborable, dataDeSetmana } from '@/utils/dateUtils.js';
import { equals } from "@/utils/objectUtils";
import { calcularDiaSortida } from "@/utils/CalcularDiaSortida";
import AjudaReserves from "@/views/modals/reserves/AjudaReserves.vue";
import AjudaStocks from '@/views/modals/AjudaStocks.vue';
import { usePermisosStore } from "@/stores/permisos";

export default {
  name: "CrearEditarLiniaNormalitzat",
  components: { AjudaReserves, AjudaStocks },
  props: {
    callbackOk: Function,
    artint : String,
    clicod : String,
    client : Object,
    permetNoMultiplesBossa : Boolean,
    req : Object,
    stockLocal : Number,
    reservaLocal : Number,
  },
  setup(props, { emit }) {
    const { t, d, locale } = useI18n();
    const confirm = useConfirm();
    const confirmVisible = ref(false);
    const permisosStore = usePermisosStore();
    const visible = ref(true);
    const inputQuantitat = ref();
    const articleClient = ref();
    const articleClientEspecial = ref();
    const toDate = inject('toDate');
    let isInicialitzacio = true;
    let isGuardant = false;
    const canviIntern = ref(false); // per evitar loops a l'actualitzarEstat
    const diesTransitClient = computed(() => props.client.diesTransitClient);
    const diesSortida = computed(() => props.client.diesSortida);
    const visibleAjudaReserves = ref(false);
    const visibleAjudaStocks = ref(false);

    // Càlcul del següent dia laborable i de la data que pot venir donada per defecte
    // que es l'última introduïda quan s'afegeix una línia
    var seguentDiaLaborable = calculaSeguentDiaLaborable();
    const dataDefecte = inject('ultimaDataIntroduida');
    const dataSortidaDefecte = inject('ultimaDataSortidaIntroduida');
    var dataInicial = dataDefecte.value ? dataDefecte.value : seguentDiaLaborable;
    var dataSortidaInicial = dataSortidaDefecte.value 
                            ? dataSortidaDefecte.value 
                            : new Date(calcularDiaSortida(dataInicial, diesTransitClient.value, diesSortida.value));

    const prevValues = reactive({
      dataSolicitada: null,
      setmana: 0,
    });
    const state = reactive({
      quantitat: 0,
      dataSolicitada: null,
      dataPrevistaSortida: null,
      setmana: 0,
    });
    const validQuantitat = (value) => {
      // Si la peça és de tipus especial no cal mirar que sigui múltiple
      if (value && isArticleEspecial.value) 
        return true;
      // Si es permet posar una quantitat de peces no múltiples de la quantitat per bossa (cas de MTY que obren bosses i venen per unitats)
      if (props.permetNoMultiplesBossa)
        return true;
      // Comprovació que la quantitat introduïda es múltiple de la quantitat de peces per bossa
      return value && (value % articleClient.value?.unitatsEmbalatge == 0);
    };
    const validDate = (value) => {
      if (value)
        return (value instanceof Date);
      return true;
    };
    const rules = {
      quantitat: { validQuantitat },
      dataSolicitada: { required, valid : validDate },
      dataPrevistaSortida: { required, valid : validDate },
    }
    const v = useVuelidate(rules, state);

    onMounted(async () => {
      // Càrrega de l'articleclient passat com a paràmetre
      try {
        let result = await carrega(comandesService.obtenirArticleClientPerNorm(props.client.clicod, props.artint, props.clicod));
        articleClient.value = result.articleClient;
        articleClientEspecial.value = result.articleClientEspecial;
      } catch (e) {
        hide();
      }
      // Inicialització del listener i focus a l'editText
      document.addEventListener("keydown", handler);
      nextTick(() => {
        inicialitza(props.req, articleClient.value.unitatsEmbalatge);
      });
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const inicialitza = async (req, unitatsEmbalatgeDefecte) => {
      if (req) {
        state.quantitat = props.req.quantitat;
        state.dataSolicitada = toDate(props.req.dataSolicitada);
        state.dataPrevistaSortida = toDate(props.req.dataPrevistaSortida);
        state.setmana = moment(props.req.dataSolicitada).isoWeek();
      } else {
        state.dataSolicitada = dataInicial;
        state.dataPrevistaSortida = dataSortidaInicial;
        state.setmana = moment(dataInicial).isoWeek(),
        state.quantitat = unitatsEmbalatgeDefecte;
      }
      prevValues.dataSolicitada = state.dataSolicitada;
      prevValues.setmana = state.setmana;
      prevValues.dataPrevistaSortida = state.dataPrevistaSortida;
      nextTick(() => {
        isInicialitzacio = false;
        inputQuantitat.value.$el.firstChild.focus();
        if (articleClientEspecial.value) {
          Swal.fire({
            allowOutsideClick : false,
            didOpen: () => Swal.getConfirmButton().focus(),
            icon: 'warning',
            title: t('App.Atencio'),
            text: t('Comandes.Client te article especial', 
              [articleClient.value.article, articleClientEspecial.value.referencia, articleClientEspecial.value.denominacio])
          });
        }
      });
    }

    const isEdicio = computed(() => {return props.req});

    const missatgeQuantitat = computed(() => {
      return isArticleEspecial.value
                          ? t('App.Valor requerit')
                          : t('Comandes.Valor requerit multiple bossa');
    });

    const isArticleEspecial = computed(() => {return "ESPECIAL" === articleClient.value?.tipus});

    const handler = (key) => {
       if (isModalObert.value)
                return;
      if (key.key === 'Escape') {
        key.preventDefault();
        hide();
      }
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

    const hide = () => {
      emit("update:carregat", false);
    };

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

    const guarda = async () => {
      if (isGuardant) return;
      isGuardant = true;
      // Acció de guardar
      // Validació
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        confirmVisible.value = true;
        if (await confDataAnteriorAvui())
          props.callbackOk(state.quantitat, state.dataSolicitada, state.dataPrevistaSortida);
        confirmVisible.value = false;
      }
      isGuardant = false;
    }

     const isModalObert = computed(() => {
            return visibleAjudaReserves.value
                || visibleAjudaStocks.value
                || confirmVisible.value;
        });

    return {
      locale,
      visible,
      props,
      permisosStore,
      state,
      v,
      inputQuantitat,
      guarda,
      hide,
      isEdicio,
      articleClient,
      articleClientEspecial,
      missatgeQuantitat,
      isArticleEspecial,
      actualitzaEstat,
      handleEnter,
      visibleAjudaReserves,
      visibleAjudaStocks,
      isModalObert
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

  .alerta-articleespecial {
    border-radius: 8px;
    border: 1px solid #555;
    background-color: #f5f5f5;
    padding: 10px;
  }
</style>
