<template>
  <div>
    <DataTable :value="fitxes" class="p-datatable-sm"
            :scrollable="true" :scrollHeight="scrollHeight"
            :resizableColumns="true" columnResizeMode="expand"
            showGridlines
            selectionMode="single">
      <Column :header="$t('AjudaStocks.Empresa')" :style="{width:'280px'}" style="max-width: 280px;">
          <template #body="{data}">
              <div class="ellipsis" v-tooltip.top="$empresa(data.empresa)">{{ $empresa(data.empresa) }}</div>
          </template>
      </Column>
      <Column :header="$t('AjudaStocks.Magatzem')" :style="{width:'280px'}" style="max-width: 280px;">
          <template #body="{data}">
              <div class="ellipsis" v-tooltip.top="$magatzem(data.magatzem)">{{ $magatzem(data.magatzem) }}</div>
          </template>
      </Column>
      <Column :header="$t('AjudaStocks.Stock')" :style="{width:'180px'}" style="max-width: 180px; text-align: right;">
        <template #body="{data}">
          <div style="width: 100%; text-align: right;">
            {{ $n(data.stock) }}
          </div>
        </template>
      </Column>
      <Column v-if="hiHaIntermig" :header="$t('AjudaStocks.Stock intermig')" :style="{width:'180px'}" style="max-width: 180px; text-align: right;">
        <template #body="{data}">
          <div style="width: 100%; text-align: right;" :title="(data.magatzemsIntermitjos || []).map(m => $magatzem(m)).join(', ')">
            {{ data.stockIntermig ? $n(data.stockIntermig) : '—' }}
          </div>
        </template>
      </Column>
      <Column v-if="hiHaIntermig" :header="$t('AjudaStocks.Stock total')" :style="{width:'180px'}" style="max-width: 180px; text-align: right;">
        <template #body="{data}">
          <div style="width: 100%; text-align: right; font-weight: 600;">
            {{ $n(data.stockTotal) }}
          </div>
        </template>
      </Column>
      <Column v-if="isNormalitzat" :header="$t('AjudaStocks.Reserva')" :style="{width:'140px'}" style="max-width: 140px; text-align: right;">
        <template #body="{data}">
          <div style="width: 100%; text-align: right;">
            {{ $n(data.stockReservat) }}
          </div>
        </template>
      </Column>
    </DataTable>
    <div v-if="fitxesSatelit?.length > 0" style="margin-top: 15px;">
      <span class="stock-satelit">
        {{ $t('AjudaStocks.Atencio') }}
      </span>
      <span style="margin-left: 10px">{{ $t('AjudaStocks.Peces colocades estants satelits') }}</span>
      <DataTable :value="fitxesSatelit" class="p-datatable-sm"
              style="margin-top: 10px; width: 460px;"
              :scrollable="true" :scrollHeight="scrollHeight"
              :resizableColumns="true" columnResizeMode="expand"
              showGridlines
              selectionMode="single">
        <Column :header="$t('AjudaStocks.Satelits del magatzem')" :style="{width:'280px'}" style="max-width: 280px;">
            <template #body="{data}">
              <div class="ellipsis" v-tooltip.top="$magatzem(data.magatzem)">{{ $magatzem(data.magatzem) }}</div>
            </template>
        </Column>
        <Column :header="$t('AjudaStocks.Quantitat')" :style="{width:'180px'}" style="max-width: 180px; text-align: right;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              {{ $n(data.stock) }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FitxaStocks',
  props: {
    fitxes: { type: Array, default: () => [] },
    fitxesSatelit: { type: Array, default: () => [] },
    hiHaIntermig: { type: Boolean, default: false },
    isNormalitzat: { type: Boolean, default: false },
    scrollHeight: { type: String, default: '65vh' },
  },
}
</script>

<style scoped>
  .stock-satelit {
    background-color: #E1B3F0;
    border: 2px solid #9C79F7;
    border-radius: 8px;
    padding: 0px 2px;
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
</style>
