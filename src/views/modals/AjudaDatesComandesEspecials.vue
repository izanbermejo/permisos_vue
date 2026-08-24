<template>
  <Dialog v-model:visible="refVisible" modal @hide="hide" :closable="false" :closeOnEscape="false" :draggable="false">
    <template #header>
      <div style="width: 100%;">
        <button tabindex="-1" style="float: right;" @click="hide"
          class="p-dialog-header-icon p-dialog-header-close p-link" aria-label="Close" type="button">
          <span class="p-dialog-header-close-icon pi pi-times"></span>
        </button>
      </div>
    </template>
    <Panel>
      <template #header>
        <span class="p-panel-title">
          <i class="pi pi-calendar" />
          {{ $t('Comandes.Canviar dates') }}
        </span>
      </template>
      <form @submit.prevent="busca">
        <div class="filtre">
          <div class="element-filtre">
            <label>{{ $t('Comandes.Data foto') }}</label>
            <CalendarInput ref="inputDataInicial" v-model="state.dataInici" :invalid="v.dataInici.$errors.length" />
            <small v-if="(v.dataInici.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
          </div>
          <div class="element-filtre">
            <label>{{ $t('Comandes.Data des de') }}</label>
            <CalendarInput v-model="state.dataFi" :invalid="v.dataFi.$errors.length" />
            <small v-if="(v.dataFi.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
          </div>
          <div class="element-filtre" style="padding-top: 5px;display:flex;justify-content:flex-end;align-items:flex-end" >
            <Button type="submit" :label="$t('App.Busca')" icon="pi pi-search" class="p-button-sm" />
          </div>
        </div>
      </form>
    </Panel>
  </Dialog>
</template>

<script>
import { nextTick, ref, watch, toRef, onUnmounted, reactive } from 'vue';
import useVuelidate from "@vuelidate/core";
import moment from 'moment';

export default {
    name : 'AjudaDatesComandesEspecials',
    props : {
      visible: Boolean,
      dataInici : Object,
      dataFi : Object,
      callbackBusca : Function,
    },
    emits: ["buscat"],
    setup(props, { emit }) {
      const refVisible = toRef(props, 'visible');
      const inputDataInicial = ref();
      const refPropsDataInici = toRef(props, 'dataInici');
      const refPropsDataFi = toRef(props, 'dataFi');

      const state = reactive({
        dataInici : null,
        dataFi : null,
      });

      const validDate = (value) => {
        return (value instanceof Date);
      }
      const rules = {
        dataInici : { valid : validDate},
        dataFi : { valid : validDate}
      }
      const v = useVuelidate(rules, state);

      onUnmounted(() => {
        document.removeEventListener("keydown", handler);
      });

      watch(refVisible, () => {
        if (refVisible.value) {
          initializeModal();
        } else {
          document.removeEventListener("keydown", handler);
        }
      })

      const initializeModal = () => {
        document.addEventListener("keydown", handler);
          nextTick(() => {
            setTimeout(() => inputDataInicial.value.$el.firstChild.focus(), 200);
            state.dataInici = refPropsDataInici.value;
            state.dataFi = refPropsDataFi.value;
          });
      }

      watch(() => state.dataInici, () => {
        state.dataFi = moment(state.dataInici).subtract(6, 'months').toDate();
      })

      const handler = (ev) => {
        if (ev.key === 'Escape') {
          hide();
        } 
      }
      
      const busca = async () => {
        v.value.$reset();
        await v.value.$validate();
        if (!v.value.$error) {
          props.callbackBusca(state.dataInici, state.dataFi);
        }
      }

      const hide = () => {
        emit('update:carregat', false);
      }

      return {
        refVisible,
        state,
        v,
        hide,
        busca,
        inputDataInicial,
      }
    },
}
</script>
<style scoped >
  ::v-deep(.p-panel-header) {
    padding: 0.5rem;
  }

  .filtre {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 5px 30px;
  }

  .element-filtre > label {
    display: block;
  }

  .element-filtre > small {
    display: block;
  }

</style>