<template>
    <Dialog v-model:visible="visible" modal @hide="hide"
        :header="isEditMode ? $t('historicMoviments.titolModalModificarRegularitzacio') : $t('historicMoviments.titolModalRegularitzacio')"
        :closable="true" :closeOnEscape="true" :draggable="false"
        style="width: 475px">
        <div class="form">
            <div class="element-form">
                <label>{{ $t('historicMoviments.regularitzacioData') }}</label>
                <CalendarInput v-model="state.data" :invalid="v.data.$errors.length > 0" />
                <small v-if="v.data.$errors.length" class="p-error">{{ $t('App.Valor requerit') }}</small>
            </div>
            <div class="element-form">
                <label>{{ $t('historicMoviments.regularitzacioQuantitat') }}</label>
                <InputNumber ref="inputQuantitat" v-model="state.quantitat"
                    mode="decimal" :maxFractionDigits="0" :locale="locale"
                    :class="{ 'p-invalid': v.quantitat.$errors.length > 0 }"
                    style="width: 140px;"
                    @input="state.quantitat = $event.value"
                    @keypress.enter="desar()"
                    @focus="$event.originalTarget.select()" />
                <small v-if="v.quantitat.$errors.length" class="p-error">{{ $t('App.Valor requerit') }}</small>
            </div>
            <div class="break" />
            <div class="element-form">
                <label>{{ $t('historicMoviments.regularitzacioObservacions') }}</label>
                <InputText v-model="state.observacions" style="width: 350px;" />
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
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { useToast } from 'primevue/usetoast';
import CalendarInput from '@/components/prime/CalendarInput.vue';
import ButtonShortcut from '@/components/ButtonShortcut.vue';
import InventariService from '@/services/inventari.service';
import { carrega } from '@/services/loader';
import moment from 'moment';

export default {
    name: 'CrearRegularitzacio',
    components: { CalendarInput, ButtonShortcut },
    props: {
        carregat:             { type: Boolean, required: true },
        artint:               { type: String,  required: true },
        clicod:               { type: String,  required: true },
        empresa:              { type: String,  required: true },
        magatzem:             { type: String,  required: true },
        movimentId:           { type: Number,  default: null },
        dataInicial:          { type: Date,    default: null },
        quantitatInicial:     { type: Number,  default: null },
        observacionsInicials: { type: String,  default: null },
    },
    emits: ['update:carregat', 'saved'],
    setup(props, { emit }) {
        const { t, locale } = useI18n();
        const toast = useToast();

        const visible = ref(true);
        const inputQuantitat = ref(null);
        const isEditMode = computed(() => props.movimentId != null);

        const state = reactive({
            data: new Date(),
            quantitat: 0,
            observacions: null,
        });

        const nonZero = helpers.withMessage(
            () => t('App.Valor requerit'),
            value => value !== null && value !== 0
        );
        const rules = {
            data:      { required },
            quantitat: { required, nonZero },
        };
        const v = useVuelidate(rules, state);

        const hide = () => {
            emit('update:carregat', false);
        };

        const desar = async () => {
            const valid = await v.value.$validate();
            if (!valid) return;
            if (isEditMode.value) {
                await carrega(InventariService.modificarRegularitzacio(
                    props.movimentId, state.data, state.quantitat,
                    state.observacions || undefined
                ));
                toast.add({ severity: 'success', summary: t('historicMoviments.regularitzacioModificadaOk'), life: 3000 });
            } else {
                await carrega(InventariService.afegirRegularitzacio(
                    props.artint, props.clicod, props.empresa, props.magatzem,
                    state.data, state.quantitat,
                    state.observacions || undefined
                ));
                toast.add({ severity: 'success', summary: t('historicMoviments.regularitzacioOk'), life: 3000 });
            }
            emit('saved');
            hide();
        };

        const keyHandler = (ev) => {
            if (ev.key === 'Escape') hide();
        };

        onMounted(() => {
            state.data        = props.dataInicial         ? moment(props.dataInicial).toDate() : new Date();
            state.quantitat   = props.quantitatInicial    ?? 0;
            state.observacions = props.observacionsInicials ?? null;
            window.addEventListener('keydown', keyHandler);
            nextTick(() => {
                setTimeout(() => inputQuantitat.value?.$el.firstChild.focus(), 200);
            });
        });

        onUnmounted(() => {
            window.removeEventListener('keydown', keyHandler);
        });

        return { visible, isEditMode, inputQuantitat, locale, state, v, hide, desar };
    },
};
</script>

<style scoped>
.form {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px 30px;
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

.break {
    flex-basis: 100%;
    height: 0;
}
</style>
