<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true"
    :draggable="false" :header="$t('Entrades.exportar dades entrades')" style="width: 600px">
    <div class="form" style="margin-top: 10px;">
      <div class="element-form">
        <label>{{ $t('EntradesComercial.Client') }}</label>
        <InputText ref="inputFiltre" v-model="state.client" style="width: 180px;" />
      </div>
      <div class="element-form">
        <label>{{ $t('EntradesComercial.Magatzem') }}</label>
        <InputText ref="inputFiltre" v-model="state.magatzem" style="width: 180px;" />
      </div>
      <div class="break"></div>
      <div class="element-form">
        <label>{{ $t('Comandes.Data des de fins') }}</label>
        <div>
          <CalendarInput v-model="state.dataInici" />
          -
          <CalendarInput v-model="state.dataFi" />
        </div>
      </div>

      <div class="break" />
      <div style="margin-left: auto; margin-right: 0; margin-top:10px">
        <ButtonShortcut tabindex="-1" :literal="$t('App.Cancela')" icon="fa-solid fa-undo" :shortcut="'[Esc]'"  class="p-button-secondary p-button-sm" @click="hide" />
        <ButtonShortcut @click="exportar" :literal="$t('Comandes.Descarregar taula')" icon="fa-solid fa-file-excel" :shortcut="'[Enter]'" style="margin-left: 10px;" />
      </div>
    </div>
  </Dialog>
</template>

<script>
import moment from "moment";
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { carrega } from "@/services/loader";
import entradesService from "@/services/entrades.service";
import { saveAs } from 'file-saver';

export default {
  name: "ModalExportarDadesComercial",
  props: {
  },
  setup(props, { emit }) {
    const { t, locale } = useI18n();
    const toast = useToast();
    const visible = ref(true);
    let isExportant = false;
    const state = reactive({
      client : '',
      magatzem : '',
      dataInici : moment().subtract(1, 'month').toDate(),
      dataFi : new Date(),
    });

    onMounted(() => {
      document.addEventListener("keydown", handler);
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const hide = () => {
      emit("update:carregat", false);
    };

    const handler = (key) => {
      if (key.key === 'Enter') {
        exportar();
      }
    }

    const exportar = async () => {
      if (isExportant) return;
      if (state.dataInici > state.dataFi) {
        toast.add({severity:'warn', summary: t('Comandes.rang dates invalid'), life: 3000});
        return;
      }
      isExportant = true;
      let params = new URLSearchParams();
      params.append('client', state.client);
      params.append('magatzem', state.magatzem);
      if (state.dataInici)
        params.append('dataInici', moment(state.dataInici).format('YYYY-MM-DD'));
      if (state.dataFi)
        params.append('dataFi', moment(state.dataFi).format('YYYY-MM-DD'));
      const resp = await carrega(entradesService.exportarDadesComercial(params));

      saveAs(new Blob([resp]), `Entrades_comercial.xlsx`);

      isExportant = false;
      hide();
    }

    return {
      locale,
      visible,
      props,
      state,
      exportar,
      hide,
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
