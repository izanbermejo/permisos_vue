<template>
    <Dialog :visible="carregat" @update:visible="$emit('update:carregat', $event)" modal
        :header="$t('Albarans.Marcar urgent') + (albaraRef ? ` - ${albaraRef.codi}` : '')"
        :style="{ width: '480px' }">

        <div class="camp-motius">
            <label class="p-d-block p-mb-2">{{ $t('Albarans.Motiu urgencia') }}</label>
            <Dropdown ref="motiuDropdown" v-model="state.motiuSeleccionat" :options="$motiusDisponibles"
                optionLabel="label" optionValue="key"
                :class="{ 'p-invalid': v.motiuSeleccionat.$errors.length }"
                :placeholder="$t('Albarans.Seleccionar motiu')" style="width:100%" />
            <small v-if="v.motiuSeleccionat.$errors.length" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>

            <!-- Camp de text lliure quan es marca qualsevol motiu -->
            <div class="camp-altres">
                <InputText v-model="state.detallMotiuText" :placeholder="$t('Albarans.Especificar motiu')" style="width:100%" />
            </div>
        </div>

        <div class="element-form">
            <label>{{ $t('Comandes.Preu')}}</label>
            <div class="fila-preu-divisa">
                <div class="camp-preu-divisa">
                    <InputNumber v-model="state.importUrgent" mode="decimal" :maxFractionDigits="3"
                        @input="state.importUrgent = $event.value"
                        :class="{ 'p-invalid': v.importUrgent.$errors.length }"
                        @keypress.enter="guarda" :locale="locale"
                        @focus="$event.originalTarget.select();" />
                    <small v-if="v.importUrgent.$errors.length" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
                </div>

                <div class="camp-preu-divisa camp-divisa">
                    <Dropdown ref="divisaDropdown" v-model="state.divisaSeleccionada" 
                        :options="$divisesDisponibles" optionLabel="label" optionValue="key"
                        :class="{ 'p-invalid': v.divisaSeleccionada.$errors.length }"
                        style="width: 95px;"/>
                    <small v-if="v.divisaSeleccionada.$errors.length" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
                </div>
            </div>
        </div>

        <div class="break" />
        <div style="margin-left: auto; margin-right: 0; margin-top:10px; float: right;">
            <ButtonShortcut tabindex="-1" :literal="$t('App.Cancela')" icon="fa-solid fa-undo" :shortcut="'[Esc]'" class="p-button-secondary p-button-sm" @click="hide" style="margin-left: 10px;" />
            <ButtonShortcut @click="guarda" :literal="$t('App.Desa')" icon="fa-solid fa-save" :shortcut="'[Enter]'" style="margin-left: 10px;"/>
        </div>
    </Dialog>
</template>

<script>
import { ref, onMounted, nextTick, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import AlbaraService from '@/services/albara.service';

export default {
    name: 'ModalMarcarEditarUrgent',
    props: {
        carregat: Boolean,
        albara: { type: Object, default: null },
    },
    emits: ['update:carregat', 'marcat'],
    setup(props, { emit }) {
        const { locale } = useI18n();

        const albaraRef = computed(() => {
            if (!props.albara) return null;
            return props.albara?.id ?? props.albara;
        });

        const urgentActual = ref(null);

        const teUrgent = computed(() => {
            return !!urgentActual.value?.costEnviamentExpress || !!props.albara?.isUrgent || !!(props.albara?.motiusUrgent || []).length;
        });

        const esEdicio = computed(() => {
            if (!props.albara) return false;
            return teUrgent.value || !!props.albara.isUrgent || !!(props.albara.motiusUrgent || []).length ||
                props.albara.comentarisUrgent != null || props.albara.impUrgent != null;
        });

        const state = reactive({
            motiuSeleccionat: null,
            detallMotiuText: '',
            divisaSeleccionada: null,
            importUrgent: null,
        });

        const rules = {
            motiuSeleccionat: { required },
            importUrgent: { required },
            divisaSeleccionada: { required }
        };
        const v = useVuelidate(rules, state);

        const guardant = ref(false);
        const motiuDropdown = ref(null);

        const carregarUrgent = async () => {
            if (!albaraRef.value) return;

            const resposta = await AlbaraService.obtenirAlbaraUrgent(albaraRef.value);
            state.motiuSeleccionat = resposta.costEnviamentExpress.motiu ?? null;
            state.detallMotiuText = resposta.costEnviamentExpress.detallMotiu ?? '';
            state.divisaSeleccionada = resposta.costEnviamentExpress.divisa ?? null;
            state.importUrgent = resposta.costEnviamentExpress.imp ?? null;
        };

        onMounted(async () => {
            document.addEventListener("keydown", handler);
            await carregarUrgent();

            nextTick(() => {
                setTimeout(() => {
                    motiuDropdown.value?.$el.firstChild.focus();
                }, 100);
            });
        });

        const hide = () => {
            emit('update:carregat', false);
        };

        const desmarcar = async () => {
            if (!albaraRef.value) return;
            guardant.value = true;
            try {
                await AlbaraService.desmarcarAlbaraUrgent(albaraRef.value);
                emit('marcat', {
                    isUrgent: false,
                    motiusUrgent: [],
                    motiu: null,
                    detallMotiu: null,
                    divisa: null,
                    imp: null,
                });
                hide();
            } catch (e) {
                console.error(e);
            } finally {
                guardant.value = false;
            }
        };

        const guarda = async () => {
            v.value.$reset();
            const valid = await v.value.$validate();
            if (!valid) return;

            guardant.value = true;
            try {
                const payload = {
                    motiu: state.motiuSeleccionat,
                    detallMotiu: state.detallMotiuText.trim() || null,
                    divisa: state.divisaSeleccionada ?? null,
                    imp: state.importUrgent ?? null,
                };
                await AlbaraService.marcarAlbaraUrgent(albaraRef.value, payload, true);
                emit('marcat', {
                    isUrgent: true,
                    motiusUrgent: [payload.motiu],
                    motiu: payload.motiu,
                    detallMotiu: payload.detallMotiu,
                    divisa: payload.divisa,
                    imp: payload.imp,
                });
                hide();
            } catch (e) {
                console.error(e);
            } finally {
                guardant.value = false;
            }
        };

        const handler = (key) => {
            if (key.key === 'Enter')
                guarda();
        }

        return {
            locale,
            state,
            v,
            guardant,
            guarda,
            hide,
            desmarcar,
            motiuDropdown,
            esEdicio,
            teUrgent,
            albaraRef,
        };
    },
};
</script>

<style scoped>
.camp-altres { margin-top: 0.5rem; }
.form {
    margin-top: 2px;
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px 30px;
  }

  .element-form > label {
    display: block;
  }

  .element-form > small {
    display: block;
  }

  .fila-preu-divisa {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
  }

  .camp-preu-divisa {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .camp-divisa {
    flex-shrink: 0;
  }

  .break {
    flex-basis: 100%;
    height: 0;
  }

  .ellipsis {
    display: inline-block;
    max-width: 270px; /* ajusta según necesidad */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .input-lectura {
    background-color: #f0f0f0 !important;
    color: #6c6c6c;
    cursor: text; /* sigue mostrando que se puede seleccionar */
  }
</style>