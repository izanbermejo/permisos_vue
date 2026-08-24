<template>
  <ModalDetallAlbara v-model:visible="detallVisible" :idAlbara="detallIdAlbara" />
  <Dialog :visible="visible" modal :closable="true" :closeOnEscape="false" :draggable="false"
    @update:visible="onHide"
    :style="{ width: '60vw', maxHeight: '90vh' }" :header="$t('Propostes.Resultat creacio albarans')">

    <p class="resultat-descripcio">
      <font-awesome-icon icon="fa-solid fa-circle-check" class="resultat-ok-icona" />
      {{ $t('Propostes.Albarans resultat descripcio') }}
    </p>

    <DataTable :value="albarans" class="p-datatable-sm" showGridlines>
      <Column :header="$t('Propostes.Codi albara')" headerStyle="width:150px" bodyStyle="width:150px">
        <template #body="{ data }">
          <b class="albara-link" v-tooltip="$t('Albarans.Veure detall')" @click="obrirDetallAlbara(data)">
            {{ $empresa(data.empresa) }} / {{ String(data.codi).padStart(7, '0') }}
          </b>
        </template>
      </Column>
      <Column :header="$t('Propostes.Estat')" headerStyle="width:120px" bodyStyle="width:120px">
        <template #body="{ data }">
          <span class="estat-badge" :class="data.aprofitat ? 'estat-aprofitat' : 'estat-creat'">
            <font-awesome-icon :icon="data.aprofitat ? 'fa-solid fa-file-import' : 'fa-solid fa-file-circle-plus'" />
            {{ data.aprofitat ? $t('Propostes.Aprofitat') : $t('Propostes.Creat') }}
          </span>
        </template>
      </Column>
      <Column :header="$t('Albarans.Data')" headerStyle="width:110px" bodyStyle="width:110px">
        <template #body="{ data }">{{ formatData(data.data) }}</template>
      </Column>
      <Column :header="$t('Albarans.Tancat')" headerStyle="width:110px" bodyStyle="width:110px; text-align:center">
        <template #body="{ data }">
          <span class="estat-badge" :class="data.tancat ? 'estat-tancat' : 'estat-obert'">
            <font-awesome-icon :icon="data.tancat ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open'" />
            {{ data.tancat ? $t('Albarans.Tancat') : $t('Albarans.Obert') }}
          </span>
        </template>
      </Column>
      <Column :header="$t('Albarans.Destinatari')">
        <template #body="{ data }"><div class="cel-ellipsis" v-tooltip="data.destinatari">{{ data.destinatari }}</div></template>
      </Column>
      <Column :header="$t('Albarans.Magatzem')" headerStyle="width:110px" bodyStyle="width:110px">
        <template #body="{ data }">{{ data.magatzem }}</template>
      </Column>
    </DataTable>

    <template #footer>
      <ButtonShortcut icon="pi pi-check" :literal="$t('App.Tanca')" shortcut="[Esc]"
        class="p-button-sm" @click="onTancar" />
    </template>
  </Dialog>
</template>

<script>
import { computed, ref, watch, onUnmounted } from 'vue';
import moment from 'moment';
import ButtonShortcut from '@/components/ButtonShortcut.vue';
import ModalDetallAlbara from '@/views/modals/albara/ModalDetallAlbara.vue';

export default {
  name: 'ModalResultatCreacioAlbarans',
  components: { ButtonShortcut, ModalDetallAlbara },
  props: {
    visible: { type: Boolean, default: false },
    // Llista d'albarans resultat: [{ codi, empresa, aprofitat, data, tancat, magatzem, destinatari }]
    resultat: { type: Array, default: () => [] },
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const albarans = computed(() => props.resultat ?? []);
    const formatData = (data) => data ? moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY') : '';

    const detallVisible = ref(false);
    const detallIdAlbara = ref(null);
    const obrirDetallAlbara = (albara) => {
      detallIdAlbara.value = { codi: albara.codi, empresa: albara.empresa };
      detallVisible.value = true;
    };

    const onTancar = () => emit('update:visible', false);
    const onHide = (val) => { if (!val) emit('update:visible', false); };

    // Esc tanca només aquest modal (no el de la proposta que hi ha al darrere). Es captura la tecla
    // abans que el listener del modal de fons, i no s'actua si hi ha el detall d'albarà obert per davant.
    const keyHandler = (ev) => {
      if (!props.visible) return;
      if (detallVisible.value) return;
      if (ev.key === 'Escape') {
        ev.stopImmediatePropagation();
        ev.preventDefault();
        onTancar();
      }
    };

    watch(() => props.visible, (obert) => {
      if (obert) {
        document.addEventListener('keydown', keyHandler, true);
      } else {
        document.removeEventListener('keydown', keyHandler, true);
      }
    });

    onUnmounted(() => document.removeEventListener('keydown', keyHandler, true));

    return { albarans, formatData, detallVisible, detallIdAlbara, obrirDetallAlbara, onTancar, onHide };
  },
}
</script>

<style scoped>
  .resultat-descripcio {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 14px 0;
    color: #556;
  }
  .resultat-ok-icona { color: #1e7e34; font-size: 1.1rem; }
  .albara-link { color: #007bff; text-decoration: underline; cursor: pointer; }
  .albara-link:hover { color: #0056b3; }
  .cel-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
  .estat-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 12px;
  }
  .estat-creat {
    color: #1e5aa8;
    background: #dbe8fb;
    border: 1px solid #b6d0f5;
  }
  .estat-aprofitat {
    color: #7a5c00;
    background: #fdf1cc;
    border: 1px solid #f0dd9a;
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
</style>
