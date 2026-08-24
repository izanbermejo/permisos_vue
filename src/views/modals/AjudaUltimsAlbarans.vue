<template>
  <EditorComentaris v-if="visibleModalGuardarNota" :carregat="visibleModalGuardarNota" @update:carregat="visibleModalGuardarNota = $event;"
      :text="registreSeleccionat.nota" :callback="guardarNota" :potEditar="true"/>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" style="width: 1500px;">
    <template #header>
      <div style="width: 100%; margin-bottom: 10px;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('ModalAjudaLlistatAlbarans.titol') }}</span>
        <Button @click="exportarAlbarans" :label="$t('ModalAjudaLlistatAlbarans.Exportar albarans')" icon="pi pi-download" class="p-button-sm" style="float: right; margin-right: 10px;"/>
      </div>
    </template>
    <div class="capsalera">
      <div v-if="props.teEdi" class="card">
        <h5 class="card-header">
          {{ $t('ModalAjudaLlitatAlabarans.EDI.titol') }}
        </h5>
        <div class="card-body card-body-capsalera">
          <span>{{ `${$t('ModalAjudaLlitatAlabarans.EDI.albara')}: ${props.albaraReferenciaClient || '-'}` }}</span>
          <span>{{ `${$t('ModalAjudaLlistatAlbarans.EDI.acumulat')}: ${$n(ultimsAlbarans.acumulatSegonsClient ?? 0)}` }}</span>
        </div>
      </div>
      <div class="card">
        <h5 class="card-header">
          {{ $t('ComandesEDI.linies.ultimsAlbarans.transit') }}
        </h5>
        <div class="card-body card-body-capsalera">
          <span>{{ `${$t('ModalAjudaLlitatAlabarans.EDI.albara')}: ${ultimsAlbarans.albaraEnTransit ? ultimsAlbarans.albaraEnTransit : '-'}` }}</span>
          <span>{{ `${$t('ModalAjudaLlistatAlbarans.EDI.peces transit')}: ${$n(ultimsAlbarans.quantitatEnTransit ?? 0)}` }}</span>
        </div>
      </div>
      <div class="card">
        <h5 class="card-header">
          {{ $t('ModalAjudaLlitatAlabarans.acumulatsAMES.titol') }}
        </h5>
        <!-- Si no hi ha acumulat definit a AMES -->
        <div v-if="!ultimsAlbarans.dataAcumulatDefinidaArticleclient && !ultimsAlbarans.numAlbaraFacturaDefinidaArticleclient && !ultimsAlbarans.quantitatAcumuladaDefinidaArticleclient" class="card-body card-body-capsalera">
          <span>{{ $t('ComandesEDI.linies.comanda.noacumulat') }}</span>
        </div>
        <div v-else class="card-body card-body-capsalera">
          <!-- Nomes surt o albara o data (mai els dos) -->
          <span v-if="ultimsAlbarans.numAlbaraFacturaDefinidaArticleclient || !ultimsAlbarans.dataAcumulatDefinidaArticleclient">
            {{ `${$t('ComandesEDI.linies.comanda.albaraacumulat')}: ${ultimsAlbarans.numAlbaraFacturaDefinidaArticleclient ? ultimsAlbarans.numAlbaraFacturaDefinidaArticleclient : '-'}` }}
          </span>
          <span v-else>
            {{ `${$t('ComandesEDI.linies.comanda.dataacumulat')}: ${ultimsAlbarans.dataAcumulatDefinidaArticleclient}` }}
          </span>
          <span>{{ `${$t('ComandesEDI.linies.comanda.stockacumulat')}: ${$n(ultimsAlbarans.quantitatAcumuladaDefinidaArticleclient)}` }}</span>
        </div>
      </div>
    </div>
    <div v-if="props.teEdi && (ultimsAlbarans.albaraEnTransit === 0 || !ultimsAlbarans.isAcumulatClientMateixReferencia)" class="card" style="display: flex; justify-content: space-between; margin-left: 15px; margin-right: 15px;">
      <div v-if="ultimsAlbarans.albaraEnTransit === 0" class="card-header card-header-error" >
        <i class="pi pi-exclamation-triangle" style="color: orange;"></i>
        <span style="margin-left: 10px; font-weight: bold;">{{ $t('ModalAjudaLlistatAlbarans.EDI.error.albara_transit') }}</span>
      </div>
      <div v-else-if="!ultimsAlbarans.isAcumulatClientMateixReferencia" class="card-header card-header-error" >
        <i class="pi pi-exclamation-triangle" style="color: orange;"></i>
        <span style="margin-left: 10px; font-weight: bold;">{{ $t('ModalAjudaLlitatAlabarans.EDI.error.acumulat') }}</span>
      </div>
    </div>
    <div class="card-body">
      <div id="divLinies">
        <DataTable v-model:expandedRows="expandedRows" :value="ultimsAlbarans.albarans" class="p-datatable-sm"
          :dataKey="codiNumeroFormat" style="margin-top: 10px;" :scrollable="true" scrollHeight="55vh"
          :resizableColumns="true" columnResizeMode="expand" contextMenu
          v-model:contextMenuSelection="registreSeleccionat" @rowContextmenu="showContextMenu($event)" showGridlines
          v-model:selection="registreSeleccionat" selectionMode="single" :rowClass="() => 'estilRow'"
          @row-select="selectedIndex = $event.index" @row-dblclick="obrirEditorNota(registreSeleccionat)">
          <template #empty>
            <div style="width:100%; height: 45vh; text-align: center; padding-top: 30px;">
              <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('ComandesEDI.linies.ultimsAlbarans.capalbara')" />
            </div>
          </template>
          <Column :style="{ width: '40px'}"
            style="max-width: 40px;">
            <template #body="{ data }">
              <span v-if="!data.isAlbaraDeReferenciaTransit" style="display: block; text-align: center;">
                <a class="enllas"
                  @click="canviaUltimAlbara(data.id.codi)">
                  <i class="pi pi-sign-in" v-tooltip="$t('ComandesEDI.linies.ultimsAlbarans.assigna')" />
                </a></span>
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.albara')" :style="{ width: '100px' }"
            style="max-width: 100px; display: flex; justify-content: space-between;">
            <template #body="{ data }">
              <div>
                <span v-if="data.isAlbaraDeReferenciaTransit" style="font-weight: bold;">{{ data.id.codi }}</span>
                <span v-else>{{ data.id.codi }}</span>
              </div>
              <i v-if="data.albaraEspecial" class="pi pi-info-circle" style="margin-right: 5px; " v-tooltip="`${$t('ComandesEDI.linies.ultimsAlbarans.taula.Alb especial')}: ${data.albaraEspecial}`" />
              
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.factura')" :style="{ width: '100px' }"
            style="max-width: 100px;">
            <template #body="{ data }">
              {{ data.factures }}
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.data')" :style="{ width: '120px' }"
            style="max-width: 120px;">
            <template #body="{ data }">
              {{ $d(data.data) }}
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.forma enviament')" :style="{ width: '320px' }"
            style="max-width: 320px;">
            <template #body="{ data }">
              <span :style="{ color: data.isMateixaFormaEnviamentHabitual ? '#495057' : 'green', fontWeight: data.isMateixaFormaEnviamentHabitual ? 'normal' : 'bold' }" class="ellipsis" v-tooltip="`${$t(`FormaEnviament.${data.formaEnviament}`)} • ${data.incoterm} • ${$destiTransport(data.desti)}`">
                {{ `${$t(`FormaEnviament.${data.formaEnviament}`)} • ${data.incoterm} • ${$destiTransport(data.desti)}` }}
              </span>
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.transportista')">
            <template #body="{ data }">
              <span class="ellipsis" v-tooltip="`${$transportista(data.transportista)}`">
                {{ `${$transportista(data.transportista)}` }}
              </span>
            </template>
          </Column>          
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.quantitat')" :style="{ width: '80px' }"
            style="max-width: 100px;">
            <template #body="{ data }">
              <div style="width: 100%; text-align: right;">
                {{ $n(data.quantitat) }}
              </div>
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.acumulat')" :style="{ width: '120px' }" style="max-width: 120px;">
            <template #body="{ data }">
              <div style="width: 120px; text-align: right;"> {{ $n(data.acumulat) }}</div>
            </template>
          </Column>
          <Column v-if="ultimsAlbarans.quantitatEnTransit > 0" :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.transit')" :style="{ width: '80px' }" 
            style="max-width: 100px;">
            <template #body="{ data }">
              <div style="width: 100%; text-align: right;">
                {{ $n(data.transit) }}
              </div>
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.entregat')" :style="{ width: '80px' }"
            style="max-width: 80px;">
            <template #body="{ data }">
              <div style="width: 70px; text-align: center;"> {{ data.isEntregat ? $t('App.Si') : $t('App.No') }}</div>
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.nota')" :style="{ width: '150px' }" style="max-width: 150px;">
            <template #body="{ data }">
              <div>{{ data.nota }}</div>
            </template>
          </Column>
        </DataTable>
      </div>
      <div v-if="ultimsAlbarans.albarans?.length >= 100" style="margin-top: 10px; display: flex; align-items: center; width: 100%;">
        <transition name="slide-fade">
            <span class="missatgeLimit" style="display: inline-flex; align-items: center; justify-content: center; flex-grow: 1;">
                <font-awesome-icon icon="fa-solid fa-info" style="margin-right: 5px;" />
                {{ $t('ComandesEDI.linies.ultimsAlbarans.Nomes es mostren els primers albarans') }}
            </span>
        </transition>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { isContextMenuKey } from '@/utils/contextmenuUtils';
