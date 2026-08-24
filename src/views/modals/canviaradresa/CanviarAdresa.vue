<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="$t(titol)" style="width: 1400px">
    <CanviarAdresaDetallClient v-if="client" :client="client" />
    <form @submit.prevent="guarda">
    <div class="card" style="margin-top: 10px;">
      <h6 class="card-header" style="font-weight: 600; display: flex; align-items: center; gap: 16px;">
        {{ $t('Comandes.Adresa')}}
        <ButtonShortcut v-if="client" :literal="$t('Comandes.Copia adresa')" @click="copiaAdresa"
        icon="fa-solid fa-copy" style="margin-left: 10px;"/>
      </h6>
      <div class="card-body">
        <div class="form">
          <div class="element-form">
            <label> {{ $t('Comandes.Nom') }} </label>
            <InputText ref="inputDestinatari" v-model="state.destinatari"
                @focus="$event.originalTarget.select()"  style="width: 360px" />
            <small v-if="(v.destinatari.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
          </div>
          <div class="element-form">
            <label> {{ $t('Comandes.Adresa')}} </label>
            <InputText v-model="state.adresa"  style="width: 360px" />
            <small v-if="(v.adresa.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
          </div>
          <div class="break"></div>
          <div class="element-form">
            <label> {{ $t('Comandes.PaisRegio')}} </label>
            <Dropdown v-model="state.pais" :options="$paisos" filter showClear autoFilterFocus style="width: 375px;"
                optionValue="codi" optionLabel="codiNom" class="w-full md:w-14rem">
            </Dropdown>
            <small v-if="(v.pais.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
          </div>
          <div class="element-form">
            <label> {{ $t('Comandes.Poblacio')}} </label>
            <InputText v-model="state.poblacio"  style="width: 300px" />
            <small v-if="(v.poblacio.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
          </div>
          <div class="element-form">
            <label> {{ $t('Comandes.Codi postal')}} </label>
            <InputText v-model="state.codiPostal"  style="width: 120px" />
          </div>
          <div v-if="mostrarEnviament" class="card" style="margin-top: 10px;">
            <h6 class="card-header" style="font-weight: 600;">
            {{ $t('Comandes.Enviament')}}
            </h6>
            <div class="card-body">
              <div class="form">
                <div class="element-form">
                  <label> {{ $t('Comandes.Medi')}} </label>
                  <Dropdown v-model="state.formaEnviament" :options="$formesEnviament" filter autoFilterFocus style="width: 300px"
                      optionValue="codi" optionLabel="nom" class="w-full md:w-14rem">
                  </Dropdown>
                  <small v-if="(v.formaEnviament?.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
                </div>
                <div class="element-form">
                  <label> {{ $t('Comandes.Incoterm')}} </label>
                  <Dropdown v-model="state.incoterm" :options="$incoterms" autoFilterFocus style="width: 120px"
                      optionValue="codi" optionLabel="codi" class="w-full md:w-14rem">
                  </Dropdown>
                  <small v-if="(v.incoterm?.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
                </div>
                <div class="element-form">
                  <label> {{ $t('Comandes.Poblacio')}} </label>
                  <Dropdown v-model="state.desti" :options="$destinsTransport" filter showClear autoFilterFocus style="width: 425px"
                      optionValue="codi" optionLabel="codiNom" class="w-full md:w-14rem">
                  </Dropdown>
                  <small v-if="(v.desti?.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
                </div>
              </div>
            </div>
          </div>
          <div v-if="mostrarEnviament" class="card" style="margin-top: 10px;">
            <h6 class="card-header" style="font-weight: 600;">
            {{ $t('Comandes.Transport')}}
            </h6>
            <div class="card-body">
              <div class="form">
                <div class="element-form">
                  <label> {{ $t('Comandes.Transportista')}} </label>
                  <Dropdown v-model="state.transportista" :options="$transportistes" filter showClear autoFilterFocus style="width: 375px;"
                      optionValue="codi" optionLabel="codiNom" class="w-full md:w-14rem">
                  </Dropdown>
                  <small v-if="(v.transportista?.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
                </div>
                <div class="element-form">
                  <label> {{ $t('Comandes.Zona transport')}} </label>
                  <Dropdown v-model="state.zonaTransport" :options="zonesTransport" filter showClear autoFilterFocus style="width: 375px;"
                      optionValue="codi" :optionLabel="displayZonaTransport" class="w-full md:w-14rem">
                  </Dropdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
      <div>
        <Button tabindex="-1" :label="$t('App.Cancela')" icon="pi pi-undo" class="p-button-secondary p-button-sm" @click="hide" />
        <Button type="submit" :label="$t('App.Desa')" icon="pi pi-save" class="p-button-sm" style="margin-left: 10px;"/>
      </div>
    </div>
    </form>
  </Dialog>
</template>

