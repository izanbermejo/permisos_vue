<template>
  <AjudaClient :visible="ajudaClientVisible" :seleccioCallback="ajudaClientCallback" @update:carregat="ajudaClientVisible = false"/>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :draggable="false" style="width: auto; max-width: 80vw; min-width: 520px;">
    <template #header>
      <div style="display: flex; justify-content: flex-start; align-items: center;">
        <h4 v-if="props.isEdicio">{{ $t('ComandesEDI.editar configuracio AVI/EXP') }}</h4>
        <h4 v-else>{{ $t('ComandesEDI.crear configuracio AVI/EXP') }}</h4>
      </div>
    </template>
    <form @submit.prevent="guarda">
      <div class="form">
        <div class="cards-row">
          <div class="card">
            <h5 class="card-header">
              {{ $t('ComandesEDI.Dades') }}
            </h5>
            <div class="card-body">
              <div class="card-fila">
                <div class="element-form">
                  <label>{{ $t('Comandes.Client') }}</label>
                  <CompletableInputServer v-model="state.codiClient" :fetchValue="fetchClient"
                  :onOpenSearch="onOpenAjudaClient" :inputWidth="65" :matchWidth="150" :disabled="props.isEdicio"/>
                  <small v-if="(v.codiClient.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
                </div>
                <div class="element-form">
                  <label>{{ $t('ComandesEDI.codiProveidor') }}</label>
                  <InputText v-model="state.codiProveidor" style="width: 150px;"/>
                  <small v-if="(v.codiProveidor.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
                </div>
              </div>
            </div>
          </div>
          <div class="card">
            <h5 class="card-header">
              {{ $t('ComandesEDI.Configuracions AviExp') }}
            </h5>
            <div class="card-body">
              <div class="card-fila">
                <div class="element-form">
                  <label>{{ $t('ComandesEDI.EdiBox') }}</label>
                  <InputText v-model="state.ediBox" style="width: 150px;"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('ComandesEDI.volAviExp') }}</label>
                  <SelectButton v-model="state.volAviExp" :options="opcionsSiNo" optionValue="valor" optionLabel="clau" />
                </div>
                <div class="element-form">
                  <label>{{ $t('ComandesEDI.volEnviarLG') }}</label>
                  <SelectButton v-model="state.volEnviarLG" :options="opcionsSiNo" optionValue="valor" optionLabel="clau" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card card-full" v-if="mostrarConfiguracioEDI" >
          <div class="card-header filtre">
            <span style="font-size: larger; font-weight: 600;">{{ $t('ComandesEDI.Configuracions entrada comandes') }}</span>
            <span style="margin-left: auto; margin-right: 8px;">
              <Button v-if="permisosStore.tePermis('COMANDES_EDI', 'WRITE_CONFIG')" icon="pi pi-plus" class="p-button-sm" :label="$t('ComandesEDI.Afegir configuracio')" 
              @click="visibleCrearEditarLiniaConfiguracioEDI = true" />
            </span>
          </div>
          <GridConfiguracioEDI ref="gridEDI" :modalParentObert="modalVisible" @showDetall="showDetallEntrada" :aviExp="true"
            @update:close="hide" @configuracioGuardada="onConfiguracioGuardada" @modalObert="modalObert = $event" />
        </div>
        <CrearEditarLiniaConfiguracioEDI v-if="visibleCrearEditarLiniaConfiguracioEDI" :codiClient="state.codiClient" :tipusMissatge="state.tipusMissatge"
        :isEdicio="false" @update:carregat="visibleCrearEditarLiniaConfiguracioEDI = $event" @configuracioGuardada="onConfiguracioGuardada" />
      </div>
      <div style="margin-left: auto; margin-right: 0; margin-top:10px; display: table;">
        <Button tabindex="-1" :label="$t('App.Cancela')" icon="pi pi-undo" class="p-button-secondary p-button-sm" @click="hide" />
        <Button type="submit" :label="$t('App.Desa')" icon="pi pi-save" class="p-button-sm" style="margin-left: 10px;" />
      </div>
    </form>
  </Dialog>
</template>

