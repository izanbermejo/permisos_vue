<template>
  <DetallComandaEspecials v-if="visibleDetallComanda" :carregat="visibleDetallComanda" @update:carregat="visibleDetallComanda = $event"
    :comanda="comandaSeleccionada"
    @showProgramaArticle="emit('showProgramaArticle', $event)"
    @comandaTraspassada="emit('refresh')"/>
  <ModalAdjuntsComandes v-if="visibleModalAdjunts" :carregat="visibleModalAdjunts"
    :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"
    @update:carregat="visibleModalAdjunts = $event" :comanda="comandaSeleccionada"
    @update:numAdjunts="gridComandes.updateAdjunts($event)" />
  <DetallJustificantEnviat v-if="visibleDetallJustificantEnviat" :carregat="visibleDetallJustificantEnviat"  
    @update:carregat="visibleDetallJustificantEnviat = $event" 
    :comanda="comandaLoaded"/>
    <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
      :draggable="false" :header="$t('Comandes.Comandes del client')" style="width: 1400px">
      <div class="card" style="margin-top: 10px;">
        <h6 class="card-header" style="font-weight: 600;">
          {{ $t('Comandes.Filtre')}}
        </h6>
        <div class="card-body">
          <form @submit.prevent="busca">
            <div class="form">
              <div class="element-form">
                <label>{{ $t('App.Des del')}}</label>
                <span>
                  <CalendarInput v-model="state.dataInici" :invalid="v.dataInici.$errors.length"/>
                </span>
                <small v-if="(v.dataInici.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
              </div>
              <div class="element-form">
                <label>{{ $t('App.Fins a')}}</label>
                <span>
                  <CalendarInput v-model="state.dataFi" :invalid="v.dataFi.$errors.length"/>
                </span>
                <small v-if="(v.dataFi.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
              </div>
              <div class="element-form">
                <label>{{ $t('Comandes.Comanda')}}</label>
                <InputText ref="inputComanda" v-model="state.comanda"  
                      @focus="$event.originalTarget.select()"
                      style="width: 300px" />
              </div>
              <div class="element-form" style="display: flex; align-items: flex-end; margin-bottom: 7px;">
                <span style="display: flex; column-gap: 5px; align-items: flex-end;">
                  <Checkbox v-model="state.includeServides" :binary="true" tabindex="-1"/>
                  <label>{{ $t('Comandes.Incloure servides') }}</label>
                </span>
              </div>
              <div class="element-form" style="padding-top: 5px;display:flex;justify-content:flex-end;align-items:flex-end" >
                <Button type="submit" :label="$t('App.Busca')" icon="pi pi-search" class="p-button-sm" />
              </div>
            </div>
          </form>
        </div>
      </div>
      <div style="margin-top: 15px;">
        <GridComandesEspecials ref="gridComandes" :client="props.codiClient" :modalParentObert="modalVisible"
              @showDetall="showDetallComanda($event)"
              @mostrarAdjunts="mostrarAdjunts($event)"
              @mostrarDetallEnviamentJustificant="mostrarDetallEnviamentJustificant($event)"
              @justificantEnviat="busca()"/>
      </div>
    </Dialog>
  </template>
  
<script>
import comandesService from "@/services/comandes.service";
import { ref, onMounted, onUnmounted, reactive, nextTick, computed } from "vue";
import { useI18n } from "vue-i18n";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { carrega } from '@/services/loader';
import { isContextMenuKey } from "@/utils/contextmenuUtils";
import GridComandesEspecials from "./GridComandesEspecials.vue";
import ModalAdjuntsComandes from '@/views/modals/ModalAdjuntsComandes.vue';
import DetallComandaEspecials from '@/views/modals/detallespecials/DetallComandaEspecials.vue';
import DetallJustificantEnviat from '@/views/modals/justificant/DetallJustificantEnviat.vue';
import { usePermisosStore } from '@/stores/permisos';

  export default {
    name: "ComandesEspecials",
    components: {
      GridComandesEspecials,
      ModalAdjuntsComandes,
      DetallComandaEspecials,
      DetallJustificantEnviat,
    },
    props: {
        codiClient : String,
    },
    setup(props, { emit }) {
      const { locale } = useI18n();
      const permisosStore = usePermisosStore();
      const visible = ref(true);
      const inputComanda = ref();
      const gridComandes = ref();
      const visibleDetallComanda = ref(false);
      const visibleModalAdjunts = ref(false);
      const visibleDetallJustificantEnviat = ref(false);
      const comandaSeleccionada = ref();
      const comandaLoaded = ref();
      const clientLoaded = ref();
  
      onMounted(async () => {
        try {
          busca();
        } catch (e) {
          hide();
        }
        // Inicialització del listener i focus a l'editText
        document.addEventListener("keydown", handler);
        nextTick(() => {
          inputComanda.value.$el.focus();
        });
      });
  
      onUnmounted(() => {
        document.removeEventListener("keydown", handler);
      });

      const state = reactive({
        dataInici: new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
        dataFi: new Date(),
        comanda: '',
        includeServides: false,
      });
      const validDate = (value) => {
        return (value instanceof Date);
      }
      const rules = {
        dataInici: {required, valid : validDate},
        dataFi: {required, valid : validDate},
      }
      const v = useVuelidate(rules, state);

      const modalVisible = computed(() => {
        return visibleDetallComanda.value
          || visibleModalAdjunts.value;
      });

      const busca = async () => {
        let comandesServides = await carrega(comandesService.obtenirComandesEspecials(props.codiClient, state.dataInici, state.dataFi, state.comanda, state.includeServides));
        gridComandes.value.refresh(comandesServides);
      }

      const showDetallComanda = (comanda) => {
        comandaSeleccionada.value = comanda;
        visibleDetallComanda.value = true;
      }

      const mostrarAdjunts = async (comanda) => {
        comandaSeleccionada.value = comanda;
        visibleModalAdjunts.value = true;
      }

      const mostrarDetallEnviamentJustificant = async (comanda) => {
        comandaSeleccionada.value = comanda;
        comandaLoaded.value = await carrega(comandesService.obtenirComandaEspecial(comanda));
        visibleDetallJustificantEnviat.value = true;
      }
    
      const handler = (key) => {
        // No processem l'event en cas que es produeixi des d'un ContextMenu o Dropdown
        if (isContextMenuKey(key)) return;
        // En cas que hagi un modal visible
        if (modalVisible.value) return;
        if (key.key === 'Escape') {
          key.preventDefault();
          hide();
        }
      }
  
      const hide = () => {
        emit("update:carregat", false);
      };
    
      return {
        emit,
        permisosStore,
        locale,
        visible,
        props,
        state,
        inputComanda,
        gridComandes,
        modalVisible,
        visibleDetallComanda,
        visibleModalAdjunts,
        busca,
        showDetallComanda,
        mostrarAdjunts,
        v,
        comandaSeleccionada,
        comandaLoaded,
        clientLoaded,
        hide,
        mostrarDetallEnviamentJustificant,
        visibleDetallJustificantEnviat,
      };
  
    },
  };
</script>
  
  <style scoped>
    .card-body {
      padding: 10px 10px;
    }

    .form {
      margin-top: 2px;
      display: inline-flex;
      flex-wrap: wrap;
      gap: 6px 30px;
    }

    .element-form > label {
      display: block;
      font-weight: 600;
    }

    .element-form > small {
      display: block;
    }


    .enllas {
        cursor: pointer;
    }
  </style>
  