import { controlDataTable } from '@/utils/datetableUtils';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from "vue-i18n";
import EditorComentaris from './EditorComentaris.vue';
import { carrega } from '@/services/loader';
import albaraService from '@/services/albara.service';
import { saveAs } from 'file-saver';

export default {
  name: "AjudaUltimsAlbarans",
  components: {
    EditorComentaris
  },
  props: {
    teEdi: Boolean,
    albarans: Array,
    artint: String,
    clicod: String,
    albaraReferenciaClient: String,
  },
  setup(props, { emit }) {
    const { locale } = useI18n();
    const ultimsAlbarans = computed(() => props.albarans || []);
    const visible = ref(true);
    const selectedIndex = ref(-1);
    const visibleModalGuardarNota = ref(false);
    const registreSeleccionat = ref();
    let isExportant = false;

    const uniqueId = computed(() => {
      const randomPart = Math.random().toString(36).substr(2, 9);
      const timeStamp = Date.now();
      return `grid-${randomPart}-${timeStamp}`;
    });

    const elementTaula = () => document.getElementById(uniqueId.value);

    onMounted(async () => {
      document.addEventListener("keydown", handler);
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const modalVisible = computed(() => {
      return visibleModalGuardarNota.value;
    });

    const handler = (ev) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu
      if (isContextMenuKey(ev))  return;
      if (modalVisible.value) return;
      // Si no està el focus al grid
      // if (!props.focused) return
      // Controls de la taula
      controlDataTable(ev, elementTaula(), selectedIndex, ultimsAlbarans);
      // Controls
      if (ev.key === 'Escape') {
          actionHandler(ev, () => hide());
      }
    }

    const actionHandler = (ev, action) => {
      ev.preventDefault();
      action();
    }

    const obrirEditorNota = async (rowData) => {
      registreSeleccionat.value = rowData;
      visibleModalGuardarNota.value = true;
    };

    const guardarNota = async (novaNota) => {
      const request = {
        artint: props.artint,
        clicod: props.clicod,
        nota: novaNota,
      };

      await carrega(albaraService.guardarNotaAlbara(registreSeleccionat.value.id, request));
      
      if (registreSeleccionat.value) {
        registreSeleccionat.value.nota = novaNota;
      }
    };

    const exportarAlbarans = async () => {
      if (isExportant) return;

      isExportant = true;

      let params = new URLSearchParams();

      params.append('codiAlbaraFacturaReferenciaTransit', '');
      params.append('acumulatSegonsClient', 1234);
      const resp = await carrega(albaraService.exportarAlbarans(props.clicod, props.artint, params));
      saveAs(new Blob([resp]), `Albarans_${props.clicod}_${props.artint}.xlsx`);

      isExportant = false;
    }

    const canviaUltimAlbara = async (nouUltimAlbara) => {
      emit("canviatUltimAlbara", nouUltimAlbara);
    };

    const hide = () => {
      emit("update:carregat", false);
    };

    return {
      locale,
      visible,
      props,
      ultimsAlbarans,
      canviaUltimAlbara,
      hide,
      exportarAlbarans,
      obrirEditorNota,
      guardarNota,
      registreSeleccionat,
      visibleModalGuardarNota,
    };

  },
};
</script>

<style scoped>
.titolCapsalera {
  margin-left: 25px;
  border: 1px solid #ffffff;
  background-color: #ffffff;
  padding: 4px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.form {
  margin-top: 2px;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px 30px;
}

.element-form>label {
  display: block;
}

.element-form>small {
  display: block;
}

.break {
  flex-basis: 100%;
  height: 0;
}

.capsalera {
  display: flex;
  flex-direction: row;
  gap: 15px;
  padding: 0 15px;
  margin-bottom: 10px;
}

.capsalera .card {
  flex: 1;
}

.card-header {
  font-weight: 600;
  font-size: 18px;
}

.card-body-capsalera {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 5px 15px;
}

.card-header-error {
  padding: 5px 15px;
  box-shadow: 0 0 4px #888;
  border: none;
}

.ellipsis {
  white-space: nowrap;      /* Impide que el texto se divida en varias líneas */
  overflow: hidden;         /* Oculta el texto que no cabe */
  text-overflow: ellipsis;  /* Muestra los puntos suspensivos cuando el texto se corta */
  width: 100%;              /* Asegura que el texto ocupe todo el ancho disponible */
}

.missatgeLimit {
  background-color: rgb(201, 227, 189);
  border: 1px solid rgb(52, 136, 68);
  border-radius: 10px;
  padding: 2px;
  display: inline-block;
  width: 100%;
}
</style>