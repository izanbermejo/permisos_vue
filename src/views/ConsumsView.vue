<template>
  <ModalSeleccionarPlataforma v-if="visibleSeleccionar" :carregat="visibleSeleccionar"
    @update:carregat="visibleSeleccionar = $event"
    @plataformaSeleccionada="plataformaSeleccionada" />

  <ModalNouConsum v-if="visibleNou && plataformaActual" :carregat="visibleNou"
    @update:carregat="visibleNou = $event"
    :plataforma="plataformaActual" @consumCreat="onConsumCreat" />

  <ModalDetallConsum v-if="visibleDetall" :carregat="visibleDetall"
    @update:carregat="visibleDetall = $event"
    :idAlbara="detallIdAlbara" :clientNom="detallClientNom"
    @canviat="buscar" />

  <AjudaClient :visible="ajudaClientVisible" :seleccioCallback="ajudaClientCallback"
    @update:carregat="ajudaClientVisible = false" />
  <AjudaArticleClientByClient :visible="visibleAjudaArticleClientByClient"
    @update:carregat="visibleAjudaArticleClientByClient = false"
    @switch="switchAjuda" :seleccioCallback="ajudaArticleClientCallback" />
  <AjudaArticleClientByArticle :visible="visibleAjudaArticleClientByArticle"
    @update:carregat="visibleAjudaArticleClientByArticle = false"
    @switch="switchAjuda" :seleccioCallback="ajudaArticleClientCallback" />

  <div class="card d-flex flex-column" style="height:100%">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-box-open" style="font-size: 1.25rem" />
      {{ $t('Consums.buscador') }}
      <ButtonShortcut @click="obrirSeleccionar()" style="margin-left: 15px;"
        icon="fa-solid fa-plus" :literal="$t('Consums.nouConsum')" />
    </h5>
    <div class="card-body d-flex flex-column" style="flex:1;min-height:0;">
      <!-- Filtre -->
      <div class="filtre-panel">
        <div class="filtre-panel-header" @click="filtreVisible = !filtreVisible">
          <i class="pi" :class="filtreVisible ? 'pi-chevron-up' : 'pi-chevron-down'" />
          <span>{{ $t('App.Filtre') }}</span>
        </div>
        <div v-show="filtreVisible" class="filtre">
          <div class="element-filtre">
            <label>{{ $t('Consums.empresa') }}</label>
            <CompletableInput v-model="state.empresa" :items="$empreses" :inputWidth="35" :matchWidth="135" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('Consums.numerosAlbara') }}</label>
            <InputText v-model="state.numeros" style="width: 220px;" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('Consums.dataDesFins') }}</label>
            <div>
              <CalendarInput v-model="state.dataInici" />
              -
              <CalendarInput v-model="state.dataFi" />
            </div>
          </div>
          <div class="element-filtre">
            <label>{{ $t('Consums.client') }}</label>
            <CompletableInputServer v-model="state.client" :fetchValue="fetchClient"
              :onOpenSearch="onOpenAjudaClient" :inputWidth="65" :matchWidth="185" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('Consums.articleClient') }}</label>
            <CompletableInputServer v-model="state.articleClient" :fetchValue="fetchArticleClient"
              :onOpenSearch="onOpenAjudaArticleClient" :inputWidth="130" :matchWidth="200" />
          </div>
          <div class="break"></div>
          <div class="element-filtre">
            <label>{{ $t('Consums.magatzem') }}</label>
            <CompletableInput v-model="state.magatzem" :items="$magatzems" :inputWidth="50" :matchWidth="150" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('Consums.albaraEspecial') }}</label>
            <InputText v-model="state.albEspecial" style="width: 180px;" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('Consums.identificador') }}</label>
            <InputText v-model="state.identificadorConsum" style="width: 180px;" />
          </div>
          <div class="break"></div>
          <div class="element-filtre">
            <label>{{ $t('Consums.facturat') }}</label>
            <SelectButton v-model="state.facturat" :options="$opcionsTotesSiNo()" optionLabel="clau" optionValue="valor" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('Consums.tancat') }}</label>
            <SelectButton v-model="state.tancat" :options="$opcionsTotesSiNo()" optionLabel="clau" optionValue="valor" />
          </div>
          <div class="element-filtre">
            <label>{{ $t('Consums.pendentFacturar') }}</label>
            <SelectButton v-model="state.pendentFacturar" :options="$opcionsTotesSiNo()" optionLabel="clau" optionValue="valor" />
          </div>
          <div class="element-filtre" style="padding-top: 5px; display:flex; justify-content:flex-end; align-items:flex-end">
            <Button @click="buscar" :label="$t('App.Busca')" icon="pi pi-search" class="p-button-sm" />
          </div>
        </div>
      </div>

      <!-- Grids -->
      <div :style="{ height: filtreVisible ? '540px' : '730px' }">
        <Splitter class="grids-splitter" layout="vertical" style="height:100%;">
          <SplitterPanel :size="50" :minSize="25">
            <div class="grid-panel">
              <div class="grid-panel-header">{{ $t('Consums.buscador') }}</div>
              <div class="grid-panel-body">
                <GridConsumsBuscador :consums="consums"
                  @veureDetall="onVeureDetall" @seleccioCanviada="onSeleccioCanviada" />
              </div>
            </div>
          </SplitterPanel>
          <SplitterPanel :size="50" :minSize="25">
            <div class="grid-panel">
              <div class="grid-panel-header">{{ $t('Consums.pecesConsum') }}</div>
              <div class="grid-panel-body">
                <GridLiniesConsumBuscador :linies="liniesSeleccionades" />
              </div>
            </div>
          </SplitterPanel>
        </Splitter>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import moment from 'moment';
