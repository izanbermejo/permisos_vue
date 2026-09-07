<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true"
    :draggable="true" :header="props.isEdit ? $t('Parametres.Editar Parametre') : $t('Parametres.Crear Parametre')" style="width: 600px">
    <div class="form" style="margin-top: 10px;">
      <div class="element-form">
        <label>{{ $t('App.Aplicacio') }}</label>
        <div>
          <Dropdown v-model="state.nomAplicacio" :options="props.llistaAplicacions"
                      optionLabel="nomAplicacio" optionValue="nomAplicacio"
                      :placeholder="$t('Aplicacions.selecciona aplicacio')" :disabled="props.isEdit"
                      style="width: 300px;" />
          <span v-if="state.nomAplicacio" style="margin-left: 15px; cursor: pointer; width: 1.5rem; display: inline-block; text-align: center;"
              v-tooltip="descripcioAplicacioSeleccionada">
              <font-awesome-icon icon="fa-solid fa-info" style="font-size: 1.10rem"/>
          </span>

        </div>
        <small v-if="(v.nomAplicacio.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>
      <div class="element-form">
        <label>{{ $t('Parametres.Nom parametre') }}</label>
        <InputText ref="inputFiltre" v-model="state.nomParametre" style="width: 100%; text-transform: uppercase;" :disabled="props.isEdit" @input="state.nomParametre = state.nomParametre.toUpperCase()"/>
        <small v-if="(v.nomParametre.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>
      <div class="break"></div>
      <div class="element-form">
        <label>{{ $t('Aplicacions.descripcio') }}</label>
        <InputText ref="inputFiltre" v-model="state.descripcio" style="width: 100%;" />
        <small v-if="(v.descripcio.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>

      <div class="break" />
      <div style="margin-left: auto; margin-right: 0; margin-top:10px">
        <Button tabindex="-1" :label="$t('App.Cancelar')" class="p-button-secondary p-button-sm" @click="hide" />
        <Button :label="$t('App.Desa')" class="p-button-primary p-button-sm" style="margin-left: 10px;" @click="guardar" />
      </div>
    </div>
  </Dialog>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { carrega } from "@/services/loader";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import parametresService from "@/services/parametres.service";

export default {
  name: "ModalCrearEditarParametre",
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    llistaAplicacions: {
      type: Array,
      default: () => []
    },
    nomAplicacio: {
      type: String,
      default: null
    },
    nomParametre: {
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
      nomParametre: '',
      descripcio: '',
    });
    const descripcioAplicacioSeleccionada = computed(() =>
      props.llistaAplicacions.find(aplicacio => aplicacio.nomAplicacio === state.nomAplicacio)?.descripcio || ''
    );

    onMounted( async () => {
      document.addEventListener("keydown", handler);

      if (props.isEdit && props.nomAplicacio && props.nomParametre) {
        const resp = await carrega(parametresService.obtenirParametre(props.nomAplicacio, props.nomParametre));
        state.nomAplicacio = resp.nomAplicacio;
        state.nomParametre = resp.nomParametre;
        state.descripcio = resp.descripcio;
      } 
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const rules = {
      nomAplicacio: { required },
      nomParametre: { required },
      descripcio: { required },
    };
    const v = useVuelidate(rules, state);

    const guardar = async () => {
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        let request = {
          nomAplicacio: state.nomAplicacio,
          nomParametre: state.nomParametre,
          descripcio: state.descripcio
        }
        if (props.isEdit) {
          await carrega(parametresService.modificarParametre(props.nomAplicacio, props.nomParametre, request));
        } else {
          await carrega(parametresService.crearParametre(request));
        }

        toast.add({severity:'success', summary: t('Parametres.parametre guardat correctament'), life: 3000});
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
      descripcioAplicacioSeleccionada,
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
