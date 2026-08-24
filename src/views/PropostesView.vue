<template>
  <div class="card">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-truck-plane" style="font-size: 1.25rem" />
      {{ $t('App.Propostes entrega') }}
      <small v-if="propostes" style="margin-left: 75px; font-size: 0.8rem; color: #6c757d;">
        {{ $t('Propostes.Dades satelit', [propostes.ultimRefreshCacheSatelits ? $d(propostes.ultimRefreshCacheSatelits, 'long') : '-']) }}
      </small>
    </h5>
    <div>
      <div class="card-body">
        <div class="filtre" ref="formWrapper">
          <div class="element-filtre">
            <label>{{ $t('Propostes.Magatzem') }}</label>
            <CompletableInput v-model="state.magatzem" :items="$magatzems" :inputWidth="50" :matchWidth="150"
              :invalid="v.magatzem.$errors.length > 0" />
            <small v-if="v.magatzem.$errors.length" class="p-error text-nowrap" style="display: block;">
              {{ $t('Propostes.Cal seleccionar magatzem') }}
            </small>
          </div>
          <div class="element-filtre">
            <label>{{ $t('Propostes.Responsable logistic') }}</label>
            <div style="display: flex; align-items: center;">
              <MultiSelect v-model="state.responsables" :options="$responsablesLogistica"
                optionLabel="nom" optionValue="nom" :filter="true"
                :placeholder="$t('App.Tots')" style="width: 220px;" />
              <Button icon="pi pi-users" @click="state.responsables = []"
                style="width: 30px; height: 30px; margin-left: 5px;"
                v-tooltip.bottom="$t('Propostes.Seleccionar tots els responsables')" />
              <Button v-if="usuariActual" icon="pi pi-user" @click="state.responsables = [usuariActual.nom]"
                style="width: 30px; height: 30px; margin-left: 5px;"
                v-tooltip.bottom="`${$t('Propostes.Seleccionar responsable')} ${usuariActual.nom}`" />
            </div>
          </div>
          <div class="element-filtre">
            <label>{{ $t('Propostes.Data des de fins') }}</label>
            <div>
              <CalendarInput v-model="state.dataPrevistaInici" />
              -
              <CalendarInput v-model="state.dataPrevistaFi" />
            </div>
          </div>
          <div class="element-filtre">
            <label>{{ $t('Propostes.Transportista') }}</label>
            <CompletableInput v-model="state.transportista" :items="$transportistes" :inputWidth="50" :matchWidth="145" />
          </div>
          <div class="break"></div>
          <div class="element-filtre" style="padding-top: 5px;display:flex;justify-content:flex-end;align-items:flex-end">
            <Button @click="buscar" :label="$t('App.Busca')" icon="pi pi-search" class="p-button-sm" />
          </div>
        </div>
      </div>
      <div v-if="propostes" class="tabs-container">
        <section class="tabs">
          <div class="tab"
              :class="{ selected: component === 'PropostesClientsFerm' }"
              @click="canviaComponent('PropostesClientsFerm')">
            {{ $t('Propostes.Clients') }}
            <span class="badge">{{ numClientsFerm }}</span>
          </div>
          <div class="tab"
              :class="{ selected: component === 'PropostesTraspas' }"
              @click="canviaComponent('PropostesTraspas')">
            {{ $t('Propostes.Traspas') }}
            <span class="badge">{{ numTraspas }}</span>
          </div>
          <div class="right-tabs">
            <div class="tab"
                :class="{ selected: component === 'PropostesClientsOrientatiu' }"
                @click="canviaComponent('PropostesClientsOrientatiu')">
              {{ $t('Propostes.Clients orientatiu') }}
              <span class="badge">{{ numClientsOrientatiu }}</span>
            </div>
            <div class="tab"
                :class="{ selected: component === 'PropostesClientsInvent' }"
                @click="canviaComponent('PropostesClientsInvent')">
              {{ $t('Propostes.Clients invents') }}
              <span class="badge">{{ numClientsInvent }}</span>
            </div>
          </div>
          <div class="tab"
              :class="{ selected: component === 'PropostesClientsTots' }"
              @click="canviaComponent('PropostesClientsTots')">
            {{ $t('Propostes.Clients tots') }}
            <span class="badge">{{ numClientsTots }}</span>
          </div>
        </section>
        <div class="tab-content">
          <KeepAlive :include="['PropostesClientsFerm', 'PropostesTraspas', 'PropostesClientsInvent', 'PropostesClientsOrientatiu', 'PropostesClientsTots']">
            <component :is="component" :propostes="propostes" :infoBusqueda="state" />
          </KeepAlive>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, nextTick, onMounted, inject, watch } from 'vue';
