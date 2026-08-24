<template>
    <AjudaArticleClientByClient :visible="visibleAjudaArticleClientByClient" 
      @update:carregat="visibleAjudaArticleClientByClient = false" 
      @switch="switchAjuda"
      :seleccioCallback="callbackAjudaArticleClientByClient" />
    <AjudaArticleClientByArticle :visible="visibleAjudaArticleClientByArticle" 
      @update:carregat="visibleAjudaArticleClientByArticle = false" 
      @switch="switchAjuda"
      :seleccioCallback="callbackAjudaArticleClientByClient" />
    <AjudaDatesComandesEspecials :visible="visibleAjudaDates" @update:carregat="visibleAjudaDates = false"
      :dataInici="state.dataInici" :dataFi="state.dataFi" :callbackBusca="callbackBuscaDates" />
    <AjudaArticleClient :visible="visibleAjudaArticles" @update:carregat="visibleAjudaArticles = false"
      :client="informacioComandaArtcli?.codiClient"
      :seleccioCallback="callbackArticleSeleccionat" />
    <AjudaClientsConsumeixenArticle :visible="visibleAjudaClients" @update:carregat="visibleAjudaClients = false"
      :artint="informacioComandaArtcli?.artint" :article="informacioComandaArtcli?.aclfab"
      :seleccioCallback="callbackClientSeleccionat" />
    <ComandesEspecials v-if="visibleComandesEspecials" :carregat="visibleComandesEspecials"
      @update:carregat="visibleComandesEspecials = $event"
      @showProgramaArticle="showProgramaArticle"
      @refresh="refresh"
      :codiClient="informacioComandaArtcli?.codiClient" />
    <AjudaUltimsAlbarans v-if="visibleUltimsAlbarans" :carregat="visibleUltimsAlbarans" 
      @update:carregat="visibleUltimsAlbarans = $event;" :teEdi="false" :albarans="ultimsAlbarans" :artint="informacioComandaArtcli?.artint" :clicod="informacioComandaArtcli?.codiClient" @canviatUltimAlbara="obtenirUltimsAlbarans($event)"/>
    <CrearEditarLiniaComanda v-if="visibleCrearEditarLiniaComanda" :carregat="visibleCrearEditarLiniaComanda" 
      @update:carregat="visibleCrearEditarLiniaComanda = $event" :dataSolicitada="registreSeleccionat?.dataSolicitada" :tipus="registreSeleccionat?.tipus"
      :linia="liniaModal" :callbackGuardarOk="refresh" :comanda="registreSeleccionat.codi" :comandaClient="registreSeleccionat.comandaClient"
      :programa="registreSeleccionat.programa" :infoArticle="informacioComandaArtcli" 
      :teclaObrirModal="teclaObrirModal" v-model:teclaObrirModal="teclaObrirModal" />
    <HistoricLiniaComanda v-if="visibleHistoricLinia" :carregat="visibleHistoricLinia" @update:carregat="visibleHistoricLinia = $event"
      :comanda="registreSeleccionat.codi" :linia="registreSeleccionat.numero" />
    <CrearComanda v-if="visibleCrearComanda" :carregat="visibleCrearComanda" @update:carregat="visibleCrearComanda = $event"
      :articleClient="state.articleClient" :infoArticle="informacioComandaArtcli"
      :callbackOk="crearComanda" :obtenirComandaExistent="obtenirComandaExistent"/>
    <CrearStockSeguretat v-if="visibleCrearStockSeguretat" :carregat="visibleCrearStockSeguretat" @update:carregat="visibleCrearStockSeguretat = $event"
      :articleClient="state.articleClient" :callbackOk="crearStockSeguretat"
      :teclaObrirModal="teclaObrirModal" v-model:teclaObrirModal="teclaObrirModal"/>
    <AjudaStocks v-if="visibleAjudaStocks" :infoArticle="informacioComandaArtcli" :carregat="visibleAjudaStocks"  @update:carregat="visibleAjudaStocks = $event"
      :artint="informacioComandaArtcli.artint" :clicod="informacioComandaArtcli.codiClient" />
    <DetallComandaEspecials v-if="visibleDetallComanda" :carregat="visibleDetallComanda" @update:carregat="visibleDetallComanda = $event"
      :comanda="registreSeleccionat.codi" :client="infoClient" :state="state"
      :aclfab="aclfab"
      @showProgramaArticle="showProgramaArticle"
      @comandaTraspassada="refresh"/>
    <ModalAdjuntsComandes v-if="visibleModalAdjunts" :carregat="visibleModalAdjunts"
      :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"
      @update:carregat="visibleModalAdjunts = $event" :comanda="registreSeleccionat.codi" 
      @update:numAdjunts="updateAdjunts"/>
    <ModalLiniesAnulades v-if="visibleModalAnulades" :carregat="visibleModalAnulades"
      @update:carregat="visibleModalAnulades = $event"
      :articleClient="state.articleClient" />
    <KanbanLiniaComanda v-if="visibleKanbanitzarLinia" :carregat="visibleKanbanitzarLinia" @update:carregat="visibleKanbanitzarLinia = $event;"
      :callbackOk="kanbanitzarLinia" :obtenirComandaExistent="obtenirComandaExistent"/>
    <EditorComentaris v-if="visibleModalNotesClient" :carregat="visibleModalNotesClient" @update:carregat="visibleModalNotesClient = $event;"
      :text="informacioComandaArtcli.notesClient" :callback="updateNotesClient" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
    <EditorComentaris v-if="visibleModalNotesLog" :carregat="visibleModalNotesLog" @update:carregat="visibleModalNotesLog = $event;"
      :text="informacioComandaArtcli.notesLogistica" :callback="updateNotesLogistica" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
    <EditorComentaris v-if="visibleModalNotesMorositat" :carregat="visibleModalNotesMorositat" @update:carregat="visibleModalNotesMorositat = $event;"
      :text="informacioComandaArtcli.notesMorositat" :callback="updateNotesMorositat" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
    <EditorComentaris v-if="visibleModalNotesEmbalatge" :carregat="visibleModalNotesEmbalatge" @update:carregat="visibleModalNotesEmbalatge = $event;"
      :text="informacioComandaArtcli.notesEmbalatge" :callback="updateNotesEmbalatge" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
    <EditorComentaris v-if="visibleModalComentarisInterns" :carregat="visibleModalComentarisInterns" @update:carregat="visibleModalComentarisInterns = $event;"
      :text="registreSeleccionat.comentarisInterns" :callback="updateComentarisInterns" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
    <EditorComentaris v-if="visibleModalComentarisClient" :carregat="visibleModalComentarisClient" @update:carregat="visibleModalComentarisClient = $event;"
      :text="registreSeleccionat.comentarisClient" :callback="updateComentarisClient" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
    <InfoArticleClientByClient v-if="visibleInfoArticleClientByClient" :carregat="visibleInfoArticleClientByClient" @update:carregat="visibleInfoArticleClientByClient = $event;"
      :articleClient="state.articleClient" :fabrica="informacioComandaArtcli.codiFabrica + ' - ' + informacioComandaArtcli.descFabrica"/>
    <DetallOrdreFabricacio v-if="visibleDialogDetallOF" :carregat="visibleDialogDetallOF" @update:carregat="visibleDialogDetallOF = $event;"
      :articleClient="state.articleClient" :artInt="informacioComandaArtcli?.artint" :cliCod="informacioComandaArtcli?.codiClient" :fabrica="informacioComandaArtcli?.codiFabrica + ' - ' + informacioComandaArtcli?.descFabrica"/>
    <ModalHistoricMoviments v-if="visibleHistoricMoviments" v-model:visible="visibleHistoricMoviments"
      :artint="informacioComandaArtcli?.artint" :clicod="informacioComandaArtcli?.codiClient"/>
    <ComentarisInternsClient v-if="visibleModalComentarisInternsClient" :carregat="visibleModalComentarisInternsClient" @update:carregat="visibleModalComentarisInternsClient = $event;"
      :text="comentarisInternClient" :textArticle="comentarisInternArticle" :clicod="informacioComandaArtcli.codiClient" :artcli="informacioComandaArtcli.artint" :callback="updateComentariInternArtCli"/>
    <EnviarJustificantComandaEspecial v-if="visibleEnviarJustificant" :carregat="visibleEnviarJustificant"  
      @update:carregat="visibleEnviarJustificant = $event" 
      @justificantEnviat="justificantEnviat"
      :client="infoClient" :comanda="idComanda" :comandaClient="registreSeleccionat.comandaClient"/>
    <PrevisualitzarJustificantComandaEspecial v-if="visiblePrevisualitzarJustificant" :carregat="visiblePrevisualitzarJustificant"  
      @update:carregat="visiblePrevisualitzarJustificant = $event" 
      @justificantEnviat="justificantEnviat"
      :client="infoClient" :comanda="idComanda" :comandaClient="registreSeleccionat.comandaClient"/>
    <ModalExportarDetallComandesClient v-if="visibleModalExportarDetallComandesClient" :carregat="visibleModalExportarDetallComandesClient" @update:carregat="visibleModalExportarDetallComandesClient = $event;" :client="informacioComandaArtcli.codiClient"/>
    <ModalExportarDetallComandesArticle v-if="visibleModalExportarDetallComandesArticle" :carregat="visibleModalExportarDetallComandesArticle" @update:carregat="visibleModalExportarDetallComandesArticle = $event;" :article="informacioComandaArtcli.artint" :articleFabrica="informacioComandaArtcli.aclfab" :client="informacioComandaArtcli.codiClient" :filtrarClient="filtrarClient"/>
    <ModalAdjuntsClient v-if="visibleModalAdjuntsClient" :carregat="visibleModalAdjuntsClient" @update:carregat="visibleModalAdjuntsClient = $event;" :client="informacioComandaArtcli.codiClient" :nomClient="informacioComandaArtcli.nomClient"/>
    <ModalMissatgesEDIArticleClient v-if="visibleMissatgesEDIArticleClient" :carregat="visibleMissatgesEDIArticleClient" @update:carregat="visibleMissatgesEDIArticleClient = $event;" :cliCod="informacioComandaArtcli?.codiClient" :artInt="informacioComandaArtcli?.artint"/>
    <div class="card">
      <h5 class="card-header">
        <i class="pi pi-arrow-left icona-boto" @click="emit('update:opcio', 'OpcionsComandes')" v-tooltip="$t('App.Tornar')"></i>
        <font-awesome-icon icon="fa-solid fa-gear" style="font-size: 1.25rem" />
        {{ $t('App.Comandes') }}
        <ButtonShortcut v-if="informacioComandaArtcli" @click="showAjudaArticleClient()" 
          style="margin-left: 15px;" icon="fa-solid fa-filter" 
          :literal="$t('Comandes.Filtra comandes')" :shortcut="'[Ctrl+0]'"/>
        <ButtonShortcut v-if="informacioComandaArtcli" @click="visibleAjudaArticles = true" 
          style="margin-left: 35px;" icon="fa-solid fa-shapes" 
          :literal="$t('Comandes.Articles del client')" :shortcut="'[Ctrl+1]'"/>
        <ButtonShortcut v-if="informacioComandaArtcli" @click="visibleAjudaClients = true" 
          style="margin-left: 35px;" icon="fa-solid fa-user-gear" 
          :literal="$t('Comandes.Clients consumeixen article')" :shortcut="'[Ctrl+2]'"/>
        <ButtonShortcut v-if="informacioComandaArtcli" @click="visibleComandesEspecials = true" 
          style="margin-left: 35px;" icon="fa-solid fa-receipt" 
          :literal="$t('Comandes.Comandes del client')" :shortcut="'[Ctrl+3]'"/>
        <ButtonShortcut v-if="informacioComandaArtcli" @click="obtenirUltimsAlbarans()" 
          style="margin-left: 35px;" icon="fa-solid fa-file-invoice" 
          :literal="$t('Comandes.Ultims albarans')" :shortcut="'[Ctrl+5]'"/>
        <ButtonShortcut v-if="informacioComandaArtcli" @click="visibleModalAnulades = true" 
          style="margin-left: 35px;" icon="fa-solid fa-trash-can" 
          :literal="$t('Comandes.Veure anulades')" :shortcut="'[Ctrl+l]'"/>
      </h5>
      <div class="card-body">
        <div v-show="!informacioComandaArtcli" style="width: 100%; text-align: center;">
          <div>
            <font-awesome-icon icon="fa-solid fa-info" style="font-size: 2.5rem;" />
          </div>
          <div style="margin-top: 5px;">
            <span style="font-size: larger; font-weight: 400;">{{ $t('Comandes.Informacio inici') }}</span>
            <div style="margin-top: 5px;">
              <ButtonShortcut @click="showAjudaArticleClient()" :icon="'fa-solid fa-filter'" 
                :literal="$t('Comandes.Filtra comandes')" :shortcut="'[Ctrl+0]'"/>
            </div>
          </div>
        </div>
        <div v-if="informacioComandaArtcli">
          <Panel>
            <template #header>
              <div style="display: flex; align-items: center; height: 20px; gap: 30px;">
                <div class="columnatitol" style="display: flex; flex-direction: column; align-items: flex-start; margin: 0; padding: 0;">
                  <label class="labeltitol" style="font-size: 12px; font-weight: 600; margin: 0; padding: 0; line-height: 1;">
                    {{ $t('Comandes.Articleclient') }}
                    <Button icon="pi pi-ellipsis-h" style="font-size: 5px; height: 10px; width: 20px;" @click="openMenuOpcionsArticleClient"/>
                    <ContextMenu :model="opcionsArticleClient" ref="menuArticleClient" :style="{ minWidth: 'auto', width: 'max-content' }"/> 
                  </label>
                  <span class="texttitol" style="font-size: 22px; font-weight: 600; margin: 0; padding: 0; line-height: 1; display: inline-block;">
                    {{ state.articleClient }}
                  </span>
                </div>
                <div class="columnatitol" style="display: flex; flex-direction: column; justify-content: flex-end;">
                  <font-awesome-icon :icon="teComentaris ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-comments'"
                    :style="{ fontSize: '1.25rem', cursor: 'pointer', color: teComentaris ? 'orange' : 'inherit'}"
                    @click="mostrarComentariInternClient(informacioComandaArtcli?.comentariInternClient,informacioComandaArtcli?.comentariInternArticle)"
                  />
                </div>
                <div class="columnatitol" style="display: flex; flex-direction: column; align-items: flex-start; margin: 0; padding: 0;">
                  <label class="labeltitol" style="font-size: 12px; font-weight: 600; margin: 0; padding: 0; line-height: 1;">
                    {{ $t('Comandes.Referencia') }}
                  </label>
                  <span class="texttitol" v-tooltip="informacioComandaArtcli.referencia" style="font-size: 22px; font-weight: 600; margin: 0; padding: 0; line-height: 1; display: inline-block;">
                    {{ truncate(informacioComandaArtcli.referencia, 25) }}
                  </span>
                </div>
                <div class="columnatitol" style="display: flex; flex-direction: column; align-items: flex-start; margin: 0; padding: 0;">
                  <label class="labeltitol" style="font-size: 12px; font-weight: 600; margin: 0; padding: 0; line-height: 1;">
                    {{ $t('Comandes.Client') }}
                    <Button icon="pi pi-ellipsis-h" style="font-size: 5px; height: 10px; width: 20px;" @click="openMenuOpcionsClient"/>
                    <ContextMenu :model="opcionsClient" ref="menuClient" :style="{ minWidth: 'auto', width: 'max-content' }"/> 
                  </label>
                  <span class="texttitol" v-tooltip="informacioComandaArtcli.nomClient" style="font-size: 22px; font-weight: 600; margin: 0; padding: 0; line-height: 1; display: inline-block;">
                    {{ truncate(informacioComandaArtcli.nomClient, 15) }}
                  </span>
                </div>
                <div style="display: flex; gap: 5px;">
                  <span v-if="informacioComandaArtcli.isClientEDI" class="infoClient web" style="cursor: pointer;" @click="visibleMissatgesEDIArticleClient = true">
                    <font-awesome-icon icon="fa-solid fa-laptop-code" style="font-size: 1rem" />
                    <span style="font-size: 16px; font-weight: 500; margin-left: 3px;">EDI</span>
                  </span>
                  <span v-if="informacioComandaArtcli.isImpagament" class="infoClient impagament">
                    <font-awesome-icon icon="fa-solid fa-solid fa-money-bill-1-wave" style="font-size: 1rem" />
                    <span style="font-size: 16px; font-weight: 500; margin-left: 3px;">{{$t('ModalAjudaArticleClient.Impagament')}}</span>
                  </span>
                  <span v-if="informacioComandaArtcli.isClientProforma" class="infoClient proforma">
                    <font-awesome-icon icon="fa-solid fa-file-invoice" style="font-size: 1rem" />
                    <span style="font-size: 16px; font-weight: 500; margin-left: 3px;">{{$t('Comandes.Client proforma')}}</span>
                  </span>
                  <span v-if="informacioComandaArtcli.isFaMesUnAnyDataUltimaComanda" 
                    v-tooltip="`${$t('Comandes.Comandes 1 any')} ${$d($toDate(informacioComandaArtcli.dataUltimaComanda), 'short')}`"
                    class="infoClient mesunanyultimacomanda">
                    <font-awesome-icon icon="fa-solid fa-solid fa-circle-exclamation" style="font-size: 1rem" />
                    <span style="font-size: 16px; font-weight: 500; margin-left: 3px;">{{$t('Comandes.Abr comandes 1 any')}}</span>
                  </span> 
                </div>
                <ButtonShortcut 
                  v-if="informacioComandaArtcli && isAvuiSeleccionat && permisosStore.tePermis('COMANDES', 'WRITE')" 
                  @click="mostrarCrearComanda" 
                  style="margin-left: 15px; height: 26px;" 
                  icon="fa-solid fa-file-circle-plus"
                  :literal="$t('Comandes.Crear nova comanda')" 
                  :shortcut="'[Ctrl+a]'"/>
                <ButtonShortcut
                  v-if="informacioComandaArtcli"
                  @click="visibleHistoricMoviments = true"
                  style="margin-left: 15px; height: 26px;"
                  icon="fa-solid fa-warehouse"
                  :literal="$t('Comandes.Veure fitxa')"
                  :shortcut="'[Ctrl+9]'"/>
                <ButtonShortcut :literal="$t('Comandes.Recarrega')" @click="refresh()"
                  icon="fa-solid fa-retweet" :shortcut="'[Ctrl+r]'" style="margin-left: 15px; height: 26px;"/>
              </div>
            </template>
            <div style="display: grid; grid-template-columns: 30% 30% 30% auto; grid-template-rows: repeat(4, auto); gap: 5px; width: 100%;
                        margin: -10px -10px -10px -10px">
              <!-- Fila 1 -->
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                <label class="label-detall">{{ $t('Comandes.DenomNt') }}:</label>
                <span v-tooltip="`${informacioComandaArtcli.denominacio} / ${informacioComandaArtcli.nivellTecnic}`">
                  {{ ` ${informacioComandaArtcli.denominacio} / ${informacioComandaArtcli.nivellTecnic}` }}
                </span>
              </div>
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                <label class="label-detall">{{ $t('Comandes.Stock total') }}:</label>
                <span style="margin-left: 2px;" :class="{'stock-satelit': informacioComandaArtcli.isTePesesSatelit}">
                  {{ $n(informacioComandaArtcli.stockTotal) }}
                </span>
                <span v-if="informacioComandaArtcli.isTeStocksNegatius" v-tooltip="$t('Comandes.Magatzems stocks negatius')">
                  <font-awesome-icon icon="fa-solid fa-triangle-exclamation" style="font-size: 1.25rem; color: red;" />
                </span>
                <Button icon="pi pi-eye" @click="visibleAjudaStocks = true"
                  class="p-button-rounded botoveurestock" />
              </div>
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                <label class="label-detall"> {{ `${$t('Comandes.Stock seguretat')}:` }} </label>  
                {{ $n(stockSeguretaTotal) }}
              </div>
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 140px;">
                <Button @click="visibleModalNotesMorositat = true"
                  class="buttonnotes"
                  :class="{'buttonnotesdisabled' : !informacioComandaArtcli.notesMorositat}"
                  icon="pi pi-file-edit"
                  :label="$t('Comandes.Morositat')"/>
              </div>
              <!-- Fila 2 -->
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                <label class="label-detall">{{ $t('Comandes.Fabrica') }}:</label>
                <span v-tooltip="`${informacioComandaArtcli.codiFabrica} - ${informacioComandaArtcli.descFabrica}`">
                  {{ ` ${informacioComandaArtcli.codiFabrica} - ${informacioComandaArtcli.descFabrica}` }}
                </span>
              </div>
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                <label class="label-detall"> {{ `${$t('Comandes.Embalatge')}: ` }} </label>
                <span v-tooltip ="$t('Comandes.Embalatge resultat', [$n(informacioComandaArtcli.unitatsEmbalatge), 
                                                                                  informacioComandaArtcli.numCaixesPalet, 
                                            $n(informacioComandaArtcli.unitatsEmbalatge*informacioComandaArtcli.numCaixesPalet) ])">
                {{ ` ${$n(informacioComandaArtcli.unitatsEmbalatge*informacioComandaArtcli.numCaixesPalet)} = ${$n(informacioComandaArtcli.unitatsEmbalatge)} x ${informacioComandaArtcli.numCaixesPalet}` }}
                </span>
              </div>
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                <label class="label-detall"> {{ `${$t('Comandes.Enviament')}:` }} </label>
                <span v-tooltip="`${$t(`FormaEnviament.${informacioComandaArtcli.formaEnviament}`)} • ${informacioComandaArtcli.incoterm} • ${$destiTransport(informacioComandaArtcli.desti)}`">
                  {{ ` ${$t(`FormaEnviament.${informacioComandaArtcli.formaEnviament}`)} • ${informacioComandaArtcli.incoterm} • ${$destiTransport(informacioComandaArtcli.desti)}` }}
                </span>
              </div>
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 140px;">
                <Button @click="visibleModalNotesEmbalatge = true"
                  class="buttonnotes"
                  :class="{'buttonnotesdisabled' : !informacioComandaArtcli.notesEmbalatge}"
                  icon="pi pi-file-edit"
                  :label="$t('Comandes.Notes embalatge')"/>
              </div>
              <!-- Fila 3 -->
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                <label class="label-detall"> {{ `${labelEmpresa(1)}: ` }} </label>
                <span v-tooltip="`${informacioComandaArtcli.codiEmpresa} - ${informacioComandaArtcli.descEmpresa}`">
                  {{ ` ${informacioComandaArtcli.codiEmpresa} - ${informacioComandaArtcli.descEmpresa}` }}
                </span>
              </div>
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                <label class="label-detall"> {{ `${labelMagatzem(1)}: ` }} </label>  
                <span v-tooltip="`${informacioComandaArtcli.magatzemEntrada} - ${informacioComandaArtcli.magatzemEntradaDesc}`">
                  {{ ` ${informacioComandaArtcli.magatzemEntrada} - ${informacioComandaArtcli.magatzemEntradaDesc}` }}
                </span>
              </div>
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                <label class="label-detall"> {{ `${$t('Comandes.Transportista')}:` }} </label>  
                <span v-tooltip="$transportista(informacioComandaArtcli.codiTransportista)">
                  {{ ` ${$transportista(informacioComandaArtcli.codiTransportista)}` }}
                </span>
              </div>
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 140px;">
                <Button @click="visibleModalNotesLog = true"
                  class="buttonnotes"
                  :class="{'buttonnotesdisabled' : !informacioComandaArtcli.notesLogistica}"
                  icon="pi pi-file-edit"
                  :label="$t('Comandes.Notes logistica')"/>
              </div>
              <!-- Fila 4 -->
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                <span v-if="informacioComandaArtcli.codiEmpresa !== informacioComandaArtcli.codiEmpresaEntrega">
                  <label class="label-detall"> {{ `${labelEmpresa(2)}: ` }} </label>
                  <span v-tooltip="`${informacioComandaArtcli.codiEmpresaEntrega} - ${informacioComandaArtcli.descEmpresaEntrega}`">
                    {{ ` ${informacioComandaArtcli.codiEmpresaEntrega} - ${informacioComandaArtcli.descEmpresaEntrega}` }}
                  </span>
                </span>
              </div>
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                <span v-if="informacioComandaArtcli.magatzemEntrada !== informacioComandaArtcli.magatzemSortida">
                  <label class="label-detall"> {{ `${labelMagatzem(2)}: ` }} </label>  
                  <span v-tooltip="`${informacioComandaArtcli.magatzemSortida} - ${informacioComandaArtcli.magatzemSortidaDesc}`">
                    {{ ` ${informacioComandaArtcli.magatzemSortida} - ${informacioComandaArtcli.magatzemSortidaDesc}` }}
                  </span>
                </span>
              </div>
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                <label class="label-detall"> {{ `${$t('Comandes.Dies transit')}:` }} </label>  
                {{ `${informacioComandaArtcli.diesTransitClient} `}}
                <InformacioDiesTransitClient :diesServei="informacioComandaArtcli.diesSortida" />
              </div>
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 140px;">
                <Button @click="visibleModalNotesClient = true"
                  class="buttonnotes"
                  :class="{'buttonnotesdisabled' : !informacioComandaArtcli.notesClient}"
                  icon="pi pi-file-edit"
                  :label="$t('Comandes.Notes client')"/>
              </div>
            </div>
          </Panel>
          <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)"/>
          <div id="divLiniesComanda" style="margin-top: 15px;">
            <Panel>
              <template #header>
                <div style="display: flex; flex-direction: column; width: -moz-available; row-gap: 8px;">
                  <span class="p-panel-title" style="display: flex; align-items: center; width: -moz-available;">
                    {{ titolResultatsTaula }}
                    <ButtonShortcut @click="visibleAjudaDates = true"
                        style="margin-left: 5px;" icon="fa-solid fa-calendar-days"
                        :literal="$t('Comandes.Canviar dates')" :shortcut="'[Ctrl+4]'"/>
                    <ButtonShortcut @click="expandAll"
                        style="margin-left: 40px;" icon="fa-solid fa-angles-down"
                        :literal="$t('Comandes.Mostrar tots els albarans')"/>
                    <ButtonShortcut @click="collapseAll"
                        style="margin-left: 5px;" icon="fa-solid fa-angles-up"
                        :literal="$t('Comandes.Colapsar tots els albarans')"/>
                    <span style="display: flex; column-gap: 5px; align-items: center; margin-left: 50px;">
                      <Checkbox v-model="ocultarServides" :binary="true" tabindex="-1"/>
                      <label @click="ocultarServides = !ocultarServides" style="cursor: pointer;">
                          {{ $t('Comandes.Ocultar servides') }}
                      </label>
                      <label style="color: grey; font-size: 0.8rem; vertical-align: bottom">[Ctrl + 8]</label>
                    </span>
                    <span style="display: flex; column-gap: 5px; align-items: center; margin-left: 40px;">
                      <Checkbox v-model="mostrarOrdreAscendent" :binary="true" tabindex="-1"/>
                      <label @click="mostrarOrdreAscendent = !mostrarOrdreAscendent"  style="cursor: pointer;">
                        {{ $t('Comandes.Mostrar el programa en ordre ascendent') }}
                      </label>
                    </span>
                    <span style="margin-left: auto;">
                      <ButtonShortcut icon="fa-solid fa-file-excel" :literal="$t('Comandes.Descarregar taula')" @click="exportarTaula(state.articleClient)" />
                    </span>
                  </span>
                  <span v-if="!isAvuiSeleccionat" class="avisNoDataAvui">
                    <i class="pi pi-exclamation-triangle" />
                    <span style="margin-left: 5px;">{{ $t('Comandes.Data foto funcionalitats limitades') }}</span>
                    <a class="enllas" @click="carregarAvui()">{{ $t('Comandes.Carregar data avui') }}</a>
                  </span>
                </div>
              </template>
              <div style="margin: -27px -17px -17px -17px">
                <DataTable v-model:expandedRows="expandedRows" :value="linies" class="p-datatable-sm"
                  :dataKey="codiNumeroFormat"
                  style="margin-top: 10px;"
                  :scrollable="true" scrollHeight="60vh"
                  :resizableColumns="true" columnResizeMode="expand"
                  contextMenu v-model:contextMenuSelection="registreSeleccionat" @rowContextmenu="showContextMenu($event)"
                  showGridlines 
                  v-model:selection="registreSeleccionat" selectionMode="single"
                  @dblclick="window?.getSelection()?.removeAllRanges(); editarLiniaSeleccionada($event)"
                  :rowClass="estilRow"
                  @row-select="selectedIndex = $event.index">
                  <template #empty>
                    <div style="width:100%; text-align: center; padding-top: 30px;">
                        <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Comandes.Cap linia comanda')" />
                    </div>
                  </template>
                  <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
                    <template #body="{data}">
                      <div style="width: 100%;">
                      <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="registreSeleccionat = data; contextMenu.show($event)" />
                      </div>
                    </template>
                  </Column>
                  <Column :header="$t('Comandes.Linia comanda')" :style="{width:'130px'}" style="max-width: 130px;">
                    <template #body="{data}">
                      <span v-tooltip="$empresa(data.empresa)">
                        {{ data.codiNumeroFormat }}
                      </span>
                    </template>
                  </Column>
                  <Column :header="$t('Comandes.Tipus')" :style="{width:'45px'}" style="max-width: 45px; text-align: center;">
                    <template #body="{data}">
                      <div style="width: 100%; text-align: center;">
                        <ColumnaTipusComanda :tipus="data.tipus" :servida="!data.quantitatPendent" />
                      </div>
                    </template>
                  </Column>
                  <Column :header="$t('Comandes.Comanda client')" :style="{width:'250px'}">
                    <template #body="{data}">
                      <div v-if="data.tipus === 'STOCK_SEG_CLIENT'">
                        {{ $t('Comandes. Tipus stock') + ': ' + $t('Comandes.Client') }}
                      </div>
                      <div v-else-if="data.tipus === 'STOCK_SEG_AMES'">
                        {{ $t('Comandes. Tipus stock') + ': ' + $t('Comandes.Ames')}}
                      </div>
                      <div v-else>
                        {{ data.comandaClient }}
                      </div>
                    </template>
                  </Column>
                  <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
                    <template #body="{data}">
                      <div style="width: 100%;">
                        <Button icon="pi pi-paperclip" @click="registreSeleccionat = data; visibleModalAdjunts = true"
                          class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.isTeAdjunts}" />
                      </div>
                    </template>
                  </Column>
                  <Column field="dataSolicitada" :header="$t('Comandes.Data solicitada')" :style="{width:'110px'}" style="max-width: 110px;">
                    <template #body="{data}">
                      <div :class="getDateClass(data.dataSolicitada)">
                        {{ `${$d($toDate(data.dataSolicitada), 'short')}` }}
                      </div>
                    </template>
                  </Column>
                  <Column field="setmana" :style="{width:'30px'}" style="text-align: right; max-width: 30px;" :header="$t('Comandes.Set')">
                    <template #body="{data}">
                      <div style="width: 100%; text-align: right;">
                        {{ data.setmana }}
                      </div>
                    </template>
                  </Column>
                  <Column field="dataPrevistaSortida" :header="$t('Comandes.Data sortida')" :style="{width:'180px'}" style="max-width: 250px;">
                    <template #body="{data}">
                      {{ $d($toDate(data.dataPrevistaSortida), 'short') }}
                      <span v-if="data.dataPrevistaSortidaInterna">
                        {{ '&nbsp;⇐&nbsp; ' + $d($toDate(data.dataPrevistaSortidaInterna), 'short') }}
                      </span>
                    </template>
                  </Column>
                  <Column field="dataPrevistaSortida" :header="$t('Comandes.Data confirmada')" :style="{width:'110px'}" style="max-width: 110px;">
                    <template #body="{data}">
                      <span v-if="data.dataConfirmadaFabrica">
                        {{ $d($toDate(data.dataConfirmadaFabrica), 'short') }}
                      </span>
                    </template>
                  </Column>
                  <Column field="quantitat" :style="{width:'100px'}" style="text-align: right; max-width: 100px;" :header="$t('Comandes.Quantitat')">
                    <template #body="{data}">
                      <div style="width: 100%; text-align: right;">
                        {{ $n(data.quantitat) }}
                      </div>
                    </template>
                  </Column>
                  <Column :header="$t('Comandes.Quantitat servida')" :style="{width:'100px'}" style="text-align: right; max-width: 100px;" >
                    <template #body="{data}">
                      <div style="width: 100%; text-align: right;">
                        <span v-if="data.quantitatServida">
                          <a class="enllas" @click="showNode(data)">{{ $n(data.quantitatServida) }}</a>  
                        </span>
                        <span v-else> 0 </span>
                      </div>
                    </template>
                  </Column>
                  <Column field="quantitatPendent" :header="$t('Comandes.Quantitat pendent')" :style="{width:'100px'}" style="text-align: right; max-width: 100px;">
                    <template #body="{data}">
                      <div style="width: 100%; text-align: right;">
                        {{ $n(data.quantitatPendent) }}
                      </div>
                    </template>
                  </Column>
                  <Column field="quantitatAcumulada" :header="$t('Comandes.Acumulat')" :style="{width:'100px'}" style="text-align: right; max-width: 100px;">
                    <template #body="{data}">
                      <div style="width: 100%; text-align: right;">
                        {{ $n(data.quantitatAcumulada) }}
                      </div>
                    </template>
                  </Column>
                  <Column field="preu" :style="{width:'160px'}" style="text-align: right; max-width: 160px;" :header="$t('Comandes.Preu')">
                    <template #body="{data}">
                      <div style="width: 100%; text-align: right;">
                        <span v-if="data.comandaBlanca" v-tooltip="`CB: ${$n(data.comandaBlanca)}`">
                          <font-awesome-icon icon="fa-solid fa-copyright" style="font-size: 1.10rem" />
                        </span>
                        <span v-if="data.isPreuFixat" v-tooltip="$t('Comandes.Preu fixat')">
                          <font-awesome-icon icon="fa-solid fa-hand" style="font-size: 1.10rem" />
                        </span>
                        {{ `${$n(data.preu.valor, 'decimalLong')} ${data.preu.divisa}` }} 
                      </div>
                    </template>
                  </Column>
                  <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" :header="$t('Comandes.Int')">
                    <template #body="{data}">
                      <div style="width: 100%;">
                        <Button icon="pi pi-comments" @click="registreSeleccionat = data; visibleModalComentarisInterns = true"
                          class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.comentarisInterns}" />
                      </div>
                    </template>
                  </Column>
                  <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" :header="$t('Comandes.Ext')">
                    <template #body="{data}">
                      <div style="width: 100%;">
                        <Button icon="pi pi-megaphone" @click="registreSeleccionat = data; visibleModalComentarisClient = true"
                          class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.comentarisClient}" />
                      </div>
                    </template>
                  </Column>
                  <template #expansion="slotProps">
                    <div style="background-color: #ffffdc; padding: 10px 75px;">
                      <DataTable :value="slotProps.data.albarans" class="p-datatable-sm"
                        style="max-width: 1050px;"
                        showGridlines>
                        <Column field="data" :header="$t('Comandes.Data')" :style="{width:'100px'}" style="max-width: 100px;">
                          <template #body="{data}">
                            <span v-if="data.dataAlbara">{{ $d($toDate(data.dataAlbara), 'short') }}</span>
                          </template>
                        </Column>
                        <Column field="albara" :header="$t('Comandes.Albara')" :style="{width:'300px'}" style="max-width: 300px;">
                          <template #body="{data}">
                            {{ data.albara + (data.albaraEspecial ? ' - ' + data.albaraEspecial : '') }}
                          </template>
                        </Column>
                        <Column field="enviamentAlbara" :header="$t('Comandes.Forma Enviament')" :style="{width:'180px'}" style="max-width: 180px;"/>
                        <Column field="quantitat" :header="$t('Comandes.Quantitat')" :style="{width:'100px'}" style="text-align: right; max-width: 100px;">
                          <template #body="{data}">
                            <span style="padding-right: 4px;">
                              {{ $n(data.quantitat) }}
                            </span>
                          </template>
                        </Column>
                        <Column field="factura" :header="$t('Comandes.Factura')" :style="{width:'100px'}" style="max-width: 100px;"/>
                        <Column field="entregat" :header="$t('Comandes.Entregat')" :style="{width:'180px'}" style="max-width: 210px;">
                          <template #body="{data}">
                            {{ data.entregat ?  $t('App.Si') : $t('App.No')}}
                          </template>
                        </Column>
                      </DataTable>
                    </div>
                  </template>
                </DataTable>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script>
