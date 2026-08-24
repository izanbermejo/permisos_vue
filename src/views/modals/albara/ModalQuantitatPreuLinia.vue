<template>
  <!-- Confirmació dels avisos del check del servidor. Si es cancel·la es torna a la pantalla de quantitat i preu. -->
  <Dialog v-model:visible="avisosVisibles" modal :closable="false" :closeOnEscape="false" :draggable="false"
    :style="{ width: '620px' }">
    <template #header>
      <div class="capsalera-avis">
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" style="margin-right: 10px;" />
        {{ $t('Albarans.Confirmar afegir linia') }}
      </div>
    </template>

    <div v-if="avisos?.avisEmbalatge" class="avis" :class="classeSeveritat(avisos.severitatEmbalatge)">
      <div class="avis-titol">
        <font-awesome-icon :icon="iconaSeveritat(avisos.severitatEmbalatge)" />
        {{ $t('Albarans.Avis embalatge') }}
      </div>
      <div class="avis-cos">
        <p>{{ textAvisEmbalatge(avisos.avisEmbalatge) }}</p>
        <div class="dades">
          <span><b>{{ $t('Albarans.Embalatge') }}:</b> {{ textEmbalatge }}</span>
          <span><b>{{ $t('Albarans.Quantitat') }}:</b> {{ $n(avisos.quantitat) }}</span>
        </div>
      </div>
    </div>

    <div v-if="avisos?.isStockNegatiu" class="avis avis-error">
      <div class="avis-titol">
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" />
        {{ $t('Albarans.Avis stock negatiu') }}
      </div>
      <div class="avis-cos">
        <p>{{ $t('Albarans.Avis stock negatiu linia') }}</p>
        <div class="dades">
          <span><b>{{ $t('Albarans.Stock actual') }}:</b> {{ $n(avisos.stockActual) }}</span>
          <span><b>{{ $t('Albarans.Quantitat servir') }}:</b> {{ $n(avisos.quantitat) }}</span>
          <span><b>{{ $t('Albarans.Stock resultant') }}:</b> <b class="stock-negatiu">{{ $n(avisos.stockResultant) }}</b></span>
        </div>
      </div>
    </div>

    <template #footer>
      <Button :label="$t('App.Tornar')" icon="pi pi-undo" class="p-button-secondary p-button-sm"
        @click="avisosVisibles = false" />
      <Button :label="$t('App.Confirmar')" icon="pi pi-check" class="p-button-sm" style="margin-left: 10px;"
        @click="afegir" />
    </template>
  </Dialog>

  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :draggable="false"
    :style="{ width: '540px' }">
    <template #header>
      <div style="font-size: larger; font-weight: 600;">
        <font-awesome-icon icon="fa-solid fa-plus" style="margin-right: 10px;" />
        {{ $t('Albarans.Afegir linia') }}
      </div>
    </template>

    <form @submit.prevent="acceptar">
      <div class="fitxa">
        <div class="camp-info"><span class="camp-label">{{ $t('Albarans.Article') }}</span>
          <span>{{ articleClient.articleClient }}</span></div>
        <div class="camp-info"><span class="camp-label">{{ $t('Albarans.Referencia') }}</span>
          <span>{{ preparacio?.referencia || articleClient.referencia || '—' }}</span></div>
        <div class="camp-info"><span class="camp-label">{{ $t('Albarans.Denominacio') }}</span>
          <span>{{ preparacio?.denominacio || '—' }}</span></div>
        <div class="camp-info"><span class="camp-label">{{ $t('Albarans.Client') }}</span>
          <span>{{ articleClient.cliCod }}{{ preparacio?.nomClient ? ' - ' + preparacio.nomClient : '' }}</span></div>
        <div class="camp-info"><span class="camp-label" v-tooltip="$t('Albarans.Embalatge tooltip')">{{ $t('Albarans.Embalatge') }}</span>
          <span>{{ textEmbalatge }}</span></div>
        <div class="camp-info"><span class="camp-label">{{ $t('Albarans.Stock origen') }}</span>
          <span :class="{ 'stock-negatiu': (preparacio?.stockActual ?? 0) <= 0 }">
            {{ preparacio ? $n(preparacio.stockActual) : '—' }}</span></div>
      </div>

      <div class="camp">
        <label>{{ $t('Albarans.Quantitat') }}</label>
        <LocalizedInputNumber ref="inputQuantitat" v-model="state.quantitat" :maxFractionDigits="0" :min="1"
          :class="{ 'p-invalid': v.quantitat.$error }" @input="state.quantitat = $event.value" />
        <small v-if="v.quantitat.$error" class="p-error">{{ $t('Albarans.Quantitat ha de ser positiva') }}</small>
      </div>

      <div class="camp">
        <label>{{ $t('Albarans.Preu') }}</label>
        <span class="preu-linia">
          <LocalizedInputNumber v-model="state.preu" :maxFractionDigits="5" :min="0"
            :class="{ 'p-invalid': v.preu.$error }" @input="state.preu = $event.value" />
          <span class="divisa">{{ preparacio?.divisa }}</span>
        </span>
        <small v-if="v.preu.$error" class="p-error">{{ $t('App.Valor requerit') }}</small>
        <small v-else-if="isPreuCanviat" class="ajuda-camp">
          {{ $t('Albarans.Preu proposat', [$n(preparacio.preu, 'decimalLong'), preparacio.divisa]) }}</small>
      </div>

      <div class="botons">
        <Button tabindex="-1" :label="$t('App.Cancela')" icon="pi pi-undo" class="p-button-secondary p-button-sm" @click="hide" />
        <Button type="submit" :label="$t('Albarans.Afegir linia')" icon="pi pi-plus" class="p-button-sm"
          style="margin-left: 10px;" :disabled="!preparacio" />
      </div>
    </form>
  </Dialog>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import useVuelidate from '@vuelidate/core';
