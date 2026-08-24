<template>
  <div class="contenedor-principal">
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
        <div class="boton-imagen" :class="{'boton-imagen-actiu': idiomaRef==XINES}" @click="emit('update:idioma', XINES)">
          <img :src="require('@/assets/zh-CN_32.png')" />
        </div>
      </div>
    </div>

    <div class="seccion">
      <div>
        <span class="label-detall">{{$t('App.Format numeric')}}:</span>
      </div>
      <div class="botonera">
        <div class="boton-imagen" :class="{'boton-imagen-actiu': formatNumericRef==PUNT_COMA}" @click="emit('update:formatNumeric', PUNT_COMA)">
          20.000,5
        </div>
        <div class="boton-imagen" :class="{'boton-imagen-actiu': formatNumericRef==COMA_PUNT}" @click="emit('update:formatNumeric', COMA_PUNT)">
          20,000.5
        </div>
        <div class="boton-imagen" :class="{'boton-imagen-actiu': formatNumericRef==ESPAI_COMA}" @click="emit('update:formatNumeric', ESPAI_COMA)">
          20 000,5
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, toRef, watch } from 'vue';

export default {
  name: 'SelectorIdiomaFormatAlbara',
  props: {
    idioma: String,
    formatNumeric: String,
  },
  setup(props, { emit }) {
    const CATALA = 'ca';
    const CASTELLA = 'es';
    const ANGLES = 'en';
    const FRANCES = 'fr';
    const ALEMANY = 'de';
    const ITALIA = 'it';
    const XINES = 'zh';
    const PUNT_COMA = 'PUNT_COMA';
    const COMA_PUNT = 'COMA_PUNT';
    const ESPAI_COMA = 'ESPAI_COMA';

    const idiomaRef = toRef(props, 'idioma');
    const formatNumericRef = toRef(props, 'formatNumeric');

    onMounted(() => {
      seleccioFormat();
    });

    watch(idiomaRef, () => {
      seleccioFormat();
    });

    const seleccioFormat = () => {
      if ([CATALA, CASTELLA, ALEMANY, ITALIA].includes(idiomaRef.value)) {
        emit('update:formatNumeric', PUNT_COMA);
      } else if ([FRANCES].includes(idiomaRef.value)) {
        emit('update:formatNumeric', ESPAI_COMA);
      } else {
        emit('update:formatNumeric', COMA_PUNT);
      }
    };

    return {
      emit,
      idiomaRef,
      formatNumericRef,
      CATALA, CASTELLA, ANGLES, FRANCES, ALEMANY, ITALIA, XINES,
      PUNT_COMA, COMA_PUNT, ESPAI_COMA,
    };
  },
};
</script>

<style scoped>
.label-detall {
  font-weight: 600;
  font-size: 1rem;
}

.contenedor-principal {
  display: flex;
  justify-content: flex-start;
  gap: 40px;
  align-items: flex-start;
}

.seccion {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.botonera {
  display: flex;
  gap: 10px;
}

.boton-imagen {
  display: inline-block;
  padding: 5px 5px;
  border-radius: 6px;
  border: 1px solid #B0B0B0;
  cursor: pointer;
  transition: background-color 0.3s;
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
  background-color: #93c47d;
}
</style>
