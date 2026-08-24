<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true"
    :draggable="false" :style="{ width: '780px' }">
    <template #header>
      <span class="titol" v-tooltip="titol">{{ titol }}</span>
    </template>

    <form @submit.prevent="crear">
      <div class="card">
        <div class="card-header">
          <h5 style="margin: 0;">{{ $t('Consums.seleccionaClient') }}</h5>
        </div>
        <div class="card-body" style="height: 140px; padding: 0;">
          <DataTable :value="clients" class="p-datatable-sm-petita" dataKey="dataKey" :scrollable="true"
            scrollHeight="flex" showGridlines selectionMode="single" v-model:selection="state.client"
            :rowClass="() => 'estilRow'">
            <template #empty>
              <div style="min-height: 100px; width: 100%; display: flex; align-items: center; justify-content: center; text-align: center;">
                <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Consums.capClientPlataforma')" />
              </div>
            </template>
            <Column :header="$t('Consums.client')" :style="{ width: '85px' }" style="max-width: 85px;">
              <template #body="{ data }">
                <div class="ellipsis" v-tooltip="data.clicod">{{ data.clicod }}</div>
              </template>
            </Column>
            <Column :header="$t('Consums.nomClient')" style="max-width: 380px;">
              <template #body="{ data }">
                <div class="ellipsis" v-tooltip="data.nom">{{ data.nom }}</div>
              </template>
            </Column>
            <Column :header="$t('Consums.empresa')" :style="{ width: '240px' }" style="max-width: 240px;">
              <template #body="{ data }">
                <div class="ellipsis" v-tooltip="$empresa(data.empresa)">{{ $empresa(data.empresa) }}</div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
      <small v-if="v.client.$error" class="p-error bloc-error">{{ $t('App.Valor requerit') }}</small>

      <div class="dades-consum">
        <div class="camp">
          <label>{{ $t('Consums.dataConsum') }}</label>
          <CalendarInput v-model="state.data" :invalid="v.data.$error" />
          <small v-if="v.data.$error" class="p-error">{{ $t('App.Valor requerit') }}</small>
        </div>
        <div class="camp">
          <label>{{ $t('Consums.albaraEspecial') }}</label>
          <InputText v-model="state.albaraEspecial" style="width: 250px;"
            :class="{ 'p-invalid': v.albaraEspecial.$error }" />
          <small v-if="v.albaraEspecial.$error" class="p-error">{{ $t('App.Valor requerit') }}</small>
        </div>
      </div>

      <div class="botons">
        <Button tabindex="-1" :label="$t('App.Cancela')" icon="pi pi-undo" class="p-button-secondary p-button-sm" @click="hide" />
        <Button type="submit" :label="$t('Consums.crearConsum')" icon="pi pi-check" class="p-button-sm" style="margin-left: 10px;" />
      </div>
    </form>
  </Dialog>
</template>

<script>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import moment from 'moment';
import { carrega } from '@/services/loader';
import ConsumsService from '@/services/consums.service';
import AlbaraService from '@/services/albara.service';
import CalendarInput from '@/components/prime/CalendarInput.vue';

export default {
  name: 'ModalNouConsum',
  components: { CalendarInput },
  emits: ['update:carregat', 'consumCreat'],
  props: {
    // Magatzem plataforma escollit al pas anterior
    plataforma: { type: Object, required: true }
  },
  setup(props, { emit }) {
    const { t, d } = useI18n();
    const confirm = useConfirm();
    const magatzem = inject('magatzem');
    const visible = ref(true);
    const clients = ref([]);

    const titol = computed(() => `${t('Consums.nouConsum')} — ${magatzem(props.plataforma.codi)}`);

    const state = reactive({ client: null, data: new Date(), albaraEspecial: '' });

    const rules = {
      client: { required },
      // CalendarInput deixa el text tal qual si no és una data vàlida
      data: { required, valid: (valor) => valor instanceof Date },
      albaraEspecial: { required },
    };
    const v = useVuelidate(rules, state);

    onMounted(async () => {
      const data = await carrega(ConsumsService.obtenirClientsPlataforma(props.plataforma.codi));
      // Un client hi pot tenir stock de més d'una empresa: la clau és la parella (empresa, client)
      clients.value = (data || []).map(c => ({ ...c, dataKey: `${c.empresa}_${c.clicod}` }));
      // Normalment només hi ha un client a la plataforma: es preselecciona
      state.client = clients.value[0] || null;
    });

    const hide = () => emit('update:carregat', false);

    // Avís (no bloquejant) si el client ja té un albarà amb aquest mateix número d'albarà especial.
    // Retorna true si es pot continuar: sense coincidències, o amb la confirmació de l'usuari.
    const confirmarAlbaraEspecial = async (client, valor) => {
      const coincidencies = await carrega(
        AlbaraService.comprovarAlbaraEspecial(client.empresa, client.clicod, valor));
      if (!coincidencies || !coincidencies.length) return true;
      return new Promise(resolve => {
        confirm.require({
          header: t('App.Confirmacio'),
          message: missatgeCoincidencies(valor, coincidencies),
          icon: 'pi pi-exclamation-triangle',
          accept: () => resolve(true),
          reject: () => resolve(false),
          onHide: () => resolve(false)
        });
      });
    };

    const crear = async () => {
      v.value.$reset();
      await v.value.$validate();
      if (v.value.$error) return;

      const client = state.client;
      const albaraEspecial = state.albaraEspecial.trim();
      if (!await confirmarAlbaraEspecial(client, albaraEspecial)) return;

      const idAlbara = await carrega(ConsumsService.crearCapsaleraConsum({
        empresa: client.empresa,
        client: client.clicod,
        dataConsum: moment(state.data).format('YYYY-MM-DD'),
        magatzemPlataforma: props.plataforma.codi,
        albaraEspecial
      }));
      if (!idAlbara) return;
      emit('consumCreat', { idAlbara, client: client.clicod, clientNom: client.nom });
    };

    const missatgeCoincidencies = (valor, coincidencies) => {
      const llista = coincidencies
        .map(c => `${String(c.id.codi).padStart(7, '0')} (${t('Consums.tipus.' + c.tipus)}, ${d(moment(c.data, 'YYYY-MM-DD').toDate(), 'short')})`)
        .join(', ');
      return t('Consums.albaraEspecialDuplicat', [valor, llista]);
    };

    return { visible, titol, clients, state, v, hide, crear };
  }
};
</script>

<style scoped>
/* El títol no ha de fer créixer el diàleg ni saltar de línia: si no hi cap, s'escurça amb ellipsis */
::v-deep(.p-dialog-title) {
  min-width: 0;
  overflow: hidden;
}
.titol {
  display: block;
  font-size: larger;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Separació entre la capçalera del modal i el box de clients */
.card {
  margin-top: 15px;
}
.dades-consum {
  display: flex;
  gap: 30px;
  padding: 14px 2px 0 2px;
}
.camp > label {
  display: block;
  font-weight: 600;
  margin-bottom: 2px;
}
.camp > small { display: block; }
.bloc-error { display: block; margin-top: 6px; }
.botons {
  margin-top: 18px;
  text-align: right;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
::v-deep(.estilRow) {
  cursor: pointer;
}
</style>
