<template>
    <Dialog v-model:visible="visible" modal @hide="hide" style="width: 750px;">
        <template #header>
            <div style="display: flex; justify-content: flex-start; align-items: center;">
                <h4>{{ $t('Comandes.Informacio article client') }}</h4>
            </div>
        </template>
        <div class="comanda-lista">
            <div class="comanda-item">
                <div class="comanda-lado izquierdo">
                    <div>
                        <strong>{{ $t('Comandes.Delegat') }}:</strong>
                        {{ infoClient?.delegat }}
                    </div>
                </div>
                <div class="comanda-lado derecho">
                    <div>
                        <strong>{{ $t('Comandes.Representant') }}:</strong>
                        {{ infoClient?.representant || '-' }}
                    </div>
                </div>
                <div class="partida-larga full-width">
                    <strong>{{ $t('Comandes.Responsable Logistica') }}:</strong>
                    {{ infoClient?.respLogistica || '-' }}
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';
import ComandesService from '@/services/comandes.service';
import { carrega } from '@/services/loader';

export default {
    name: 'InfoGeneralClient',
    props: {
        clicod: String,
    },
    components: {},
    setup(props, { emit }) {
        const visible = ref(true);
        const infoClient = ref();
        const { t } = useI18n();

        const hide = () => {
            emit('update:carregat', false);
        }

        onMounted(async () => {
            infoClient.value = await carrega(ComandesService.getInfoGeneralClient(props.clicod));
        });

        return {
            emit,
            visible,
            t,
            hide,
            infoClient,
            props
        };
    }
};
</script>
<style scoped>
.comanda-lista {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.comanda-item {
    display: flex;
    flex-wrap: wrap;
    /* <-- NUEVO: permite que los bloques pasen a la siguiente línea */
    justify-content: space-between;
    border: 1px solid #ccc;
    padding: 12px;
    border-radius: 6px;
    background-color: #fafafa;
}


.comanda-lado {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-left: 5px;
    margin-right: 5px;
}

.partida-larga {
    word-break: break-word;
    white-space: normal;
}

.full-width {
    width: 100%;
    margin-top: 5px;
    word-break: break-word;
    white-space: normal;
    margin-left: 5px;
}
</style>