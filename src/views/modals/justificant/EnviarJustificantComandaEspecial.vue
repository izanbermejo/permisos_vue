<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true" :draggable="true"
    style="width: 700px">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('Comandes.Previsualitzar justificant') }}</span>
      </div>
    </template>
    <div class="form" style="margin-top: 5px;">
      <div class="element-form">
        <label>{{ $t('Comandes.Destinatari')}}</label>
          <span>
            <InputText ref="inputTo" v-model="state.to"  
                  @focus="$event.originalTarget.select()"
                  style="width: 650px"
                  :class="{ 'p-invalid' : v.to.$errors.length }" />
          </span>
          <small v-if="(v.to.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>
      <div class="element-form">
        <label>{{ $t('Comandes.Copia')}}</label>
          <span>
            <InputText v-model="state.cc"  
                  @focus="$event.originalTarget.select()"
                  style="width: 650px" />
          </span>
      </div>
      <div class="element-form">
        <label>{{ $t('Comandes.Assumpte')}}</label>
          <span>
            <InputText v-model="state.assumpte"  
                  @focus="$event.originalTarget.select()"
                  style="width: 650px"
                  :class="{ 'p-invalid' : v.assumpte.$errors.length }" />
          </span>
          <small v-if="(v.assumpte.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>
    </div>
    <SelectorIdiomaFormat style="margin-top: 5px;"
      :idioma="state.idioma" @update:idioma="state.idioma = $event"
      :formatNumeric="state.formatNumeric" @update:formatNumeric="state.formatNumeric = $event" />
    <div class="form" style="margin-top: 5px;">
      <div class="element-form">
        <label>{{$t('Comandes.Tipus')}}:</label>
          <span>
            <SelectButton v-model="state.tipus" :options="optionsTipus" optionValue="clau" optionLabel="valor" />
          </span>
      </div>
      <div class="element-form" style="align-self: flex-end; margin-left: auto; margin-bottom: 10px; margin-right: 20px;">
        <a style="cursor: pointer; color: #2196f3; text-decoration: underline;" @click="previsualitzarJustificant">
          {{ $t('Comandes.Previsualitzar justificant') }}
        </a>  
      </div>
      <div class="break" />
      <div class="element-form">
        <span>
          <label>{{$t('Comandes.Missatge')}}</label>
          &nbsp;
          <a style="cursor: pointer; color: #2196f3; text-decoration: underline;" @click="missatgeEstandard">
            {{ `(${$t('Comandes.Enganxa missatge estandard')})` }}
          </a> 
          -
          <a style="cursor: pointer; color: #2196f3; text-decoration: underline;" @click="missatgeMinim">
            {{ `(${$t('Comandes.Enganxa missatge especial')})` }}
          </a> 
        </span>
          <span>
            <Textarea v-model="state.missatge" rows="10" cols="75" />
          </span>
      </div>
      <div class="element-form" style="width: 100%;">
        <label>{{$t('Comandes.Adjunts')}}</label>
        <div class="drag-drop-container" @dragover.prevent @drop="handleDrop"  @click="openFileInput">
          <div class="chips-container">
            <div v-for="(file, index) in fileList" :key="index" class="chip">
              <button class="chip-remove" @click="removeFile(index)">x</button>
              <span class="chip-text">{{ file.name }}</span>
            </div>
          </div>
          <div class="container-instruccions" v-if="fileList.length == 0">
            <i class="pi pi-cloud-upload" style="font-size: 1.75rem"></i>
            <span class="file-msg">{{ $t('Comandes.Instruccions pujar') }}</span>
          </div>
          <input ref="fileInput" type="file" @change="handleFileChange" multiple class="file-input" />
        </div>
      </div>
      <div class="break" />
    </div>
    <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
      <Button @click="enviaJustificant" :label="$t('App.Envia')" icon="pi pi-send" class="p-button-sm" style="margin-left: 10px;"/>
    </div>
  </Dialog>
</template>

<script>
import { carrega } from '@/services/loader';
import { ref, reactive, toRef, onMounted } from 'vue';
import ComandesService from '@/services/comandes.service';
import { obrirPdfNovaPestanya } from '@/utils/pdfUtils';
import SelectorIdiomaFormat from './SelectorIdiomaFormat.vue';
import { useI18n } from 'vue-i18n';
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import * as MissatgesContants from "./MissatgesJustificantConstants.js";
import { email } from '@/keycloak/keycloak';

