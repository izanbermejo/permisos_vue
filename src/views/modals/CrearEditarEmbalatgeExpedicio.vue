<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" 
    :draggable="false" style="width: 1800px">
    <template #header>
      <div style="display: flex; justify-content: flex-start; align-items: center;">
        <h4>{{ $t('ModalAjudaArticleClient.Embalatge expedicio') }}</h4>
      </div>
    </template>
    <form @submit.prevent="guarda">
      <div class="form">
        <div class="card">
          <h5 class="card-header">
            <font-awesome-icon icon="fa-solid fa-rotate" style="font-size: 1.25rem" />
            {{ $t('EmbalatgeExpedicio.Retornable') }}
          </h5>
          <div class="card-body" style="display: flex; flex-direction: column; gap: 0px;">
            <div class="card">
              <h5 class="card-header">
                {{ $t('EmbalatgeExpedicio.1 - Caixa') }}
              </h5>
              <div class="card-body" style="display: flex; flex-direction: row; gap: 5px;">
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Referencia') }}</label>
                  <InputText v-model="state.nivell1Retornable.referencia" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Descripcio') }}</label>
                  <InputText v-model="state.nivell1Retornable.descripcio" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.codi element') }}</label>
                  <InputText v-model="state.nivell1Retornable.codiElement" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
              </div>
            </div>
            <div class="break" />
            <div class="card">
              <h5 class="card-header">
                {{ $t('EmbalatgeExpedicio.2 - Palet') }}
              </h5>
              <div class="card-body" style="display: flex; flex-direction: row; gap: 5px;">
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Referencia') }}</label>
                  <InputText v-model="state.nivell2Retornable.referencia" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Descripcio') }}</label>
                  <InputText v-model="state.nivell2Retornable.descripcio" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.codi element') }}</label>
                  <InputText v-model="state.nivell2Retornable.codiElement" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
              </div>
            </div>
            <div class="break" />
            <div class="card">
              <h5 class="card-header">
                {{ $t('EmbalatgeExpedicio.3 - Tapa palet') }}
              </h5>
              <div class="card-body" style="display: flex; flex-direction: row; gap: 5px;">
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Referencia') }}</label>
                  <InputText v-model="state.nivell3Retornable.referencia" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Descripcio') }}</label>
                  <InputText v-model="state.nivell3Retornable.descripcio" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.codi element') }}</label>
                  <InputText v-model="state.nivell3Retornable.codiElement" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
              </div>
            </div>
            <div class="break" />
            <div class="card">
              <h5 class="card-header">
                {{ $t('EmbalatgeExpedicio.4 - Separador caixa') }}
              </h5>
              <div class="card-body" style="display: flex; flex-direction: row; gap: 5px;">
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Referencia') }}</label>
                  <InputText v-model="state.nivell4Retornable.referencia" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Descripcio') }}</label>
                  <InputText v-model="state.nivell4Retornable.descripcio" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.codi element') }}</label>
                  <InputText v-model="state.nivell4Retornable.codiElement" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.multiplicador') }}</label>
                  <InputNumber v-model="state.nivell4Retornable.factorMultiplicador" :useGrouping="false" :disabled="!permisEditar"/>
                </div>
              </div>
            </div>
            <div class="break" />
            <div class="card">
              <h5 class="card-header">
                {{ $t('EmbalatgeExpedicio.5 - Tapa caixa') }}
              </h5>
              <div class="card-body" style="display: flex; flex-direction: row; gap: 5px;">
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Referencia') }}</label>
                  <InputText v-model="state.nivell5Retornable.referencia" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Descripcio') }}</label>
                  <InputText v-model="state.nivell5Retornable.descripcio" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.codi element') }}</label>
                  <InputText v-model="state.nivell5Retornable.codiElement" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.elements fixes') }}</label>
                  <InputNumber v-model="state.nivell5Retornable.numElementsFixes" :useGrouping="false" min="0" :disabled="!permisEditar"/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <h5 class="card-header">
            <font-awesome-icon icon="fa-solid fa-ban" style="font-size: 1.25rem" />
            {{ $t('EmbalatgeExpedicio.No retornable') }}
          </h5>
          <div class="card-body" style="display: flex; flex-direction: column; gap: 0px;">
            <div class="card">
              <h5 class="card-header">
                {{ $t('EmbalatgeExpedicio.1 - Caixa') }}
              </h5>
              <div class="card-body" style="display: flex; flex-direction: row; gap: 5px;">
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Referencia') }}</label>
                  <InputText v-model="state.nivell1NoRetornable.referencia" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Descripcio') }}</label>
                  <InputText v-model="state.nivell1NoRetornable.descripcio" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.codi element') }}</label>
                  <InputText v-model="state.nivell1NoRetornable.codiElement" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
              </div>
            </div>
            <div class="break" />
            <div class="card">
              <h5 class="card-header">
                {{ $t('EmbalatgeExpedicio.2 - Palet') }}
              </h5>
              <div class="card-body" style="display: flex; flex-direction: row; gap: 5px;">
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Referencia') }}</label>
                  <InputText v-model="state.nivell2NoRetornable.referencia" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Descripcio') }}</label>
                  <InputText v-model="state.nivell2NoRetornable.descripcio" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.codi element') }}</label>
                  <InputText v-model="state.nivell2NoRetornable.codiElement" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
              </div>
            </div>
            <div class="break" />
            <div class="card">
              <h5 class="card-header">
                {{ $t('EmbalatgeExpedicio.3 - Tapa palet') }}
              </h5>
              <div class="card-body" style="display: flex; flex-direction: row; gap: 5px;">
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Referencia') }}</label>
                  <InputText v-model="state.nivell3NoRetornable.referencia" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Descripcio') }}</label>
                  <InputText v-model="state.nivell3NoRetornable.descripcio" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.codi element') }}</label>
                  <InputText v-model="state.nivell3NoRetornable.codiElement" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
              </div>
            </div>
            <div class="break" />
            <div class="card">
              <h5 class="card-header">
                {{ $t('EmbalatgeExpedicio.4 - Separador caixa') }}
              </h5>
              <div class="card-body" style="display: flex; flex-direction: row; gap: 5px;">
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Referencia') }}</label>
                  <InputText v-model="state.nivell4NoRetornable.referencia" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Descripcio') }}</label>
                  <InputText v-model="state.nivell4NoRetornable.descripcio" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.codi element') }}</label>
                  <InputText v-model="state.nivell4NoRetornable.codiElement" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.multiplicador') }}</label>
                  <InputNumber v-model="state.nivell4NoRetornable.factorMultiplicador" :useGrouping="false" :disabled="!permisEditar"/>
                </div>
              </div>
            </div>
            <div class="break" />
            <div class="card">
              <h5 class="card-header">
                {{ $t('EmbalatgeExpedicio.5 - Tapa caixa') }}
              </h5>
              <div class="card-body" style="display: flex; flex-direction: row; gap: 5px;">
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Referencia') }}</label>
                  <InputText v-model="state.nivell5NoRetornable.referencia" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.Descripcio') }}</label>
                  <InputText v-model="state.nivell5NoRetornable.descripcio" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.codi element') }}</label>
                  <InputText v-model="state.nivell5NoRetornable.codiElement" style="width: 220px;" :disabled="!permisEditar"/>
                </div>
                <div class="element-form">
                  <label>{{ $t('EmbalatgeExpedicio.elements fixes') }}</label>
                  <InputNumber v-model="state.nivell5NoRetornable.numElementsFixes" :useGrouping="false" min="0" :disabled="!permisEditar"/>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="break" />
        <div v-if="permisEditar" style="margin-left: auto; margin-right: 0; margin-top:10px">
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
import ediService from "@/services/edi.service";
import { carrega } from "@/services/loader";
import { ref, onMounted, onUnmounted, reactive } from "vue";
import { isContextMenuKey } from '@/utils/contextmenuUtils';
import { usePermisosStore } from "@/stores/permisos";