import { required, minValue } from '@vuelidate/validators';
import LocalizedInputNumber from '@/components/prime/LocalizedInputNumber.vue';
import AlbaraService from '@/services/albara.service';
import { carrega } from '@/services/loader';

export default {
  name: 'ModalQuantitatPreuLinia',
  components: { LocalizedInputNumber },
  props: {
    idAlbara: { type: Object, required: true },
    // Peça seleccionada al buscador d'articles-client: { artInt, cliCod, articleClient, referencia, nomClient }
    articleClient: { type: Object, required: true },
  },
  emits: ['update:carregat', 'afegida'],
  setup(props, { emit }) {
    const { t, n } = useI18n();
    const visible = ref(true);
    const inputQuantitat = ref();
    // Dades de la peça, preu proposat i stock; es carreguen en obrir el modal
    const preparacio = ref(null);
    // Resultat del check del servidor quan hi ha avisos a confirmar
    const avisos = ref(null);
    const avisosVisibles = ref(false);

    const state = reactive({ quantitat: null, preu: null });

    const rules = {
      quantitat: { required, min: minValue(1) },
      preu: { required, min: minValue(0) },
    };
    const v = useVuelidate(rules, state);

    const clau = () => ({ artint: props.articleClient.artInt, clicod: props.articleClient.cliCod });

    const carregarPreparacio = async () => {
      try {
        const resp = await carrega(AlbaraService.prepararLiniaTraspas(props.idAlbara, clau()));
        preparacio.value = resp?.data ?? resp ?? null;
        // El preu proposat es precarrega però es pot sobreescriure
        state.preu = Number(preparacio.value?.preu ?? 0);
      } catch {
        // L'error ja s'ha mostrat (p. ex. peça d'una altra empresa): no té sentit demanar quantitat i preu
        hide();
      }
    };

    onMounted(async () => {
      document.addEventListener('keydown', handler);
      await carregarPreparacio();
      nextTick(() => inputQuantitat.value?.$el?.querySelector('input')?.focus());
    });
    onUnmounted(() => document.removeEventListener('keydown', handler));

    const handler = (ev) => {
      if (ev.key !== 'Escape') return;
      // Esc sobre els avisos torna a la pantalla de quantitat i preu; sobre aquesta, tanca el modal
      if (avisosVisibles.value) avisosVisibles.value = false;
      else hide();
    };

    const textEmbalatge = computed(() => {
      const p = preparacio.value;
      if (!p?.unitatsEmbalatge) return '—';
      return p.caixesPalet
        ? `${n(p.unitatsEmbalatge)} × ${n(p.caixesPalet)} (${n(p.unitatsEmbalatge * p.caixesPalet)})`
        : `${n(p.unitatsEmbalatge)}`;
    });

    const isPreuCanviat = computed(() =>
      !!preparacio.value && Number(state.preu) !== Number(preparacio.value.preu));

    const textAvisEmbalatge = (codi) => {
      switch (codi) {
        case 'SENSE_EMBALATGE_DEFINIT': return t('Albarans.Avis embalatge sense definit');
        case 'NO_MULTIPLE_CONDICIONAMENT': return t('Albarans.Avis embalatge no multiple condicionament');
        case 'NO_MULTIPLE_CAIXA': return t('Albarans.Avis embalatge no multiple caixa');
        case 'NO_MULTIPLE_CAIXA_PLATAFORMA': return t('Albarans.Avis embalatge no multiple caixa plataforma');
        default: return '';
      }
    };
    const iconaSeveritat = (severitat) =>
      severitat === 'INFO' ? 'fa-solid fa-circle-info' : 'fa-solid fa-triangle-exclamation';
    const classeSeveritat = (severitat) => {
      switch (severitat) {
        case 'ERROR': return 'avis-error';
        case 'AVIS': return 'avis-avis';
        default: return 'avis-info';
      }
    };

    // Check al servidor: si tot és correcte s'afegeix la línia directament; si hi ha avisos,
    // es demana confirmació i, si es descarta, es torna a la pantalla de quantitat i preu.
    const acceptar = async () => {
      v.value.$reset();
      await v.value.$validate();
      if (v.value.$error) return;

      try {
        const resp = await carrega(
          AlbaraService.validarLiniaTraspas(props.idAlbara, clau(), state.quantitat));
        avisos.value = resp?.data ?? resp ?? null;
      } catch {
        return;
      }

      if (avisos.value?.avisEmbalatge || avisos.value?.isStockNegatiu) avisosVisibles.value = true;
      else await afegir();
    };

    const afegir = async () => {
      try {
        await carrega(AlbaraService.afegirLiniaTraspas(props.idAlbara, {
          articleClient: clau(),
          quantitat: state.quantitat,
          preu: state.preu,
          divisa: preparacio.value.divisa,
        }));
      } catch {
        // L'error ja s'ha mostrat; es torna a la pantalla de quantitat i preu per corregir-ho
        avisosVisibles.value = false;
        return;
      }
      avisosVisibles.value = false;
      emit('afegida');
      hide();
    };

    const hide = () => emit('update:carregat', false);

    return {
      visible, state, v, preparacio, avisos, avisosVisibles, inputQuantitat,
      textEmbalatge, isPreuCanviat, textAvisEmbalatge, iconaSeveritat, classeSeveritat,
      acceptar, afegir, hide,
    };
  },
};
</script>

