<template>
  <EditorComentaris v-if="visibleModalComentarisInterns" :carregat="visibleModalComentarisInterns" @update:carregat="visibleModalComentarisInterns = $event;"
    :text="liniaSeleccionada.comentarisInterns" :callback="updateComentarisInterns" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <EditorComentaris v-if="visibleModalComentarisClient" :carregat="visibleModalComentarisClient" @update:carregat="visibleModalComentarisClient = $event;"
    :text="liniaSeleccionada.comentarisClient" :callback="updateComentarisClient" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <ModalAdjuntsComandes v-if="visibleModalAdjunts" :carregat="visibleModalAdjunts"
    :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"
    :comanda="liniaSeleccionada.comanda" @update:carregat="visibleModalAdjunts = $event" />
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :draggable="false"
    :style="{ width: '90vw', maxHeight: '90vh', overflow: 'auto' }">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600;">
          {{ `${$t('Propostes.Linies del grup')}` }}
        </span>
      </div>
    </template>
    <FitxaStocks v-if="fitxaStock" style="margin-top: 10px; margin-bottom: 15px;"
        :fitxes="fitxaStock.fitxes" :fitxesSatelit="fitxaStock.fitxesSatelit"
        :hiHaIntermig="fitxaStock.hiHaMagatzemIntermig" :isNormalitzat="isNormalitzat"
        scrollHeight="30vh" />
    <div id="elementGridLiniesTraspas">
      <DataTable :value="linies" class="p-datatable-sm"
              dataKey="codiNumeroFormat"
              v-model:expandedRows="expandedRows"
              style="margin-top: 10px;"
              :scrollable="true" scrollHeight="45vh"
              showGridlines
              v-model:selection="liniaSeleccionada" selectionMode="single"
              :rowClass="rowClass">
        <template #empty>
          <div style="width:100%; text-align: center; padding: 20px;">
            {{ $t('Propostes.Cap proposta') }}
          </div>
        </template>
        <Column :header="$t('Comandes.Linia comanda')" :style="{width:'160px'}" style="max-width: 160px;">
          <template #body="{data}">
            <span v-if="data.isPrimeraLiniaNecessitaStock" v-tooltip.top="$t('Propostes.Primera linia necessita stock')">
              <i class="pi pi-arrow-circle-right" style="color:#fd7e14; margin-right:5px; font-weight:700;"></i>
            </span>
            <span v-tooltip="$empresa(data.empresa)">{{ data.codiNumeroFormat }}</span>
          </template>
        </Column>
        <Column :header="$t('Comandes.Tipus')" :style="{width:'45px'}" style="max-width: 45px; text-align: center;">
          <template #body="{data}">
            <div style="width: 100%; text-align: center;">
              <ColumnaTipusComanda :tipus="data.tipusLinia" :servida="!data.qtatPendent" />
            </div>
          </template>
        </Column>
        <Column :header="$t('Comandes.Comanda client')" :style="{width:'250px'}">
          <template #body="{data}">
            <div class="ellipsis" v-tooltip="data.comandaClient">
              {{ data.comandaClient }}
            </div>
          </template>
        </Column>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
          <template #body="{data}">
            <div style="width: 100%;">
              <Button icon="pi pi-paperclip" class="p-button-rounded buttoicon"
                @click="liniaSeleccionada = data; visibleModalAdjunts = true" />
            </div>
          </template>
        </Column>
        <Column :header="$t('Comandes.Data solicitada')" :style="{width:'110px'}" style="max-width: 110px;">
          <template #body="{data}">
            <span v-if="data.dataSolicitada">{{ $d($toDate(data.dataSolicitada), 'short') }}</span>
          </template>
        </Column>
        <Column :header="$t('Comandes.Set')" :style="{width:'30px'}" style="text-align: right; max-width: 30px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">{{ setmana(data.dataSolicitada) }}</div>
          </template>
        </Column>
        <Column :header="$t('Comandes.Data sortida')" :style="{width:'180px'}" style="max-width: 250px;">
          <template #body="{data}">
            <span v-if="data.dataSortida">{{ $d($toDate(data.dataSortida), 'short') }}</span>
            <span v-if="data.dataSortidaInterna">
              {{ ' ⇐ ' + $d($toDate(data.dataSortidaInterna), 'short') }}
            </span>
          </template>
        </Column>
        <Column :header="$t('Comandes.Data confirmada')" :style="{width:'110px'}" style="max-width: 110px;">
          <template #body="{data}">
            <span v-if="data.dataConfirmada">{{ $d($toDate(data.dataConfirmada), 'short') }}</span>
          </template>
        </Column>
        <Column :header="$t('Comandes.Quantitat')" :style="{width:'100px'}" style="text-align: right; max-width: 100px;">
          <template #body="{data}"><div style="width: 100%; text-align: right;">{{ $n(data.quantitat) }}</div></template>
        </Column>
        <Column :header="$t('Comandes.Quantitat servida')" :style="{width:'100px'}" style="text-align: right; max-width: 100px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              <a v-if="data.quantitatServida" class="enllas" @click="showNode(data)">{{ $n(data.quantitatServida) }}</a>
              <span v-else>0</span>
            </div>
          </template>
        </Column>
        <Column :header="$t('Comandes.Quantitat pendent')" :style="{width:'100px'}" style="text-align: right; max-width: 100px;">
          <template #body="{data}"><div style="width: 100%; text-align: right;">{{ $n(data.qtatPendent) }}</div></template>
        </Column>
        <Column :header="$t('Comandes.Acumulat')" :style="{width:'100px'}" style="text-align: right; max-width: 100px;">
          <template #body="{data}"><div style="width: 100%; text-align: right;">{{ $n(data.quantitatAcumulada) }}</div></template>
        </Column>
        <Column :header="$t('Comandes.Preu')" :style="{width:'160px'}" style="max-width: 160px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              <span v-if="data.comandaBlanca" v-tooltip="`CB: ${$n(data.comandaBlanca)}`">
                <font-awesome-icon icon="fa-solid fa-copyright" style="font-size: 1.05rem" />
              </span>
              <span v-if="data.isPreuFixat" v-tooltip="$t('Comandes.Preu fixat')">
                <font-awesome-icon icon="fa-solid fa-hand" style="font-size: 1.05rem" />
              </span>
              {{ `${$n(data.preu.valor, 'decimalLong')} ${data.preu.divisa}` }}
            </div>
          </template>
        </Column>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" :header="$t('Comandes.Int')">
          <template #body="{data}">
            <div style="width: 100%;">
              <Button icon="pi pi-comments" class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.comentarisInterns}"
                @click="liniaSeleccionada = data; visibleModalComentarisInterns = true" />
            </div>
          </template>
        </Column>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" :header="$t('Comandes.Ext')">
          <template #body="{data}">
            <div style="width: 100%;">
              <Button icon="pi pi-megaphone" class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.comentarisClient}"
                @click="liniaSeleccionada = data; visibleModalComentarisClient = true" />
            </div>
          </template>
        </Column>
        <template #expansion="slotProps">
          <div style="background-color: #ffffdc; padding: 10px 40px;">
            <DataTable :value="slotProps.data.albarans" class="p-datatable-sm" showGridlines style="max-width: 1050px;">
              <template #empty>
                <div style="text-align: center; padding: 8px;">{{ $t('Propostes.Cap proposta') }}</div>
              </template>
              <Column :header="$t('Comandes.Data')" :style="{width:'100px'}" style="max-width: 100px;">
                <template #body="{data}"><span v-if="data.dataAlbara">{{ $d($toDate(data.dataAlbara), 'short') }}</span></template>
              </Column>
              <Column :header="$t('Comandes.Albara')" :style="{width:'300px'}" style="max-width: 300px;">
                <template #body="{data}">{{ data.albara + (data.albaraEspecial ? ' - ' + data.albaraEspecial : '') }}</template>
              </Column>
              <Column field="enviamentAlbara" :header="$t('Comandes.Forma Enviament')" :style="{width:'180px'}" style="max-width: 180px;" />
              <Column :header="$t('Comandes.Quantitat')" :style="{width:'100px'}" style="max-width: 100px;">
                <template #body="{data}"><div style="width: 100%; text-align: right;">{{ $n(data.quantitat) }}</div></template>
              </Column>
              <Column field="factura" :header="$t('Comandes.Factura')" :style="{width:'100px'}" style="max-width: 100px;" />
              <Column :header="$t('Comandes.Entregat')" :style="{width:'180px'}" style="max-width: 210px;">
                <template #body="{data}">{{ data.entregat ? $t('App.Si') : $t('App.No') }}</template>
              </Column>
            </DataTable>
          </div>
        </template>
      </DataTable>
    </div>
  </Dialog>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import moment from 'moment';
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import ColumnaTipusComanda from '@/components/ColumnaTipusComanda.vue';
import ModalAdjuntsComandes from '@/views/modals/ModalAdjuntsComandes.vue';
import FitxaStocks from '@/components/propostes/traspas/FitxaStocks.vue';
import propostesService from '@/services/propostes.service';
import { carrega } from '@/services/loader';
import { usePermisosStore } from '@/stores/permisos';

