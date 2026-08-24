<template>
<AjudaImprimirAlbara v-if="albaraImprimir" :albara="albaraImprimir" @update:carregat="albaraImprimir = null" />
<ModalDetallAlbara v-model:visible="detallVisible" :idAlbara="detallIdAlbara"
    @canviat="onDetallCanviat"
    :numAdjunts="numAdjunts"
    @update:numAdjunts="numAdjunts = $event"/>
<ModalDetallConsum v-if="detallConsumVisible" :carregat="detallConsumVisible"
    @update:carregat="detallConsumVisible = $event"
    :idAlbara="detallIdAlbara" :clientNom="detallClientNom"
    @canviat="onDetallCanviat" />
<ModalCanviarPendentFacturar v-if="liniaPendentFacturar" :linia="liniaPendentFacturar"
    @tancar="liniaPendentFacturar = null" @guardat="onPendentFacturarGuardat" />
<AjudaClient :visible="ajudaClientVisible" :seleccioCallback="ajudaClientCallback" @update:carregat="ajudaClientVisible = false"/>
<AjudaArticleClientByClient :visible="visibleAjudaArticleClientByClient"
  @update:carregat="visibleAjudaArticleClientByClient = false"
  @switch="switchAjuda"
  :seleccioCallback="ajudaArticleClientCallback" />
<AjudaArticleClientByArticle :visible="visibleAjudaArticleClientByArticle"
  @update:carregat="visibleAjudaArticleClientByArticle = false"
  @switch="switchAjuda"
  :seleccioCallback="ajudaArticleClientCallback" />
