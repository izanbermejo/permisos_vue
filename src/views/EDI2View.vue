<template>
  <ModalArxiusEDI v-if="visibleArxiusEDI" :carregat="visibleArxiusEDI"
      @update:carregat="visibleArxiusEDI = $event" />
  <ModalConfiguracioEDI v-if="visibleConfiguracioEDI" :carregat="visibleConfiguracioEDI"
      @update:carregat="visibleConfiguracioEDI = $event" />
  <ModalConfiguracioAVIEXP v-if="visibleConfiguracioAVIEXP" :carregat="visibleConfiguracioAVIEXP" @update:carregat="visibleConfiguracioAVIEXP = $event" />
  <div class="card">
    <h5 class="card-header">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <font-awesome-icon icon="fa-solid fa-indent" style="font-size: 1.25rem" />
          {{ $t('ComandesEDI.Comandes EDI') }}
        </div>
        <div>
          <Button @click="visibleConfiguracioAVIEXP = true" icon="pi pi-cog" :label="$t('ComandesEDI.Veure configuracio AVI/EXP')" style="margin-left: 30px;"/>
          <Button @click="visibleConfiguracioEDI = true" icon="pi pi-cog" :label="$t('ComandesEDI.Veure configuracio EDI')" style="margin-left: 30px;"/>
          <Button @click="visibleArxiusEDI = true" icon="pi pi-folder-open" :label="$t('ComandesEDI.Veure arxius EDI')" style="margin-left: 30px;"/>
        </div>
      </div>
    </h5>
    <div class="card-body">
      <div class="filtre" ref="formWrapper">
        <div class="element-filtre">
          <label>{{ $t('Comandes.Responsable logistica') }}</label>
          <MultiSelect v-model="state.usuarisEDI" :options="$usuarisEDI" optionLabel="nom" optionValue="nom"
            :placeholder="$t('ComandesEDI.filtre.usuaris')" class="col-md-3" style="width: 160px;"
            @update:modelValue="buscar()" />
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
        <GridComandesEDI ref="gridEDI" :focused="focusedGrid" :modalParentObert="modalVisible" 
          @showDetall="showDetallEntrada" @update:carrega="buscar()" />
      </div>
    </div>
  </div>
</template>

<script>
import { onActivated, onDeactivated, ref, reactive, nextTick, onMounted, getCurrentInstance, computed } from 'vue';
import ediService from "@/services/edi.service.js";
import { carrega } from '@/services/loader';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import { usePermisosStore } from '@/stores/permisos';
import GridComandesEDI from '@/components/edi/GridComandesEDI.vue';
import ModalArxiusEDI from '@/views/modals/ModalArxiusEDI.vue';
import ModalConfiguracioEDI from '@/views/modals/ModalConfiguracioEDI.vue';
import { useEdiStore } from '@/stores/ediCount';
import ModalConfiguracioAVIEXP from '@/views/modals/ModalConfiguracioAVIEXP.vue';

export default {
  name: 'ComandesEDI',
  components : {
    GridComandesEDI,
    ModalArxiusEDI,
    ModalConfiguracioEDI,
    ModalConfiguracioAVIEXP,
  },
  setup ( props, {emit} ) {
    const { t } = useI18n();
    const permisosStore = usePermisosStore();
    const gridEDI = ref();
    const inputFiltre = ref();
    const usuariAntic = ref(permisosStore.teUsuariAntic());
    const { appContext } = getCurrentInstance();
    const usuarisEDI = appContext.config.globalProperties.$usuarisEDI;
    const state = reactive({
      dataInici : moment().subtract(20, 'day').toDate(),
      dataFi : new Date(),
      usuarisEDI : null,
    });
    let inicialitzat = false;
    const focusedGrid = ref(false);
    const formWrapper = ref();
    const gridWrapper = ref();
    const usuarisEDIFiltre = ref([]);
    const visibleArxiusEDI = ref(false);
    const visibleConfiguracioEDI = ref(false);
    const ediStore = useEdiStore();
    const visibleConfiguracioAVIEXP = ref(false);

    onMounted(() => {
      const usuariSeleccionat = usuariAntic.value
      if (usuariSeleccionat) {
        const usuari = usuarisEDI.find(u => u.nom === usuariSeleccionat || u.id === usuariSeleccionat || u.codi === usuariSeleccionat);
        state.usuarisEDI = usuari ? [usuari.nom] : [];
      }
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

    const modalVisible = computed(() => {
      return visibleArxiusEDI.value 
      || visibleConfiguracioEDI.value
      || visibleConfiguracioAVIEXP.value;
    });

    const handler = (ev) => {
        // No processem l'event en cas que es produeixi des d'un ContextMenu
        if (isContextMenuKey(ev))  return;
        if (ev.key=='Escape') {
          actionHandler(ev, () => emit('update:opcio', 'OpcionsEDI'));
        } else if (ev.key === 'Enter' && !focusedGrid.value) {
          buscar();
        } 
    }

    const buscar = async () => {
      let params = new URLSearchParams();
      params.append('usuarisEDI', state.usuarisEDI ? state.usuarisEDI.join(',') : '');
      if (state.dataInici)
        params.append('dataInici', moment(state.dataInici).format('YYYY-MM-DD'));
      if (state.dataFi)
        params.append('dataFi', moment(state.dataFi).format('YYYY-MM-DD'));
      let resultat = await(carrega(ediService.obtenirComandesEdi(params)));
      gridEDI.value.performSearch(resultat);
      
      focusedGrid.value = true;
      document.activeElement.blur();
      ediStore.refreshCount(permisosStore, usuariAntic.value);
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
      gridEDI,
      focusedGrid,
      formWrapper,
      gridWrapper,
      opcionsTipus : [
        {valor: null, clau: t('App.Totes')},
        {valor: 'PROGRAMA', clau: t('Comandes.Especials')},
        {valor: 'NORMALITZAT', clau: t('Comandes.Normalitzats')},
      ],
      usuarisEDIFiltre,
      visibleArxiusEDI,
      visibleConfiguracioEDI,
      modalVisible,
      visibleConfiguracioAVIEXP
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

  .element-filtre {
    align-content: end;
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