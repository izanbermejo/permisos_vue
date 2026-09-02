<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true"
    :draggable="true" :header="`${$t('Funcions.empleats funcio')}: ${props.centDepFun}`" :contentStyle="{ overflowY: 'hidden' }">
  
      <DataTable :value="empleats" class="p-datatable-sm" :dataKey="codiNumeroFormat"
      style="margin-top: 15px;" :scrollable="false" scrollHeight="80vh" :resizableColumns="true"
      columnResizeMode="expand" contextMenu v-model:contextMenuSelection="registreSeleccionat"
      @rowContextmenu="showContextMenu($event)" showGridlines v-model:selection="registreSeleccionat"
      selectionMode="single" :rowClass="() => 'estilRow'" @row-select="selectedIndex = $event.index"
      :sortField="sortField" :sortOrder="sortOrder" @sort="onSort">
      <template #empty>
        <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
          <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Funcions.Cap funcio')" />
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
      <Column :header="$t('App.Email')" :style="{ width: '250px' }"  field="email">
        <template #body="{ data }">
          {{ data.email }}
        </template>
      </Column>
    </DataTable>
  </Dialog>
</template>

<script>
import { onMounted, ref } from 'vue';
// import { useI18n } from 'vue-i18n';
import { getLocalizedJson } from "@/services/index";
import organigramaService from '@/services/organigrama.service';

export default {
  name: 'ModalEmpleatsCentDepFun',
  components: {
  },
  props: {
    idCentre: {
      type: Number,
      default: null
    },
    idDepartament: {
      type: Number,
      default: null
    },
    idFuncio: {
      type: Number,
      default: null
    },
    centDepFun: {
      type: String,
      default: ''
    },
  },
  setup(props, { emit }) {
    // const { t } = useI18n();
    const visible = ref(true);
    const contextMenu = ref();
    const registreSeleccionat = ref();
    const empleats = ref([]);
    const selectedIndex = ref(-1);
      
    const sortField = ref(null);
    const sortOrder = ref(null);

    const onSort = (event) => {
      sortField.value = event.sortField;
      sortOrder.value = event.sortOrder;
    };

    onMounted(async () => {
      await carregaEmpleats();
    });

    const carregaEmpleats = async () => {
      const data = await organigramaService.obtenirEmpleatsCentreDepartamentFuncio(props.idCentre, props.idDepartament, props.idFuncio);
      empleats.value = data;
    }

    const hide = () => {
      emit("actualitzar");
      emit("update:carregat", false);
    };

    return {
      visible,
      props,
      onSort,
      registreSeleccionat,
      selectedIndex,
      contextMenu,
      empleats,
      carregaEmpleats,
      getLocalizedJson,
      hide,
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
