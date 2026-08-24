<template>
  <div class="card" style="margin-top: 10px;">
  <h6 class="card-header" style="font-weight: 600;">
    {{ $t('Comandes.Adresa desti client') }}
  </h6>
  <div class="card-body">
    <div style="margin: -10px;">
      <div class="flex-container">
        <span> 
          <label class="label-detall"> {{ `${$t('Comandes.Nom')}: ` }} </label>
          {{ refClient.adresaEnviament ? refClient.adresaEnviament.destinatari : refClient.adresa.destinatari }}
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
            {{ refClient.zonaTransport ? `${refClient.zonaTransport.codi} - ${refClient.zonaTransport.nom}` : '' }}
          </span>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { toRef } from 'vue';

export default {
  name : 'CanviarAdresaDetallClient',
  props : {
    client : Object,
  },
  setup(props) {
    const refClient = toRef(props, 'client');

    return {
      refClient,
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
</style>