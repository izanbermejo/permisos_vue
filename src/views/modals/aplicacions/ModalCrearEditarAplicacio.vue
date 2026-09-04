<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true"
    :draggable="false" :header="props.isEdit ? $t('Aplicacions.Editar Aplicacio') : $t('Aplicacions.Crear Aplicacio')" style="width: 600px">
    <div class="form" style="margin-top: 10px;">
      <div class="element-form">
        <label>{{ $t('Aplicacions.nom aplicacio') }}</label>
        <InputText ref="inputFiltre" v-model="state.nomAplicacio" style="width: 100%; text-transform: uppercase;" :disabled="props.isEdit" @input="state.nomAplicacio = state.nomAplicacio.toUpperCase()"/>
        <small v-if="(v.nomAplicacio.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>
      <div class="break"></div>
      <div class="element-form">
        <label>{{ $t('Aplicacions.descripcio') }}</label>
        <InputText ref="inputFiltre" v-model="state.descripcio" style="width: 100%;" />
        <small v-if="(v.descripcio.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>

      <div class="break" />
      <div style="margin-left: auto; margin-right: 0; margin-top:10px">
        <ButtonShortcut tabindex="-1" :literal="$t('App.Cancelar')" class="p-button-secondary p-button-sm" @click="hide" />
        <ButtonShortcut @click="guardar" :literal="$t('App.Desa')" style="margin-left: 10px;" />
      </div>
    </div>
  </Dialog>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { carrega } from "@/services/loader";
import aplicacionsService from "@/services/aplicacions.service";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";

export default {
  name: "ModalCrearEditarAplicacio",
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    nomAplicacio: {
      type: String,
      default: null
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const toast = useToast();
    const visible = ref(true);
    const state = reactive({
      nomAplicacio: '',
      descripcio: '',
    });

    onMounted( async () => {
      document.addEventListener("keydown", handler);

      if (props.isEdit && props.nomAplicacio) {
        const resp = await carrega(aplicacionsService.obtenirAplicacio(props.nomAplicacio));
        state.nomAplicacio = resp.nomAplicacio;
        state.descripcio = resp.descripcio;
      } 
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const rules = {
      nomAplicacio: { required },
      descripcio: { required },
    };
    const v = useVuelidate(rules, state);

    const guardar = async () => {
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        let request = {
          nomAplicacio: state.nomAplicacio,
          descripcio: state.descripcio
        }
        if (props.isEdit) {
          await carrega(aplicacionsService.modificarAplicacio(props.nomAplicacio, request));
        } else {
          await carrega(aplicacionsService.crearAplicacio(request));
        }

        toast.add({severity:'success', summary: t('Entrades.aplicacio guardada correctament'), life: 3000});
        hide();
      }
    }

    const hide = () => {
      emit("actualitzar");
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
