<template>
  <ModalDetallAlbara v-model:visible="detallVisible" :idAlbara="detallIdAlbara" />

  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true"
    :draggable="false" :header="`${$t('Consums.albaransPendent')} — ${peca.aclfab}${peca.clicod}`"
    :style="{ width: '590px' }">
    <DataTable :value="albarans" class="p-datatable-sm-petita" :style="{ width: '540px' }"
      :scrollable="true" scrollHeight="50vh" showGridlines>
      <template #empty>
        <div style="text-align:center; padding: 15px;">
          <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Consums.capAlbaraPendent')" />
        </div>
      </template>
      <Column :header="$t('Consums.albara')" :style="{ width: '160px' }" style="max-width: 160px;">
        <template #body="{ data }">
          <span class="albara-link" v-tooltip="$t('Albarans.Veure detall')" @click="obrirDetall(data)">
            {{ String(data.codiAlbara).padStart(7, '0') }} ({{ data.empresa }})
          </span>
        </template>
      </Column>
      <Column :header="$t('Consums.data')" :style="{ width: '110px' }" style="max-width: 110px;">
        <template #body="{ data }">{{ $d($toDate(data.data), 'short') }}</template>
      </Column>
      <Column :header="$t('Consums.quantitat')" :style="{ width: '110px' }" style="max-width: 110px; text-align: right;">
        <template #body="{ data }">
          <div style="width: 100%; text-align: right;">{{ $n(data.quantitat) }}</div>
        </template>
      </Column>
      <Column :header="$t('Consums.pendentConsumir')" :style="{ width: '160px' }" style="max-width: 160px; text-align: right;">
        <template #body="{ data }">
          <div style="width: 100%; text-align: right;">{{ $n(data.pendentConsumir) }}</div>
        </template>
      </Column>
    </DataTable>
    <template #footer>
      <Button :label="$t('App.Tanca')" icon="pi pi-times" class="p-button-secondary p-button-sm" @click="hide" />
    </template>
  </Dialog>
</template>

<script>
import { ref, onMounted } from 'vue';
import { carrega } from '@/services/loader';
import ConsumsService from '@/services/consums.service';
import ModalDetallAlbara from '@/views/modals/albara/ModalDetallAlbara.vue';

export default {
  name: 'ModalAlbaransPendentConsum',
  components: { ModalDetallAlbara },
  props: {
    peca: { type: Object, required: true },
    magatzem: { type: String, required: true }
  },
  setup(props, { emit }) {
    const visible = ref(true);
    const albarans = ref([]);
    const detallVisible = ref(false);
    const detallIdAlbara = ref(null);

    const hide = () => emit('update:carregat', false);

    onMounted(async () => {
      try {
        albarans.value = await carrega(ConsumsService.obtenirAlbaransPendent(
          props.peca.empresa, props.magatzem, props.peca.artint, props.peca.clicod));
      } catch {
        // L'error ja el mostra l'interceptor (p. ex. magatzem no marcat per al SII): es tanca el
        // modal en comptes de deixar-lo obert i buit
        hide();
      }
    });

    const obrirDetall = (data) => {
      detallIdAlbara.value = { codi: data.codiAlbara, empresa: data.empresa };
      detallVisible.value = true;
    };

    return { visible, albarans, detallVisible, detallIdAlbara, obrirDetall, hide };
  }
};
</script>

<style scoped>
.albara-link {
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
}
.albara-link:hover {
  color: #0056b3;
}
</style>
