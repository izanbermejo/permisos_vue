<template>
  <div class="card">
    <h5 class="card-header">
      <i class="pi pi-arrow-left icona-boto" @click="emit('update:opcio', 'OpcionsComandes')"
        v-tooltip="$t('App.Tornar')"></i>
      <font-awesome-icon icon="fa-solid fa-boxes-stacked" style="font-size: 1.25rem" />
      {{ $t('Comandes.StockSeguretat') }}
    </h5>
    <section class="flexcontainer">
      <div class="flexchild" @click="downloadStockSeguretat">
        <div>
          <font-awesome-icon icon="fa-solid fa-download" style="font-size: 2.5rem;" />
        </div>
        <span style="font-size: larger; font-weight: 400; display: block;">{{ $t('App.Descarregar') }}</span>
      </div>
      <div class="flexchild" @click="triggerUpload">
        <div>
          <font-awesome-icon icon="fa-solid fa-upload" style="font-size: 2.5rem;" />
        </div>
        <span style="font-size: larger; font-weight: 400; display: block;">{{ $t('App.Carregar') }}</span>
      </div>
    </section>
    <input ref="fileInput" type="file" accept="*/*" style="display: none" @change="onFileChange" />
    <div class="info-box" role="status" aria-live="polite">
      <ul>
        <li><strong>{{ $t('App.Descarregar') }}</strong>{{$t("Comandes.baixa plantilla")}}</li>
        <li><strong>{{ $t('App.Carregar') }}</strong>{{ $t("Comandes.puja fitxer") }}</li>
        <li>{{ $t("Comandes.mantingueu estructura") }}<em>{{ $t("Comandes.no esborreu") }}</em>.</li>
        <li>{{ $t("Comandes.comproveu capsalera") }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import comandesService from '@/services/comandes.service';
import { carrega } from '@/services/loader';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

export default {
  name: 'StockSeguretat',
  emits: ['file-loaded', 'update:opcio'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const fileInput = ref(null);

    const downloadStockSeguretat = async () => {
      const resp = await carrega(comandesService.descarregaStockSeguretat());
      saveAs(new Blob([resp]), `StockSeguretat.xlsx`);
    };

    const triggerUpload = () => {
      fileInput.value?.click();
    };

    const onFileChange = async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      await carrega(comandesService.carregaStockSeguretat(file));
      Swal.fire({
        allowOutsideClick: false,
        didOpen: () => Swal.getConfirmButton().focus(),
        icon: 'info',
        title: t('App.Ok'),
        text: t('Comandes.Fitxer OK'),
      });
      event.target.value = '';

    };



    return {
      t,
      fileInput,
      downloadStockSeguretat,
      triggerUpload,
      onFileChange,
      emit
    };
  },
};
</script>

<style scoped>
.icona-boto {
  margin-right: 15px;
  display: inline-block;
  border-radius: 5px;
  box-shadow: 0 0 2px #888;
  padding: 0.5em 0.6em;
  font-size: 0.8rem;
  cursor: pointer;
}

.flexcontainer {
  margin: 20px;
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  flex-direction: row;
  gap: 50px;
}

.flexchild {
  flex: 0 1 200px;
  text-align: center;
  border: solid 1px gray;
  background-color: #dbeefd;
  cursor: pointer;
  height: 100%;
  padding: 10px;
  border-radius: 25px;
}

.flexchild:hover {
  background-color: #aed7f8;
}

.info-box {
  margin: 12px 20px;
  padding: 10px 12px;
  color: #444;
  font-size: 0.95rem;
  border-radius: 4px;
}
.info-box ul { margin: 8px 0 0 18px; padding: 0; color:#555; }
.info-box li { margin-bottom: 6px; line-height: 1.25; }

</style>
