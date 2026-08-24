<template>
    <Dialog v-model:visible="refVisible" modal
        :closable="false" :closeOnEscape="false" :draggable="false"
        :style="{ width: '90vw', maxHeight: '95vh', overflow: 'auto' }">
        <template #header>
            <span style="font-size: larger; font-weight: 600;">
                {{ $t('historicMoviments.titol') }}
            </span>
            <button tabindex="-1" style="margin-left: auto;" @click="hide"
                class="p-dialog-header-icon p-dialog-header-close p-link" aria-label="Close" type="button">
                <span class="p-dialog-header-close-icon pi pi-times"></span>
            </button>
        </template>
        <HistoricMoviments :artint="artint" :clicod="clicod" @close="hide" @aclfab="v => codiArticle = v" style="margin-top: 8px;" />
    </Dialog>
</template>

<script>
import { toRef, ref } from 'vue';
import HistoricMoviments from '@/components/inventari/HistoricMoviments.vue';

export default {
    name: 'ModalHistoricMoviments',
    components: {
        HistoricMoviments,
    },
    props: {
        visible: { type: Boolean, required: true },
        artint:  { type: String,  required: true },
        clicod:  { type: String,  required: true },
    },
    emits: ['update:visible'],
    setup(props, { emit }) {
        const refVisible = toRef(props, 'visible');
        const codiArticle = ref(null);

        const hide = () => {
            emit('update:visible', false);
        };

        return { refVisible, codiArticle, hide };
    },
};
</script>
