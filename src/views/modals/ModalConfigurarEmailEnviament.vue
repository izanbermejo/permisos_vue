<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true"
    :draggable="false" :header="$t('Entrades.correu notificacio error')" style="width: 600px">
    <div class="form" style="margin-top: 10px;">
      <div class="element-form">
        <label>{{ $t('Entrades.email notificacio comercial') }}</label>
        <InputText ref="inputFiltre" v-model="state.emailsComercial" style="width: 100%;" />
        <small v-if="(v.emailsComercial.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>
      <div class="break"></div>
      <div class="element-form">
        <label>{{ $t('Entrades.email notificacio magatzem') }}</label>
        <InputText ref="inputFiltre" v-model="state.emailsMagatzem" style="width: 100%;" />
        <small v-if="(v.emailsMagatzem.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>
      <div class="break"></div>
      <div class="element-form info-emails">
        <p>{{ $t('Entrades.explicacio format i obligatori') }}</p>
        <p>{{ $t('Entrades.responsable magatzem per defecte') }}</p>
      </div>

      <div class="break" />
      <div style="margin-left: auto; margin-right: 0; margin-top:10px">
        <ButtonShortcut tabindex="-1" :literal="$t('App.Cancela')" icon="fa-solid fa-undo" :shortcut="'[Esc]'"  class="p-button-secondary p-button-sm" @click="hide" />
        <ButtonShortcut @click="guardar" :literal="$t('App.Desa')" icon="fa-solid fa-file-excel" :shortcut="'[Enter]'" style="margin-left: 10px;" />
      </div>
    </div>
  </Dialog>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { carrega } from "@/services/loader";
import entradesService from "@/services/entrades.service";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";

export default {
  name: "ModalConfigurarEmailEnviament",
  props: {
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const toast = useToast();
    const visible = ref(true);
    const state = reactive({
      emailsComercial : '',
      emailsMagatzem : '',
    });

    onMounted( async () => {
      document.addEventListener("keydown", handler);

      const resp = await carrega(entradesService.obtenirEmailsEnviament())
      state.emailsComercial = resp[0].emailsComercial;
      state.emailsMagatzem = resp[0].emailsMagatzem;
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const rules = {
      emailsComercial: { required },
      emailsMagatzem: { required },
    };
    const v = useVuelidate(rules, state);

    const guardar = async () => {
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        let request = {
          emailsComercial: state.emailsComercial,
          emailsMagatzem: state.emailsMagatzem
        }
        await carrega(entradesService.guardarEmailsEnviament(request));

        toast.add({severity:'success', summary: t('Entrades.emails guardats correctament'), life: 3000});
        hide();
      }
    }

    const hide = () => {
      emit("update:carregat", false);
    };

    const handler = (key) => {
      if (key.key === 'Enter') {
        guardar();
      }
    }

    return {
      visible,
      props,
      state,
      v,
      guardar,
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

  .element-form {
    width: 100%;
  }

  .element-form > label {
    display: block;
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 4px;
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

  .info-emails {
    font-size: 0.9rem;
    color: #646464;
  }
</style>
