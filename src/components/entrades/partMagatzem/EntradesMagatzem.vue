<template>
  <div class="card">
    <h5 class="card-header">
      <i class="pi pi-arrow-left icona-boto" @click="emit('update:opcio', 'OpcionsEntrades')" v-tooltip="$t('App.Tornar')"></i>
      <font-awesome-icon icon="fa-solid fa-dolly" style="font-size: 1.25rem" />
      {{ $t('Entrades.Part magatzem') }}
    </h5>
    <div class="card-body">
      <div style="display: flex; flex-direction: row;">
        <div class="filtre" ref="formWrapper">
          <div class="element-filtre">
            <label>{{ $t('EntradesComercial.Id entrada') }}</label>
            <InputText ref="inputFiltre" v-model="state.idEntradaFabrica" style="width: 180px;" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('EntradesComercial.Article') }}</label>
            <InputText ref="inputFiltre" v-model="state.article" style="width: 180px;" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('EntradesComercial.Client') }}</label>
            <InputText ref="inputFiltre" v-model="state.client" style="width: 180px;" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('EntradesMagatzem.Etiqueta caixa') }}</label>
            <InputText ref="inputFiltre" v-model="state.etiquetaCaixa" style="width: 180px;" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('EntradesMagatzem.Lot') }}</label>
            <InputText ref="inputFiltre" v-model="state.lot" style="width: 180px;" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('EntradesComercial.Magatzem') }}</label>
            <InputText ref="inputFiltre" v-model="state.magatzem" style="width: 180px;" />
          </div>
          <div class="break"></div>
          <div class="element-filtre">
            <label>{{ $t('Comandes.Data des de fins') }}</label>
            <div>
              <CalendarInput v-model="state.dataInici" />
              -
              <CalendarInput v-model="state.dataFi" />
            </div>
          </div>
          <div class="element-filtre">
            <label>{{ $t('EntradesComercial.Error') }}</label>
            <div>
              <SelectButton v-model="state.teError" :options="$opcionsTotesSiNo()" optionLabel="clau"
                optionValue="valor" />
            </div>
          </div>
          <div class="element-filtre" style="padding-top: 5px;display:flex;justify-content:flex-end;align-items:flex-end">
            <Button @click="buscar" :label="$t('App.Busca')" icon="pi pi-search" class="p-button-sm" />
          </div>
        </div>
        <div class="element-filtre" style="padding-top: 5px;display:flex;justify-content:flex-end;align-items:flex-end">
          <Button icon="pi pi-file-excel" :label="$t('Comandes.Descarregar taula')" @click="exportar()" class="p-button-sm"/>
        </div>
      </div>
      <div ref="gridWrapper" style="margin-top: 10px;">
        <GridEntradesMagatzem ref="gridEntradesMagatzem" :modalParentObert="modalVisible" :focused="focusedGrid"
          @showDetall="showDetallEntrada" />
      </div>
    </div>
  </div>
</template>

<script>
import { onActivated, onDeactivated, ref, reactive, nextTick, onMounted } from 'vue';
import entradesService from "@/services/entrades.service.js";
import { carrega } from '@/services/loader';
import GridEntradesMagatzem from './GridEntradesMagatzem.vue';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import { usePermisosStore } from '@/stores/permisos';

