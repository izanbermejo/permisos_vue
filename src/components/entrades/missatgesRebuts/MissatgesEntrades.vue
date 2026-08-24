<template>
  <div class="card">
    <h5 class="card-header">
      <i class="pi pi-arrow-left icona-boto" @click="emit('update:opcio', 'OpcionsEntrades')" v-tooltip="$t('App.Tornar')"></i>
      <font-awesome-icon icon="fa-solid fa-comments" style="font-size: 1.25rem" />
      {{ $t('Entrades.Missatges rebuts') }}
    </h5>
    <div class="card-body">
      <div class="filtre" ref="formWrapper">
        <div class="element-filtre">
          <label>{{ $t('MissatgesEntrades.Part contingut') }}</label>
          <InputText ref="inputFiltre" v-model="state.contingutMissatge" style="width: 280px;" />
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
      <div ref="gridWrapper" style="margin-top: 10px;">
        <GridMissatgesEntrades ref="gridEntrades" :modalParentObert="modalVisible" :focused="focusedGrid"
          @showDetall="showDetallEntrada" />
      </div>
    </div>
  </div>
</template>

<script>
import { onActivated, onDeactivated, ref, reactive, nextTick, onMounted } from 'vue';
import entradesService from "@/services/entrades.service.js";
import { carrega } from '@/services/loader';
import GridMissatgesEntrades from './GridMissatgesEntrades.vue';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import { usePermisosStore } from '@/stores/permisos';

export default {
  name: 'MissatgesEntrades',
  components : {
    GridMissatgesEntrades,
  },
  setup ( props, {emit} ) {
    const { t } = useI18n();
    const permisosStore = usePermisosStore();
    const gridEntrades = ref();
    const inputFiltre = ref();
    const state = reactive({
      contingutMissatge : '',
      dataInici : moment().subtract(10, 'year').toDate(),
      dataFi : new Date(),
    });
    let inicialitzat = false;
    const focusedGrid = ref(false);
    const formWrapper = ref();
    const gridWrapper = ref();

    onMounted(() => {
      buscar();
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
      params.append('contingutMissatge', state.contingutMissatge);
      if (state.dataInici)
        params.append('dataInici', moment(state.dataInici).format('YYYY-MM-DD'));
      if (state.dataFi)
        params.append('dataFi', moment(state.dataFi).format('YYYY-MM-DD'));
      let resultat = await(carrega(entradesService.buscarMissatges(params)));
      gridEntrades.value.performSearch(resultat);
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
      gridEntrades,
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