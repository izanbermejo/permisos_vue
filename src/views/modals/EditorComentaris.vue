<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="false" :closeOnEscape="false"
    :draggable="false" :header="' '">
    <Textarea ref="textArea" :readonly="!potEditar" style="margin-top: 15px;" v-model="textRef" rows="25" cols="175" />
    <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
      <div>
        <ButtonShortcut tabindex="-1" style="margin-left: 10px;" :literal="$t('App.Cancela')" @click="hide"
          icon="fa-solid fa-undo" :shortcut="'[Esc]'" class="p-button-secondary p-button-sm"/>
        <ButtonShortcut v-if="potEditar" style="margin-left: 10px;" :literal="$t('App.Desa')" @click="guardarAction"
          icon="fa-solid fa-floppy-disk" :shortcut="'[Ctrl + S]'"/>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { useConfirm } from "primevue/useconfirm";
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";

export default {
  name: "EditorComentaris",
  components: {
  },
  props: {
    text : String,
    callback : Function,
    potEditar : {
      type: Boolean,
      default: false,
    },
  },
  setup(props, {emit} ) {
    const { t } = useI18n();
    const confirm = useConfirm();
    const visible = ref(true);
    const textArea = ref();
    const textRef = ref(props.text);
    const textRefOriginal = ref(props.text);
    const confirmVisible = ref(false);

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      nextTick(() => {
        textArea.value.$el.focus();
      })
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const handler = (key) => {
      if (key.key === 'Escape') {
        key.preventDefault();
        key.stopPropagation();
        key.stopImmediatePropagation();
        hide();
      } else if (key.ctrlKey && key.keyCode==83)  { //Ctrl + s
        key.preventDefault();
        key.stopPropagation();
        key.stopImmediatePropagation();
        if (!props.potEditar) return;
        guardarAction();
      }
    }

    const guardarAction = async () => {
      if (textRef.value !== textRefOriginal.value) {
        await props.callback(textRef.value);
      }
      hideAction();
    }

    const hide = async () => {
      if (textRef.value !== textRefOriginal.value) {
        confirmVisible.value = true;
        if (await confClose()) {
          confirmVisible.value = false;
          hideAction();
        }
      } else {
        hideAction();
      }
    };

    const confClose = async() => {
      return new Promise((resolve) => {
        confirm.require({
          message: t('Comentaris.Sortir sense guardar'),
          header: t('App.Confirmacio'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => resolve(true),
          reject: () => resolve(false),
          onHide: () => resolve(false),
          onShow: () => {
            nextTick(() => {
              const rejectButton = document.querySelector('.p-confirm-dialog-reject');
              if (rejectButton) {
                rejectButton.focus();
              }
            });
          }
        })
      });
    }

    const hideAction = () => {
      emit("update:carregat", false);
    }

    return {
      visible,
      textRef,
      textArea,
      hide,
      guardarAction,
    };

  },
};
</script>

<style scoped>
</style>
