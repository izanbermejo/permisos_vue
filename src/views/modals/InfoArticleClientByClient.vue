<template>
    <DetallOrdresFabricacio v-if="visibleDialogDetallOF" :carregat="visibleDialogDetallOF"
    @update:carregat="visibleDialogDetallOF = $event;" :articleClient="props.articleClient" :artInt="infoArtiClient.artInt" :cliCod="infoArtiClient.codiClient" :fabrica="props.fabrica" />
    <Dialog v-model:visible="visible" modal @hide="hide" style="width: 750px;">
        <template #header>
            <div style="display: flex; justify-content: flex-start; align-items: center;">
                <h4>{{ $t('Comandes.Informacio article client') }}</h4>
                <div style="display: flex; gap: 8px; margin-bottom: 10px; margin-left: 40px;">
                    <Button :label="$t('ModalAjudaArticleClient.Trasabilitat')" icon="pi pi-list" style="height: 30px; width: auto;" @click="descarregaTrasabilitat"/>
                    <Button :label="$t('ModalAjudaArticleClient.Localitzacio')" icon="pi pi-map-marker" style="height:30px; width:auto;" @click="descarregaLocalitzacio"/>
                    <Button :label="$t('ModalAjudaArticleClient.Detall OF')" icon="pi pi-eye" style="height:30px; width:auto;" @click="detallOF"/>
                </div>
            </div>
        </template>
        <div class="comanda-lista">
            <div class="comanda-item">
                <div class="comanda-lado izquierdo">
                    <div>
                        <strong>{{ $t('Comandes.Delegat') }}:</strong>
                        {{ infoArtiClient?.delegat }}
                    </div>
                    <div>
                        <strong>{{ $t('Comandes.Planificador de fabrica') }}:</strong>
                        {{ infoArtiClient?.planFabrica || '-' }}
                    </div>
                    <div>
                        <strong>{{ $t('Comandes.Responsable Logistica') }}:</strong>
                        {{ infoArtiClient?.respLogistica || '-' }}
                    </div>
                </div>
                <div class="comanda-lado derecho">
                    <div>
                        <strong>{{ $t('Comandes.Representant') }}:</strong>
                        {{ infoArtiClient?.representant || '-' }}
                    </div>
                    <div>
                        <strong>{{ $t('Comandes.Pes Final') }}:</strong>
                        {{ infoArtiClient?.pesFinal !== undefined && infoArtiClient?.pesFinal !== null ? $n(infoArtiClient?.pesFinal) + ' gr' : '-' }}
                    </div>
                </div>
                <div class="partida-larga full-width">
                    <strong>{{ $t('Comandes.Partida Aranzel') }}:</strong>
                    {{ infoArtiClient?.partAranzel || '-' }}
                </div>
            </div>
            <div class="card">
                <h5 class="card-header">
                    {{ $t('Comandes. Condicions Preu Actual') }}
                </h5>
                <div style="display: flex; flex-wrap: wrap; justify-content: space-between; padding: 12px;">
                    <div class="comanda-lado">
                        <div>
                            <strong>{{ $t('Comandes.Preu Fitxa') }}:</strong>
                            {{ (infoArtiClient?.preu !== undefined && infoArtiClient?.preu !== null ? $n(infoArtiClient?.preu) : '-') + ' ' +
                            (infoArtiClient?.divisa ?? '') }}
                        </div>
                        <div>
                            <strong>{{ $t('Comandes.Qty') }}:</strong>
                            {{ (infoArtiClient?.aclQPre !== undefined && infoArtiClient?.aclQPre !== null ? $n(infoArtiClient?.aclQPre) : '-') + ' ' +
                            (infoArtiClient?.aclPer ?? '') }}
                        </div>
                        <div>
                            <strong>{{ $t('Comandes.Data Aplicacio') }}: </strong>
                            <span v-if="infoArtiClient?.dataAplicacio">{{ $d($toDate(infoArtiClient?.dataAplicacio), 'short') }}</span>
                            <span v-else>-</span>
                        </div>
                    </div>
                    <div class="comanda-lado">
                        <div>
                            <strong>{{ $t('Comandes.IndPbaseMat') }}:</strong>
                            {{ [infoArtiClient?.aclInd ?? '-', infoArtiClient?.preuBase ?? '-', infoArtiClient?.mat ?? '-'].join(' / ') }}
                        </div>
                        <div>
                            <strong>{{ $t('Comandes.Cost') }}:</strong>
                            {{ infoArtiClient?.cost !== undefined && infoArtiClient?.cost !== null ? $n(infoArtiClient?.cost) + ' €' : '-' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';
import ComandesService from '@/services/comandes.service';
import MagatzemService from '@/services/magatzem.service';
import { carrega } from '@/services/loader';
import { saveAs } from 'file-saver';
import DetallOrdresFabricacio from '@/components/ordresFabricacio/DetallOrdreFabricacio.vue';

export default {
    name: 'InfoArticleClientByClient',
    props: {
        articleClient: String,
        fabrica: String
    },
    components: { DetallOrdresFabricacio },
    setup(props, { emit }) {
        const visible = ref(true);
        const infoArtiClient = ref();
        const { t } = useI18n();
        const visibleDialogDetallOF = ref(false);

        const hide = () => {
            emit('update:carregat', false);
        }

        const detallOF = () => {
            visibleDialogDetallOF.value = true;
            emit('veureDetallOF', props.articleClient);
        }

        const descarregaTrasabilitat = async () => {
            const resp = await carrega(MagatzemService.reportTrasabilitat(infoArtiClient.value.artInt, infoArtiClient.value.codiClient));
            saveAs(new Blob([resp]), `${ t('ModalAjudaArticleClient.Trasabilitat') + props.articleClient}.xls`);
        }

        const descarregaLocalitzacio = async () => {
            const resp = await carrega(MagatzemService.reportLocalitzacio(infoArtiClient.value.artInt, infoArtiClient.value.codiClient));
            saveAs(new Blob([resp]), `${ t('ModalAjudaArticleClient.Localitzacio') + props.articleClient}.xls`);
        }

        onMounted(async () => {
            infoArtiClient.value = await carrega(ComandesService.getInfoArticleClient(props.articleClient));
        });

        return {
            emit,
            visible,
            t,
            hide,
            infoArtiClient,
            descarregaTrasabilitat,
            descarregaLocalitzacio,
            detallOF,
            visibleDialogDetallOF,
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