<template>
  <EditarLiniaComandaEDI v-if="visibleEditarLinia" :carregat="visibleEditarLinia" :codlin="registreSeleccionat.codi"
    :linia="liniaModal" :callbackGuardarOk="editLiniaRefresh" @update:carregat="visibleEditarLinia = $event;" />
  <AjudaStocks v-if="visibleAjudaStocks" :carregat="visibleAjudaStocks" @update:carregat="visibleAjudaStocks = $event"
    :artint="informacioComandaArtcli.artint" :clicod="informacioComandaArtcli.codiClient" />
  <AjudaLlistatAlbarans v-if="visibleAjudaLlistatAlbarans" :carregat="visibleAjudaLlistatAlbarans"
    :codiarticle="liniesEDI.codiArticle" :codiclient="liniesEDI.codiClient" :codicomanda="liniesEDI.comanda.codi"
    :tipusClient="liniesEDI.comanda.clientProfile.tipedi" @update:carregat="visibleAjudaLlistatAlbarans = $event;"
    :ediultalbara="liniesEDI.ultimAlbara" :ediacumulat="liniesEDI.acumulatArticle"
    :acumulatsdata="liniesEDI.dataAcumulat" :acumulatsestoc="liniesEDI.stockAcumulat"
    :acumulatsalbara="liniesEDI.albaraAcumulat" :acumulatscoincideixen="liniesEDI.coincideixenAcumulats"
    :callbackCanviarUltimAlbaraOk="canviaRefresh" @update:recarregaTaula="carregaLinies()"
    @canviultimalbara:noualbara="ultalbara = $event;" />

  <!-- <AjudaLlistatAlbarans v-if="visibleAjudaLlistatAlbarans" 
    :carregat="visibleAjudaLlistatAlbarans" 
    :codiarticle="liniesEDI.codiArticle" :codiclient="liniesEDI.codiClient" 
    /> -->

  <!-- <AjudaArticleClient :visible="visibleAjudaArticleClient" @update:carregat="visibleAjudaArticleClient = true" -->
  <!-- <AjudaArticleClient/> -->

  <AjudaArticleClient :visible="visibleAjudaArticleClient" @update:carregat="visibleAjudaArticleClient = false"
    :client="liniesEDI.codiClient" :seleccioCallback="callbackAjudaArticleClient" />
  <ModalMissatgesEDIArticleClient v-if="visibleMissatgesEDI" :carregat="visibleMissatgesEDI"
    :cliCod="liniesEDI.codiClient" :artInt="liniesEDI.codiArticle"
    @update:carregat="visibleMissatgesEDI = $event" />

  <!-- <AjudaArticleClient :visible="visibleAjudaArticleClient" @update:carregat="visibleAjudaArticleClient = false"
    @switch="visibleAjudaArticleClient = false; visibleAjudaArticleClientByArticle = true; ultimaAjudaVisibleByClient = true;"
    :client="liniesEDI.codiClient" :seleccioCallback="callbackAjudaArticleClient" /> -->
  <div class="card">
    <h5 class="card-header">
      <div style="display: flex;align-items: center;">
        <i class="pi pi-arrow-left icona-boto" @click="tornar()" v-tooltip="$t('App.Tornar')"
          style="margin-right: 10px;" />
        {{ $t('ComandesEDI.linies.titol') }}
        <span v-if="liniesEDI.linies?.length > 0">
          <Button :label="$t('ComandesEDI.linies.accions.rollback') + ' [ctrl+r]'" icon="pi pi-undo" class="p-button-sm"
            style="margin-left: 15px" @click="refresh()" />
        </span>
        <span v-if="!liniesEDI.codiArticle?.startsWith('ERROR_REF')">
          <Button :label="$t('ComandesEDI.linies.accions.albarans') + ' [ctrl+a]'" icon="pi pi-eye" class="p-button-sm"
            style="margin-left: 15px;" @click="veureAlbarans()" />
        </span>
        <Button :label="'PDF Indra' + ' [ctrl+i]'" icon="pi pi-file-pdf" class="p-button-sm"
          style="margin-left: 15px;" @click="clickDescarregaComanda()" />
        <Button :label="'PDF Ames'" icon="pi pi-file-pdf" class="p-button-sm"
          style="margin-left: 15px;" @click="clickDescarregaFormatPdf()" />
        <Button :label="$t('ModalMissatgesEDI.Titol')" icon="fa-solid fa-envelope-open-text" class="p-button-sm"
          style="margin-left: 15px;" @click="visibleMissatgesEDI = true" />
        <!-- <span v-if="liniesEDI.linies?.length > 0"> -->
        <Divider layout="vertical" style="margin-inline: 15px;" />
        <!-- </span> -->
        <span v-if="liniesEDI.linies?.length > 0 && !liniesEDI.codiArticle?.startsWith('ERROR_REF')">
          <Button :label="$t('ComandesEDI.linies.accions.processa') + ' [ctrl+g]'" icon="pi pi-check-circle"
            class="p-button-sm" style="background-color: green; border-color: green"
            @click="processaArticleComanda()" />
        </span>
        <span v-if="liniesEDI.codiArticle?.startsWith('ERROR_REF')">
          <InputText v-model="articleClient" style="width: 220px;" />&nbsp;
          <ButtonShortcut @click="showAjudaArticleClient(liniesEDI.codiClient)" icon="fa-solid fa-binoculars"
            :shortcut="'[Ctrl+B]'" class="p-button-sm" />
          <Button :label="$t('ComandesEDI.linies.accions.assignareferencia')" icon="pi pi-check-circle"
            class="p-button-sm" style="margin-left: 15px;" @click="clickAssignaRefereciaPong()" />
        </span>
        <Divider layout="vertical" style="margin-inline: 15px;" />
        <span>
          <Button :label="$t('ComandesEDI.linies.accions.esborra') + ' [ctrl+x]'" icon="pi pi-trash" class="p-button-sm"
            style="margin-left: 108px; background-color: red; border-color: red" @click="clickBorraArticleComanda()" />
        </span>
      </div>
    </h5>
    <!--TODO posar icones d'opcions del llistat de forma adecuada-->
    <div class="card-body">
      <div>
        <Panel>
          <template #header>
            <div style="display: flex; align-items: center; height: 20px; gap: 40px;">
              <div class="columnatitol"
                style="display: flex; flex-direction: column; align-items: flex-start; margin: 0; padding: 0;">
                <span class="texttitol"
                  style="font-size: 22px; font-weight: 600; margin: 0; padding: 0; line-height: 1; display: inline-block;">
                  [{{ liniesEDI.comanda?.document }}]
                </span>
              </div>
              <div class="columnatitol"
                style="display: flex; flex-direction: column; align-items: flex-start; margin: 0; padding: 0;">

                <label class="labeltitol"
                  style="font-size: 12px; font-weight: 600; margin: 0; padding: 0; line-height: 1;">
                  {{ $t('Comandes.Articleclient') }}
                </label>

                <span class="texttitol"
                  style="font-size: 22px; font-weight: 600; margin: 0; padding: 0; line-height: 1; display: inline-block;">
                  <i class="pi pi-copy cursor-pointer"
                    @click="copy2clipboard(liniesEDI.codiArticleFab + liniesEDI.codiClient)" />
                  {{ liniesEDI.codiArticleFab }}{{ liniesEDI.codiClient }}
                </span>
              </div>
              <div class="columnatitol"
                style="display: flex; flex-direction: column; align-items: flex-start; margin: 0; padding: 0;">
                <label class="labeltitol"
                  style="font-size: 12px; font-weight: 600; margin: 0; padding: 0; line-height: 1;">
                  {{ $t('Comandes.Referencia') }}
                </label>
                <span class="texttitol"
                  style="font-size: 22px; font-weight: 600; margin: 0; padding: 0; line-height: 1; display: inline-block;">
                  <span v-if="articlesLiniaEDI.length > 1" style="font-size: 22px; font-weight: 600;"
                    v-tooltip="'referencia'">
                    <i class="pi pi-copy cursor-pointer" @click="copy2clipboard(liniesEDI.codiArticleAmes)" />
                    <Dropdown v-model="liniesEDI.codiArticle" :options="filteredOptions" optionLabel="codiArticleAmes"
                      optionValue="codiArticle" :placeholder="$t('ComandesEDI.filtre.articles')" class="col-md-3"
                      style="width: 160px;font-size: 22px; font-weight: 600;" @update:modelValue="aplicaFiltreNou" />
                  </span>
                  <span v-else>
                    <i class="pi pi-copy cursor-pointer" @click="copy2clipboard(liniesEDI.codiArticleAmes)" />
                    {{ liniesEDI.codiArticleAmes }}
                  </span>
                </span>
              </div>
              <div class="columnatitol"
                style="display: flex; flex-direction: column; align-items: flex-start; margin: 0; padding: 0;">
                <label class="labeltitol"
                  style="font-size: 12px; font-weight: 600; margin: 0; padding: 0; line-height: 1;">
                  {{ $t('Comandes.Client') }}
                </label>
                <span class="texttitol"
                  style="font-size: 22px; font-weight: 600; margin: 0; padding: 0; line-height: 1; display: inline-block;">
                  {{ liniesEDI.nomClientAmes }}
                </span>
              </div>
            </div>
          </template>
          <div style="display: grid; grid-template-columns: 30% 30% 30% auto; grid-template-rows: repeat(4, auto); gap: 5px; width: 100%;
                        margin: -10px -10px -10px -10px">
            <!-- Fila 1 -->
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
              <label class="label-detall">{{ $t('Comandes.DenomNt') }}:</label>
              <span v-if="informacioComandaArtcli"
                v-tooltip="`${informacioComandaArtcli.denominacio} / ${informacioComandaArtcli.nivellTecnic}`">
                {{ ` ${informacioComandaArtcli.denominacio} / ${informacioComandaArtcli.nivellTecnic}` }}
              </span>
            </div>
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
              <label class="label-detall">{{ $t('Comandes.Stock total') }}:</label>
              <span v-if="informacioComandaArtcli" style="margin-left: 2px;"
                :class="{ 'stock-satelit': informacioComandaArtcli.isTePesesSatelit }">
                {{ $n(informacioComandaArtcli.stockTotal) }}
              </span>
              <Button icon="pi pi-eye" @click="visibleAjudaStocks = true" class="p-button-rounded botoveurestock" />
            </div>
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
              <label class="label-detall"> {{ `${$t('ComandesEDI.linies.comanda.missatge')}:` }}</label>
              {{ liniesEDI.missatgeNumero }}
            </div>
            <!-- Fila 2 -->
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
              <label class="label-detall">{{ $t('Comandes.Fabrica') }}:</label>
              <span v-if="informacioComandaArtcli"
                v-tooltip="`${informacioComandaArtcli.codiFabrica} - ${informacioComandaArtcli.descFabrica}`">
                {{ ` ${informacioComandaArtcli.codiFabrica} - ${informacioComandaArtcli.descFabrica}` }}
              </span>
            </div>
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
              <label class="label-detall"> {{ `${$t('Comandes.Embalatge')}: ` }} </label>
              <span v-if="informacioComandaArtcli" v-tooltip="$t('Comandes.Embalatge resultat', [$n(informacioComandaArtcli.unitatsEmbalatge),
              informacioComandaArtcli.numCaixesPalet,
              $n(informacioComandaArtcli.unitatsEmbalatge * informacioComandaArtcli.numCaixesPalet)])">
                {{ ` ${$n(informacioComandaArtcli.unitatsEmbalatge * informacioComandaArtcli.numCaixesPalet)} =
                ${$n(informacioComandaArtcli.unitatsEmbalatge)} x ${informacioComandaArtcli.numCaixesPalet}` }}
              </span>
            </div>
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
              <label class="label-detall"> {{ `${$t('Comandes.Enviament')}:` }} </label>
              <span v-if="informacioComandaArtcli"
                v-tooltip="`${$t(`FormaEnviament.${informacioComandaArtcli.formaEnviament}`)} • ${informacioComandaArtcli.incoterm} • ${$destiTransport(informacioComandaArtcli.desti)}`">
                {{ ` ${$t(`FormaEnviament.${informacioComandaArtcli.formaEnviament}`)} •
                ${informacioComandaArtcli.incoterm} •
                ${$destiTransport(informacioComandaArtcli.desti)}` }}
              </span>
            </div>
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 140px;"></div>
            <!-- Fila 3 -->
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
              <label class="label-detall"> {{ `${labelEmpresa(1)}: ` }}</label>
              <span v-if="informacioComandaArtcli"
                v-tooltip="`${informacioComandaArtcli.codiEmpresa} - ${informacioComandaArtcli.descEmpresa}`">
                {{ ` ${informacioComandaArtcli.codiEmpresa} - ${informacioComandaArtcli.descEmpresa}` }}
              </span>
            </div>
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
              <label class="label-detall">{{ `${labelMagatzem(1)}: ` }}</label>
              <span v-if="informacioComandaArtcli"
                v-tooltip="`${informacioComandaArtcli.magatzemEntrada} - ${informacioComandaArtcli.magatzemEntradaDesc}`">
                {{ ` ${informacioComandaArtcli.magatzemEntrada} - ${informacioComandaArtcli.magatzemEntradaDesc}` }}
              </span>
            </div>
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
              <label class="label-detall"> {{ `${$t('Comandes.Transportista')}:` }} </label>
              <span v-if="informacioComandaArtcli"
                v-tooltip="$transportista(informacioComandaArtcli.codiTransportista)">
                {{ ` ${$transportista(informacioComandaArtcli.codiTransportista)}` }}
              </span>
            </div>
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 140px;"></div>
            <!-- Fila 4 -->
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
              <span v-if="informacioComandaArtcli?.codiEmpresa !== informacioComandaArtcli?.codiEmpresaEntrega">
                <label class="label-detall"> {{ `${labelEmpresa(2)}: ` }}</label>
                <span v-tooltip="`${informacioComandaArtcli.codiEmpresaEntrega} - ${informacioComandaArtcli.descEmpresaEntrega}`">
                  {{ ` ${informacioComandaArtcli.codiEmpresaEntrega} - ${informacioComandaArtcli.descEmpresaEntrega}` }}
                </span>
              </span>
            </div>
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
              <span v-if="informacioComandaArtcli?.magatzemEntrada !== informacioComandaArtcli?.magatzemSortida">
                <label class="label-detall">{{ `${labelMagatzem(2)}: ` }}</label>
                <span v-tooltip="`${informacioComandaArtcli.magatzemSortida} - ${informacioComandaArtcli.magatzemSortidaDesc}`">
                  {{ ` ${informacioComandaArtcli.magatzemSortida} - ${informacioComandaArtcli.magatzemSortidaDesc}` }}
                </span>
              </span>
            </div>
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
              <span v-if="informacioComandaArtcli">
                <label class="label-detall"> {{ `${$t('Comandes.Dies transit')}:` }} </label>
                {{ `${informacioComandaArtcli.diesTransitClient} ` }}
              </span>
            </div>
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
            </div>
            <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 140px;"></div>
          </div>
        </Panel>
        <!-- <label>
          <Checkbox v-model="ordenarPerData" @change="guardarPreferencia" binary />
          Ordenar per data sol·licitada
        </label> -->
        <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;">
          <template #item="{ item }">
            <div @click="item.action" style="cursor: pointer;">
              <Button :icon="item.icon" :label="item.label()" :class="item.class" v-if="!item?.hide?.()" />
            </div>
          </template>
        </ContextMenu>
        <div id="divLinies" style="margin-top: 15px;">
          <DataTable v-model:expandedRows="expandedRows" :value="liniesEDI.linies" class="p-datatable-sm"
            :dataKey="codiNumeroFormat" style="margin-top: 15px;" :scrollable="true" scrollHeight="65vh"
            :resizableColumns="true" columnResizeMode="expand" contextMenu
            v-model:contextMenuSelection="registreSeleccionat" @rowContextmenu="showContextMenu($event)" showGridlines
            v-model:selection="registreSeleccionat" selectionMode="single" :rowClass="() => 'estilRow'"
            @row-select="selectedIndex = $event.index"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            :rowsPerPageOptions="[15, 30, 50]" :paginator="false" :rows="15"
            :sortField="sortField"
            :sortOrder="sortOrder"
            @sort="onSort"
            >
            <template #empty>
              <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
                <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('EDI.Cap comanda')" />
              </div>
            </template>
            <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 100%;"><!-- v-if="data.processable">-->
                  <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                    @click="registreSeleccionat = data; contextMenu.show($event)" />
                </div>
              </template>
            </Column>
            <!-- <Column :header="P" style="max-width: 35px;">
          <template #body="{ data }">
            <span v-if="data.processable">
              !
            </span>
          </template>
        </Column>         -->
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.codiComandaLiniaClientEDI')"
              style="max-width: 200px;">
              <template #body="{ data }">
                {{ data.codiComandaClient }}
                <!-- <span v-if="data.codiLiniaClient && data.codiLiniaClient.trim() !== ''">
              /{{ data.codiLiniaClient }}
            </span> -->
              </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.codiComandaLiniaClient')" style="max-width: 200px;">
              <template #body="{ data }">
                {{ data.codiComandaClientProcessat }}
                <!-- <span v-if="data.codiLiniaClientProcessat && data.codiLiniaClientProcessat.trim() !== ''">
              /{{ data.codiLiniaClientProcessat }}
            </span> -->
              </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.tipus')" style="max-width: 55px;">
              <template #body="{ data }">
                <div style="width: 100%; text-align: center;">
                  <ColumnaTipusComanda :tipus="data.tipus" />
                </div>
              </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.quantitat')" :style="{ width: '150px' }"
              style="max-width: 150px;text-align: right;">
              <template #body="{ data }">
                <div style="width: 100%; text-align: right;">
                  {{ $n(data.quantitat) }}
                </div>
              </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.quantitatactual')" :style="{ width: '150px' }"
              style="max-width: 150px;text-align: right;">
              <template #body="{ data }">
                <div style="width: 100%; text-align: right;" v-tooltip="$n(data.quantitatProcessat)">
                  {{ $n(data.quantitatPendent) }}
                </div>
              </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.dataclient')" :style="{ width: '160px' }"
              style="max-width: 160px;text-align: right;" field="dataClient" sortable>
              <template #body="{ data }">
                {{ data.dataClient ? $d(data.dataClient, 'short') : '-' }}
              </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.dataames')" :style="{ width: '200px' }"
              style="max-width: 200px;">
              <template #body="{ data }">
                <!-- {{ calculaDiaSortida(data.dataAMES,'5','XXXXX')}}.. -->
                <!-- {{ data.dataAMES ? $d(data.dataAMES, 'short') : $d(calculaDiaSortida(toDate(data.dataClient),liniesEDI.perfilDiesResta,liniesEDI.perfilDiesSortida), 'short') }} -->
                <!-- {{ $d(calculaDataAmes(data.codi,data.dataClient,liniesEDI.perfilDiesResta,liniesEDI.perfilDiesSortida),'short') }} -->
                {{ data.dataAMES ? $d(data.dataAMES, 'short') : '-' }}
                <!-- {{ data.dataClient ? $d(calculaDiaSortidaMagatzem(calculaDiaSortida(toDate(data.dataClient),liniesEDI.perfilDiesResta,liniesEDI.perfilDiesSortida),liniesEDI.articleDiesTransit), 'short') : new Date() }} -->
                <!-- {{ $d(calculaDataMagatzem(data.codi,data.dataClient,data.dataAMES,liniesEDI.articleDiesTransit,liniesEDI.perfilDiesSortida,liniesEDI.perfilDiesResta),'short') }} -->
                <span v-if="data.dataMagatzem !== null">
                  &nbsp;-- {{ data.dataMagatzem ? $d(data.dataMagatzem, 'short') : '-' }}
                </span>
              </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.dataConfirmada')" :style="{ width: '140px' }"
              style="max-width: 140px;">
              <template #body="{ data }">
                {{ data.dataConfirmadaFabrica ? $d(data.dataConfirmadaFabrica, 'short') : '-' }}
              </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.acumulat')" :style="{ width: '120px' }"
              style="max-width: 120px;">
              <template #body="{ data }">
                <div style="width: 100%; text-align: right;">
                  {{ $n(data.quantitatAcumulada) }}
                </div>
              </template>
            </Column>
            <Column :header="$t('ComandesEDI.linies.taula_liniesEDI.acumulatActual')" :style="{ width: '120px' }"
              style="max-width: 120px;text-align: right;">
              <template #body="{ data }">
                <div style="width: 100%; text-align: right;" v-tooltip="$n(data.quantitatAcumuladaProcessat)">
                  {{ $n(data.quantitatAcumuladaPendent) }}
                </div>
              </template>
            </Column>
            <Column :header="$t('ComandesEDI.taula_comandesEDI.observacions')" :style="{ width: '80px' }"
              style="max-width: 80px;">
              <template #body="{ data }">
                <!-- <span v-if="data.status !== 'DRAFT'">
                  <Tag v-if="data.status === 'WARNING'" value="Veure" class="p-button-sm"
                    style="background-color: orange;border-color: orange" v-tooltip.top="data.observacions" />
                  <Tag v-if="data.status === 'ERROR'" value="Veure" class="p-button-sm"
                    style="background-color: red;border-color: red;" v-tooltip.top="data.observacions" />
                </span> -->
                <Button icon="pi pi-comments" v-if="data.comentarisInterns" v-tooltip.top="data.comentarisInterns"
                  class="p-button-rounded buttoicon" :class="{ 'buttoicondisabled': !data.comentarisInterns }" />
                <Button icon="pi pi-megaphone" v-if="data.comentarisClient" v-tooltip.top="data.comentarisClient"
                  class="p-button-rounded buttoicon" :class="{ 'buttoicondisabled': !data.comentarisClient }" />
              </template>
            </Column>
            <!-- <Column header="##dev_data##" :style="{ width: '400px', whe: 'red' }"
        style="max-width: 400px;color:gray;font-size: xx-small;">
        <template #body="{ data }">
          <span style="color:gray; font-size: xx-small;">
            {{ "art: " + data.codiArticle + " codi: " + data.codi }}
            <a :href="`http://localhost:3535/comercial/comandes/EDI/txt/${data.codiComanda}`">EDI local</a>
          </span>
        </template>
        </Column> -->
            <!--Column :header="$t('ComandesEDI.taula_comandesEDI.comentarisames')" :style="{ width: '330px' }"
        style="max-width: 330px;">
        <template #body="{ data }">
          {{ data.observacions }}
        </template>
        </Column>      
        <Column :header="$t('ComandesEDI.taula_comandesEDI.alertesames')" :style="{ width: '330px' }"
        style="max-width: 330px;">
        <template #body="{ data }">
          {{ data.observacions }}
        </template>
        </Column-->
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EDIService from '@/services/edi.service';
// import Checkbox from 'primevue/checkbox';
import EditarLiniaComandaEDI from "./modals/CrearEditarLiniaComandaEDI.vue";
import AjudaArticleClient from './modals/AjudaArticleClient.vue';
import AjudaStocks from '@/views/modals/AjudaStocks.vue';
import { carrega } from '@/services/loader';
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref, watch, reactive, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { scrollCenter } from '@/utils/datetableUtils.js';
import ediService from '@/services/edi.service';
import ComandesService from '@/services/comandes.service';
import { useToast } from "primevue/usetoast";
import { saveAs } from 'file-saver';
import { useConfirm } from 'primevue/useconfirm';
import ColumnaTipusComanda from '@/components/ColumnaTipusComanda.vue';
import AjudaLlistatAlbarans from './modals/AjudaLlistatAlbarans.vue';
import ModalMissatgesEDIArticleClient from './modals/ModalMissatgesEDIArticleClient.vue';
import Swal from 'sweetalert2';
import { copyText } from 'vue3-clipboard';