export default {
name: 'EnviarJustificantComandaEspecial',
components: {
  SelectorIdiomaFormat,
},
props: {
  comanda: Object,
  client : Object,
  comandaClient : String,
},
setup(props, { emit }) {
  const { t } = useI18n();
  const visible = ref(true);
  const fileInput = ref();
  const fileList = ref([]);
  const refComanda = toRef(props, 'comanda');

  const state = reactive({
    to: props.client.email ?? '',
    cc: email(),
    assumpte: `Order: ${props.comandaClient}`,
    missatge: '',
    idioma : props.client.idioma,
    tipus : undefined,
    formatNumeric : '',
  });

  const rules = {
      to: { required },
      assumpte: { required },
    }
  const v = useVuelidate(rules, state);

  onMounted(() => {
    missatgeEstandard();
  })

  const hide = () => {
    emit('update:carregat', false);
  }

  const handleFileChange = (event) => {
    const files = event.target.files;
    fileList.value = [...fileList.value, ...Array.from(files)];
  };

  const missatgeEstandard = () => {
    let missatge;
    switch(state.idioma) {
      case 'ca': missatge = MissatgesContants.MISSATGE_STANDARD_CATALA;
                 break;
      case 'es': missatge = MissatgesContants.MISSATGE_STANDARD_CASTELLA;
                 break;
      case 'de': missatge = MissatgesContants.MISSATGE_STANDARD_ALEMANY;
                 break;
      case 'fr': missatge = MissatgesContants.MISSATGE_STANDARD_FRANCES;
                 break;
      case 'it': missatge = MissatgesContants.MISSATGE_STANDARD_ITALIA;
                 break;
      default  : missatge = MissatgesContants.MISSATGE_STANDARD_ANGLES;
                 break;
    }
    state.missatge = missatge.replace('{descompte}', '');
  }

  const missatgeMinim = () => {
    switch(state.idioma) {
      case 'ca': state.missatge = MissatgesContants.MISSATGE_ESPECIAL_CATALA; 
                 break;
      case 'es': state.missatge = MissatgesContants.MISSATGE_ESPECIAL_CASTELLA; 
                 break;
      case 'de': state.missatge = MissatgesContants.MISSATGE_ESPECIAL_ALEMANY; 
                 break;
      case 'fr': state.missatge = MissatgesContants.MISSATGE_ESPECIAL_FRANCES; 
                 break;
      case 'it': state.missatge = MissatgesContants.MISSATGE_ESPECIAL_ITALIA; 
                 break;
      default  : state.missatge = MissatgesContants.MISSATGE_ESPECIAL_ANGLES; 
                 break;
    }
  }

  const removeFile = (index) => {
    event.stopPropagation(); // Detiene la propagación del clic
    fileList.value.splice(index, 1);
  };

  const openFileInput = () => {
    fileInput.value.click();
  }

  const handleDrop = (event) => {
    // Prevent default behavior (Prevent file from being opened)
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      fileList.value = [...fileList.value, ...Array.from(files)];
    }
  };

  const enviaJustificant = async () => {
    // Validació
    v.value.$reset();
    await v.value.$validate();
    if (!v.value.$error) {
      await(carrega(ComandesService.enviarJustificantEspecial(refComanda.value, state, fileList.value)));
      hide();
      emit('justificantEnviat');
    }
  }

  const previsualitzarJustificant = async () => {
    let resp = await carrega(ComandesService.generarJustificantEspecial(refComanda.value, state.idioma, state.formatNumeric, state.tipus));
    obrirPdfNovaPestanya(resp, `${t('Comandes.Justificant')}_${props.comandaClient}_${state.idioma}`);
  }

  return {
  visible,
  props,
  hide,
  previsualitzarJustificant,
  enviaJustificant,
  state,
  v,
  missatgeEstandard,
  missatgeMinim,
  fileInput,
  openFileInput,
  fileList,
  handleFileChange,
  removeFile,
  handleDrop,
  optionsTipus: [
      {clau: undefined, valor: t('App.Totes')},
      {clau: 'FERM', valor: t('Comandes.Ferm')},
      {clau: 'ORIENTATIU', valor: t('Comandes.Orientatiu')},
    ],
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

.element-form > span > label {
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

/* Contenedor principal que ocupa el 100% del contenedor con borde de línea discontinua */
.drag-drop-container {
  cursor: pointer;
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

/* Estilos para el botón de eliminación (la X) */
.chip-remove {
  background-color: #ff5c5c; /* Fondo rojo para la X */
  color: white;
  font-size: 16px;
  width: 20px; /* Tamaño del círculo */
  height: 20px; /* Tamaño del círculo */
  border-radius: 50%; /* Hacerlo circular */
  border: none;
  display: flex;
  align-items: center;
  justify-content: center; /* Centrar la X dentro del círculo */
  cursor: pointer;
  margin-right: 10px; /* Separar la X del texto */
  font-weight: bold;
}

.chip-remove:hover {
  background-color: #e60000; /* Color más oscuro al pasar el ratón */
}

/* Estilo para el input de tipo file, visualmente oculto */
.file-input {
  display: none; /* Ocultar el input de archivos */
}

.container-instruccions {
  width: 100%;
  max-width: 100%;
  display: flex;
  justify-content: center;  /* Centra horizontalmente */
  align-items: center;      /* Centra verticalmente */
}

/* Mensaje de instrucciones para drag and drop */
.file-msg {
  margin-left: 10px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>