<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :draggable="false"
    :style="{ width: '680px' }">
    <template #header>
      <div style="font-size: larger; font-weight: 600;">
        <font-awesome-icon icon="fa-solid fa-right-left" style="margin-right: 10px;" />
        {{ $t('Albarans.Nou traspas') }}
      </div>
    </template>

    <form @submit.prevent="continuar">
      <p class="ajuda">{{ $t('Albarans.Nou traspas ajuda') }}</p>

      <div class="camp">
        <label>{{ $t('Albarans.Data') }}</label>
        <CalendarInput v-model="state.data" :invalid="v.data.$error" />
        <small v-if="v.data.$error" class="p-error">{{ $t('App.Valor requerit') }}</small>
      </div>

      <!-- Graella origen → destí: en horitzontal es llegeix el recorregut, en vertical empresa → magatzem -->
      <div class="ruta">
        <span></span>
        <span class="ruta-capsalera">{{ $t('Albarans.Origen') }}</span>
        <span></span>
        <span class="ruta-capsalera">{{ $t('Albarans.Desti') }}</span>

        <label class="ruta-etiqueta">{{ $t('Albarans.Empresa') }}</label>
        <div class="ruta-cel">
          <CompletableInput v-model="state.empresaOrigen" :items="$empreses" :inputWidth="40" :matchWidth="190" />
          <small v-if="v.empresaOrigen.$error" class="p-error">{{ errorEmpresaOrigen }}</small>
        </div>
        <span class="ruta-fletxa">→</span>
        <div class="ruta-cel">
          <CompletableInput v-model="state.empresaDesti" :items="$empreses" :inputWidth="40" :matchWidth="190" />
          <small v-if="v.empresaDesti.$error" class="p-error">{{ $t('Albarans.Empresa desconeguda') }}</small>
        </div>

        <label class="ruta-etiqueta">{{ $t('Albarans.Magatzem') }}</label>
        <div class="ruta-cel">
          <CompletableInput v-model="state.magatzemOrigen" :items="$magatzems" :inputWidth="55" :matchWidth="175" />
          <small v-if="v.magatzemOrigen.$error" class="p-error">{{ errorMagatzemOrigen }}</small>
        </div>
        <span class="ruta-fletxa">→</span>
        <div class="ruta-cel">
          <CompletableInput v-model="state.magatzemDesti" :items="$magatzems" :inputWidth="55" :matchWidth="175" />
          <small v-if="v.magatzemDesti.$error" class="p-error">{{ errorMagatzemDesti }}</small>
        </div>
      </div>

      <!-- L'abonable substitueix la facturació, així que només té sentit si hi ha canvi d'empresa -->
      <div class="camp-abonable" :class="{ 'camp-abonable--inactiu': !hiHaCanviEmpresa }">
        <Checkbox v-model="state.isTraspasAbonable" :binary="true" inputId="chkTraspasAbonable"
          :disabled="!hiHaCanviEmpresa" />
        <label for="chkTraspasAbonable">{{ $t('Albarans.Traspas abonable') }}</label>
      </div>
      <small class="ajuda-camp">
        <i class="pi pi-info-circle" />
        {{ hiHaCanviEmpresa ? $t('Albarans.Traspas abonable ajuda') : $t('Albarans.Empresa desti ajuda') }}
      </small>
      <small v-if="errorSenseMoviment" class="p-error bloc-error">{{ $t('Albarans.Traspas sense moviment') }}</small>

      <div class="botons">
        <Button tabindex="-1" :label="$t('App.Cancela')" icon="pi pi-undo" class="p-button-secondary p-button-sm" @click="hide" />
        <Button type="submit" :label="$t('App.Continuar')" icon="pi pi-arrow-right" class="p-button-sm" style="margin-left: 10px;" />
      </div>
    </form>
  </Dialog>
</template>