export default {
  name: "CrearEditarEmbalatgeExpedicio",
  props: {
    artInt: String,
    cliCod: String,
  },
  setup(props, { emit }) {
    const permisosStore = usePermisosStore();
    const visible = ref(true);
    const permisEditar = permisosStore.tePermis('COMANDES_EDI', 'EDITAR_EMBALATGE_EXPEDICIO')
    
    const state = reactive({
      nivell1NoRetornable: {
        tipus: 'CAIXA',
        isRetornable: false,
        referencia: '',
        descripcio: '',
        codiElement: '',
      },
      nivell1Retornable: {
        tipus: 'CAIXA',
        isRetornable: true,
        referencia: '',
        descripcio: '',
        codiElement: '',
      },
      nivell2NoRetornable: {
        tipus: 'PALET',
        isRetornable: false,
        referencia: '',
        descripcio: '',
        codiElement: '',
      },
      nivell2Retornable: {
        tipus: 'PALET',
        isRetornable: true,
        referencia: '',
        descripcio: '',
        codiElement: '',
      },
      nivell3NoRetornable: {
        tipus: 'TAPA_PALET',
        isRetornable: false,
        referencia: '',
        descripcio: '',
        codiElement: '',
      },
      nivell3Retornable: {
        tipus: 'TAPA_PALET',
        isRetornable: true,
        referencia: '',
        descripcio: '',
        codiElement: '',
      },
      nivell4NoRetornable: {
        tipus: 'SEPARADOR_CAIXA',
        isRetornable: false,
        referencia: '',
        descripcio: '',
        codiElement: '',
        factorMultiplicador: 1,
      },
      nivell4Retornable: {
        tipus: 'SEPARADOR_CAIXA',
        isRetornable: true,
        referencia: '',
        descripcio: '',
        codiElement: '',
        factorMultiplicador: 1,
      },
      nivell5NoRetornable: {
        tipus: 'TAPA_CAIXA',
        isRetornable: false,
        referencia: '',
        descripcio: '',
        codiElement: '',
        numElementsFixes: 0,
      },
      nivell5Retornable: {
        tipus: 'TAPA_CAIXA',
        isRetornable: true,
        referencia: '',
        descripcio: '',
        codiElement: '',
        numElementsFixes: 0,
      },
    });

    const nivells = [
      'nivell1NoRetornable',
      'nivell1Retornable',
      'nivell2NoRetornable',
      'nivell2Retornable',
      'nivell3NoRetornable',
      'nivell3Retornable',
      'nivell4NoRetornable',
      'nivell4Retornable',
      'nivell5NoRetornable',
      'nivell5Retornable'
    ];

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      carregaEmbalatgeExpedicio();
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const handler = (ev) => {
        // No processem l'event en cas que es produeixi des d'un ContextMenu
        if (isContextMenuKey(ev))  return;
        // Si no hi ha cap modal obert
        // if (modalVisible.value) return;
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

    const carregaEmbalatgeExpedicio = async () => {

      let response = await(carrega(ediService.carregaEmbalatgeExpedicio(props.artInt, props.cliCod)));

      nivells.forEach(key => {

        state[key].referencia = response[key]?.referencia ?? '';
        state[key].descripcio = response[key]?.descripcio ?? '';
        state[key].codiElement = response[key]?.codiElement ?? '';

        if ('multiplicador' in state[key]) {
          state[key].factorMultiplicador = response[key]?.factorMultiplicador ?? 0;
        }

        if ('elementsFixes' in state[key]) {
          state[key].numElementsFixes = response[key]?.numElementsFixes ?? 0;
        }
      });
    }

    const hide = () => {
      emit("update:carregat", false);
    };

    const guarda = async () => {
      const dadesEnviar = structuredClone(state);

      nivells.forEach(key => {
        if (dadesEnviar[key].referencia == '') dadesEnviar[key] = null;
      });

      await(carrega(ediService.guardarEmbalatgeExpedicio(props.artInt, props.cliCod, dadesEnviar)));
    }

    return {
      visible,
      props,
      state,
      guarda,
      hide,
      permisEditar,
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
  width: 100%;
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
  margin-top: 10px;
}

.form>.card {
  width: 49%;
}

.card-interior .card-body {
  padding: 10px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 5px 16px;
}

.card-fila{
  display: flex;
  flex-direction: row;
  gap: 35px;
  align-items: center;
}

:deep(.p-inputnumber), :deep(.p-inputnumber .p-inputtext) {
  width: 100%;
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