import ComandesService from '@/services/comandes.service';
import AjudaStocks from '@/views/modals/AjudaStocks.vue';
import AjudaDatesComandesEspecials from '@/views/modals/AjudaDatesComandesEspecials.vue';
import HistoricLiniaComanda from '@/views/modals/HistoricLiniaComanda.vue';
import CrearEditarLiniaComanda from '@/views/modals/CrearEditarLiniaComanda.vue';
import ColumnaTipusComanda from '@/components/ColumnaTipusComanda.vue';
import ButtonShortcut from '@/components/ButtonShortcut.vue';
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import AjudaArticleClientByArticle from '@/views/modals/AjudaArticleClientByArticle.vue';
import AjudaArticleClientByClient from '@/views/modals/AjudaArticleClientByClient.vue';
import { carrega, isLoading} from '@/services/loader';
import { nextTick, onMounted, onUnmounted, computed, ref, watch, reactive } from 'vue';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { useI18n } from 'vue-i18n';
import { controlDataTable, scrollCenter, nextIndex } from '@/utils/datetableUtils.js';
import InformacioDiesTransitClient from '@/components/InformacioDiesTransitClient.vue'
import moment from 'moment';
import {assign} from '@/utils/objectUtils.js'
import CrearComanda from '@/views/modals/crearcomanda/CrearComanda.vue';
import CrearStockSeguretat from '@/views/modals/creastockseguretat/CreaStockSeguretat.vue';
import DetallComandaEspecials from '@/views/modals/detallespecials/DetallComandaEspecials.vue';
import KanbanLiniaComanda from '@/views/modals/KanbanLiniaComanda.vue';
import ModalAdjuntsComandes from '@/views/modals/ModalAdjuntsComandes.vue';
import AjudaArticleClient from '@/views/modals/AjudaArticleClient.vue';
import AjudaClientsConsumeixenArticle from '@/views/modals/AjudaArticlesClientConsumeixenArticle.vue';
import AjudaUltimsAlbarans from '@/views/modals/AjudaUltimsAlbarans.vue';
import { useToast } from 'primevue/usetoast';
import ComandesEspecials from '@/views/modals/comandesespecials/ComandesEspecials.vue';
import ModalLiniesAnulades from '@/views/modals/liniesanulades/ModalLiniesAnulades.vue';
import Swal from 'sweetalert2';
import InfoArticleClientByClient from '@/views/modals/InfoArticleClientByClient.vue';
import { ExcelExporter } from '@/utils/ExcelExporter';
import { usePermisosStore } from '@/stores/permisos';
import ComentarisInternsClient from '@/views/modals/ComentarisInternsClient.vue';
import EnviarJustificantComandaEspecial from '@/views/modals/justificant/EnviarJustificantComandaEspecial.vue';
import PrevisualitzarJustificantComandaEspecial from '@/views/modals/justificant/AjudaPrevisualitzarJustificantComandaEspecial.vue';
import ModalExportarDetallComandesClient from '@/views/modals/ModalExportarDetallComandesClient.vue';
import ModalExportarDetallComandesArticle from '@/views/modals/ModalExportarDetallComandesArticle.vue';
import ModalAdjuntsClient from '@/views/modals/ModalAdjuntsClient.vue';
import ModalMissatgesEDIArticleClient from '@/views/modals/ModalMissatgesEDIArticleClient.vue';
import DetallOrdreFabricacio from '@/components/ordresFabricacio/DetallOrdreFabricacio.vue';
import ModalHistoricMoviments from '@/views/modals/ModalHistoricMoviments.vue';
import MagatzemService from '@/services/magatzem.service';
import { saveAs } from 'file-saver';
import albaraService from '@/services/albara.service';