import useVuelidate from "@vuelidate/core";
import propostesService from "@/services/propostes.service";
import { carrega } from '@/services/loader';
import { usePermisosStore } from '@/stores/permisos';
import PropostesClientsFerm from '@/components/propostes/clientsferm/PropostesClientsFerm.vue';
import PropostesClientsInvent from '@/components/propostes/clientsinvent/PropostesClientsInvent.vue';
import PropostesClientsOrientatiu from '@/components/propostes/clientsorientatiu/PropostesClientsOrientatiu.vue';
import PropostesClientsTots from '@/components/propostes/clients/PropostesClientsTots.vue';
import PropostesTraspas from '@/components/propostes/traspas/PropostesTraspas.vue';
import CompletableInput from '@/components/CompletableInput.vue';
import moment from 'moment';

export default {
  // eslint-disable-next-line
  name: 'PropostesView',
  components : {
    PropostesClientsFerm,
    PropostesClientsInvent,
    PropostesClientsOrientatiu,
    PropostesTraspas,
    PropostesClientsTots,
    CompletableInput
  },
  setup ( ) {
    const permisosStore = usePermisosStore();
    const component = ref('PropostesClientsFerm');
    const propostes = ref();
    const numClientsFerm = ref();
    const numTraspas = ref();
    const numClientsInvent = ref();
    const numClientsOrientatiu = ref();
    const numClientsTots = ref();

    // Clau del localStorage on es desa l'últim filtre escollit
    const FILTRE_KEY = 'PropostesFiltre';

    // Responsables logístics dels clients (metadata). El codi és l'usuari antic, perquè
    // cache_client.responsable ve del usuresp d'Advantage; per això l'usuari loginat es troba pel
    // seu usuari antic i, si no en té, el filtre arrenca sense cap responsable, és a dir amb tots.
    const magatzems = inject('magatzems', []) ?? [];
    const responsablesLogistica = inject('responsablesLogistica', []) ?? [];
    const usuariAntic = permisosStore.teUsuariAntic();
    const usuariActual = responsablesLogistica.find(r => r.nom === usuariAntic) ?? null;

    const state = reactive({
      magatzem : '0001',
      // Per defecte només les propostes dels clients de l'usuari loginat; buit vol dir de tots els responsables
      responsables : usuariActual ? [usuariActual.nom] : [],
      transportista : '',
      dataPrevistaInici : null,
      dataPrevistaFi : moment().add(15, 'day').toDate(),
    });

    // Desa el filtre actual perquè es recuperi la propera vegada que s'entri a la pantalla
    const desarFiltre = () => {
      localStorage.setItem(FILTRE_KEY, JSON.stringify({
        magatzem: state.magatzem,
        responsables: state.responsables,
        transportista: state.transportista,
        dataPrevistaInici: state.dataPrevistaInici ? moment(state.dataPrevistaInici).toISOString() : null,
        dataPrevistaFi: state.dataPrevistaFi ? moment(state.dataPrevistaFi).toISOString() : null,
      }));
    };

    // Restaura l'últim filtre desat (retorna true si n'hi havia)
    const restaurarFiltre = () => {
      const desat = localStorage.getItem(FILTRE_KEY);
      if (!desat) return false;
      try {
        const f = JSON.parse(desat);
        state.magatzem = f.magatzem ?? state.magatzem;
        // Els filtres desats abans del combo guardaven un únic responsable en text lliure
        const responsablesDesats = Array.isArray(f.responsables) ? f.responsables
          : (f.responsable ? [f.responsable] : null);
        if (responsablesDesats)
          state.responsables = responsablesDesats.filter(r => responsablesLogistica.some(rl => rl.nom === r));
        state.transportista = f.transportista ?? state.transportista;
        state.dataPrevistaInici = f.dataPrevistaInici ? new Date(f.dataPrevistaInici) : null;
        state.dataPrevistaFi = f.dataPrevistaFi ? new Date(f.dataPrevistaFi) : null;
        return true;
      } catch {
        return false;
      }
    };

    // El magatzem és obligatori i ha de ser un dels existents: les propostes es calculen sempre
    // sobre un magatzem de sortida concret
    const magatzemValid = (valor) => magatzems.some(m => m.codi === valor);
    const rules = {
      magatzem : { magatzemValid }
    }
    const v = useVuelidate(rules, state);

    // Es desa el magatzem tan bon punt es tria perquè la propera vegada s'arrenqui amb l'últim
    watch(() => state.magatzem, (valor) => {
      if (magatzemValid(valor))
        desarFiltre();
    });

    const canviaComponent = (componentParam) => {
      component.value = componentParam;
    }

    const buscar = async () => {
      // Validació
      v.value.$reset();
      await v.value.$validate();
      if (v.value.$error)
        return;
      // Es desa el filtre escollit abans de cercar
      desarFiltre();
      propostes.value = null;
      let params = new URLSearchParams();
      params.append('magatzem', state.magatzem);
      // Cap responsable seleccionat vol dir de tots els responsables
      state.responsables.forEach(r => params.append('responsable', r));
      if (state.transportista.trim())
        params.append('transportista', state.transportista);
      if (state.dataPrevistaInici)
        params.append('dataPrevistaInici', moment(state.dataPrevistaInici).format('YYYY-MM-DD'));
      if (state.dataPrevistaFi)
        params.append('dataPrevistaFi', moment(state.dataPrevistaFi).format('YYYY-MM-DD'));
      let resultatPeticio = await(carrega(propostesService.obtenirPropostes(params)));
      nextTick(() => {
        propostes.value = resultatPeticio;
        numClientsFerm.value = resultatPeticio.numClientsFerm;
        numTraspas.value = resultatPeticio.numTraspassos;
        numClientsInvent.value = resultatPeticio.numClientsInvent;
        numClientsOrientatiu.value = resultatPeticio.numClientsOrientatiu;
        numClientsTots.value = resultatPeticio.numClients;
      });
    }

    // En entrar, es recupera l'últim filtre desat per omplir el formulari (sense llançar la cerca)
    onMounted(() => {
      restaurarFiltre();
    });

    return {
      component,
      propostes,
      numClientsFerm,
      numClientsInvent,
      numClientsOrientatiu,
      numClientsTots,
      numTraspas,
      canviaComponent,
      state,
      v,
      usuariActual,
      buscar
    }

  }
}
</script>

