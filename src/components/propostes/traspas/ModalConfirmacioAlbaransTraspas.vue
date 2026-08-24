<template>
  <ModalDetallAlbara v-model:visible="detallVisible" :idAlbara="detallIdAlbara" />
  <Dialog :visible="visible" modal :closable="true" :closeOnEscape="false" :draggable="false"
    @update:visible="onHide"
    :style="{ width: '70vw', maxHeight: '90vh' }" :header="$t('Propostes.Confirmar creacio albarans')">

    <div class="barra-opcions">
      <span class="opcio-item">
        <font-awesome-icon icon="fa-solid fa-calendar-days" />
        <b>{{ $t('Propostes.Data albara') }}:</b> {{ formatData(data) }}
      </span>
      <span class="opcio-item">
        <font-awesome-icon :icon="tancarAlbaransNous ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open'" />
        {{ tancarAlbaransNous ? $t('Propostes.Albarans nous es tancaran') : $t('Propostes.Albarans nous quedaran oberts') }}
      </span>
      <Button :label="$t('Propostes.Canviar opcions')" icon="pi pi-pencil"
        class="p-button-sm p-button-outlined" @click="$emit('canviar-opcions')" />
    </div>

    <div class="control-aprofitar">
      <span class="control-item">
        <Checkbox v-model="aprofitar" :binary="true" inputId="chkAprofitarObertsTraspas" @change="emitRecalcular" />
        <label for="chkAprofitarObertsTraspas">{{ $t('Propostes.Aprofitar albarans oberts') }}</label>
      </span>
      <span class="control-item">
        <Checkbox v-model="agruparClient" :binary="true" inputId="chkAgruparPerClientTraspas" @change="emitRecalcular" />
        <label for="chkAgruparPerClientTraspas">{{ $t('Propostes.Crear un albara per client') }}</label>
      </span>
    </div>

    <div v-if="!teContingut" style="padding: 20px; text-align: center;">
      {{ $t('Propostes.Res a crear') }}
    </div>

    <!-- Avís d'stock negatiu (al magatzem d'origen) -->
    <div v-if="avisosStockNegatiu.length" class="seccio seccio-avis">
      <h6 class="seccio-titol seccio-titol-avis">
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" style="margin-right: 8px;" />
        {{ $t('Albarans.Avis stock negatiu') }} ({{ avisosStockNegatiu.length }})
      </h6>
      <div class="seccio-cos">
        <p class="avis-text">{{ $t('Albarans.Avis stock negatiu descripcio') }}</p>
        <DataTable :value="avisosStockNegatiu" class="p-datatable-sm" showGridlines>
          <Column :header="$t('Propostes.Empresa')" field="empresa" />
          <Column :header="$t('Propostes.Article')" field="article" />
          <Column :header="$t('Propostes.Referencia')" field="referencia" />
          <Column :header="$t('Albarans.Magatzem')" field="magatzem" />
          <Column :header="$t('Albarans.Stock actual')" bodyStyle="text-align:right">
            <template #body="{ data }">{{ $n(data.stockActual) }}</template>
          </Column>
          <Column :header="$t('Albarans.Quantitat servir')" bodyStyle="text-align:right">
            <template #body="{ data }">{{ $n(data.quantitatServir) }}</template>
          </Column>
          <Column :header="$t('Albarans.Stock resultant')" bodyStyle="text-align:right">
            <template #body="{ data }"><b class="stock-negatiu">{{ $n(data.stockResultant) }}</b></template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Albarans nous -->
    <div v-if="albaransNous.length" class="seccio">
      <h6 class="seccio-titol">
        <font-awesome-icon icon="fa-solid fa-file-circle-plus" style="margin-right: 8px;" />
        {{ $t('Propostes.Albarans nous') }} ({{ albaransNous.length }})
      </h6>
      <div class="seccio-cos">
        <div v-for="(albara, idx) in albaransNous" :key="`nou-${idx}`" class="card albara-card">
          <div class="card-header albara-header">
            <span class="albara-cap-esq">
              <b>{{ $t('Propostes.Albara') }} {{ idx + 1 }}</b>
              <span class="albara-data"><font-awesome-icon icon="fa-solid fa-calendar-days" /> {{ formatData(albara.data) }}</span>
              <span class="estat-badge" :class="albara.esTancara ? 'estat-tancat' : 'estat-obert'">
                <font-awesome-icon :icon="albara.esTancara ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open'" />
                {{ albara.esTancara ? $t('Albarans.Tancat') : $t('Albarans.Obert') }}
              </span>
            </span>
            <span class="traspas-ruta">
              <!-- Línia 1: empresa (o empreses si hi ha canvi). Codi en negreta, " - nom" sense -->
              <span class="ruta-linia">
                <span class="ruta-item"><b>{{ albara.empresaOrigen }}</b><span class="ruta-nom">{{ sufixNom($empresa(albara.empresaOrigen), albara.empresaOrigen) }}</span></span>
                <template v-if="albara.empresaOrigen !== albara.empresaDesti">
                  <b class="ruta-fletxa">⇒</b>
                  <span class="ruta-item"><b>{{ albara.empresaDesti }}</b><span class="ruta-nom">{{ sufixNom($empresa(albara.empresaDesti), albara.empresaDesti) }}</span></span>
                </template>
              </span>
              <!-- Línia 2: magatzem origen → (intermig) → destí final, amb el nom del plugin -->
              <span class="ruta-linia ruta-linia-mag">
                <span class="ruta-item"><b>{{ albara.magatzemOrigen }}</b><span class="ruta-nom">{{ sufixNom($magatzem(albara.magatzemOrigen), albara.magatzemOrigen) }}</span></span>
                <template v-if="albara.magatzemIntermig">
                  <b class="ruta-fletxa">⇒</b>
                  <span class="ruta-item"><b>{{ albara.magatzemIntermig }}</b><span class="ruta-nom">{{ sufixNom($magatzem(albara.magatzemIntermig), albara.magatzemIntermig) }}</span></span>
                </template>
                <template v-if="albara.magatzemOrigen !== albara.magatzemDesti">
                  <b class="ruta-fletxa">⇒</b>
                  <span class="ruta-item"><b>{{ albara.magatzemDesti }}</b><span class="ruta-nom">{{ sufixNom($magatzem(albara.magatzemDesti), albara.magatzemDesti) }}</span></span>
                </template>
              </span>
            </span>
            <span class="badge-partida">
              {{ $t('Propostes.Partida arantzelaria') }}:
              {{ albara.partidaArantzelaria ? `${albara.partidaArantzelaria} - ${albara.descripcioPartidaArantzelaria}` : '-' }}
            </span>
          </div>
          <DataTable :value="albara.linies" class="p-datatable-sm taula-linies" showGridlines>
            <Column :header="$t('Propostes.Client')" headerStyle="width:170px" bodyStyle="width:170px">
              <template #body="{ data }"><div class="cel-ellipsis" v-tooltip="`${data.clicod} - ${data.nomClient}`">{{ data.clicod }} - {{ data.nomClient }}</div></template>
            </Column>
            <Column :header="$t('Propostes.Article')" headerStyle="width:150px" bodyStyle="width:150px">
              <template #body="{ data }"><div class="cel-ellipsis" v-tooltip="`${data.article}${data.clicod}`">{{ data.article }}{{ data.clicod }}</div></template>
            </Column>
            <Column :header="$t('Propostes.Referencia')" headerStyle="width:150px" bodyStyle="width:150px">
              <template #body="{ data }"><div class="cel-ellipsis" v-tooltip="data.referencia">{{ data.referencia }}</div></template>
            </Column>
            <Column :header="$t('Propostes.Q traspas')" headerStyle="width:100px" bodyStyle="width:100px; text-align:right">
              <template #body="{ data }">{{ $n(data.quantitat) }}</template>
            </Column>
            <Column :header="$t('Propostes.Preu traspas')" headerStyle="width:110px" bodyStyle="width:110px; text-align:right">
              <template #body="{ data }">{{ `${$n(data.preu, 'decimalLong')} ${data.divisa}` }}</template>
            </Column>
            <Column :header="$t('Propostes.Import')" headerStyle="width:100px" bodyStyle="width:100px; text-align:right">
              <template #body="{ data }">{{ $n(data.importLinia, 'decimal') }}</template>
            </Column>
            <Column headerStyle="width:130px" bodyStyle="width:130px; text-align:right">
              <template #header><span v-tooltip="$t('Albarans.Embalatge tooltip')">{{ $t('Albarans.Embalatge') }}</span></template>
              <template #body="{ data }">{{ embalatgeInfo(data) }}</template>
            </Column>
            <Column :header="$t('Albarans.Avis embalatge')" headerStyle="width:260px" bodyStyle="width:260px">
              <template #body="{ data }">
                <span v-if="data.avisEmbalatge" v-tooltip="avisEmbalatgeText(data.avisEmbalatge)" class="avis-emb-cel" :class="avisEmbalatgeClass(data.severitatEmbalatge)">
                  <font-awesome-icon :icon="avisEmbalatgeIcon(data.severitatEmbalatge)" class="avis-emb-icona" />
                  <span class="avis-emb-text">{{ avisEmbalatgeText(data.avisEmbalatge) }}</span>
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Albarans de traspàs oberts que s'aprofiten -->
    <div v-if="albaransExistents.length" class="seccio">
      <h6 class="seccio-titol">
        <font-awesome-icon icon="fa-solid fa-file-import" style="margin-right: 8px;" />
        {{ $t('Propostes.Afegir a albarans oberts') }} ({{ albaransExistents.length }})
      </h6>
      <div class="seccio-cos">
        <div v-for="(albara, idx) in albaransExistents" :key="`exist-${idx}`" class="card albara-card">
          <div class="card-header albara-header">
            <span>
              <b>{{ $empresa(albara.empresa) }} / </b>
              <b class="albara-link" v-tooltip="$t('Albarans.Veure detall')"
                @click="obrirDetallAlbara(albara)">{{ String(albara.codiAlbara).padStart(7, '0') }}</b>
            </span>
            <span class="descarta-ctrl" v-tooltip="$t('Propostes.No aprofitar aquest albara')">
              <Checkbox :modelValue="true" :binary="true" @update:modelValue="descartarAlbara(albara)" />
              <label>{{ $t('Propostes.Aprofitar') }}</label>
            </span>
          </div>
          <DataTable v-if="albara.liniesNoves.length" :value="albara.liniesNoves" class="p-datatable-sm taula-linies" showGridlines>
            <template #header>{{ $t('Propostes.Linies noves') }}</template>
            <Column :header="$t('Propostes.Client')" headerStyle="width:170px" bodyStyle="width:170px">
              <template #body="{ data }"><div class="cel-ellipsis" v-tooltip="`${data.clicod} - ${data.nomClient}`">{{ data.clicod }} - {{ data.nomClient }}</div></template>
            </Column>
            <Column :header="$t('Propostes.Article')" headerStyle="width:150px" bodyStyle="width:150px">
              <template #body="{ data }"><div class="cel-ellipsis" v-tooltip="`${data.article}${data.clicod}`">{{ data.article }}{{ data.clicod }}</div></template>
            </Column>
            <Column :header="$t('Propostes.Referencia')" headerStyle="width:150px" bodyStyle="width:150px">
              <template #body="{ data }"><div class="cel-ellipsis" v-tooltip="data.referencia">{{ data.referencia }}</div></template>
            </Column>
            <Column :header="$t('Propostes.Q traspas')" headerStyle="width:100px" bodyStyle="width:100px; text-align:right">
              <template #body="{ data }">{{ $n(data.quantitat) }}</template>
            </Column>
            <Column :header="$t('Propostes.Preu traspas')" headerStyle="width:110px" bodyStyle="width:110px; text-align:right">
              <template #body="{ data }">{{ `${$n(data.preu, 'decimalLong')} ${data.divisa}` }}</template>
            </Column>
            <Column :header="$t('Propostes.Import')" headerStyle="width:100px" bodyStyle="width:100px; text-align:right">
              <template #body="{ data }">{{ $n(data.importLinia, 'decimal') }}</template>
            </Column>
            <Column headerStyle="width:130px" bodyStyle="width:130px; text-align:right">
              <template #header><span v-tooltip="$t('Albarans.Embalatge tooltip')">{{ $t('Albarans.Embalatge') }}</span></template>
              <template #body="{ data }">{{ embalatgeInfo(data) }}</template>
            </Column>
            <Column :header="$t('Albarans.Avis embalatge')" headerStyle="width:260px" bodyStyle="width:260px">
              <template #body="{ data }">
                <span v-if="data.avisEmbalatge" v-tooltip="avisEmbalatgeText(data.avisEmbalatge)" class="avis-emb-cel" :class="avisEmbalatgeClass(data.severitatEmbalatge)">
                  <font-awesome-icon :icon="avisEmbalatgeIcon(data.severitatEmbalatge)" class="avis-emb-icona" />
                  <span class="avis-emb-text">{{ avisEmbalatgeText(data.avisEmbalatge) }}</span>
                </span>
              </template>
            </Column>
          </DataTable>
          <DataTable v-if="albara.liniesIncrementades.length" :value="albara.liniesIncrementades" class="p-datatable-sm" showGridlines style="margin-top: 6px;">
            <template #header>{{ $t('Propostes.Increments linies') }}</template>
            <Column :header="$t('Propostes.Linia')">
              <template #body="{ data }">{{ String(data.liniaAlbara).padStart(4, '0') }}</template>
            </Column>
            <Column :header="$t('Propostes.Article')" field="article" />
            <Column :header="$t('Propostes.Referencia')" field="referencia" />
            <Column :header="$t('Propostes.Quantitat actual')" bodyStyle="text-align:right">
              <template #body="{ data }">{{ $n(data.quantitatActual) }}</template>
            </Column>
            <Column :header="$t('Propostes.Quantitat afegida')" bodyStyle="text-align:right">
              <template #body="{ data }">+{{ $n(data.quantitatAfegida) }}</template>
            </Column>
            <Column :header="$t('Propostes.Quantitat resultant')" bodyStyle="text-align:right">
              <template #body="{ data }"><b>{{ $n(data.quantitatActual + data.quantitatAfegida) }}</b></template>
            </Column>
            <Column :header="$t('Propostes.Preu traspas')" bodyStyle="text-align:right">
              <template #body="{ data }">
                <span v-tooltip="$t('Propostes.Preu linia existent')">{{ `${$n(data.preu, 'decimalLong')} ${data.divisa}` }}</span>
              </template>
            </Column>
            <Column :header="$t('Propostes.Import afegit')" bodyStyle="text-align:right">
              <template #body="{ data }">{{ $n(data.importAfegit, 'decimal') }}</template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Albarans de traspàs oberts descartats per l'usuari (es poden tornar a aprofitar) -->
    <div v-if="aprofitar && albaransDescartats.length" class="seccio">
      <h6 class="seccio-titol">
        <font-awesome-icon icon="fa-solid fa-ban" style="margin-right: 8px;" />
        {{ $t('Propostes.Albarans descartats') }} ({{ albaransDescartats.length }})
      </h6>
      <div class="seccio-cos">
        <div v-for="(alb, idx) in albaransDescartats" :key="`desc-${idx}`" class="descarta-item">
          <Checkbox :modelValue="false" :binary="true" @update:modelValue="reincorporarAlbara(alb)" />
          <span>{{ $empresa(alb.empresa) }} / {{ String(alb.codiAlbara).padStart(7, '0') }}</span>
        </div>
      </div>
    </div>

    <!-- Albarans de traspàs oberts que NO es poden aprofitar perquè tenen una altra data (informatiu) -->
    <div v-if="albaransNoAprofitables.length" class="seccio">
      <h6 class="seccio-titol">
        <font-awesome-icon icon="fa-solid fa-calendar-days" style="margin-right: 8px;" />
        {{ $t('Propostes.Albarans no aprofitables altra data') }} ({{ albaransNoAprofitables.length }})
      </h6>
      <div class="seccio-cos">
        <p class="avis-text-info">{{ $t('Propostes.Albarans no aprofitables altra data ajuda') }}</p>
        <div v-for="(alb, idx) in albaransNoAprofitables" :key="`noap-${idx}`" class="no-aprofitable-item">
          <b class="albara-link" v-tooltip="$t('Albarans.Veure detall')" @click="obrirDetallAlbara(alb)">
            {{ $empresa(alb.empresa) }} / {{ String(alb.codiAlbara).padStart(7, '0') }}
          </b>
          <span class="no-aprofitable-data"><font-awesome-icon icon="fa-solid fa-calendar-days" /> {{ formatData(alb.data) }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <ButtonShortcut icon="fa-solid fa-undo" :literal="$t('App.Cancela')" shortcut="[Esc]"
        class="p-button-secondary p-button-sm" tabindex="-1" @click="onCancelar" />
      <ButtonShortcut icon="pi pi-check" :literal="$t('App.Confirmar')" shortcut="[Enter]"
        :class="teContingut ? 'p-button-sm' : 'p-button-sm p-disabled'" @click="onConfirmar" />
    </template>
  </Dialog>
</template>

<script>
import { computed, ref, watch, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import ButtonShortcut from '@/components/ButtonShortcut.vue';
import ModalDetallAlbara from '@/views/modals/albara/ModalDetallAlbara.vue';

export default {
  name: 'ModalConfirmacioAlbaransTraspas',
  components: { ButtonShortcut, ModalDetallAlbara },
  props: {
    visible: { type: Boolean, default: false },
    preview: { type: Object, default: () => ({}) },
    // Valor inicial de l'opció "Crear un albarà per client" (definit al modal de traspàs)
    agruparPerClient: { type: Boolean, default: false },
    // Data objectiu i tancament dels albarans nous (escollits al modal previ d'opcions)
    data: { type: String, default: null },
    tancarAlbaransNous: { type: Boolean, default: true },
    // Cert mentre hi ha un altre modal per davant (opcions): aquest modal no ha de reaccionar a les tecles
    bloquejarTecles: { type: Boolean, default: false },
  },
  emits: ['confirmar', 'cancelar', 'recalcular', 'canviar-opcions', 'update:visible'],
  setup(props, { emit }) {
    const { t, n } = useI18n();
    const albaransNous = computed(() => props.preview?.albaransNous ?? []);
    const albaransExistents = computed(() => props.preview?.albaransExistents ?? []);
    const albaransNoAprofitables = computed(() => props.preview?.albaransNoAprofitables ?? []);
    const avisosStockNegatiu = computed(() => props.preview?.avisosStockNegatiu ?? []);
    const formatData = (data) => data ? moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY') : '';
    const teContingut = computed(() => albaransNous.value.length > 0 || albaransExistents.value.length > 0);

    // Opcions d'aprofitament d'albarans de traspàs oberts (Nivell 0: toggle global; Nivell 1: descartar per albarà)
    const aprofitar = ref(true);
    const exclosos = ref([]);            // albarans descartats: [{codi, empresa}]
    const albaransDescartats = ref([]);  // còpia visible per poder reincorporar-los: [{codiAlbara, empresa}]
    const agruparClient = ref(props.agruparPerClient);  // "Crear un albarà per client"

    const opcions = () => ({
      aprofitarAlbaransOberts: aprofitar.value,
      albaransNoAprofitar: exclosos.value.map(e => ({ codi: e.codi, empresa: e.empresa })),
      agruparPerClient: agruparClient.value,
    });
    const emitRecalcular = () => emit('recalcular', opcions());

    const descartarAlbara = (albara) => {
      exclosos.value.push({ codi: albara.codiAlbara, empresa: albara.empresa });
      albaransDescartats.value.push({ codiAlbara: albara.codiAlbara, empresa: albara.empresa });
      emitRecalcular();
    };
    const reincorporarAlbara = (alb) => {
      exclosos.value = exclosos.value.filter(e => !(e.codi === alb.codiAlbara && e.empresa === alb.empresa));
      albaransDescartats.value = albaransDescartats.value.filter(a => !(a.codiAlbara === alb.codiAlbara && a.empresa === alb.empresa));
      emitRecalcular();
    };

    const detallVisible = ref(false);
    const detallIdAlbara = ref(null);
    const obrirDetallAlbara = (albara) => {
      detallIdAlbara.value = { codi: albara.codiAlbara, empresa: albara.empresa };
      detallVisible.value = true;
    };

    // A partir del text del plugin ("codi - nom") retorna " - nom" per posar-lo després del codi; buit si no hi ha nom
    const sufixNom = (text, codi) => {
      const prefix = `${codi} - `;
      return text && text.startsWith(prefix) ? ` - ${text.slice(prefix.length)}` : '';
    };

    // Informació d'embalatge de l'article: unitats/caixa × caixes/palet (unitats/palet)
    const embalatgeInfo = (data) => {
      if (!data.unitatsEmbalatge) return '-';
      return data.caixesPalet
        ? `${n(data.unitatsEmbalatge)} × ${n(data.caixesPalet)} (${n(data.unitatsEmbalatge * data.caixesPalet)})`
        : `${n(data.unitatsEmbalatge)}`;
    };

    // Avisos d'embalatge (quantitat no múltiple de les unitats d'embalatge)
    const avisEmbalatgeText = (codi) => {
      switch (codi) {
        case 'SENSE_EMBALATGE_DEFINIT': return t('Albarans.Avis embalatge sense definit');
        case 'NO_MULTIPLE_CONDICIONAMENT': return t('Albarans.Avis embalatge no multiple condicionament');
        case 'NO_MULTIPLE_CAIXA': return t('Albarans.Avis embalatge no multiple caixa');
        case 'NO_MULTIPLE_CAIXA_PLATAFORMA': return t('Albarans.Avis embalatge no multiple caixa plataforma');
        default: return '';
      }
    };
    const avisEmbalatgeIcon = (severitat) => severitat === 'INFO' ? 'fa-solid fa-circle-info' : 'fa-solid fa-triangle-exclamation';
    const avisEmbalatgeClass = (severitat) => {
      switch (severitat) {
        case 'ERROR': return 'avis-emb-error';
        case 'AVIS': return 'avis-emb-avis';
        default: return 'avis-emb-info';
      }
    };

    const onConfirmar = () => { if (teContingut.value) emit('confirmar', opcions()); };
    const onCancelar = () => { emit('update:visible', false); emit('cancelar'); };
    const onHide = (val) => { if (!val) { emit('update:visible', false); emit('cancelar'); } };

    // Gestió de tecles pròpia del modal: Esc tanca només aquest modal (no el del darrere) i Enter confirma.
    const keyHandler = (ev) => {
      if (!props.visible) return;
      // Si hi ha el modal d'opcions per davant, o el de detall d'albarà obert, no gestionem tecles aquí
      if (props.bloquejarTecles) return;
      if (detallVisible.value) return;
      if (ev.key === 'Escape') {
        ev.stopImmediatePropagation();
        ev.preventDefault();
        onCancelar();
      } else if (ev.key === 'Enter') {
        ev.stopImmediatePropagation();
        ev.preventDefault();
        onConfirmar();
      }
    };

    watch(() => props.visible, (obert) => {
      if (obert) {
        // En obrir una proposta nova, es reinicien les opcions d'aprofitament
        aprofitar.value = true;
        exclosos.value = [];
        albaransDescartats.value = [];
        agruparClient.value = props.agruparPerClient;
        document.addEventListener('keydown', keyHandler, true);
      } else {
        document.removeEventListener('keydown', keyHandler, true);
      }
    });

    onUnmounted(() => document.removeEventListener('keydown', keyHandler, true));

    return {
      albaransNous, albaransExistents, albaransNoAprofitables, avisosStockNegatiu, teContingut, onConfirmar, onCancelar, onHide,
      detallVisible, detallIdAlbara, obrirDetallAlbara, formatData,
      sufixNom, embalatgeInfo, avisEmbalatgeText, avisEmbalatgeIcon, avisEmbalatgeClass,
      aprofitar, agruparClient, albaransDescartats, emitRecalcular, descartarAlbara, reincorporarAlbara,
    };
  },
}
</script>

<style scoped>
  .seccio {
    margin-bottom: 24px;
    border: 1px solid #c3ccd6;
    border-radius: 8px;
    overflow: hidden;
    background: #fbfcfd;
  }
  .seccio:last-child { margin-bottom: 0; }
  .seccio-titol {
    font-weight: 600;
    margin: 0;
    padding: 10px 14px;
    background: #eef1f5;
    border-bottom: 1px solid #c3ccd6;
  }
  .seccio-cos { padding: 14px; }
  .seccio-avis {
    border-color: #e0a800;
    background: #fff9e6;
  }
  .seccio-titol-avis {
    background: #ffecb3;
    border-bottom-color: #e0a800;
    color: #8a6d00;
  }
  .avis-text {
    margin: 0 0 10px 0;
    color: #8a6d00;
  }
  .stock-negatiu { color: #c0392b; }
  .albara-card {
    margin-bottom: 14px;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
  .albara-card:last-child { margin-bottom: 0; }
  .albara-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.95rem;
    background: #f3f5f7;
    padding: 5px 12px;
    border-bottom: 1px solid #d0d7de;
  }
  .traspas-ruta {
    color: #333;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    text-align: center;
    line-height: 1.2;
  }
  .ruta-linia-mag { font-size: 0.82rem; }
  .ruta-nom { font-weight: 400; color: #666; }
  .ruta-fletxa { margin: 0 6px; font-weight: 700; }
  .badge-partida {
    font-size: 0.8rem;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 12px;
    background: #e7f1ff;
    color: #0b5ed7;
    border: 1px solid #b6d4fe;
    white-space: nowrap;
  }
  .albara-card :deep(.p-datatable) { padding: 8px; }
  .albara-link { color: #007bff; text-decoration: underline; cursor: pointer; }
  .albara-link:hover { color: #0056b3; }
  .barra-opcions {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    padding: 10px 12px;
    margin-bottom: 4px;
    background: #eef1f5;
    border: 1px solid #c3ccd6;
    border-radius: 8px;
  }
  .opcio-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
  }
  .albara-cap-esq {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .albara-data {
    font-size: 0.88rem;
    color: #444;
  }
  .estat-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 12px;
    white-space: nowrap;
  }
  .estat-obert {
    color: #1e7e34;
    background: #d4edda;
    border: 1px solid #b7dfc0;
  }
  .estat-tancat {
    color: #495057;
    background: #e2e6ea;
    border: 1px solid #ced4da;
  }
  .avis-text-info {
    margin: 0 0 10px 0;
    color: #556;
    font-size: 0.88rem;
  }
  .no-aprofitable-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 4px 0;
  }
  .no-aprofitable-data {
    font-size: 0.85rem;
    color: #666;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .control-aprofitar {
    display: flex;
    align-items: center;
    gap: 32px;
    padding: 8px 4px 14px;
  }
  .control-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .descarta-ctrl {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    color: #555;
  }
  .descarta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 0;
  }
  .avis-emb-error { color: #c0392b; }
  .avis-emb-avis { color: #e0a800; }
  .avis-emb-info { color: #6c757d; }
  .avis-emb-cel {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .avis-emb-icona { flex: 0 0 auto; }
  .avis-emb-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* Amples de columna fixos i iguals entre totes les taules de línies, amb ellipsis si el text no hi cap */
  .taula-linies :deep(.p-datatable-table) { table-layout: fixed; width: 100%; }
  .taula-linies :deep(.p-datatable-thead > tr > th),
  .taula-linies :deep(.p-datatable-tbody > tr > td) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cel-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
</style>