import { carrega } from '@/services/loader';
import ConsumsService from '@/services/consums.service';
import ComandesService from '@/services/comandes.service';
import CompletableInput from '@/components/CompletableInput.vue';
import CompletableInputServer from '@/components/CompletableInputServer.vue';
import AjudaClient from '@/views/modals/AjudaClient.vue';
import AjudaArticleClientByClient from '@/views/modals/AjudaArticleClientByClient.vue';
import AjudaArticleClientByArticle from '@/views/modals/AjudaArticleClientByArticle.vue';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import GridConsumsBuscador from '@/components/consums/buscador/GridConsumsBuscador.vue';
import GridLiniesConsumBuscador from '@/components/consums/buscador/GridLiniesConsumBuscador.vue';
import ModalSeleccionarPlataforma from '@/views/modals/consums/ModalSeleccionarPlataforma.vue';
import ModalNouConsum from '@/views/modals/consums/ModalNouConsum.vue';
import ModalDetallConsum from '@/views/modals/consums/ModalDetallConsum.vue';

const filtreVisible = ref(true);
const consums = ref([]);
const liniesSeleccionades = ref([]);

const visibleSeleccionar = ref(false);
const visibleNou = ref(false);
const visibleDetall = ref(false);
const plataformaActual = ref(null);
const detallIdAlbara = ref(null);
const detallClientNom = ref('');

// --- Pickers de client i article-client (mateix comportament que el buscador d'albarans) ---
const ajudaClientVisible = ref(false);
let ajudaClientSelectItem = null;
const visibleAjudaArticleClientByClient = ref(false);
const visibleAjudaArticleClientByArticle = ref(false);
const ultimaAjudaVisibleByClient = ref(true);
let ajudaArticleClientSelectItem = null;

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
  ultimaAjudaVisibleByClient.value = localStorage.getItem('ConsumsUltimaAjudaVisibleClient') === null
    ? true
    : JSON.parse(localStorage.getItem('ConsumsUltimaAjudaVisibleClient'));
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
  localStorage.setItem('ConsumsUltimaAjudaVisibleClient', ultimaAjudaVisibleByClient.value);
};

const ajudaArticleClientCallback = async (artCli) => {
  visibleAjudaArticleClientByClient.value = false;
  visibleAjudaArticleClientByArticle.value = false;
  if (ajudaArticleClientSelectItem) {
    const ac = await fetchArticleClient(artCli);
    ajudaArticleClientSelectItem({ codi: artCli, nom: ac?.nom || '' });
  }
};

const state = reactive({
  empresa: '40',
  numeros: '',
  dataInici: moment().subtract(1, 'year').toDate(),
  dataFi: new Date(),
  client: '',
  articleClient: '',
  magatzem: '',
  albEspecial: '',
  identificadorConsum: '',
  facturat: null,
  tancat: null,
  pendentFacturar: null,
});

const buscar = async () => {
  const params = new URLSearchParams();
  const numeros = state.numeros ? state.numeros.trim() : '';
  if (state.empresa) params.append('empresa', state.empresa);
  if (numeros) params.append('numeros', numeros);
  if (state.client) params.append('client', state.client);
  if (state.articleClient) params.append('articleClient', state.articleClient);
  if (state.magatzem) params.append('magatzemSortida', state.magatzem);
  if (state.albEspecial) params.append('albEspecial', state.albEspecial);
  if (state.identificadorConsum) params.append('identificadorConsum', state.identificadorConsum);
  if (state.dataInici) params.append('dataInici', moment(state.dataInici).format('YYYY-MM-DD'));
  if (state.dataFi) params.append('dataFi', moment(state.dataFi).format('YYYY-MM-DD'));
  if (state.facturat != null) params.append('facturat', state.facturat);
  if (state.tancat != null) params.append('tancat', state.tancat);
  if (state.pendentFacturar != null) params.append('pendentFacturar', state.pendentFacturar);

  const resultat = await carrega(ConsumsService.buscarConsums(params));
  const llista = resultat?.data ?? resultat ?? [];
  consums.value = llista.map(c => ({ ...c, _key: `${c.id.codi}-${c.id.empresa}` }));
  liniesSeleccionades.value = [];
};

const onSeleccioCanviada = (linies) => {
  liniesSeleccionades.value = linies;
};

const onVeureDetall = (consum) => {
  if (!consum?.id) return;
  detallIdAlbara.value = { codi: consum.id.codi, empresa: consum.id.empresa };
  detallClientNom.value = consum.clientNom || '';
  visibleDetall.value = true;
};

const obrirSeleccionar = () => { visibleSeleccionar.value = true; };

// Triada la plataforma, es demanen client, data i albarà especial per crear la capçalera del consum
const plataformaSeleccionada = (plataforma) => {
  plataformaActual.value = plataforma;
  visibleSeleccionar.value = false;
  visibleNou.value = true;
};

// Capçalera creada: s'obre el detall per anar-hi afegint les peces
const onConsumCreat = ({ idAlbara, clientNom }) => {
  detallIdAlbara.value = idAlbara;
  detallClientNom.value = clientNom || '';
  visibleNou.value = false;
  visibleDetall.value = true;
  buscar();
};
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
.grid-panel-header {
  padding: 0.5rem 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
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
  padding: 0.25rem 0.5rem;
}
.element-filtre > label {
  display: block;
}
.break {
  flex-basis: 100%;
  height: 0;
}
</style>
