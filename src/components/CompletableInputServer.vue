<template>
  <div class="completable-lookup">
    <div class="completable-field" @click="focusCodeInput" :style="{ width: (inputWidth + matchWidth) + 'px' }" :class="{ 'is-disabled': disabled }">
      <span class="completable-icon-search" @click.stop="onSearchIconClick">
        <i class="pi pi-search" />
        <span class="completable-f1-hint">F1</span>
      </span>
      <input
        ref="mainInputRef"
        v-model="inputValue"
        class="completable-native-input"
        :style="{ flex: inputWidth }"
        :disabled="disabled"
        @input="onInput"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <span
        class="completable-chip"
        v-tooltip="matchedNom"
        :style="{ flex: matchWidth, visibility: matchedNom ? 'visible' : 'hidden' }"
      >{{ matchedNom }}</span>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue';

export default {
  name: 'CompletableInputServer',
  components: {},
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // Després del blur, es fa la crida al servidor per
    // resoldre el valor introduït. Rep el text escrit i ha de retornar una Promise amb
    //  { codi, nom } si es troba, o null si no.
    fetchValue: {
      type: Function,
      required: true
    },
    // Quan es prem F1 es crida al pare per obrir el seu propi modal
    onOpenSearch: {
      type: Function,
      required: true
    },
    inputWidth: {
      type: Number,
      default: 100
    },
    matchWidth: {
      type: Number,
      default: 150
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const inputValue = ref('');
    const matchedNom = ref('');
    const mainInputRef = ref(null);

    const safelyFetch = async (val) => {
      try { return await props.fetchValue(val); } catch { return null; }
    };

    // Sync desde el pare
    watch(
      () => props.modelValue,
      async (newVal) => {
        const normalized = newVal || '';
        if (inputValue.value === normalized) return; // cambio originado por nosotros
        inputValue.value = normalized;
        matchedNom.value = '';
        if (normalized) {
          const result = await safelyFetch(normalized);
          matchedNom.value = result?.nom || '';
        }
      },
      { immediate: true }
    );

    // Actualitza l'estat immediatament en cada tecla → sense race conditions
    const onInput = () => {
      if (props.disabled) return;
      matchedNom.value = '';
      emit('update:modelValue', inputValue.value);
    };

    const onBlur = async () => {
      if (props.disabled) return;
      const val = inputValue.value.trim();
      if (!val) {
        matchedNom.value = '';
        return;
      }
      const result = await safelyFetch(val);
      matchedNom.value = result?.nom || '';
    };

    // Devolver el foco al input principal
    const focusMainInput = (selectAll = false) => {
      nextTick(() => {
        const el = mainInputRef.value;
        if (!el) return;
        el.focus();
        if (selectAll) el.select();
      });
    };

    const focusCodeInput = () => { mainInputRef.value?.focus(); };

    // Métode públic que el pare pot usar per seleccionar un item (des del seu modal)
    const selectItem = (item) => {
      inputValue.value = item.codi;
      matchedNom.value = item.nom;
      emit('update:modelValue', item.codi);
      focusMainInput(true);
    };

    const onSearchIconClick = () => {
      props.onOpenSearch({ currentValue: props.modelValue, selectItem });
    };

    const onKeydown = (event) => {
      if (props.disabled) return;
      if (event.key === 'F1') {
        event.preventDefault();
        onSearchIconClick();
      }
    };

    return {
      inputValue,
      matchedNom,
      mainInputRef,
      onInput,
      onBlur,
      focusMainInput,
      focusCodeInput,
      selectItem,
      onSearchIconClick,
      onKeydown
    };
  }
};
</script>

<style scoped>
.completable-lookup {
  display: inline-block;
}
.completable-field {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  border: 1px solid var(--surface-border, #ced4da);
  border-radius: var(--border-radius, 4px);
  background: var(--surface-a, #fff);
  padding: 0.25rem 0.5rem 0.25rem 1.8rem;
  position: relative;
  cursor: text;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  font-size: 0.875rem;
}
.completable-field:focus-within {
  border-color: var(--primary-color, #3B82F6);
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
  outline: 0 none;
}
.completable-icon-search {
  position: absolute;
  left: 0.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: var(--text-color-secondary, #6c757d);
  line-height: 1;
  gap: 0;
  font-size: 0.75rem;
}
.completable-f1-hint {
  font-size: 0.65rem;
  line-height: 1;
  color: var(--text-color-secondary, #6c757d);
  font-weight: 700;
  letter-spacing: 0;
}
.completable-native-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  font-family: inherit;
  padding: 0;
  min-width: 0;
  overflow: hidden;
  color: var(--text-color, #495057);
}
.completable-chip {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  background: #e9ecef;
  color: #495057;
  border-radius: 1rem;
  padding: 0 0.5rem;
  font-size: 0.82em;
  line-height: inherit;
  margin-left: 0.3rem;
}
.completable-icon-clear:hover {
  color: #333;
}

.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none; 
}
</style>
