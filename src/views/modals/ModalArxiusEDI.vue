<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="$t('ComandesEDI.Veure arxius EDI')" style="width: 1400px">
    <div class="card" style="margin-top: 10px;">
      <h6 class="card-header" style="font-weight: 600;">
        {{ $t('Comandes.Filtre')}}
      </h6>
      <div class="card-body">
        <div class="filtre" ref="formWrapper">
        <div class="element-filtre">
          <label>{{ $t('ComandesEDI.nom arxiu') }}</label>
          <InputText ref="inputFiltre" v-model="state.nomArxiu" style="width: 280px;" />
        </div>
        <div class="element-filtre">
          <label>{{ $t('ComandesEDI.Part contingut') }}</label>
          <InputText v-model="state.contingutTXT" style="width: 280px;" />
        </div>
        <div class="element-filtre">
          <label>{{ $t('Comandes.Data des de fins') }}</label>
          <div>
            <CalendarInput v-model="state.dataInici" />
            -
            <CalendarInput v-model="state.dataFi" />
          </div>
        </div>
        <div class="element-filtre" style="padding-top: 5px;display:flex;justify-content:flex-end;align-items:flex-end">
          <Button @click="buscar" :label="$t('App.Busca')" icon="pi pi-search" class="p-button-sm" />
        </div>
      </div>
      </div>
    </div>
    <div ref="gridWrapper" style="margin-top: 15px;">
      <GridMissatgesEntrades ref="gridEDI" :modalParentObert="modalVisible" :focused="focusedGrid"
          @showDetall="showDetallEntrada" @update:close="hide"/>
    </div>
  </Dialog>
</template>
  
<script>
import { ref, reactive, nextTick, onUnmounted, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { carrega } from '@/services/loader';
import { isContextMenuKey } from "@/utils/contextmenuUtils";
import GridMissatgesEntrades from '@/components/edi/GridContingutEDI.vue';
import moment from "moment";
import ediService from "@/services/edi.service";

  export default {
    name: "ModalArxiusEDI",
    components: {
      GridMissatgesEntrades,
    },
    props: {
      carregat: Boolean,
    },
    setup(props, { emit }) {
      const { t } = useI18n();
      const gridEDI = ref();
      const inputFiltre = ref();
      const state = reactive({
        nomArxiu : '',
        contingutTXT : '',
        dataInici : moment().subtract(1, 'month').toDate(),
        dataFi : new Date(),
      });
      const formWrapper = ref();
      const gridWrapper = ref();
      const visible = ref(props.carregat ?? false);

      onMounted(() => {
        try {
          buscar();
        } catch (e) {
          hide();
        }
        document.addEventListener("keydown", handler);
        nextTick(() => {
          inputFiltre.value.$el.focus();
        });
      });

      onUnmounted(() => {
        document.removeEventListener("keydown", handler);
      });
      
      const buscar = async () => {
        let params = new URLSearchParams();
        params.append('nomArxiu', state.nomArxiu);
        params.append('contingutTXT', state.contingutTXT);
        if (state.dataInici)
          params.append('dataInici', moment(state.dataInici).format('YYYY-MM-DD'));
        if (state.dataFi)
          params.append('dataFi', moment(state.dataFi).format('YYYY-MM-DD'));
        let resultat = await(carrega(ediService.buscarArxius(params)));
        if (!gridEDI.value) return;
        gridEDI.value.performSearch(resultat);
      }

      const handler = (ev) => {
        // No processem l'event en cas que es produeixi des d'un ContextMenu
        if (isContextMenuKey(ev))  return;
        if (ev.key === 'Enter') {
          buscar();
        } 
      }
  
      // const actionHandler = (ev, action) => {
      //   ev.preventDefault();
      //   action();
      // }

      const hide = () => {
        emit("update:carregat", false);
      };
    
      return {
        props,
        emit,
        state,
        inputFiltre,
        buscar,
        gridEDI,
        formWrapper,
        gridWrapper,
        opcionsTipus : [
          {valor: null, clau: t('App.Totes')},
          {valor: 'PROGRAMA', clau: t('Comandes.Especials')},
          {valor: 'NORMALITZAT', clau: t('Comandes.Normalitzats')},
        ],
        visible,
        hide,
      };
  
    },
  };
</script>
  
  <style scoped>
    .card-body {
      padding: 10px 10px;
    }

    .filtre {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 5px 30px;
    }

    .element-filtre>label {
      display: block;
    }

    .enllas {
        cursor: pointer;
    }
  </style>
  