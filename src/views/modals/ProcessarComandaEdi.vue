<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :header="' '"
    style="width: 1430px">
    <template #header>
      <div v-if="infoEDI" style="display: flex; align-items: flex-start; height: 50px; gap: 40px;">
        <div class="columnatitol" style="margin-top: 13px;">
          <span class="texttitol">[{{ seleccionat?.tipus }}]</span>
        </div>

        <div class="columnatitol">
          <label class="labeltitol">
            {{ $t('Comandes.Articleclient') }}
          </label>

          <div class="valor-container">
            <i class="pi pi-copy cursor-pointer" @click.stop="copy2clipboard(seleccionat?.articleClient)" />

            <Dropdown v-if="infoEDI.length > 1" v-model="seleccionat" :options="infoEDI"
              :optionLabel="(opt) => `${opt.articleClient} - ${opt.referenciaClient}`" style="min-width: 260px;" />

            <span v-else class="texttitol">
              {{ seleccionat?.articleClient }} - {{ seleccionat?.referenciaClient }}
            </span>
          </div>
        </div>

        <div class="columnatitol">
          <label class="labeltitol">{{ $t('Comandes.Client') }}</label>
          <span class="texttitol">{{ seleccionat?.client }}</span>
        </div>

      </div>
    </template>
    <div v-if="seleccionat">
      <CapsaleraComandaEdi :artInt="seleccionat?.artInt" :cliCod="seleccionat?.codiClient" :articleClient="seleccionat?.articleClient"
        :codiMissatge="seleccionat?.numeroDocument" :estrategia="props?.estrategia" style="margin-bottom: 10px; margin-top: 5px;" 
        @infoCarregada="infoCarregada = $event" />
      <GridProcessarComandaEdi v-if="infoCarregada" :idMissatge="seleccionat?.idMissatge" :idComanda="seleccionat?.idComanda"
        :artInt="seleccionat?.artInt" :cliCod="seleccionat?.codiClient" @modalObert="visibleUltimsAlbarans = $event"
        @comandaProcessada="isComandaProcessada = $event" :info="infoCarregada" :codiMissatge="seleccionat?.numeroDocument"/>
    </div>
  </Dialog>
  <input ref="fileInput" type="file" @change="handleFileChange" style="display: none;" />
</template>

<script>
import GridProcessarComandaEdi from '@/components/edi/GridProcessarComandaEdi.vue';
import CapsaleraComandaEdi from '@/views/modals/CapsaleraComandaEdi.vue';
import ediService from '@/services/edi.service';
import { carrega } from '@/services/loader';
import { onMounted, ref, computed, onUnmounted, watch } from 'vue';
import { isContextMenuKey } from "@/utils/contextmenuUtils";
import { copyText } from 'vue3-clipboard';
import { useToast } from "primevue/usetoast";
import { useI18n } from 'vue-i18n';

export default {
  name: "ProcessarComandaEdi",
  components: {
    GridProcessarComandaEdi,
    CapsaleraComandaEdi
  },
  props: {
    codiMissatge: Number,
    artCliSeleccionat: String,
    estrategia: Number
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const visible = ref(true);
    const infoEDI = ref(null);
    const seleccionat = ref(null);
    const visibleUltimsAlbarans = ref(false);
    const isComandaProcessada = ref(false);
    const infoCarregada = ref(null);
    const toast = useToast();

    // Resetea infoCarregada cuando cambia seleccionat
    watch(seleccionat, () => {
      infoCarregada.value = null;
    });

    onMounted(() => {
      carregaInfo();
      document.addEventListener("keydown", handler);
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const carregaInfo = async () => {
      infoEDI.value = await carrega(ediService.obtenirComandesEdiByMissatge(props.codiMissatge));
      if (infoEDI.value?.length >= 1) {
        seleccionat.value = infoEDI.value.find((item) => item.articleClient === props.artCliSeleccionat) ?? infoEDI.value[0];
      } else {
        hide();
      }
    };

    watch(isComandaProcessada, (newValue) => {
      carregaInfo();
      if (!newValue) return;
      isComandaProcessada.value = false;

      if (infoEDI.value?.length > 1) {
        const currentIndex = infoEDI.value.indexOf(seleccionat.value);
        const nextIndex = currentIndex;

        if (nextIndex < infoEDI.value.length) {
          // Hi ha més artcli al combo → avancem
          seleccionat.value = infoEDI.value[nextIndex];
          return;
        }
      } else {
        hide();
      }

      // Últim artcli (o només n'hi ha un) → tanquem i notifiquem al pare
      emit('comandaProcessada', true);
      hide();
    });

    const hide = () => {
      emit("update:carregat", false);
    };

    const handler = (ev) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu
      if (isContextMenuKey(ev)) return;
      if (modalVisible.value) return;
      if (ev.key == 'Escape') {
        actionHandler(ev, hide);
      }
    }

    const actionHandler = (ev, action) => {
      ev.preventDefault();
      action();
    }

    const modalVisible = computed(() => {
      return visibleUltimsAlbarans.value;
    });

    watch(isComandaProcessada, (newValue) => {
      emit('comandaProcessada', newValue);
      hide();
    });

    const copy2clipboard = (txt) => {
      copyText(txt, undefined, (error, event) => {
        if (error) {
          console.log(error, event);
          toast.add({ severity: 'warn', summary: t('ComandesEDI.linies.error.noArticle.missatge'), life: 5000 });
        } else {
          //console.log(event)
          toast.add({ severity: 'success', summary: t('Comandes.copiarportapapeles.copiat.detail'), life: 5000 });
        }
      });
    }

    return {
      visible,
      hide,
      infoEDI,
      seleccionat,
      visibleUltimsAlbarans,
      isComandaProcessada,
      infoCarregada,
      props,
      copy2clipboard
    };
  },
};
</script>

<style scoped>
.columnatitol {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0;
  padding: 0;
}

.labeltitol {
  font-size: 12px;
  font-weight: 600;
  margin: 0;
  padding: 0;
  line-height: 1;
}

.texttitol {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  padding: 0;
  line-height: 1;
}

.valor-container {
    display: flex;
    align-items: center;
    gap: 5px;
}
</style>