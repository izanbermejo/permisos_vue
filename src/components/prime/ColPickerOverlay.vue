<template>
    <OverlayPanel ref="panel" style="width: 260px;">
        <div class="col-picker">
            <div
                v-for="(col, i) in columns" :key="col.key"
                class="col-picker-row"
                draggable="true"
                :class="{ 'col-picker-row--dragging': draggedIndex === i, 'col-picker-row--over': dragOverIndex === i }"
                @dragstart="draggedIndex = i"
                @dragover.prevent="dragOverIndex = i"
                @dragleave="dragOverIndex = null"
                @drop.prevent="dropCol(i)"
                @dragend="draggedIndex = null; dragOverIndex = null"
            >
                <i class="pi pi-bars col-drag-handle" />
                <Checkbox v-model="col.visible" :binary="true" @click.stop />
                <span class="col-picker-label">{{ $t(col.headerI18n) }}</span>
            </div>
        </div>
    </OverlayPanel>
</template>

<script>
import { ref, watch, onBeforeMount } from 'vue';
import OverlayPanel from 'primevue/overlaypanel';

export default {
    name: 'ColPickerOverlay',
    components: { OverlayPanel },
    props: {
        columns:    { type: Array,  required: true },
        storageKey: { type: String, default: null },
    },
    emits: ['update:columns'],
    setup(props, { emit }) {
        const panel = ref();
        const draggedIndex = ref(null);
        const dragOverIndex = ref(null);

        onBeforeMount(() => {
            if (!props.storageKey) return;
            try {
                const saved = JSON.parse(localStorage.getItem(props.storageKey));
                if (!Array.isArray(saved)) return;
                const ordered = [];
                saved.forEach(({ key, visible }) => {
                    const col = props.columns.find(c => c.key === key);
                    if (col) ordered.push({ ...col, visible });
                });
                props.columns.forEach(col => {
                    if (!ordered.find(c => c.key === col.key)) ordered.push(col);
                });
                emit('update:columns', ordered);
            } catch {
                // Ignore JSON parse errors or other issues
            }
        });

        watch(() => props.columns, (val) => {
            if (!props.storageKey) return;
            localStorage.setItem(props.storageKey, JSON.stringify(val.map(c => ({ key: c.key, visible: c.visible }))));
        }, { deep: true });

        const dropCol = (targetIndex) => {
            if (draggedIndex.value === null || draggedIndex.value === targetIndex) return;
            const arr = [...props.columns];
            const [item] = arr.splice(draggedIndex.value, 1);
            arr.splice(targetIndex, 0, item);
            emit('update:columns', arr);
        };

        return { panel, draggedIndex, dragOverIndex, dropCol, toggle: (ev) => panel.value.toggle(ev) };
    },
};
</script>

<style scoped>
.col-picker { display: flex; flex-direction: column; gap: 2px; }
.col-picker-row {
    display: flex; align-items: center; gap: 6px;
    padding: 3px 4px; border-radius: 4px;
    cursor: grab;
    user-select: none;
}
.col-picker-row--dragging { opacity: 0.4; }
.col-picker-row--over { background-color: #e3f2fd; }
.col-drag-handle { color: #aaa; font-size: 0.8rem; cursor: grab; }
.col-picker-label { font-size: 0.85rem; flex: 1; }
</style>