<style scoped>

.filtre {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 5px 30px;
  }

  .enllas {
    cursor: pointer;
  }

  .element-filtre>label {
    display: block;
  }

  .break {
    flex-basis: 100%;
    height: 0;
  }

  ::v-deep(.p-multiselect) {
    line-height: 13px;
  }

  ::v-deep(.p-selectbutton) {
    line-height: 13px;
  }

  ::v-deep(.p-selectbutton .p-button.p-highlight) {
    background: #60cc65;
    border-color: #60cc65;
  }

  ::v-deep(.p-selectbutton .p-button.p-highlight:hover) {
    background: rgb(85, 172, 89);
    border-color: rgb(85, 172, 89);
  }

  .tabs-container {
    padding: 0px 10px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

.tabs {
  display: flex;
  border-bottom: 2px solid #ccc;
  gap: 1rem;
}

.right-tabs {
  display: flex;
  margin-left: auto; /* Esto empuja el grupo a la derecha */
  gap: 10px; /* Espaciado entre las dos pestañas derechas */
}

.tab {
  position: relative;
  padding: 10px 24px;
  cursor: pointer;
  color: #3366cc; /* azul neutro */
  background-color: #f0f4ff;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  font-weight: 500;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s, color 0.3s;
}

.tab:hover:not(.selected) {
  background-color: #dde8ff;
}

.tab.selected {
  color: #003366; /* azul oscuro */
  background-color: white;
  border-color: #ccc;
  border-bottom: 2px solid white; /* “levantada” */
  font-weight: 700;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.badge {
  background-color: #ffcc00;
  color: #333;
  font-weight: 700;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 0.85rem;
  min-width: 28px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
}

.tab-content {
  padding: 10px;
  border: 1px solid #ccc;
  border-top: none;
  background-color: white;
  border-radius: 0 6px 6px 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  min-height: 200px; /* Ajusta a tu contenido */
}

</style>
