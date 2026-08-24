<template>
  <ModalDetallAlbara v-model:visible="detallVisible" :idAlbara="detallIdAlbara" />

  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true"
    :draggable="false" :style="{ width: '520px' }">
    <template #header>
      <span style="font-size: larger; font-weight: 600;">
        {{ $t('Consums.traspassosConsumits') }}<span v-if="titol"> — {{ titol }}</span>
      </span>
    </template>

    <DataTable :value="traspassos" class="p-datatable-sm-petita" :style="{ width: '470px' }"
      :scrollable="true" scrollHeight="50vh" showGridlines>
      <template #empty>
        <div style="text-align: center; padding: 15px;">
          <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Consums.capTraspasConsumit')" />
        </div>
      </template>
      <Column :header="$t('Consums.albara')" :style="{ width: '220px' }" style="max-width: 220px;">
        <template #body="{ data }">
          <span class="albara-link" v-tooltip="$t('Albarans.Veure detall')" @click="obrirDetall(data)">
            {{ String(data.codiAlbara).padStart(7, '0') }} ({{ data.empresa }})
          </span>
        </template>
      </Column>
      <Column :header="$t('Consums.quantitat')" :style="{ width: '150px' }" style="max-width: 150px; text-align: right;">
        <template #body="{ data }">
          <div style="width: 100%; text-align: right;">{{ $n(data.quantitat) }}</div>
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
  name: 'ModalTraspassosConsumits',
  components: { ModalDetallAlbara },
  props: {
    liniaConsum: { type: Object, required: true }, // { empresa, codi, linia }
    titol: { type: String, default: '' }
  },
  setup(props, { emit }) {
    const visible = ref(true);
    const traspassos = ref([]);
    const detallVisible = ref(false);
    const detallIdAlbara = ref(null);

    const hide = () => emit('update:carregat', false);

    onMounted(async () => {
      try {
        traspassos.value = await carrega(ConsumsService.obtenirTraspassosConsumits(
          props.liniaConsum.empresa, props.liniaConsum.codi, props.liniaConsum.linia));
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

    return { visible, traspassos, detallVisible, detallIdAlbara, obrirDetall, hide };
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
