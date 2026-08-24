<template>
  <AjudaImprimirAlbara v-if="visibleImprimir && detall" :albara="detall.albara"
    @update:carregat="visibleImprimir = false" />

  <ModalTraspassosConsumits v-if="visibleTraspassos" :carregat="visibleTraspassos"
    @update:carregat="visibleTraspassos = $event"
    :liniaConsum="liniaTraspassos" :titol="titolTraspassos" />

  <ModalHistoricMoviments v-if="visibleMoviments && liniaMoviments" v-model:visible="visibleMoviments"
    :artint="liniaMoviments.articleClient.artint" :clicod="liniaMoviments.articleClient.clicod" />

  <ModalAdjuntsAlbarans v-if="visibleAdjunts && detall" :carregat="visibleAdjunts"
    :potEditar="true"
    @update:carregat="visibleAdjunts = $event" :albara="detall.albara.id.codiFormat" />

  <ModalAfegirLiniaConsum v-if="visibleAfegirLinia && detall" :carregat="visibleAfegirLinia"
    @update:carregat="visibleAfegirLinia = $event"
    :idAlbara="idAlbara" :magatzem="detall.albara.magatzem" :client="detall.albara.client"
    @liniaAfegida="load()" />

  <ModalCanviarAlbaraEspecial v-if="visibleAlbaraEspecial && detall" :carregat="visibleAlbaraEspecial"
    @update:carregat="visibleAlbaraEspecial = $event"
    :valor="detall.albara.numeroAlbaraEspecial || ''" @desar="guardarAlbaraEspecial" />

  <ModalCanviarDataConsum v-if="visibleData && detall" :carregat="visibleData"
    @update:carregat="visibleData = $event"
    :valor="detall.albara.data" @desar="guardarData" />

  <Dialog v-model:visible="visible" modal :closable="false" :closeOnEscape="false"
    :draggable="false" :style="{ width: '1350px', maxWidth: '95vw' }">
    <template #header>
      <span style="font-size: larger; font-weight: 600;">
        {{ $t('Consums.detallTitol') }} — {{ String(idAlbara.codi).padStart(7, '0') }} ({{ idAlbara.empresa }})
      </span>
    </template>

    <div>
      <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />

      <!-- Capçalera -->
      <div class="capcalera">
        <div v-if="detall"><span class="etq">{{ $t('Consums.magatzem') }}:</span> {{ $magatzem(detall.albara.magatzem) }}</div>
        <div v-if="detall">
          <span class="etq">{{ $t('Consums.client') }}:</span>
          {{ detall.albara.client }}<span v-if="clientNom"> — {{ clientNom }}</span>
        </div>
        <div v-if="detall">
          <span class="etq">{{ $t('Consums.albaraEspecial') }}:</span>
          {{ detall.albara.numeroAlbaraEspecial || '-' }}
          <Button v-if="isObert" icon="pi pi-pencil" class="p-button-sm boto-editar"
            v-tooltip="$t('Consums.canviarAlbaraEspecial')" @click="visibleAlbaraEspecial = true" />
        </div>
        <div v-if="detall">
          <span class="etq">{{ $t('Consums.dataConsum') }}:</span>
          {{ $d($toDate(detall.albara.data), 'short') }}
          <Button v-if="isObert" icon="pi pi-pencil" class="p-button-sm boto-editar"
            v-tooltip="$t('Consums.canviarDataConsum')" @click="visibleData = true" />
        </div>
        <div v-if="detall"><span class="etq">{{ $t('Consums.dataCreacio') }}:</span> {{ $d($toDate(detall.albara.dataCreacio), 'short') }}</div>
        <div v-if="detall"><span class="etq">{{ $t('Consums.usuariCreacio') }}:</span> {{ detall.albara.usuariCreacio }}</div>
        <div v-if="detall">
          <span class="etq">{{ $t('Consums.estat') }}:</span>
          {{ detall.albara.isFacturat ? $t('Consums.facturat') : (detall.albara.isTancat ? $t('Consums.pendentFacturar') : $t('Consums.obert')) }}
          <span v-if="detall.albara.isFacturacioAutomatica"> · {{ $t('Consums.autofacturable') }}</span>
        </div>
      </div>

      <!-- Línies -->
      <div class="card" style="margin-top: 12px;">
        <h5 class="card-header">
          {{ $t('Consums.pecesConsum') }}
          <Button v-if="isObert" :label="$t('Consums.afegirLinia')" icon="pi pi-plus"
            style="margin-left: 15px;"
            class="p-button-sm" @click="visibleAfegirLinia = true" />
        </h5>
        <div class="card-body" style="height: 300px; padding: 0;">
          <DataTable :value="detall ? detall.linies : []" class="p-datatable-sm-petita" dataKey="dataKey" :scrollable="true" scrollHeight="flex"
            showGridlines selectionMode="single" v-model:selection="liniaSeleccionada"
            contextMenu v-model:contextMenuSelection="liniaSeleccionada" @rowContextmenu="showContextMenu($event)"
            :rowClass="() => 'estilRow'">
            <template #empty>
              <div style="width: 100%; min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Consums.capPecaAfegida')" />
              </div>
            </template>
            <Column :style="{ width: '45px' }" style="max-width: 45px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 100%;">
                  <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                    @click="liniaSeleccionada = data; contextMenu.show($event)" />
                </div>
              </template>
            </Column>
            <Column :header="$t('Consums.article')" :style="{ width: '150px' }">
              <template #body="{ data }">{{ data.informacioPesa.matriu }}{{ data.articleClient.clicod }}</template>
            </Column>
            <Column :header="$t('Consums.referencia')" :style="{ width: '150px' }">
              <template #body="{ data }">{{ data.informacioPesa.referencia }}</template>
            </Column>
            <Column :header="$t('Consums.denominacio')">
              <template #body="{ data }">{{ data.informacioPesa.denominacio }}</template>
            </Column>
            <Column :header="$t('Consums.quantitat')" :style="{ width: '90px' }" style="max-width: 90px; text-align: right;">
              <template #body="{ data }">
                <div style="width: 100%; text-align: right;">{{ $n(data.quantitat) }}</div>
              </template>
            </Column>
            <Column :header="$t('Consums.pendentFacturar')" :style="{ width: '110px' }" style="max-width: 110px; text-align: right;">
              <template #body="{ data }">
                <div style="width: 100%; text-align: right;">{{ $n(data.quantitatPendentFacturar) }}</div>
              </template>
            </Column>
            <Column :header="$t('Consums.preu')" :style="{ width: '110px' }" style="max-width: 110px; text-align: right;">
              <template #body="{ data }">
                <div style="width: 100%; text-align: right;">{{ $n(data.preu.valor, 'decimal') }} {{ data.preu.divisa }}</div>
              </template>
            </Column>
            <Column :header="$t('Consums.import')" :style="{ width: '120px' }" style="max-width: 120px; text-align: right;">
              <template #body="{ data }">
                <div style="width: 100%; text-align: right;">{{ $n(importLinia(data), 'decimal') }} {{ data.preu.divisa }}</div>
              </template>
            </Column>
            <Column :header="$t('Consums.identificador')" :style="{ width: '160px' }">
              <template #body="{ data }">{{ data.identificadorConsum }}</template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <template #footer>
      <Button v-if="detall && detall.albara.isTancat" :label="$t('Consums.obrir')" icon="pi pi-lock-open"
        class="p-button-sm p-button-secondary" style="margin-left: 10px;" :disabled="detall.albara.isFacturat"
        v-tooltip.top="detall.albara.isFacturat ? $t('Consums.noObrirFacturat') : ''" @click="obrirConsum" />
      <Button v-else-if="detall" :label="$t('Consums.tancar')" icon="pi pi-lock"
        class="p-button-sm p-button-secondary" style="margin-left: 10px;" @click="tancarConsum" />
      <Button v-if="detall" :label="$t('Comandes.Veure adjunts')" icon="pi pi-paperclip" class="p-button-sm p-button-secondary"
        style="margin-left: 10px;" @click="visibleAdjunts = true" />
      <Button v-if="detall" :label="$t('Consums.imprimir')" icon="pi pi-file-pdf" class="p-button-sm p-button-secondary"
        style="margin-left: 10px;" @click="visibleImprimir = true" />
      <Button v-if="detall" :label="$t('Consums.eliminarConsum')" icon="pi pi-trash" class="p-button-sm p-button-danger"
        style="margin-left: 10px;" @click="eliminarConsum" />
      <Button :label="$t('App.Tanca')" icon="pi pi-times" class="p-button-sm p-button-secondary"
        style="margin-left: 10px;" @click="demanarTancar" />
    </template>
  </Dialog>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import moment from 'moment';