<script>
import comandesService from "@/services/comandes.service";
import useVuelidate from "@vuelidate/core";
import { required } from '@vuelidate/validators';
import { ref, onMounted, onUnmounted, reactive, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import { carrega } from '@/services/loader';
import CanviarAdresaDetallClient from "./CanviarAdresaDetallClient.vue";
import { isContextMenuKey } from "@/utils/contextmenuUtils";

export default {
  name: "CanviarAdresa",
  components: {
    CanviarAdresaDetallClient,
  },
  props: {
    // Adreça a editar: { destinatari, adresa, poblacio, codiPostal, pais }
    adresa: { type: Object, required: true },
    // Informació d'enviament (només s'edita si mostrarEnviament): { formaEnviament, incoterm, desti, transportista, zonaTransport }
    informacioEnviament: { type: Object, default: null },
    // Mostra les seccions Enviament/Transport (adreça principal). Fals per a adreces broker/proforma.
    mostrarEnviament: { type: Boolean, default: true },
    // Codi de client: si es proporciona, mostra el panell del client i habilita "Copia adreça".
    codiClient: { type: String, default: null },
    // Clau i18n del títol del diàleg.
    titol: { type: String, default: 'Comandes.Canviar adresa' },
    // Callback que fa la crida real de desat: (state) => Promise (retorna la promesa axios).
    onGuardar: { type: Function, required: true },
    // Callback opcional executat després de desar amb èxit.
    callbackOk: { type: Function, default: null },
  },
  setup(props, { emit }) {
    const { locale } = useI18n();
    const visible = ref(true);
    const inputDestinatari = ref();
    const client = ref();
    const zonesTransport = ref();
    let isInicialitzat = false;

    const state = reactive({
      destinatari : '',
      adresa : '',
      poblacio : '',
      codiPostal : '',
      transportista : '',
      pais : '',
      zonaTransport : '',
      formaEnviament : '',
      incoterm : '',
      desti : '',
    });
    const rules = {
      destinatari: { required },
      adresa : { required },
      poblacio : { required },
      pais : { required },
      ...(props.mostrarEnviament ? {
        transportista : { required },
        desti : { required },
        formaEnviament : { required },
        incoterm : { required },
      } : {}),
    }
    const v = useVuelidate(rules, state);

    const copiaAdresa = async () => {
      state.destinatari     = client.value.adresaEnviamentCalculada.destinatari     || '';
      state.adresa          = client.value.adresaEnviamentCalculada.adresa          || '';
      state.poblacio        = client.value.adresaEnviamentCalculada.poblacio        || '';
      state.codiPostal      = client.value.adresaEnviamentCalculada.codiPostal      || '';
      state.pais            = client.value.adresaEnviamentCalculada.pais            || '';
      state.transportista   = client.value.codiTransportista      || '';
      state.formaEnviament  = client.value.formaEnviament         || '';
      state.incoterm        = client.value.incoterm        || '';
      state.desti           = client.value.desti           || '';
      state.zonaTransport   = client.value.zonaTransport.codi   || '';
    };

    onMounted(async () => {
      try {
        // Obtenció del client (per mostrar l'adreça i habilitar "Copia adreça")
        if (props.codiClient) {
          client.value = await carrega(comandesService.obtenirClient(props.codiClient));
        }
        // Obtenció de les zones de transport del pais i transportista actuals (només si s'edita l'enviament)
        if (props.mostrarEnviament) {
          let pais = props.adresa?.pais;
          let transportista = props.informacioEnviament?.transportista;
          zonesTransport.value = await carrega(comandesService.zonesTransport(transportista, pais));
        }
        // Inicialització del formulari amb les dades
        inicialitza();
      } catch (e) {
        hide();
      }
      // Inicialització del listener i focus a l'editText
      document.addEventListener("keydown", handler);
      nextTick(() => {
        inputDestinatari.value.$el.focus();
        isInicialitzat = true;
      });
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const inicialitza = () => {
      let adresa = props.adresa ?? {};
      let infoEnviament = props.informacioEnviament ?? {};
      // Inicialització de l'state amb les dades
      state.destinatari = adresa.destinatari ?? '';
      state.adresa = adresa.adresa ?? '';
      state.poblacio = adresa.poblacio ?? '';
      state.codiPostal = adresa.codiPostal ?? '';
      state.pais = adresa.pais ?? '';
      state.formaEnviament = infoEnviament.formaEnviament ?? '';
      state.incoterm = infoEnviament.incoterm ?? '';
      state.desti = infoEnviament.desti ?? '';
      state.transportista = infoEnviament.transportista ?? '';
      state.zonaTransport = infoEnviament.zonaTransport ?? '';
    }

    watch(() => [state.transportista, state.pais], () => {
      if (isInicialitzat && props.mostrarEnviament) {
        reloadZonesTransport();
      }
    });

    const reloadZonesTransport = async() => {
      let oldZona = state.zonaTransport;
      zonesTransport.value = await carrega(comandesService.zonesTransport(state.transportista, state.pais));
      if (!zonesTransport.value.some(z => z.codi===oldZona))
        state.zonaTransport = null;
    }

    const displayZonaTransport = (z) => z.codi + ' - ' + z.descripcio;

    const handler = (key) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu o Dropdown
      if (isContextMenuKey(key)) return;
      if (key.key === 'Escape') {
        key.preventDefault();
        hide();
      }
    }

    const hide = () => {
      emit("update:carregat", false);
    };

    const guarda = async () => {
      // Validació
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        await carrega(props.onGuardar(state));
        if (props.callbackOk)
          await props.callbackOk();
        hide();
      }
    }

    return {
      locale,
      visible,
      props,
      state,
      v,
      inputDestinatari,
      client,
      zonesTransport,
      displayZonaTransport,
      guarda,
      hide,
      copiaAdresa
    };

  },
};
</script>

<style scoped>
  .card-body {
    padding: 10px 10px;
  }

  .form {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px 30px;
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
</style>
