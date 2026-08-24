<template>
  <Dialog :visible="visible" modal :closable="true" :closeOnEscape="false" :draggable="false"
    @update:visible="onHide"
    :style="{ width: '420px' }" :header="$t('Propostes.Opcions creacio albarans')">

    <div class="opcions-cos">
      <div class="element-form">
        <label class="element-label">{{ $t('Propostes.Data albara') }}</label>
        <CalendarInput v-model="state.data" />
      </div>
      <div class="element-form element-form-check">
        <Checkbox v-model="state.tancarNous" :binary="true" inputId="chkTancarAlbaransNous" />
        <label for="chkTancarAlbaransNous" style="cursor: pointer;">{{ $t('Propostes.Tancar albarans nous') }}</label>
      </div>
    </div>

    <template #footer>
      <ButtonShortcut icon="fa-solid fa-undo" :literal="$t('App.Cancela')" shortcut="[Esc]"
        class="p-button-secondary p-button-sm" tabindex="-1" @click="onCancelar" />
      <ButtonShortcut icon="pi pi-check" :literal="$t('App.Confirmar')" shortcut="[Enter]"
        class="p-button-sm" @click="onConfirmar" />
    </template>
  </Dialog>
</template>

<script>
import { reactive, watch, onUnmounted } from 'vue';
import moment from 'moment';
import ButtonShortcut from '@/components/ButtonShortcut.vue';
import CalendarInput from '@/components/prime/CalendarInput.vue';

export default {
  name: 'ModalOpcionsCreacioAlbarans',
  components: { ButtonShortcut, CalendarInput },
  props: {
    visible: { type: Boolean, default: false },
    // Data inicial ('YYYY-MM-DD'); si no ve, avui
    data: { type: String, default: null },
    // Estat inicial del checkbox "Tancar albarans nous"
    tancarAlbaransNous: { type: Boolean, default: true },
  },
  emits: ['confirmar', 'update:visible'],
  setup(props, { emit }) {
    const state = reactive({
      data: props.data ? moment(props.data, 'YYYY-MM-DD').toDate() : new Date(),
      tancarNous: props.tancarAlbaransNous,
    });

    const onConfirmar = () => {
      emit('confirmar', {
        data: moment(state.data).format('YYYY-MM-DD'),
        tancarAlbaransNous: state.tancarNous,
      });
      emit('update:visible', false);
    };
    const onCancelar = () => emit('update:visible', false);
    const onHide = (val) => { if (!val) emit('update:visible', false); };

    // En obrir, es reinicien els valors amb els que arriben del pare (data/estat vigents)
    watch(() => props.visible, (obert) => {
      if (obert) {
        state.data = props.data ? moment(props.data, 'YYYY-MM-DD').toDate() : new Date();
        state.tancarNous = props.tancarAlbaransNous;
        document.addEventListener('keydown', keyHandler, true);
      } else {
        document.removeEventListener('keydown', keyHandler, true);
      }
    });

    // Esc cancel·la i Enter confirma, sense que arribi al modal de fons
    const keyHandler = (ev) => {
      if (!props.visible) return;
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

    onUnmounted(() => document.removeEventListener('keydown', keyHandler, true));

    return { state, onConfirmar, onCancelar, onHide };
  },
}
</script>

<style scoped>
  .opcions-cos {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 8px 4px;
  }
  .element-form {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .element-form-check {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  .element-label {
    font-weight: 600;
  }
</style>
