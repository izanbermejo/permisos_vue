<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true" :draggable="false"
    style="width: 700px">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ titol }}</span>
      </div>
    </template>
    <div class="form" style="margin-top: 5px;">
      <div class="element-form">
        <a style="cursor: pointer; color: #2196f3; text-decoration: underline;" @click="previsualitzarJustificant">
          <i class="pi pi-file-pdf"></i>
          {{ $t('Comandes.Previsualitzar justificant') }}
        </a>  
      </div>
      <div class="element-form">
        <label>{{ $t('Comandes.Destinatari')}}</label>
          <span>
            <InputText v-model="informacio.to" disabled style="width: 650px" />
          </span>
      </div>
      <div class="element-form">
        <label>{{ $t('Comandes.Copia')}}</label>
          <span>
            <InputText v-model="informacio.cc" disabled style="width: 650px" />
          </span>
      </div>
      <div class="element-form">
        <label>{{ $t('Comandes.Assumpte')}}</label>
          <span>
            <InputText v-model="informacio.assumpte" disabled style="width: 650px"/>
          </span>
      </div>
      <div class="break" />
      <div class="element-form">
        <label>{{$t('Comandes.Missatge')}}</label>
          <span>
            <Textarea v-model="informacio.missatge" disabled rows="9" cols="75" />
          </span>
      </div>
      <div class="element-form" style="width: 100%;" v-if="informacio.adjunts.length">
        <label>{{$t('Comandes.Adjunts')}}</label>
        <div class="drag-drop-container">
          <div class="chips-container">
            <div v-for="(file, index) in informacio.adjunts" :key="index" class="chip">
              <span class="chip-text">{{ file }}</span>
            </div>
          </div>
        </div>
      </div>
    </div> 
  </Dialog>
</template>

<script>
import { carrega } from '@/services/loader';
import { ref, toRef, computed, inject } from 'vue';
import ComandesService from '@/services/comandes.service';
import { obrirPdfNovaPestanya } from '@/utils/pdfUtils';
import { useI18n } from 'vue-i18n';

export default {
name: 'DetallJustificantEnviat',
components: {
},
props: {
  comanda: Object,
},
setup(props, { emit }) {
  const { t, d } = useI18n();
  const toDate = inject('toDate');
  const visible = ref(true);
  const refComanda = toRef(props, 'comanda');
  const informacio = computed(() => refComanda.value.dadesEnviamentJustificant);

  const hide = () => {
    emit('update:carregat', false);
  }

  const titol = computed(() => t('Comandes.Enviat justificant', [d(toDate(informacio.value.data), 'long'), informacio.value.usuari]));

  const previsualitzarJustificant = async () => {
    let resp = await carrega(ComandesService.obtenirJustificantEnviat(props.comanda.comanda));
    obrirPdfNovaPestanya(resp, `${t('Comandes.Justificant')}_${props.comanda.comanda}`);
  }

  return {
  visible,
  props,
  refComanda,
  informacio,
  titol,
  hide,
  previsualitzarJustificant,
  }
},
}
</script>

<style scoped>
.form {
  margin-top: 2px;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px 30px;
}

.element-form > label {
  display: block;
  font-weight: 600;
  font-size: 1rem;
}

.element-form > small {
  display: block;
}

.break {
  flex-basis: 100%;
  height: 0;
}

.p-component:disabled {
  opacity: 1;
  background-color: #95959526;
}

/* Contenedor principal que ocupa el 100% del contenedor con borde de línea discontinua */
.drag-drop-container {
  width: 100%; /* Asegura que ocupe el 100% del ancho disponible */
  border: 2px dashed #ccc; /* Borde de línea discontinua gris claro */
  padding: 4px 8px;
  box-sizing: border-box; /* Incluye el padding dentro del cálculo del tamaño */
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Alineación flexible de los chips a la izquierda */
  justify-content: flex-start;
  position: relative; /* Para poder usar un input en una posición absoluta si es necesario */
  overflow: auto; /* Permite el desplazamiento si los chips exceden el tamaño del contenedor */
  background-color: #f9f9f9; /* Fondo gris claro */
}

/* Estilo para el contenedor de los chips */
.chips-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 100%; /* El contenedor de los chips ocupa todo el ancho disponible */
}

/* Estilos para cada chip */
.chip {
  background-color: #e0e0e0; /* Color grisáceo claro para el chip */
  color: #333; /* Color de texto más oscuro */
  padding: 5px 7px;
  margin: 5px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* Texto dentro del chip */
.chip-text {
  font-size: 14px;
  text-align: left;
}
</style>