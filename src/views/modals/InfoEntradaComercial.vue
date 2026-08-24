<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true"
    :draggable="false" :header="`Entrada ${idEntrada}`" style="width: 90%;">
        <DataTable :value="dadesEntradaComercial"
            v-model:selection="selectedEntrada"
            selectionMode="single"
            dataKey="id"
            showGridlines
            :rowClass="() => 'estilRow'"
            :scrollable="true" scrollDirection="both" scrollHeight="50vh"
            :resizableColumns="true" columnResizeMode="expand"
            @row-select="selectedIndex = $event.index;">
            <!-- @dblclick="window?.getSelection()?.removeAllRanges(); showDetall()" -->
            <template #empty>
                <div style="width:35px; height: 35vh; text-align: center; padding-top: 30px;">
                    <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('AjudaArticlesNormalitzats.EmptyArticles')" />
                </div>
            </template>
            <Column :style="{ width: '35px' }" style="max-width: 35px; padding: 0px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 35px; height: 35px; align-content: center;">
                  <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" style="width: 35px;"
                  @click="registreSeleccionat = data; contextMenu.show($event)" />
                </div>
              </template>
            </Column>
            <Column field="articleFabrica" :header="$t('EntradesComercial.Article')" :style="{width:'60px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.articleFabrica}` }}
              </template>
            </Column>
            <Column field="client" :header="$t('EntradesComercial.Client')" :style="{width:'50px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.client}` }}
              </template>
            </Column>
            <Column field="magatzem" :header="$t('EntradesComercial.Magatzem')" :style="{width:'70px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.magatzem}` }}
              </template>
            </Column>
            <Column field="fabrica" :header="$t('Entrades.Fabrica')" :style="{width:'50px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.fabrica}` }}
              </template>
            </Column>
            <Column field="quantitat" :header="$t('Entrades.Quantitat')" :style="{width:'60px'}" style="max-width: 25%; justify-content: end;">
              <template #body="{data}">
                {{ $n(data.quantitat) }}
              </template>
            </Column>
            <Column field="quantitat_caixa" :header="$t('Entrades.Quantitat caixa')" :style="{width:'130px'}" style="max-width: 25%; justify-content: end;">
              <template #body="{data}">
                {{ $n(data.quantitatCaixa) }}
              </template>
            </Column>
            <Column field="of" :header="$t('Entrades.of')" :style="{width:'110px'}" style="max-width: 25%; justify-content: end;">
              <template #body="{data}">
                {{ $n(data.of) }}
              </template>
            </Column>
            <Column field="pes_premsat" :header="$t('Entrades.Pes premsat')" :style="{width:'85px'}" style="max-width: 25%; justify-content: end;">
                <template #body="{data}">
                    {{ $n(data.pesPremsat) }}
                </template>
            </Column>
            <Column field="pes_final" :header="$t('Entrades.Pes final')" :style="{width:'60px'}" style="max-width: 25%; justify-content: end;">
                <template #body="{data}">
                    {{ $n(data.pesFinal) }}
                </template>
            </Column>
            <Column field="data_alta" :header="$t('Entrades.Data registre')" :style="{width:'120px'}" style="max-width: 25%;">
                <template #body="{data}">
                    {{ $d($toDate(data.dataAlta), 'long') }}
                </template>
            </Column>
            <Column field="data_processat" :header="$t('Entrades.Data processament')" :style="{width:'160px'}" style="max-width: 25%;">
                <template #body="{data}">
                  <span v-if="data.dataProcessat">
                    {{ $d($toDate(data.dataProcessat), 'long') }}
                  </span>
                </template>
            </Column>
            <Column field="error" :header="$t('EntradesComercial.Error')" :style="{width:'250px'}" style="max-width: 25%;">
                <template #body="{data}">
                    <span v-if="data.msgError">
                        {{ mostrarErrorEntrada(data.msgError) }}
                    </span>
                </template>
            </Column>
        </DataTable>
  </Dialog>
</template>

<script>
import entradesService from "@/services/entrades.service";
import { carrega } from "@/services/loader";
import { ref, onMounted, nextTick } from "vue";

export default {
  name: "InfoEntradaComercial",
  components: {
  },
  props: {
    idEntrada : String,
    callback : Function,
    potEditar : {
      type: Boolean,
      default: false,
    },
  },
  setup(props, {emit} ) {
    const visible = ref(true);
    const idEntradaMostrada = ref(props.idEntrada);
    const dadesEntradaComercial = ref();

    onMounted(async () => {
      let resultat = await(carrega(entradesService.mostrarEntradaComercialById(idEntradaMostrada.value)));
      dadesEntradaComercial.value = resultat;
      nextTick(() => {
        // textArea.value.$el.focus();
      })
    });

    const hide = () => {
      emit("update:carregat", false);
    }

    return {
      visible,
      hide,
      idEntradaMostrada,
      dadesEntradaComercial,
    };

  },
};
</script>

<style scoped>
:deep(.p-datatable-tbody > tr > td) {
  padding-top: 0;
  padding-bottom: 0;
  height: 35px;
  line-height: 35px;
}

:deep(.p-datatable-thead > tr > th) {
  height: 35px;
  line-height: 35px;
  padding-top: 0;
  padding-bottom: 0;
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
</style>