import { carrega } from '@/services/loader';
import AlbaraService from '@/services/albara.service';
import AjudaImprimirAlbara from '@/views/modals/albara/AjudaImprimirAlbara.vue';
import ModalTraspassosConsumits from '@/views/modals/consums/ModalTraspassosConsumits.vue';
import ModalAfegirLiniaConsum from '@/views/modals/consums/ModalAfegirLiniaConsum.vue';
import ModalCanviarAlbaraEspecial from '@/views/modals/consums/ModalCanviarAlbaraEspecial.vue';
import ModalCanviarDataConsum from '@/views/modals/consums/ModalCanviarDataConsum.vue';
import ModalAdjuntsAlbarans from '@/views/modals/ModalAdjuntsAlbarans.vue';
import ModalHistoricMoviments from '@/views/modals/ModalHistoricMoviments.vue';

export default {
  name: 'ModalDetallConsum',
  components: {
    AjudaImprimirAlbara, ModalTraspassosConsumits, ModalAfegirLiniaConsum,
    ModalCanviarAlbaraEspecial, ModalCanviarDataConsum, ModalAdjuntsAlbarans, ModalHistoricMoviments
  },
  props: {
    // Albarà de consum, sempre existent: la capçalera es crea abans d'obrir el detall
    idAlbara: { type: Object, required: true },
    clientNom: { type: String, default: '' }
  },
  setup(props, { emit }) {
    const { t, d } = useI18n();
    const toast = useToast();
    const confirm = useConfirm();
    const visible = ref(true);
    const detall = ref(null);
    const liniaSeleccionada = ref();
    const visibleImprimir = ref(false);
    const visibleAdjunts = ref(false);
    const visibleAfegirLinia = ref(false);
    const visibleAlbaraEspecial = ref(false);
    const visibleData = ref(false);
    const visibleTraspassos = ref(false);
    const liniaTraspassos = ref(null);
    const titolTraspassos = ref('');
    const visibleMoviments = ref(false);
    const liniaMoviments = ref(null);
    const contextMenu = ref();

    // Determina si es poden afegir línies i editar la capçalera (data i albarà especial)
    const isObert = computed(() => detall.value && !detall.value.albara.isTancat);

    const load = async () => {
      const data = await carrega(AlbaraService.obtenirDetallAlbara(props.idAlbara));
      // dataKey per a la selecció de fila
      if (data && data.linies) {
        data.linies = data.linies.map(l => ({ ...l, dataKey: l.id.linia }));
      }
      detall.value = data;
    };

    onMounted(load);

    const importLinia = (linia) =>
      linia.importLinia != null ? linia.importLinia : (linia.preu.valor * linia.quantitat);

    const menuModel = computed(() => {
      const items = [
        { label: () => t('Consums.traspassosConsumits'), class: 'p-button-text', icon: 'pi pi-list', command: () => obrirTraspassos(liniaSeleccionada.value) },
        { label: () => t('Consums.veureMovimentsMagatzem'), class: 'p-button-text', icon: 'pi pi-warehouse', command: () => obrirMoviments(liniaSeleccionada.value) }
      ];
      // Només es poden eliminar línies si el consum està obert (un albarà tancat no es pot modificar)
      if (detall.value && !detall.value.albara.isTancat) {
        items.push({ label: () => t('Consums.eliminarLinia'), class: 'p-button-text', icon: 'pi pi-trash', command: () => eliminarLinia(liniaSeleccionada.value) });
      }
      return items;
    });

    const obrirTraspassos = (linia) => {
      if (!linia) return;
      liniaTraspassos.value = { empresa: props.idAlbara.empresa, codi: props.idAlbara.codi, linia: linia.id.linia };
      titolTraspassos.value = `${linia.informacioPesa.matriu}${linia.articleClient.clicod}`;
      visibleTraspassos.value = true;
    };

    const obrirMoviments = (linia) => {
      if (!linia) return;
      liniaMoviments.value = linia;
      visibleMoviments.value = true;
    };

    const showContextMenu = (ev) => {
      liniaSeleccionada.value = ev.data;
      contextMenu.value.show(ev.originalEvent);
    };

    // Nou número arribat del modal d'edició. Si el client ja té un altre albarà amb aquest número
    // s'avisa; mentre l'usuari no ho confirmi el modal es manté obert per poder-lo rectificar.
    const guardarAlbaraEspecial = async (valor) => {
      if (valor === (detall.value.albara.numeroAlbaraEspecial || '')) {
        visibleAlbaraEspecial.value = false;
        return;
      }
      const coincidencies = await carrega(AlbaraService.comprovarAlbaraEspecial(
        props.idAlbara.empresa, detall.value.albara.client, valor, props.idAlbara.codi));
      if (coincidencies && coincidencies.length) {
        confirm.require({
          header: t('App.Confirmacio'),
          message: missatgeCoincidencies(valor, coincidencies),
          icon: 'pi pi-exclamation-triangle',
          accept: () => persistirAlbaraEspecial(valor)
        });
        return;
      }
      await persistirAlbaraEspecial(valor);
    };

    const persistirAlbaraEspecial = async (valor) => {
      await carrega(AlbaraService.canviarAlbaraEspecial(props.idAlbara, valor));
      visibleAlbaraEspecial.value = false;
      toast.add({ severity: 'success', summary: t('Consums.albaraEspecialGuardat'), life: 3000 });
      emit('canviat', props.idAlbara);
      await load();
    };

    const missatgeCoincidencies = (valor, coincidencies) => {
      const llista = coincidencies
        .map(c => `${String(c.id.codi).padStart(7, '0')} (${t('Consums.tipus.' + c.tipus)}, ${d(moment(c.data, 'YYYY-MM-DD').toDate(), 'short')})`)
        .join(', ');
      return t('Consums.albaraEspecialDuplicat', [valor, llista]);
    };

    // Nova data arribada del modal d'edició. Si el consum ja té línies es demana confirmació perquè
    // el canvi es propaga als moviments de magatzem i a la traçabilitat dels traspassos.
    const guardarData = async (valor) => {
      if (valor === detall.value.albara.data) {
        visibleData.value = false;
        return;
      }
      if (!(detall.value.linies || []).length) {
        await persistirData(valor);
        return;
      }
      confirm.require({
        header: t('App.Confirmacio'),
        message: t('Consums.confirmarCanviarData'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => persistirData(valor)
      });
    };

    const persistirData = async (valor) => {
      await carrega(AlbaraService.canviarDataAlbara(props.idAlbara, valor));
      visibleData.value = false;
      toast.add({ severity: 'success', summary: t('Consums.dataGuardada'), life: 3000 });
      emit('canviat', props.idAlbara);
      await load();
    };

    const eliminarLinia = (linia) => {
      if (!linia) return;
      confirm.require({
        header: t('App.Confirmacio'),
        message: t('Consums.confirmarEliminarLinia'),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
          await carrega(AlbaraService.eliminarLiniaAlbara(linia.id));
          toast.add({ severity: 'success', summary: t('Consums.liniaEliminada'), life: 3000 });
          emit('canviat', props.idAlbara);
          // Es recarrega encara que quedi buit; en tancar el modal s'oferirà eliminar el consum buit.
          await load();
        }
      });
    };

    const eliminarConsum = () => {
      confirm.require({
        header: t('App.Confirmacio'),
        message: t('Consums.confirmarEliminarConsum'),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
          await carrega(AlbaraService.eliminarAlbara(props.idAlbara));
          toast.add({ severity: 'success', summary: t('Consums.consumEliminat'), life: 3000 });
          emit('canviat', props.idAlbara);
          tancarModal();
        }
      });
    };

    const obrirConsum = async () => {
      await carrega(AlbaraService.reobrirAlbara(props.idAlbara));
      toast.add({ severity: 'success', summary: t('Consums.consumObert'), life: 3000 });
      emit('canviat', props.idAlbara);
      await load();
    };

    const tancarConsum = async () => {
      await carrega(AlbaraService.tancarAlbara(props.idAlbara));
      toast.add({ severity: 'success', summary: t('Consums.consumTancat'), life: 3000 });
      emit('canviat', props.idAlbara);
      await load();
    };

    const tancarModal = () => emit('update:carregat', false);

    // En tancar: si el consum ha quedat sense línies (o no se n'hi ha arribat a afegir cap),
    // s'ofereix eliminar-lo per no deixar albarans de consum buits.
    const demanarTancar = () => {
      if (detall.value && (detall.value.linies || []).length === 0) {
        confirm.require({
          header: t('App.Confirmacio'),
          message: t('Consums.confirmarEliminarConsumBuit'),
          icon: 'pi pi-exclamation-triangle',
          acceptClass: 'p-button-danger',
          accept: async () => {
            await carrega(AlbaraService.eliminarAlbara(props.idAlbara));
            toast.add({ severity: 'success', summary: t('Consums.consumEliminat'), life: 3000 });
            emit('canviat', props.idAlbara);
            tancarModal();
          },
          reject: tancarModal
        });
        return;
      }
      tancarModal();
    };

    return {
      visible, detall, isObert,
      liniaSeleccionada, visibleImprimir, visibleAdjunts, visibleAfegirLinia,
      visibleAlbaraEspecial, visibleData,
      visibleTraspassos, liniaTraspassos, titolTraspassos, visibleMoviments, liniaMoviments,
      contextMenu, menuModel, importLinia, showContextMenu, guardarAlbaraEspecial, guardarData,
      eliminarConsum, obrirConsum, tancarConsum, load, demanarTancar
    };
  }
};
</script>

<style scoped>
.capcalera {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 30px;
  padding: 4px 2px;
}
.capcalera .etq {
  font-weight: 600;
}
/* Llapis d'edició al costat del valor: mateix botó que 'Afegir línia' però només amb la icona */
.boto-editar {
  margin-left: 10px;
  vertical-align: middle;
}
::v-deep(.estilRow) {
  cursor: pointer;
}
::v-deep(.estilRow .ocultable) {
  height: 1.5rem !important;
  width: 1.5rem !important;
  margin-left: auto;
  margin-right: auto;
  display: none;
}
::v-deep(.estilRow:hover .ocultable) {
  display: flex;
}
</style>