<ModalNouTraspas v-if="nouTraspasVisible" @update:carregat="nouTraspasVisible = false" @creat="onTraspasCreat" />
<div class="card d-flex flex-column" style="height:100%">
  <h5 class="card-header capsalera">
    <span>
      <font-awesome-icon icon="fa-solid fa-magnifying-glass" style="font-size: 1.25rem" />
      {{ $t('Albarans.Buscador') }}
    </span>
    <Button v-if="permisosStore.tePermis('COMANDES', 'WRITE')" :label="$t('Albarans.Nou traspas')"
      icon="pi pi-plus" class="p-button-sm" @click="nouTraspasVisible = true" />
  </h5>
  <div class="card-body d-flex flex-column" style="flex:1;min-height:0;">
    <!-- Panell filtre col·lapsable -->
    <div class="filtre-panel">
      <div class="filtre-panel-header" @click="filtreVisible = !filtreVisible">
        <i class="pi" :class="filtreVisible ? 'pi-chevron-up' : 'pi-chevron-down'" />
        <span>{{ $t('App.Filtre') }}</span>
      </div>
      <div v-show="filtreVisible" class="filtre" ref="formWrapper">
        <div class="element-filtre">
          <label>{{ $t('Albarans.Empresa') }}</label>
          <CompletableInput v-model="state.empresa" :items="$empreses" 
            :inputWidth="35" :matchWidth="135" />
        </div>
        <div class="element-filtre">
          <label>{{ $t('Albarans.Numeros albara') }}</label>
          <InputText v-model="state.numeros" style="width: 220px;" />
        </div>
          <div class="element-filtre">
            <label>{{ $t('Albarans.Data des de fins') }}</label>
            <div>
              <CalendarInput v-model="state.dataInici" />
              -
              <CalendarInput v-model="state.dataFi" />
            </div>
          </div>
        <div class="element-filtre">
          <label>{{ $t('Albarans.Client') }}</label>
          <CompletableInputServer v-model="state.client" :fetchValue="fetchClient" 
            :onOpenSearch="onOpenAjudaClient" :inputWidth="65" :matchWidth="185" />
        </div>
        <div class="element-filtre">
          <label>{{ $t('Albarans.Articleclient') }}</label>
          <CompletableInputServer v-model="state.articleClient" :fetchValue="fetchArticleClient" 
            :onOpenSearch="onOpenAjudaArticleClient" :inputWidth="130" :matchWidth="200" />
        </div>
        <div class="break"></div>
        <div class="element-filtre">
          <label>{{ $t('Albarans.Comanda client') }}</label>
          <InputText v-model="state.comandaClient" style="width: 200px;" />
        </div>
        <div class="element-filtre">
          <label>{{ $t('Albarans.Obert tancat') }}</label>
          <SelectButton v-model="state.tancat" :options="$opcionsTotsObertsTancats()" optionLabel="clau"
            optionValue="valor" />
        </div>
        <div class="element-filtre">
          <label>{{ $t('Albarans.Servit') }}</label>
          <SelectButton v-model="state.servida" :options="$opcionsTotesSiNo()" optionLabel="clau"
            optionValue="valor" />
        </div>
        <div class="element-filtre">
          <label>{{ $t('Albarans.Magaztem sortida') }}</label>
          <CompletableInput v-model="state.magatzemSortida" :items="$magatzems" 
            :inputWidth="50" :matchWidth="150" />
        </div>
        <div class="element-filtre">
          <label>{{ $t('Albarans.Magaztem recepcio') }}</label>
          <CompletableInput v-model="state.magatzemRecepcio" :items="$magatzems" 
            :inputWidth="50" :matchWidth="150" />
        </div>
        <div class="break"></div>
        <div class="element-filtre">
          <label>{{ $t('Albarans.Transportista') }}</label>
          <CompletableInput v-model="state.transportista" :items="$transportistes" 
            :inputWidth="50" :matchWidth="145" />
        </div>
        <div class="element-filtre">
          <label>{{ $t('Albarans.Ref transport') }}</label>
          <InputText v-model="state.refTransport" style="width: 200px;" />
        </div>
        <div class="element-filtre">
          <label>{{ $t('Albarans.Alb especial') }}</label>
          <InputText v-model="state.albEspecial" style="width: 200px;" />
        </div>
        <div class="element-filtre">
          <label>{{ $t('Albarans.Usuari creacio') }}</label>
          <div style="display: flex; align-items: center;">
            <MultiSelect v-model="state.usuarisCreacio" :options="$usuarisCreadorsAlbarans"
              optionLabel="nom" optionValue="codi" :filter="true"
              :placeholder="$t('App.Tots')" style="width: 200px;" />
            <Button icon="pi pi-users" @click="state.usuarisCreacio = []"
              style="width: 30px; height: 30px; margin-left: 5px;"
              v-tooltip.bottom="$t('Albarans.Seleccionar tots els usuaris')" />
            <Button v-if="usuariLoginat" icon="pi pi-user" @click="state.usuarisCreacio = [usuariLoginat.codi]"
              style="width: 30px; height: 30px; margin-left: 5px;"
              v-tooltip.bottom="`${$t('Albarans.Seleccionar usuari')} ${usuariLoginat.nom}`" />
          </div>
        </div>
        <div class="element-filtre" style="padding-top: 5px;display:flex;justify-content:flex-end;align-items:flex-end">
          <Button @click="buscar" :label="$t('App.Busca')" icon="pi pi-search" class="p-button-sm" />
        </div>
      </div>
    </div>
    <div :style="{ height: filtreVisible ? '540px' : '730px' }">
    <Splitter class="grids-splitter" layout="vertical" style="height:100%;">
      <SplitterPanel :size="50" :minSize="25">
        <div class="grid-panel">
          <div class="grid-panel-header" :class="{ 'grid-panel-header--focused': focusedGrid === 'albarans' }">
            <Button icon="pi pi-sliders-h" class="p-button-text p-button-sm" @click="gridAlbarans.toggleColPicker($event)" v-tooltip="$t('App.Columnes')" />
            {{ $t('Albarans.Albarans') }}
            <transition name="slide-fade">
              <span v-if="numResultatsAlbarans >= 100" class="missatgeLimit">
                <font-awesome-icon icon="fa-solid fa-info" style="margin-right: 5px;" />
                {{ $t('App.Nomes es mostren els primers resultats', [numResultatsAlbarans]) }}
              </span>
            </transition>
          </div>
          <div class="grid-panel-body" @click="focusedGrid = 'albarans'">
            <GridAlbaransBuscador ref="gridAlbarans"
              :focused="focusedGrid === 'albarans'"
              :modalParentObert="modalObert"
              :idAlbara="detallIdAlbara"
              @resultats="numResultatsAlbarans = $event"
              @seleccio-canviada="onSeleccioCanviada"
              @tancarAlbara="onTancarAlbara"
              @reobrirAlbara="onReobrirAlbara"
              @eliminarAlbara="onEliminarAlbara"
              @canviarAutofacturable="onCanviarAutofacturable"
              @veureDetall="onVeureDetall"
              @imprimirAlbara="albaraImprimir = $event"
              @canviat="onDetallCanviat"
              @update:modalObert="childModalObert = $event"/>
          </div>
        </div>
      </SplitterPanel>
      <SplitterPanel :size="50" :minSize="25">
        <div class="grid-panel">
          <div class="grid-panel-header" :class="{ 'grid-panel-header--focused': focusedGrid === 'linies' }">
            <Button icon="pi pi-sliders-h" class="p-button-text p-button-sm" @click="gridLinies.toggleColPicker($event)" v-tooltip="$t('App.Columnes')" />
            {{ $t('Albarans.Linies') }}
          </div>
          <div class="grid-panel-body" @click="focusedGrid = 'linies'">
            <GridLiniesAlbaransBuscador ref="gridLinies" :linies="liniesSeleccionades" :albara="albaraSeleccionat"
              :focused="focusedGrid === 'linies'" :modalParentObert="modalObert"
              @urgentStateChanged="onUrgentStateChanged"
              @canviarPendentFacturar="liniaPendentFacturar = $event" />
          </div>
        </div>
      </SplitterPanel>
    </Splitter>
    </div>
  </div>
