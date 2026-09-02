<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :draggable="true" :contentStyle="{ overflowY: 'hidden' }">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ `${$t('Moduls.empleat modul')} ${props.nomAplicacio} - ${props.nomModul}` }}</span>
      </div>
    </template>
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
    <DataTable :value="empleats" class="p-datatable-sm" :dataKey="codiNumeroFormat"
    style="margin-top: 15px;" :scrollable="false" scrollHeight="80vh" :resizableColumns="true"
    columnResizeMode="expand" contextMenu v-model:contextMenuSelection="registreSeleccionat"
    @rowContextmenu="showContextMenu($event)" showGridlines v-model:selection="registreSeleccionat"
    selectionMode="single" :rowClass="() => 'estilRow'" @row-select="selectedIndex = $event.index"
    :sortField="sortField" :sortOrder="sortOrder" @sort="onSort">
      <template #empty>
        <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
          <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Empleats.Cap empleats')" />
        </div>
      </template>
      <Column :header="$t('App.Nom')" :style="{ width: '350px' }" style="max-width: 350px;" field="nom">
        <template #body="{ data }">
          {{ data.nom }}
        </template>
      </Column>
      <Column :header="$t('App.Cognoms')" :style="{ width: '350px' }" style="max-width: 350px;" field="cognoms">
        <template #body="{ data }">
          {{ data.cognoms }}
        </template>
      </Column>
      <Column :header="$t('App.Email')" :style="{ width: '350px' }"  field="email">
        <template #body="{ data }">
          {{ data.email }}
        </template>
      </Column>
      <Column :header="$t('App.Tipus assignacio')" :style="{ width: '160px' }" style="max-width: 160px; align-items: center;" field="tipusAssignacio">
        <template #body="{ data }">
          <div style="width: 100%; text-align: center;">
            <Tag :value="$t(`App.${data.tipusAssignacio}`)" :severity="getSeverityFlag(data.tipusAssignacio)" />
          </div>
        </template>
      </Column>
    </DataTable>
  </Dialog>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue';
import modulsService from '@/services/moduls.service';
import { getLocalizedJson } from "@/services/index";
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';

export default {
  name: 'ModalTotsElsEmpleatsDelModul',
  components: {
  },
  props: {
    nomAplicacio: {
      type: String,
      default: null
    },
    nomModul: {
      type: String,
      default: null
    },
  },
  setup(props, { emit }) {
    const visible = ref(true);
    const empleats = ref([]);
    const contextMenu = ref();
    const registreSeleccionat = ref();
    const selectedIndex = ref(-1);
    const idEmpleat = ref(null);

    const sortField = ref(null);
    const sortOrder = ref(null);

    const onSort = (event) => {
      sortField.value = event.sortField;
      sortOrder.value = event.sortOrder;
    };

    const getSeverityFlag = (flag) => {
      if (flag === 'FUNCIO') return 'success';
      if (flag === 'INDIVIDUAL') return 'info';
      if (flag === 'DOSTIPUS') return 'warning';
    }

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      await carregaEmpleats();
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const handler = (ev) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu
      if (isContextMenuKey(ev))  return;
      if (ev.key=='Escape') {
        actionHandler(ev, hide);
      } 
    }

    const actionHandler = (ev, action) => {
      ev.preventDefault();
      action();
    }

    const hide = () => {
      emit("actualitzar");
      emit("update:carregat", false);
    };

    const carregaEmpleats = async () => {
      const data = await modulsService.obtenirTotsElsEmpleatsByModul(props.nomAplicacio, props.nomModul);
      const empleatsMap = new Map();

      data.forEach(empleat => {
        if (empleatsMap.has(empleat.id)) {
          empleatsMap.get(empleat.id).tipusAssignacio = 'DOSTIPUS';
        } else {
          empleatsMap.set(empleat.id, { ...empleat });
        }
      });

      empleats.value = Array.from(empleatsMap.values());
    }

    return {
      visible,
      props,
      onSort,
      empleats,
      registreSeleccionat,
      selectedIndex,
      contextMenu,
      carregaEmpleats,
      getLocalizedJson,
      hide,
      idEmpleat,
      getSeverityFlag,
    }

  }
}
</script>

<style scoped>
::v-deep(.p-panel-header) {
  padding: 0.5rem;
}

::v-deep(.estilRow) {
  cursor: pointer;
}

::v-deep(.estilRow .ocultable) {
  height: 1.5rem !important;
  width: 1.5rem !important;
  margin-left: auto;
  margin-right: auto;
  display: none;
}

::v-deep(.estilRow:hover .ocultable) {
  display: flex;
}

::v-deep(.estilRow .buttoicon) {
  height: 1.5rem !important;
  width: 1.5rem !important;
  margin-left: auto;
  margin-right: auto;
}

.flex-container {
  padding: 5px 10px;
  display: flex;
  gap: 25px;
}

.label-detall {
  font-weight: 600;
  font-size: 1rem;
}

.filtre {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 5px 30px;
}

.element-filtre {
  align-content: end;
}

.element-filtre>label {
  display: block;
}

::v-deep(.p-multiselect) {
  line-height: 13px;
}

::v-deep(.p-selectbutton) {
  line-height: 13px;
}
</style>