<style scoped>
  .fitxa {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    padding: 10px 12px;
    margin-bottom: 16px;
    border: 1px solid #c3ccd6;
    border-radius: 8px;
    background: #fbfcfd;
  }
  .camp-info {
    display: flex;
    flex-direction: column;
    min-width: 120px;
    font-size: 0.9rem;
  }
  .camp-label {
    font-weight: 600;
    color: #556;
    font-size: 0.78rem;
    text-transform: uppercase;
  }
  .camp { margin-bottom: 12px; }
  .camp > label {
    display: block;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .camp > small { display: block; }
  .ajuda-camp { color: #778; font-size: 0.78rem; }
  .preu-linia {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .divisa { color: #556; font-weight: 600; }
  .stock-negatiu { color: #c0392b; }
  .botons {
    margin-top: 18px;
    text-align: right;
  }

  .capsalera-avis { font-size: larger; font-weight: 600; color: #8a6d00; }
  .avis {
    border: 1px solid #c3ccd6;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 14px;
  }
  .avis:last-child { margin-bottom: 0; }
  .avis-titol {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    padding: 8px 12px;
    border-bottom: 1px solid #c3ccd6;
  }
  .avis-cos { padding: 10px 12px; }
  .avis-cos > p { margin: 0 0 8px 0; }
  .dades {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 24px;
    font-size: 0.9rem;
  }
  .avis-error { border-color: #e5a5a0; background: #fdf4f3; }
  .avis-error .avis-titol { background: #f8d7da; border-bottom-color: #e5a5a0; color: #a02c22; }
  .avis-avis { border-color: #e0a800; background: #fff9e6; }
  .avis-avis .avis-titol { background: #ffecb3; border-bottom-color: #e0a800; color: #8a6d00; }
  .avis-info { border-color: #b6d4fe; background: #f3f8ff; }
  .avis-info .avis-titol { background: #e7f1ff; border-bottom-color: #b6d4fe; color: #0b5ed7; }
</style>
