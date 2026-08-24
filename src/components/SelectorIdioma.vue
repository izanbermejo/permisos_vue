<template>
  <div class="dropdown" style="display: inline">
    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      <i>
        <font-awesome-icon icon="fa-solid fa-earth-europe" />
      </i>
      {{ $t('App.Canvi Idioma')}}
    </button>
    <ul class="dropdown-menu">
      <li v-for="idioma in llistat_idiomes" :key="idioma.codi" @click="canviaIdioma(idioma.codi)"><a class="dropdown-item" href="#">
        <img :src="require('@/assets/'+idioma.codi+'_32.png')" width="24" alt="" class="mr-2"> {{ idioma.descripcio }}
      </a></li>
    </ul>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { ref, inject } from 'vue';
import { usePrimeVue } from "primevue/config";

export default {
  setup() {
    const { locale } = useI18n();
    const codiIdioma = ref(locale.value);
    const translatePrime = inject('translatePrime');
    const primevue = usePrimeVue();

    const canviaIdioma = (id) => {
      locale.value = id;
      codiIdioma.value = id;
      localStorage.setItem('idioma', id);
      translatePrime(primevue);
    }

    return {
      canviaIdioma, codiIdioma,
      llistat_idiomes: inject('idiomesDisponibles')
    }
  }
}
</script>