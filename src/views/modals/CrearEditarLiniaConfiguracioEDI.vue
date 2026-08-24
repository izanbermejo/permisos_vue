<template>
  <AjudaClient :visible="ajudaClientVisible" :seleccioCallback="ajudaClientCallback" @update:carregat="ajudaClientVisible = false"/>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" 
    :draggable="false" style="width: 1200px">
    <template #header>
      <div style="display: flex; justify-content: flex-start; align-items: center;">
        <h4 v-if="props.isEdicio">{{ $t('ComandesEDI.editar configuracio') }}</h4>
        <h4 v-else>{{ $t('ComandesEDI.crear configuracio') }}</h4>
        <div style="display: flex; gap: 8px; margin-bottom: 10px; margin-left: 40px;">
          <SelectButton v-model="state.isActiu" :options="opcionsActivar" optionValue="valor" optionLabel="clau"/>
        </div>
      </div>
    </template>
    <form @submit.prevent="guarda">
      <div class="form">
        <div class="card">
          <h5 class="card-header">
            {{ $t('ComandesEDI. Estrategia client') }}
          </h5>
          <div class="card-body">
            <div class="card-fila">
              <div class="element-form">
                <label>{{ $t('Comandes.Client') }}</label>
                <CompletableInputServer v-model="state.codiClient" :fetchValue="fetchClient" 
                :onOpenSearch="onOpenAjudaClient" :inputWidth="65" :matchWidth="185" :disabled="props.isEdicio"/>
                <small v-if="(v.codiClient.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
              </div>
              <div class="element-form">
                <label>{{ $t('ComandesEDI.linies.modalEditar.tipus') }}</label>
                <Dropdown v-model="state.tipusMissatge" :options="tipusMissatgeOptions" optionLabel="clau" optionValue="valor"
                  placeholder="Tipus" class="w-full md:w-14rem" style="margin-right: 20px" :disabled="props.isEdicio"/>
                <small v-if="(v.tipusMissatge.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
              </div>
            </div>
            <div class="card-fila">
              <div class="element-form">
                <label>{{ $t('ComandesEDI.ferm orientatiu') }}</label>
                <SelectButton v-model="state.fermOrientatiu" :options="fermOrientatiuOptions" optionValue="valor" optionLabel="clau" />
                <small v-if="(v.fermOrientatiu.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
              </div>
              <div class="element-form">
                <label>{{ $t('ComandesEDI.Estrategia') }}</label>
                <Dropdown v-model="state.estrategiaEdi" :options="estrategies.filter(e => e.tipus === state.fermOrientatiu)" optionLabel="clau" optionValue="valor"
                  placeholder="Tipus" class="w-full md:w-14rem" style="margin-right: 20px" :disabled="!state.fermOrientatiu"/>
                <small v-if="(v.estrategiaEdi.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <h5 class="card-header">
            {{ $t('ComandesEDI. Informacio missatge') }}
          </h5>
          <div class="card-body">
            <div class="card-fila">
              <div class="element-form">
                <label>{{ $t('ComandesEDI.Edibox') }}</label>
                <InputText v-model="state.ediBox" style="width: 220px;"/>
                <small v-if="(v.ediBox.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
              </div>
              <div class="element-form">
                <label>{{ $t('ComandesEDI.nad02') }}</label>
                <InputText v-model="state.nad02"/>
                <small v-if="(v.nad02.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
              </div>
            </div>
            <div class="card-fila">
              <div class="element-form">
                <label>{{ $t('ModalAjudaArticleClient.Codi proveidor') }}</label>
                <InputText :disabled="props.isEdicio" v-model="state.codiProveidor"/>
                <small v-if="(v.codiProveidor.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit')}}</small>
              </div>
              <div class="element-form">
                <label>{{ $t('ComandesEDI.Lloc entrega') }}</label>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                  <div v-if="state.llocsEntrega.length > 0" class="chips-container">
                    <span v-for="(lloc, index) in state.llocsEntrega" :key="index" class="chip">
                      {{ lloc }}
                      <i class="pi pi-times" @click="eliminarLloc(index)" />
                    </span>
                  </div>
                  <!-- Botón para agregar nuevo lugar de entrega -->
                  <Button type="button" icon="pi pi-plus" class="p-button-sm" style="height: 30px; width: 30px;" @click="afegirLlocEntrega" />
                  <!-- Panel de overlay para agregar nuevo lugar de entrega -->
                  <OverlayPanel ref="opAfegirLlocEntrega" :dismissable="true" @show="focusInput">
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                      <InputText ref="inputLlocEntrega" placeholder="Lloc entrega" v-model="nouLlocEntrega"/>
                      <Button label="Afegir" @click="afegirNouLloc" />
                    </div>
                  </OverlayPanel>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <h5 class="card-header">
            {{ $t('ComandesEDI.Informacio dates') }}
          </h5>
          <div class="card-body">
            <div class="card-fila">
              <div class="element-form">
                <label>{{ $t('ComandesEDI.Dies a restar') }}</label>
                <InputNumber v-model="state.diesRestar" :useGrouping="false" min="0"/>
                <small v-if="(v.diesRestar.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
              </div>
              <div class="element-form">
                <label>{{ $t('ComandesEDI.contar cap setmana') }}</label>
                <SelectButton v-model="state.restaCapSemana" :options="opcionsSiNo" optionValue="valor" optionLabel="clau"/>
              </div>
            </div>
            <div class="card-fila">
              <div class="element-form">
                <label>{{ $t('ComandesEDI.Dies sortida') }}</label>
                <div style="display: flex; flex-direction: row; gap: 10px;">
                  <div v-for="dia in diesSortida" :key="dia.valor" style="display: flex; flex-direction: column; align-items: center;">
                    <span>{{ dia.clau }}</span>
                    <Checkbox v-model="state.diesSortida" :value="dia.valor" />
                  </div>
                </div>
              </div>
              <div class="element-form">
                <label>{{ $t('ComandesEDI.Dies de tall') }}</label>
                <InputNumber v-model="state.diesTall" :useGrouping="false" min="0"/>
                <small v-if="(v.diesTall.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h5 class="card-header">
            {{ $t('ComandesEDI.Informacio extra') }}
          </h5>
          <div class="card-body">
            <div class="card-fila">
              <div class="element-form">
                <label>{{ $t('ComandesEDI.Considerar albarans') }}</label>
                <SelectButton v-model="state.considerarAlbarans" :options="opcionsSiNo" optionValue="valor" optionLabel="clau"/>
              </div>
              <div class="element-form">
                <label>{{ $t('ComandesEDI.Considerar dues dates') }}</label>
                <SelectButton v-model="state.considerarDuesDates" :options="opcionsSiNo" optionValue="valor" optionLabel="clau"/>
              </div>
            </div>
            <div class="card-fila">
              <div class="element-form">
                <label>{{ $t('ComandesEDI.tipus document edi') }}</label>
                <InputText v-model="state.tipusDocumentEdi"/>
              </div>
            </div>
          </div>
        </div>
        <div class="card" style="width: 100%;">
          <h5 class="card-header">
            {{ $t('ComandesEDI.Comentaris') }}
          </h5>
          <div class="card-body">
            <Textarea v-model="state.comentaris" style="width: 100%;" autoResize  rows="2" cols="150" />
          </div>
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

