<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="true" :header="$t('Parametres.Afegir Funcio del Parametre')" style="width: 500px">
    <div class="form" style="margin-top: 10px;">
      <div class="element-form">
        <label>{{ $t('App.Centre') }}</label>
        <Dropdown v-model="state.centre" filter :options="centresMeta"
                  optionLabel="nom" optionValue="id"
                  :placeholder="centresMeta[0].nom" style="width: 450px;" />
      </div>
      <div class="element-form">
        <label>{{ $t('App.Departament') }}</label>
        <Dropdown v-model="state.departament" filter :options="departamentsMeta" 
                  optionLabel="nomDepartament" optionValue="id"
                  :placeholder="departamentsMeta[0].nomDepartament" style="width: 450px;" >
        </Dropdown>
      </div>
      <div class="break"></div>
      <div class="element-form">
        <label>{{ $t('App.Funcio') }}</label>
        <Dropdown v-model="state.funcio" filter :options="funcionsMeta" 
                  optionLabel="nomFuncio" optionValue="id"
                  :placeholder="funcionsMeta[0].nomFuncio" style="width: 450px;" >
        </Dropdown>
      </div>
      <div class="break"></div>
      <div class="element-form">
        <label>{{ $t('App.Valor') }}</label>
        <InputText ref="inputFiltre" v-model="state.valor" style="width: 100%;" />
        <small v-if="(v.valor.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
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
import { ref, reactive, onMounted, onUnmounted, getCurrentInstance, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { carrega } from "@/services/loader";
import { getLocalizedJson } from "@/services/index";
import { required } from "@vuelidate/validators";
import ParametresService from "@/services/parametres.service";
import useVuelidate from "@vuelidate/core";

export default {
  name: "ModalAfegirFuncioDelParametre",
  props: {
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
    const { appContext } = getCurrentInstance();
    const centresMeta = computed(() => {
      return [
        {
          id: null,
          nom: t('App.tots centres')
        },
        ...appContext.config.globalProperties.$centres
      ];
    });
    const departamentsMeta = computed(() => {
      const departaments = appContext.config.globalProperties.$departaments.map(departament => ({
        ...departament,
        nomDepartament: getLocalizedJson(departament.descripcio)
      }));

      return [
        {
          id: null,
          nomDepartament: t('App.tots departaments')
        },
        ...departaments
      ];
    });
    const funcionsMeta = computed(() => {
      const funcions = appContext.config.globalProperties.$funcions.map(funcio => ({
        ...funcio,
        nomFuncio: getLocalizedJson(funcio.funcio)
      }));

      return [
        {
          id: null,
          nomFuncio: t('App.totes funcions')
        },
        ...funcions
      ];
    });
    const state = reactive({
      centre: null,
      departament: null,
      funcio: null,
      valor: null,
    });

    onMounted( async () => {
      document.addEventListener("keydown", handler);
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const rules = {
      valor: { required },
    };
    const v = useVuelidate(rules, state);

    const guardar = async () => {
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        if (!state.centre && !state.departament && !state.funcio) {
          toast.add({severity:'error', summary: t('Funcions.minim un camp'), life: 3000});
          return;
        }
        let request = {
          idCentre: state.centre,
          idDepartament: state.departament,
          idFuncio: state.funcio,
          valor: state.valor,
        }
        await carrega(ParametresService.assignarFuncio( props.nomAplicacio, props.nomParametre, request));

        toast.add({severity:'success', summary: t('Funcions.funcio assignada correctament'), life: 3000});
        hide();
      }
    }

    const hide = () => {
      emit("actualitzar");
      emit("update:carregat", false);
    };

    const handler = (event) => {
      if (event.key === 'Enter') {
        guardar();
      }

      if (event.key === 'Escape') {
        event.stopPropagation();
        hide();
      }
    }

    return {
      visible,
      props,
      state,
      centresMeta,
      departamentsMeta,
      funcionsMeta,
      v,
      getLocalizedJson,
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