export default {
  name: 'DadesMissatgeComercial',
  components : {
    GridEntradesMagatzem,
  },
  setup ( props, {emit} ) {
    const { t } = useI18n();
    const permisosStore = usePermisosStore();
    const gridEntradesMagatzem = ref();
    const inputFiltre = ref();
    const state = reactive({
      idEntradaFabrica : '',
      article : '',
      client : '',
      etiquetaCaixa : '',
      lot : '',
      magatzem : '',
      dataInici : moment().subtract(1, 'month').toDate(),
      dataFi : new Date(),
      teError : null,
    });
    let inicialitzat = false;
    const focusedGrid = ref(false);
    const formWrapper = ref();
    const gridWrapper = ref();

    onMounted(() => {
      buscar()
    })

    onActivated(() => {
      document.addEventListener("keydown", handler);
      document.addEventListener('focusin', handleFocusIn);
      document.addEventListener('click', handleClick);
      nextTick(() => {
        inputFiltre.value.$el.focus();
        focusedGrid.value = false;
        setTimeout(() => {
          inicialitzat = true;
        }, 50); // suficiente para dejar pasar el primer focusin/click
      });
    });

    onDeactivated(() => {
      document.removeEventListener("keydown", handler);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('click', handleClick);
      focusedGrid.value = false;
      inicialitzat = false;
    });

    const handler = (ev) => {
        // No processem l'event en cas que es produeixi des d'un ContextMenu
        if (isContextMenuKey(ev))  return;
        if (ev.key=='Escape') {
          actionHandler(ev, () => emit('update:opcio', 'OpcionsComandes'));
        } else if (ev.key === 'Enter' && !focusedGrid.value) {
          buscar();
        }
    }

    const buscar = async () => {
      let params = new URLSearchParams();
      params.append('idEntradaFabrica', state.idEntradaFabrica);
      params.append('article', state.article);
      params.append('client', state.client);
      params.append('etiquetaCaixa', state.etiquetaCaixa);
      params.append('lot', state.lot);
      params.append('magatzem', state.magatzem);
      if (state.dataInici)
        params.append('dataInici', moment(state.dataInici).format('YYYY-MM-DD'));
      if (state.dataFi)
        params.append('dataFi', moment(state.dataFi).format('YYYY-MM-DD'));
      if (state.teError !== null) {
        params.append('teError', state.teError);
      }
      let resultat = await(carrega(entradesService.buscarEntradesMagatzem(params)));
      gridEntradesMagatzem.value.performSearch(resultat);
      // Es marca com el focus al grid (per respondre a l'Enter) i es perd el focus del formulari
      focusedGrid.value = true;
      document.activeElement.blur();
    }

    const handleClick = (event) => {
      if (!inicialitzat) return;
      const clickedInsideForm = formWrapper.value?.contains(event.target);
      focusedGrid.value = !clickedInsideForm;
    };

    const handleFocusIn = (event) => {
      if (!inicialitzat) return;
      const insideForm = formWrapper.value?.contains(event.target);
      focusedGrid.value = !insideForm;
    };

    const exportar = () =>{
      gridEntradesMagatzem.value.exportarTaula();
    };
 
    const actionHandler = (ev, action) => {
      ev.preventDefault();
      action();
    }

    return {
      props,
      permisosStore,
      emit,
      state,
      inputFiltre,
      buscar,
      exportar,
      gridEntradesMagatzem,
      focusedGrid,
      formWrapper,
      gridWrapper,
      opcionsTipus : [
        {valor: null, clau: t('App.Totes')},
        {valor: 'PROGRAMA', clau: t('Comandes.Especials')},
        {valor: 'NORMALITZAT', clau: t('Comandes.Normalitzats')},
      ],
    }

  }
}
</script>

<style scoped>
  .icona-boto {
    margin-right: 15px;
    display: inline-block;
    border-radius: 5px;
    box-shadow: 0 0 2px #888;
    padding: 0.5em 0.6em;
    font-size:  0.8rem;
    cursor: pointer;
  }

  .filtre {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 5px 30px;
  }

  .enllas {
    cursor: pointer;
  }

  .element-filtre>label {
    display: block;
  }

  .break {
    flex-basis: 100%;
    height: 0;
  }

  ::v-deep(.p-multiselect) {
    line-height: 13px;
  }

  ::v-deep(.p-selectbutton) {
    line-height: 13px;
  }

  ::v-deep(.p-selectbutton .p-button.p-highlight) {
    background: #60cc65;
    border-color: #60cc65;
  }

  ::v-deep(.p-selectbutton .p-button.p-highlight:hover) {
    background: rgb(85, 172, 89);
    border-color: rgb(85, 172, 89);
  }

  ::v-deep(.estilRow) {
    cursor: pointer;
  }

  .grid-focus {
    border: 3px solid #b0daf8;
    border-radius: 4px;
  }

  .grid-not-focused {
    border: 3px solid transparent;
    border-radius: 4px;
  }
  
</style>