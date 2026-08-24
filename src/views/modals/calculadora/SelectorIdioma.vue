<template>
  <div class="contenedor-principal">
    <!-- Sección de idioma -->
    <div class="seccion">
      <div>
        <span class="label-detall">{{$t('App.Idioma')}}:</span>
      </div>
      <div class="botonera">
        <div class="boton-imagen" :class="{'boton-imagen-actiu': idiomaRef==CATALA}" @click="emit('update:idioma', CATALA)"> 
          <img :src="require('@/assets/ca-ES_32.png')" />
        </div>
        <div class="boton-imagen" :class="{'boton-imagen-actiu': idiomaRef==CASTELLA}" @click="emit('update:idioma', CASTELLA)"> 
          <img :src="require('@/assets/es-ES_32.png')" />
        </div>
        <div class="boton-imagen" :class="{'boton-imagen-actiu': idiomaRef==ANGLES}" @click="emit('update:idioma', ANGLES)"> 
          <img :src="require('@/assets/en-US_32.png')" />
        </div>
        <div class="boton-imagen" :class="{'boton-imagen-actiu': idiomaRef==ALEMANY}" @click="emit('update:idioma', ALEMANY)"> 
          <img :src="require('@/assets/de-DE_32.png')" />
        </div>
        <div class="boton-imagen" :class="{'boton-imagen-actiu': idiomaRef==FRANCES}" @click="emit('update:idioma', FRANCES)"> 
          <img :src="require('@/assets/fr-FR_32.png')" />
        </div>
        <div class="boton-imagen" :class="{'boton-imagen-actiu': idiomaRef==ITALIA}" @click="emit('update:idioma', ITALIA)"> 
          <img :src="require('@/assets/it-IT_32.png')" />
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import { toRef } from 'vue';

  export default {
    name : 'DetallClient',
    props : {
      idioma : String,
    },
    setup(props, {emit} ) {
        const CATALA = "ca";
        const CASTELLA = "es";
        const ANGLES = "en";
        const FRANCES = "fr";
        const ALEMANY = "de";
        const ITALIA = "it";

        const idiomaRef = toRef(props, 'idioma');

      return {
        emit,
        idiomaRef,
        CATALA, CASTELLA, ANGLES, FRANCES, ALEMANY, ITALIA,
      }
  
    }
  }
  </script>
  <style scoped>
  .label-detall { 
    font-weight: 600;
    font-size: 1rem;
  }

  .contenedor-principal {
    display: flex;
    justify-content: flex-start; /* Alinea las secciones en fila */
    gap: 40px; /* Espacio entre las secciones */
    align-items: flex-start; /* Alinea los elementos en la parte superior */
  }

  .seccion {
    display: flex;
    flex-direction: column; /* Hace que el label y la botonera estén en columna (uno debajo del otro) */
    gap: 2px; /* Espacio entre el label y la botonera */
  }

  .botonera {
    display: flex;
    gap: 10px; /* Espacio entre los botones de idioma o formato numérico */
  }

  .boton-imagen {
    display: inline-block; /* Hacerlo inline para que no ocupe toda la línea */
    padding: 5px 5px;
    border-radius: 6px;
    border: 1px solid #B0B0B0;
    cursor: pointer; /* Cursor de mano para simular un botón */
    transition: background-color 0.3s; /* Transición suave al pasar el mouse */
  }

  .boton-imagen img {
    width: 24px;
    height: 24px;
  }

  .boton-imagen:hover {
    background-color: #c9eeb9;
  }

  .boton-imagen-actiu {
    background-color: #93c47d;
  }

  .boton-imagen-actiu:hover {
    background-color:  #93c47d;
  }
</style>