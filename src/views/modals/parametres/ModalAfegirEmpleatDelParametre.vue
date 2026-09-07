<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="true" :header="$t('Parametres.Afegir empleat del Parametre')" style="width: 500px">
    <div class="form" style="margin-top: 10px;">
      <div class="element-form">
        <label>{{ $t('App.Empleat') }}</label>
        <Dropdown v-model="empleat" filter :options="empleatsMeta"
                  optionLabel="nomComplet" optionValue="id"
                  :placeholder="$t('App.selecciona empleat')" style="width: 450px;" />
      </div>
      <div class="element-form">
        <label>{{ $t('App.Valor') }}</label>
        <InputText ref="inputFiltre" v-model="valor" style="width: 100%;" />
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
import { ref, onMounted, onUnmounted, computed, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { carrega } from "@/services/loader";
import { getLocalizedJson } from "@/services/index";
import ParametresService from "@/services/parametres.service";
import { required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

export default {
  name: "ModalAfegirEmpleatDelParametre",
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
    const valor = ref('');
    const empleatsMeta = computed(() => {
      return appContext.config.globalProperties.$empleats.map(empleat => ({
        ...empleat,
        nomComplet: `${empleat.nom} ${empleat.cognoms} (${empleat.id})`
      }));
    });
    const empleat = ref();

    onMounted( async () => {
      document.addEventListener("keydown", handler);
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const rules = {
      valor: { required },
    };
    const v = useVuelidate(rules, { valor });

    const guardar = async () => {
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        if (!empleat.value) {
          toast.add({severity:'error', summary: t('App.sense empleat'), life: 3000});
          return;
        }
        await carrega(ParametresService.assignarEmpleat( props.nomAplicacio, props.nomParametre, empleat.value, valor.value));

        toast.add({severity:'success', summary: t('Parametres.parametre assignada correctament'), life: 3000});
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
      empleat,
      empleatsMeta,
      valor,
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
