<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" 
    :draggable="false" :header="titol()" style="width: 450px">
    <form @submit.prevent="guarda">
      <div class="form">
        <div class="element-form">
          <label>{{ $t('ComandesEDI.linies.modalEditar.dataClient') }}</label>
          <CalendarInput v-model="state.dataClient" :disabled="state.tipus !== 'INVENT'"/>
          <!-- <small v-if="(v.dataClient.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small> -->
        </div>
        <div class="element-form">
          <label>{{ $t('ComandesEDI.linies.modalEditar.datamagatzementrada') }}</label>
          <CalendarInput v-model="state.dataAmes"/>
          <!-- <small v-if="(v.dataAmes.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small> -->
        </div>
        <div class="element-form" v-if="state.dataMagatzem">
          <label>{{ $t('ComandesEDI.linies.modalEditar.datamagatzem') }}</label>
          <CalendarInput v-model="state.dataMagatzem"/>
          <!-- <small class="p-error text-nowrap">{{ $t('App.Valor requerit')}}</small> -->
        </div>
        <div class="break" />
        <div class="element-form">
          <label>{{ $t('ComandesEDI.linies.modalEditar.quantitat') }}</label>
          <InputNumber v-model="state.quantitat" mode="decimal" :maxFractionDigits="0"
            @input="state.quantitat = $event.value" @keypress.enter="guarda" :locale="locale"
            @focus="$event.originalTarget.select();" />
        </div>
        <div class="break" />
        <div class="element-form">
          <label>{{ $t('ComandesEDI.linies.modalEditar.tipus') }}</label>
          <SelectButton v-model="state.tipus" :options="tipus" optionValue="clau" @keypress.enter="guarda">
          <template #option="slotProps">
            <img :src="require(`@/assets/${slotProps.option.icon}.png`)" height="24"/>
            <label style="margin-left: 4px">{{ slotProps.option.valor }}</label>
          </template>
        </SelectButton>
          <!-- <Dropdown v-model="state.tipus" :options="tipus" optionLabel="value" optionValue="value"
          placeholder="Tipus" class="w-full md:w-14rem" style="margin-right: 20px" /> -->
        </div>
        <div class="break" />
        <div style="margin-left: auto; margin-right: 0; margin-top:10px">
          <Button tabindex="-1" :label="$t('App.Cancela')" icon="pi pi-undo" class="p-button-secondary p-button-sm"
            @click="hide" />
          <Button type="submit" :label="$t('App.Desa')" icon="pi pi-save" class="p-button-sm"
            style="margin-left: 10px;" />
        </div>
      </div>
    </form>
  </Dialog>
</template>

<script>
// import EDIService from '@/services/edi.service';
// import carrega from "@/services/loader";
import useVuelidate from "@vuelidate/core";
import { required } from '@vuelidate/validators';
// import moment from "moment";
// import { ref, onMounted, onUnmounted, reactive, watch, computed, nextTick, inject } from "vue";
import { ref, onMounted, onUnmounted, reactive, inject } from "vue";
import { useI18n } from "vue-i18n";
// import { calculaDiaSortida, calculaDiaSortidaMagatzem } from '@/utils/dateUtils.js';
// import { useToast } from "primevue/usetoast";