</div>
</template>

<script setup>
import { reactive, ref, computed, inject, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import Swal from 'sweetalert2';
import CompletableInput from '@/components/CompletableInput.vue';
import CompletableInputServer from '@/components/CompletableInputServer.vue';
import AjudaClient from '@/views/modals/AjudaClient.vue';
import AjudaArticleClientByClient from '@/views/modals/AjudaArticleClientByClient.vue';
import AjudaArticleClientByArticle from '@/views/modals/AjudaArticleClientByArticle.vue';
import ComandesService from '@/services/comandes.service';
import AlbaraService from '@/services/albara.service';
import { carrega } from '@/services/loader';
import GridAlbaransBuscador from '@/components/albarans/buscador/GridAlbaransBuscador.vue';
import GridLiniesAlbaransBuscador from '@/components/albarans/buscador/GridLiniesAlbaransBuscador.vue';
import AjudaImprimirAlbara from '@/views/modals/albara/AjudaImprimirAlbara.vue';
import ModalDetallAlbara from '@/views/modals/albara/ModalDetallAlbara.vue';
import ModalDetallConsum from '@/views/modals/consums/ModalDetallConsum.vue';
import ModalCanviarPendentFacturar from '@/views/modals/albara/ModalCanviarPendentFacturar.vue';
import ModalNouTraspas from '@/views/modals/albara/ModalNouTraspas.vue';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import { usePermisosStore } from '@/stores/permisos';
import { usuari } from '@/keycloak/keycloak';

  const { t } = useI18n();
  const permisosStore = usePermisosStore();

  // Usuaris que han creat albarans (metadata). El codi és l'id d'empleat que retorna el Keycloak,
  // de manera que l'usuari loginat es troba per codi; si no ha creat mai cap albarà no hi surt i el
  // filtre arrenca sense cap usuari seleccionat, és a dir amb tots.
  const usuarisCreadorsAlbarans = inject('usuarisCreadorsAlbarans', []) ?? [];
  const usuariLoginat = usuarisCreadorsAlbarans.find(u => u.codi === String(usuari() ?? '')) ?? null;

  //const articleClient = ref(null);

  const filtreVisible = ref(true);

  // Ajuda client
  const ajudaClientVisible = ref(false);
  let ajudaClientSelectItem = null;

  // Ajuda article client
  const visibleAjudaArticleClientByClient = ref(false);
  const visibleAjudaArticleClientByArticle = ref(false);
  const ultimaAjudaVisibleByClient = ref(true);
  let ajudaArticleClientSelectItem = null;
  const numAdjunts = ref(0);
  const fetchClient = async (valor) => {
    try {
      const resp = await ComandesService.obtenirClient(valor, false);
      const client = resp?.data ?? resp;
      return client ? { codi: client.codi, nom: client.nom } : null;
    } catch {
      return null;
    }
  };

  const onOpenAjudaClient = ({ selectItem }) => {
    ajudaClientSelectItem = selectItem;
    ajudaClientVisible.value = true;
  };

  const ajudaClientCallback = (client) => {
    if (ajudaClientSelectItem) {
      ajudaClientSelectItem({ codi: client.codi, nom: client.nom });
    }
    ajudaClientVisible.value = false;
  };

  const fetchArticleClient = async (valor) => {
    try {
      const resp = await ComandesService.obtenirArticleClient(valor);
      const ac = resp?.data ?? resp;
      return ac ? { codi: ac.referencia, nom: ac.denominacio } : null;
    } catch {
      return null;
    }
  };

  const onOpenAjudaArticleClient = ({ selectItem }) => {
    ajudaArticleClientSelectItem = selectItem;
    showAjudaArticleClient();
  };

  const showAjudaArticleClient = () => {
    ultimaAjudaVisibleByClient.value = localStorage.getItem('AlbaransUltimaAjudaVisibleClient') === null
      ? true
      : JSON.parse(localStorage.getItem('AlbaransUltimaAjudaVisibleClient'));
    ultimaAjudaVisibleByClient.value
      ? visibleAjudaArticleClientByClient.value = true
      : visibleAjudaArticleClientByArticle.value = true;
  };

  const switchAjuda = () => {
    if (ultimaAjudaVisibleByClient.value) {
      visibleAjudaArticleClientByClient.value = false;
      visibleAjudaArticleClientByArticle.value = true;
      ultimaAjudaVisibleByClient.value = false;
    } else {
      visibleAjudaArticleClientByArticle.value = false;
      visibleAjudaArticleClientByClient.value = true;
      ultimaAjudaVisibleByClient.value = true;
    }
    localStorage.setItem('AlbaransUltimaAjudaVisibleClient', ultimaAjudaVisibleByClient.value);
  };

  const ajudaArticleClientCallback = async (artCli) => {
    visibleAjudaArticleClientByClient.value = false;
    visibleAjudaArticleClientByArticle.value = false;
    if (ajudaArticleClientSelectItem) {
      const ac = await fetchArticleClient(artCli);
      ajudaArticleClientSelectItem({ codi: artCli, nom: ac?.nom || '' });
    }
  };

  const gridAlbarans = ref(null);
  const gridLinies = ref(null);
  const liniesSeleccionades = ref([]);
  const albaraSeleccionat = ref(null);
  const numResultatsAlbarans = ref(0);
  const focusedGrid = ref(null);
  const formWrapper = ref(null);
  const albaraImprimir = ref(null);
  const detallVisible = ref(false);
  const detallConsumVisible = ref(false);
  const detallClientNom = ref('');
  const detallIdAlbara = ref(null);
  const childModalObert = ref(false);
  const liniaPendentFacturar = ref(null);
  const nouTraspasVisible = ref(false);

  const modalObert = computed(() =>
    ajudaClientVisible.value ||
    visibleAjudaArticleClientByClient.value ||
    visibleAjudaArticleClientByArticle.value ||
    albaraImprimir.value !== null ||
    detallVisible.value ||
    childModalObert.value ||
    detallConsumVisible.value ||
    liniaPendentFacturar.value !== null ||
    nouTraspasVisible.value
  );

  // Un cop creada la capçalera del traspàs manual s'obre el detall, des d'on s'hi afegeixen les línies.
  // Si el traspàs passa per un magatzem intermig (relleu), s'avisa perquè el destí de l'albarà no és
  // el que s'ha demanat sinó l'intermig.
  const onTraspasCreat = async (creat) => {
    detallIdAlbara.value = creat.idAlbara;
    numAdjunts.value = 0;
    detallVisible.value = true;
    if (creat.magatzemIntermig) {
      await Swal.fire({
        icon: 'info',
        title: t('Albarans.Magatzem intermig'),
        text: t('Albarans.Magatzem intermig avis', [creat.magatzemIntermig]),
        confirmButtonText: t('App.Confirmar'),
      });
    }
  };

  // Refà la cerca mantenint seleccionat l'albarà de la línia rectificada, perquè el grid mostri
  // el nou pendent de facturar i, si escau, el nou estat de facturat de la capçalera.
  const onPendentFacturarGuardat = () => {
    buscar(liniaPendentFacturar.value?.id?.idAlbara);
  };

  const onVeureDetall = (albara) => {
    if (!albara?.id) return;
    detallIdAlbara.value = { codi: albara.id.codi, empresa: albara.id.empresa };
    // Els albarans de consum tenen un modal de detall propi (simplificat)
    if (albara.tipus === 'CONSUM') {
      detallClientNom.value = albara.clientNom || '';
      detallConsumVisible.value = true;
    } else {
      numAdjunts.value = albara.numAdjunts;
      detallVisible.value = true;
    }
  };

  const onDetallCanviat = (idAlbara) => {
    buscar(idAlbara);
  };

  const onSeleccioCanviada = (linies, albara) => {
    liniesSeleccionades.value = linies;
    albaraSeleccionat.value = albara || null;
  };

  const onUrgentStateChanged = ({ idAlbara, isUrgent }) => {
    if (!albaraSeleccionat.value || albaraSeleccionat.value.id?.codi !== idAlbara?.codi || albaraSeleccionat.value.id?.empresa !== idAlbara?.empresa) {
      return;
    }

    albaraSeleccionat.value.isUrgent = isUrgent;
    if (!isUrgent) {
      albaraSeleccionat.value.motiusUrgent = [];
      albaraSeleccionat.value.comentarisUrgent = null;
      albaraSeleccionat.value.motiuAltresUrgent = null;
      albaraSeleccionat.value.impUrgent = null;
    }
  };

  const onKeydown = (ev) => {
    if (ev.key === 'Tab') {
      const insideFiltre = formWrapper.value?.contains(document.activeElement);
      if (!insideFiltre && !modalObert.value && (focusedGrid.value === 'albarans' || focusedGrid.value === 'linies')) {
        ev.preventDefault();
        focusedGrid.value = focusedGrid.value === 'albarans' ? 'linies' : 'albarans';
        document.activeElement.blur();
      }
    }
  };

  const buscar = async (idSeleccionar) => {
    const params = new URLSearchParams();
    const numeros = state.numeros ? state.numeros.trim() : '';
    if (state.empresa) params.append('empresa', state.empresa);
    if (numeros) params.append('numeros', numeros);
    if (state.client) params.append('client', state.client);
    if (state.articleClient) params.append('articleClient', state.articleClient);
    if (state.comandaClient) params.append('comandaClient', state.comandaClient);
    if (state.magatzemSortida) params.append('magatzemSortida', state.magatzemSortida);
    if (state.magatzemRecepcio) params.append('magatzemRecepcio', state.magatzemRecepcio);
    if (state.transportista) params.append('transportista', state.transportista);
    if (state.refTransport) params.append('refTransport', state.refTransport);
    if (state.albEspecial) params.append('albEspecial', state.albEspecial);
    if (state.dataInici) params.append('dataInici', moment(state.dataInici).format('YYYY-MM-DD'));
    if (state.dataFi) params.append('dataFi', moment(state.dataFi).format('YYYY-MM-DD'));
    if (state.servida != null) params.append('servida', state.servida);
    if (state.tancat != null) params.append('tancat', state.tancat);
    if (state.usuarisCreacio?.length) params.append('usuarisCreacio', state.usuarisCreacio.join(','));
    const resultat = await carrega(AlbaraService.buscarAlbarans(params));
    gridAlbarans.value.performSearch(resultat?.data ?? resultat ?? [], idSeleccionar);
    focusedGrid.value = 'albarans';
  };

  onMounted(() => document.addEventListener('keydown', onKeydown));
  onUnmounted(() => document.removeEventListener('keydown', onKeydown));

  const state = reactive({
      empresa : '40',
      numeros : '',
      magatzemSortida : '',
      magatzemRecepcio : '',
      transportista : '',
      refTransport : '',
      albEspecial : '',
      client : '',
      articleClient : '',
      comandaClient : '',
      dataInici : moment().subtract(5, 'year').toDate(),
      dataFi : new Date(),
      servida: null,
      tancat: null,
      // Per defecte només els albarans creats per l'usuari loginat; buit vol dir de tots els usuaris
      usuarisCreacio: usuariLoginat ? [usuariLoginat.codi] : [],
    });

    const onTancarAlbara = async (idAlbara) => {
      await carrega(AlbaraService.tancarAlbara(idAlbara));
      buscar(idAlbara);
    }

    const onReobrirAlbara = async (idAlbara) => {
      const res = await Swal.fire({
        icon: 'question', title: t('Albarans.Reobrir albara'),
        text: t('Albarans.Confirmar reobrir albara'),
        showCancelButton: true, reverseButtons: true,
        confirmButtonText: t('App.Confirmar'), cancelButtonText: t('App.Cancela'),
      });
      if (!res.isConfirmed) return;
      await carrega(AlbaraService.reobrirAlbara(idAlbara));
      buscar(idAlbara);
    }

    const onEliminarAlbara = async (idAlbara) => {
      const res = await Swal.fire({
        icon: 'warning', title: t('Albarans.Eliminar albara'),
        text: t('Albarans.Confirmar eliminar albara'),
        showCancelButton: true, reverseButtons: true,
        confirmButtonText: t('Albarans.Eliminar albara'), cancelButtonText: t('App.Cancela'),
        confirmButtonColor: '#d33',
      });
      if (!res.isConfirmed) return;
      await carrega(AlbaraService.eliminarAlbara(idAlbara));
      buscar();
    }

    // Inverteix el flag d'autofacturable de l'albarà seleccionat i refà la cerca mantenint-lo seleccionat
    const onCanviarAutofacturable = async (albara) => {
      if (!albara?.id) return;
      await carrega(AlbaraService.canviarFacturacioAutomatica(albara.id, !albara.isFacturacioAutomatica));
      buscar(albara.id);
    }

  // const opcionsTipus = [
  //     {valor: null, clau: t('App.Totes')},
  //     {valor: 'PROGRAMA', clau: t('Comandes.Especials')},
  //     {valor: 'NORMALITZAT', clau: t('Comandes.Normalitzats')},
  //   ]

</script>

<style scoped>
  .grids-splitter :deep(.p-splitter-panel) {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  .grid-panel {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }

  .capsalera {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .grid-panel-header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    font-weight: 600;
    transition: background-color 0.15s, color 0.15s;
  }

  .missatgeLimit {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: inline-flex;
    align-items: center;
    background-color: rgb(201, 227, 189);
    border: 1px solid rgb(52, 136, 68);
    border-radius: 10px;
    padding: 2px 10px;
    font-weight: normal;
    white-space: nowrap;
  }

  .slide-fade-enter-active {
    transition: opacity 0.3s ease;
  }

  .slide-fade-enter-from {
    opacity: 0;
  }

  .grid-panel-header--focused {
    background-color: #b0daf8;
    border-bottom-color: #7bbde8;
  }

  .grid-panel-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 0.5rem;
  }

  .filtre-panel {
    border: 1px solid #dee2e6;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .filtre-panel-header {
    display: flex;
    justify-content: flex-start;
    gap: 0.5rem;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    cursor: pointer;
    user-select: none;
    font-weight: 600;
    border-radius: 4px 4px 0 0;
  }

  .filtre {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px 30px;
    padding: 0.25rem 0.5rem 0.25rem 0.5rem;
  }

  .icona-boto {
    margin-right: 15px;
    display: inline-block;
    border-radius: 5px;
    box-shadow: 0 0 2px #888;
    padding: 0.5em 0.6em;
    font-size:  0.8rem;
    cursor: pointer;
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