export default {
  name: 'LiniesEDIView',
  components: {
    EditarLiniaComandaEDI,
    AjudaLlistatAlbarans,
    // AjudaLlistatAlbaransConsulta,
    AjudaStocks,
    AjudaArticleClient,
    ColumnaTipusComanda,
    ModalMissatgesEDIArticleClient
    //  Dropdown
  },
  data() {
    return {
      sortField: localStorage.getItem('sortField') || 'dataClient',
      sortOrder: parseInt(localStorage.getItem('sortOrder')) || 1,
    };
  },
  methods: {
    onSort(event) {
      this.sortField = event.sortField;
      this.sortOrder = event.sortOrder;

      // Guardar en localStorage
      localStorage.setItem('sortField', event.sortField);
      localStorage.setItem('sortOrder', event.sortOrder);
    }
  },
  //  methods: {
  //   onDropdownChange() {
  //     console.log('Valor seleccionado:', this.filtreArticles);
  //     console.log("Codi de comanda " + localStorage.getItem('codiComanda'));
  //     let data = this.carrega(EDIService.llistaLiniesArticles(localStorage.getItem('codiComanda'),this.filtreArticles));
  //     this.liniesEDI.value = data;
  //     this.refresh();
  //   }

  //  selectOption() {
  //    this.filtreArticles = 'BK2Q   9T522AA';
  //  }
  //  },
  //   mounted() {
  //     // Seleccionar dinámicamente una opción cuando se monta el componente
  //     //this.selectOption()
  //     console.log('In mounted: ' + this.filtreArticles)
  //   },
  setup(props, { emit }) {
    //
    const overlayPanel = ref(null);
    const { t } = useI18n();
    const titolResultats = ref('');
    const visibleEditarLinia = ref(false); // TODO Posar a true
    const visibleAjudaLlistatAlbarans = ref(false);
    const visibleAjudaStocks = ref(false);
    const visibleAjudaArticleClient = ref(false);
    const visibleMissatgesEDI = ref(false);
    const elementLinies = () => document.getElementById('divLinies');
    const liniesEDI = ref([]);
    const articlesLiniaEDI = ref([]);
    const filtreArticles = ref([]);
    const route = useRoute();
    const router = useRouter();
    const contextMenu = ref();
    const registreSeleccionat = ref();
    const selectedIndex = ref(-1);
    const confirm = useConfirm();
    const expandedRows = ref(new Array());
    const toast = useToast();
    const liniaModal = ref();
    var codiclient = ref();
    const articleClient = ref();
    const informacioComandaArtcli = ref();
    const toDate = inject('toDate');
    const ordenarPerData = ref(false);

    const state = reactive({
      dataClient: new Date(),
      dataAmes: new Date(),
      dateMagatzem: new Date(),
      quantitat: 0,
      tipus: 'FERM'
      // articleclient: '',
      // mostrarEliminades: false,
    });

    //let codiComanda = ref();

    const copy2clipboard = (txt) => {
      copyText(txt, undefined, (error, event) => {
        if (error) {
          console.log(error, event);
          toast.add({ severity: 'warn', summary: t('ComandesEDI.linies.error.noArticle.missatge'), life: 5000 });
        } else {
          //console.log(event)
          toast.add({ severity: 'success', summary: t('Comandes.copiarportapapeles.copiat.detail'), life: 5000 });
        }
      });
    }

    const mostraToastAcumulats = () => {
      Swal.fire({
        icon: 'info',
        title: t('ComandesEDI.linies.error.acumulatsNoCoicideixen.titol'),
        html: t('ComandesEDI.linies.error.acumulatsNoCoicideixen.missatge')
      });
    }

    const mostraToastNoArticle = () => {
      Swal.fire({
        icon: 'info',
        title: t('ComandesEDI.linies.error.noArticle.titol'),
        html: t('ComandesEDI.linies.error.noArticle.missatge')
      });
    }

    const mostraToastNoUltimAlbara = () => {
      Swal.fire({
        icon: 'info',
        title: t('ComandesEDI.linies.error.noUltimAlbara.titol'),
        html: t('ComandesEDI.linies.error.noUltimAlbara.missatge')
      });
    }

    const showStocks = () => {
      visibleAjudaStocks.value = true;
    }

    const clickDescarregaComanda = async () => {
      // Comprovació si s'han afegit línies
      console.log("liniesEDI.codiClient: " + JSON.stringify(liniesEDI.value.comanda));

      let resp = await (carrega(ediService.descarregaComanda(liniesEDI.value.comanda.codi)));
      saveAs(new Blob([resp]), nomFitxer.value);
    }

    const clickDescarregaFormatPdf = async () => {
      let resp = await (carrega(ediService.descarregaFormatPdfAmes(liniesEDI.value.comanda.pathEDI)));
      saveAs(new Blob([resp]), nomFitxer.value);
    }

    const nomFitxer = computed(() => {
      if (liniesEDI.value.comanda.pathPDF) {
        return liniesEDI.value.comanda.pathPDF.split("/").pop();
      }
      return liniesEDI.value.comanda.missatgeNumero + ".pdf"; // Valor por defecto si pathPDF no está definido
    });

    const handler = (event) => {
      if (event.ctrlKey && event.key === "b") {
        event.preventDefault();
        console.log("Guardando .. ", articleClient.value);
        showAjudaArticleClient(codiclient.value);
      }
      if (event.ctrlKey && event.key === "r") {
        refresh();
      }
      if (event.ctrlKey && event.key === "a") {
        event.preventDefault();
        veureAlbarans();
      }
      if (event.ctrlKey && event.key === "i") {
        event.preventDefault();
        clickDescarregaComanda();
      }
      if (event.ctrlKey && event.key === "g") {
        event.preventDefault();
        processaArticleComanda();
      }
    };

    // const descuadreAcumulat = computed(() => {
    //   console.log(">> descuadreAcumulat ejecutado");
    //   console.log(">> descuadreAcumulat // coincideixenAcumulats2: ", liniesEDI.value.coincideixenAcumulats);
    //   return liniesEDI.value.coincideixenAcumulats;
    // });

    onMounted(async () => {
      console.log("articleClient: " + liniesEDI.value);

      const preferencia = localStorage.getItem('sortOrder');
      ordenarPerData.value = preferencia === 'true';

      carregaLinies();

      window.addEventListener("keydown", handler);

      // nextTick(() => {
      //   carregaLinies();
      // });
      // console.log("liniesEDI.value.coincideixenAcumulats", liniesEDI.value.coincideixenAcumulats);



    });

    // function guardarPreferencia() {
    //   localStorage.setItem('sortOrder', ordenarPerData.value.toString());
    // }

    const clickBorraArticleComanda = async () => {

      console.log("clickBorraArticleComanda//codiComanda: " + liniesEDI.value.comanda.codi)
      console.log("clickBorraArticleComanda//codiArticle: " + liniesEDI.value.codiArticle)

      confirm.require({
        header: t('App.Confirmacio'),
        acceptClass: 'p-button-danger',
        message: t('ComandesEDI.ConfirmaBorrar'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          carrega(ediService.borraArticleComanda(liniesEDI.value.comanda.codi, liniesEDI.value.codiArticle)).then(() => {
            toast.add({ severity: 'success', summary: 'Eliminada', life: 3000 });

          })
          if (articlesLiniaEDI.value.length > 1) {
            carregaLinies();
            articlesLiniaEDI.value = carrega(EDIService.opcionsArticlesLinies(route.params.id));
          }
          else
            router.push({ name: 'comandesEDI' });
        },
        reject: () => {
        }
      });
    }

    const carregaLinies = async () => {
      console.log("carregaLinies");
      liniesEDI.value = [];
      liniesEDI.value = await carrega(EDIService.llistaLinies(route.params.id));
      // console.log("liniesEDI: " + JSON.stringify(liniesEDI.value));
      articlesLiniaEDI.value = await carrega(EDIService.opcionsArticlesLinies(route.params.id))
      codiclient = liniesEDI.value.codiClient;

      if (!liniesEDI.value.codiArticle)
        mostraToastNoArticle()
      else {
        if (liniesEDI.value.comanda?.clientProfile.encoalb == "S") {
          if (liniesEDI.value.ultimAlbara == "" || liniesEDI.value.ultimAlbaraRebutTrobat == false)
            mostraToastNoUltimAlbara()
          else if (!liniesEDI.value.coincideixenAcumulats)
            mostraToastAcumulats()
        }
      }

      console.log("informacioComandaArtcli.value de: ", liniesEDI.value.codiArticleFab + liniesEDI.value.codiClient);

      informacioComandaArtcli.value = await carrega(ComandesService.obtenirArticleClient(liniesEDI.value.codiArticleFab + liniesEDI.value.codiClient));
      // this.cargado = true;
      console.log("info: ", informacioComandaArtcli);

    }

    const editarLinia = async () => {
      console.log("|||||registreSeleccionat.value.codi", registreSeleccionat);

      // Construcció del request i s'obre el modal
      if (registreSeleccionat.value) {
        liniaModal.value = registreSeleccionat.value;
        // liniaModal.value.dataAMES = liniaModal.value.dataAMES ? liniaModal.value.dataAMES : calculaDiaSortida(toDate(liniaModal.value.dataClient),liniesEDI.value.perfilDiesResta,liniesEDI.value.perfilDiesSortida);
        // liniaModal.value.dataMagatzem = calculaDiaSortidaMagatzem(liniaModal.value.dataAMES,liniesEDI.value.articleDiesTransit);
        // console.log("######registreSeleccionat.value: " + registreSeleccionat.value);

        visibleEditarLinia.value = true;
      }
    }


    watch(registreSeleccionat, () => {
      console.log(">>>>watch.registreSeleccionat ", registreSeleccionat);

    });

    // const crearLinia = async () => {
    //   // Construcció del request i s'obre el modal
    //   if (registreSeleccionat.value) {
    //     liniaModal.value = null;
    //     // liniaModal.value.dataAMES = liniaModal.value.dataAMES ? liniaModal.value.dataAMES : calculaDiaSortida(toDate(liniaModal.value.dataClient),liniesEDI.value.perfilDiesResta,liniesEDI.value.perfilDiesSortida);
    //     // liniaModal.value.dataMagatzem = calculaDiaSortidaMagatzem(liniaModal.value.dataAMES,liniesEDI.value.articleDiesTransit);
    //     // console.log("######registreSeleccionat.value: " + registreSeleccionat.value);

    //     visibleEditarLinia.value = true;
    //   }
    // }

    // const callbackEditarLinia = async () => {
    //   console.log("callbacklinia");

    // }

    // onMounted(async () => {
    //   //console.log("data-> " + data[12].pathPDF.split("\\").pop());
    //   // carregaLinies();
    // });


    const filteredOptions = computed(() => {
      console.log("filtrats:" + JSON.stringify(articlesLiniaEDI.value.filter(option => option.codiArticle !== "")));
      // console.log("filtre: " + articlesLiniaEDI.value.filter(option));
      return articlesLiniaEDI.value.filter(option => option.codiArticle !== "");
    });

    const veureAlbarans = async () => {
      console.log(">>veureAlbarans//liniesEDI.value.ultimAlbara #" + liniesEDI.value.ultimAlbara + "#")
      console.log(">>veureAlbarans//liniesEDI.value.codiArticle #" + liniesEDI.value.codiArticle + "#")
      console.log(">>veureAlbarans//liniesEDI.value.codiClient #" + liniesEDI.value.codiClient + "#")
      visibleAjudaLlistatAlbarans.value = true;
      console.log(">>veureAlbarans//visibleAjudaLlistatAlbarans.value #" + visibleAjudaLlistatAlbarans.value + "#")
    };

    const processaArticleComanda = async () => {
      // var returnString = 
      await carrega(EDIService.processaLiniesArticleComanda(route.params.id, liniesEDI.value.codiArticle, liniesEDI.value));
      // saveAs(new Blob([JSON.stringify(returnString)]), "out_" + Date.now() + ".json");
      console.log("Numero articles pendents de processar: " + articlesLiniaEDI.value.length)
      if (articlesLiniaEDI.value.length > 1) {
        // router.push({ name: 'liniesEDI', params: { id: liniesEDI.value.comanda?.codi } });
        // window.location.reload();
        carregaLinies();
        articlesLiniaEDI.value = await carrega(EDIService.opcionsArticlesLinies(route.params.id));
      }
      else
        router.push({ path: "/comandesEDI", query: { cargarDatos: true } });
      // router.push({ name: 'comandesEDI' });
    };

    const callbackAjudaArticleClient = async (seleccio) => {
      console.log("seleccio", seleccio);

      visibleAjudaArticleClient.value = false;
      articleClient.value = `${seleccio}`;
    }

    const hide = () => {
      emit('update:carregat', false);
    }

    watch(selectedIndex, () => {
      if (selectedIndex.value >= 0) {
        scrollCenter(elementLinies(), selectedIndex);
      }
    });

    watch(liniesEDI, () => {
      // console.log("####liniesEDI" + JSON.stringify(liniesEDI.value));

    });

    watch(filtreArticles, async () => {
      // console.log("filtreArticles: " + filtreArticles.value);
      liniesEDI.value = await carrega(EDIService.llistaLiniesArticles(route.params.id, filtreArticles.value));
      articlesLiniaEDI.value = await carrega(EDIService.opcionsArticlesLinies(route.params.id))
      informacioComandaArtcli.value = await carrega(ComandesService.obtenirArticleClient(liniesEDI.value.codiArticleFab + liniesEDI.value.codiClient));
    });

    const aplicaFiltreNou = async (filtreArticles) => {
      console.log("aplicaFiltreNou>>>>>>>>>>>>>filtreArticles: " + filtreArticles);
      liniesEDI.value = await carrega(EDIService.llistaLiniesArticles(route.params.id, filtreArticles));
      articlesLiniaEDI.value = await carrega(EDIService.opcionsArticlesLinies(route.params.id))
      informacioComandaArtcli.value = await carrega(ComandesService.obtenirArticleClient(liniesEDI.value.codiArticleFab + liniesEDI.value.codiClient));
    }

    // const showNode = async (e) => {
    //   var index = expandedRows.value.indexOf(e);
    //   if (index !== -1) {
    //     expandedRows.value.splice(index, 1);
    //   } else {
    //     let clau = `${e.codi}_${e.numero}`;
    //     liniesExpand.value[clau] = await carrega(EDIService.queryTarifes());
    //     expandedRows.value.push(e);
    //   }
    //   registreSeleccionat.value = e;
    // }

    const tornar = () => {
      router.push({ name: 'comandesEDI' });
    }

    const refresh = async () => {
      console.log("refreshLinies");

      liniesEDI.value = await carrega(EDIService.llistaLinies(route.params.id));
    }

    const editLiniaRefresh = async (request) => {
      console.log(">>>editLiniaRefresh///registreSeleccionat.value.codi ", registreSeleccionat.value.codi);
      console.log(">>>editLiniaRefresh///registreSeleccionat.value.codiLiniaProcessat ", registreSeleccionat.value.codiLiniaProcessat);
      console.log(">>>editLiniaRefresh///request ", request);

      // console.log("refresh");
      // liniesEDI.value.dataAmes=new Date();
      // var codi;
      // if (registreSeleccionat.value.codi===null)
      //   codi=registreSeleccionat.value.codiComandaClientProcessat
      // else
      //   codi=registreSeleccionat.value.codi
      let data = await carrega(EDIService.editaLiniaComanda(registreSeleccionat.value.codi, registreSeleccionat.value.codiLiniaProcessat, liniesEDI.value, request));
      console.log(">>>editLiniaRefresh///data ", data);
      liniesEDI.value = data;
      console.log(">>>editLiniaRefresh///liniesEDI.value ", liniesEDI.value);
      visibleEditarLinia.value = false;
      // liniesEDI.value.dataAmes=new Date();
    }

    // const mostraModal = () => {

    // }

    // const clickBorraLiniaComanda = async () => {
    //   console.log("clickBorraLiniaComanda//nom: " + registreSeleccionat.value.codi)
    //   confirm.require({
    //     header: t('App.Confirmacio'),
    //     acceptClass: 'p-button-danger',
    //     message: t('ComandesEDI.linies.ConfirmaBorrar', [registreSeleccionat.value.message]),
    //     icon: 'pi pi-exclamation-triangle',
    //     accept: () => {
    //       carrega(ediService.borraLiniaComanda(registreSeleccionat.value.codi)).then(() => {
    //         toast.add({ severity: 'success', summary: 'Eliminada', life: 3000 });
    //         refresh(registreSeleccionat.value.codi_comanda);
    //       })
    //     },
    //     reject: () => {
    //     }
    //   });

    // }

    // const clickBorraLiniaComandaPong = async () => {
    //   console.log("registreSeleccionat: " + JSON.stringify(registreSeleccionat.value));
    //   // console.log("liniesEDI.valuePRE: " + JSON.stringify(liniesEDI.value));
    //   let data = await carrega(ediService.borraLiniaComandaPong(registreSeleccionat.value.codi, liniesEDI.value));
    //   liniesEDI.value = data;
    //   //refresh(registreSeleccionat.value.codi_comanda);
    //   // console.log("camandaPOST: " + JSON.stringify(data));
    //   // console.log("liniesEDI.valuePOST: " + JSON.stringify(liniesEDI.value));

    // }

    const clickAssignaRefereciaPong = async () => {
      console.log("articleClient: " + articleClient.value);

      // console.log("liniesEDI.valuePRE: " + JSON.stringify(liniesEDI.value));
      let data = await carrega(ediService.assignaArticleClientPong(articleClient.value, liniesEDI.value));
      liniesEDI.value = data;
      //refresh(registreSeleccionat.value.codi_comanda);
      // console.log("camandaPOST: " + JSON.stringify(data));
      // console.log("liniesEDI.valuePOST: " + JSON.stringify(liniesEDI.value));

    }

    // const clickProcesaComanda = async () => {
    //   console.log(">>>>ClickPodesaComanda");

    //   await carrega(ediService.borraLiniaComandaPong(registreSeleccionat.value.codi, liniesEDI.value));
    // }

    // const contingutRetallat = (valor) => {
    //   if (!valor)
    //     return;
    //   return valor.substring(0, 10) + "...";
    // }

    const menuModel = ref([]);
    // const menuModelEdit = ref([]);

    // TODO Ara no funciona, pero cal controlar que per cada registre mostri l'opcio de descarregar PDF nomes quan la propietat pathPDF esta informada. Es a dir, no "undefined"
    // if (registreSeleccionat.value?.codi !== undefined) {

    menuModel.value = [
      {
        label: () => `${t('ComandesEDI.linies.taula_liniesEDI.menuregistre.editar')}`,
        class: 'p-button-text',
        icon: 'pi pi-pencil',
        command: () => editarLinia(registreSeleccionat.value.codi),
        // hide: () => registreSeleccionat.value.codi === null
      },
      // {
      //   label: () => `${t('ComandesEDI.linies.taula_liniesEDI.menuregistre.esborrar')}`,
      //   class: 'p-button-text',
      //   icon: 'pi pi-trash',
      //   command: () => clickBorraLiniaComandaPong(registreSeleccionat.value.codi)
      // }
    ];

    const showOverlay = (event) => {
      overlayPanel.value.toggle(event); // Muestra el OverlayPanel en el evento
    };

    const showAjudaArticleClient = () => {
      console.log("showAjudaArticleClient");

      //  codiclientpre=codiclient;

      visibleAjudaArticleClient.value = true;
    }

    const getCellStyle = (status) => {
      if (status === 'WARNING') {
        return { color: 'grey' };
      } else if (status === 'SUCCESS') {
        return { backgroundColor: '#d4edda', color: '#155724' };
      } else if (status === 'DANGER') {
        return { backgroundColor: '#f8d7da', color: '#721c24' };
      } else {
        return {};
      }
    };

    const labelEmpresa = (num) => {
        var numAdd = informacioComandaArtcli.value?.codiEmpresa !== informacioComandaArtcli.value?.codiEmpresaEntrega ? num : '';
          return t('Comandes.Emp fact') + ' ' + numAdd;
      }

      const labelMagatzem = (num) => {
        var numAdd = informacioComandaArtcli.value?.magatzemEntrada !== informacioComandaArtcli.value?.magatzemSortida ? num : '';
          return t('Comandes.Magatzem') + ' ' + numAdd;
      }

    // const calculaDataAmes = (codi,dataClient,diesTransit,patro) => {
    //   console.log("AliniesEDI.linies.codi:" + liniesEDI.value + "/" +codi);
    //   // liniesEDI.value.linies[1].codi="7777777777777";
    //   return calculaDiaSortida(dataClient,diesTransit,patro);
    // }

    // const calculaDataMagatzem = (codi,dataClient,dataAmes,diesTransit,patro,diesResta) => {
    //   console.log("BliniesEDI.linies.codi:" + liniesEDI.value + "/" +codi);
    //   // liniesEDI.value.linies[0].codi="66666666666666";
    //   console.log("dataClient: " + dataClient + " dataAmes: " + dataAmes + " diesTransit: " + diesTransit + " patro: " + patro + " diesResta: " + diesResta);
    //   if (dataAmes === null) {
    //     dataAmes = calculaDataAmes(dataClient,diesResta,patro);
    //   } 
    //   console.log("dataAmes calculada: " + dataAmes);
    //   return calculaDiaSortidaMagatzem(dataAmes,diesTransit);
    // }

    // const canviaDataAmes = (codi,data) => {
    //   i=0;
    //   for (let i=0;i<liniesEDI.value.lines.length;i++) {
    //     if liniesEDI.value.lines[i].codi===codi
    //   }
    // }

    return {
      copy2clipboard,
      // copiar,
      codiclient,
      articleClient,
      informacioComandaArtcli,
      titolResultats,
      registreSeleccionat,
      liniesEDI,
      articlesLiniaEDI,
      filtreArticles,
      selectedIndex,
      expandedRows,
      // descuadreAcumulat,
      // showNode,
      watch,
      showAjudaArticleClient,
      toast,
      router,
      contextMenu,
      tornar,
      menuModel,
      // menuModelEdit,
      refresh,
      veureAlbarans,
      processaArticleComanda,
      editLiniaRefresh,
      callbackAjudaArticleClient,
      state,
      hide,
      visibleEditarLinia,
      visibleAjudaLlistatAlbarans,
      visibleAjudaArticleClient,
      visibleAjudaStocks,
      visibleMissatgesEDI,
      showStocks,
      clickBorraArticleComanda,
      clickAssignaRefereciaPong,
      liniaModal,
      aplicaFiltreNou,
      overlayPanel,
      showOverlay,
      getCellStyle,
      filteredOptions,
      carregaLinies,
      toDate,
      ColumnaTipusComanda,
      clickDescarregaComanda,
      clickDescarregaFormatPdf,
      labelEmpresa,
      labelMagatzem
      // guardarPreferencia
    }

  },
  beforeRouteEnter(to, from, next) {
    async function load(vm) {
      await vm.carregaLinies();
    }

    next(vm => {
      load(vm);
    });
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

.botoveurestock {
  height: 1.5rem !important;
  width: 1.5rem !important;
  margin-left: 3px;
}

.label-detall {
  font-weight: 600;
  font-size: 1rem;
}
</style>