export default {
  name: "CrearEditarLiniaConfiguracioEDI",
  components: {
    CompletableInputServer,
    AjudaClient,
  },
  props: {
    codiClient: String,
    tipusMissatge: String,
    isEdicio: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const { locale } = useI18n();
    const visible = ref(true);
    const ajudaClientVisible = ref(false);
    const ajudaClientSelectItem = ref(null);
    const llocEntregaSeleccionat = ref(null);
    const nouLlocEntrega = ref(null);
    const opAfegirLlocEntrega = ref(null);
    const inputLlocEntrega = ref(null);
    
    const state = reactive({
      codiClient: props.codiClient ?? '',
      tipusMissatge: props.tipusMissatge ?? '',
      fermOrientatiu: '',
      ediBox: '',
      nad02: '',
      codiProveidor: '',
      informacioSortida: {},
      diesSortida: [],
      diesRestar: 0,
      restaCapSemana: true,
      considerarAlbarans: true,
      considerarDuesDates: false,
      estrategiaEdi: null,
      diesTall: 180,
      llocsEntrega: [],
      tipusDocumentEdi: null,
      comentaris: null,
      isActiu: true,
    });

    const tipusMissatgeOptions = [
      { valor: 'DELFOR', clau: "DELFOR" },
      { valor: 'DELJIT', clau: "DELJIT" },
      { valor: 'DELINS', clau: "DELINS" },
      { valor: 'ORDERR', clau: "ORDERR" },
    ];

    const fermOrientatiuOptions = [
      { valor: "FERM", clau: t("Comandes.Ferm"), icon: 'okcheck' },
      { valor: "ORIENTATIU", clau: t("Comandes.Orientatiu"), icon: 'bruixola' },
    ];

    const estrategies = [
      { valor: 0, clau: "0", tipus: "FERM" },
      { valor: 1, clau: "1", tipus: "FERM" },
      { valor: 2, clau: "2", tipus: "FERM" },
      { valor: 3, clau: "3", tipus: "FERM" },
      { valor: 4, clau: "4", tipus: "ORIENTATIU" },
      { valor: 5, clau: "5", tipus: "ORIENTATIU" },
    ];

    const diesSortida = [
      { valor: 1, clau: t("App.dilluns curt") },
      { valor: 2, clau: t("App.dimarts curt") },
      { valor: 3, clau: t("App.dimecres curt") },
      { valor: 4, clau: t("App.dijous curt") },
      { valor: 5, clau: t("App.divendres curt") },
    ];

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
      tipusMissatge: { required },
      fermOrientatiu: { required },
      ediBox: { required },
      nad02: { required },
      codiProveidor: { required },
      estrategiaEdi: { required },
      diesTall: { required },
      diesRestar: { required },
    }

    const v = useVuelidate(rules, state);
    
    onMounted(async () => {
      await nextTick();
      document.addEventListener("keydown", handler);
      if (props.isEdicio) 
          carregaConfiguracio();
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const modalVisible = computed(() => {
      return ajudaClientVisible.value;
    });

    const handler = (ev) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu
      if (isContextMenuKey(ev))  return;
      // Si no hi ha cap modal obert
      if (modalVisible.value) return;
      // Si no està el focus al grid
      // if (!props.focused) return
      // Controls
      if (ev.key === 'Escape') {
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
      params.append('tipusMissatge', state.tipusMissatge);

      let response = await(carrega(ediService.carregaConfiguracionsEntrades(params)));

      state.fermOrientatiu = response.fermOrientatiu;
      state.ediBox = response.ediBox;
      state.nad02 = response.nad02;
      state.codiProveidor = response.codiProveidor;
      state.diesSortida = response.diesSortida;
      state.diesRestar = Math.abs(response.diesRestar);
      state.restaCapSemana = response.diesRestar >= 0;
      state.considerarAlbarans = response.considerarAlbarans;
      state.considerarDuesDates = response.considerarDuesDates;
      state.estrategiaEdi = response.estrategiaEdi;
      state.diesTall = response.diesTall;
      state.llocsEntrega = response.llocsEntrega;
      state.tipusDocumentEdi = response.tipusDocumentEdi;
      state.comentaris = response.comentaris;
      state.isActiu = response.isActiu;
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

    const afegirLlocEntrega = (event) => { 
      opAfegirLlocEntrega.value.toggle(event); 
    }

    const afegirNouLloc = () => {
      if (!nouLlocEntrega.value) return;

      state.llocsEntrega.push(nouLlocEntrega.value);
      nouLlocEntrega.value = '';
      opAfegirLlocEntrega.value.hide();
    };

    const eliminarLloc = (index) => {
      state.llocsEntrega.splice(index, 1);
    };

    const focusInput = async () => {
      await nextTick();
      inputLlocEntrega.value?.$el?.focus();
    };

    const hide = () => {
      emit("update:carregat", false);
    };

    const guarda = async () => {
      state.diesSortida = state.diesSortida.sort((a, b) => a - b);
      state.diesRestar = state.restaCapSemana ? Math.abs(state.diesRestar) : -Math.abs(state.diesRestar);
      state.informacioSortida = {
        diesSortida: state.diesSortida,
        diesRestar: state.diesRestar,
      }

      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        await carrega(ediService.guardaConfiguracionsEntrades(state));
        emit('configuracioGuardada');
        hide();
      }

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
      afegirLlocEntrega,
      afegirNouLloc,
      eliminarLloc,
      focusInput,
      ajudaClientVisible,
      ajudaClientSelectItem,
      opcionsSiNo,
      opcionsActivar,
      tipusMissatgeOptions,
      fermOrientatiuOptions,
      estrategies,
      diesSortida,
      llocEntregaSeleccionat,
      opAfegirLlocEntrega,
      nouLlocEntrega,
      inputLlocEntrega,
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
  font-weight: 600;
}

.element-form>small {
  display: block;
}

.break {
  flex-basis: 100%;
  height: 0;
}

:deep(.p-listbox-list) {
  padding: 0px !important;
}

.card {
  width: 48%;
  margin-top: 20px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 5px 16px;
}

.card-fila{
  display: flex;
  flex-direction: row;
  gap: 35px;
  align-items: center;
}

:deep(.p-selectbutton .p-button) {
  height: 31px;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 300px; /* ajusta a tu layout */
}

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e0e0e0;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
}

.chip i {
  cursor: pointer;
  font-size: 12px;
}
</style>
