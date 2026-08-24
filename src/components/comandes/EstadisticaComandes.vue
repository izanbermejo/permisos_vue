<template>
  <ModalSeleccioPeriodesVariacio v-if="visibleSeleccioPeriodes" :carregat="visibleSeleccioPeriodes" @update:carregat="visibleSeleccioPeriodes = false"
    :callbackGenera="descarregarPerPeriodes" />
  <div class="card">
    <h5 class="card-header">
      <i class="pi pi-arrow-left icona-boto" @click="emit('update:opcio', 'OpcionsComandes')" v-tooltip="$t('App.Tornar')"></i>
      <font-awesome-icon icon="fa-solid fa-magnifying-glass" style="font-size: 1.25rem" />
      {{ $t('Comandes.Estadistica') }}
    </h5>
    <div class="card-body">
      <ul>
        <li v-for="(fabrica) in fabriques" :key="fabrica.nom" class="bloc-fabrica">
          <div class="fila-fabrica">
            <label class="nom-fabrica">
              {{ $t('Comandes.Variacio') }} {{ fabrica.nom }}
            </label>
            <div class="enllacos-fabrica">
              <span class="enllac-dia" @click="descarregarAcumulat(fabrica, 'actual')">
                {{ `Acumulat ${$tm('Primevue.monthNames')[primerDiaMesActual.getMonth()]}` }}
              </span>
              <span style="margin-left: 20px;" class="enllac-dia" @click="descarregarAcumulat(fabrica, 'anterior')">
                {{ `Acumulat ${$tm('Primevue.monthNames')[primerDiaMesAnterior.getMonth()]}` }}
              </span>
              <span style="margin-left: 50px;" class="enllac-dia" @click="obrirModalPeriode(fabrica)">
                {{ `Seleccionar període` }}
              </span>
              <span style="margin-left: 50px;">
                <span style="margin-left: 15px;"
                  v-for="(dia, index) in diesPassats"
                  :key="index"
                  class="enllac-dia"
                  @click="descarregarPerData(fabrica, dia)">
                    {{ `${$d(dia, 'short')}` }}
                </span>
              </span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { carrega } from '@/services/loader';
import {saveAs} from 'file-saver';
import VariacioService from '@/services/variacio.service';
import { ref, computed, onActivated, onDeactivated } from 'vue';
import moment from 'moment';
import ModalSeleccioPeriodesVariacio from '@/views/modals/ModalSeleccioPeriodesVariacio.vue';

export default {
  // eslint-disable-next-line  
  name: 'BuscadorComandes',
  components : {
    ModalSeleccioPeriodesVariacio,
  },
  setup ( props, {emit} ) {
    const visibleSeleccioPeriodes = ref(false);
    const fabricaSeleccionada = ref();
  
    const fabriques = [
      { codis: ['01', '02', '05', '06', '99', '0D'], nom: 'Catalunya', divisa:'EUR' },
      { codis: ['07'], nom: 'Reese', divisa:'USD' },
      { codis: ['0B'], nom: 'Xina', divisa:'EUR' },
      { codis: ['0A'], nom: 'Hungria', divisa:'EUR' },
      { codis: ['01', '02', '05', '06', '99', '0D', '07', '0B', '0A'], nom: 'Global', divisa:'EUR' },
    ];

    const diesPassats = ref([]);
    for (let i = 1; i <= 5; i++) {
      let date = new Date();
      date.setDate(date.getDate() - i);
      diesPassats.value.push(new Date(date));
    }

    const avui = new Date();

    const primerDiaMesActual = new Date(avui.getFullYear(), avui.getMonth(), 1);
    const ultimDiaMesActual = new Date();
    const primerDiaMesAnterior = new Date(avui.getFullYear(), avui.getMonth() - 1, 1);
    const ultimDiaMesAnterior = new Date(avui.getFullYear(), avui.getMonth(), 0);

    const modalVisible = computed(() => visibleSeleccioPeriodes.value);

    onActivated(() => {
      document.addEventListener("keydown", handler);
    });

    onDeactivated(() => {
      document.removeEventListener("keydown", handler);
    });

    const handler = (ev) => {
      // Si no hi ha cap modal obert
      if (modalVisible.value) return;
      if (ev.key=='Escape') {
        actionHandler(ev, () => emit('update:opcio', 'OpcionsComandes'));
      }
    }

    const descarregarAcumulat = async (fabrica, periode) => {
      let inici, fi;

      if (periode === 'actual') {
        inici = moment().startOf('month');
        fi = moment().subtract(1, 'day'); // Hoy - 1 día
      } else if (periode === 'anterior') {
        inici = moment().subtract(1, 'month').startOf('month');
        fi = moment().subtract(1, 'month').endOf('month');
      }

      const mesStr = inici.format('MM');
      const anyStr = inici.format('YYYY');

      const resp = await carrega(VariacioService.variacio(
        fabrica.codis,
        inici.toDate(),
        fi.toDate(),
        fabrica.divisa
      ));

      saveAs(new Blob([resp]), `Variacio_${fabrica.nom}_Acum_${anyStr}_${mesStr}.xlsx`);
    };

    const descarregarPerData = async (fabrica, dia) => {
      const resp = await carrega(VariacioService.variacio(fabrica.codis, dia, dia, fabrica.divisa));
      saveAs(new Blob([resp]), `Variacio_${fabrica.nom}_${dia.toISOString().split('T')[0]}.xlsx`);
    }

    const obrirModalPeriode = (fabrica) => {
      fabricaSeleccionada.value = fabrica;
      visibleSeleccioPeriodes.value = true;
    }

    const descarregarPerPeriodes = async (req) => {
      const resp = await carrega(VariacioService.variacio(
        fabricaSeleccionada.value.codis,
        req.dataInici,
        req.dataFins,
        fabricaSeleccionada.value.divisa,
        req.dataSolicitadaInici,
        req.dataSolicitadaFins
      ));

      saveAs(new Blob([resp]), `Variacio_${fabricaSeleccionada.value.nom}.xlsx`);
    }

    const actionHandler = (ev, action) => {
      ev.preventDefault();
      action();
    }

    return {
      props,
      emit,
      visibleSeleccioPeriodes,
      fabriques,
      diesPassats,
      primerDiaMesActual,
      primerDiaMesAnterior,
      ultimDiaMesAnterior,
      ultimDiaMesActual,
      descarregarAcumulat,
      descarregarPerData,
      descarregarPerPeriodes,
      obrirModalPeriode,
    }

  }
}
</script>

<style scoped>
  .icona-boto {
    margin-right: 15px;
    display: inline-block;
    border-radius: 5px;
    box-shadow: 0 0 2px #888;
    padding: 0.5em 0.6em;
    font-size:  0.8rem;
    cursor: pointer;
  }

  .enllas {
    cursor: pointer;
  }

  .enllas:hover {
    text-decoration: underline;
  }

  li + li {
    margin-top : 3em;
  }

  .fila-fabrica {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .nom-fabrica {
    min-width: 175px;
  }

  .enllacos-fabrica {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .enllac-dia {
    cursor: pointer;
    color: #007bff;
    text-decoration: underline;
    white-space: nowrap;
  }
</style>