export default {
  name: 'ModalLiniesTraspas',
  components: {
    EditorComentaris,
    ColumnaTipusComanda,
    ModalAdjuntsComandes,
    FitxaStocks,
  },
  props: {
    artint: String,
    clicod: String,
    client: String,
    empresa: String,
    article: String,
    referencia: String,
    magOrigen: String,
    magDesti: String,
    dataPrevistaInici: String,
    dataPrevistaFi: String,
  },
  emits: ['update:carregat', 'comentaris-actualitzats'],
  setup(props, { emit }) {
    const permisosStore = usePermisosStore();
    const visible = ref(true);
    const linies = ref([]);
    const fitxaStock = ref(null);
    const isNormalitzat = computed(() => props.clicod === '000000');
    const liniaSeleccionada = ref();
    const visibleModalComentarisInterns = ref(false);
    const visibleModalComentarisClient = ref(false);
    const visibleModalAdjunts = ref(false);
    const expandedRows = ref([]);

    // Ressalta la fila que el traspàs ha de començar a cobrir (primera que necessita stock)
    const rowClass = (data) => data.isPrimeraLiniaNecessitaStock ? 'estilRow fila-necessita-stock' : 'estilRow';

    // Desplega/replega el detall dels albarans que han servit la línia
    const showNode = (linia) => {
      const index = expandedRows.value.indexOf(linia);
      if (index >= 0) expandedRows.value.splice(index, 1);
      else expandedRows.value.push(linia);
    };

    const modalVisible = computed(() =>
      visibleModalComentarisInterns.value || visibleModalComentarisClient.value || visibleModalAdjunts.value
    );

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      const resp = await carrega(propostesService.obtenirLiniesTraspasGrup(
        props.artint, props.clicod, props.client, props.empresa, props.magOrigen, props.magDesti,
        props.dataPrevistaInici, props.dataPrevistaFi));
      linies.value = resp.linies;
      fitxaStock.value = resp.fitxaStock;
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const handler = (ev) => {
      if (modalVisible.value) return;
      if (ev.key === 'Escape') hide();
    };

    // Número de setmana de la data sol·licitada
    const setmana = (data) => data ? moment(data).isoWeek() : '';

    // Recalcula i notifica els flags agregats del grup a partir de les línies carregades
    const notificarComentaris = () => {
      emit('comentaris-actualitzats', {
        isTeComentarisInterns: linies.value.some(l => !!l.comentarisInterns),
        isTeComentarisClient: linies.value.some(l => !!l.comentarisClient),
      });
    };

    const updateComentarisInterns = async (text) => {
      await carrega(propostesService.actualitzarComentarisInterns(liniaSeleccionada.value.comanda, liniaSeleccionada.value.numero, text.trim()));
      liniaSeleccionada.value.comentarisInterns = text.trim();
      notificarComentaris();
    };

    const updateComentarisClient = async (text) => {
      await carrega(propostesService.actualitzarComentarisClient(liniaSeleccionada.value.comanda, liniaSeleccionada.value.numero, text.trim()));
      liniaSeleccionada.value.comentarisClient = text.trim();
      notificarComentaris();
    };

    const hide = () => {
      emit('update:carregat', false);
    };

    return {
      visible,
      linies,
      fitxaStock,
      isNormalitzat,
      rowClass,
      liniaSeleccionada,
      permisosStore,
      visibleModalComentarisInterns,
      visibleModalComentarisClient,
      visibleModalAdjunts,
      expandedRows,
      showNode,
      setmana,
      updateComentarisInterns,
      updateComentarisClient,
      hide,
    };
  },
}
</script>

<style scoped>
  ::v-deep(.estilRow) {
    cursor: pointer;
  }

  ::v-deep(.estilRow .buttoicon) {
    height: 1.5rem !important;
    width: 1.5rem !important;
    margin-left: auto;
    margin-right: auto;
  }

  ::v-deep(.estilRow .buttoicondisabled) {
    background-color: rgb(102, 102, 102);
    border-color: rgb(102, 102, 102);
  }

  ::v-deep(.fila-necessita-stock td) {
    background-color: #fff3cd !important;
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .enllas {
    color: #007bff;
    text-decoration: underline;
    cursor: pointer;
  }
</style>
