<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true" :draggable="false"
    style="width: auto">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('Comandes.selecciona idioma per copiar') }}</span>
      </div>
    </template>
    <form @submit.prevent="copiarTaula()">
      <SelectorIdioma 
        :idioma="idioma" @update:idioma="idioma = $event" />
      <div style="display: flex; justify-content: flex-end; margin-top: 25px;">
        <Button type="submit" :label="$t('Comandes.Copiar taula')" icon="pi pi-clone" class="p-button-sm" style="margin-left: 10px;"/>
      </div>
    </form>
  </Dialog>
</template>

<script>
import { ref, onMounted } from 'vue';
import SelectorIdioma from './SelectorIdioma.vue';
import { useI18n } from 'vue-i18n';
import { copyText } from 'vue3-clipboard';
import { useToast } from "primevue/usetoast";

export default {
name: 'AjudaIdiomaCopiaTaula',
components: {
  SelectorIdioma,
},
props: {
  linies : Array,
  client : Object,
},
setup(props, { emit }) {
  const { t, n } = useI18n();
  const visible = ref(true);
  const idioma = ref();
  const liniesArticles = ref(props.linies);
  const toast = useToast();

  const hide = () => {
    emit('update:carregat', false);
  }
  const colsCa = ['Referencia', 'Qtat.', 'Preu net (€/pc)', 'Kg'];
  const colsEs = ['Referencia', 'Cant.', 'Precio neto (€/ud)', 'Kg'];
  const colsEn = ['Reference', 'Qty.', 'Net price (€/pc)', 'Kg'];
  const colsFr = ['Référence', 'Qté.', 'Prix net (€/pc)', 'Kg'];
  const colsIt = ['Riferimento', 'Qtà.', 'Prezzo netto (€/pz)', 'Kg'];
  const colsDe = ['Referenz', 'Menge', 'Nettopreis (€/Stk)', 'Kg'];

  onMounted(async () => {
    try {
      idioma.value = props.client.idioma;
    } catch {
      hide();
    }
  });

  const copiarTaula = () => {
    const columnes = selectIdiomaColumnes();

    let copia = `${String(columnes[0]).padEnd(21, ' ')} ${String(columnes[1]).padStart(7, ' ')} ${String(columnes[2]).padStart(21, ' ')} ${String(columnes[3]).padStart(8, ' ')}\n`;
    liniesArticles.value.forEach(l => {
      copia += `${String(l.referencia).padEnd(21, ' ')} ${String(n(l.quantitat)).padStart(7, ' ')} ${String(n(l.preuNet, 'decimalLong')).padStart(17, ' ')} ${l.preu.divisa} ${String(n(l.pesKg, 'decimalLong')).padStart(8, ' ')}\n`;
    });

    copyText(
      copia,
      undefined,
      () => {
        toast.add({ severity:'info', summary: t('Comandes.taula copiada'), life: 5000 });
        hide();
      }
    );

    hide();
  };

  const selectIdiomaColumnes = () => {
    switch (idioma.value) {
      case 'ca':
        return colsCa;
      case 'es':
        return colsEs;
      case 'en':
        return colsEn;
      case 'fr':
        return colsFr;
      case 'it':
        return colsIt;
      case 'de':
        return colsDe;
      default:
        return colsEn;
    }
  }

  return {
  visible,
  hide,
  copiarTaula,
  idioma,
  liniesArticles,
  }
},
}
</script>

<style scoped>
</style>