export default {
  name: "EditarLiniaComandaEDI",
  props: {
    callbackGuardarOk: Function,
    codlin: Number,
    linia : Object,
  },
  setup(props, { emit }) {

    console.log("####codlin: " + props.codlin);
    
    const { t, locale } = useI18n();
    // const toast = useToast();
    const toDate = inject('toDate');
    const visible = ref(true);
    // const inputDataSolicitada = ref();
    // var isDataUpdated = false;
    var stateInicial;

    const tipus = [
        { clau: "FERM", valor: t("Comandes.Ferm"), icon: 'okcheck' },
        { clau: "ORIENTATIU", valor: t("Comandes.Orientatiu"), icon: 'bruixola' },
        { clau: "INVENT", valor: t("Comandes.Invent"), icon: 'bombeta' },
      ];

    const state = reactive({
      dataClient: new Date(),
      dataAmes: new Date(),
      dataMagatzem: new Date(),
      quantitat: 0,
      tipus: 'FERM',
    });
    // const validDate = (value) => {
    //   if (value)
    //     return (value instanceof Date);
    //   return true;
    // }
    const rules = {
      // dataClient: { required },
      // dataAmes: { required },
      // dataMagatzem: { required },
      quantitat: { required },
      tipus: { required }

    }
    const v = useVuelidate(rules, state);

    onMounted(async () => {
      // document.addEventListener("keydown", handler);
      console.log("~~~LINIA: " + props.linia);
      console.log("~~~TIPUS: " + state.tipus);
      console.log("~~~dataCLIENT: " + state.dataClient);
      console.log("~~~dataAmes: " + state.dataAmes);
      console.log("~~~dataMagatzem: " + state.dataMagatzem);
      
      inicialitzaLinia(props.linia);

      console.log("@@@LINIA: " + props.linia);
      console.log("@@@TIPUS: " + state.tipus);
      console.log("@@@dataCLIENT: " + state.dataClient);

      // nextTick(() => {
      //   setTimeout(() => inputDataSolicitada.value.$el.firstChild.focus(), 200);
      // });
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const handler = (key) => {
      if (key.key === 'Escape')
        hide();
    }

    const inicialitzaLinia = (linia) => {

      console.log("####linia.dataClient: " + JSON.stringify(linia));
      // console.log("####linia.dataAmes: " + linia.dataAMES ? $d(linia.dataAMES, 'short') : $d(calculaDiaSortida(toDate(linia.dataClient),liniesEDI.perfilDiesResta,liniesEDI.perfilDiesSortida), 'short'));
      // console.log("####linia.dataMagatzem: " + linia.dataClient ? $d(calculaDiaSortidaMagatzem(calculaDiaSortida(toDate(data.dataClient),liniesEDI.perfilDiesResta,liniesEDI.perfilDiesSortida),liniesEDI.articleDiesTransit), 'short') : new Date());
      
      console.log("~inicialitzaLinia~~dataCLIENT: " + linia.dataClient);
      console.log("~inicialitzaLinia~~dataAmes: " + linia.dataAMES);
      console.log("~inicialitzaLinia~~dataMagatzem: " + linia.dataMagatzem);



         if (props.linia) {
           state.dataClient = toDate(linia.dataClient);
           state.dataAmes = toDate(linia.dataAMES);
           state.dataMagatzem = toDate(linia.dataMagatzem);
           state.quantitat = linia.quantitat;
           state.tipus = linia.tipus;
         }
         stateInicial = JSON.stringify(state);
    }

    const titol = () => {
      return `${t('ComandesEDI.linies.modalEditar.titol')}`
    }

    // watch(
    //   () => [state.setmana],
    //   () => {
    //     if (!isDataUpdated) {
    //       state.dataSolicitada = moment(state.dataSolicitada).day("Monday").week(state.setmana).toDate();
    //       state.dataPrevistaSortida = calculaDiaSortida(state.dataSolicitada, props.infoArticle.diesTransitClient, props.infoArticle.diesSortida);
    //     }
    //     isDataUpdated = false;
    //   }
    // )

    const hide = () => {
      emit("update:carregat", false);
    };

    const guarda = async () => {
      console.log("guarda");
      
      // Validació
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        let request = {
          ...state,
        };
        accioGuardar(request);
      }
    }

    const accioGuardar = async (request) => {
      console.log("accioGuardar: quantitat: " + state.quantitat);
      // if (JSON.stringify(state) !== stateInicial)
      // await carrega(EDIService.editaLiniaComanda());
      await props.callbackGuardarOk(request);
      hide();
    }

    return {
      locale,
      visible,
      props,
      state,
      stateInicial,
      v,
      // inputDataSolicitada,
      // updateData,
      titol,
      tipus,
      guarda,
      hide
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

.element-form>label {
  display: block;
}

.element-form>small {
  display: block;
}

.break {
  flex-basis: 100%;
  height: 0;
}
</style>
