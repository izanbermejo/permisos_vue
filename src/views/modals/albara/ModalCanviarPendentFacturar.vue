<template>
    <Dialog v-model:visible="visible" modal @hide="hide"
        :header="$t('Albarans.Canviar pendent facturar')"
        :closable="true" :closeOnEscape="true" :draggable="false"
        style="width: 430px">
        <div class="form">
            <div class="camp-lectura">
                <span class="camp-label">{{ $t('Albarans.Quantitat') }}</span>
                <span>{{ $n(linia.quantitat) }}</span>
            </div>
            <div class="camp-lectura">
                <span class="camp-label">{{ $t('Albarans.Pdt facturar') }}</span>
                <span>{{ $n(linia.quantitatPendentFacturar) }}</span>
            </div>
            <div class="break" />
            <div class="element-form">
                <label>{{ $t('Albarans.Nova quantitat pendent facturar') }}</label>
                <InputNumber ref="inputQuantitat" v-model="state.quantitat"
                    mode="decimal" :maxFractionDigits="0" :locale="locale"
                    :min="0" :max="linia.quantitat"
                    :class="{ 'p-invalid': v.quantitat.$errors.length > 0 }"
                    style="width: 140px;"
                    @input="state.quantitat = $event.value"
                    @keypress.enter="desar()"
                    @focus="$event.originalTarget.select()" />
                <small v-if="v.quantitat.$errors.length" class="p-error">
                    {{ $t('Albarans.Pendent facturar fora de rang', [$n(linia.quantitat)]) }}
                </small>
            </div>
        </div>
        <template #footer>
            <ButtonShortcut icon="fa-solid fa-undo" :literal="$t('App.Cancela')" shortcut="[Esc]"
                class="p-button-secondary p-button-sm" tabindex="-1" @click="hide()" />
            <ButtonShortcut icon="pi pi-check" :literal="$t('App.Desa')" shortcut="[Enter]"
                @click="desar()" />
        </template>
    </Dialog>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import ButtonShortcut from '@/components/ButtonShortcut.vue';
import AlbaraService from '@/services/albara.service';
import { carrega } from '@/services/loader';

export default {
    name: 'ModalCanviarPendentFacturar',
    components: { ButtonShortcut },
    props: {
        // Línia d'albarà a rectificar (id, quantitat i quantitatPendentFacturar)
        linia: { type: Object, required: true },
    },
    emits: ['tancar', 'guardat'],
    setup(props, { emit }) {
        const { locale } = useI18n();

        const visible = ref(true);
        const inputQuantitat = ref(null);

        const state = reactive({
            quantitat: props.linia.quantitatPendentFacturar,
        });

        // El backend torna a validar el rang; aquí evitem la crida quan ja sabem que no és vàlida.
        const dinsRang = value => value != null && value >= 0 && value <= props.linia.quantitat;
        const v = useVuelidate({ quantitat: { required, dinsRang } }, state);

        const hide = () => emit('tancar');

        const desar = async () => {
            const valid = await v.value.$validate();
            if (!valid) return;
            await carrega(AlbaraService.canviarQuantitatPendentFacturar(props.linia.id, state.quantitat));
            emit('guardat');
            hide();
        };

        const keyHandler = (ev) => {
            if (ev.key === 'Escape') hide();
        };

        onMounted(() => {
            window.addEventListener('keydown', keyHandler);
            nextTick(() => {
                setTimeout(() => inputQuantitat.value?.$el.firstChild.focus(), 200);
            });
        });

        onUnmounted(() => {
            window.removeEventListener('keydown', keyHandler);
        });

        return { visible, inputQuantitat, locale, state, v, hide, desar };
    },
};
</script>

<style scoped>
.form {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px 30px;
    padding-top: 4px;
}

.element-form {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.element-form label {
    font-weight: 600;
}

.camp-lectura {
    display: flex;
    flex-direction: column;
    min-width: 90px;
    font-size: 0.9rem;
}

.camp-label {
    font-weight: 600;
    color: #556;
    font-size: 0.78rem;
    text-transform: uppercase;
}

.break {
    flex-basis: 100%;
    height: 0;
}
</style>
