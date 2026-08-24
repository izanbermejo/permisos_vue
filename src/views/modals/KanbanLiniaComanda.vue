<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :header="' '" style="width: 420px">
    <template #header>
      <div style="font-size: larger; font-weight: 600; float: left;">
        <i class="pi pi-window-maximize"></i>
        <span style="margin-left: 10px;"> {{ $t('Comandes.Canvi numero comanda linia')}}</span>
      </div>
    </template>
    <form @submit.prevent="guarda">
      <div class="form" style="margin-top: 20px;">
        <div class="element-form">
          <label> {{ $t('Comandes.Comanda client') }} </label>
          <InputText ref="inputComanda" v-model="state.comanda"  
              @focus="$event.originalTarget.select()"  style="width: 360px" />
          <small v-if="(v.comanda.$errors.length)" class="p-error text-nowrap">{{ $t('App.Valor requerit') }}</small>
        </div>
        <div class="break" />
        <div class="element-form">
          <label> {{ $t('Comandes.Programa') }} </label>
          <InputText v-model="state.programa"  
              @focus="$event.originalTarget.select()"  style="width: 360px" />
        </div>
        <div class="break" />
        <div style="margin-left: auto; margin-right: 0; margin-top:10px">
          <Button tabindex="-1" :label="$t('App.Cancela')" icon="pi pi-undo" class="p-button-secondary p-button-sm" @click="hide" />
          <Button type="submit" :label="$t('App.Desa')" icon="pi pi-save" class="p-button-sm" style="margin-left: 10px;"/>
        </div>
      </div>
    </form>
  </Dialog>
</template>

<script>
import { onMounted, ref, computed, reactive, nextTick, inject } from "vue";
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import useVuelidate from "@vuelidate/core";
import { required } from '@vuelidate/validators';
import { useI18n } from "vue-i18n";
import { useConfirm } from "primevue/useconfirm";

export default {
  name: "KanbanLiniaComanda",
  components: {
  },
  props: {
    callbackOk: Function,
    obtenirComandaExistent: Function,
  },
  setup(props, { emit }) {
    const { t, d } = useI18n();
    const toDate = inject('toDate');
    const visible = ref(true);
    const inputComanda = ref();
    const confirm = useConfirm();
    const confirmVisible = ref(false);

    const state = reactive({
      comanda: '',
      programa: '',
    });

    const rules = {
      comanda: { required },
    }
    const v = useVuelidate(rules, state);

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      nextTick(() => {
        inputComanda.value.$el.focus();
      });
    });

    const hide = () => {
      emit("update:carregat", false);
    };

    const modalVisible = computed(() => {
      return confirmVisible.value;
    });

    const guarda = async () => {
      // Validació
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        comprovarExisteixComandaClient();
      }
    }

    const comprovarExisteixComandaClient = async() => {
      let comanda = await props.obtenirComandaExistent(state.comanda);
      if (comanda) {
        // En cas que existeixi una comanda amb el mateix nom s'ha de preguntar per la confirmació
        confirmVisible.value = true;
        if (await(confirmacioComandaExistent(comanda)))
          props.callbackOk(state);
        confirmVisible.value = false;
      } else {
        props.callbackOk(state);
      }
    }

    const confirmacioComandaExistent = async(comanda) => {
      let missatge = comanda.servida
        ? t('Comanda.Confirmacio existeix comanda servida amb confirmacio', [comanda.comanda, d(toDate(comanda.data), 'short')])
        : t('Comanda.Confirmacio existeix comanda amb confirmacio', [comanda.comanda, d(toDate(comanda.data), 'short')]);
      return new Promise((resolve) => {
        confirm.require({
          message: missatge,
          header: t('App.Confirmacio'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => resolve(true),
          reject: () => resolve(false),
          onHide: () => resolve(false),
        })
      });
    }

    const handler = (ev) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu
      if (isContextMenuKey(ev))  return;
      // Si no hi ha cap modal obert
      if (modalVisible.value) return;
      // Controls
      if (ev.key === 'Escape') {
          actionHandler(ev, () => hide());
      } 
    }

    const actionHandler = (ev, action) => {
        ev.preventDefault();
        action();
    }

    return {
      visible,
      hide,
      state,
      rules,
      v,
      guarda,
      inputComanda,
    }

  },
}
</script>


<style scoped>
  .form {
    margin-top: 2px;
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px 30px;
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