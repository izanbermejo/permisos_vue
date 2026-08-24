<template>
  <div class="completable-lookup">
    <div class="completable-field" :class="{ 'p-invalid' : invalid }" @click="focusCodeInput" :style="{ width: (inputWidth + matchWidth) + 'px' }">
      <span class="completable-icon-search" @click.stop="openDialog">
        <i class="pi pi-search" />
        <span class="completable-f1-hint">F1</span>
      </span>
      <input
        ref="mainInputRef"
        v-model="inputValue"
        class="completable-native-input"
        :style="{ flex: inputWidth }"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <span
        class="completable-chip"
        v-tooltip="matchedNom"
        :style="{ flex: matchWidth, visibility: matchedNom ? 'visible' : 'hidden' }"
      >{{ matchedNom }}</span>
    </div>

    <!-- modal de búsqueda -->
    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="'Seleccionar'"
      :style="{ width: '480px' }"
      @show="onDialogShow"
      @hide="focusMainInput"
    >
      <!-- buscador -->
      <span class="p-input-icon-left w-full mb-3" style="display: block;">
        <i class="pi pi-search" />
        <InputText
          ref="searchInputRef"
          v-model="searchText"
          placeholder="Buscar..."
          class="w-full"
          @keydown="onSearchKeydown"
        />
      </span>

      <!-- Llista de resultats -->
      <ul class="modal-list" ref="listRef">
        <li
          v-for="(item, index) in filteredItems"
          :key="item.codi"
          class="modal-list-item"
          :class="{ 'modal-list-item--active': index === activeIndex }"
          @click="selectItem(item)"
          @mouseenter="activeIndex = index"
        >
          <span class="item-codi">{{ item.codi }}</span>
          <span class="item-nom">{{ item.nom }}</span>
        </li>
        <li v-if="filteredItems.length === 0" class="modal-list-empty">
          {{ $t('App.Sense resultats')}}
        </li>
      </ul>
    </Dialog>
  </div>
</template>

<script>
import { ref, watch, computed, nextTick } from 'vue';

export default {
  name: 'CompletableInput',
  props: {
    modelValue: String,
    items: {
      type: Array,
      required: true
    },
    inputWidth: {
      type: Number,
      default: 100
    },
    matchWidth: {
      type: Number,
      default: 150
    },
    invalid: Boolean
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const inputValue = ref('');
    const matchedNom = ref('');
    const dialogVisible = ref(false);
    const searchText = ref('');
    const activeIndex = ref(0);
    const searchInputRef = ref(null);
    const mainInputRef = ref(null);
    const listRef = ref(null);

    watch(
      () => props.modelValue,
      (newVal) => {
        const match = props.items.find(i => i.codi === newVal);
        inputValue.value = match ? match.codi : newVal || '';
        matchedNom.value = match ? match.nom : '';
      },
      { immediate: true }
    );

    // Sincronitzar el modelValue mentre l'usuari escriu
    watch(inputValue, (newVal) => {
      emit('update:modelValue', newVal);
    });

    // Llista filtrada al buscador del modal
    const filteredItems = computed(() => {
      const q = searchText.value.trim().toLowerCase();
      if (!q) return props.items;
      return props.items.filter(
        i => i.codi.toLowerCase().includes(q) || i.nom.toLowerCase().includes(q)
      );
    });

    // Reset index quan canvia la llista
    watch(filteredItems, () => { activeIndex.value = 0; });

    // blur del camp principal: validar el codi introduït
    const onBlur = () => {
      const val = inputValue.value.trim();
      const match = props.items.find(i => val === i.codi);
      if (match) {
        inputValue.value = match.codi;
        matchedNom.value = match.nom;
        emit('update:modelValue', match.codi);
      } else {
        matchedNom.value = '';
        emit('update:modelValue', val);
      }
    };

    // Obrir modal: si ja tenim un nom, el buscador s'inicia buit; si no, amb el que hi ha al input
    const openDialog = () => {
      searchText.value = matchedNom.value ? '' : inputValue.value;
      activeIndex.value = 0;
      dialogVisible.value = true;
    };

    // quan el modal acaba d'aparèixer, foco en el buscador
    const onDialogShow = () => {
      nextTick(() => {
        searchInputRef.value?.$el?.focus();
      });
    };

    // Tornar el foco al input principal (després de tancar el modal o al clicar el chip)
    const focusMainInput = (selectAll = false) => {
      nextTick(() => {
        const el = mainInputRef.value;
        if (!el) return;
        el.focus();
        if (selectAll) el.select();
      });
    };

    const focusCodeInput = () => { mainInputRef.value?.focus(); };

    // Selecció d'element
    const selectItem = (item) => {
      inputValue.value = item.codi;
      matchedNom.value = item.nom;
      emit('update:modelValue', item.codi);
      dialogVisible.value = false;
      focusMainInput(true);
    };

    // Teclat dins del buscador del modal: navegar i seleccionar
    const onSearchKeydown = (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        activeIndex.value = Math.min(activeIndex.value + 1, filteredItems.value.length - 1);
        scrollActiveIntoView();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        activeIndex.value = Math.max(activeIndex.value - 1, 0);
        scrollActiveIntoView();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const item = filteredItems.value[activeIndex.value];
        if (item) selectItem(item);
      } else if (event.key === 'Escape') {
        dialogVisible.value = false;
      }
    };

    const scrollActiveIntoView = () => {
      nextTick(() => {
        const el = listRef.value?.children[activeIndex.value];
        el?.scrollIntoView({ block: 'nearest' });
      });
    };

    // Tecla F1 al input principal: obrir modal
    const onKeydown = (event) => {
      if (event.key === 'F1') {
        event.preventDefault();
        openDialog();
      }
    };

    return {
      inputValue,
      matchedNom,
      dialogVisible,
      searchText,
      activeIndex,
      searchInputRef,
      mainInputRef,
      listRef,
      filteredItems,
      onBlur,
      openDialog,
      onDialogShow,
      focusMainInput,
      focusCodeInput,
      selectItem,
      onSearchKeydown,
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
.completable-field.p-invalid {
  border-color: #f44336;
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

/* lista del modal */
.modal-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}
.modal-list-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}
.modal-list-item:hover,
.modal-list-item--active {
  background-color: var(--primary-color, #3B82F6);
  color: #fff;
}
.item-codi {
  font-weight: 600;
  min-width: 4rem;
}
.item-nom {
  flex: 1;
}
.modal-list-empty {
  padding: 0.75rem;
  color: #888;
  text-align: center;
}
</style>
