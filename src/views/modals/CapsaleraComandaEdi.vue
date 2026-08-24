<template>
    <div v-if="info" class="info-grid">
        <div class="info-cell">
            <label class="label-detall">{{ $t('Comandes.DenomNt') }}</label>
            <span v-tooltip="`${info.denominacio} / ${info.nivellTecnic}`">
                {{ info.denominacio }} / {{ info.nivellTecnic }}
            </span>
        </div>

        <div class="info-cell">
            <label class="label-detall">{{ $t('Comandes.Fabrica') }}</label>
            <span v-tooltip="`${info.fabrica}`">
                {{ info.fabrica }}
            </span>
        </div>

        <div class="info-cell">
            <label class="label-detall">{{ $t('Comandes.Emp fact') }}</label>
            <span>{{ info.empresaFacturacio }}</span>
        </div>

        <div class="info-cell">
            <label class="label-detall">{{ $t('Comandes.Embalatge') }}</label>
            <span v-tooltip="`${$n(info.unitatsEmbalatge)} x ${info.caixesPalet}`">
                {{ info.unitatsEmbalatge }} x {{ info.caixesPalet }}
            </span>
        </div>

        <div class="info-cell">
            <label class="label-detall">{{ $t('Comandes.Stock total') }}</label>
             <span>{{ info.stockTotal }}</span>
        </div>

        <div class="info-cell">
            <label class="label-detall">{{ $t('Comandes.Enviament') }}</label>
            <span v-tooltip="`${$t(`FormaEnviament.${info.formaEnviament}`)} • ${info.incoterm} • ${$destiTransport(info.desti)}`">
                {{ ` ${$t(`FormaEnviament.${info.formaEnviament}`)} • ${info.incoterm} • ${$destiTransport(info.desti)}` }}
            </span>
        </div>
    
        <div class="info-cell">
            <label class="label-detall"> {{ `${$t('Comandes.Transportista')}` }} </label>  
            <span v-tooltip="$transportista(info.transportista)">
                {{ ` ${$transportista(info.transportista)}` }}
            </span>
        </div>

        <div class="info-cell">
            <label class="label-detall"> {{ `${$t('Comandes.Dies transit')}` }} </label>  
                {{ `${info.diesTransit} `}}
            <InformacioDiesTransitClient :diesServei="info.diesSortida" />
        </div>

        <div v-if="props" class="info-cell">
            <label class="label-detall">{{ $t('Comandes.Missatge') }}</label>
            <span>{{ props.codiMissatge }}</span>
        </div>
        
         <div v-if="props" class="info-cell">                
            <label class="label-detall">{{ $t('Comandes.Estrategia') }}</label>
            <div class="estrategia-value">
                <span>{{ props.estrategia }}</span>
                <Button class="estrategia-info-button" icon="pi pi-info-circle" type="button" @click="toggleEstrategiaInfo"/>
            </div>
        </div>

         <div class="info-cell">            
            <label class="label-detall"> {{ `${labelMagatzem(1)}` }} </label>  
                <span v-tooltip="`${info.magatzemEntrada} - ${info.magatzemEntradaDesc}`">
                    {{ ` ${info.magatzemEntrada} - ${info.magatzemEntradaDesc}` }}
                </span>
        </div>

        <div class="info-cell">            
            <span v-if="info.magatzemEntrada != info.magatzemSortida">
                <label class="label-detall"> {{ `${labelMagatzem(2)}` }} </label>  
                <span v-tooltip="`${info.magatzemSortida} - ${info.magatzemSortidaDesc}`">
                    {{ ` ${info.magatzemSortida} - ${info.magatzemSortidaDesc}` }}
                </span>
            </span>
        </div>

        <Dialog v-model:visible="showEstrategiaInfo" modal :closable="true" :closeOnEscape="true" :draggable="false" style="width: 520px;">
            <template #header>
                <div style="width:100%; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size: 1rem; font-weight: 700;">{{ $t('Comandes.Estrategia') }} {{ props.estrategia }}</span>
                </div>
            </template>
            <div class="estrategia-info-text" style="white-space: pre-wrap; margin-top: 0.5rem;">
                {{ estrategiaInfo }}
            </div>
        </Dialog>

    </div>
</template>
<script>
import ediService from '@/services/edi.service';
import { carrega } from '@/services/loader';
import { ref, watch, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import InformacioDiesTransitClient from '@/components/InformacioDiesTransitClient.vue'

export default {
    name: 'CapsaleraComandaEdi',
    components: {
        InformacioDiesTransitClient
    },
    props: {
        artInt: String,
        cliCod: String,
        codiMissatge: Number,
        estrategia: Number,
        articleClient: String
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const info = ref(null);

        const carregaInfo = async () => {
            info.value = await carrega(ediService.ObtenirCapsaleraEDI(props.articleClient));
            console.log('CapsaleraComandaEdi - info carregada:', info.value);
            emit('infoCarregada', info.value);
        };

        // Recarrega si canvien article o client
        watch(() => [props.artInt, props.cliCod], ([newArt, newCli]) => {
            if (newArt && newCli) carregaInfo();
        });

        onMounted(() => {
            carregaInfo();
        });

        const showEstrategiaInfo = ref(false);

        const estrategiaInfo = computed(() => {
            switch (props.estrategia) {
                case 0:
                    return t('Comandes.Estrategia0');
                case 1:
                    return t('Comandes.Estrategia1');
                case 2:
                    return t('Comandes.Estrategia2');
                case 3:
                    return t('Comandes.Estrategia3');
                case 4:
                    return t('Comandes.Estrategia4');
                case 5:
                    return t('Comandes.Estrategia5');
                default:
                    return t('Comandes.EstrategiaDesconeguda');
            }
        });

        const labelMagatzem = (num) => {
            var numAdd = info.value?.magatzemEntrada !== info.value?.magatzemSortida ? num : '';
            return t('Comandes.Magatzem') + ' ' + numAdd;
        }

        const toggleEstrategiaInfo = () => {
            showEstrategiaInfo.value = !showEstrategiaInfo.value;
        };

        return {
            info,
            props,
            showEstrategiaInfo,
            estrategiaInfo,
            toggleEstrategiaInfo,
            labelMagatzem
        };
    },
};
</script>

<style scoped>
::v-deep(.p-panel-header) {
    padding: 0.5rem;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: auto;
    gap: 5px;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #fafafa;
    padding: 5px 0 10px 10px;
}

.info-cell {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.columnatitol {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 0;
    padding: 0;
}

.labeltitol {
    font-size: 12px;
    font-weight: 600;
    margin: 0;
    padding: 0;
    line-height: 1;
}

.texttitol {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
    padding: 0;
    line-height: 1;
}

.label-detall {
    font-weight: 600;
    font-size: 1rem;
}

.label-detall::after {
  content: ":\00a0";
}

.estrategia-value {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.estrategia-info-button {
    border: 1px solid #2196F3;
    background: #2196F3;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}

.estrategia-info-button:hover {
    background: #0D89EC;
}

.estrategia-info-box {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 0.75rem 1rem;
    margin-top: 0.25rem;
    white-space: pre-wrap;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.estrategia-info-title {
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.estrategia-info-text {
    font-size: 0.92rem;
    line-height: 1.45;
}
</style>