<script>
import CompletableInputServer from '@/components/CompletableInputServer.vue';
import AjudaClient from '@/views/modals/AjudaClient.vue';
import comandesService from '@/services/comandes.service';
import ediService from "@/services/edi.service";
import { carrega } from "@/services/loader";
import { ref, onMounted, onUnmounted, reactive, computed, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import useVuelidate from "@vuelidate/core";
import { required } from '@vuelidate/validators';
import { isContextMenuKey } from '@/utils/contextmenuUtils';
import { usePermisosStore } from '@/stores/permisos';
import GridConfiguracioEDI from '@/components/edi/GridConfiguracioEDI.vue';
import CrearEditarLiniaConfiguracioEDI from '@/views/modals/CrearEditarLiniaConfiguracioEDI.vue';
import debounce from "debounce";

export default {
  name: "CrearEditarLiniaConfiguracioAviExp",
  components: {
    CompletableInputServer,
    AjudaClient,
    GridConfiguracioEDI,
    CrearEditarLiniaConfiguracioEDI,
  },
  props: {
    codiClient: String,
    codiProveidor: String,
    isEdicio: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const { locale } = useI18n();
    const permisosStore = usePermisosStore();
    const visible = ref(true);
    const ajudaClientVisible = ref(false);
    const ajudaClientSelectItem = ref(null);
    const llocEntregaSeleccionat = ref(null);
    const nouLlocEntrega = ref(null);
    const opAfegirLlocEntrega = ref(null);
    const inputLlocEntrega = ref(null);
    const gridEDI = ref();
    const visibleCrearEditarLiniaConfiguracioEDI = ref(false);
    const configuracioCreada = ref(false);
    const modalObert = ref(false);
    
    const state = reactive({
      codiClient: props.codiClient ?? '',
      codiProveidor: props.codiProveidor ?? '',
      volAviExp: true,
      volEnviarLG: false,
    });

    const opcionsSiNo = [
      {valor: true, clau: t('App.Si')},
      {valor: false, clau: t('App.No')},
    ]

    const opcionsActivar = [
      {valor: true, clau: t('ComandesEDI.activar')},
      {valor: false, clau: t('ComandesEDI.inactivar')},
    ]

    const rules = {
      codiClient: { required },
      codiProveidor: { required },
    }

    const v = useVuelidate(rules, state);

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      if (props.isEdicio || state.codiClient) {
        if (props.isEdicio) {
          await carregaConfiguracio();
        }
        await buscar();
      }
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const modalVisible = computed(() => {
      return ajudaClientVisible.value || visibleCrearEditarLiniaConfiguracioEDI.value || modalObert.value;
    });

    const mostrarConfiguracioEDI = computed(() => {
      return props.isEdicio || configuracioCreada.value;
    });

    const handler = async (ev) => {
      if (isContextMenuKey(ev)) return;
      if (ev.key === 'Escape') {
          await nextTick();
          if (modalVisible.value) return;
          actionHandler(ev, hide);
    }
}
    const actionHandler = (ev, action) => {
        ev.preventDefault();
        action();
    }

    const carregaConfiguracio = async () => {
      let params = new URLSearchParams();
      params.append('codiClient', state.codiClient);
      params.append('codiProveidor', state.codiProveidor);

      let response = await(carrega(ediService.carregaConfiguracioAviExp(params)));
      
      state.codiClient = response.codiClient;
      state.codiProveidor = response.codiProveidor;
      state.ediBox = response.ediBox;
      state.volAviExp = response.volAviExp;
      state.volEnviarLG = response.volEnviarLG;

    }

    const fetchClient = async (valor) => {
      try {
        const resp = await comandesService.obtenirClient(valor, false);
        const client = resp?.data ?? resp;
        return client ? { codi: client.codi, nom: client.nom } : null;
      } catch {
        return null;
      }
    };

    const onOpenAjudaClient = ({ selectItem }) => {
      ajudaClientSelectItem.value = selectItem;
      ajudaClientVisible.value = true;
    };

    const ajudaClientCallback = (client) => {
      if (ajudaClientSelectItem.value) {
        ajudaClientSelectItem.value({ codi: client.codi, nom: client.nom });
      }
      ajudaClientVisible.value = false;
    };

    const focusInput = async () => {
      await nextTick();
      inputLlocEntrega.value?.$el?.focus();
    };

    const hide = () => {
      if (visibleCrearEditarLiniaConfiguracioEDI.value) {
          return;
      }
      emit("update:carregat", false);
    };

    const guarda = async () => {
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        await carrega(ediService.guardaConfiguracioAviExp(state));
        if (!props.isEdicio) {
          configuracioCreada.value = true;
          await buscar();
          return;
        }
        emit('configuracioGuardada');
        hide();
      }
    }

    const buscar = debounce( async () => {
      if (!state.codiClient) return;
      let resultat = await ediService.carregaConfiguracioEDI(state.codiClient)
      if (!gridEDI.value) return;
      gridEDI.value.performSearch(resultat.configuracioEntradaComandes);
    }, 150)

    const onConfiguracioGuardada = async () => {
      visibleCrearEditarLiniaConfiguracioEDI.value = false;
      await buscar();
    }

    return {
      locale,
      visible,
      props,
      state,
      v,
      guarda,
      hide,
      fetchClient,
      onOpenAjudaClient,
      ajudaClientCallback,
      focusInput,
      ajudaClientVisible,
      ajudaClientSelectItem,
      opcionsSiNo,
      opcionsActivar,
      llocEntregaSeleccionat,
      opAfegirLlocEntrega,
      nouLlocEntrega,
      inputLlocEntrega,
      gridEDI,
      buscar,
      permisosStore,
      visibleCrearEditarLiniaConfiguracioEDI,
      mostrarConfiguracioEDI,
      onConfiguracioGuardada,
      modalObert
    };

  },
};
</script>

<style scoped>
.form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
/*   width: auto;
  max-width: 95vw; */
}

.cards-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}

.card {
  flex: 1 1 calc(50% - 5px);
  min-width: 260px;
  height: 100%;
}

.filtre {
    display: flex;
    column-gap: 40px;
    align-items: center;
}

.card-full {
  width: 100px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.card-fila {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
  margin-top: 10px;
}

.element-form {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.element-form label {
  font-weight: 600;
  margin-bottom: 5px;
}

.element-form>label {
  display: block;
  font-weight: 600;
}

.element-form>small {
  display: block;
}

.dialog-content {
  display: inline-flex;
  flex-direction: column;
  width: auto;
}

:deep(.p-selectbutton .p-button) {
  height: 31px;
}
</style>