<script>
import { ref, reactive, computed, inject, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import CompletableInput from '@/components/CompletableInput.vue';
import CalendarInput from '@/components/prime/CalendarInput.vue';
import AlbaraService from '@/services/albara.service';
import { carrega } from '@/services/loader';

export default {
  name: 'ModalNouTraspas',
  components: { CompletableInput, CalendarInput },
  emits: ['update:carregat', 'creat'],
  setup(_, { emit }) {
    const { t } = useI18n();
    const visible = ref(true);
    // Catàlegs (codi/nom) del plugin, per validar que el codi escrit a mà existeix
    const empreses = inject('empreses', []);
    const magatzems = inject('magatzems', []);

    const state = reactive({
      data: new Date(),
      empresaOrigen: '',
      empresaDesti: '',
      magatzemOrigen: '',
      magatzemDesti: '',
      isTraspasAbonable: false,
    });

    // L'abonable substitueix la facturació del traspàs, i un traspàs només es factura si canvia d'empresa
    const hiHaCanviEmpresa = computed(() =>
      !!state.empresaDesti && state.empresaDesti !== state.empresaOrigen);
    watch(hiHaCanviEmpresa, (hiHaCanvi) => {
      if (!hiHaCanvi) state.isTraspasAbonable = false;
    });

    const existeix = (items, codi) => items.some(i => i.codi === codi);
    const empresaValida = (valor) => existeix(empreses, valor);
    const magatzemValid = (valor) => existeix(magatzems, valor);

    const rules = {
      data: { required, valid: (valor) => valor instanceof Date },
      empresaOrigen: { required, valid: empresaValida },
      // El destí només cal informar-lo si hi ha canvi d'empresa; si s'informa, ha d'existir
      empresaDesti: { valid: (valor) => !valor || empresaValida(valor) },
      magatzemOrigen: { required, valid: magatzemValid },
      magatzemDesti: { required, valid: magatzemValid },
    };
    const v = useVuelidate(rules, state);

    const missatgeCodi = (camp, literalDesconegut) =>
      v.value[camp].required?.$invalid ? t('App.Valor requerit') : t(literalDesconegut);
    const errorEmpresaOrigen = computed(() => missatgeCodi('empresaOrigen', 'Albarans.Empresa desconeguda'));
    const errorMagatzemOrigen = computed(() => missatgeCodi('magatzemOrigen', 'Albarans.Magatzem desconegut'));
    const errorMagatzemDesti = computed(() => missatgeCodi('magatzemDesti', 'Albarans.Magatzem desconegut'));

    // Un traspàs ha de moure alguna cosa: o canvia de magatzem o canvia d'empresa. El backend també ho
    // valida, però avisar-ne aquí estalvia crear la capçalera per haver-la d'eliminar tot seguit.
    const errorSenseMoviment = computed(() =>
      !!state.magatzemOrigen
      && state.magatzemOrigen === state.magatzemDesti
      && (!state.empresaDesti || state.empresaDesti === state.empresaOrigen));

    const hide = () => emit('update:carregat', false);

    const continuar = async () => {
      v.value.$reset();
      await v.value.$validate();
      if (v.value.$error || errorSenseMoviment.value) return;

      const resposta = await carrega(AlbaraService.crearAlbaraTraspasManual({
        dataAlbara: moment(state.data).format('YYYY-MM-DD'),
        empresaOrigen: state.empresaOrigen,
        empresaDesti: state.empresaDesti || null,
        magatzem: state.magatzemOrigen,
        magatzemDesti: state.magatzemDesti,
        isTraspasAbonable: state.isTraspasAbonable,
      }));
      const creat = resposta?.data ?? resposta;
      if (!creat?.idAlbara) return;
      emit('creat', creat);
      hide();
    };

    // Esc tanca el modal (el diàleg de cerca del CompletableInput ja s'ho gestiona pel seu compte)
    const handler = (ev) => { if (ev.key === 'Escape') hide(); };
    onMounted(() => document.addEventListener('keydown', handler));
    onUnmounted(() => document.removeEventListener('keydown', handler));

    return {
      visible, state, v, hide, continuar, hiHaCanviEmpresa,
      errorEmpresaOrigen, errorMagatzemOrigen, errorMagatzemDesti, errorSenseMoviment,
    };
  },
};
</script>

<style scoped>
  .ajuda {
    margin: 0 0 14px 0;
    color: #556;
    font-size: 0.88rem;
  }
  .camp { margin-bottom: 16px; }
  .camp > label {
    display: block;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .camp > small { display: block; }
  .ajuda-camp {
    display: block;
    margin-top: 10px;
    color: #778;
    font-size: 0.78rem;
  }
  .bloc-error { display: block; margin-top: 6px; }
  .camp-abonable {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
  }
  .camp-abonable > label { font-weight: 600; }
  .camp-abonable--inactiu > label { color: #99a; font-weight: 400; }

  /* Columnes: etiqueta | origen | fletxa | destí */
  .ruta {
    display: grid;
    grid-template-columns: auto auto auto auto;
    align-items: start;
    gap: 10px 12px;
    padding: 12px;
    border: 1px solid #c3ccd6;
    border-radius: 8px;
    background: #fbfcfd;
  }
  .ruta-capsalera {
    font-weight: 700;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #556;
    text-align: center;
  }
  .ruta-etiqueta {
    font-weight: 600;
    /* Alineació vertical amb el text de dins del CompletableInput */
    padding-top: 0.3rem;
    white-space: nowrap;
  }
  .ruta-cel > small { display: block; }
  .ruta-fletxa {
    padding-top: 0.25rem;
    font-weight: 700;
    color: #667;
    text-align: center;
  }
  .botons {
    margin-top: 18px;
    text-align: right;
  }
</style>
