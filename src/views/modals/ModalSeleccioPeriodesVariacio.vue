<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="$t('Comandes.Variacio')" style="width: 600px">
    <form @submit.prevent="genera">
      <Panel style="width: 100%; margin-top: 10px;">
        <template #header>
          <span class="p-panel-title">
            {{$t('Comandes.Periode variacio')}}
          </span>
        </template>
        <div class="form">
          <div class="element-form">
            <label>{{ $t('Comandes.Data inici')}}</label>
            <CalendarInput v-model="state.dataInici" :invalid="v.dataInici.$errors.length" showWeek />
            <small v-if="(v.dataInici.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
          </div>
          <div class="element-form">
            <label>{{ $t('Comandes.Data fins')}}</label>
            <CalendarInput v-model="state.dataFins" :invalid="v.dataFins.$errors.length" showWeek />
            <small v-if="(v.dataFins.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
          </div>
        </div>
      </Panel>
      <Panel style="width: 100%; margin-top: 10px;">
        <template #header>
          <span class="p-panel-title">
            {{$t('Comandes.Periode data solicitada')}}
          </span>
        </template>
        <div class="form">
          <div class="element-form">
            <label>{{ $t('Comandes.Data inici')}}</label>
            <CalendarInput v-model="state.dataSolicitadaInici" :invalid="v.dataSolicitadaInici.$errors.length" showWeek />
            <small v-if="(v.dataSolicitadaInici.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
          </div>
          <div class="element-form">
            <label>{{ $t('Comandes.Data fins')}}</label>
            <CalendarInput v-model="state.dataSolicitadaFins" :invalid="v.dataSolicitadaFins.$errors.length" showWeek />
            <small v-if="(v.dataSolicitadaFins.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
          </div>
        </div>
      </Panel>
      <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
        <ButtonShortcut tabindex="-1" :literal="$t('App.Cancela')" icon="fa-solid fa-undo" :shortcut="'[Esc]'"  class="p-button-secondary p-button-sm" @click="hide" />
        <ButtonShortcut type="submit" :literal="$t('App.Genera')" icon="fa-solid fa-save" :shortcut="'[Enter]'" style="margin-left: 10px;"/>
      </div>
    </form>
  </Dialog>
</template>

<script>
import useVuelidate from "@vuelidate/core";
import { required } from '@vuelidate/validators';
import { ref, onMounted, onUnmounted, reactive, nextTick } from "vue";
import moment from "moment";

export default {
  name: "CrearEditarLiniaNormalitzat",
  props: {
    callbackGenera: Function,
  },
  setup(props, { emit }) {
    const visible = ref(true);

    const state = reactive({
      dataInici: moment().subtract(1, 'days').toDate(),
      dataFins: moment().subtract(1, 'days').toDate(),
      dataSolicitadaInici: null,
      dataSolicitadaFins: null,
    });
    const validDate = (value) => {
      if (value)
        return (value instanceof Date);
      return true;
    };
    const rules = {
      dataInici: { required, valid : validDate },
      dataFins: { required, valid : validDate },
      dataSolicitadaInici: { valid : validDate },
      dataSolicitadaFins: { valid : validDate },
    }
    const v = useVuelidate(rules, state);

    onMounted(async () => {
      // Inicialització del listener i focus a l'editText
      document.addEventListener("keydown", handler);
      nextTick(() => {
      });
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });


    const handler = (key) => {
      if (key.key === 'Escape') {
        key.preventDefault();
        hide();
      }
    }

    const hide = () => {
      emit("update:carregat", false);
    };

    const genera = async () => {
      // Validació
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        props.callbackGenera(state);
      }
    }

    return {
      visible,
      props,
      v,
      state,
      genera,
      hide,
    };

  },
};
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
  }

  .element-form > small {
    display: block;
  }

  .break {
    flex-basis: 100%;
    height: 0;
  }
</style>