export default {
    // eslint-disable-next-line  
    name: 'ComandesEsp',
    components : {
      AjudaStocks,
      AjudaArticleClientByArticle,
      AjudaArticleClientByClient,
      AjudaDatesComandesEspecials,
      EditorComentaris,
      HistoricLiniaComanda,
      CrearEditarLiniaComanda,
      ColumnaTipusComanda,
      ButtonShortcut,
      InformacioDiesTransitClient,
      CrearComanda,
      CrearStockSeguretat,
      DetallComandaEspecials,
      KanbanLiniaComanda,
      ModalAdjuntsComandes,
      AjudaArticleClient,
      AjudaClientsConsumeixenArticle,
      AjudaUltimsAlbarans,
      ComandesEspecials,
      ModalLiniesAnulades,
      InfoArticleClientByClient,
      ComentarisInternsClient,
      EnviarJustificantComandaEspecial,
      PrevisualitzarJustificantComandaEspecial,
      ModalExportarDetallComandesClient,
      ModalExportarDetallComandesArticle,
      ModalAdjuntsClient,
      ModalMissatgesEDIArticleClient,
      DetallOrdreFabricacio,
      ModalHistoricMoviments,
    },
    props : {
      opcio : String,
      articleClient : String,
    },
    setup ( props, {emit} ) {
      const { t, d } = useI18n();
      const permisosStore = usePermisosStore();
      const toast = useToast();
      const confirmVisible = ref(false);
      const visibleAjudaArticleClientByClient = ref(false);
      const visibleAjudaArticleClientByArticle = ref(false);
      const ultimaAjudaVisibleByClient = ref();
      const visibleAjudaDates = ref(false);
      const visibleAjudaStocks = ref(false);
      const visibleCrearEditarLiniaComanda = ref(false);
      const visibleHistoricLinia = ref(false);
      const visibleCrearComanda = ref(false);
      const visibleCrearStockSeguretat = ref(false);
      const visibleDetallComanda = ref(false);
      const visibleKanbanitzarLinia = ref(false);
      const visibleEditorComentaris = ref(false);
      const visibleModalComentarisInterns = ref(false);
      const visibleModalComentarisClient = ref(false);
      const visibleModalNotesClient = ref(false);
      const visibleModalNotesLog = ref(false);
      const visibleModalNotesEmbalatge = ref(false);
      const visibleModalNotesMorositat = ref(false);
      const visibleModalAdjunts = ref(false);
      const visibleModalAnulades = ref(false);
      const visibleAjudaArticles = ref(false);
      const visibleAjudaClients = ref(false);
      const visibleComandesEspecials = ref(false);
      const visibleUltimsAlbarans = ref(false);
      const visibleInfoArticleClientByClient = ref(false);
      const visibleEnviarJustificant = ref(false);
      const visiblePrevisualitzarJustificant = ref(false);
      const visibleModalExportarDetallComandesClient = ref(false);
      const visibleModalExportarDetallComandesArticle = ref(false);
      const visibleModalAdjuntsClient = ref(false);
      const visibleMissatgesEDIArticleClient = ref(false);
      const visibleDialogDetallOF = ref(false);
      const visibleHistoricMoviments = ref(false);
      const menuClient = ref();
      const menuArticleClient = ref();
      const titolResultatsTaula = ref('');
      const liniaModal = ref();
      const elementLiniesComanda = () => document.getElementById('divLiniesComanda');
      const linies = ref();
      const contextMenu = ref();
      const registreSeleccionat = ref();
      const selectedIndex = ref(-1);
      const expandedRows = ref(new Array());
      const informacioComandaArtcli = ref();
      const comentarisInternClient = ref();
      const comentarisInternArticle = ref();
      const visibleModalComentarisInternsClient = ref(false);
      const teclaObrirModal = ref(null);
      const ultimsAlbarans = ref();
      const teComentaris = computed(() => (
        informacioComandaArtcli.value.comentariInternClient || informacioComandaArtcli.value.comentariInternArticle
      ));
      const state = reactive({
          dataInici : new Date(),
          dataFi : moment().subtract(6, 'months').toDate(),
          articleClient : '',
        });
      const dataInicialSeleccionada = ref();
      const aclfab = computed(() => { return state.articleClient.substring(0,7)});
      // Retorna el total de l'stock de seguretat
      const stockSeguretaTotal = computed(() => {
        if (!linies.value) return 0;
        return linies.value
          .filter(linia => linia.tipus === 'STOCK_SEG_CLIENT' || linia.tipus === 'STOCK_SEG_AMES')
          .reduce((total, linia) => total + (linia.quantitat || 0), 0);
      });
      const mostrarOrdreAscendent = ref(localStorage.getItem('mostrarOrdreAscendentComandes') === 'true');
      const ocultarServides = ref(false);
      const stockSeguretat = ref();
      const idComanda = ref();
      const infoClient = ref();
      const filtrarClient = ref();
  
      onMounted(async () => {
        assign(state, 'comandes');
        document.addEventListener("keydown", keyHandler);
        if (props.articleClient) {
          state.articleClient = props.articleClient;
          state.dataInici = new Date();
          state.dataFi = moment().subtract(6, 'months').toDate();
          refresh();
        } else {
          showAjudaArticleClient();
        }
      });
  
      onUnmounted(() => {
        document.removeEventListener("keydown", keyHandler);
      })
  
      const modalVisible = computed(() => {
        return confirmVisible.value
              || visibleAjudaDates.value
              || visibleAjudaArticleClientByClient.value
              || visibleAjudaArticleClientByArticle.value
              || visibleAjudaStocks.value
              || visibleCrearEditarLiniaComanda.value
              || visibleHistoricLinia.value
              || visibleCrearComanda.value
              || visibleCrearStockSeguretat.value
              || visibleDetallComanda.value
              || visibleKanbanitzarLinia.value
              || visibleModalComentarisInterns.value
              || visibleModalComentarisClient.value
              || visibleModalNotesClient.value
              || visibleModalNotesLog.value
              || visibleModalNotesMorositat.value
              || visibleModalNotesEmbalatge.value
              || visibleModalAdjunts.value
              || visibleModalAnulades.value
              || visibleAjudaArticles.value
              || visibleAjudaClients.value
              || visibleComandesEspecials.value
              || visibleUltimsAlbarans.value
              || visibleInfoArticleClientByClient.value
              || visibleModalComentarisInternsClient.value
              || visibleEnviarJustificant.value
              || visiblePrevisualitzarJustificant.value
              || visibleModalExportarDetallComandesClient.value
              || visibleModalExportarDetallComandesArticle.value
              || visibleModalAdjuntsClient.value
              || visibleDialogDetallOF.value
              || visibleHistoricMoviments.value;
      });
  
      watch(selectedIndex, () => {
        if (selectedIndex.value >= 0) {
          registreSeleccionat.value = linies.value[selectedIndex.value];
          scrollCenter(elementLiniesComanda(), selectedIndex);
        }
      });

      watch(mostrarOrdreAscendent, () => {
        localStorage.setItem('mostrarOrdreAscendentComandes', mostrarOrdreAscendent.value);
        refresh();
      });

      watch(ocultarServides, () => {
        refresh();
      })
  
      const keyHandler = (ev) => {
        // No processem l'event en cas que es produeixi des d'un ContextMenu
        if (isContextMenuKey(ev))  return;
        // Si no hi ha cap modal obert
        if (modalVisible.value) return;

        // No processem l'event en cas que s'estigui mostrant la càrrega
        if (isLoading.value) {
          ev.preventDefault();
          return;
        }

        // Tornar enrere
        if (ev.key=='Escape') {
          actionHandler(ev, () => emit('update:opcio', 'OpcionsComandes'));
        }
        // Accions del grid
        if (!contextMenu.value?.visible)
          controlDataTable(ev, elementLiniesComanda(), selectedIndex, linies);
        // Accions del registre seleccionat
        if (ev.ctrlKey && ev.key=="0") { // Ctrl + 0
          actionHandler(ev, () => showAjudaArticleClient());
        } else if (ev.ctrlKey && ev.key=="1") { // Ctrl + 1
          actionHandler(ev, () => visibleAjudaArticles.value = true);
        } else if (ev.ctrlKey && ev.key=="2") { // Ctrl + 2
          actionHandler(ev, () => visibleAjudaClients.value = true);
        } else if (ev.ctrlKey && ev.key=="3") { // Ctrl + 3
          actionHandler(ev, () => visibleComandesEspecials.value = true);
        } else if (ev.ctrlKey && ev.key=="4") { // Ctrl + 4
          actionHandler(ev, () => visibleAjudaDates.value = true);
        } else if (ev.ctrlKey && ev.key=="5") { // Ctrl + 5
          actionHandler(ev, () => obtenirUltimsAlbarans());
        } else if (ev.ctrlKey && ev.key=="8") { // Ctrl + 8
          actionHandler(ev, () => ocultarServides.value = !ocultarServides.value);
        } else if (ev.ctrlKey && ev.key=="9") { // Ctrl + 9
          actionHandler(ev, () => visibleHistoricMoviments.value = true);
        } else if (ev.ctrlKey && ev.which==190) { // Ctrl + .
          actionHandler(ev, () => isAvuiSeleccionat.value ? canviarFermOrientatiu() : '', 'WRITE');
        } else if (ev.ctrlKey && ev.which==65) { // Ctrl + A
          ev.preventDefault();
          actionHandler(ev, () => isAvuiSeleccionat.value ? mostrarCrearComanda() : '', 'WRITE');
        } else if (ev.ctrlKey && ev.which==68) { // Ctrl + D
          if (registreSeleccionat.value?.isStockSeguretat) {
            actionHandler(ev);
          } else {
            actionHandler(ev, () => visibleDetallComanda.value = true);
          }        
        } else if (ev.ctrlKey && ev.which==69) {
          if(permisosStore.tePermis('COMANDES', 'WRITE')) // Ctrl + E
            actionHandler(ev, () => {visibleModalComentarisClient.value = true;});
        } else if (ev.ctrlKey && ev.which==73) {
          if(permisosStore.tePermis('COMANDES', 'WRITE')) // Ctrl + I
            actionHandler(ev, () => {visibleModalComentarisInterns.value = true;});
        } else if (ev.which == 13 || ev.code === 'Space') {
          if(permisosStore.tePermis('COMANDES', 'WRITE')) // Enter
            editarLiniaSeleccionada(ev);
        } else if (ev.key=='+') { // +
          if (registreSeleccionat.value?.isStockSeguretat) {
            actionHandler(ev);
          } else {
            actionHandler(ev, () => isAvuiSeleccionat.value ? handlerTeclaMes() : '', 'WRITE');
          }
        } else if (ev.ctrlKey && ev.key=='-') { // Ctrl + -
          if (registreSeleccionat.value?.isStockSeguretat) {
            actionHandler(ev);
          } else {
            actionHandler(ev, () => isAvuiSeleccionat.value ? anularLiniaAction() : '', 'WRITE');
          }
        } else if (ev.ctrlKey && ev.keyCode=="72") { // Ctrl + H
          actionHandler(ev, () => visibleHistoricLinia.value = true);
        } else if (ev.ctrlKey && ev.keyCode=="75") { // Ctrl + K
          actionHandler(ev, () => isAvuiSeleccionat.value ? clickKanbanitzarLiniaComanda() : '', 'WRITE');
        } else if (ev.ctrlKey && ev.keyCode=="76") { // Ctrl + L
          actionHandler(ev, () => visibleModalAnulades.value = true, 'WRITE');
        } else if (!ev.ctrlKey && ev.key=='ArrowLeft') {
          actionHandler(ev, () => { updateDates(-1)});
        } else if (ev.ctrlKey && ev.key=='ArrowLeft') {
          actionHandler(ev, () => { updateDates(-10)});
        } else if (!ev.ctrlKey && ev.key=='ArrowRight') {
          actionHandler(ev, () => { updateDates(1)});
        } else if (ev.ctrlKey && ev.key=='ArrowRight') {
          actionHandler(ev, () => { updateDates(10)});
        } else if (ev.ctrlKey && ev.key=="6") { // Ctrl + 6
          actionHandler(ev, () => showNode(registreSeleccionat.value));
        } else if (ev.ctrlKey && ev.keyCode=="83") { // Ctrl + S
          actionHandler(ev, () => mostrarCrearStockSeguretat(), 'STOCKSEGURETAT');
        } else if (ev.key=='r') { // Ctrl + r (Recarregar)
          actionHandler(ev, () => refresh());
        }
      }

      const handlerTeclaMes = () => {
        linies.value.length ? clickAfegirLiniaComanda() : mostrarCrearComanda();
      }

      const potEditarLiniaSeleccionada = () => {
        // Només es pot editar si la data és avui i si es té permís de stock de seguretat en cas que sigui stock de seguretat
        if (!isAvuiSeleccionat.value) return false;
        const esStock = registreSeleccionat?.value?.isStockSeguretat;
        return permisosStore.tePermis('COMANDES', 'STOCKSEGURETAT') || !esStock;
      };

      const editarLiniaSeleccionada = (ev) => {
        // Si no es pot editar la linia seleccionada, no fem res
        if (!potEditarLiniaSeleccionada()) return;
        actionHandler(ev, () => {
          let esStock = registreSeleccionat.value.isStockSeguretat;
            if (esStock) {
              if (ev.code === 'Space') {
                teclaObrirModal.value = 'space';
                mostrarCrearStockSeguretat();
              } else {
                teclaObrirModal.value = 'enter';
                mostrarCrearStockSeguretat();
              }
            } else {
              clickEditarLiniaComanda();
              if (ev.code === 'Space') {
                teclaObrirModal.value = 'space';
                visibleCrearEditarLiniaComanda.value = true;
              } else {
                teclaObrirModal.value = 'enter';
                visibleCrearEditarLiniaComanda.value = true;
              }
            }
        }, 'WRITE');
      };

      const updateDates = (dies) => {
        state.dataInici = moment(state.dataInici).add(dies, 'days').toDate();
        if (moment(state.dataInici).isAfter(moment(), 'day')) {
          state.dataInici = moment().toDate();
        }
        state.dataFi = moment().subtract(6, 'months').toDate();
        refresh();
      }
  
      const actionHandler = (ev, action, permis) => {
        ev.preventDefault();
        if (contextMenu?.value)
          contextMenu.value.visible = false;
        // Comprovació si es té el permís
        if (permis && !permisosStore.tePermis('COMANDES', permis)) 
          return;
        action();
      }
  
      const showContextMenu = (ev) => {
        let selectedOld = selectedIndex.value;
        selectedIndex.value = linies.value.findIndex(l => l.codiNumeroFormat == registreSeleccionat.value.codiNumeroFormat);
        if (selectedOld === selectedIndex.value) {
          registreSeleccionat.value = linies.value[selectedIndex.value];
        }
        contextMenu.value.show(ev.originalEvent);
      }
  
      const showNode = (e) => {
        var index = expandedRows.value.indexOf(e);
        if (index !== -1) {
          expandedRows.value.splice(index, 1);
        } else {
          // Els albarans ja venen dins de la línia (data.albarans), no cal cap crida
          expandedRows.value.push(e);
        }
        registreSeleccionat.value = e;
      }

      const expandAll = () => {
        for (let i in linies.value){
          let linia = linies.value[i];
          // Desplega tota línia que tingui albarans servits (ja venen dins de data.albarans, cap crida)
          if (linia.albarans && linia.albarans.length > 0) {
            var index = expandedRows.value.indexOf(linia);
            if (index == -1) {
              expandedRows.value.push(linia);
            }
          }
        }
      }

      const collapseAll = () => {
        expandedRows.value = [];
      }

      const callbackAjudaArticleClientByClient = async (articleClient) => {
        visibleAjudaArticleClientByClient.value = false;
        visibleAjudaArticleClientByArticle.value = false;
        state.articleClient = articleClient;
        state.dataInici = new Date();
        state.dataFi = moment().subtract(6, 'months').toDate();
        let { info, linies : l } = await carrega(ComandesService.liniesComanda(state.articleClient, state.dataFi, state.dataInici, 
          ocultarServides.value, mostrarOrdreAscendent.value));
        callbackBuscat(info, l);
        // Mostrar avís si el client té impagaments
        if(info.isImpagament){
          mostrarAvisImpagament();
        }
        // Toasts encadenats: EDI primer, proforma després si cal
        mostraToastsClient(info);
        // Mostrar avís si fa més d'un any que no es rep una comanda
        if(info.isFaMesUnAnyDataUltimaComanda){
          mostrarAvisUltimaComanda(info.dataUltimaComanda);
        }
        nextTick(() => {
          if (teComentaris.value) {
            updateComentariInternArtCli();
            visibleModalComentarisInternsClient.value = true;
          }
        });
      }

      const showAjudaArticleClient = () => {
        ultimaAjudaVisibleByClient.value = localStorage.getItem('ComandesEspUltimaAjudaVisibleClient') === null
                                          ? true
                                          : JSON.parse(localStorage.getItem('ComandesEspUltimaAjudaVisibleClient'));
        ultimaAjudaVisibleByClient.value
          ? visibleAjudaArticleClientByClient.value = true
          : visibleAjudaArticleClientByArticle.value = true
      }

      const switchAjuda = () => {
        if (ultimaAjudaVisibleByClient.value) {
          visibleAjudaArticleClientByClient.value = false; 
          visibleAjudaArticleClientByArticle.value = true; 
          ultimaAjudaVisibleByClient.value = false;
        } else {
          visibleAjudaArticleClientByArticle.value = false; 
          visibleAjudaArticleClientByClient.value = true; 
          ultimaAjudaVisibleByClient.value = true;
        }
        localStorage.setItem('ComandesEspUltimaAjudaVisibleClient', ultimaAjudaVisibleByClient.value);
      }
  
      const callbackBuscat = (info, l, codiNumero = '') => {
        dataInicialSeleccionada.value = state.dataInici;
        selectedIndex.value = -1;
        linies.value = [];
        linies.value = l;
        informacioComandaArtcli.value = info;
        titolResultatsTaula.value = `${d(state.dataInici, 'short')} - ${d(state.dataFi, 'short')}`;
        nextTick(() => {
          codiNumero
            ? selectedIndex.value = linies.value.findIndex(l => l.codiNumeroFormat == codiNumero)
            : selectedIndex.value = posicionaPendentServir()
        });
      }
  
      const posicionaPendentServir = () => {
        // Recorregut de la llista al reves per buscar la primera pendent de servir
        var index = -1;
        if (mostrarOrdreAscendent.value) {
          index = linies.value.findIndex(l => l.quantitat > 0 && l.quantitatPendent > 0);
        } else {
          index = linies.value.length - 1 - linies.value.slice().reverse().findIndex(l => l.quantitat > 0 && l.quantitatPendent > 0);
        }
        return index !== -1 ? index : -1;
      }
  
      const refresh = async (codiNumero) => {
        let { info, linies : l } = await carrega(ComandesService.liniesComanda(state.articleClient, state.dataFi, state.dataInici, 
          ocultarServides.value, mostrarOrdreAscendent.value));
        callbackBuscat(info, l, codiNumero);
      }

      const showProgramaArticle = async(articleClient) => {
        state.articleClient = articleClient;
        refresh();
      }

      const carregarAvui = async() => {
        state.dataInici = new Date();
        refresh();
      }

      const showStocks = () => {
        visibleAjudaStocks.value = true;
      }
  
      const clickAfegirLiniaComanda = () => {
        if (registreSeleccionat.value) {
          liniaModal.value = null; 
          visibleCrearEditarLiniaComanda.value = true;
        }      
      }
  
      const clickEditarLiniaComanda = () => {
        if (registreSeleccionat.value) {
          liniaModal.value = registreSeleccionat.value; 
          visibleCrearEditarLiniaComanda.value = true;
        }
      }

      const clickKanbanitzarLiniaComanda = () => {
        if (registreSeleccionat.value) {
          visibleKanbanitzarLinia.value = true;
        }
      }

      const labelEmpresa = (num) => {
        var numAdd = informacioComandaArtcli.value?.codiEmpresa !== informacioComandaArtcli.value?.codiEmpresaEntrega ? num : '';
          return t('Comandes.Emp fact') + ' ' + numAdd;
      }

      const labelMagatzem = (num) => {
        var numAdd = informacioComandaArtcli.value?.magatzemEntrada !== informacioComandaArtcli.value?.magatzemSortida ? num : '';
          return t('Comandes.Magatzem') + ' ' + numAdd;
      }

      const isAvuiSeleccionat = computed(() => {
        return moment(dataInicialSeleccionada.value).isSame(moment(), 'day');
      });

      const mostrarCrearComanda = () => {
        visibleCrearComanda.value = true;
      }

      const mostrarCrearStockSeguretat = () => {
        visibleCrearStockSeguretat.value = true;
      }

      const crearComanda = async(resp) => {
        let request = {
          articleClient: state.articleClient,
          ...resp,
        }
        let codiNumeroCreat = await carrega(ComandesService.crearComanda(request));
        visibleCrearComanda.value = false;
        refresh(codiNumeroCreat);
      }

      const crearStockSeguretat = async(resp) => {
        let request = {
          articleClient: state.articleClient,
          ...resp,
        }
        stockSeguretat.value = await carrega(ComandesService.crearStockSeguretat(request));
        visibleCrearStockSeguretat.value = false;
        refresh(stockSeguretat.value);
      }

      const kanbanitzarLinia = async(resp) => {
        let request = {
          ...resp,
          data : moment(resp.data).format('YYYY-MM-DD'),
        }
        let codiNumeroCreat = await carrega(ComandesService.kanbanitzarLiniaComanda(registreSeleccionat.value.codi, registreSeleccionat.value.numero,
          request, registreSeleccionat.value.versio));
        visibleKanbanitzarLinia.value = false;
        await refresh(codiNumeroCreat);
      }

      const canviarFermOrientatiu = async() => {
        let codiNumeroSeleccionat = registreSeleccionat.value.codiNumeroFormat;
        await carrega(ComandesService.canviarFermOrientatiuLinia(registreSeleccionat.value.codi, registreSeleccionat.value.numero,
          registreSeleccionat.value.versio));
        await refresh(codiNumeroSeleccionat);
      }

      const anularLiniaAction = async() => {
        let comandaNumeroSeleccionada = registreSeleccionat.value.codiNumeroFormat;
        let indexPosicionar = nextIndex(selectedIndex.value, linies.value.length);
        let comandaNumeroSeguent = linies.value[indexPosicionar]?.codiNumeroFormat;
        await carrega(ComandesService.anularLiniaComanda(registreSeleccionat.value.codi, registreSeleccionat.value.numero, registreSeleccionat.value.versio));
        toast.add({severity:'success', summary: t('Comandes.Linia anulada OK', [comandaNumeroSeleccionada]), life: 3000});
        await refresh(comandaNumeroSeguent);
      }

      const updateComentarisInterns = async (text) => {
        await carrega(ComandesService.actualitzarComentarisInterns(registreSeleccionat.value.codi, registreSeleccionat.value.numero, text));
        registreSeleccionat.value.comentarisInterns = text;
      }

      const updateComentarisClient = async (text) => {
        await carrega(ComandesService.actualitzarComentarisClient(registreSeleccionat.value.codi, registreSeleccionat.value.numero, text));
        registreSeleccionat.value.comentarisClient = text;
      }

      const updateNotesClient = async (text) => {
        await carrega(ComandesService.actualitzarNotesClient(informacioComandaArtcli.value.codiClient, text));
        informacioComandaArtcli.value.notesClient = text;
      }

      const updateNotesLogistica = async (text) => {
        await carrega(ComandesService.actualitzarNotesLogistica(informacioComandaArtcli.value.codiClient, text));
        informacioComandaArtcli.value.notesLogistica = text;
      }

      const updateNotesMorositat = async (text) => {
        await carrega(ComandesService.actualitzarNotesMorositat(informacioComandaArtcli.value.codiClient, text));
        informacioComandaArtcli.value.notesMorositat = text;
      }

      const updateNotesEmbalatge = async (text) => {
        await carrega(ComandesService.actualitzarNotesEmbalatge(state.articleClient, text));
        informacioComandaArtcli.value.notesEmbalatge = text;
      }

      const updateComentariInternArtCli = async () => {
        await refresh();
        comentarisInternClient.value = informacioComandaArtcli.value.comentariInternClient;
        comentarisInternArticle.value = informacioComandaArtcli.value.comentariInternArticle;
      }

      const obtenirComandaExistent = async(comandaParam) => {
        return await carrega(ComandesService.obtenirComandaEspecialPercomandaClient(
            informacioComandaArtcli.value.codiClient,
            comandaParam
          ));
      }

      const callbackArticleSeleccionat = async (artcliParam) => {
        state.articleClient = artcliParam;
        state.dataInici = new Date();
        state.dataFi = moment().subtract(6, 'months').toDate();
        visibleAjudaArticles.value = false;
        await updateComentariInternArtCli();
        nextTick(() => {
          if (teComentaris.value) {
            visibleModalComentarisInternsClient.value = true;
          }
        });
      }

      const callbackClientSeleccionat = async (artcliParam) => {
        state.articleClient = artcliParam;
        state.dataInici = new Date();
        state.dataFi = moment().subtract(6, 'months').toDate();
        visibleAjudaClients.value = false;
        await updateComentariInternArtCli();
        nextTick(() => {
          if (teComentaris.value) {
            visibleModalComentarisInternsClient.value = true;
          }
        });
      }

      const mostrarAvisImpagament = () => {
        Swal.fire({
          allowOutsideClick : false,
          didOpen: () => Swal.getConfirmButton().focus(),
          icon: 'warning',
          title: t('App.Atencio'),
          text: t('Comandes.Atencio client impagament')
        });
      }

      const mostrarAvisUltimaComanda = (dataUltimaComanda) => {
        Swal.fire({
          allowOutsideClick: false,
          didOpen: () => Swal.getConfirmButton().focus(),
          icon: 'info',
          title: t('Comandes.Avis mes un any sense comanda'),
          text: t('Comandes.Avis mes un any sense comanda text') + ' ' + d(moment(dataUltimaComanda).toDate(), 'short')
        });
      }

      const mostraToastIfClientProforma = () => {
        const Toast = Swal.mixin({
          toast: true,
          position: "top",
          showConfirmButton: false,
          width: 400,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        return Toast.fire({
          icon: "warning",
          iconColor: "#000000",
          color: "#000000",
          title: t('Comandes.Atencio client proforma'),
          background: "#ffc107"
        });
      }

      const mostraToastIfClientEDI = () => {
        const Toast = Swal.mixin({
          toast: true,
          position: "top",
          showConfirmButton: false,
          width: 400,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        return Toast.fire({
          icon: "warning",
          iconColor : "#000000",
          color : "#000000",
          title: t('Comandes.Atencio client EDI'),
          background: "#9ef394"
        });
      }

      const mostraToastsClient = async (info) => {
        if (info.isClientEDI) {
          await mostraToastIfClientEDI();
        }
        if (info.isClientProforma) {
          await mostraToastIfClientProforma();
        }
      }

      const mostrarComentariInternClient = async (textCli, textArt) => {
        visibleModalComentarisInternsClient.value = true;
        comentarisInternClient.value = textCli;
        comentarisInternArticle.value = textArt;
      }



      const callbackBuscaDates = async (dataInici, dataFi) => {
        state.dataInici = dataInici;
        state.dataFi = dataFi;
        refresh();
        visibleAjudaDates.value = false;
      }

      const updateAdjunts = (numAdjunts) => {
        linies.value.forEach(lin => {
          if (lin.codi === registreSeleccionat.value.codi) {
            lin.isTeAdjunts = numAdjunts > 0;
          }
        });
      }
  
      const getDateClass = (date) => {
        return moment(date).diff(moment(), 'months') >= 6 ? 'data-sis-mesos' : '';
      }

      const estilRow = (data) => {
        return [{ estilRow: true, liniaservida: data.servida, stockseguretat: data.isStockSeguretat }];
      };

      const menuModel = computed(() => {
        let result = [];
        // L'edició de la línia només es mostra si la data és avui
        if (isAvuiSeleccionat.value) {
          const isStockseguretat = registreSeleccionat?.value?.isStockSeguretat;
          // Es comprova el permís de stock de seguretat només en cas que la línia sigui de stock de seguretat, 
          // en cas contrari es comprova el permís de edició normal
          const tePermisEdicio = isStockseguretat 
                                  ? permisosStore.tePermis('COMANDES', 'STOCKSEGURETAT') 
                                  : permisosStore.tePermis('COMANDES', 'WRITE');
          // Si es pot editar la línia, es mostra l'opció d'edició, que en cas de ser stock de seguretat mostrarà el modal de stock de seguretat i
          // en cas contrari mostrarà el modal d'edició normal
          if (tePermisEdicio) {
            result.push({
              label: () => `${t('Comandes.Edita linia')} [Enter]`,
              class: 'p-button-text',
              icon: 'pi pi-pencil',
              command: isStockseguretat 
                        ? () => mostrarCrearStockSeguretat()
                        : () => clickEditarLiniaComanda()
            });
          }
        }
        // L'històric de línia es mostra sempre
        if (!registreSeleccionat?.value?.isStockSeguretat)
          result.push({label: ()=>  `${t('Comandes.Detall comanda')} [Ctrl+d]`, class:'p-button-text', icon: 'pi pi-credit-card', command: () => veureDetallComanda()});
        result.push({label: ()=>  `${t('Comandes.Historic linia')} [Ctrl+h]`, class:'p-button-text', icon: 'pi pi-history', command: () => visibleHistoricLinia.value = true});
        // Es mostren opcions de justificant si la comanda es ferm o orientatiu
        if(permisosStore.tePermis('COMANDES', 'WRITE') && (registreSeleccionat?.value?.tipus === 'FERM' || registreSeleccionat?.value?.tipus === 'ORIENTATIU')) {
          // Enviar justificant de recepció
          result.push({label: ()=>  `${t('Comandes.Enviar justificant')}`, class:'p-button-text', icon: 'pi pi-envelope', command: () => enviarJustificant(registreSeleccionat.value)});
          // Previsualitzar justificant de recepció
          result.push({label: ()=>  `${t('Comandes.Previsualitzar justificant')}`, class:'p-button-text', icon: 'pi pi-file-pdf', command: () => previsualitzarJustificant(registreSeleccionat.value)});
        }
        if(permisosStore.tePermis('COMANDES', 'WRITE')){
          result.push({label: ()=>  `${t('Comandes.Edita comentari intern')} [Ctrl+i]`, class:'p-button-text', icon: 'pi pi-comments', command: () => visibleModalComentarisInterns.value = true });
          result.push({label: ()=>  `${t('Comandes.Edita comentari client')} [Ctrl+e]`, class:'p-button-text', icon: 'pi pi-megaphone', command: () => visibleModalComentarisClient.value = true });
        }
        if (permisosStore.tePermis('COMANDES', 'WRITE') && isAvuiSeleccionat.value && !registreSeleccionat?.value?.isStockSeguretat) {
          result.push({label: ()=>  `${t('Comandes.Canviar ferm/orientatiu')} [Ctrl+.]`, class:'p-button-text', icon: 'pi pi-arrows-h',
            command: () => canviarFermOrientatiu()});
          result.push({label: ()=>  `${t('Comandes.Nova linia', [registreSeleccionat.value.comandaClient])} [+]`, class:'p-button-text', icon: 'pi pi-plus',
            command: () => clickAfegirLiniaComanda()});
            if (registreSeleccionat.value?.quantitatPendent > 0) {
              result.push({label: ()=>  `${t('Comandes.Canvi numero comanda linia')} [Ctrl+k]`, class:'p-button-text', icon: 'pi pi-file-export',
                command: () => clickKanbanitzarLiniaComanda() });
              result.push({label: ()=>  `${t('Comandes.Anular linia')} [Ctrl+-]`, class:'p-button-text', icon: 'pi pi-times-circle',
                command: () => anularLiniaAction() });
            }
        }
        result.push({label: ()=>  `${t('Comandes.Veure albarans')} [Ctrl+6]`, class:'p-button-text', icon: 'pi pi-file', command: () => showNode(registreSeleccionat.value),
          disabled: ()=> registreSeleccionat.value?.quantitatServida == 0, visible: ()=> !(registreSeleccionat.value.quantitatServida == 0)});
        return result;
      });

      const opcionsClient = ref([
        { label: t('Comandes.Exportar detall comandes client'), icon: 'pi pi-file-excel', command: () => visibleModalExportarDetallComandesClient.value = true },
        { label: t('ModalAdjuntsClient.Titol'), icon: 'pi pi-paperclip', command: () => visibleModalAdjuntsClient.value = true },
      ]);

      const descarregaTrasabilitatArticleClient = async () => {
        const resp = await carrega(MagatzemService.reportTrasabilitat(informacioComandaArtcli.value.artint, informacioComandaArtcli.value.codiClient));
        saveAs(new Blob([resp]), `${t('ModalAjudaArticleClient.Trasabilitat') + state.articleClient}.xls`);
      };
      const descarregaLocalitzacioArticleClient = async () => {
        const resp = await carrega(MagatzemService.reportLocalitzacio(informacioComandaArtcli.value.artint, informacioComandaArtcli.value.codiClient));
        saveAs(new Blob([resp]), `${t('ModalAjudaArticleClient.Localitzacio') + state.articleClient}.xls`);
      };

      const opcionsArticleClient = computed(() => {
        const result = [
          { label: t('Comandes.Info general client'), icon: 'pi pi-info-circle', command: () => visibleInfoArticleClientByClient.value = true },
          { label: t('ModalAjudaArticleClient.Trasabilitat'), icon: 'pi pi-list', command: async () => { await descarregaTrasabilitatArticleClient(); } },
          { label: t('ModalAjudaArticleClient.Localitzacio'), icon: 'pi pi-map-marker', command: async () => { await descarregaLocalitzacioArticleClient(); } },
          { label: t('ModalAjudaArticleClient.Detall OF'), icon: 'pi pi-eye', command: () => { visibleDialogDetallOF.value = true; } },
          { label: t('Comandes.Exportar detall comandes articleClient'), icon: 'pi pi-file-excel', command: () => { filtrarClient.value = true; visibleModalExportarDetallComandesArticle.value = true; } },
          { label: t('Comandes.Exportar detall comandes article'), icon: 'pi pi-file-excel', command: () => { filtrarClient.value = false; visibleModalExportarDetallComandesArticle.value = true; } },
          { label: t('ModalMissatgesEDI.Titol'), icon: 'pi pi-file-pdf', command: () => visibleMissatgesEDIArticleClient.value = true },
        ];
        // L'opció de crear stock de seguretat només es mostra si la data és avui i es té el permís
        if (isAvuiSeleccionat.value && permisosStore.tePermis('COMANDES', 'STOCKSEGURETAT')) {
          result.push({ label: t('Comandes.Stock seguretat'), icon: 'pi pi-box', command: () => mostrarCrearStockSeguretat() });
        }
        return result;
      });

      const openMenuOpcionsClient = (event) => {
        menuClient.value.show(event);
      };

      const openMenuOpcionsArticleClient = (event) => {
        menuArticleClient.value.show(event);
      };

      const exportarTaula = (artCli) =>{
        const configuracioExcel = {
          dades: linies.value,
          columnes: [
          { titol: t('Comandes.Linia comanda'), valor: linia => linia.codiNumeroFormat, width: 15 },
          { titol: t('Comandes.Tipus'), valor: linia => linia.tipus ?? '', width: 10 },
          { titol: t('Comandes.Comanda client'), valor: linia => linia.comandaClient ?? '', width: 15 },
          { titol: t('Comandes.Int'), valor: linia => linia.comentarisInterns ? 'X' : '', width: 5 },
          { titol: t('Comandes.Ext'), valor: linia => linia.comentarisClient ? 'X' : '', width: 5 },
          { titol: t('Comandes.Data solicitada'), valor: linia => linia.dataSolicitada ? d(new Date(linia.dataSolicitada), 'short') : '', width: 15 },
          { titol: t('Comandes.Set'), valor: linia => linia.setmana ?? '', width: 5 },
          { titol: t('Comandes.Data sortida'), valor: linia => linia.dataPrevistaSortida 
          ? (linia.dataPrevistaSortidaInterna // es mostra la data interna quan ve definida, si no es mostra la de sortida normal
            ? d(new Date(linia.dataPrevistaSortida), 'short') + '⇐' + d(new Date(linia.dataPrevistaSortidaInterna), 'short') 
            : d(new Date(linia.dataPrevistaSortida), 'short')) 
          : '', width: 22 },
          { titol: t('Comandes.Data confirmada'), valor: linia => linia.dataConfirmadaFabrica ? d(new Date(linia.dataConfirmadaFabrica), 'short') : '', width: 12 },
          { titol: t('Comandes.Quantitat'), valor: linia => linia.quantitat ?? 0, format: 'numeric', decimals: 0, width: 10 },
          { titol: t('Comandes.Quantitat servida'), valor: linia => linia.quantitatServida ?? 0, format: 'numeric', decimals: 0, width: 15 },
          { titol: t('Comandes.Quantitat pendent'), valor: linia => linia.quantitatPendent ?? 0, format: 'numeric', decimals: 0, width: 15 },
          { titol: t('Comandes.Acumulat'), valor: linia => linia.quantitatAcumulada ?? 0, format: 'numeric', decimals: 1, width: 10 },
          { titol: t('Comandes.Preu'), valor: linia => linia.preu?.valor ?? 0, format: 'numeric', decimals: 2, width: 10 },
          { titol: t('Tarifes.filtres.divisa'), valor: linia => linia.preu?.divisa ?? '', width: 10 }]
        };

        ExcelExporter.export({
          filename:  artCli + '_' + titolResultatsTaula.value + '.xlsx',
          configuracioExcel
        });
      };

      const veureDetallComanda = async () => {
        infoClient.value = await(carrega(ComandesService.obtenirClient(informacioComandaArtcli.value.codiClient)));
        visibleDetallComanda.value = true;
      }

      const enviarJustificant = async (liniaSeleccionada) => {
        infoClient.value = await(carrega(ComandesService.obtenirClient(informacioComandaArtcli.value.codiClient)));
        idComanda.value = liniaSeleccionada.codi;
        visibleEnviarJustificant.value = true;
      }

      const previsualitzarJustificant = async (liniaSeleccionada) => {
        infoClient.value = await(carrega(ComandesService.obtenirClient(informacioComandaArtcli.value.codiClient)));
        idComanda.value = liniaSeleccionada.codi;
        visiblePrevisualitzarJustificant.value = true;
      }

      const truncate = (str, max = 20) => {
        if (!str) return '';
        return str.length > max ? str.slice(0, max) + '…' : str;
      };

      const obtenirUltimsAlbarans = async (nouUltimAlbara) => {
        await nextTick(); // 🔥 importante
        
        let params = new URLSearchParams();
        
        params.append('codiAlbaraFacturaReferenciaTransit', nouUltimAlbara || '');
        params.append('acumulatSegonsClient', 0);
        let resultat = await carrega(albaraService.obtenirUltimsAlbarans(informacioComandaArtcli.value.codiClient, informacioComandaArtcli.value.artint, params));
        ultimsAlbarans.value = resultat;

        visibleUltimsAlbarans.value = true;
      }


      return {
        props,
        emit,
        permisosStore,
        titolResultatsTaula,
        linies,
        liniaModal,
        registreSeleccionat,
        selectedIndex,
        expandedRows,
        showNode,
        expandAll,
        collapseAll,
        contextMenu,
        showContextMenu,
        menuModel,
        informacioComandaArtcli,
        clickEditarLiniaComanda,
        visibleAjudaDates,
        callbackBuscat,
        refresh,
        showProgramaArticle,
        carregarAvui,
        confirmVisible,
        visibleEditorComentaris,
        visibleAjudaArticleClientByArticle,
        visibleAjudaArticleClientByClient,
        visibleAjudaStocks,
        visibleCrearEditarLiniaComanda,
        visibleHistoricLinia,
        visibleModalComentarisClient,
        visibleModalComentarisInterns,
        visibleModalNotesClient,
        visibleModalNotesLog,
        visibleModalNotesMorositat,
        visibleModalNotesEmbalatge,
        visibleCrearComanda,
        visibleCrearStockSeguretat,
        visibleDetallComanda,
        visibleKanbanitzarLinia,
        visibleModalAdjunts,
        visibleModalAnulades,
        visibleAjudaArticles,
        visibleAjudaClients,
        visibleComandesEspecials,
        visibleUltimsAlbarans,
        visibleInfoArticleClientByClient,
        ultimaAjudaVisibleByClient,
        visibleEnviarJustificant,
        visiblePrevisualitzarJustificant,
        visibleModalExportarDetallComandesClient,
        visibleModalExportarDetallComandesArticle,
        visibleModalAdjuntsClient,
        visibleMissatgesEDIArticleClient,
        visibleDialogDetallOF,
        visibleHistoricMoviments,
        callbackAjudaArticleClientByClient,
        updateAdjunts,
        mostrarCrearComanda,
        showAjudaArticleClient,
        switchAjuda,
        showStocks,
        obtenirComandaExistent,
        crearComanda,
        kanbanitzarLinia,
        updateComentarisClient,
        updateComentarisInterns,
        updateNotesClient,
        updateNotesLogistica,
        updateNotesMorositat,
        updateNotesEmbalatge,
        callbackArticleSeleccionat,
        callbackClientSeleccionat,
        callbackBuscaDates,
        state,
        aclfab,
        stockSeguretaTotal,
        isAvuiSeleccionat,
        labelEmpresa,
        labelMagatzem,
        getDateClass,
        estilRow,
        mostrarOrdreAscendent,
        ocultarServides,
        exportarTaula,
        crearStockSeguretat,
        mostrarCrearStockSeguretat,
        stockSeguretat,
        visibleModalComentarisInternsClient,
        comentarisInternClient,
        mostrarComentariInternClient,
        updateComentariInternArtCli,
        comentarisInternArticle,
        truncate,
        teComentaris,
        teclaObrirModal,
        editarLiniaSeleccionada,
        enviarJustificant,
        infoClient,
        idComanda,
        veureDetallComanda,
        previsualitzarJustificant,
        opcionsClient,
        opcionsArticleClient,
        openMenuOpcionsClient,
        openMenuOpcionsArticleClient,
        menuClient,
        menuArticleClient,
        filtrarClient,
        obtenirUltimsAlbarans,
        ultimsAlbarans,
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

    ::v-deep(.estilRow .buttoicondisabled) {
      background-color: rgb(102, 102, 102);
      border-color: rgb(102, 102, 102);
    }

    .botoveurestock {
      height: 1.5rem !important;
      width: 1.5rem !important;
      margin-left: 3px;
    }

    .buttonnotes {
      font-size: 0.875rem;
      height: 24px !important;
      width: 100%;
      text-align: left !important;
    }

    .buttonnotesdisabled {
      background-color: rgb(102, 102, 102);
      border-color: rgb(102, 102, 102);
    }

    ::v-deep(.p-highlight) {
      background-color: #b6ddfa !important;
    }

    ::v-deep(.liniaservida) {
      background-color:#ebf7f7 !important;
    }

    ::v-deep(.p-highlight.liniaservida) {
      background-color: #c0e2e4!important;
    }

    ::v-deep(.stockseguretat) {
      background-color:#ffd093 !important;
    }

    ::v-deep(.p-highlight.stockseguretat) {
      background-color: rgb(247, 174, 80)!important;
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

    .label-sub { 
      cursor: pointer;
      text-decoration: underline;
    }

    .icona-boto {
      margin-right: 15px;
      display: inline-block;
      border-radius: 5px;
      box-shadow: 0 0 2px #888;
      padding: 0.5em 0.6em;
      font-size:  0.8rem;
      cursor: pointer;
    }

    .avisNoDataAvui {
      margin-left: 25px;
      border: 1px solid #ffb515;
      background-color: #f5c55e;
      padding: 4px;
      border-radius: 5px;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .enllas {
      cursor: pointer;
    }

    .data-sis-mesos {
      background-color: #E1B3F0;
      border: 2px solid #9C79F7;
      border-radius: 8px;
    }

    .stock-satelit {
      background-color: #E1B3F0;
      border: 2px solid #9C79F7;
      border-radius: 8px;
      padding: 0px 2px;
    }

    .columnatitol {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 0;
    }

    .labeltitol {
      font-size: 12px;
      font-weight: 600;
      margin: 0;
      padding: 0;
      line-height: 1;
    }

    .texttitol{
      font-size: 22px;
      font-weight: 600;
      margin: 0;
      padding: 0;
      line-height: 1;
      display: inline-block;
    }

    .infoClient {
      border-radius: 8px;
      background-color: #9ef394;
      padding: 2px 5px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .web {
      background-color: #9ef394;
    }

    .impagament {
      background-color: red;
      color: white;
    }

    .mesunanyultimacomanda {
      background-color: rgb(255, 145, 0);
      color: black;
    }

    .proforma {
      background-color: #ffc107;
      color: black;
    }

  </style>