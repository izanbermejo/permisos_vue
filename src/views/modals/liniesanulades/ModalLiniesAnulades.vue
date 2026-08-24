<template>
    <EditorComentaris v-if="visibleModalComentarisInterns" :carregat="visibleModalComentarisInterns" @update:carregat="visibleModalComentarisInterns = $event;"
      :text="liniaSeleccionada.comentarisInterns" :callback="updateComentarisInterns" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')" />
    <EditorComentaris v-if="visibleModalComentarisClient" :carregat="visibleModalComentarisClient" @update:carregat="visibleModalComentarisClient = $event;"
      :text="liniaSeleccionada.comentarisClient" :callback="updateComentarisClient" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')" />
    <HistoricLiniaComanda v-if="visibleHistoricLinia" :carregat="visibleHistoricLinia" @update:carregat="visibleHistoricLinia = $event"
      :comanda="liniaSeleccionada.codi" :linia="liniaSeleccionada.numero" />
    <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
      :draggable="false" :header="$t('Comandes.Veure anulades')" style="width: 1400px">
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
        <GridLiniesAnulades ref="gridLinies" :client="props.codiClient" :modalParentObert="modalVisible"
          @liniaSeleccionada="liniaSeleccionada = $event"
          @comentarisInterns="visibleModalComentarisInterns = true"
          @comentarisClient="visibleModalComentarisClient = true"
          @showHistoria="visibleHistoricLinia = true"/>
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
import GridLiniesAnulades from "./GridLiniesAnulades.vue";
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import HistoricLiniaComanda from '@/views/modals/HistoricLiniaComanda.vue';
import moment from "moment";
import { usePermisosStore } from '@/stores/permisos';

  export default {
    name: "ModalLiniesAnulades",
    components: {
      GridLiniesAnulades,
      EditorComentaris,
      HistoricLiniaComanda,
    },
    props: {
        articleClient : String,
    },
    setup(props, { emit }) {
      const { locale } = useI18n();
      const permisosStore = usePermisosStore();
      const visible = ref(true);
      const inputComanda = ref();
      const gridLinies = ref();
      const visibleModalComentarisInterns = ref(false);
      const visibleModalComentarisClient = ref(false);
      const visibleHistoricLinia = ref(false);
      const textComentaris = ref('');
      const liniaSeleccionada = ref();
  
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
        dataInici: moment().subtract(2, 'months').toDate(),
        dataFi: moment().add(6, 'months').toDate(),
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
        return visibleModalComentarisInterns.value
          || visibleModalComentarisClient.value
          || visibleHistoricLinia.value;
      });

      const busca = async () => {
        let liniesAnulades = await carrega(comandesService.liniesComandaAnulades(props.articleClient, state.comanda, state.dataInici, state.dataFi));
        gridLinies.value.refresh(liniesAnulades);
      }

      const updateComentarisInterns = async (text) => {
        await carrega(comandesService.actualitzarComentarisInterns(liniaSeleccionada.value.codi, 
            liniaSeleccionada.value.numero, text));
        liniaSeleccionada.value.comentarisInterns = text;
      }

      const updateComentarisClient = async (text) => {
        await carrega(comandesService.actualitzarComentarisClient(liniaSeleccionada.value.codi, 
            liniaSeleccionada.value.numero, text));
        liniaSeleccionada.value.comentarisClient = text;
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
        locale,
        visible,
        props,
        permisosStore,
        state,
        inputComanda,
        gridLinies,
        modalVisible,
        visibleModalComentarisInterns,
        visibleModalComentarisClient,
        visibleHistoricLinia,
        textComentaris,
        updateComentarisInterns,
        updateComentarisClient,
        busca,
        v,
        liniaSeleccionada,
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
  