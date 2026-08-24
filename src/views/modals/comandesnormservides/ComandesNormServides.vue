<template>
  <DetallComandaNormalitzats v-if="visibleDetallComanda" :carregat="visibleDetallComanda" @update:carregat="visibleDetallComanda = $event"
    :comanda="comandaSeleccionada" />
  <EnviarJustificant v-if="visibleEnviarJustificant" :carregat="visibleEnviarJustificant"  
    @update:carregat="visibleEnviarJustificant = $event" 
    @justificantEnviat="justificantEnviat"
    :client="clientLoaded" :comanda="comandaLoaded"/>
  <DetallJustificantEnviat v-if="visibleDetallJustificantEnviat" :carregat="visibleDetallJustificantEnviat"  
    @update:carregat="visibleDetallJustificantEnviat = $event" 
    :comanda="comandaLoaded"/>
  <EditorComentaris v-if="visibleComentarisComanda" :carregat="visibleComentarisComanda" @update:carregat="visibleComentarisComanda = $event;"
    :text="comentarisInternComanda" :callback="updateComentarisComanda" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <ModalAdjuntsComandes v-if="visibleModalAdjunts" :carregat="visibleModalAdjunts"
    :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"
    @update:carregat="visibleModalAdjunts = $event" :comanda="comandaSeleccionada"
    @update:numAdjunts="gridComandes.updateAdjunts($event)" />
    <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
      :draggable="false" :header="$t('Comandes.Comandes servides')" style="width: 1400px">
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
              <div class="element-form" style="padding-top: 5px;display:flex;justify-content:flex-end;align-items:flex-end" >
                <Button type="submit" :label="$t('App.Busca')" icon="pi pi-search" class="p-button-sm" />
              </div>
            </div>
          </form>
        </div>
      </div>
      <div style="margin-top: 15px;">
        <GridComandesNormServides ref="gridComandes" :client="props.codiClient" :modalParentObert="modalVisible"
              @showDetall="showDetallComanda($event)"
              @mostrarDetallEnviamentJustificant="mostrarDetallEnviamentJustificant($event)"
              @enviarJustificant="enviarJustificant($event)"
              @mostrarAdjunts="mostrarAdjunts($event)"
              @mostrarComentaris="mostrarComentaris($event)" />
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
import GridComandesNormServides from "./GridComandesNormServides.vue";
import DetallComandaNormalitzats from "../detallnormalitzats/DetallComandaNormalitzats.vue";
import DetallJustificantEnviat from "../justificant/DetallJustificantEnviat.vue";
import ModalAdjuntsComandes from '@/views/modals/ModalAdjuntsComandes.vue';
import EnviarJustificant from '@/views/modals/justificant/EnviarJustificant.vue';
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import { usePermisosStore } from "@/stores/permisos";

  export default {
    name: "ComandesNormServides",
    components: {
      GridComandesNormServides,
      DetallComandaNormalitzats,
      DetallJustificantEnviat,
      ModalAdjuntsComandes,
      EnviarJustificant,
      EditorComentaris
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
      const visibleDetallJustificantEnviat = ref(false);
      const visibleModalAdjunts = ref(false);
      const visibleEnviarJustificant = ref(false);
      const visibleComentarisComanda = ref(false);
      const comentarisInternComanda = ref();
      const comandaSeleccionada = ref();
      const comandaLoaded = ref();
      const clientLoaded = ref();
  
      onMounted(async () => {
        // Càrrega de l'articleclient passat com a paràmetre
        try {
          // Obtenció del client (per mostrar l'adreça)
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
        dataInici: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        dataFi: new Date(),
        comanda: '',
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
          || visibleDetallJustificantEnviat.value
          || visibleModalAdjunts.value
          || visibleEnviarJustificant.value
          || visibleComentarisComanda.value;
      });

      const busca = async () => {
        let comandesServides = await carrega(comandesService.obtenirComandesNormalitzatServides(props.codiClient, state.dataInici, state.dataFi, state.comanda));
        gridComandes.value.refresh(comandesServides);
      }

      const showDetallComanda = (comanda) => {
        comandaSeleccionada.value = comanda;
        visibleDetallComanda.value = true;
      }

      const mostrarDetallEnviamentJustificant = async (comanda) => {
        comandaSeleccionada.value = comanda;
        comandaLoaded.value = await carrega(comandesService.obtenirComandaNormalitzat(comanda));
        visibleDetallJustificantEnviat.value = true;
      }

      const mostrarAdjunts = async (comanda) => {
        comandaSeleccionada.value = comanda;
        visibleModalAdjunts.value = true;
      }

      const enviarJustificant = async (comanda) => {
        comandaSeleccionada.value = comanda;
        clientLoaded.value = await(carrega(comandesService.obtenirClient(props.codiClient)));
        comandaLoaded.value = await carrega(comandesService.obtenirComandaNormalitzat(comanda));
        visibleEnviarJustificant.value = true;
      }

      const mostrarComentaris = async(rowComanda) => {
        comandaSeleccionada.value = rowComanda.comanda;
        comentarisInternComanda.value = rowComanda.comentariIntern;
        visibleComentarisComanda.value = true;
      }

      const updateComentarisComanda = async (text) => {
        await carrega(comandesService.actualitzarComentarisComanda(comandaSeleccionada.value, text.trim()));
        gridComandes.value.updateComentaris(text.trim());
      }

      const justificantEnviat = async() => {
        nextTick(() => {
          busca();
        });
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
        locale,
        permisosStore,
        visible,
        props,
        state,
        inputComanda,
        gridComandes,
        modalVisible,
        visibleDetallComanda,
        visibleDetallJustificantEnviat,
        visibleModalAdjunts,
        visibleEnviarJustificant,
        visibleComentarisComanda,
        comentarisInternComanda,
        busca,
        showDetallComanda,
        mostrarDetallEnviamentJustificant,
        mostrarAdjunts,
        mostrarComentaris,
        updateComentarisComanda,
        enviarJustificant,
        justificantEnviat,
        v,
        comandaSeleccionada,
        comandaLoaded,
        clientLoaded,
        hide,
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
  