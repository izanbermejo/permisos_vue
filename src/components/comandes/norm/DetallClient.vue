<template>
  <div style="min-width: 100px; overflow-x: auto; white-space: nowrap;">
    <div v-if="refClient" class="flex-container">
      <span> 
        <label class="label-detall"> {{ `${$t('Comandes.Empresa')}: ` }} </label>
        {{ `${refClient.empresa} • ${$t(`Empreses.${refClient.empresa}`)}` }}
      </span>
      <span> 
        <label class="label-detall"> {{ `${$t('Comandes.Adresa')}: ` }} </label>
        {{ refClient.adresaEnviament ? refClient.adresaEnviament.adresa : refClient.adresa.adresa }}
      </span>
      <span> 
        <label class="label-detall"> {{ `${$t('Comandes.Poblacio')}: ` }} </label>
        {{ refClient.adresaEnviament ? refClient.adresaEnviament.poblacio : refClient.adresa.poblacio }}
      </span>
      <span> 
        <label class="label-detall"> {{ `${$t('Comandes.Codi postal')}: ` }} </label>
        {{ refClient.adresaEnviament ? refClient.adresaEnviament.codiPostal : refClient.adresa.codiPostal }}
      </span>
      <div class="break" />
      <span> 
        <label class="label-detall"> {{ `${$t('Comandes.Enviament')}: ` }} </label>
        {{ `${$t(`FormaEnviament.${refClient.formaEnviament}`)} • ${refClient.incoterm} • ${$destiTransport(refClient.desti)}` }}
      </span>
      <span v-if="refClient.diesTransitClient"> 
        <label class="label-detall"> {{ `${$t('Comandes.Dies transit')}:` }} </label>  
        {{ `${refClient.diesTransitClient}` }}
      </span> 
      <span v-if="refClient.diesSortida.trim()">
        <label class="label-detall"> {{ `${$t('Comandes.Dies recollida')}: ` }} </label>
        <InformacioDiesTransitClient :diesServei="refClient.diesSortida" />
      </span>
      <div class="break" />
      <span> 
        <label class="label-detall"> {{ `${$t('Comandes.Transportista')}:` }} </label>  
        {{ $transportista(refClient.codiTransportista) }}
      </span>
      <span> 
        <label class="label-detall"> {{ `${$t('Comandes.PaisRegio')}:` }} </label>  
        {{ refClient.adresaEnviament ? $pais(refClient.adresaEnviament.pais) : $pais(refClient.adresa.pais) }}
      </span>
      <span> 
        <label class="label-detall"> {{ `${$t('Comandes.Zona transport')}:` }} </label>  
        {{ refClient.zonaTransport ? `${refClient.zonaTransport.codi} - ${refClient.zonaTransport.nom}` : '-' }}
      </span>
      <div class="comments-section" @dblclick="emit('showNotesClient')">
        <label class="label-detall comments-label">{{ `${$t('Comandes.Comentaris client')}:` }}</label>
        <span class="comments-field" v-text="refClient.notesClient"></span>
      </div>
      <div class="comments-section" @dblclick="emit('showNotesLogistica')">
        <label class="label-detall comments-label">{{ `${$t('Comandes.Comentaris log')}:` }}</label>
        <span class="comments-field" v-text="refClient.notesLogistica"></span>
      </div>
      <div v-if="refClient.notesMorositat" class="comments-section comments-morositat" @dblclick="emit('showNotesMorositat')">
        <label class="label-detall comments-label">{{ `${$t('Comandes.Morositat')}:` }}</label>
        <span class="comments-field comments-field-morositat " v-text="refClient.notesMorositat"></span>
      </div>
    </div>
  </div>
</template>

<script>
import { toRef } from 'vue';
import InformacioDiesTransitClient from '@/components/InformacioDiesTransitClient.vue'

export default {
  name : 'DetallClient',
  props : {
    client : Object,
  },
  components : {
    InformacioDiesTransitClient,
  },
  setup(props, {emit} ) {
    const refClient = toRef(props, 'client');

    // Método para truncar el texto a los primeros 100 caracteres (ajustable)
    const truncatedComment = (comment) => {
      const maxLength = 100; // Número máximo de caracteres a mostrar
      return comment ? comment.slice(0, maxLength) + (comment.length > maxLength ? '...' : '') : '';
    };

    return {
      props,
      emit,
      refClient,
      truncatedComment,
    }

  }
}
</script>

<style scoped>
.flex-container {
  padding: 5px 10px; 
  display: flex;
  gap: 20px;
  row-gap: 5px;
  flex-wrap: wrap;
}

.label-detall { 
  font-weight: 600;
  font-size: 1rem;
}

.break {
  flex-basis: 100%;
  height: 0;
}

.comments-section {
  display: flex; /* Usamos flexbox para alinear los elementos */
  align-items: center; /* Alineación vertical centrada */
  width: 100%;
  padding: 5px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.comments-morositat {
  border: 1px solid #ff5353;
  background-color: #ff9393;
}

.comments-label {
  color: #333;
  margin-right: 10px; /* Separación entre el label y el campo de texto */
  flex-shrink: 0; /* Evita que el label se encoja */
}

.comments-field {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  flex-grow: 1; /* Esto hace que el campo de texto ocupe el resto del espacio disponible */
  font-size: 1rem;
  min-height: 35px; /* Asegura que el campo tenga una altura mínima cuando no haya contenido */
}

.comments-field-morositat {
  border: 1px solid #ff5353;
  background-color: #f9f9f9;
  color: #555;
}

</style>