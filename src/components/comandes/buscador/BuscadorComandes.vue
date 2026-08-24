<template>
  <DetallComandaNormalitzats v-if="visibleDetallComanda" :carregat="visibleDetallComanda" @update:carregat="visibleDetallComanda = $event"
    :comanda="comandaSeleccionada" />
  <DetallComandaEspecials v-if="visibleDetallComandaEspecial" :carregat="visibleDetallComandaEspecial" @update:carregat="visibleDetallComandaEspecial = $event"
    :comanda="comandaSeleccionada"
    @showProgramaArticle="showProgramaArticle"/>
  <ModalAdjuntsComandes v-if="visibleModalAdjunts" :carregat="visibleModalAdjunts"
    :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"
    @update:carregat="visibleModalAdjunts = $event" :comanda="comandaSeleccionada"
    @update:numAdjunts="gridComandes.updateAdjunts($event)" />
  <div class="card">
    <h5 class="card-header">
      <i class="pi pi-arrow-left icona-boto" @click="emit('update:opcio', 'OpcionsComandes')" v-tooltip="$t('App.Tornar')"></i>
      <font-awesome-icon icon="fa-solid fa-magnifying-glass" style="font-size: 1.25rem" />
      {{ $t('App.Buscador comandes') }}
    </h5>
    <div class="card-body">
        <div class="filtre" ref="formWrapper">
          <div class="element-filtre">
            <label>{{ $t('Comandes.Part comanda programa') }}</label>
            <InputText ref="inputFiltre" v-model="state.comandaPrograma" style="width: 220px;" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('Comandes.Part client') }}</label>
            <InputText v-model="state.client" style="width: 220px;" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('Comandes.Part de usuari') }}</label>
            <InputText v-model="state.usuari" style="width: 220px;" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('Comandes.Data des de fins') }}</label>
            <div>
              <CalendarInput v-model="state.dataInici" />
              -
              <CalendarInput v-model="state.dataFi" />
            </div>
          </div>
          <div class="break"></div>
          <div class="element-filtre">
            <label>{{ $t('Comandes.Tipus comanda') }}</label>
            <SelectButton v-model="state.tipus" :options="opcionsTipus" optionLabel="clau"
              optionValue="valor" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('Comandes.Servida') }}</label>
            <SelectButton v-model="state.servida" :options="$opcionsTotesSiNo()" optionLabel="clau"
              optionValue="valor" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('Comandes.Servible comanda') }}</label>
            <MultiSelect v-model="state.servible" style="width: 150px;" scrollHeight="350px" :options="$opcionsServible()"
              optionLabel="clau" optionValue="valor" :placeholder="$t('App.Tots')" :maxSelectedLabels="1"
              :selectedItemsLabel="`{0} ${$t('App.seleccionats')}`" />
          </div>
          <div class="element-filtre" style="padding-top: 5px;display:flex;justify-content:flex-end;align-items:flex-end">
            <Button @click="buscar" :label="$t('App.Busca')" icon="pi pi-search" class="p-button-sm" />
          </div>
        </div>
        <div :class="{'grid-focus': focusedGrid, 'grid-not-focused': !focusedGrid}" ref="gridWrapper" style="margin-top: 10px;">
          <GridComandesBuscador ref="gridComandes" :modalParentObert="modalVisible" :focused="focusedGrid"
            @showDetall="showDetallComanda"
            @mostrarAdjunts="mostrarAdjunts($event)" />
        </div>
      </div>
  </div>
</template>

<script>
import { onActivated, onDeactivated, ref, computed, reactive, nextTick } from 'vue';
import comandesService from "@/services/comandes.service";
import { carrega } from '@/services/loader';
import GridComandesBuscador from './GridComandesBuscador.vue';
import DetallComandaNormalitzats from '@/views/modals/detallnormalitzats/DetallComandaNormalitzats.vue';
import DetallComandaEspecials from '@/views/modals/detallespecials/DetallComandaEspecials.vue';
import ModalAdjuntsComandes from '@/views/modals/ModalAdjuntsComandes.vue';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import { usePermisosStore } from '@/stores/permisos';

export default {
  // eslint-disable-next-line  
  name: 'BuscadorComandes',
  components : {
    GridComandesBuscador,
    DetallComandaNormalitzats,
    DetallComandaEspecials,
    ModalAdjuntsComandes,
  },
  setup ( props, {emit} ) {
    const { t } = useI18n();
    const permisosStore = usePermisosStore();
    const gridComandes = ref();
    const inputFiltre = ref();
    const visibleDetallComanda = ref(false);
    const visibleDetallComandaEspecial = ref(false);
    const visibleModalAdjunts = ref(false);
    const comandaSeleccionada = ref();
    const state = reactive({
      comandaPrograma : '',
      tipus : null,
      client : '',
      usuari : '',
      dataInici : moment().subtract(5, 'year').toDate(),
      dataFi : new Date(),
      servida: null,
      servible: [],
    });
    let inicialitzat = false;
    const focusedGrid = ref(false);
    const formWrapper = ref();
    const gridWrapper = ref();

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
        // Si no hi ha cap modal obert
        if (modalVisible.value) return;
        if (ev.key=='Escape') {
          actionHandler(ev, () => emit('update:opcio', 'OpcionsComandes'));
        } else if (ev.key === 'Enter' && !focusedGrid.value) {
          buscar();
        }
    }

    const modalVisible = computed(() => {
      return visibleDetallComanda.value
        || visibleDetallComandaEspecial.value
        || visibleModalAdjunts.value;
    });

    const buscar = async () => {
      let params = new URLSearchParams();
      params.append('comandaPrograma', state.comandaPrograma);
      params.append('client', state.client);
      params.append('usuari', state.usuari);
      if (state.dataInici)
        params.append('dataInici', moment(state.dataInici).format('YYYY-MM-DD'));
      if (state.dataFi)
        params.append('dataFi', moment(state.dataFi).format('YYYY-MM-DD'));
      if (state.tipus != null)
        params.append('tipus', state.tipus);
      if (state.servida != null)
        params.append('servida', state.servida);
      state.servible.forEach(s => params.append('servible',s));
      let resultat = await(carrega(comandesService.buscarComandes(params)));
      gridComandes.value.performSearch(resultat);
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

    const showDetallComanda = (comanda, isNormalitzat) => {
      comandaSeleccionada.value = comanda;
      if (isNormalitzat) {
        visibleDetallComanda.value = true;
      } else {
        visibleDetallComandaEspecial.value = true;
      }
    }

    const showProgramaArticle = (articleClient) => {
      emit('update:opcio', 'ComandesEsp', articleClient);
      visibleDetallComandaEspecial.value = false;
    }

    const mostrarAdjunts = (comanda) => {
      comandaSeleccionada.value = comanda;
      visibleModalAdjunts.value = true;
    }  
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
      visibleDetallComanda,
      visibleDetallComandaEspecial,
      visibleModalAdjunts,
      comandaSeleccionada,
      buscar,
      showDetallComanda,
      showProgramaArticle,
      mostrarAdjunts,
      gridComandes,
      modalVisible,
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